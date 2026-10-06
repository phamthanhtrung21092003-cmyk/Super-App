import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  MovieBookingStatus,
  MovieOrderItemType,
  MovieOrderStatus,
  MovieTicketStatus,
  MovieTicketType,
  PaymentStatus,
  RefundStatus,
  SeatHoldStatus,
  ShowtimeSeatStatus,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CinemaIntegrationService } from './integration/cinema-integration.service';
import {
  CinemaIntegrationErrorCode,
  CinemaIntegrationException,
} from './integration/cinema-integration.errors';
import { NormalizedCinemaBookingDto } from './integration/dto/normalized-cinema.dto';

@Injectable()
export class MovieBookingService {
  private readonly logger = new Logger(MovieBookingService.name);
  private simulateRefundFailure = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cinemaIntegrationService: CinemaIntegrationService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Phục vụ kiểm thử kịch bản Refund Failure (Section 29).
   */
  setSimulateRefundFailure(enabled: boolean): void {
    this.simulateRefundFailure = enabled;
  }

  /**
   * Sinh mã Barcode vé xem phim (PRINT_AT_COUNTER) hoàn toàn độc lập với Payment QR,
   * payment.orderId, payment.id và providerTransactionId.
   */
  generateUniqueTicketBarcode(forbiddenValues: string[] = []): string {
    const forbiddenSet = new Set(forbiddenValues.filter(Boolean).map((v) => v.toUpperCase()));
    for (let i = 0; i < 10; i++) {
      const randHex = randomBytes(5).toString('hex').toUpperCase();
      const tsBase36 = Date.now().toString(36).toUpperCase().slice(-5);
      const candidate = `VLMV-PRT-${tsBase36}-${randHex}`;
      if (!forbiddenSet.has(candidate)) {
        return candidate;
      }
    }
    return `VLMV-PRT-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  }

  /**
   * Đảm bảo User có sẵn Wallet để ghi nhận lịch sử giao dịch (Transaction History chung của V-Life).
   */
  private async ensureUserWallet(tx: any, userId: string) {
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
          walletNumber: `VLW-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`,
          balance: 0,
          pendingBalance: 0,
        },
      });
    }
    return wallet;
  }

  /**
   * Xử lý khi Payment Core báo thanh toán thất bại (Amount mismatch hoặc Ngân hàng từ chối).
   * Giải phóng ghế ngay lập tức và gửi thông báo thất bại.
   */
  async handlePaymentFailed(
    paymentId: string,
    providerTransactionId: string | undefined,
    reason: string,
    rawPayload: any,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        movieOrder: {
          include: {
            booking: true,
            seatHolds: true,
          },
        },
      },
    });

    if (!payment || !payment.movieOrder) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé liên kết với giao dịch thanh toán');
    }

    const movieOrder = payment.movieOrder;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAYMENT_FAILED,
          providerTransactionId: providerTransactionId || payment.providerTransactionId,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'WEBHOOK_PAYMENT_FAILED',
          providerTransactionId,
          payload: { reason, rawPayload },
        },
      });

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: { status: MovieOrderStatus.CANCELLED },
      });

      if (movieOrder.booking) {
        await tx.movieBooking.update({
          where: { id: movieOrder.booking.id },
          data: {
            status: MovieBookingStatus.CANCELLED,
            failureReason: reason,
            cancelledAt: now,
          },
        });
      }

      const seatIds = movieOrder.seatHolds.map((h) => h.seatId);
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

      if (seatIds.length > 0) {
        await tx.showtimeSeat.updateMany({
          where: {
            showtimeId: movieOrder.showtimeId,
            seatId: { in: seatIds },
            status: ShowtimeSeatStatus.HELD,
          },
          data: {
            status: ShowtimeSeatStatus.AVAILABLE,
            heldByUserId: null,
            activeHoldId: null,
            holdExpiresAt: null,
            version: { increment: 1 },
          },
        });
      }
    });

    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Thanh toán vé xem phim thất bại',
        body: `Đơn đặt vé #${movieOrder.orderCode} thanh toán không thành công: ${reason}. Ghế đã được giải phóng.`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          orderCode: movieOrder.orderCode,
          route: `/movie/orders/${movieOrder.id}`,
        },
        eventKey: `MOVIE_PAYMENT_FAILED_${payment.orderId}`,
      })
      .catch(() => {});

    return {
      success: false,
      message: reason,
      orderId: payment.orderId,
      movieOrderId: movieOrder.id,
      paymentStatus: PaymentStatus.PAYMENT_FAILED,
      movieOrderStatus: MovieOrderStatus.CANCELLED,
      movieBookingStatus: MovieBookingStatus.CANCELLED,
    };
  }
  /**
   * Xử lý khi Payment Core xác nhận PAID.
   * Quy tắc thiết kế (Rule 16, 27):
   * - Bước 1: Mở DB transaction ngắn để cập nhật Payment = PAID, SeatHold = CONVERTED,
   *           MovieBooking = PAYMENT_SUCCESS -> BOOKING_CONFIRMING, và ghi Transaction History.
   * - Bước 2: Đóng DB transaction, sau đó mới gọi CinemaIntegrationService.createBooking().
   */
  async handlePaymentSucceeded(
    paymentId: string,
    providerTransactionId: string,
    rawPayload: any,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        movieOrder: {
          include: {
            items: true,
            seatHolds: true,
            booking: {
              include: {
                tickets: true,
              },
            },
            movie: true,
            cinema: true,
            showtime: {
              include: {
                auditorium: true,
              },
            },
          },
        },
      },
    });

    if (!payment || !payment.movieOrder || !payment.movieOrder.booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé xem phim liên kết với thanh toán');
    }

    const movieOrder = payment.movieOrder;
    const movieBooking = movieOrder.booking!;

    // 1. KIỂM TRA IDEMPOTENCY: Nếu đã xuất vé hoặc đã hoàn tiền trước đó -> Trả về ngay
    if (
      payment.status === PaymentStatus.PAID &&
      movieBooking.status === MovieBookingStatus.TICKET_ISSUED &&
      movieBooking.tickets.length > 0
    ) {
      return {
        success: true,
        message: 'Giao dịch đặt vé đã được xử lý và phát hành vé trước đó (Idempotent)',
        orderId: payment.orderId,
        movieOrderId: movieOrder.id,
        paymentStatus: payment.status,
        movieOrderStatus: movieOrder.status,
        movieBookingStatus: movieBooking.status,
        ticket: movieBooking.tickets[0],
      };
    }

    if (
      movieBooking.status === MovieBookingStatus.REFUNDED ||
      movieBooking.status === MovieBookingStatus.REFUND_PENDING
    ) {
      return {
        success: false,
        message: 'Đơn đặt vé đã được chuyển sang luồng hoàn tiền (Idempotent)',
        orderId: payment.orderId,
        movieOrderId: movieOrder.id,
        paymentStatus: payment.status,
        movieOrderStatus: movieOrder.status,
        movieBookingStatus: movieBooking.status,
      };
    }

    const seatIds = movieOrder.items
      .filter((i) => i.itemType === MovieOrderItemType.SEAT && i.seatId)
      .map((i) => i.seatId!);

    // 2. BƯỚC A: GIAO DỊCH DB NGẮN (KHÔNG GỌI EXTERNAL API TRONG TRANSACTION)
    const preCheckConflict = await this.prisma.$transaction(async (tx) => {
      // Kiểm tra xem ghế có bị người khác BOOKED trong lúc thanh toán trễ quá hạn không
      const currentShowtimeSeats = await tx.showtimeSeat.findMany({
        where: {
          showtimeId: movieOrder.showtimeId,
          seatId: { in: seatIds },
        },
      });

      const seatTakenByOther = currentShowtimeSeats.some(
        (ss) =>
          (ss.status === ShowtimeSeatStatus.BOOKED && ss.movieBookingId !== movieBooking.id) ||
          (ss.status === ShowtimeSeatStatus.HELD &&
            ss.heldByUserId !== movieOrder.userId &&
            ss.holdExpiresAt &&
            ss.holdExpiresAt > new Date()),
      );

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerTransactionId,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'WEBHOOK_PAID_SUCCESS',
          providerTransactionId,
          payload: rawPayload || {},
        },
      });

      // Ghi nhận vào hệ thống Transaction chung của V-Life (serviceType = MOVIE, reference = MovieOrder)
      const txIdempotencyKey = `TX_MOVIE_PAY_${payment.id}`;
      const existingTx = await tx.transaction.findUnique({
        where: { idempotencyKey: txIdempotencyKey },
      });

      if (!existingTx) {
        const wallet = await this.ensureUserWallet(tx, movieOrder.userId);
        const currentBalance = Number(wallet.balance);
        const amountNum = Number(payment.amount);

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: amountNum,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance,
            type: TransactionType.PAYMENT,
            direction: TransactionDirection.DEBIT,
            status: TransactionStatus.SUCCESS,
            description: `Thanh toán đơn đặt vé xem phim #${movieOrder.orderCode}`,
            referenceId: movieOrder.id,
            referenceType: 'MovieOrder',
            idempotencyKey: txIdempotencyKey,
            metadata: {
              serviceType: 'MOVIE',
              reference: 'MovieOrder',
              movieOrderId: movieOrder.id,
              orderCode: movieOrder.orderCode,
              bookingCode: movieBooking.bookingCode,
              providerTransactionId,
            },
          },
        });
      }

      if (seatTakenByOther) {
        return { seatTakenByOther: true };
      }

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: {
          status: MovieOrderStatus.PAID,
          paymentReference: payment.id,
        },
      });

      // Chuyển SeatHold sang CONVERTED để CronJob không bao giờ release
      await tx.seatHold.updateMany({
        where: {
          movieOrderId: movieOrder.id,
          status: { in: [SeatHoldStatus.HELD, SeatHoldStatus.RELEASED] },
        },
        data: {
          status: SeatHoldStatus.CONVERTED,
        },
      });

      await tx.showtimeSeat.updateMany({
        where: {
          showtimeId: movieOrder.showtimeId,
          seatId: { in: seatIds },
        },
        data: {
          status: ShowtimeSeatStatus.BOOKED,
          heldByUserId: movieOrder.userId,
          movieBookingId: movieBooking.id,
          version: { increment: 1 },
        },
      });

      // Chuyển trạng thái MovieBooking: PAYMENT_SUCCESS -> BOOKING_CONFIRMING
      await tx.movieBooking.update({
        where: { id: movieBooking.id },
        data: {
          status: MovieBookingStatus.PAYMENT_SUCCESS,
        },
      });

      await tx.movieBooking.update({
        where: { id: movieBooking.id },
        data: {
          status: MovieBookingStatus.BOOKING_CONFIRMING,
        },
      });

      return { seatTakenByOther: false };
    });

    // Notification: Payment Success (Route riêng của Movie, tuyệt đối không trỏ về /travel/checkout)
    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Thanh toán vé xem phim thành công',
        body: `Đơn đặt vé #${movieOrder.orderCode} đã thanh toán thành công. Hệ thống đang xuất vé từ rạp ${movieOrder.cinema.name}.`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          orderCode: movieOrder.orderCode,
          route: `/movie/orders/${movieOrder.id}`,
        },
        eventKey: `MOVIE_PAYMENT_SUCCESS_${movieOrder.id}`,
      })
      .catch(() => {});

    // Nếu ghế đã bị mất do hết hạn giữ chỗ trước khi thanh toán -> Hoàn tiền ngay
    if (preCheckConflict.seatTakenByOther) {
      return this.initiateAndExecuteMovieRefund(
        movieOrder.id,
        'Ghế đã hết hạn giữ chỗ và được đặt bởi khách hàng khác trước khi thanh toán hoàn tất',
      );
    }

    // 3. BƯỚC B: GỌI CINEMA ADAPTER BÊN NGOÀI DB TRANSACTION
    return this.confirmCinemaBookingAndIssueTicket(movieOrder.id);
  }
  /**
   * Thực hiện gọi CinemaAdapter.createBooking() bên ngoài DB Transaction.
   * Xử lý 3 kịch bản:
   * 1. Thành công -> BOOKING_CONFIRMED -> TICKET_ISSUED + phát hành Barcode độc lập.
   * 2. Timeout -> Giữ BOOKING_CONFIRMING, ưu tiên gọi getBooking() để đối soát trước khi retry.
   * 3. Thất bại -> Không tạo Ticket, chuyển sang REFUND_PENDING -> REFUNDED + giải phóng ghế.
   */
  async confirmCinemaBookingAndIssueTicket(movieOrderId: string) {
    const movieOrder = await this.prisma.movieOrder.findUnique({
      where: { id: movieOrderId },
      include: {
        items: true,
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
      },
    });

    if (!movieOrder || !movieOrder.booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé để xác nhận với rạp');
    }

    const movieBooking = movieOrder.booking!;
    const paidPayment = movieOrder.payments.find((p) => p.status === PaymentStatus.PAID);

    if (!paidPayment) {
      throw new BadRequestException(
        'Không thể gọi rạp xuất vé khi đơn hàng chưa được xác nhận thanh toán PAID',
      );
    }

    // Idempotency: Nếu đã xuất vé rồi thì trả về luôn
    if (
      movieBooking.status === MovieBookingStatus.TICKET_ISSUED &&
      movieBooking.tickets.length > 0
    ) {
      return {
        success: true,
        message: 'Vé đã được phát hành (Idempotent)',
        orderId: paidPayment.orderId,
        movieOrderId: movieOrder.id,
        paymentStatus: paidPayment.status,
        movieOrderStatus: movieOrder.status,
        movieBookingStatus: movieBooking.status,
        ticket: movieBooking.tickets[0],
      };
    }

    const seatCodes = movieOrder.items
      .filter((i) => i.itemType === MovieOrderItemType.SEAT)
      .map((i) => i.codeSnapshot || i.seatId || 'A1');

    const comboItems = movieOrder.items
      .filter((i) => i.itemType === MovieOrderItemType.COMBO)
      .map((i) => ({
        comboCode: i.codeSnapshot || i.comboId || 'COMBO',
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));

    const bookingIdempotencyKey = `CINEMA_BK_${movieOrder.orderCode}`;

    try {
      const cinemaResult = await this.cinemaIntegrationService.createBooking(
        movieOrder.cinema.brand,
        {
          idempotencyKey: bookingIdempotencyKey,
          orderCode: movieOrder.orderCode,
          externalShowtimeId: movieOrder.showtime.externalCode || movieOrder.showtime.id,
          cinemaExternalId: movieOrder.cinema.code || movieOrder.cinema.id,
          seatExternalIds: seatCodes,
          combos: comboItems,
          customer: {
            fullName: movieOrder.customerName,
            phone: movieOrder.customerPhone,
            email: movieOrder.customerEmail || undefined,
          },
          totalAmount: Number(movieOrder.totalAmount),
        },
      );

      return await this.finalizeConfirmedBookingAndIssueTicket(
        movieOrder,
        paidPayment,
        cinemaResult,
      );
    } catch (error: any) {
      // KỊCH BẢN TIMEOUT (Rule 23): Không tạo booking thứ 2 ngay lập tức!
      // Giữ trạng thái BOOKING_CONFIRMING và ưu tiên gọi getBooking() để khôi phục nếu rạp đã tạo đơn.
      if (
        error instanceof CinemaIntegrationException &&
        error.errorCode === CinemaIntegrationErrorCode.CINEMA_TIMEOUT
      ) {
        this.logger.warn(
          `[MovieBookingService] Cinema createBooking TIMEOUT for order ${movieOrder.orderCode}. Keeping BOOKING_CONFIRMING and attempting getBooking() recovery first...`,
        );

        await this.prisma.movieBooking.update({
          where: { id: movieBooking.id },
          data: {
            status: MovieBookingStatus.BOOKING_CONFIRMING,
            failureReason: 'CINEMA_TIMEOUT: Đang đối soát trạng thái đặt vé với hệ thống rạp',
          },
        });

        // Thử ưu tiên gọi getBooking() để khôi phục nếu rạp thực chất đã ghi nhận booking
        const candidateExternalId = `${movieOrder.cinema.brand}-BK-${movieOrder.orderCode}`;
        try {
          const recoveredBooking = await this.cinemaIntegrationService.getBooking(
            movieOrder.cinema.brand,
            candidateExternalId,
          );
          if (recoveredBooking && recoveredBooking.externalBookingId) {
            this.logger.log(
              `[MovieBookingService] Recovered booking ${recoveredBooking.externalBookingId} via getBooking() after timeout!`,
            );
            return await this.finalizeConfirmedBookingAndIssueTicket(
              movieOrder,
              paidPayment,
              recoveredBooking,
            );
          }
        } catch {
          // Nếu getBooking vẫn timeout hoặc chưa thấy -> giữ nguyên BOOKING_CONFIRMING chờ đối soát
        }

        return {
          success: false,
          requiresReconciliation: true,
          message: 'Hệ thống rạp phản hồi chậm (Timeout). Đơn đang ở trạng thái BOOKING_CONFIRMING để đối soát an toàn.',
          orderId: paidPayment.orderId,
          movieOrderId: movieOrder.id,
          paymentStatus: paidPayment.status,
          movieOrderStatus: movieOrder.status,
          movieBookingStatus: MovieBookingStatus.BOOKING_CONFIRMING,
        };
      }

      // KỊCH BẢN CINEMA BOOKING THẤT BẠI SAU KHI ĐÃ PAID (Rule 21):
      // Không tạo Ticket -> Chuyển REFUND_PENDING -> Thực thi Refund Core -> REFUNDED + Release SeatHold
      const failureMessage =
        error instanceof Error ? error.message : 'Hệ thống rạp từ chối xác nhận đặt vé';

      this.logger.error(
        `[MovieBookingService] Cinema createBooking FAILED after PAID for order ${movieOrder.orderCode}: ${failureMessage}`,
      );

      await this.notificationService
        .createNotification({
          recipientId: movieOrder.userId,
          recipientType: 'USER',
          title: 'Đặt vé tại rạp không thành công',
          body: `Rạp ${movieOrder.cinema.name} không thể xác nhận chỗ ngồi cho đơn #${movieOrder.orderCode}. V-Life đang tự động hoàn tiền cho bạn.`,
          data: {
            serviceType: 'MOVIE',
            movieOrderId: movieOrder.id,
            orderCode: movieOrder.orderCode,
            route: `/movie/orders/${movieOrder.id}`,
          },
          eventKey: `MOVIE_BOOKING_FAILED_${movieOrder.id}`,
        })
        .catch(() => {});

      return this.initiateAndExecuteMovieRefund(movieOrder.id, failureMessage);
    }
  }

  /**
   * Đối soát (Reconcile) một đơn đang ở trạng thái BOOKING_CONFIRMING sau khi bị Timeout.
   * Quy tắc (Rule 23): Ưu tiên gọi getBooking() trước. Chỉ khi rạp xác nhận chưa có booking mới gọi lại createBooking() với cùng idempotencyKey.
   */
  async reconcileConfirmingBooking(movieOrderId: string) {
    const movieOrder = await this.prisma.movieOrder.findUnique({
      where: { id: movieOrderId },
      include: {
        items: true,
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
      },
    });

    if (!movieOrder || !movieOrder.booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé để đối soát');
    }

    const paidPayment = movieOrder.payments.find((p) => p.status === PaymentStatus.PAID);
    if (!paidPayment) {
      throw new BadRequestException('Đơn đặt vé chưa thanh toán PAID');
    }

    if (
      movieOrder.booking.status === MovieBookingStatus.TICKET_ISSUED &&
      movieOrder.booking.tickets.length > 0
    ) {
      return {
        success: true,
        reconciled: true,
        movieBookingStatus: movieOrder.booking.status,
        ticket: movieOrder.booking.tickets[0],
      };
    }

    const candidateExternalId =
      movieOrder.booking.externalBookingId ||
      `${movieOrder.cinema.brand}-BK-${movieOrder.orderCode}`;

    // 1. Ưu tiên gọi getBooking() trước
    try {
      const existingAtCinema = await this.cinemaIntegrationService.getBooking(
        movieOrder.cinema.brand,
        candidateExternalId,
      );
      if (existingAtCinema && existingAtCinema.externalBookingId) {
        return await this.finalizeConfirmedBookingAndIssueTicket(
          movieOrder,
          paidPayment,
          existingAtCinema,
        );
      }
    } catch (err: any) {
      if (
        err instanceof CinemaIntegrationException &&
        err.errorCode !== CinemaIntegrationErrorCode.BOOKING_NOT_FOUND
      ) {
        throw err;
      }
    }

    // 2. Nếu getBooking() trả về BOOKING_NOT_FOUND -> Gọi lại confirmCinemaBookingAndIssueTicket với cùng idempotencyKey
    return this.confirmCinemaBookingAndIssueTicket(movieOrderId);
  }

  /**
   * Hoàn tất xác nhận đặt vé từ rạp:
   * BOOKING_CONFIRMING -> BOOKING_CONFIRMED -> TICKET_ISSUED
   * Tạo MovieTicket (PRINT_AT_COUNTER) và Barcode độc lập.
   */
  private async finalizeConfirmedBookingAndIssueTicket(
    movieOrder: any,
    paidPayment: any,
    cinemaResult: NormalizedCinemaBookingDto,
  ) {
    const movieBooking = movieOrder.booking!;

    const seatCodesList = movieOrder.items
      .filter((i: any) => i.itemType === MovieOrderItemType.SEAT)
      .map((i: any) => i.codeSnapshot || 'A1');

    const comboSummaryList = movieOrder.items
      .filter((i: any) => i.itemType === MovieOrderItemType.COMBO)
      .map((i: any) => `${i.nameSnapshot} x${i.quantity}`);

    // Sinh Barcode độc lập hoàn toàn với Payment QR / payment.orderId / payment.id / providerTransactionId
    const barcode = this.generateUniqueTicketBarcode([
      paidPayment.id,
      paidPayment.orderId,
      paidPayment.providerTransactionId || '',
      movieOrder.orderCode,
      movieBooking.bookingCode,
    ]);

    const ticketResult = await this.prisma.$transaction(async (tx) => {
      const existingTicket = await tx.movieTicket.findFirst({
        where: { bookingId: movieBooking.id },
      });

      if (existingTicket) {
        return existingTicket;
      }

      // Chuyển sang BOOKING_CONFIRMED
      await tx.movieBooking.update({
        where: { id: movieBooking.id },
        data: {
          externalBookingId: cinemaResult.externalBookingId,
          status: MovieBookingStatus.BOOKING_CONFIRMED,
          confirmedAt: new Date(),
          failureReason: null,
          rawAdapterPayload: (cinemaResult as any) || {},
        },
      });

      const suffix = randomBytes(3).toString('hex').toUpperCase();
      const ticketCode = `MVT-${Date.now().toString().slice(-6)}-${suffix}`;
      const showtimeEnd = movieOrder.showtime?.endTime
        ? new Date(movieOrder.showtime.endTime)
        : new Date(Date.now() + 24 * 3600 * 1000);

      const createdTicket = await tx.movieTicket.create({
        data: {
          ticketCode,
          barcode,
          bookingId: movieBooking.id,
          movieId: movieOrder.movieId,
          cinemaId: movieOrder.cinemaId,
          showtimeId: movieOrder.showtimeId,
          auditoriumName: movieOrder.showtime?.auditorium?.name || 'Phòng chiếu 01',
          seatCodes: seatCodesList.join(', '),
          combosSummary: comboSummaryList.length > 0 ? comboSummaryList.join(', ') : null,
          ticketType: MovieTicketType.PRINT_AT_COUNTER,
          status: MovieTicketStatus.ISSUED,
          issuedAt: new Date(),
          expiresAt: new Date(showtimeEnd.getTime() + 4 * 3600 * 1000),
          metadata: {
            externalBookingId: cinemaResult.externalBookingId,
            partnerBookingCode: cinemaResult.bookingCode,
            printInstruction: 'Đưa mã Barcode này tại quầy hoặc Kiosk của rạp để in vé giấy vào phòng chiếu',
          },
        },
      });

      // Chuyển sang TICKET_ISSUED & MovieOrder = CONFIRMED
      await tx.movieBooking.update({
        where: { id: movieBooking.id },
        data: {
          status: MovieBookingStatus.TICKET_ISSUED,
        },
      });

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: {
          status: MovieOrderStatus.CONFIRMED,
          bookingReference: cinemaResult.externalBookingId,
        },
      });

      return createdTicket;
    });

    // Notification: Booking Confirmed & Ticket Issued
    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Rạp đã xác nhận chỗ ngồi',
        body: `Đơn đặt vé #${movieOrder.orderCode} tại ${movieOrder.cinema.name} đã được xác nhận.`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          bookingId: movieBooking.id,
          route: `/movie/orders/${movieOrder.id}`,
        },
        eventKey: `MOVIE_BOOKING_CONFIRMED_${movieOrder.id}`,
      })
      .catch(() => {});

    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Vé xem phim đã được phát hành',
        body: `Mã lấy vé tại quầy của bạn là ${ticketResult.barcode}. Vui lòng xuất trình Barcode tại quầy rạp ${movieOrder.cinema.name} để in vé giấy.`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          ticketId: ticketResult.id,
          barcode: ticketResult.barcode,
          ticketType: MovieTicketType.PRINT_AT_COUNTER,
          route: `/movie/tickets/${ticketResult.id}`,
        },
        eventKey: `MOVIE_TICKET_ISSUED_${movieOrder.id}`,
      })
      .catch(() => {});

    return {
      success: true,
      message: 'Thanh toán, xác nhận rạp và phát hành vé xem phim thành công',
      orderId: paidPayment.orderId,
      movieOrderId: movieOrder.id,
      paymentStatus: PaymentStatus.PAID,
      movieOrderStatus: MovieOrderStatus.CONFIRMED,
      movieBookingStatus: MovieBookingStatus.TICKET_ISSUED,
      externalBookingId: cinemaResult.externalBookingId,
      ticket: ticketResult,
    };
  }

  /**
   * Luồng Hoàn tiền (Refund Core) khi Payment = PAID nhưng Cinema Booking = FAILED.
   * Quy tắc (Rule 21):
   * - Không tạo Ticket.
   * - Chuyển MovieBooking -> REFUND_PENDING.
   * - Tạo bản ghi Refund trên bảng Refund dùng chung của V-Life.
   * - Nếu Refund thành công -> MovieBooking = REFUNDED, Payment = REFUNDED, giải phóng SeatHold & ShowtimeSeat, hoàn tiền vào Wallet + ghi Transaction History.
   */
  async initiateAndExecuteMovieRefund(movieOrderId: string, reason: string) {
    const movieOrder = await this.prisma.movieOrder.findUnique({
      where: { id: movieOrderId },
      include: {
        items: true,
        seatHolds: true,
        booking: true,
        payments: true,
        voucherUsage: true,
      },
    });

    if (!movieOrder || !movieOrder.booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé để hoàn tiền');
    }

    const paidPayment = movieOrder.payments.find(
      (p) =>
        p.status === PaymentStatus.PAID ||
        p.status === PaymentStatus.REFUND_PENDING ||
        p.status === PaymentStatus.REFUNDED,
    );

    if (!paidPayment) {
      throw new BadRequestException('Không tìm thấy giao dịch thanh toán PAID để hoàn tiền');
    }

    const refundIdempotencyKey = `REFUND_MOVIE_${paidPayment.id}`;

    // Idempotency: nếu đã REFUNDED rồi -> trả về ngay
    if (movieOrder.booking.status === MovieBookingStatus.REFUNDED) {
      const existingRefund = await this.prisma.refund.findUnique({
        where: { idempotencyKey: refundIdempotencyKey },
      });
      return {
        success: false,
        refunded: true,
        message: 'Đơn đặt vé đã được hoàn tiền trước đó (Idempotent)',
        orderId: paidPayment.orderId,
        movieOrderId: movieOrder.id,
        paymentStatus: PaymentStatus.REFUNDED,
        movieOrderStatus: MovieOrderStatus.REFUNDED,
        movieBookingStatus: MovieBookingStatus.REFUNDED,
        refund: existingRefund,
      };
    }

    // 1. Chuyển trạng thái sang REFUND_PENDING & khởi tạo bản ghi Refund dùng chung
    const pendingRefund = await this.prisma.$transaction(async (tx) => {
      await tx.movieBooking.update({
        where: { id: movieOrder.booking!.id },
        data: {
          status: MovieBookingStatus.REFUND_PENDING,
          failureReason: reason,
        },
      });

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: { status: MovieOrderStatus.REFUND_PENDING },
      });

      await tx.payment.update({
        where: { id: paidPayment.id },
        data: { status: PaymentStatus.REFUND_PENDING },
      });

      return tx.refund.upsert({
        where: { idempotencyKey: refundIdempotencyKey },
        create: {
          movieOrderId: movieOrder.id,
          paymentId: paidPayment.id,
          amount: paidPayment.amount,
          reason,
          status: RefundStatus.PENDING,
          idempotencyKey: refundIdempotencyKey,
        },
        update: {
          reason,
        },
      });
    });

    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Đang xử lý hoàn tiền vé xem phim',
        body: `Đơn #${movieOrder.orderCode} đang được xử lý hoàn tiền (${Number(paidPayment.amount).toLocaleString()}đ).`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          refundId: pendingRefund.id,
          route: `/movie/orders/${movieOrder.id}`,
        },
        eventKey: `MOVIE_REFUND_INITIATED_${movieOrder.id}`,
      })
      .catch(() => {});

    // Kiểm tra giả lập lỗi Refund (phục vụ test kịch bản Refund Failure)
    if (this.simulateRefundFailure) {
      const failedRefund = await this.prisma.refund.update({
        where: { id: pendingRefund.id },
        data: { status: RefundStatus.FAILED },
      });

      return {
        success: false,
        refunded: false,
        message: 'Quá trình hoàn tiền gặp sự cố tạm thời, đơn đang ở trạng thái REFUND_PENDING',
        orderId: paidPayment.orderId,
        movieOrderId: movieOrder.id,
        paymentStatus: PaymentStatus.REFUND_PENDING,
        movieOrderStatus: MovieOrderStatus.REFUND_PENDING,
        movieBookingStatus: MovieBookingStatus.REFUND_PENDING,
        refund: failedRefund,
      };
    }

    // 2. Thực thi hoàn tiền nguyên tử: Refund = SUCCESS, MovieBooking = REFUNDED, giải phóng SeatHold & ShowtimeSeat
    const now = new Date();
    const seatIds = movieOrder.items
      .filter((i) => i.itemType === MovieOrderItemType.SEAT && i.seatId)
      .map((i) => i.seatId!);

    const completedRefund = await this.prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refund.update({
        where: { id: pendingRefund.id },
        data: { status: RefundStatus.SUCCESS },
      });

      await tx.payment.update({
        where: { id: paidPayment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.movieBooking.update({
        where: { id: movieOrder.booking!.id },
        data: {
          status: MovieBookingStatus.REFUNDED,
          refundedAt: now,
        },
      });

      await tx.movieOrder.update({
        where: { id: movieOrder.id },
        data: { status: MovieOrderStatus.REFUNDED },
      });

      // Giải phóng toàn bộ SeatHold & ShowtimeSeat của đơn này
      await tx.seatHold.updateMany({
        where: {
          movieOrderId: movieOrder.id,
          status: { in: [SeatHoldStatus.HELD, SeatHoldStatus.CONVERTED] },
        },
        data: {
          status: SeatHoldStatus.RELEASED,
          releasedAt: now,
        },
      });

      if (seatIds.length > 0) {
        await tx.showtimeSeat.updateMany({
          where: {
            showtimeId: movieOrder.showtimeId,
            seatId: { in: seatIds },
          },
          data: {
            status: ShowtimeSeatStatus.AVAILABLE,
            heldByUserId: null,
            activeHoldId: null,
            holdExpiresAt: null,
            movieBookingId: null,
            version: { increment: 1 },
          },
        });
      }

      // Hoàn lại lượt dùng Voucher nếu có
      if (movieOrder.voucherId && movieOrder.voucherUsage) {
        await tx.voucherUsage.delete({
          where: { id: movieOrder.voucherUsage.id },
        });
        await tx.voucher.update({
          where: { id: movieOrder.voucherId },
          data: { usedCount: { decrement: 1 } },
        });
      }

      // Hoàn tiền vào Wallet & ghi Transaction History chung của V-Life
      const refundTxKey = `TX_MOVIE_REFUND_${updatedRefund.id}`;
      const existingRefundTx = await tx.transaction.findUnique({
        where: { idempotencyKey: refundTxKey },
      });

      if (!existingRefundTx) {
        const wallet = await this.ensureUserWallet(tx, movieOrder.userId);
        const balanceBefore = Number(wallet.balance);
        const amountNum = Number(paidPayment.amount);
        const balanceAfter = balanceBefore + amountNum;

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: balanceAfter },
        });

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: amountNum,
            balanceBefore,
            balanceAfter,
            type: TransactionType.REFUND,
            direction: TransactionDirection.CREDIT,
            status: TransactionStatus.SUCCESS,
            description: `Hoàn tiền đơn đặt vé xem phim #${movieOrder.orderCode}`,
            referenceId: movieOrder.id,
            referenceType: 'MovieOrder',
            idempotencyKey: refundTxKey,
            metadata: {
              serviceType: 'MOVIE',
              reference: 'MovieOrder',
              movieOrderId: movieOrder.id,
              orderCode: movieOrder.orderCode,
              refundId: updatedRefund.id,
              reason,
            },
          },
        });
      }

      return updatedRefund;
    });

    await this.notificationService
      .createNotification({
        recipientId: movieOrder.userId,
        recipientType: 'USER',
        title: 'Hoàn tiền vé xem phim thành công',
        body: `Đã hoàn ${Number(paidPayment.amount).toLocaleString()}đ cho đơn đặt vé #${movieOrder.orderCode} vào ví V-Life của bạn.`,
        data: {
          serviceType: 'MOVIE',
          movieOrderId: movieOrder.id,
          refundId: completedRefund.id,
          route: `/movie/orders/${movieOrder.id}`,
        },
        eventKey: `MOVIE_REFUND_COMPLETED_${movieOrder.id}`,
      })
      .catch(() => {});

    return {
      success: false,
      refunded: true,
      message: `Đặt vé tại rạp thất bại (${reason}). Hệ thống đã hoàn tiền đầy đủ và giải phóng ghế.`,
      orderId: paidPayment.orderId,
      movieOrderId: movieOrder.id,
      paymentStatus: PaymentStatus.REFUNDED,
      movieOrderStatus: MovieOrderStatus.REFUNDED,
      movieBookingStatus: MovieBookingStatus.REFUNDED,
      refund: completedRefund,
    };
  }
}