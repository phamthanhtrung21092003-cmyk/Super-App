import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, BookingStatus, PayoutStatus, PayoutProvider } from '@prisma/client';
import { MockPayoutProvider } from './providers/mock-payout.provider';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockPayoutProvider: MockPayoutProvider,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * XỬ LÝ PAYOUT CHO ĐỐI TÁC (Tự động thực thi khi Payment = PAID)
   * Luồng: Payment PAID ➔ Payout PROCESSING ➔ Payout SUCCESS ➔ PartnerBalance Updated ➔ Booking CONFIRMED
   */
  async processPayoutForBooking(bookingId: string) {
    // 1. Tìm Booking cùng các quan hệ Payment, Partner, PartnerBalance, Payout
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
        partner: {
          include: {
            balance: true,
          },
        },
        payout: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt hàng để Payout');
    }

    // 2. KIỂM TRA THANH TOÁN: Chỉ Payout khi có ít nhất 1 Payment ở trạng thái PAID
    const paidPayment = booking.payments.find((p) => p.status === PaymentStatus.PAID);

    if (!paidPayment) {
      this.logger.warn(`Cannot process Payout for Booking ${booking.bookingCode}: Payment is not PAID.`);
      throw new BadRequestException('Không thể thực hiện Payout vì đơn hàng chưa được thanh toán (PAID)');
    }

    // 3. IDEMPOTENCY CHECK: Nếu Payout đã SUCCESS trước đó -> Trả về kết quả ngay (Không cộng lại số dư)
    if (booking.payout && booking.payout.status === PayoutStatus.SUCCESS) {
      this.logger.log(`Payout for Booking ${booking.bookingCode} already SUCCESS (Idempotent).`);
      return {
        success: true,
        message: 'Giao dịch Payout cho đơn hàng này đã thành công trước đó (Idempotent)',
        payout: booking.payout,
        bookingStatus: booking.status,
      };
    }

    const partnerAmountNum = Number(booking.partnerAmount);
    const grossAmountNum = Number(booking.grossAmount);
    const commissionAmountNum = Number(booking.commissionAmount);
    const idempotencyKey = `PAYOUT_${booking.id}`;

    // 4. KHỞI TẠO HOẶC LẤY BẢN GHI PAYOUT (STATUS = PROCESSING)
    let payout = booking.payout;

    if (!payout) {
      payout = await this.prisma.payout.create({
        data: {
          partnerId: booking.partnerId,
          bookingId: booking.id,
          amount: partnerAmountNum,
          provider: PayoutProvider.BANK_TRANSFER_247,
          status: PayoutStatus.PROCESSING,
          idempotencyKey,
        },
      });
    } else if (payout.status !== PayoutStatus.PROCESSING) {
      payout = await this.prisma.payout.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.PROCESSING },
      });
    }

    // Cập nhật tạm thời Booking sang PAYOUT_PROCESSING
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.PAYOUT_PROCESSING },
    });

    // 5. THỰC THI CHUYỂN TIỀN QUA PROVIDER ABSTRACTION
    const payoutResult = await this.mockPayoutProvider.executePayout({
      payoutId: payout.id,
      bookingCode: booking.bookingCode,
      partnerId: booking.partnerId,
      bankName: booking.partner.bankName,
      bankCode: booking.partner.bankCode,
      bankAccountNo: booking.partner.bankAccountNo,
      bankAccountHolder: booking.partner.bankAccountHolder,
      amount: partnerAmountNum,
    });

    // 6. XỬ LÝ KẾT QUẢ PAYOUT (ATOMIC TRANSACTION BOUNDARY)
    if (payoutResult.isSuccess) {
      return this.prisma.$transaction(async (tx) => {
        // 6.1 Cập nhật Payout = SUCCESS
        const updatedPayout = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.SUCCESS,
            failureReason: null,
          },
        });

        // 6.2 Cập nhật Ví Đối tác (PartnerBalance) - Đảm bảo chỉ cộng 1 lần duy nhất
        const partnerBalance = await tx.partnerBalance.upsert({
          where: { partnerId: booking.partnerId },
          create: {
            partnerId: booking.partnerId,
            availableBalance: partnerAmountNum,
            totalRevenue: grossAmountNum,
            totalCommission: commissionAmountNum,
            totalPaidOut: partnerAmountNum,
          },
          update: {
            availableBalance: { increment: partnerAmountNum },
            totalRevenue: { increment: grossAmountNum },
            totalCommission: { increment: commissionAmountNum },
            totalPaidOut: { increment: partnerAmountNum },
          },
        });

        // 6.3 CHỈ CHUYỂN BOOKING = CONFIRMED KHI PAYOUT = SUCCESS!
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED },
        });

        this.logger.log(
          `Payout SUCCESS for Booking ${booking.bookingCode}. Booking = CONFIRMED. Partner Balance credited: +${partnerAmountNum} VND.`,
        );

        // Notification cho PARTNER: Payout thành công
        this.notificationService.createNotification({
          recipientId: booking.partnerId,
          recipientType: 'PARTNER',
          title: 'Bạn đã nhận được tiền',
          body: `Payout đơn #${booking.bookingCode} thành công. Số tiền: +${partnerAmountNum.toLocaleString()}đ`,
          data: { bookingId: booking.id, bookingCode: booking.bookingCode, amount: partnerAmountNum },
          eventKey: `PAYOUT_SUCCESS_PARTNER_${booking.id}`,
        }).catch(() => {});

        return {
          success: true,
          message: 'Payout đối tác thành công. Đơn hàng chính thức được XÁC NHẬN (CONFIRMED).',
          payoutId: updatedPayout.id,
          payoutStatus: updatedPayout.status,
          bookingStatus: updatedBooking.status,
          partnerBalance: {
            availableBalance: Number(partnerBalance.availableBalance),
            totalRevenue: Number(partnerBalance.totalRevenue),
          },
        };
      });
    } else {
      // 7. PAYOUT FAILED -> CHUYỂN BOOKING = PAYOUT_ERROR & GHI NHẬN LỖI ĐỂ RETRY
      return this.prisma.$transaction(async (tx) => {
        const updatedPayout = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.FAILED,
            retryCount: { increment: 1 },
            failureReason: payoutResult.failureReason || 'Lỗi chuyển khoản Payout từ phía Ngân hàng',
          },
        });

        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.PAYOUT_ERROR },
        });

        this.logger.error(`Payout FAILED for Booking ${booking.bookingCode}. Booking = PAYOUT_ERROR.`);

        // Notification cho PARTNER: Payout thất bại
        this.notificationService.createNotification({
          recipientId: booking.partnerId,
          recipientType: 'PARTNER',
          title: `Payout của đơn #${booking.bookingCode} đang gặp lỗi`,
          body: `V-life sẽ xử lý và thử lại chuyển khoản cho bạn. Vui lòng chờ.`,
          data: { bookingId: booking.id, failureReason: payoutResult.failureReason },
          eventKey: `PAYOUT_FAILED_PARTNER_${booking.id}`,
        }).catch(() => {});

        // Notification cho ADMIN: Payout thất bại cần xử lý
        this.notificationService.createNotification({
          recipientId: 'ADMIN',
          recipientType: 'ADMIN',
          title: '⚠️ Payout thất bại cần xử lý',
          body: `Payout đơn #${booking.bookingCode} thất bại: ${payoutResult.failureReason}`,
          data: { bookingId: booking.id, bookingCode: booking.bookingCode },
          eventKey: `PAYOUT_FAILED_ADMIN_${booking.id}`,
        }).catch(() => {});

        return {
          success: false,
          message: 'Payout đối tác thất bại. Đơn hàng chuyển sang trạng thái PAYOUT_ERROR để xử lý lại.',
          payoutId: updatedPayout.id,
          payoutStatus: updatedPayout.status,
          retryCount: updatedPayout.retryCount,
          failureReason: updatedPayout.failureReason,
          bookingStatus: updatedBooking.status,
        };
      });
    }
  }

  /**
   * THỬ LẠI PAYOUT CHO ĐỐI TÁC (RETRY PAYOUT)
   */
  async retryPayout(partnerUserId: string, payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        partner: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Không tìm thấy bản ghi Payout');
    }

    if (payout.partner.userId && payout.partner.userId !== partnerUserId) {
      throw new ForbiddenException('Bạn không có quyền thử lại Payout của đối tác khác');
    }

    if (payout.status === PayoutStatus.SUCCESS) {
      throw new BadRequestException('Giao dịch Payout này đã thành công trước đó, không cần thử lại');
    }

    this.logger.log(`Retrying Payout ${payout.id} (Attempt #${payout.retryCount + 1})...`);
    return this.processPayoutForBooking(payout.bookingId);
  }

  /**
   * LẤY BÁO CÁO TÀI CHÍNH ĐỐI TÁC (PARTNER FINANCE API)
   */
  async getPartnerFinance(userId: string) {
    const partner = await this.prisma.partner.findFirst({
      where: {
        OR: [{ userId }, { phone: userId }],
      },
      include: {
        balance: true,
        payouts: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                bookingCode: true,
                grossAmount: true,
                commissionAmount: true,
                partnerAmount: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác');
    }

    const balance = partner.balance || {
      availableBalance: 0,
      pendingBalance: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalPaidOut: 0,
    };

    return {
      partnerId: partner.id,
      businessName: partner.businessName,
      bankInfo: {
        bankName: partner.bankName,
        bankCode: partner.bankCode,
        bankAccountNo: partner.bankAccountNo,
        bankAccountHolder: partner.bankAccountHolder,
      },
      balance: {
        availableBalance: Number(balance.availableBalance),
        pendingBalance: Number(balance.pendingBalance),
        totalRevenue: Number(balance.totalRevenue),
        totalCommission: Number(balance.totalCommission),
        totalPaidOut: Number(balance.totalPaidOut),
      },
      recentPayouts: partner.payouts.map((p) => ({
        payoutId: p.id,
        bookingCode: p.booking?.bookingCode,
        amount: Number(p.amount),
        status: p.status,
        provider: p.provider,
        failureReason: p.failureReason,
        createdAt: p.createdAt,
      })),
    };
  }
}
