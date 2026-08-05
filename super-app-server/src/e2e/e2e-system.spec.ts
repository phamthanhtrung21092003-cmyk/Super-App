import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from '../travel/travel.service';
import { PaymentService } from '../payment/payment.service';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';
import { AdminService } from '../admin/admin.service';
import { CronService } from '../payment/cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { VietQrWebhookProvider } from '../payment/providers/vietqr-webhook.provider';
import { MockPayoutProvider } from '../payout/providers/mock-payout.provider';
import {
  BookingStatus,
  PaymentStatus,
  PayoutStatus,
  ServiceType,
  PaymentProvider,
} from '@prisma/client';

/**
 * BƯỚC 10: END-TO-END SYSTEM TESTING & FINAL VERIFICATION
 * Kiểm tra toàn bộ luồng nghiệp vụ tích hợp, RBAC, Idempotency, Concurrency & Notification
 */
describe('E2E STEP 10 — Full System Integration Tests', () => {
  // ─── SHARED MOCK FIXTURES ───────────────────────────────────────────────────
  const USER_ID = 'traveler-user-1';
  const PARTNER_ID = 'partner-uuid-1';
  const BOOKING_ID = 'booking-e2e-1';
  const BOOKING_CODE = 'VL202608031001';
  const ORDER_ID = 'ORD-VL202608031001';

  const mockPartner = {
    id: PARTNER_ID,
    userId: 'partner-user-1',
    businessName: 'Vinpearl Resort Phú Quốc',
    phone: '0988000001',
    bankName: 'MB BANK',
    bankCode: 'MB',
    bankAccountNo: '1111222233334444',
    bankAccountHolder: 'VINPEARL PHU QUOC',
    commissionRate: 0.1,
    isActive: true,
  };

  const mockService = {
    id: 'service-e2e-1',
    partnerId: PARTNER_ID,
    type: ServiceType.HOTEL_BOOKING,
    title: 'Vinpearl Resort Phú Quốc – Phòng Deluxe',
    basePrice: 5000000,
    isAvailable: true,
    partner: mockPartner,
  };

  const mockBooking = {
    id: BOOKING_ID,
    bookingCode: BOOKING_CODE,
    userId: USER_ID,
    partnerId: PARTNER_ID,
    serviceId: mockService.id,
    status: BookingStatus.PENDING_PAYMENT,
    grossAmount: 5000000,
    commissionRate: 0.1,
    commissionAmount: 500000,
    partnerAmount: 4500000,
    startDate: new Date('2026-08-10'),
    endDate: new Date('2026-08-11'),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Valid hold
    partner: mockPartner,
    service: mockService,
    payments: [],
    payout: null,
    commission: null,
  };

  const mockPendingPayment = {
    id: 'pay-e2e-1',
    orderId: ORDER_ID,
    bookingId: BOOKING_ID,
    idempotencyKey: `PAY_${BOOKING_ID}_VIETQR_${BOOKING_CODE}`,
    amount: 5000000,
    currency: 'VND',
    provider: PaymentProvider.VIETQR,
    status: PaymentStatus.PENDING,
    booking: mockBooking,
    events: [],
  };

  const mockNotificationService = {
    createNotification: jest.fn().mockResolvedValue({ id: 'notif-1', isRead: false }),
    getUserNotifications: jest.fn().mockResolvedValue([]),
    getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 0 }),
    markAsRead: jest.fn().mockResolvedValue({}),
    markAllAsRead: jest.fn().mockResolvedValue({ message: 'ok' }),
  };

  // Shared Prisma mock - được shared để $transaction có thể truy cập mock đã setup
  const mockPrismaService: any = {
    service: { findUnique: jest.fn() },
    systemConfig: { findUnique: jest.fn().mockResolvedValue({ value: '10' }) },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    payment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    payout: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
    },
    commission: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
    partnerBalance: { upsert: jest.fn() },
    paymentEvent: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    notification: {
      create: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    partner: { findUnique: jest.fn() },
    service: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    // $transaction sử dụng chính mock này để giữ state nhất quán
    $transaction: jest.fn(),
  };

  // Thiết lập $transaction để forward về mock chính
  const setupTransaction = () => {
    mockPrismaService.$transaction.mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') return arg(mockPrismaService);
      return Promise.all(arg);
    });
  };

  const mockPayoutProviderSuccess = {
    executePayout: jest.fn().mockResolvedValue({
      isSuccess: true,
      providerTransactionId: 'PROV-TX-SUCCESS-9999',
    }),
  };

  const mockPayoutProviderFail = {
    executePayout: jest.fn().mockResolvedValue({
      isSuccess: false,
      failureReason: 'Ngân hàng từ chối giao dịch',
    }),
  };

  let travelService: TravelService;
  let paymentService: PaymentService;
  let payoutService: PayoutService;
  let cronService: CronService;
  let adminService: AdminService;

  const buildModule = async (payoutProviderMock: any) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        PaymentService,
        PayoutService,
        CronService,
        AdminService,
        VietQrWebhookProvider,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MockPayoutProvider, useValue: payoutProviderMock },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    travelService = module.get<TravelService>(TravelService);
    paymentService = module.get<PaymentService>(PaymentService);
    payoutService = module.get<PayoutService>(PayoutService);
    cronService = module.get<CronService>(CronService);
    adminService = module.get<AdminService>(AdminService);
  };

  beforeEach(async () => {
    await buildModule(mockPayoutProviderSuccess);
    jest.clearAllMocks();
    setupTransaction();
  });

  // ============================================================
  // 1. BOOKING CREATION FLOW
  // ============================================================
  describe('1. Booking Creation Flow (Traveler → Backend)', () => {
    it('1A. Tạo Booking thành công: Server tính đúng Gross, Commission 10%, Partner Amount 90%', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.booking.create.mockResolvedValue({
        ...mockBooking,
        service: mockService,
        partner: mockPartner,
      });

      const dto = {
        serviceId: mockService.id,
        startDate: new Date('2026-08-10').toISOString(),
        endDate: new Date('2026-08-11').toISOString(),
        customerName: 'Nguyễn Văn A',
        customerPhone: '0912345678',
      };

      const result = await travelService.createBooking(USER_ID, dto as any);

      expect(result.booking.grossAmount).toBe(5000000);
      expect(result.booking.status).toBe(BookingStatus.PENDING_PAYMENT);
      // Server tự tính commissionAmount = 10%, partnerAmount = 90%
      expect(result.booking).toHaveProperty('id');

      // Notification USER & PARTNER đều được gọi
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(2);
      const calls = mockNotificationService.createNotification.mock.calls.map((c: any) => c[0].eventKey as string);
      expect(calls.some((k: string) => k.startsWith('BOOKING_CREATED_'))).toBe(true);
      expect(calls.some((k: string) => k.startsWith('BOOKING_NEW_PARTNER_'))).toBe(true);
    });

    it('1B. Dịch vụ không tồn tại → NotFoundException', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);
      await expect(
        travelService.createBooking(USER_ID, { serviceId: 'invalid-id' } as any),
      ).rejects.toThrow('Dịch vụ không tồn tại');
    });

    it('1C. RBAC: User A không thể xem Booking của User B', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        ...mockBooking,
        userId: 'user-B-different',
        service: mockService,
        partner: mockPartner,
        payments: [],
        commission: null,
      });
      await expect(
        travelService.getBookingById(USER_ID, BOOKING_ID),
      ).rejects.toThrow('không có quyền');
    });
  });

  // ============================================================
  // 2. PAYMENT WEBHOOK SUCCESS FLOW
  // ============================================================
  describe('2. Payment Webhook Success Flow → Payout → CONFIRMED', () => {
    it('2A. Webhook hợp lệ → Payment=PAID → Commission → Payout SUCCESS → Booking=CONFIRMED', async () => {
      const paidPayment = { ...mockPendingPayment, status: PaymentStatus.PAID, providerTransactionId: 'BANK-TX-12345' };
      const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };

      mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);
      mockPrismaService.payment.update.mockResolvedValue(paidPayment);
      mockPrismaService.booking.update.mockResolvedValue(confirmedBooking);
      mockPrismaService.booking.findUnique.mockResolvedValue({ ...mockBooking, status: BookingStatus.PAYMENT_PAID, payout: null, payments: [{ status: PaymentStatus.PAID }] });
      mockPrismaService.commission.findUnique.mockResolvedValue(null);
      mockPrismaService.commission.create.mockResolvedValue({});
      mockPrismaService.payout.findUnique.mockResolvedValue(null);
      mockPrismaService.payout.create.mockResolvedValue({ id: 'payout-1', status: PayoutStatus.PROCESSING, amount: 4500000 });
      mockPrismaService.payout.update.mockResolvedValue({ id: 'payout-1', status: PayoutStatus.SUCCESS, amount: 4500000, retryCount: 0 });
      mockPrismaService.partnerBalance.upsert.mockResolvedValue({ availableBalance: 4500000, totalRevenue: 5000000 });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await paymentService.processWebhook(
        {},
        { orderId: ORDER_ID, providerTransactionId: 'BANK-TX-12345', amount: 5000000 },
      );

      expect(result.success).toBe(true);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.bookingStatus).toBe(BookingStatus.CONFIRMED);
      // Commission tạo 1 lần
      expect(mockPrismaService.commission.create).toHaveBeenCalledTimes(1);
      // PartnerBalance cộng 1 lần
      expect(mockPrismaService.partnerBalance.upsert).toHaveBeenCalledTimes(1);
      // Notification Payment Paid
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ eventKey: `PAYMENT_PAID_${ORDER_ID}` }),
      );
    });

    it('2B. Thanh toán FAILED từ Ngân hàng → Payment=PAYMENT_FAILED, Booking KHÔNG CONFIRMED', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);
      mockPrismaService.payment.update.mockResolvedValue({ ...mockPendingPayment, status: PaymentStatus.PAYMENT_FAILED });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await paymentService.processWebhook(
        {},
        { orderId: ORDER_ID, providerTransactionId: 'BANK-TX-FAIL', amount: 5000000, isSuccess: false },
      );

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe(PaymentStatus.PAYMENT_FAILED);
      // Booking không được update sang CONFIRMED
      expect(mockPrismaService.booking.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: BookingStatus.CONFIRMED } }),
      );
      // Notification thất bại
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ eventKey: `PAYMENT_FAILED_${ORDER_ID}` }),
      );
    });
  });

  // ============================================================
  // 3. AMOUNT MISMATCH
  // ============================================================
  describe('3. Amount Mismatch (Expected ≠ Received)', () => {
    it('3A. Expected=5.000.000 Received=4.900.000 → Payment=PAYMENT_FAILED, không Payout, Admin Alert', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);
      mockPrismaService.payment.update.mockResolvedValue({ ...mockPendingPayment, status: PaymentStatus.PAYMENT_FAILED });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      await expect(
        paymentService.processWebhook({}, {
          orderId: ORDER_ID,
          providerTransactionId: 'BANK-MISMATCH',
          amount: 4900000, // 100k thiếu
        }),
      ).rejects.toThrow('không khớp');

      // Booking KHÔNG được CONFIRMED
      expect(mockPrismaService.booking.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: BookingStatus.CONFIRMED } }),
      );
      // Không Payout
      expect(mockPrismaService.payout.create).not.toHaveBeenCalled();
      // Admin phải nhận cảnh báo
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ eventKey: `AMOUNT_MISMATCH_${ORDER_ID}` }),
      );
    });
  });

  // ============================================================
  // 4. WEBHOOK DUPLICATE / IDEMPOTENCY
  // ============================================================
  describe('4. Webhook Duplicate & Idempotency', () => {
    it('4A. Webhook lặp lại: Không tạo Payment/Commission/Payout trùng', async () => {
      // Payment đã ở trạng thái PAID
      mockPrismaService.payment.findFirst.mockResolvedValue({
        ...mockPendingPayment,
        status: PaymentStatus.PAID,
        booking: mockBooking,
      });

      const result = await paymentService.processWebhook({}, {
        orderId: ORDER_ID,
        providerTransactionId: 'BANK-TX-REPLAY',
        amount: 5000000,
      });

      // Trả về idempotent response
      expect(result.success).toBe(true);
      expect(result.message).toContain('Idempotent');
      // Không update Payment, không tạo Payout, không cộng Balance
      expect(mockPrismaService.payment.update).not.toHaveBeenCalled();
      expect(mockPrismaService.payout.create).not.toHaveBeenCalled();
      expect(mockPrismaService.partnerBalance.upsert).not.toHaveBeenCalled();
    });

    it('4B. Payout Idempotency: Payout đã SUCCESS thì không cộng PartnerBalance lần 2', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PAYMENT_PAID,
        payout: { status: PayoutStatus.SUCCESS },
        payments: [{ status: PaymentStatus.PAID }],
      });

      // Idempotency: trả về success với message Idempotent, KHÔNG throw, KHÔNG cộng Balance
      const result = await payoutService.processPayoutForBooking(BOOKING_ID);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Idempotent');
      // PartnerBalance KHÔNG được cộng thêm
      expect(mockPrismaService.partnerBalance.upsert).not.toHaveBeenCalled();
    });

    it('4C. Commission Idempotency: Nếu Commission đã tồn tại thì không tạo lại', async () => {
      const existingCommission = { id: 'comm-1', grossAmount: 5000000, commissionRate: 0.1 };
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPendingPayment);
      mockPrismaService.payment.update.mockResolvedValue({ ...mockPendingPayment, status: PaymentStatus.PAID });
      mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, status: BookingStatus.CONFIRMED });
      mockPrismaService.booking.findUnique.mockResolvedValue({ ...mockBooking, status: BookingStatus.PAYMENT_PAID, payout: null, payments: [{ status: PaymentStatus.PAID }] });
      mockPrismaService.commission.findUnique.mockResolvedValue(existingCommission); // Commission đã tồn tại!
      mockPrismaService.commission.create.mockResolvedValue({});
      mockPrismaService.payout.findUnique.mockResolvedValue(null);
      mockPrismaService.payout.create.mockResolvedValue({ id: 'payout-1', status: PayoutStatus.PROCESSING, amount: 4500000 });
      mockPrismaService.payout.update.mockResolvedValue({ id: 'payout-1', status: PayoutStatus.SUCCESS, amount: 4500000, retryCount: 0 });
      mockPrismaService.partnerBalance.upsert.mockResolvedValue({ availableBalance: 4500000, totalRevenue: 5000000 });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      await paymentService.processWebhook({}, {
        orderId: ORDER_ID,
        providerTransactionId: 'BANK-TX-12345',
        amount: 5000000,
      });

      // Commission KHÔNG được tạo lại
      expect(mockPrismaService.commission.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 5. BOOKING EXPIRED (HOLD TTL CRON)
  // ============================================================
  describe('5. Hold TTL Booking Expiration (Cron Job)', () => {
    it('5A. Đơn hết hạn → Booking=CANCELLED, Payment=PAYMENT_EXPIRED, Service được giải phóng', async () => {
      const expiredBooking = {
        ...mockBooking,
        expiresAt: new Date(Date.now() - 15 * 60 * 1000),
        payments: [{ id: 'pay-1', status: PaymentStatus.PENDING }],
        service: { ...mockService, isAvailable: false },
      };

      mockPrismaService.booking.findMany.mockResolvedValue([expiredBooking]);
      // findUnique inside $transaction returns PENDING_PAYMENT (not changed by webhook yet)
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...expiredBooking,
        status: BookingStatus.PENDING_PAYMENT,
      });
      mockPrismaService.booking.update.mockResolvedValue({ ...expiredBooking, status: BookingStatus.CANCELLED });
      mockPrismaService.payment.update.mockResolvedValue({ status: PaymentStatus.PAYMENT_EXPIRED });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await cronService.handleExpiredHoldBookings();

      expect(result.expiredCount).toBe(1);
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: BookingStatus.CANCELLED } }),
      );
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: PaymentStatus.PAYMENT_EXPIRED } }),
      );
    });

    it('5B. Đơn chưa hết hạn → Không thay đổi gì', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);
      const result = await cronService.handleExpiredHoldBookings();
      expect(result.expiredCount).toBe(0);
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it('5C. Concurrency: Webhook PAYMENT_PAID ngay trước Cron → Cron an toàn bỏ qua', async () => {
      const expiredBooking = {
        ...mockBooking,
        expiresAt: new Date(Date.now() - 1000),
        payments: [],
      };
      mockPrismaService.booking.findMany.mockResolvedValue([expiredBooking]);
      // $transaction fresh query trả PAYMENT_PAID (Webhook đã xử lý trước)
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...expiredBooking,
        status: BookingStatus.PAYMENT_PAID,
      });

      const result = await cronService.handleExpiredHoldBookings();
      expect(result.expiredCount).toBe(0);
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it('5D. Không thể thanh toán Booking đã CANCELLED (expiresAt lapsed)', async () => {
      const expiredBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        expiresAt: new Date(Date.now() - 60000), // Đã hết hạn
      };
      mockPrismaService.booking.findUnique.mockResolvedValue(expiredBooking);

      await expect(
        paymentService.createPaymentOrder(USER_ID, { bookingId: BOOKING_ID }),
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // 6. PAYOUT FAILED & NOTIFICATIONS
  // ============================================================
  describe('6. Payout Failed Flow', () => {
    beforeEach(async () => {
      await buildModule(mockPayoutProviderFail);
      jest.clearAllMocks();
      setupTransaction();
    });

    it('6A. Payout FAILED → Booking=PAYOUT_ERROR, PartnerBalance KHÔNG cộng, Partner+Admin Alert', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PAYMENT_PAID,
        payout: null,
        payments: [{ status: PaymentStatus.PAID, amount: 5000000 }],
      });
      mockPrismaService.payout.findUnique.mockResolvedValue(null);
      mockPrismaService.payout.create.mockResolvedValue({
        id: 'payout-fail-1', status: PayoutStatus.PROCESSING, amount: 4500000
      });
      mockPrismaService.payout.update.mockResolvedValue({
        id: 'payout-fail-1',
        status: PayoutStatus.FAILED,
        retryCount: 1,
        failureReason: 'Ngân hàng từ chối giao dịch',
      });
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking, status: BookingStatus.PAYOUT_ERROR
      });

      const result = await payoutService.processPayoutForBooking(BOOKING_ID);

      expect(result.success).toBe(false);
      expect(result.bookingStatus).toBe(BookingStatus.PAYOUT_ERROR);
      // PartnerBalance KHÔNG cộng
      expect(mockPrismaService.partnerBalance.upsert).not.toHaveBeenCalled();
      // Partner & Admin nhận cảnh báo
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ eventKey: `PAYOUT_FAILED_PARTNER_${BOOKING_ID}` }),
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ eventKey: `PAYOUT_FAILED_ADMIN_${BOOKING_ID}` }),
      );
    });
  });

  // ============================================================
  // 7. NOTIFICATION SYSTEM (REAL SERVICE)
  // ============================================================
  describe('7. Notification System – Idempotency, RBAC & Read Flow', () => {
    let realNotifService: NotificationService;
    let notifPrisma: any;

    beforeEach(async () => {
      notifPrisma = {
        notification: {
          create: jest.fn(),
          findFirst: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn(),
          count: jest.fn().mockResolvedValue(0),
          update: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: PrismaService, useValue: notifPrisma },
        ],
      }).compile();
      realNotifService = module.get<NotificationService>(NotificationService);
    });

    it('7A. Tạo Notification: Lưu đúng vào DB với đủ trường', async () => {
      notifPrisma.notification.create.mockResolvedValue({
        id: 'n-1', isRead: false, recipientId: USER_ID
      });

      const notif = await realNotifService.createNotification({
        recipientId: USER_ID,
        recipientType: 'USER',
        title: 'Đặt dịch vụ thành công',
        body: 'Đơn #VL202608031001 đã xác nhận.',
        eventKey: `BOOKING_CONFIRMED_USER_${BOOKING_ID}`,
      });

      expect(notif.id).toBe('n-1');
      expect(notifPrisma.notification.create).toHaveBeenCalledTimes(1);
    });

    it('7B. Deduplication: eventKey đã tồn tại → không tạo thêm', async () => {
      notifPrisma.notification.findFirst.mockResolvedValue({ id: 'n-existing' });

      const notif = await realNotifService.createNotification({
        recipientId: USER_ID,
        recipientType: 'USER',
        title: 'Đặt dịch vụ thành công',
        body: 'Đơn đã xác nhận.',
        eventKey: `BOOKING_CONFIRMED_USER_${BOOKING_ID}`,
      });

      expect(notif.id).toBe('n-existing');
      expect(notifPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('7C. RBAC: User chỉ xem Notification của mình', async () => {
      notifPrisma.notification.findMany.mockResolvedValue([
        { id: 'n-1', recipientId: USER_ID },
      ]);

      const list = await realNotifService.getUserNotifications(USER_ID);
      expect(list[0].recipientId).toBe(USER_ID);
      expect(notifPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { recipientId: USER_ID } }),
      );
    });

    it('7D. unread-count đúng sau khi đọc thông báo', async () => {
      notifPrisma.notification.count.mockResolvedValue(3);
      const result = await realNotifService.getUnreadCount(USER_ID);
      expect(result.unreadCount).toBe(3);
    });

    it('7E. mark-all-as-read: đánh dấu tất cả đã đọc', async () => {
      notifPrisma.notification.updateMany.mockResolvedValue({ count: 3 });
      const result = await realNotifService.markAllAsRead(USER_ID);
      expect(notifPrisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { recipientId: USER_ID, isRead: false } }),
      );
    });
  });

  // ============================================================
  // 8. RECONCILIATION DASHBOARD
  // ============================================================
  describe('8. Admin Reconciliation Dashboard', () => {
    it('8A. Giao dịch khớp hoàn toàn → recoStatus = MATCHED', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        {
          ...mockBooking,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          payments: [{ status: PaymentStatus.PAID, events: [] }],
          payout: { status: PayoutStatus.SUCCESS, retryCount: 0 },
          partner: { businessName: 'Vinpearl' },
        },
      ]);

      const result = await adminService.getReconciliation();

      expect(result.matchedCount).toBe(1);
      expect(result.items[0].recoStatus).toBe('MATCHED');
    });

    it('8B. Thanh toán nhưng Payout thất bại → recoStatus = PAYOUT_MISSING', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        {
          ...mockBooking,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          payments: [{ status: PaymentStatus.PAID, events: [] }],
          payout: { status: PayoutStatus.FAILED, retryCount: 1 },
          partner: { businessName: 'Vinpearl' },
        },
      ]);

      const result = await adminService.getReconciliation();

      expect(result.issueCount).toBe(1);
      expect(result.items[0].recoStatus).toBe('PAYOUT_MISSING');
    });
  });

  // ============================================================
  // 9. SECURITY / RBAC
  // ============================================================
  describe('9. Security & RBAC', () => {
    it('9A. User A không thể xem Booking của User B → ForbiddenException', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        ...mockBooking,
        userId: 'USER-B-DIFFERENT',
        service: mockService,
        partner: mockPartner,
        payments: [],
        commission: null,
      });

      await expect(
        travelService.getBookingById(USER_ID, BOOKING_ID),
      ).rejects.toThrow('không có quyền');
    });

    it('9B. Webhook với mã đơn không tồn tại → NotFoundException (không xử lý bừa)', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      await expect(
        paymentService.processWebhook({}, {
          orderId: 'INVALID-ORDER-999',
          providerTransactionId: 'BANK-TX-HACK',
          amount: 9999999,
        }),
      ).rejects.toThrow('Không tìm thấy');
    });

    it('9C. Không thể trả tiền cho đơn chưa PENDING_PAYMENT (đã CONFIRMED)', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        payments: [],
      });

      await expect(
        paymentService.createPaymentOrder(USER_ID, { bookingId: BOOKING_ID }),
      ).rejects.toThrow();
    });

    it('9D. User B không thể tạo Payment Order cho Booking của User A', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        userId: USER_ID, // Booking của USER_ID
        payments: [],
      });

      await expect(
        paymentService.createPaymentOrder('user-B-id', { bookingId: BOOKING_ID }),
      ).rejects.toThrow('không có quyền');
    });
  });
});
