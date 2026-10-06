import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  PaymentProvider,
  PaymentStatus,
  BookingStatus,
  MovieOrderStatus,
  MovieBookingStatus,
  SeatHoldStatus,
  ShowtimeSeatStatus,
} from '@prisma/client';
import { VietQrWebhookProvider } from './providers/vietqr-webhook.provider';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';
import { MovieBookingService } from '../movie/movie-booking.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vietQrProvider: VietQrWebhookProvider,
    private readonly payoutService: PayoutService,
    private readonly notificationService: NotificationService,
    @Optional() private readonly movieBookingService?: MovieBookingService,
  ) {}

  /**
   * Khởi tạo đơn thanh toán dùng chung của V-Life (Payment Core)
   * Hỗ trợ cả Travel Booking (bookingId) và Movie Order (movieOrderId)
   * Tự động chống lặp (Idempotency) & Tích hợp Abstraction PaymentProvider
   */
  async createPaymentOrder(userId: string, dto: CreatePaymentOrderDto) {
    if (dto.movieOrderId) {
      return this.createMoviePaymentOrder(userId, dto);
    }

    if (!dto.bookingId) {
      throw new BadRequestException('Phải cung cấp bookingId hoặc movieOrderId để khởi tạo thanh toán');
    }

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
   * Khởi tạo đơn thanh toán cho MovieOrder trên cùng Payment Core của V-Life.
   */
  private async createMoviePaymentOrder(userId: string, dto: CreatePaymentOrderDto) {
    const movieOrder = await this.prisma.movieOrder.findUnique({
      where: { id: dto.movieOrderId! },
      include: {
        movie: true,
        cinema: {
          include: {
            partner: true,
          },
        },
        booking: true,
        seatHolds: true,
        payments: true,
      },
    });

    if (!movieOrder) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé xem phim');
    }

    if (movieOrder.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thanh toán cho đơn đặt vé của người khác');
    }

    const now = new Date();
    const holdExpired = movieOrder.seatHolds.some(
      (h) => h.status !== SeatHoldStatus.HELD || h.expiresAt <= now,
    );

    if (
      (movieOrder.expiresAt <= now || holdExpired) &&
      (movieOrder.status === MovieOrderStatus.PENDING ||
        movieOrder.status === MovieOrderStatus.PAYMENT_PENDING)
    ) {
      await this.prisma.$transaction(async (tx) => {
        await tx.movieOrder.update({
          where: { id: movieOrder.id },
          data: { status: MovieOrderStatus.EXPIRED },
        });
        if (movieOrder.booking) {
          await tx.movieBooking.update({
            where: { id: movieOrder.booking.id },
            data: { status: MovieBookingStatus.EXPIRED },
          });
        }
        await tx.seatHold.updateMany({
          where: {
            movieOrderId: movieOrder.id,
            status: SeatHoldStatus.HELD,
          },
          data: {
            status: SeatHoldStatus.RELEASED,
            releasedAt: now,
          },
        });
      });

      throw new BadRequestException('Thời gian giữ ghế đã hết hạn. Đơn đặt vé đã bị hủy.');
    }

    if (
      movieOrder.status !== MovieOrderStatus.PENDING &&
      movieOrder.status !== MovieOrderStatus.PAYMENT_PENDING
    ) {
      throw new BadRequestException(
        `Đơn đặt vé không ở trạng thái chờ thanh toán (Trạng thái hiện tại: ${movieOrder.status})`,
      );
    }

    const provider = dto.provider || PaymentProvider.VIETQR;
    const idempotencyKey =
      dto.idempotencyKey || `PAY_MOVIE_${movieOrder.id}_${provider}_${movieOrder.orderCode}`;

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { idempotencyKey },
          { movieOrderId: movieOrder.id, status: PaymentStatus.PENDING },
          { movieOrderId: movieOrder.id, status: PaymentStatus.PAID },
        ],
      },
    });

    if (existingPayment) {
      return this.buildMoviePaymentResponse(existingPayment, movieOrder);
    }

    const totalAmountNum = Number(movieOrder.totalAmount);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: movieOrder.orderCode,
          movieOrderId: movieOrder.id,
          amount: totalAmountNum,
          provider,
          status: PaymentStatus.PENDING,
          idempotencyKey,
        },
      });

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: {
          status: MovieOrderStatus.PAYMENT_PENDING,
          paymentReference: payment.id,
        },
      });

      if (movieOrder.booking) {
        await tx.movieBooking.update({
          where: { id: movieOrder.booking.id },
          data: {
            status: MovieBookingStatus.PAYMENT_PENDING,
          },
        });
      }

      return this.buildMoviePaymentResponse(payment, {
        ...movieOrder,
        status: MovieOrderStatus.PAYMENT_PENDING,
      });
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
        movieOrder: {
          include: {
            movie: true,
            cinema: true,
            booking: {
              include: {
                tickets: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy đơn thanh toán');
    }

    if (payment.movieOrder) {
      if (payment.movieOrder.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền tra cứu đơn thanh toán này');
      }

      return {
        orderId: payment.orderId,
        paymentId: payment.id,
        movieOrderId: payment.movieOrder.id,
        orderCode: payment.movieOrder.orderCode,
        amount: Number(payment.amount),
        provider: payment.provider,
        paymentStatus: payment.status,
        movieOrderStatus: payment.movieOrder.status,
        movieBookingStatus: payment.movieOrder.booking?.status,
        movieTitle: payment.movieOrder.movie.title,
        cinemaName: payment.movieOrder.cinema.name,
        tickets: payment.movieOrder.booking?.tickets || [],
        expiresAt: payment.movieOrder.expiresAt,
        isExpired:
          payment.movieOrder.expiresAt < new Date() && payment.status === PaymentStatus.PENDING,
      };
    }

    if (payment.booking!.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền tra cứu đơn thanh toán này');
    }

    return {
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: Number(payment.amount),
      provider: payment.provider,
      paymentStatus: payment.status,
      bookingStatus: payment.booking!.status,
      bookingCode: payment.booking!.bookingCode,
      serviceTitle: payment.booking!.service.title,
      expiresAt: payment.booking!.expiresAt,
      isExpired: payment.booking!.expiresAt < new Date() && payment.status === PaymentStatus.PENDING,
    };
  }
  /**
   * XỬ LÝ WEBHOOK TỪ NGÂN HÀNG / PAYMENT PROVIDER (Dùng chung cho Travel & Movie)
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
        movieOrder: {
          include: {
            booking: {
              include: {
                tickets: true,
              },
            },
            seatHolds: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.error(`Webhook Received for Unknown OrderId: ${orderId}`);
      throw new NotFoundException(`Không tìm thấy đơn thanh toán cho mã orderId: ${orderId}`);
    }

    // 1. CHỐNG WEBHOOK TRÙNG LẶP (IDEMPOTENCY)
    if (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.REFUNDED) {
      this.logger.log(`Webhook Replay Detected for OrderId ${orderId}. Already ${payment.status} (Idempotent).`);

      if (payment.movieOrder) {
        return {
          success: true,
          message: 'Giao dịch đã được ghi nhận thanh toán thành công trước đó (Idempotent)',
          orderId: payment.orderId,
          movieOrderId: payment.movieOrder.id,
          paymentStatus: payment.status,
          movieOrderStatus: payment.movieOrder.status,
          movieBookingStatus: payment.movieOrder.booking?.status,
          ticket: payment.movieOrder.booking?.tickets?.[0] || null,
        };
      }

      return {
        success: true,
        message: 'Giao dịch đã được ghi nhận thanh toán thành công trước đó (Idempotent)',
        orderId: payment.orderId,
        paymentStatus: payment.status,
        bookingStatus: payment.booking!.status,
      };
    }

    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(amount);

    // 2. KIỂM TRA SỐ TIỀN THANH TOÁN (AMOUNT MISMATCH)
    if (expectedAmount !== receivedAmount) {
      this.logger.error(
        `Webhook Amount Mismatch for Order ${orderId}: Expected ${expectedAmount}, Received ${receivedAmount}`,
      );

      if (payment.movieOrder && this.movieBookingService) {
        await this.movieBookingService.handlePaymentFailed(
          payment.id,
          providerTransactionId,
          `Số tiền thanh toán không khớp. Cần thanh toán: ${expectedAmount} VND, Nhận được: ${receivedAmount} VND`,
          rawPayload,
        );
      } else {
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
      }

      await this.notificationService
        .createNotification({
          recipientId: 'ADMIN',
          recipientType: 'ADMIN',
          title: '⚠️ Cảnh báo: Số tiền thanh toán không khớp',
          body: `Đơn #${orderId}: Yêu cầu ${expectedAmount.toLocaleString()}đ nhưng nhận ${receivedAmount.toLocaleString()}đ.`,
          data: { orderId, expectedAmount, receivedAmount, paymentId: payment.id },
          eventKey: `AMOUNT_MISMATCH_${payment.id}_${providerTransactionId}`,
        })
        .catch(() => {});

      throw new BadRequestException(
        `Số tiền thanh toán không khớp. Cần thanh toán: ${expectedAmount} VND, Nhận được: ${receivedAmount} VND`,
      );
    }

    // 3. XỬ LÝ TRƯỜNG HỢP WEBHOOK BÁO THẤT BẠI (!isSuccess)
    if (!isSuccess) {
      if (payment.movieOrder && this.movieBookingService) {
        return this.movieBookingService.handlePaymentFailed(
          payment.id,
          providerTransactionId,
          'Giao dịch thanh toán thất bại từ phía Ngân hàng',
          rawPayload,
        );
      }

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAYMENT_FAILED,
            providerTransactionId,
          },
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

      await this.notificationService
        .createNotification({
          recipientId: payment.booking!.userId,
          recipientType: 'USER',
          title: 'Thanh toán thất bại',
          body: `Giao dịch đơn #${payment.booking!.bookingCode} thất bại từ phía Ngân hàng.`,
          data: { bookingId: payment.bookingId!, orderId: payment.orderId },
          eventKey: `PAYMENT_FAILED_${payment.orderId}`,
        })
        .catch(() => {});

      return {
        success: false,
        message: 'Giao dịch thanh toán thất bại từ phía Ngân hàng',
        orderId: payment.orderId,
        paymentStatus: PaymentStatus.PAYMENT_FAILED,
      };
    }

    // 4. LUỒNG MOVIE ORDER: UỶ QUYỀN CHO MOVIE BOOKING ORCHESTRATOR
    if (payment.movieOrder) {
      if (!this.movieBookingService) {
        throw new BadRequestException('MovieBookingService chưa được khởi tạo');
      }
      return this.movieBookingService.handlePaymentSucceeded(
        payment.id,
        providerTransactionId,
        rawPayload,
      );
    }

    if (!payment.bookingId || !payment.booking) {
      throw new BadRequestException('Đơn thanh toán không gắn với Booking hợp lệ');
    }

    // 5. LUỒNG TRAVEL BOOKING HIỆN TẠI (GIỮ NGUYÊN 100%)
    const transactionResult = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerTransactionId,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId! },
        data: {
          status: BookingStatus.PAYMENT_PAID,
        },
      });

      const existingCommission = await tx.commission.findUnique({
        where: { bookingId: payment.bookingId! },
      });

      if (!existingCommission) {
        await tx.commission.create({
          data: {
            bookingId: payment.bookingId!,
            grossAmount: payment.booking!.grossAmount,
            commissionRate: payment.booking!.commissionRate,
            commissionAmount: payment.booking!.commissionAmount,
            partnerAmount: payment.booking!.partnerAmount,
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

    this.logger.log(`Payment PAID for Booking ${transactionResult.orderId}. Triggering Partner Payout Engine...`);
    const payoutResult = await this.payoutService.processPayoutForBooking(transactionResult.bookingId);
    const finalPayoutStatus =
      'payoutStatus' in payoutResult ? payoutResult.payoutStatus : payoutResult.payout?.status;

    await this.notificationService
      .createNotification({
        recipientId: payment.booking!.userId,
        recipientType: 'USER',
        title: 'Thanh toán thành công',
        body: `Đơn #${payment.booking!.bookingCode} đã được V-life xác nhận thanh toán.`,
        data: { bookingId: payment.booking!.id, orderId: payment.orderId },
        eventKey: `PAYMENT_PAID_${payment.orderId}`,
      })
      .catch(() => {});

    if (payoutResult.bookingStatus === 'CONFIRMED') {
      await this.notificationService
        .createNotification({
          recipientId: payment.booking!.userId,
          recipientType: 'USER',
          title: 'Đặt dịch vụ thành công',
          body: `Đơn #${payment.booking!.bookingCode} đã được xác nhận. Hẹn gặp bạn!`,
          data: { bookingId: payment.booking!.id },
          eventKey: `BOOKING_CONFIRMED_USER_${payment.booking!.id}`,
        })
        .catch(() => {});
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

  private buildMoviePaymentResponse(payment: any, movieOrder: any) {
    const amountNum = Number(payment.amount);
    const partner = movieOrder.cinema?.partner;
    const bankCode = partner?.bankCode || process.env.VLIFE_SETTLEMENT_BANK_CODE || 'MB';
    const accountNo = partner?.bankAccountNo || process.env.VLIFE_SETTLEMENT_ACCOUNT_NO || '0912345678';
    const accountHolder =
      partner?.bankAccountHolder || process.env.VLIFE_SETTLEMENT_ACCOUNT_HOLDER || 'CONG TY CO PHAN V-LIFE';

    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${amountNum}&addInfo=${payment.orderId}&accountName=${encodeURIComponent(accountHolder)}`;

    return {
      message: 'Khởi tạo đơn thanh toán vé xem phim thành công',
      paymentOrder: {
        paymentId: payment.id,
        orderId: payment.orderId,
        movieOrderId: movieOrder.id,
        orderCode: movieOrder.orderCode,
        amount: amountNum,
        currency: payment.currency,
        provider: payment.provider,
        paymentStatus: payment.status,
        movieOrderStatus: movieOrder.status,
        movieBookingStatus: movieOrder.booking?.status,
        expiresAt: movieOrder.expiresAt,
        vietqrInfo: {
          qrUrl,
          bankName: partner?.bankName || 'MB BANK',
          bankCode,
          accountNo,
          accountHolder,
          orderReference: payment.orderId,
        },
      },
    };
  }
}