import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentProvider, PaymentStatus, BookingStatus } from '@prisma/client';
import { VietQrWebhookProvider } from './providers/vietqr-webhook.provider';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vietQrProvider: VietQrWebhookProvider,
    private readonly payoutService: PayoutService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Khởi tạo đơn thanh toán (Payment Order)
   * Tự động chống lặp (Idempotency) & Tích hợp Abstraction PaymentProvider
   */
  async createPaymentOrder(userId: string, dto: CreatePaymentOrderDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        service: true,
        partner: true,
        payments: true,
        commission: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt hàng');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thanh toán cho đơn đặt của người khác');
    }

    if (booking.expiresAt < new Date() && booking.status === BookingStatus.PENDING_PAYMENT) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });
      throw new BadRequestException('Thời gian giữ chỗ đã hết hạn. Đơn đặt đã bị hủy.');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Đơn đặt không ở trạng thái chờ thanh toán (Trạng thái hiện tại: ${booking.status})`,
      );
    }

    const provider = dto.provider || PaymentProvider.VIETQR;
    const idempotencyKey =
      dto.idempotencyKey || `PAY_${booking.id}_${provider}_${booking.bookingCode}`;

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ idempotencyKey }, { bookingId: booking.id, status: PaymentStatus.PENDING }],
      },
    });

    if (existingPayment) {
      return this.buildPaymentResponse(existingPayment, booking);
    }

    const grossAmountNum = Number(booking.grossAmount);

    return this.prisma.$transaction(async (tx) => {
      if (!booking.commission) {
        await tx.commission.create({
          data: {
            bookingId: booking.id,
            grossAmount: booking.grossAmount,
            commissionRate: booking.commissionRate,
            commissionAmount: booking.commissionAmount,
            partnerAmount: booking.partnerAmount,
          },
        });
      }

      const payment = await tx.payment.create({
        data: {
          orderId: booking.bookingCode,
          bookingId: booking.id,
          amount: grossAmountNum,
          provider,
          status: PaymentStatus.PENDING,
          idempotencyKey,
        },
      });

      return this.buildPaymentResponse(payment, booking);
    });
  }

  /**
   * Tra cứu trạng thái thanh toán thời gian thực (Polling API - CHỈ ĐỌC TỪ DATABASE)
   */
  async getPaymentStatus(userId: string, orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ orderId }, { id: orderId }],
      },
      include: {
        booking: {
          include: {
            service: true,
            partner: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy đơn thanh toán');
    }

    if (payment.booking.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền tra cứu đơn thanh toán này');
    }

    return {
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: Number(payment.amount),
      provider: payment.provider,
      paymentStatus: payment.status,
      bookingStatus: payment.booking.status,
      bookingCode: payment.booking.bookingCode,
      serviceTitle: payment.booking.service.title,
      expiresAt: payment.booking.expiresAt,
      isExpired: payment.booking.expiresAt < new Date() && payment.status === PaymentStatus.PENDING,
    };
  }

  /**
   * XỬ LÝ WEBHOOK TỪ NGÂN HÀNG / PAYMENT PROVIDER
   */
  async processWebhook(headers: Record<string, any>, dto: PaymentWebhookDto) {
    const webhookSecret = process.env.WEBHOOK_SECRET || 'NONE';

    const parseResult = this.vietQrProvider.verifyAndParseWebhook(headers, dto, webhookSecret);

    if (!parseResult.isValid) {
      this.logger.warn(`Webhook Signature Invalid: ${parseResult.failureReason}`);
      throw new UnauthorizedException(parseResult.failureReason || 'Chữ ký HMAC Webhook không hợp lệ');
    }

    const { orderId, providerTransactionId, amount, isSuccess, rawPayload } = parseResult;

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ orderId }, { id: orderId }],
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      this.logger.error(`Webhook Received for Unknown OrderId: ${orderId}`);
      throw new NotFoundException(`Không tìm thấy đơn thanh toán cho mã orderId: ${orderId}`);
    }

    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(`Webhook Replay Detected for OrderId ${orderId}. Already PAID (Idempotent).`);
      return {
        success: true,
        message: 'Giao dịch đã được ghi nhận thanh toán thành công trước đó (Idempotent)',
        orderId: payment.orderId,
        paymentStatus: payment.status,
        bookingStatus: payment.booking.status,
      };
    }

    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(amount);

    if (expectedAmount !== receivedAmount) {
      this.logger.error(
        `Webhook Amount Mismatch for Order ${orderId}: Expected ${expectedAmount}, Received ${receivedAmount}`,
      );

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PAYMENT_FAILED },
        }),
        this.prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            eventType: 'WEBHOOK_AMOUNT_MISMATCH',
            providerTransactionId,
            payload: {
              expectedAmount,
              receivedAmount,
              rawPayload,
            },
          },
        }),
      ]);

      // Notification cho Admin: Amount Mismatch
      await this.notificationService.createNotification({
        recipientId: 'ADMIN',
        recipientType: 'ADMIN',
        title: '⚠️ Cảnh báo: Số tiền thanh toán không khớp',
        body: `Đơn ${orderId}: Khách chuyển ${receivedAmount}đ nhưng đơn hàng yêu cầu ${expectedAmount}đ`,
        data: { orderId, expectedAmount, receivedAmount },
        eventKey: `AMOUNT_MISMATCH_${orderId}`,
      }).catch(() => {});

      throw new BadRequestException(
        `Số tiền thanh toán thực tế (${receivedAmount}đ) không khớp với giá trị đơn hàng (${expectedAmount}đ)`,
      );
    }

    if (!isSuccess) {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PAYMENT_FAILED },
        }),
        this.prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            eventType: 'WEBHOOK_PAYMENT_FAILED',
            providerTransactionId,
            payload: rawPayload,
          },
        }),
      ]);

      // Notification cho USER: Thanh toán thất bại
      await this.notificationService.createNotification({
        recipientId: payment.booking.userId,
        recipientType: 'USER',
        title: 'Thanh toán thất bại',
        body: `Giao dịch đơn #${payment.booking.bookingCode} thất bại từ phía Ngân hàng.`,
        data: { bookingId: payment.bookingId, orderId: payment.orderId },
        eventKey: `PAYMENT_FAILED_${payment.orderId}`,
      }).catch(() => {});

      return {
        success: false,
        message: 'Giao dịch thanh toán thất bại từ phía Ngân hàng',
        orderId: payment.orderId,
        paymentStatus: PaymentStatus.PAYMENT_FAILED,
      };
    }

    // XÁC MINH THANH TOÁN THÀNH CÔNG (ATOMIC TRANSACTION BOUNDARY)
    const transactionResult = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerTransactionId,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: BookingStatus.PAYMENT_PAID,
        },
      });

      const existingCommission = await tx.commission.findUnique({
        where: { bookingId: payment.bookingId },
      });

      if (!existingCommission) {
        await tx.commission.create({
          data: {
            bookingId: payment.bookingId,
            grossAmount: payment.booking.grossAmount,
            commissionRate: payment.booking.commissionRate,
            commissionAmount: payment.booking.commissionAmount,
            partnerAmount: payment.booking.partnerAmount,
          },
        });
      }

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'WEBHOOK_PAID_SUCCESS',
          providerTransactionId,
          payload: rawPayload,
        },
      });

      return {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        bookingId: updatedBooking.id,
      };
    });

    // KÍCH HOẠT PARTNER PAYOUT ENGINE SAU KHI PAYMENT = PAID
    this.logger.log(`Payment PAID for Booking ${transactionResult.orderId}. Triggering Partner Payout Engine...`);
    const payoutResult = await this.payoutService.processPayoutForBooking(transactionResult.bookingId);
    const finalPayoutStatus = 'payoutStatus' in payoutResult ? payoutResult.payoutStatus : payoutResult.payout?.status;

    // Notification cho USER: Thanh toán thành công
    await this.notificationService.createNotification({
      recipientId: payment.booking.userId,
      recipientType: 'USER',
      title: 'Thanh toán thành công',
      body: `Đơn #${payment.booking.bookingCode} đã được V-life xác nhận thanh toán.`,
      data: { bookingId: payment.booking.id, orderId: payment.orderId },
      eventKey: `PAYMENT_PAID_${payment.orderId}`,
    }).catch(() => {});

    // Notification nếu Booking đã CONFIRMED (Payout thành công)
    if (payoutResult.bookingStatus === 'CONFIRMED') {
      await this.notificationService.createNotification({
        recipientId: payment.booking.userId,
        recipientType: 'USER',
        title: 'Đặt dịch vụ thành công',
        body: `Đơn #${payment.booking.bookingCode} đã được xác nhận. Hẹn gặp bạn!`,
        data: { bookingId: payment.booking.id },
        eventKey: `BOOKING_CONFIRMED_USER_${payment.booking.id}`,
      }).catch(() => {});
    }

    return {
      success: true,
      message: 'Xác minh thanh toán và Payout đối tác thành công',
      orderId: transactionResult.orderId,
      providerTransactionId,
      paymentStatus: PaymentStatus.PAID,
      bookingStatus: payoutResult.bookingStatus,
      payoutStatus: finalPayoutStatus,
    };
  }

  private buildPaymentResponse(payment: any, booking: any) {
    const amountNum = Number(payment.amount);
    const bankCode = booking.partner?.bankCode || 'MB';
    const accountNo = booking.partner?.bankAccountNo || '0912345678';
    const accountHolder = booking.partner?.bankAccountHolder || 'SUPER APP TRAVEL V-LIFE';

    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${amountNum}&addInfo=${payment.orderId}&accountName=${encodeURIComponent(accountHolder)}`;

    return {
      message: 'Khởi tạo đơn thanh toán thành công',
      paymentOrder: {
        paymentId: payment.id,
        orderId: payment.orderId,
        bookingCode: booking.bookingCode,
        amount: amountNum,
        currency: payment.currency,
        provider: payment.provider,
        paymentStatus: payment.status,
        bookingStatus: booking.status,
        expiresAt: booking.expiresAt,
        vietqrInfo: {
          qrUrl,
          bankName: booking.partner?.bankName || 'MB BANK',
          bankCode,
          accountNo,
          accountHolder,
          orderReference: payment.orderId,
        },
      },
    };
  }
}
