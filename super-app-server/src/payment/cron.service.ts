import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { SeatHoldService } from '../movie/seat-hold.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly seatHoldService?: SeatHoldService,
  ) {}

  /**
   * TASK TỰ ĐỘNG GIẢI PHÓNG ĐƠN HẾT HẠN GIỮ CHỖ (HOLD TTL EXPIRATION CRON JOB)
   * Chạy định kỳ mỗi phút 1 lần cho cả Travel Booking và Movie SeatHold/MovieOrder
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredHoldBookings() {
    const now = new Date();

    let movieExpiredInfo = { releasedCount: 0, expiredOrdersCount: 0 };
    if (this.seatHoldService) {
      try {
        movieExpiredInfo = await this.seatHoldService.releaseExpiredHolds();
      } catch (err) {
        this.logger.error('[CronService] Error releasing expired movie holds:', err);
      }
    }

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lt: now },
      },
      include: {
        payments: true,
        service: true,
      },
    });

    if (expiredBookings.length === 0) {
      return {
        expiredCount: 0,
        movieReleasedHolds: movieExpiredInfo.releasedCount,
        movieExpiredOrders: movieExpiredInfo.expiredOrdersCount,
      };
    }

    this.logger.log(
      `[CronService] Found ${expiredBookings.length} expired hold bookings. Processing expiration...`,
    );

    let processedCount = 0;

    for (const booking of expiredBookings) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const freshBooking = await tx.booking.findUnique({
            where: { id: booking.id },
          });

          if (!freshBooking || freshBooking.status !== BookingStatus.PENDING_PAYMENT) {
            this.logger.log(
              `[CronService] Skipping booking ${booking.bookingCode} because status changed to ${freshBooking?.status}`,
            );
            return;
          }

          await tx.booking.update({
            where: { id: booking.id },
            data: { status: BookingStatus.CANCELLED },
          });

          const pendingPayment = booking.payments.find((p) => p.status === PaymentStatus.PENDING);
          if (pendingPayment) {
            await tx.payment.update({
              where: { id: pendingPayment.id },
              data: { status: PaymentStatus.PAYMENT_EXPIRED },
            });

            await tx.paymentEvent.create({
              data: {
                paymentId: pendingPayment.id,
                eventType: 'HOLD_TTL_EXPIRED',
                payload: {
                  reason: 'Hết thời gian giữ chỗ 10 phút (Hold TTL Expired)',
                  expiresAt: booking.expiresAt,
                  expiredAt: now,
                },
              },
            });
          }

          if (booking.service && !booking.service.isAvailable) {
            await tx.service.update({
              where: { id: booking.serviceId },
              data: { isAvailable: true },
            });
          }

          processedCount++;
          this.logger.log(
            `[CronService] Expired booking ${booking.bookingCode} (TTL lapsed at ${booking.expiresAt.toISOString()}).`,
          );
        });
      } catch (error) {
        this.logger.error(`[CronService] Failed to expire booking ${booking.bookingCode}:`, error);
      }
    }

    return {
      expiredCount: processedCount,
      movieReleasedHolds: movieExpiredInfo.releasedCount,
      movieExpiredOrders: movieExpiredInfo.expiredOrdersCount,
    };
  }
}