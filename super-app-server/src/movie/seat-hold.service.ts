import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  MovieBookingStatus,
  MovieOrderStatus,
  PaymentStatus,
  SeatHoldStatus,
  ShowtimeSeatStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { HoldSeatsDto, ReleaseSeatsDto } from './dto/movie-phase3.dto';

interface LockedShowtimeSeatRow {
  id: string;
  showtimeId: string;
  seatId: string;
  seatCode: string;
  price: any;
  status: ShowtimeSeatStatus;
  heldByUserId: string | null;
  activeHoldId: string | null;
  holdExpiresAt: Date | null;
}

@Injectable()
export class SeatHoldService {
  private readonly logger = new Logger(SeatHoldService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Đọc cấu hình TTL giữ ghế từ biến môi trường SEAT_HOLD_TTL_SECONDS (mặc định 600 giây = 10 phút).
   * Mobile tuyệt đối không tự quyết định thời gian hết hạn.
   */
  getHoldTtlSeconds(integrationHoldTtl?: number | null): number {
    const envVal =
      this.configService.get<string | number>('SEAT_HOLD_TTL_SECONDS') ??
      process.env.SEAT_HOLD_TTL_SECONDS;
    if (envVal !== undefined && envVal !== null && String(envVal).trim() !== '') {
      const parsed = Number(envVal);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    if (integrationHoldTtl && integrationHoldTtl > 0) {
      return integrationHoldTtl;
    }
    return 600;
  }

  /**
   * Giữ ghế có bảo vệ Concurrency cấp Database (PostgreSQL FOR UPDATE Row Lock + Partial Unique Index).
   * Đảm bảo nếu 100 request đồng thời cùng giữ 1 ghế của cùng 1 suất chiếu:
   * -> Đúng 1 request thành công (HELD), 99 request bị từ chối (ConflictException).
   */
  async holdSeats(userId: string, dto: HoldSeatsDto) {
    if (!userId) {
      throw new ForbiddenException('Người dùng chưa xác thực');
    }

    const requestedInputs = Array.from(
      new Set((dto.seatIds || []).map((s) => s.trim()).filter(Boolean)),
    );
    if (requestedInputs.length === 0) {
      throw new BadRequestException('Phải chọn ít nhất 1 ghế để giữ chỗ');
    }

    const showtime = await this.prisma.showtime.findUnique({
      where: { id: dto.showtimeId },
      include: {
        cinema: {
          include: {
            integration: true,
          },
        },
      },
    });

    if (!showtime || !showtime.isActive) {
      throw new NotFoundException('Suất chiếu không tồn tại hoặc đã ngừng phục vụ');
    }

    const ttlSeconds = this.getHoldTtlSeconds(showtime.cinema?.integration?.holdTtlSeconds);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const now = new Date();
          const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

          // 1. Khóa dòng (Row-level lock FOR UPDATE) trên ShowtimeSeat theo thứ tự seatId cố định để chống Deadlock & Race Condition
          const lockedSeats = await tx.$queryRaw<LockedShowtimeSeatRow[]>`
            SELECT
              id,
              "showtimeId",
              "seatId",
              "seatCode",
              price,
              status,
              "heldByUserId",
              "activeHoldId",
              "holdExpiresAt"
            FROM "ShowtimeSeat"
            WHERE "showtimeId" = ${dto.showtimeId}
              AND (
                "seatId" = ANY(${requestedInputs}::text[])
                OR id = ANY(${requestedInputs}::text[])
                OR "seatCode" = ANY(${requestedInputs}::text[])
              )
            ORDER BY "seatId" ASC
            FOR UPDATE
          `;

          if (lockedSeats.length !== requestedInputs.length) {
            throw new NotFoundException('Một hoặc nhiều ghế không tồn tại trong suất chiếu này');
          }

          const resolvedSeatIds = lockedSeats.map((s) => s.seatId);

          // 2. Giải phóng ngay lập tức các bản ghi SeatHold đã quá hạn (lazy expiry inside lock) của các ghế đang xét
          const expiredHolds = await tx.seatHold.findMany({
            where: {
              showtimeId: dto.showtimeId,
              seatId: { in: resolvedSeatIds },
              status: SeatHoldStatus.HELD,
              expiresAt: { lte: now },
            },
          });

          if (expiredHolds.length > 0) {
            const expiredHoldIds = expiredHolds.map((h) => h.id);
            const expiredSeatIds = expiredHolds.map((h) => h.seatId);

            await tx.seatHold.updateMany({
              where: {
                id: { in: expiredHoldIds },
                status: SeatHoldStatus.HELD,
              },
              data: {
                status: SeatHoldStatus.RELEASED,
                releasedAt: now,
              },
            });

            await tx.showtimeSeat.updateMany({
              where: {
                showtimeId: dto.showtimeId,
                seatId: { in: expiredSeatIds },
                status: ShowtimeSeatStatus.HELD,
              },
              data: {
                status: ShowtimeSeatStatus.AVAILABLE,
                heldByUserId: null,
                activeHoldId: null,
                holdExpiresAt: null,
              },
            });

            for (const seat of lockedSeats) {
              if (expiredSeatIds.includes(seat.seatId) && seat.status === ShowtimeSeatStatus.HELD) {
                seat.status = ShowtimeSeatStatus.AVAILABLE;
                seat.heldByUserId = null;
                seat.activeHoldId = null;
                seat.holdExpiresAt = null;
              }
            }
          }

          // 3. Kiểm tra còn bất kỳ bản ghi SeatHold HELD còn hạn nào trên các ghế này không
          const activeHolds = await tx.seatHold.findMany({
            where: {
              showtimeId: dto.showtimeId,
              seatId: { in: resolvedSeatIds },
              status: SeatHoldStatus.HELD,
              expiresAt: { gt: now },
            },
          });

          if (activeHolds.length > 0) {
            throw new ConflictException(
              'Một hoặc nhiều ghế đang được giữ bởi giao dịch khác',
            );
          }

          // 4. Kiểm tra trạng thái ShowtimeSeat
          for (const seat of lockedSeats) {
            if (
              seat.status === ShowtimeSeatStatus.HELD &&
              seat.holdExpiresAt &&
              seat.holdExpiresAt <= now
            ) {
              // Hết hạn trên ShowtimeSeat -> cho phép thu hồi
              continue;
            }
            if (seat.status !== ShowtimeSeatStatus.AVAILABLE) {
              throw new ConflictException(
                `Ghế ${seat.seatCode} hiện không khả dụng (Trạng thái: ${seat.status})`,
              );
            }
          }

          // 5. Tạo bản ghi SeatHold (Được bảo vệ thêm bởi Partial Unique Index SeatHold_showtimeId_seatId_active_held_key)
          const createdHolds: any[] = [];
          for (const seat of lockedSeats) {
            const holdCode = `HOLD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
            const hold = await tx.seatHold.create({
              data: {
                holdCode,
                showtimeId: dto.showtimeId,
                seatId: seat.seatId,
                userId,
                status: SeatHoldStatus.HELD,
                expiresAt,
              },
            });

            await tx.showtimeSeat.update({
              where: { id: seat.id },
              data: {
                status: ShowtimeSeatStatus.HELD,
                heldByUserId: userId,
                activeHoldId: hold.id,
                holdExpiresAt: expiresAt,
                version: { increment: 1 },
              },
            });

            createdHolds.push({
              holdId: hold.id,
              holdCode: hold.holdCode,
              showtimeId: hold.showtimeId,
              seatId: hold.seatId,
              seatCode: seat.seatCode,
              userId: hold.userId,
              status: hold.status,
              price: Number(seat.price),
              expiresAt: hold.expiresAt,
              createdAt: hold.createdAt,
            });
          }

          return {
            message: 'Giữ ghế thành công',
            showtimeId: dto.showtimeId,
            userId,
            ttlSeconds,
            expiresAt,
            holds: createdHolds,
          };
        },
        {
          maxWait: 25000,
          timeout: 25000,
        },
      );
    } catch (error: any) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // Bắt lỗi Unique Constraint từ PostgreSQL Partial Index (SeatHold_showtimeId_seatId_active_held_key)
      if (
        error?.code === 'P2002' ||
        error?.code === '23505' ||
        String(error?.message || '').includes('SeatHold_showtimeId_seatId_active_held_key') ||
        String(error?.message || '').includes('Unique constraint failed')
      ) {
        throw new ConflictException('Ghế vừa được người dùng khác giữ chỗ');
      }

      throw error;
    }
  }

  /**
   * Giải phóng ghế theo yêu cầu chủ động của User (ví dụ: thoát màn hình hoặc đổi ghế).
   * TUYỆT ĐỐI KHÔNG giải phóng ghế đã CONVERTED.
   */
  async releaseHolds(userId: string, dto: ReleaseSeatsDto) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const whereClause: any = {
        showtimeId: dto.showtimeId,
        userId,
        status: SeatHoldStatus.HELD,
      };

      if (dto.holdIds && dto.holdIds.length > 0) {
        whereClause.id = { in: dto.holdIds };
      } else if (dto.seatIds && dto.seatIds.length > 0) {
        whereClause.seatId = { in: dto.seatIds };
      }

      const holdsToRelease = await tx.seatHold.findMany({
        where: whereClause,
      });

      if (holdsToRelease.length === 0) {
        return {
          releasedCount: 0,
          releasedSeatIds: [],
        };
      }

      const holdIds = holdsToRelease.map((h) => h.id);
      const seatIds = holdsToRelease.map((h) => h.seatId);

      // Chỉ cập nhật các hold đang ở trạng thái HELD (không động vào CONVERTED)
      const updated = await tx.seatHold.updateMany({
        where: {
          id: { in: holdIds },
          status: SeatHoldStatus.HELD,
        },
        data: {
          status: SeatHoldStatus.RELEASED,
          releasedAt: now,
        },
      });

      await tx.showtimeSeat.updateMany({
        where: {
          showtimeId: dto.showtimeId,
          seatId: { in: seatIds },
          status: ShowtimeSeatStatus.HELD,
          heldByUserId: userId,
        },
        data: {
          status: ShowtimeSeatStatus.AVAILABLE,
          heldByUserId: null,
          activeHoldId: null,
          holdExpiresAt: null,
          version: { increment: 1 },
        },
      });

      return {
        releasedCount: updated.count,
        releasedSeatIds: seatIds,
      };
    });
  }

  /**
   * CRON JOB: SeatHoldExpiryJob
   * Tự động quét các SeatHold có status = HELD và expiresAt < now để chuyển sang RELEASED,
   * đồng thời hoàn trả trạng thái ShowtimeSeat = AVAILABLE và hết hạn các MovieOrder / MovieBooking quá hạn.
   * An toàn tuyệt đối khi nhiều worker chạy song song và KHÔNG bao giờ release một hold đã CONVERTED.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async releaseExpiredHolds() {
    const now = new Date();

    const expiredHolds = await this.prisma.seatHold.findMany({
      where: {
        status: SeatHoldStatus.HELD,
        expiresAt: { lt: now },
      },
    });

    let releasedCount = 0;

    for (const hold of expiredHolds) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Conditional atomic update: chỉ chuyển sang RELEASED nếu hiện tại vẫn đang là HELD
          const res = await tx.seatHold.updateMany({
            where: {
              id: hold.id,
              status: SeatHoldStatus.HELD,
              expiresAt: { lt: now },
            },
            data: {
              status: SeatHoldStatus.RELEASED,
              releasedAt: now,
            },
          });

          if (res.count === 0) {
            // Đã được worker khác xử lý hoặc đã chuyển sang CONVERTED
            return;
          }

          await tx.showtimeSeat.updateMany({
            where: {
              showtimeId: hold.showtimeId,
              seatId: hold.seatId,
              status: ShowtimeSeatStatus.HELD,
              OR: [{ activeHoldId: hold.id }, { holdExpiresAt: { lt: now } }],
            },
            data: {
              status: ShowtimeSeatStatus.AVAILABLE,
              heldByUserId: null,
              activeHoldId: null,
              holdExpiresAt: null,
              version: { increment: 1 },
            },
          });

          releasedCount += 1;
        });
      } catch (err) {
        this.logger.error(`[SeatHoldExpiryJob] Error releasing hold ${hold.id}:`, err);
      }
    }

    // Đồng bộ hết hạn các MovieOrder đang chờ thanh toán mà đã quá hạn expiresAt
    const expiredOrders = await this.prisma.movieOrder.findMany({
      where: {
        status: { in: [MovieOrderStatus.PENDING, MovieOrderStatus.PAYMENT_PENDING] },
        expiresAt: { lt: now },
      },
      include: {
        booking: true,
        payments: true,
      },
    });

    let expiredOrdersCount = 0;
    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const freshOrder = await tx.movieOrder.findUnique({
            where: { id: order.id },
          });

          if (
            !freshOrder ||
            (freshOrder.status !== MovieOrderStatus.PENDING &&
              freshOrder.status !== MovieOrderStatus.PAYMENT_PENDING)
          ) {
            return;
          }

          await tx.movieOrder.update({
            where: { id: order.id },
            data: { status: MovieOrderStatus.EXPIRED },
          });

          if (order.booking) {
            await tx.movieBooking.updateMany({
              where: {
                id: order.booking.id,
                status: {
                  in: [MovieBookingStatus.PENDING, MovieBookingStatus.PAYMENT_PENDING],
                },
              },
              data: { status: MovieBookingStatus.EXPIRED },
            });
          }

          for (const payment of order.payments) {
            if (payment.status === PaymentStatus.PENDING) {
              await tx.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.PAYMENT_EXPIRED },
              });
            }
          }

          // Giải phóng các SeatHold còn HELD gắn với order này
          await tx.seatHold.updateMany({
            where: {
              movieOrderId: order.id,
              status: SeatHoldStatus.HELD,
            },
            data: {
              status: SeatHoldStatus.RELEASED,
              releasedAt: now,
            },
          });

          expiredOrdersCount += 1;
        });
      } catch (err) {
        this.logger.error(`[SeatHoldExpiryJob] Error expiring movie order ${order.orderCode}:`, err);
      }
    }

    return {
      releasedCount,
      expiredOrdersCount,
    };
  }
}