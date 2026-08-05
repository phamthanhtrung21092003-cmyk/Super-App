import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { VietQrWebhookProvider } from './providers/vietqr-webhook.provider';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentProvider, PaymentStatus, BookingStatus, PayoutStatus } from '@prisma/client';

describe('PaymentService - Step 3 & 4 Webhook, Idempotency & Payout Trigger Tests', () => {
  let service: PaymentService;
  let prisma: any;

  const mockUser1 = 'user-uuid-1111';

  const mockBooking = {
    id: 'booking-uuid-1',
    bookingCode: 'VL202608039999',
    userId: mockUser1,
    status: BookingStatus.PENDING_PAYMENT,
    grossAmount: 3500000,
    commissionRate: 0.25,
    commissionAmount: 875000,
    partnerAmount: 2625000,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    partner: {
      bankName: 'MB BANK',
      bankCode: 'MB',
      bankAccountNo: '0912345678',
      bankAccountHolder: 'SUPER APP TRAVEL V-LIFE',
    },
    service: {
      title: 'Tour Sapa 3N2Đ',
    },
    payments: [],
    commission: null,
  };

  const mockPendingPayment = {
    id: 'pay-uuid-1',
    orderId: 'VL202608039999',
    bookingId: 'booking-uuid-1',
    amount: 3500000,
    currency: 'VND',
    provider: PaymentProvider.VIETQR,
    status: PaymentStatus.PENDING,
    booking: mockBooking,
  };

  const mockPrismaService = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    commission: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (arg) => {
      if (typeof arg === 'function') {
        return arg(mockPrismaService);
      }
      return Promise.all(arg);
    }),
  };

  const mockPayoutService = {
    processPayoutForBooking: jest.fn().mockResolvedValue({
      success: true,
      bookingStatus: BookingStatus.CONFIRMED,
      payoutStatus: PayoutStatus.SUCCESS,
    }),
  };

  const mockNotificationService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        VietQrWebhookProvider,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PayoutService, useValue: mockPayoutService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('1. Webhook thanh toán thành công: Cập nhật Payment=PAID & Tự động Kích hoạt Partner Payout Engine', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);
    mockPrismaService.payment.update.mockResolvedValue({
      ...mockPendingPayment,
      status: PaymentStatus.PAID,
    });
    mockPrismaService.booking.update.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.PAYMENT_PAID,
    });

    const result = await service.processWebhook(
      {},
      {
        orderId: 'VL202608039999',
        providerTransactionId: 'FT202608038888',
        amount: 3500000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    expect(mockPrismaService.payment.update).toHaveBeenCalled();
    expect(mockPrismaService.booking.update).toHaveBeenCalled();
    expect(mockPayoutService.processPayoutForBooking).toHaveBeenCalledWith('booking-uuid-1');
  });

  it('2. Chống Webhook lặp (Idempotency): Nếu Payment đã PAID thì không xử lý lại transaction', async () => {
    const paidPayment = {
      ...mockPendingPayment,
      status: PaymentStatus.PAID,
      booking: {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      },
    };

    mockPrismaService.payment.findFirst.mockResolvedValue(paidPayment);

    const result = await service.processWebhook(
      {},
      {
        orderId: 'VL202608039999',
        providerTransactionId: 'FT202608038888',
        amount: 3500000,
      },
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('Idempotent');
    expect(mockPrismaService.payment.update).not.toHaveBeenCalled();
    expect(mockPayoutService.processPayoutForBooking).not.toHaveBeenCalled();
  });

  it('3. Đối chiếu số tiền không khớp (Amount Mismatch): Chuyển PaymentStatus=PAYMENT_FAILED & Báo lỗi', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);

    await expect(
      service.processWebhook(
        {},
        {
          orderId: 'VL202608039999',
          providerTransactionId: 'FT202608038888',
          amount: 2000000,
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrismaService.paymentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'WEBHOOK_AMOUNT_MISMATCH',
        }),
      }),
    );
  });

  it('4. Mã đơn không tồn tại (Unknown OrderId): Ném lỗi NotFoundException', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(null);

    await expect(
      service.processWebhook(
        {},
        {
          orderId: 'UNKNOWN_ORDER',
          providerTransactionId: 'FT999',
          amount: 3500000,
        },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('5. Webhook báo thanh toán thất bại từ Ngân hàng: Chuyển PaymentStatus=PAYMENT_FAILED', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);

    const result = await service.processWebhook(
      {},
      {
        orderId: 'VL202608039999',
        providerTransactionId: 'FT202608038888',
        amount: 3500000,
        status: 'FAILED',
      },
    );

    expect(result.success).toBe(false);
    expect(result.paymentStatus).toBe(PaymentStatus.PAYMENT_FAILED);
  });
});
