import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPayoutProvider } from './providers/mock-payout.provider';
import { NotificationService } from '../notification/notification.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus, BookingStatus, PayoutStatus, PayoutProvider } from '@prisma/client';

describe('PayoutService - Step 4 Partner Payout Engine Tests', () => {
  let service: PayoutService;
  let prisma: any;
  let mockPayoutProvider: MockPayoutProvider;

  const mockPartner = {
    id: 'partner-1',
    userId: 'partner-user-1',
    businessName: 'Homestay Đà Lạt Oasis',
    phone: '0988777666',
    bankName: 'MB BANK',
    bankCode: 'MB',
    bankAccountNo: '999988887777',
    bankAccountHolder: 'HOMESTAY DA LAT OASIS',
  };

  const mockPaidBooking = {
    id: 'booking-1',
    bookingCode: 'VL202608037777',
    userId: 'user-1',
    partnerId: mockPartner.id,
    serviceId: 'service-1',
    status: BookingStatus.PAYMENT_PAID,
    grossAmount: 5000000,
    commissionRate: 0.25,
    commissionAmount: 1250000,
    partnerAmount: 3750000,
    partner: mockPartner,
    payments: [{ status: PaymentStatus.PAID, amount: 5000000 }],
    payout: null,
  };

  const mockPrismaService = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payout: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    partnerBalance: {
      upsert: jest.fn(),
    },
    partner: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
  };

  const mockNotificationService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        MockPayoutProvider,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
    mockPayoutProvider = module.get<MockPayoutProvider>(MockPayoutProvider);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('1. Luồng hoàn chỉnh: Payment PAID ➔ Payout SUCCESS ➔ PartnerBalance +4.5tr ➔ Booking CONFIRMED', async () => {
    mockPrismaService.booking.findUnique.mockResolvedValue(mockPaidBooking);
    mockPrismaService.payout.create.mockResolvedValue({
      id: 'payout-1',
      status: PayoutStatus.PROCESSING,
      amount: 3750000,
    });
    mockPrismaService.payout.update.mockResolvedValue({
      id: 'payout-1',
      status: PayoutStatus.SUCCESS,
      amount: 3750000,
    });
    mockPrismaService.partnerBalance.upsert.mockResolvedValue({
      availableBalance: 3750000,
      totalRevenue: 5000000,
    });
    mockPrismaService.booking.update.mockResolvedValue({
      ...mockPaidBooking,
      status: BookingStatus.CONFIRMED,
    });

    const result = await service.processPayoutForBooking('booking-1');

    expect(result.success).toBe(true);
    expect(result.payoutStatus).toBe(PayoutStatus.SUCCESS);
    expect(result.bookingStatus).toBe(BookingStatus.CONFIRMED);
    expect(mockPrismaService.partnerBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          availableBalance: { increment: 3750000 },
          totalRevenue: { increment: 5000000 },
          totalCommission: { increment: 1250000 },
          totalPaidOut: { increment: 3750000 },
        }),
      }),
    );
  });

  it('2. Chặn Payout nếu Payment chưa PAID: Ném lỗi BadRequestException', async () => {
    const unPaidBooking = {
      ...mockPaidBooking,
      payments: [{ status: PaymentStatus.PENDING, amount: 5000000 }],
    };

    mockPrismaService.booking.findUnique.mockResolvedValue(unPaidBooking);

    await expect(service.processPayoutForBooking('booking-1')).rejects.toThrow(BadRequestException);
    expect(mockPrismaService.payout.create).not.toHaveBeenCalled();
  });

  it('3. Chống Payout trùng (Idempotency): Nếu Payout đã SUCCESS thì không cộng tiền Ví lần 2', async () => {
    const alreadySuccessBooking = {
      ...mockPaidBooking,
      payout: {
        id: 'payout-1',
        status: PayoutStatus.SUCCESS,
        amount: 3750000,
      },
    };

    mockPrismaService.booking.findUnique.mockResolvedValue(alreadySuccessBooking);

    const result = await service.processPayoutForBooking('booking-1');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Idempotent');
    // Không được gọi cộng ví lần 2!
    expect(mockPrismaService.partnerBalance.upsert).not.toHaveBeenCalled();
  });

  it('4. Payout FAILED: Chuyển Booking sang PAYOUT_ERROR & Không xác nhận đơn', async () => {
    mockPrismaService.booking.findUnique.mockResolvedValue(mockPaidBooking);
    mockPrismaService.payout.create.mockResolvedValue({
      id: 'payout-failed-1',
      status: PayoutStatus.PROCESSING,
      amount: 3750000,
    });

    // Giả lập Provider Payout báo lỗi
    jest.spyOn(mockPayoutProvider, 'executePayout').mockResolvedValueOnce({
      isSuccess: false,
      failureReason: 'Tài khoản ngân hàng đối tác không tồn tại',
    });

    mockPrismaService.payout.update.mockResolvedValue({
      id: 'payout-failed-1',
      status: PayoutStatus.FAILED,
      retryCount: 1,
      failureReason: 'Tài khoản ngân hàng đối tác không tồn tại',
    });
    mockPrismaService.booking.update.mockResolvedValue({
      ...mockPaidBooking,
      status: BookingStatus.PAYOUT_ERROR,
    });

    const result = await service.processPayoutForBooking('booking-1');

    expect(result.success).toBe(false);
    expect(result.payoutStatus).toBe(PayoutStatus.FAILED);
    expect(result.bookingStatus).toBe(BookingStatus.PAYOUT_ERROR);
    // Ví đối tác KHÔNG được cộng
    expect(mockPrismaService.partnerBalance.upsert).not.toHaveBeenCalled();
  });
});
