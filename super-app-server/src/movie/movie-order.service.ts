import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieOrderItemType,
  MovieOrderStatus,
  SeatHoldStatus,
  VoucherDiscountType,
  VoucherStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldService } from './seat-hold.service';
import { CreateMovieOrderDto, ValidateMovieVoucherDto } from './dto/movie-phase3.dto';

@Injectable()
export class MovieOrderService {
  private readonly logger = new Logger(MovieOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seatHoldService: SeatHoldService,
  ) {}

  async getMovies() {
    return this.prisma.movie.findMany({
      where: { isActive: true },
      orderBy: [{ isShowing: 'desc' }, { rating: 'desc' }],
    });
  }

  async getMovieById(idOrSlug: string) {
    if (!idOrSlug || typeof idOrSlug !== 'string' || idOrSlug.trim() === '' || idOrSlug.length > 255) {
      throw new BadRequestException('Mã phim không hợp lệ');
    }

    const movie = await this.prisma.movie.findFirst({
      where: {
        isActive: true,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }, { externalCode: idOrSlug }],
      },
      include: {
        showtimes: {
          where: { isActive: true },
          include: {
            cinema: true,
            auditorium: true,
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Không tìm thấy bộ phim');
    }

    return movie;
  }

  async getCinemas(brand?: CinemaBrand, city?: string) {
    if (brand && !Object.values(CinemaBrand).includes(brand as CinemaBrand)) {
      throw new BadRequestException('Thương hiệu rạp không hợp lệ');
    }
    if (city && city.length > 100) {
      throw new BadRequestException('Tên thành phố vượt quá độ dài cho phép');
    }

    const where: any = { isActive: true };
    if (brand) where.brand = brand;
    if (city) where.city = city;

    return this.prisma.cinema.findMany({
      where,
      include: {
        integration: {
          select: {
            brand: true,
            providerName: true,
            holdTtlSeconds: true,
            supportsCancel: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getShowtimes(params: { movieId?: string; cinemaId?: string; date?: string }) {
    if (params.movieId && params.movieId.length > 255) {
      throw new BadRequestException('Mã phim không hợp lệ');
    }
    if (params.cinemaId && params.cinemaId.length > 255) {
      throw new BadRequestException('Mã rạp không hợp lệ');
    }
    if (params.date && params.date.length > 30) {
      throw new BadRequestException('Định dạng ngày chiếu không hợp lệ');
    }

    const where: any = { isActive: true };
    if (params.movieId) where.movieId = params.movieId;
    if (params.cinemaId) where.cinemaId = params.cinemaId;

    if (params.date && params.date.trim() !== '') {
      const dateStr = params.date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        throw new BadRequestException('Ngày chiếu phải theo định dạng YYYY-MM-DD');
      }
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      if (isNaN(startOfDay.getTime())) {
        throw new BadRequestException('Ngày chiếu không hợp lệ');
      }
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.showtime.findMany({
      where,
      include: {
        movie: true,
        cinema: true,
        auditorium: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getShowtimeSeats(showtimeId: string) {
    if (!showtimeId || typeof showtimeId !== 'string' || showtimeId.trim() === '' || showtimeId.length > 255) {
      throw new BadRequestException('Mã suất chiếu không hợp lệ');
    }

    await this.seatHoldService.releaseExpiredHolds();

    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: true,
        cinema: true,
        auditorium: true,
        showtimeSeats: {
          include: {
            seat: true,
          },
          orderBy: [{ seatCode: 'asc' }],
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('Không tìm thấy suất chiếu');
    }

    return showtime;
  }


  async getVouchers(cinemaId?: string) {
    let brand: CinemaBrand | undefined;
    if (cinemaId) {
      const cinema = await this.prisma.cinema.findUnique({ where: { id: cinemaId } });
      brand = cinema?.brand;
    }

    const now = new Date();
    return this.prisma.voucher.findMany({
      where: {
        status: VoucherStatus.ACTIVE,
        validFrom: { lte: now },
        validUntil: { gte: now },
        ...(brand
          ? {
              OR: [{ cinemaBrand: brand }, { cinemaBrand: null }],
            }
          : {}),
      },
      orderBy: { discountValue: 'desc' },
    });
  }

  async validateVoucher(userId: string, dto: ValidateMovieVoucherDto) {
    const normalizedCode = dto.voucherCode.trim().toUpperCase();
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });

    if (!voucher) {
      throw new BadRequestException(`Mã giảm giá "${normalizedCode}" không tồn tại`);
    }

    const now = new Date();
    if (
      voucher.status !== VoucherStatus.ACTIVE ||
      voucher.validFrom > now ||
      voucher.validUntil < now
    ) {
      throw new BadRequestException(
        `Mã giảm giá "${normalizedCode}" đã hết hạn hoặc không còn hiệu lực`,
      );
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException(`Mã giảm giá "${normalizedCode}" đã hết lượt sử dụng`);
    }

    let seatsSubtotal = 0;
    let combosSubtotal = 0;

    if (dto.showtimeId) {
      const showtime = await this.prisma.showtime.findUnique({
        where: { id: dto.showtimeId },
        include: { cinema: true },
      });

      if (!showtime) {
        throw new NotFoundException('Không tìm thấy suất chiếu');
      }

      if (voucher.cinemaBrand && voucher.cinemaBrand !== showtime.cinema.brand) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" chỉ áp dụng cho hệ thống rạp ${voucher.cinemaBrand}`,
        );
      }

      if (voucher.cinemaId && voucher.cinemaId !== showtime.cinemaId) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho cụm rạp này`,
        );
      }

      if (voucher.movieId && voucher.movieId !== showtime.movieId) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho bộ phim này`,
        );
      }

      if (voucher.showtimeId && voucher.showtimeId !== showtime.id) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho suất chiếu này`,
        );
      }

      if (dto.seatIds && dto.seatIds.length > 0) {
        const showtimeSeats = await this.prisma.showtimeSeat.findMany({
          where: {
            showtimeId: showtime.id,
            OR: [{ seatId: { in: dto.seatIds } }, { id: { in: dto.seatIds } }],
          },
        });
        seatsSubtotal = showtimeSeats.reduce((sum, s) => sum + Number(s.price), 0);
      }

      if (dto.combos && dto.combos.length > 0) {
        const comboIds = dto.combos.map((c) => c.comboId);
        const combos = await this.prisma.combo.findMany({
          where: { id: { in: comboIds }, isActive: true },
        });
        for (const reqCombo of dto.combos) {
          const found = combos.find((c) => c.id === reqCombo.comboId);
          if (found && reqCombo.quantity > 0) {
            combosSubtotal += Number(found.price) * reqCombo.quantity;
          }
        }
      }
    }

    const subtotal =
      seatsSubtotal + combosSubtotal > 0
        ? seatsSubtotal + combosSubtotal
        : Number(dto.subtotal || 0);

    const minOrderAmount = Number(voucher.minOrderAmount || 0);
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu phải đạt ${minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã "${normalizedCode}"`,
      );
    }

    const userUsageCount = await this.prisma.voucherUsage.count({
      where: {
        voucherId: voucher.id,
        userId,
      },
    });

    if (userUsageCount >= voucher.perUserLimit) {
      throw new BadRequestException(
        `Bạn đã sử dụng hết lượt cho phép (${voucher.perUserLimit} lần) của mã "${normalizedCode}"`,
      );
    }

    const discountValue = Number(voucher.discountValue);
    let discountAmount = 0;
    if (voucher.discountType === VoucherDiscountType.FIXED_AMOUNT) {
      discountAmount = Math.min(subtotal, discountValue);
    } else {
      const rawPct = Math.floor((subtotal * discountValue) / 100);
      const maxDiscount =
        voucher.maxDiscountAmount !== null ? Number(voucher.maxDiscountAmount) : rawPct;
      discountAmount = Math.min(subtotal, Math.min(rawPct, maxDiscount));
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
      valid: true,
      voucherId: voucher.id,
      voucherCode: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue,
      seatsSubtotal,
      combosSubtotal,
      subtotal,
      discountAmount,
      finalTotal,
    };
  }
  async getCombos(cinemaId?: string) {
    let brand: CinemaBrand | undefined;
    if (cinemaId) {
      const cinema = await this.prisma.cinema.findUnique({ where: { id: cinemaId } });
      brand = cinema?.brand;
    }

    return this.prisma.combo.findMany({
      where: {
        isActive: true,
        ...(cinemaId
          ? {
              OR: [
                { cinemaId },
                { cinemaId: null, brand: brand ?? undefined },
                { cinemaId: null, brand: null },
              ],
            }
          : {}),
      },
      orderBy: { price: 'asc' },
    });
  }
  /**
   * Tạo MovieOrder với cơ chế Server-Side Pricing (Tuyệt đối không tin giá từ Client gửi lên).
   * Công thức chuẩn:
   *   Seat price + Combo price = Subtotal
   *   Subtotal - Voucher discount = Total
   */
  async createMovieOrder(userId: string, dto: CreateMovieOrderDto) {
    if (!userId) {
      throw new ForbiddenException('Người dùng chưa xác thực');
    }

    if (
      !dto ||
      !dto.showtimeId ||
      typeof dto.showtimeId !== 'string' ||
      dto.showtimeId.length > 255 ||
      (dto.customerName && dto.customerName.length > 200) ||
      (dto.customerPhone && dto.customerPhone.length > 30) ||
      (dto.customerEmail && dto.customerEmail.length > 200) ||
      (dto.voucherCode && dto.voucherCode.length > 100) ||
      (dto.idempotencyKey && dto.idempotencyKey.length > 255)
    ) {
      throw new BadRequestException('Dữ liệu đầu vào không hợp lệ hoặc vượt quá độ dài cho phép');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // 1. KIỂM TRA IDEMPOTENCY KEY
    if (dto.idempotencyKey && dto.idempotencyKey.trim() !== '') {
      const existingOrder = await this.prisma.movieOrder.findUnique({
        where: { idempotencyKey: dto.idempotencyKey.trim() },
        include: {
          items: true,
          booking: true,
          movie: true,
          cinema: true,
          showtime: true,
        },
      });

      if (existingOrder) {
        if (existingOrder.userId !== userId) {
          throw new ForbiddenException('Khóa idempotencyKey thuộc về người dùng khác');
        }
        return existingOrder;
      }
    }

    const requestedSeats = Array.from(
      new Set((dto.seatIds || []).map((s) => String(s).trim()).filter(Boolean)),
    );
    if (requestedSeats.length === 0 || requestedSeats.length > 20) {
      throw new BadRequestException('Phải chọn từ 1 đến 20 ghế để tạo đơn đặt vé');
    }

    // 2. KIỂM TRA SUẤT CHIẾU (SHOWTIME) & RẠP (CINEMA)
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: dto.showtimeId },
      include: {
        movie: true,
        cinema: true,
        auditorium: true,
      },
    });

    if (!showtime || !showtime.isActive || !showtime.cinema.isActive) {
      throw new NotFoundException('Suất chiếu hoặc cụm rạp không hợp lệ');
    }

    // 3. KIỂM TRA GHẾ & SEAT HOLD CỦA USER
    const now = new Date();
    const showtimeSeats = await this.prisma.showtimeSeat.findMany({
      where: {
        showtimeId: showtime.id,
        OR: [
          { seatId: { in: requestedSeats } },
          { id: { in: requestedSeats } },
          { seatCode: { in: requestedSeats } },
        ],
      },
      include: {
        seat: true,
      },
    });

    if (showtimeSeats.length !== requestedSeats.length) {
      throw new BadRequestException('Một hoặc nhiều ghế không thuộc suất chiếu này');
    }

    const resolvedSeatIds = showtimeSeats.map((ss) => ss.seatId);

    const activeHolds = await this.prisma.seatHold.findMany({
      where: {
        showtimeId: showtime.id,
        seatId: { in: resolvedSeatIds },
        status: SeatHoldStatus.HELD,
      },
    });

    if (activeHolds.length !== resolvedSeatIds.length) {
      throw new BadRequestException('Ghế chưa được giữ chỗ hoặc đã hết hạn giữ chỗ');
    }

    let minHoldExpiresAt: Date = activeHolds[0].expiresAt;
    for (const hold of activeHolds) {
      if (hold.userId !== userId) {
        throw new ForbiddenException('Không được phép sử dụng SeatHold của người dùng khác');
      }
      if (hold.expiresAt <= now) {
        throw new BadRequestException('Thời gian giữ ghế đã hết hạn, vui lòng chọn lại ghế');
      }
      if (hold.movieOrderId) {
        throw new ConflictException('Ghế đang giữ đã được gắn với một đơn hàng khác');
      }
      if (hold.expiresAt < minHoldExpiresAt) {
        minHoldExpiresAt = hold.expiresAt;
      }
    }

    // 4. TÍNH GIÁ GHẾ TỪ DATABASE (SERVER-SIDE PRICING)
    let seatsSubtotal = 0;
    const seatItemPayloads = showtimeSeats.map((ss) => {
      const unitPrice = Number(ss.price);
      seatsSubtotal += unitPrice;
      return {
        itemType: MovieOrderItemType.SEAT,
        seatId: ss.seatId,
        showtimeSeatId: ss.id,
        comboId: null as string | null,
        nameSnapshot: `Ghế ${ss.seatCode} (${ss.seatType})`,
        codeSnapshot: ss.seatCode,
        unitPrice,
        quantity: 1,
        totalPrice: unitPrice,
      };
    });

    // 5. KIỂM TRA & TÍNH GIÁ COMBO TỪ DATABASE (SERVER-SIDE PRICING)
    const comboQuantityMap = new Map<string, number>();
    if (Array.isArray(dto.comboIds)) {
      for (const cid of dto.comboIds) {
        if (cid && cid.trim()) {
          const key = cid.trim();
          comboQuantityMap.set(key, (comboQuantityMap.get(key) || 0) + 1);
        }
      }
    }
    if (Array.isArray(dto.combos)) {
      for (const item of dto.combos) {
        if (!item.comboId || item.quantity < 1) {
          throw new BadRequestException('Thông tin số lượng combo không hợp lệ');
        }
        const key = item.comboId.trim();
        comboQuantityMap.set(key, (comboQuantityMap.get(key) || 0) + item.quantity);
      }
    }

    let combosSubtotal = 0;
    const comboItemPayloads: Array<{
      itemType: MovieOrderItemType;
      seatId: string | null;
      showtimeSeatId: string | null;
      comboId: string;
      nameSnapshot: string;
      codeSnapshot: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    if (comboQuantityMap.size > 0) {
      const requestedComboKeys = Array.from(comboQuantityMap.keys());
      const combosFromDb = await this.prisma.combo.findMany({
        where: {
          OR: [{ id: { in: requestedComboKeys } }, { code: { in: requestedComboKeys } }],
        },
      });

      if (combosFromDb.length !== requestedComboKeys.length) {
        throw new NotFoundException('Một hoặc nhiều combo không tồn tại');
      }

      for (const combo of combosFromDb) {
        const qty =
          comboQuantityMap.get(combo.id) ?? comboQuantityMap.get(combo.code) ?? 1;

        if (!combo.isActive) {
          throw new BadRequestException(`Combo "${combo.name}" hiện đã ngừng bán`);
        }

        // Kiểm tra ràng buộc rạp / thương hiệu rạp (Không cho combo Beta dùng ở CGV/Lotte/Galaxy)
        if (combo.cinemaId && combo.cinemaId !== showtime.cinemaId) {
          throw new BadRequestException(
            `Combo "${combo.name}" không áp dụng tại rạp ${showtime.cinema.name}`,
          );
        }

        if (combo.brand && combo.brand !== showtime.cinema.brand) {
          throw new BadRequestException(
            `Combo "${combo.name}" thuộc thương hiệu ${combo.brand} không áp dụng cho rạp ${showtime.cinema.brand}`,
          );
        }

        if (combo.stockQuantity !== null && combo.stockQuantity < qty) {
          throw new BadRequestException(`Combo "${combo.name}" không đủ số lượng tồn kho`);
        }

        const unitPrice = Number(combo.price);
        const totalPrice = unitPrice * qty;
        combosSubtotal += totalPrice;

        comboItemPayloads.push({
          itemType: MovieOrderItemType.COMBO,
          seatId: null,
          showtimeSeatId: null,
          comboId: combo.id,
          nameSnapshot: combo.name,
          codeSnapshot: combo.code,
          unitPrice,
          quantity: qty,
          totalPrice,
        });
      }
    }

    const subtotal = seatsSubtotal + combosSubtotal;

    // 6. KIỂM TRA & TÍNH KHUYẾN MÃI VOUCHER (SERVER-SIDE PRICING)
    let appliedVoucher: any = null;
    let discountAmount = 0;

    if (dto.voucherCode && dto.voucherCode.trim() !== '') {
      const normalizedCode = dto.voucherCode.trim().toUpperCase();
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: normalizedCode },
      });

      if (!voucher) {
        throw new NotFoundException(`Mã giảm giá "${normalizedCode}" không tồn tại`);
      }

      if (voucher.status !== VoucherStatus.ACTIVE) {
        throw new BadRequestException(`Mã giảm giá "${normalizedCode}" không còn hoạt động`);
      }

      if (now < voucher.validFrom || now > voucher.validUntil) {
        throw new BadRequestException(`Mã giảm giá "${normalizedCode}" đã hết hạn hoặc chưa tới ngày áp dụng`);
      }

      if (voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestException(`Mã giảm giá "${normalizedCode}" đã hết lượt sử dụng`);
      }

      if (voucher.cinemaBrand && voucher.cinemaBrand !== showtime.cinema.brand) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" chỉ áp dụng cho hệ thống rạp ${voucher.cinemaBrand}`,
        );
      }

      if (voucher.cinemaId && voucher.cinemaId !== showtime.cinemaId) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho cụm rạp này`,
        );
      }

      if (voucher.movieId && voucher.movieId !== showtime.movieId) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho bộ phim này`,
        );
      }

      if (voucher.showtimeId && voucher.showtimeId !== showtime.id) {
        throw new BadRequestException(
          `Mã giảm giá "${normalizedCode}" không áp dụng cho suất chiếu này`,
        );
      }

      const minOrderAmount = Number(voucher.minOrderAmount || 0);
      if (subtotal < minOrderAmount) {
        throw new BadRequestException(
          `Đơn hàng tối thiểu phải đạt ${minOrderAmount}đ để áp dụng mã "${normalizedCode}"`,
        );
      }

      const userUsageCount = await this.prisma.voucherUsage.count({
        where: {
          voucherId: voucher.id,
          userId,
        },
      });

      if (userUsageCount >= voucher.perUserLimit) {
        throw new BadRequestException(
          `Bạn đã sử dụng hết lượt cho phép (${voucher.perUserLimit} lần) của mã "${normalizedCode}"`,
        );
      }

      const discountValue = Number(voucher.discountValue);
      if (voucher.discountType === VoucherDiscountType.FIXED_AMOUNT) {
        discountAmount = Math.min(subtotal, discountValue);
      } else {
        const rawPct = Math.floor((subtotal * discountValue) / 100);
        const maxDiscount =
          voucher.maxDiscountAmount !== null ? Number(voucher.maxDiscountAmount) : rawPct;
        discountAmount = Math.min(subtotal, Math.min(rawPct, maxDiscount));
      }

      appliedVoucher = voucher;
    }

    const serviceFee = 0;
    const totalAmount = Math.max(0, subtotal + serviceFee - discountAmount);
    const idempotencyKey =
      dto.idempotencyKey?.trim() ||
      `MVO_IDEM_${userId}_${showtime.id}_${resolvedSeatIds.sort().join('_')}_${Date.now()}`;

    // 7. ATOMIC TRANSACTION: TẠO MOVIE ORDER + ITEMS + MOVIE BOOKING + VOUCHER USAGE
    return this.prisma.$transaction(async (tx) => {
      // Khóa dòng SeatHold (FOR UPDATE) để chặn race condition / double-tap tạo trùng đơn
      const holdIds = activeHolds.map((h) => h.id);
      const lockedHolds = await tx.$queryRawUnsafe<
        Array<{
          id: string;
          userId: string;
          status: string;
          movieOrderId: string | null;
          expiresAt: Date;
        }>
      >(
        `SELECT "id", "userId", "status"::text as "status", "movieOrderId", "expiresAt"
         FROM "SeatHold"
         WHERE "id" = ANY($1::text[])
         FOR UPDATE`,
        holdIds,
      );

      if (lockedHolds.length !== activeHolds.length) {
        throw new ConflictException('Trạng thái giữ ghế đã thay đổi hoặc hết hạn');
      }

      const txNow = new Date();
      for (const lh of lockedHolds) {
        if (lh.userId !== userId) {
          throw new ForbiddenException('Không được phép sử dụng SeatHold của người dùng khác');
        }
        if (lh.status !== SeatHoldStatus.HELD || new Date(lh.expiresAt) <= txNow) {
          throw new ConflictException('Trạng thái giữ ghế đã thay đổi hoặc hết hạn');
        }
        if (lh.movieOrderId) {
          throw new ConflictException('Ghế đang giữ đã được gắn với một đơn hàng khác');
        }
      }

      if (appliedVoucher) {
        await tx.$queryRawUnsafe(
          `SELECT "id" FROM "Voucher" WHERE "id" = $1 FOR UPDATE`,
          appliedVoucher.id,
        );

        const currentUserUsages = await tx.voucherUsage.count({
          where: { voucherId: appliedVoucher.id, userId },
        });
        if (currentUserUsages >= appliedVoucher.perUserLimit) {
          throw new BadRequestException('Bạn đã sử dụng mã giảm giá này');
        }

        const updatedVoucher = await tx.voucher.updateMany({
          where: {
            id: appliedVoucher.id,
            status: VoucherStatus.ACTIVE,
            usedCount: { lt: appliedVoucher.usageLimit },
          },
          data: {
            usedCount: { increment: 1 },
          },
        });

        if (updatedVoucher.count === 0) {
          throw new BadRequestException('Mã giảm giá vừa hết lượt sử dụng');
        }
      }

      const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
      const orderCode = `MVO${Date.now().toString().slice(-6)}${suffix}`;
      const bookingCode = `MVB${Date.now().toString().slice(-6)}${suffix}`;

      const createdOrder = await tx.movieOrder.create({
        data: {
          orderCode,
          userId,
          movieId: showtime.movieId,
          cinemaId: showtime.cinemaId,
          showtimeId: showtime.id,
          voucherId: appliedVoucher?.id || null,
          voucherCode: appliedVoucher?.code || null,
          customerName: dto.customerName?.trim() || user.fullName,
          customerPhone: dto.customerPhone?.trim() || user.phone,
          customerEmail: dto.customerEmail?.trim() || user.email || null,
          seatsSubtotal,
          combosSubtotal,
          serviceFee,
          discountAmount,
          totalAmount,
          status: MovieOrderStatus.PENDING,
          idempotencyKey,
          expiresAt: minHoldExpiresAt,
          items: {
            create: [...seatItemPayloads, ...comboItemPayloads],
          },
          booking: {
            create: {
              bookingCode,
              cinemaId: showtime.cinemaId,
              showtimeId: showtime.id,
              adapterBrand: showtime.cinema.brand,
              status: MovieBookingStatus.PENDING,
              expiresAt: minHoldExpiresAt,
            },
          },
        },
        include: {
          items: true,
          booking: true,
          movie: true,
          cinema: true,
          showtime: true,
        },
      });

      await tx.seatHold.updateMany({
        where: {
          id: { in: activeHolds.map((h) => h.id) },
          status: SeatHoldStatus.HELD,
        },
        data: {
          movieOrderId: createdOrder.id,
        },
      });

      if (appliedVoucher) {
        await tx.voucherUsage.create({
          data: {
            voucherId: appliedVoucher.id,
            userId,
            movieOrderId: createdOrder.id,
            discountAmount,
          },
        });
      }

      return createdOrder;
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.movieOrder.findMany({
      where: { userId },
      include: {
        items: true,
        movie: true,
        cinema: true,
        showtime: true,
        booking: {
          include: {
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderIdOrCode: string) {
    const order = await this.prisma.movieOrder.findFirst({
      where: {
        OR: [{ id: orderIdOrCode }, { orderCode: orderIdOrCode }],
      },
      include: {
        items: true,
        seatHolds: true,
        movie: true,
        cinema: true,
        showtime: {
          include: {
            auditorium: true,
          },
        },
        booking: {
          include: {
            tickets: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé xem phim');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập đơn đặt vé của người khác');
    }

    return order;
  }

  async getUserTickets(userId: string) {
    return this.prisma.movieTicket.findMany({
      where: {
        booking: {
          movieOrder: {
            userId,
          },
        },
      },
      include: {
        movie: true,
        cinema: true,
        showtime: true,
        booking: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getTicketById(userId: string, ticketIdOrCode: string) {
    const ticket = await this.prisma.movieTicket.findFirst({
      where: {
        OR: [
          { id: ticketIdOrCode },
          { ticketCode: ticketIdOrCode },
          { barcode: ticketIdOrCode },
        ],
      },
      include: {
        movie: true,
        cinema: true,
        showtime: true,
        booking: {
          include: {
            movieOrder: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé xem phim');
    }

    if (ticket.booking.movieOrder.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem vé của người khác');
    }

    return ticket;
  }
}