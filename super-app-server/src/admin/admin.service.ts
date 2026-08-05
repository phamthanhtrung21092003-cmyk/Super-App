import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutService } from '../payout/payout.service';
import { PaymentStatus, BookingStatus, PayoutStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payoutService: PayoutService,
  ) {}

  /**
   * BÁO CÁO TỔNG QUAN TÀI CHÍNH ADMIN (Financial Summary Dashboard)
   */
  async getFinancialSummary(timeFilter: string = 'thisMonth') {
    let dateFrom = new Date();
    const now = new Date();

    if (timeFilter === 'today') {
      dateFrom.setHours(0, 0, 0, 0);
    } else if (timeFilter === '7days') {
      dateFrom.setDate(now.getDate() - 7);
    } else if (timeFilter === '30days') {
      dateFrom.setDate(now.getDate() - 30);
    } else {
      // Mặc định tháng này
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const whereTime = {
      createdAt: { gte: dateFrom },
    };

    // 1. Thống kê tổng tiền & hoa hồng
    const paidBookings = await this.prisma.booking.findMany({
      where: {
        ...whereTime,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.PAYMENT_PAID] },
      },
    });

    let totalRevenue = 0;
    let totalCommission = 0;
    let totalPartnerPaidOut = 0;

    paidBookings.forEach((b) => {
      totalRevenue += Number(b.grossAmount);
      totalCommission += Number(b.commissionAmount);
      totalPartnerPaidOut += Number(b.partnerAmount);
    });

    // 2. Thống kê tổng số lượng giao dịch & Đơn đặt
    const [
      successPaymentsCount,
      failedPaymentsCount,
      pendingBookingsCount,
      confirmedBookingsCount,
      payoutErrorBookingsCount,
    ] = await Promise.all([
      this.prisma.payment.count({ where: { ...whereTime, status: PaymentStatus.PAID } }),
      this.prisma.payment.count({ where: { ...whereTime, status: PaymentStatus.PAYMENT_FAILED } }),
      this.prisma.booking.count({ where: { ...whereTime, status: BookingStatus.PENDING_PAYMENT } }),
      this.prisma.booking.count({ where: { ...whereTime, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...whereTime, status: BookingStatus.PAYOUT_ERROR } }),
    ]);

    // 3. Tiền đang chờ Payout (Pending Payouts)
    const pendingPayoutsAggregate = await this.prisma.payout.aggregate({
      where: { status: PayoutStatus.PROCESSING },
      _sum: { amount: true },
    });

    const pendingPayoutAmount = Number(pendingPayoutsAggregate._sum.amount || 0);

    return {
      timeFilter,
      dateFrom,
      summary: {
        totalRevenue,
        totalUserPaid: totalRevenue,
        totalCommission,
        totalPartnerPaidOut,
        pendingPayoutAmount,
      },
      counts: {
        successPaymentsCount,
        failedPaymentsCount,
        pendingBookingsCount,
        confirmedBookingsCount,
        payoutErrorBookingsCount,
      },
    };
  }

  /**
   * DANH SÁCH PAYMENTS CHO ADMIN
   */
  async getPayments(query: { status?: PaymentStatus; provider?: string; search?: string }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.provider) {
      where.provider = query.provider;
    }
    if (query.search) {
      where.OR = [
        { orderId: { contains: query.search, mode: 'insensitive' } },
        { providerTransactionId: { contains: query.search, mode: 'insensitive' } },
        { idempotencyKey: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        booking: {
          include: {
            user: { select: { fullName: true, phone: true } },
            service: { select: { title: true, type: true } },
          },
        },
      },
    });

    return payments.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      bookingId: p.bookingId,
      bookingCode: p.booking?.bookingCode,
      userName: p.booking?.user?.fullName,
      userPhone: p.booking?.user?.phone,
      serviceTitle: p.booking?.service?.title,
      amount: Number(p.amount),
      provider: p.provider,
      status: p.status,
      providerTransactionId: p.providerTransactionId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * AUDIT LOG & PAYMENT EVENTS CHO ADMIN
   */
  async getPaymentEvents(paymentId: string) {
    const events = await this.prisma.paymentEvent.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });

    return events;
  }

  /**
   * DANH SÁCH BOOKINGS CHO ADMIN (KÈM TÌM KIẾM CHI TIẾT)
   */
  async getBookings(query: { status?: BookingStatus; search?: string }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { bookingCode: { contains: query.search, mode: 'insensitive' } },
        { user: { phone: { contains: query.search } } },
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { partner: { businessName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { fullName: true, phone: true } },
        partner: { select: { businessName: true, phone: true } },
        service: { select: { title: true, type: true } },
        payments: true,
        payout: true,
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.user?.fullName,
      customerPhone: b.user?.phone,
      partnerName: b.partner?.businessName,
      serviceTitle: b.service?.title,
      serviceType: b.service?.type,
      grossAmount: Number(b.grossAmount),
      commissionAmount: Number(b.commissionAmount),
      partnerAmount: Number(b.partnerAmount),
      bookingStatus: b.status,
      paymentStatus: b.payments[0]?.status || 'NO_PAYMENT',
      payoutStatus: b.payout?.status || 'NO_PAYOUT',
      createdAt: b.createdAt,
    }));
  }

  /**
   * DANH SÁCH PAYOUTS CHO ADMIN
   */
  async getPayouts(query: { status?: PayoutStatus; partnerId?: string }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.partnerId) {
      where.partnerId = query.partnerId;
    }

    const payouts = await this.prisma.payout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        partner: { select: { businessName: true, bankName: true, bankAccountNo: true } },
        booking: { select: { bookingCode: true, grossAmount: true, commissionAmount: true } },
      },
    });

    return payouts.map((p) => ({
      payoutId: p.id,
      bookingCode: p.booking?.bookingCode,
      partnerName: p.partner?.businessName,
      bankInfo: `${p.partner?.bankName} - ${p.partner?.bankAccountNo}`,
      grossAmount: Number(p.booking?.grossAmount || 0),
      commissionAmount: Number(p.booking?.commissionAmount || 0),
      partnerAmount: Number(p.amount),
      payoutStatus: p.status,
      provider: p.provider,
      retryCount: p.retryCount,
      failureReason: p.failureReason,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * THỬ LẠI PAYOUT BỊ LỖI (ADMIN TRIGGER)
   */
  async retryPayout(payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundException('Không tìm thấy bản ghi Payout');
    }

    if (payout.status === PayoutStatus.SUCCESS) {
      throw new BadRequestException('Giao dịch Payout này đã thành công trước đó');
    }

    this.logger.log(`Admin triggering Retry Payout for PayoutId ${payout.id}...`);
    return this.payoutService.processPayoutForBooking(payout.bookingId);
  }

  /**
   * DASHBOARD ĐỐI SOÁT 3 BÊN (RECONCILIATION DASHBOARD)
   * Provider Webhooks ↔ V-life Database ↔ Partner Payouts
   */
  async getReconciliation() {
    const bookings = await this.prisma.booking.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: { include: { events: true } },
        payout: true,
        partner: { select: { businessName: true } },
      },
    });

    const reconciliationList = bookings.map((b) => {
      const payment = b.payments[0];
      const payout = b.payout;
      const mismatchEvent = payment?.events?.find((e) => e.eventType === 'WEBHOOK_AMOUNT_MISMATCH');

      let recoStatus = 'MATCHED';
      let recoNote = 'Giao dịch và Payout đối soát khớp 100%';

      if (mismatchEvent) {
        recoStatus = 'AMOUNT_MISMATCH';
        recoNote = 'Số tiền ngân hàng chuyển không khớp với giá trị đơn hàng';
      } else if (!payment || payment.status === PaymentStatus.PENDING) {
        if (b.expiresAt < new Date()) {
          recoStatus = 'PAYMENT_MISSING';
          recoNote = 'Quá hạn giữ chỗ chưa nhận được thanh toán từ Ngân hàng';
        } else {
          recoStatus = 'PENDING_REVIEW';
          recoNote = 'Đang chờ khách quét mã VietQR thanh toán';
        }
      } else if (payment.status === PaymentStatus.PAID && (!payout || payout.status === PayoutStatus.FAILED)) {
        recoStatus = 'PAYOUT_MISSING';
        recoNote = 'Đã nhận tiền từ khách nhưng Payout cho đối tác gặp sự cố';
      } else if (payout && payout.retryCount > 1) {
        recoStatus = 'DUPLICATE';
        recoNote = 'Giao dịch Payout đã phải thử lại nhiều lần';
      }

      return {
        bookingId: b.id,
        bookingCode: b.bookingCode,
        partnerName: b.partner?.businessName,
        grossAmount: Number(b.grossAmount),
        commissionAmount: Number(b.commissionAmount),
        partnerAmount: Number(b.partnerAmount),
        paymentStatus: payment?.status || 'NO_PAYMENT',
        payoutStatus: payout?.status || 'NO_PAYOUT',
        bookingStatus: b.status,
        recoStatus,
        recoNote,
        createdAt: b.createdAt,
      };
    });

    return {
      totalAnalyzed: reconciliationList.length,
      matchedCount: reconciliationList.filter((r) => r.recoStatus === 'MATCHED').length,
      issueCount: reconciliationList.filter((r) => r.recoStatus !== 'MATCHED').length,
      items: reconciliationList,
    };
  }

  /**
   * CHI TIẾT TÀI CHÍNH THEO TỪNG PARTNER
   */
  async getPartnerFinanceDetail(partnerId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        balance: true,
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác');
    }

    return partner;
  }
}
