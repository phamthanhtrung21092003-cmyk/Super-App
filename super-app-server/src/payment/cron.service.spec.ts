import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

describe('CronService - Step 8 Automated Hold TTL Expiration Tests', () => {
  let service: CronService;
  let prisma: any;

  const mockExpiredBooking = {
    id: 'booking-expired-1',
    bookingCode: 'VL20260803EX01',
    status: BookingStatus.PENDING_PAYMENT,
    expiresAt: new Date(Date.now() - 15 * 60 * 1000), // Lapsed 15 mins ago
    serviceId: 'service-1',
    service: { id: 'service-1', isAvailable: false },
    payments: [{ id: 'pay-expired-1', status: PaymentStatus.PENDING }],
  };

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
    },
    service: {
      update: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('1. Đơn hết hạn (expiresAt < NOW): Cập nhật Booking=CANCELLED, Payment=PAYMENT_EXPIRED & Giải phóng Dịch vụ', async () => {
    mockPrismaService.booking.findMany.mockResolvedValue([mockExpiredBooking]);
    mockPrismaService.booking.findUnique.mockResolvedValue(mockExpiredBooking);

    const result = await service.handleExpiredHoldBookings();

    expect(result.expiredCount).toBe(1);
    expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
      where: { id: mockExpiredBooking.id },
      data: { status: BookingStatus.CANCELLED },
    });
    expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-expired-1' },
      data: { status: PaymentStatus.PAYMENT_EXPIRED },
    });
    expect(mockPrismaService.paymentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'HOLD_TTL_EXPIRED',
        }),
      }),
    );
  });

  it('2. Đơn chưa hết hạn hoặc không có đơn hết hạn: Không thay đổi dữ liệu', async () => {
    mockPrismaService.booking.findMany.mockResolvedValue([]);

    const result = await service.handleExpiredHoldBookings();

    expect(result.expiredCount).toBe(0);
    expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    expect(mockPrismaService.payment.update).not.toHaveBeenCalled();
  });

  it('3. An toàn Concurrency: Nếu Webhook vừa đổi đơn sang PAYMENT_PAID -> Cron tự động bỏ qua', async () => {
    mockPrismaService.booking.findMany.mockResolvedValue([mockExpiredBooking]);
    // Giả lập Webhook đã đổi status sang PAYMENT_PAID ngay trước khi Cron chạy
    mockPrismaService.booking.findUnique.mockResolvedValue({
      ...mockExpiredBooking,
      status: BookingStatus.PAYMENT_PAID,
    });

    const result = await service.handleExpiredHoldBookings();

    expect(result.expiredCount).toBe(0);
    expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    expect(mockPrismaService.payment.update).not.toHaveBeenCalled();
  });
});
