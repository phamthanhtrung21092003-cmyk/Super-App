import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutService } from '../payout/payout.service';
import { PaymentStatus, BookingStatus, PayoutStatus } from '@prisma/client';

describe('AdminService - Step 7 Reconciliation & Financial Dashboard Tests', () => {
  let service: AdminService;
  let prisma: any;
  let payoutService: any;

  const mockBookings = [
    {
      id: 'b-1',
      bookingCode: 'VL202608030001',
      status: BookingStatus.CONFIRMED,
      grossAmount: 10000000,
      commissionAmount: 1000000,
      partnerAmount: 9000000,
      partner: { businessName: 'Vinpearl Resort Phú Quốc' },
      payments: [{ status: PaymentStatus.PAID, events: [] }],
      payout: { status: PayoutStatus.SUCCESS, retryCount: 0 },
      createdAt: new Date(),
    },
    {
      id: 'b-2',
      bookingCode: 'VL202608030002',
      status: BookingStatus.PAYOUT_ERROR,
      grossAmount: 4000000,
      commissionAmount: 400000,
      partnerAmount: 3600000,
      partner: { businessName: 'Homestay Đà Lạt' },
      payments: [{ status: PaymentStatus.PAID, events: [] }],
      payout: { status: PayoutStatus.FAILED, retryCount: 1 },
      createdAt: new Date(),
    },
  ];

  const mockPrismaService = {
    booking: {
      findMany: jest.fn().mockResolvedValue(mockBookings),
      count: jest.fn().mockResolvedValue(5),
    },
    payment: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(10),
    },
    payout: {
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 3600000 } }),
      findUnique: jest.fn(),
    },
    paymentEvent: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    partner: {
      findUnique: jest.fn(),
    },
  };

  const mockPayoutService = {
    processPayoutForBooking: jest.fn().mockResolvedValue({
      success: true,
      bookingStatus: BookingStatus.CONFIRMED,
      payoutStatus: PayoutStatus.SUCCESS,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PayoutService, useValue: mockPayoutService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
    payoutService = module.get<PayoutService>(PayoutService);

    jest.clearAllMocks();
  });

  it('1. Báo cáo tổng quan tài chính Admin: Tính đúng tổng doanh thu, hoa hồng & tiền đã Payout', async () => {
    const result = await service.getFinancialSummary('today');

    expect(result.summary.totalRevenue).toBe(14000000); // 10tr + 4tr
    expect(result.summary.totalCommission).toBe(1400000); // 1tr + 400k
    expect(result.summary.totalPartnerPaidOut).toBe(12600000); // 9tr + 3.6tr
    expect(result.summary.pendingPayoutAmount).toBe(3600000);
  });

  it('2. Dashboard đối soát 3 bên (Reconciliation): Phân loại chuẩn MATCHED vs PAYOUT_MISSING', async () => {
    const result = await service.getReconciliation();

    expect(result.totalAnalyzed).toBe(2);
    expect(result.matchedCount).toBe(1); // booking b-1
    expect(result.issueCount).toBe(1); // booking b-2 (PAYOUT_MISSING/FAILED)

    const issueItem = result.items.find((i) => i.bookingId === 'b-2');
    expect(issueItem?.recoStatus).toBe('PAYOUT_MISSING');
  });

  it('3. Admin Retry Payout: Gọi PayoutService thử lại giao dịch thất bại', async () => {
    mockPrismaService.payout.findUnique.mockResolvedValue({
      id: 'payout-2',
      bookingId: 'b-2',
      status: PayoutStatus.FAILED,
    });

    const result = await service.retryPayout('payout-2');

    expect(result.success).toBe(true);
    expect(mockPayoutService.processPayoutForBooking).toHaveBeenCalledWith('b-2');
  });
});
