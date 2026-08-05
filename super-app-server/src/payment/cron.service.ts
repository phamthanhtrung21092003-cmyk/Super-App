import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * TASK TỰ ĐỘNG GIẢI PHÓNG ĐƠN HẾT HẠN GIỮ CHỖ (HOLD TTL EXPIRATION CRON JOB)
   * Chạy định kỳ mỗi phút 1 lần
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredHoldBookings() {
    const now = new Date();

    // 1. Tìm các đơn Booking ở trạng thái PENDING_PAYMENT và đã qua thời hạn expiresAt
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
      return { expiredCount: 0 };
    }

    this.logger.log(`[CronService] Found ${expiredBookings.length} expired hold bookings. Processing expiration...`);

    let processedCount = 0;

    for (const booking of expiredBookings) {
      try {
        // 2. CONCURRENCY PROTECTION & ATOMIC TRANSACTION BOUNDARY
        // Chỉ hết hạn nếu đơn vẫn đang PENDING_PAYMENT (tránh tranh chấp với Webhook Ngân hàng)
        await this.prisma.$transaction(async (tx) => {
          const freshBooking = await tx.booking.findUnique({
            where: { id: booking.id },
          });

          // Nếu Webhook đã cập nhật PAYMENT_PAID hoặc CONFIRMED trong lúc Cron chạy -> Bỏ qua ngay!
          if (!freshBooking || freshBooking.status !== BookingStatus.PENDING_PAYMENT) {
            this.logger.log(`[CronService] Skipping booking ${booking.bookingCode} because status changed to ${freshBooking?.status}`);
            return;
          }

          // 2.1 Cập nhật Booking = CANCELLED (Hoặc hết hạn)
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: BookingStatus.CANCELLED },
          });

          // 2.2 Cập nhật các Payment đang PENDING sang PAYMENT_EXPIRED
          const pendingPayment = booking.payments.find((p) => p.status === PaymentStatus.PENDING);
          if (pendingPayment) {
            await tx.payment.update({
              where: { id: pendingPayment.id },
              data: { status: PaymentStatus.PAYMENT_EXPIRED },
            });

            // 2.3 Ghi nhật ký Audit PaymentEvent
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

          // 2.4 Giải phóng tính sẵn có của Dịch vụ
          if (booking.service && !booking.service.isAvailable) {
            await tx.service.update({
              where: { id: booking.serviceId },
              data: { isAvailable: true },
            });
          }

          processedCount++;
          this.logger.log(`[CronService] Expired booking ${booking.bookingCode} (TTL lapsed at ${booking.expiresAt.toISOString()}).`);
        });
      } catch (error) {
        this.logger.error(`[CronService] Failed to expire booking ${booking.bookingCode}:`, error);
      }
    }

    return { expiredCount: processedCount };
  }
}
