import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, ServiceType } from '@prisma/client';

@Injectable()
export class TravelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tạo đơn đặt dịch vụ (Booking)
   * Tự động tính toán tổng tiền & hoa hồng hoàn toàn trên Server
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    // 1. Kiểm tra dịch vụ có tồn tại & đang hoạt động không
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { partner: true },
    });

    if (!service) {
      throw new NotFoundException('Dịch vụ không tồn tại');
    }

    if (!service.isAvailable || (service.partner && !service.partner.isActive)) {
      throw new BadRequestException('Dịch vụ hoặc đối tác đang tạm ngưng hoạt động');
    }

    // 2. Tính toán thời gian & tổng tiền (Gross Amount) hoàn toàn trên Server
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const now = new Date();

    if (start < now && Math.abs(start.getTime() - now.getTime()) > 5 * 60 * 1000) {
      throw new BadRequestException('Ngày bắt đầu không được ở quá khứ');
    }

    if (end <= start) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Tính số ngày / đêm (tối thiểu 1 ngày)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const basePriceNum = Number(service.basePrice);
    const grossAmount = basePriceNum * durationDays;

    // 3. Lấy tỷ lệ hoa hồng V-life (Server config hoặc mặc định 10%)
    const commissionRate = service.partner?.commissionRate
      ? Number(service.partner.commissionRate)
      : 0.25;
    const commissionAmount = Math.round(grossAmount * commissionRate);
    const partnerAmount = grossAmount - commissionAmount;

    // 4. Đọc thời gian giữ chỗ TTL từ SystemConfig hoặc mặc định 10 phút
    const holdConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'HOLD_TTL_MINUTES' },
    });
    const holdMinutes = holdConfig ? parseInt(holdConfig.value, 10) : 10;
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    // 5. Sinh mã BookingCode duy nhất (Ví dụ: VL202608031234)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `VL${dateStr}${randomSuffix}`;

    // 6. Thực thi Prisma Transaction khởi tạo Booking
    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          partnerId: service.partnerId,
          serviceId: service.id,
          status: BookingStatus.PENDING_PAYMENT,
          grossAmount,
          commissionRate,
          commissionAmount,
          partnerAmount,
          startDate: start,
          endDate: end,
          expiresAt,
        },
        include: {
          service: true,
          partner: true,
        },
      });

      return {
        message: 'Tạo đơn đặt thành công. Vui lòng thanh toán trước khi hết hạn.',
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          serviceTitle: booking.service.title,
          serviceType: booking.service.type,
          partnerName: booking.partner.businessName,
          status: booking.status,
          grossAmount: Number(booking.grossAmount),
          startDate: booking.startDate,
          endDate: booking.endDate,
          expiresAt: booking.expiresAt,
          createdAt: booking.createdAt,
          partnerId: booking.partnerId,
        },
      };
    });

    // 7. Gửi Notification sau khi transaction hoàn thành
    await Promise.allSettled([
      // Thông báo cho USER
      this.notificationService.createNotification({
        recipientId: userId,
        recipientType: 'USER',
        title: `Đã tạo đơn đặt dịch vụ #${bookingCode}`,
        body: `Vui lòng thanh toán trước ${new Date(expiresAt).toLocaleTimeString('vi-VN')} để giữ chỗ.`,
        data: { bookingId: result.booking.id, bookingCode },
        eventKey: `BOOKING_CREATED_${bookingCode}`,
      }),
      // Thông báo cho PARTNER
      this.notificationService.createNotification({
        recipientId: result.booking.partnerId,
        recipientType: 'PARTNER',
        title: 'Bạn có đơn đặt dịch vụ mới',
        body: `Đơn #${bookingCode} đang chờ thanh toán từ khách hàng.`,
        data: { bookingId: result.booking.id, bookingCode },
        eventKey: `BOOKING_NEW_PARTNER_${bookingCode}`,
      }),
    ]);

    return result;
  }

  /**
   * Chi tiết đơn đặt dịch vụ (Kiểm tra quyền sở hữu)
   */
  async getBookingById(userId: string, bookingIdOrCode: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingIdOrCode }, { bookingCode: bookingIdOrCode }],
      },
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

    // Kiểm tra ownership: Người xem phải là người đặt đơn
    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập đơn đặt của người khác');
    }

    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      service: {
        id: booking.service.id,
        title: booking.service.title,
        type: booking.service.type,
        description: booking.service.description,
      },
      partner: {
        businessName: booking.partner.businessName,
        phone: booking.partner.phone,
      },
      grossAmount: Number(booking.grossAmount),
      startDate: booking.startDate,
      endDate: booking.endDate,
      expiresAt: booking.expiresAt,
      payments: booking.payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        amount: Number(p.amount),
        provider: p.provider,
        status: p.status,
        createdAt: p.createdAt,
      })),
      createdAt: booking.createdAt,
    };
  }
}
