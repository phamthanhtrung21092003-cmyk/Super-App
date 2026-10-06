import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieOrderStatus,
  MovieTicketStatus,
  MovieTicketType,
  PaymentStatus,
  RefundStatus,
  SeatHoldStatus,
  ShowtimeSeatStatus,
  TransactionType,
  VoucherDiscountType,
  VoucherStatus,
} from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { PaymentService } from '../payment/payment.service';
import { MovieModule } from './movie.module';
import { SeatHoldService } from './seat-hold.service';
import { MovieOrderService } from './movie-order.service';
import { MovieBookingService } from './movie-booking.service';
import { CinemaIntegrationService } from './integration/cinema-integration.service';
import { MockCinemaAdapter } from './integration/adapters/mock-cinema.adapter';

jest.setTimeout(60000);

describe('Phase 3 — Seat Hold, Movie Order, Server Pricing, Payment Core, Cinema Booking & Barcode E2E', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let seatHoldService: SeatHoldService;
  let movieOrderService: MovieOrderService;
  let movieBookingService: MovieBookingService;
  let paymentService: PaymentService;
  let cinemaIntegrationService: CinemaIntegrationService;
  let mockCinemaAdapter: MockCinemaAdapter;

  let testShowtimeId: string;
  let testCinemaId: string;
  let testMovieId: string;
  let testSeatIds: string[] = [];
  let cgvComboId: string;
  let betaComboId: string;
  let activeVoucherCode: string;
  let expiredVoucherCode: string;

  const userAId = 'phase3-user-a-uuid';
  const userBId = 'phase3-user-b-uuid';
  const concurrencyUserIds: string[] = Array.from(
    { length: 100 },
    (_, idx) => `phase3-conc-user-${idx + 1}`,
  );

  beforeAll(async () => {
    process.env.SEAT_HOLD_TTL_SECONDS = '600';
    process.env.WEBHOOK_SECRET = 'phase3_test_hmac_secret';
    process.env.CGV_API_KEY = 'sandbox-cgv-key-phase3';
    process.env.LOTTE_API_KEY = 'sandbox-lotte-key-phase3';
    process.env.GALAXY_API_KEY = 'sandbox-galaxy-key-phase3';
    process.env.BETA_API_KEY = 'sandbox-beta-key-phase3';
    process.env.BHD_API_KEY = 'sandbox-bhd-key-phase3';
    process.env.CINESTAR_API_KEY = 'sandbox-cinestar-key-phase3';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        MovieModule,
        PaymentModule,
      ],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    seatHoldService = moduleRef.get<SeatHoldService>(SeatHoldService);
    movieOrderService = moduleRef.get<MovieOrderService>(MovieOrderService);
    movieBookingService = moduleRef.get<MovieBookingService>(MovieBookingService);
    paymentService = moduleRef.get<PaymentService>(PaymentService);
    cinemaIntegrationService = moduleRef.get<CinemaIntegrationService>(CinemaIntegrationService);
    mockCinemaAdapter = moduleRef.get<MockCinemaAdapter>(MockCinemaAdapter);

    await prisma.onModuleInit();

    // Sử dụng MockCinemaAdapter cho tích hợp rạp trong bài test Phase 3
    cinemaIntegrationService.setUseMockFallback(true);
    mockCinemaAdapter.resetSimulation();

    // Chuẩn bị Users cho bài test (User A, User B và 100 Concurrent Users)
    const usersToEnsure = [
      { id: userAId, phone: '0991000001', fullName: 'Phase 3 User A' },
      { id: userBId, phone: '0991000002', fullName: 'Phase 3 User B' },
      ...concurrencyUserIds.map((id, i) => ({
        id,
        phone: `0992${String(i + 1).padStart(6, '0')}`,
        fullName: `Concurrency User ${i + 1}`,
      })),
    ];

    for (const u of usersToEnsure) {
      await prisma.user.upsert({
        where: { phone: u.phone },
        update: { fullName: u.fullName },
        create: {
          id: u.id,
          phone: u.phone,
          password: 'hashed_password',
          fullName: u.fullName,
        },
      });
    }

    // Lấy dữ liệu Showtime CGV đã seed từ Phase 1
    const cgvShowtime = await prisma.showtime.findFirst({
      where: {
        isActive: true,
        cinema: { brand: CinemaBrand.CGV },
      },
      include: {
        cinema: true,
        movie: true,
        showtimeSeats: {
          orderBy: { seatCode: 'asc' },
        },
      },
    });

    if (!cgvShowtime || cgvShowtime.showtimeSeats.length < 15) {
      throw new Error('Phase 1 seed data missing CGV showtime or seats');
    }

    testShowtimeId = cgvShowtime.id;
    testCinemaId = cgvShowtime.cinemaId;
    testMovieId = cgvShowtime.movieId;
    testSeatIds = cgvShowtime.showtimeSeats.map((ss) => ss.seatId);

    // Đảm bảo có 1 Combo của CGV và 1 Combo riêng của BETA để test chặn sai thương hiệu rạp
    const cgvCombo = await prisma.combo.upsert({
      where: { code: 'P3-CGV-COMBO-01' },
      update: {
        brand: CinemaBrand.CGV,
        cinemaId: testCinemaId,
        price: 89000,
        isActive: true,
        stockQuantity: 100,
      },
      create: {
        code: 'P3-CGV-COMBO-01',
        name: 'Combo CGV Bắp Ngọt + 2 Pepsi',
        brand: CinemaBrand.CGV,
        cinemaId: testCinemaId,
        price: 89000,
        isActive: true,
        stockQuantity: 100,
      },
    });
    cgvComboId = cgvCombo.id;

    const betaCombo = await prisma.combo.upsert({
      where: { code: 'P3-BETA-COMBO-ONLY' },
      update: {
        brand: CinemaBrand.BETA,
        cinemaId: null,
        price: 55000,
        isActive: true,
      },
      create: {
        code: 'P3-BETA-COMBO-ONLY',
        name: 'Combo Beta Giá Rẻ (Chỉ áp dụng Beta)',
        brand: CinemaBrand.BETA,
        price: 55000,
        isActive: true,
      },
    });
    betaComboId = betaCombo.id;

    // Đảm bảo có 1 Voucher ACTIVE và 1 Voucher EXPIRED
    activeVoucherCode = 'P3MOVIE30K';
    await prisma.voucherUsage.deleteMany({ where: { voucher: { code: activeVoucherCode } } });
    await prisma.voucher.upsert({
      where: { code: activeVoucherCode },
      update: {
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 30000,
        minOrderAmount: 100000,
        usageLimit: 50,
        usedCount: 0,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 86400_000),
        validUntil: new Date(Date.now() + 7 * 86400_000),
        cinemaBrand: CinemaBrand.CGV,
        status: VoucherStatus.ACTIVE,
      },
      create: {
        code: activeVoucherCode,
        title: 'Giảm 30.000đ vé CGV',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 30000,
        minOrderAmount: 100000,
        usageLimit: 50,
        usedCount: 0,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 86400_000),
        validUntil: new Date(Date.now() + 7 * 86400_000),
        cinemaBrand: CinemaBrand.CGV,
        status: VoucherStatus.ACTIVE,
      },
    });

    expiredVoucherCode = 'P3EXPIRED50K';
    await prisma.voucher.upsert({
      where: { code: expiredVoucherCode },
      update: {
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 50000,
        minOrderAmount: 50000,
        usageLimit: 10,
        usedCount: 0,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 10 * 86400_000),
        validUntil: new Date(Date.now() - 2 * 86400_000),
        status: VoucherStatus.ACTIVE,
      },
      create: {
        code: expiredVoucherCode,
        title: 'Voucher Đã Hết Hạn',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 50000,
        minOrderAmount: 50000,
        usageLimit: 10,
        usedCount: 0,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 10 * 86400_000),
        validUntil: new Date(Date.now() - 2 * 86400_000),
        status: VoucherStatus.ACTIVE,
      },
    });

    // Reset sạch các ghế của testShowtimeId trước khi chạy bộ test
    await prisma.seatHold.updateMany({
      where: { showtimeId: testShowtimeId, status: SeatHoldStatus.HELD },
      data: { status: SeatHoldStatus.RELEASED, releasedAt: new Date() },
    });
    await prisma.showtimeSeat.updateMany({
      where: { showtimeId: testShowtimeId },
      data: {
        status: ShowtimeSeatStatus.AVAILABLE,
        heldByUserId: null,
        activeHoldId: null,
        holdExpiresAt: null,
        movieBookingId: null,
      },
    });
  });

  afterAll(async () => {
    cinemaIntegrationService.setUseMockFallback(false);
    await prisma.onModuleDestroy();
  });

  const signWebhook = (dto: { orderId: string; providerTransactionId: string; amount: number; status?: string }) => {
    const rawData = `${dto.orderId}|${dto.providerTransactionId}|${dto.amount}`;
    return createHmac('sha256', process.env.WEBHOOK_SECRET!).update(rawData).digest('hex');
  };

  // ==========================================================================
  // 1. SEAT HOLD, TTL, RELEASE, CONVERT & 100-USER CONCURRENCY TEST
  // ==========================================================================
  describe('1. Seat Hold Engine & 100-User Concurrency Protection', () => {
    it('1.1 Single Hold & Duplicate / Different User Rejection: User A holds C4+C5, User B is rejected on C4', async () => {
      const seat1 = testSeatIds[0];
      const seat2 = testSeatIds[1];

      const holdRes = await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat1, seat2],
      });

      expect(holdRes.holds).toHaveLength(2);
      expect(holdRes.ttlSeconds).toBe(600);
      expect(new Date(holdRes.expiresAt).getTime()).toBeGreaterThan(Date.now() + 500_000);

      // User B cố tình giữ trùng ghế seat1 -> Bắt buộc REJECT (409 Conflict)
      await expect(
        seatHoldService.holdSeats(userBId, {
          showtimeId: testShowtimeId,
          seatIds: [seat1],
        }),
      ).rejects.toThrow(ConflictException);

      // Duplicate hold trên cùng ghế đang HELD -> Bắt buộc REJECT
      await expect(
        seatHoldService.holdSeats(userAId, {
          showtimeId: testShowtimeId,
          seatIds: [seat1],
        }),
      ).rejects.toThrow(ConflictException);

      // Giải phóng ghế của User A
      const rel = await seatHoldService.releaseHolds(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat1, seat2],
      });
      expect(rel.releasedCount).toBe(2);
    });

    it('1.2 TTL Expiry & CONVERTED Protection: SeatHoldExpiryJob releases expired HELD seats but NEVER releases CONVERTED holds', async () => {
      const seatExpired = testSeatIds[2];
      const seatConverted = testSeatIds[3];

      const res1 = await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seatExpired, seatConverted],
      });

      const expiredHoldId = res1.holds.find((h: any) => h.seatId === seatExpired).holdId;
      const convertedHoldId = res1.holds.find((h: any) => h.seatId === seatConverted).holdId;

      // Ép seatExpired về quá khứ và chuyển seatConverted sang CONVERTED
      const pastDate = new Date(Date.now() - 60_000);
      await prisma.seatHold.update({
        where: { id: expiredHoldId },
        data: { expiresAt: pastDate },
      });
      await prisma.seatHold.update({
        where: { id: convertedHoldId },
        data: { status: SeatHoldStatus.CONVERTED, expiresAt: pastDate },
      });
      await prisma.showtimeSeat.updateMany({
        where: { showtimeId: testShowtimeId, seatId: seatConverted },
        data: { status: ShowtimeSeatStatus.BOOKED },
      });

      // Chạy SeatHoldExpiryJob
      const jobResult = await seatHoldService.releaseExpiredHolds();
      expect(jobResult.releasedCount).toBeGreaterThanOrEqual(1);

      const checkExpired = await prisma.seatHold.findUnique({ where: { id: expiredHoldId } });
      const checkConverted = await prisma.seatHold.findUnique({ where: { id: convertedHoldId } });
      const checkSeatAvailable = await prisma.showtimeSeat.findUnique({
        where: { showtimeId_seatId: { showtimeId: testShowtimeId, seatId: seatExpired } },
      });

      expect(checkExpired?.status).toBe(SeatHoldStatus.RELEASED);
      expect(checkSeatAvailable?.status).toBe(ShowtimeSeatStatus.AVAILABLE);
      // CONVERTED hold tuyệt đối không bị release!
      expect(checkConverted?.status).toBe(SeatHoldStatus.CONVERTED);

      // Dọn lại seatConverted về AVAILABLE cho các test sau
      await prisma.showtimeSeat.updateMany({
        where: { showtimeId: testShowtimeId, seatId: seatConverted },
        data: { status: ShowtimeSeatStatus.AVAILABLE, activeHoldId: null, heldByUserId: null },
      });
    });

    it('1.3 CRITICAL CONCURRENCY TEST: 100 concurrent requests for the SAME showtime and SAME seat -> Exactly 1 succeeds, 99 rejected', async () => {
      const hotSeatId = testSeatIds[4];

      // Đảm bảo ghế đang AVAILABLE trước khi bắn 100 request đồng thời
      await prisma.seatHold.updateMany({
        where: { showtimeId: testShowtimeId, seatId: hotSeatId, status: SeatHoldStatus.HELD },
        data: { status: SeatHoldStatus.RELEASED, releasedAt: new Date() },
      });
      await prisma.showtimeSeat.updateMany({
        where: { showtimeId: testShowtimeId, seatId: hotSeatId },
        data: {
          status: ShowtimeSeatStatus.AVAILABLE,
          heldByUserId: null,
          activeHoldId: null,
          holdExpiresAt: null,
        },
      });

      // Bắn đồng thời 100 requests từ 100 Users khác nhau vào đúng 1 ghế (hotSeatId)
      const concurrentPromises = concurrencyUserIds.map((uid) =>
        seatHoldService.holdSeats(uid, {
          showtimeId: testShowtimeId,
          seatIds: [hotSeatId],
        }),
      );

      const results = await Promise.allSettled(concurrentPromises);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(99);

      // Kiểm tra trực tiếp trong PostgreSQL: chỉ có duy nhất 1 bản ghi HELD
      const activeHoldsInDb = await prisma.seatHold.findMany({
        where: {
          showtimeId: testShowtimeId,
          seatId: hotSeatId,
          status: SeatHoldStatus.HELD,
        },
      });
      expect(activeHoldsInDb).toHaveLength(1);

      // Giải phóng ghế sau bài test concurrency
      await seatHoldService.releaseHolds(activeHoldsInDb[0].userId, {
        showtimeId: testShowtimeId,
        seatIds: [hotSeatId],
      });
    });
  });
  // ==========================================================================
  // 2. SERVER-SIDE PRICING, COMBO & VOUCHER VALIDATION TESTS
  // ==========================================================================
  describe('2. Server-Side Pricing, Combo Brand Guard & Voucher Rules', () => {
    it('2.1 Rejects wrong cinema brand combo (Beta combo cannot be used on CGV showtime)', async () => {
      const seatId = testSeatIds[5];
      await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      await expect(
        movieOrderService.createMovieOrder(userAId, {
          showtimeId: testShowtimeId,
          seatIds: [seatId],
          comboIds: [betaComboId],
        }),
      ).rejects.toThrow(BadRequestException);

      await seatHoldService.releaseHolds(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });
    });

    it('2.2 Rejects invalid voucher, expired voucher, and another user SeatHold theft', async () => {
      const seatId = testSeatIds[6];
      await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      // User B cố tình tạo đơn bằng SeatHold của User A -> ForbiddenException
      await expect(
        movieOrderService.createMovieOrder(userBId, {
          showtimeId: testShowtimeId,
          seatIds: [seatId],
        }),
      ).rejects.toThrow(ForbiddenException);

      // Voucher không tồn tại -> NotFoundException
      await expect(
        movieOrderService.createMovieOrder(userAId, {
          showtimeId: testShowtimeId,
          seatIds: [seatId],
          voucherCode: 'NON_EXISTENT_VOUCHER_999',
        }),
      ).rejects.toThrow(NotFoundException);

      // Voucher hết hạn -> BadRequestException
      await expect(
        movieOrderService.createMovieOrder(userAId, {
          showtimeId: testShowtimeId,
          seatIds: [seatId],
          voucherCode: expiredVoucherCode,
        }),
      ).rejects.toThrow(BadRequestException);

      await seatHoldService.releaseHolds(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });
    });

    it('2.3 Calculates exact server-side price (Seat + Combo - Voucher = Total) and prevents voucher double usage', async () => {
      const seat1 = testSeatIds[7];
      const seat2 = testSeatIds[8];

      const holdRes = await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat1, seat2],
      });

      const expectedSeatsSubtotal =
        Number(holdRes.holds[0].price) + Number(holdRes.holds[1].price);
      const expectedCombosSubtotal = 89000 * 2; // 2x CGV Combo @ 89,000đ
      const expectedDiscount = 30000; // P3MOVIE30K = 30,000đ
      const expectedTotal = expectedSeatsSubtotal + expectedCombosSubtotal - expectedDiscount;

      const order = await movieOrderService.createMovieOrder(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat1, seat2],
        combos: [{ comboId: cgvComboId, quantity: 2 }],
        voucherCode: activeVoucherCode,
        idempotencyKey: `IDEM_ORDER_PRICING_${Date.now()}`,
      });

      expect(Number(order.seatsSubtotal)).toBe(expectedSeatsSubtotal);
      expect(Number(order.combosSubtotal)).toBe(expectedCombosSubtotal);
      expect(Number(order.discountAmount)).toBe(expectedDiscount);
      expect(Number(order.totalAmount)).toBe(expectedTotal);
      expect(order.items).toHaveLength(3); // 2 SEAT items + 1 COMBO item (qty 2)

      // Kiểm tra chống dùng lại cùng Voucher quá perUserLimit (1 lần/user)
      const seat3 = testSeatIds[9];
      await seatHoldService.holdSeats(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat3],
      });

      await expect(
        movieOrderService.createMovieOrder(userAId, {
          showtimeId: testShowtimeId,
          seatIds: [seat3],
          combos: [{ comboId: cgvComboId, quantity: 1 }],
          voucherCode: activeVoucherCode,
        }),
      ).rejects.toThrow(BadRequestException);

      await seatHoldService.releaseHolds(userAId, {
        showtimeId: testShowtimeId,
        seatIds: [seat3],
      });
    });
  });

  // ==========================================================================
  // 3. E2E FLOWS: PAYMENT CORE, WEBHOOK, CINEMA BOOKING, BARCODE, TIMEOUT & REFUND
  // ==========================================================================
  describe('3. End-to-End Movie Booking, Payment Core, Barcode & Failure/Refund Flows', () => {
    it('3.1 E2E Happy Path: Hold -> MovieOrder -> Payment Core -> Webhook PAID -> Cinema Booking -> Ticket Issued & Unique Barcode + Duplicate Webhook Idempotency', async () => {
      mockCinemaAdapter.resetSimulation();
      const seatId = testSeatIds[10];

      // 1. Giữ ghế
      await seatHoldService.holdSeats(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      // 2. Tạo MovieOrder
      const movieOrder = await movieOrderService.createMovieOrder(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
        combos: [{ comboId: cgvComboId, quantity: 1 }],
      });

      // 3. Gọi V-Life Payment Core dùng chung để khởi tạo đơn thanh toán VietQR
      const paymentRes = await paymentService.createPaymentOrder(userBId, {
        movieOrderId: movieOrder.id,
      });

      expect(paymentRes.paymentOrder.orderId).toBe(movieOrder.orderCode);
      expect(paymentRes.paymentOrder.amount).toBe(Number(movieOrder.totalAmount));
      expect(paymentRes.paymentOrder.paymentStatus).toBe(PaymentStatus.PENDING);

      // 4. Kiểm tra Webhook sai chữ ký HMAC -> Bị chặn UnauthorizedException
      await expect(
        paymentService.processWebhook(
          { 'x-vlife-signature': 'invalid_hmac_signature' },
          {
            orderId: movieOrder.orderCode,
            providerTransactionId: 'BANK_TX_HAPPY_001',
            amount: Number(movieOrder.totalAmount),
            status: 'SUCCESS',
          },
        ),
      ).rejects.toThrow(UnauthorizedException);

      // 5. Gửi Webhook hợp lệ (HMAC chuẩn) xác nhận thanh toán PAID
      const validDto = {
        orderId: movieOrder.orderCode,
        providerTransactionId: 'BANK_TX_HAPPY_001',
        amount: Number(movieOrder.totalAmount),
        status: 'SUCCESS',
      };
      const signature = signWebhook(validDto);

      const webhookResult: any = await paymentService.processWebhook(
        { 'x-vlife-signature': signature },
        validDto,
      );

      expect(webhookResult.success).toBe(true);
      expect(webhookResult.paymentStatus).toBe(PaymentStatus.PAID);
      expect(webhookResult.movieOrderStatus).toBe(MovieOrderStatus.CONFIRMED);
      expect(webhookResult.movieBookingStatus).toBe(MovieBookingStatus.TICKET_ISSUED);
      expect(webhookResult.ticket).toBeDefined();

      const issuedTicket = webhookResult.ticket;
      expect(issuedTicket.ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);
      expect(issuedTicket.status).toBe(MovieTicketStatus.ISSUED);

      // 6. Xác minh Barcode hoàn toàn độc lập với Payment QR / orderId / paymentId / providerTransactionId
      expect(issuedTicket.barcode).toBeTruthy();
      expect(issuedTicket.barcode).not.toBe(paymentRes.paymentOrder.orderId);
      expect(issuedTicket.barcode).not.toBe(paymentRes.paymentOrder.paymentId);
      expect(issuedTicket.barcode).not.toBe('BANK_TX_HAPPY_001');
      expect(issuedTicket.barcode.startsWith('VLMV-PRT-')).toBe(true);

      // 7. Xác minh Duplicate Webhook (Idempotency): Không tạo thêm MovieBooking, MovieTicket hay Barcode thứ 2
      const replayWebhookResult: any = await paymentService.processWebhook(
        { 'x-vlife-signature': signature },
        validDto,
      );
      expect(replayWebhookResult.success).toBe(true);
      expect(replayWebhookResult.ticket.id).toBe(issuedTicket.id);
      expect(replayWebhookResult.ticket.barcode).toBe(issuedTicket.barcode);

      const ticketsCount = await prisma.movieTicket.count({
        where: { bookingId: issuedTicket.bookingId },
      });
      expect(ticketsCount).toBe(1);

      // 8. Xác minh Transaction History chung của V-Life có bản ghi serviceType = MOVIE
      const movieTx = await prisma.transaction.findFirst({
        where: {
          referenceId: movieOrder.id,
          referenceType: 'MovieOrder',
          type: TransactionType.PAYMENT,
        },
      });
      expect(movieTx).toBeDefined();
      expect((movieTx?.metadata as any)?.serviceType).toBe('MOVIE');

      // 9. Xác minh Notification dùng route /movie/... (tuyệt đối không trỏ về /travel/checkout)
      const movieNotifs = await prisma.notification.findMany({
        where: { recipientId: userBId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      expect(movieNotifs.length).toBeGreaterThan(0);
      for (const n of movieNotifs) {
        const route = (n.data as any)?.route || '';
        if (route) {
          expect(route.startsWith('/movie/')).toBe(true);
          expect(route).not.toContain('/travel/checkout');
        }
      }
    });

    it('3.2 Cinema Booking Timeout & Recovery: Keeps BOOKING_CONFIRMING on timeout and recovers via getBooking() reconciliation', async () => {
      const seatId = testSeatIds[11];
      await seatHoldService.holdSeats(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      const movieOrder = await movieOrderService.createMovieOrder(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      await paymentService.createPaymentOrder(userBId, {
        movieOrderId: movieOrder.id,
      });

      // Bật giả lập TIMEOUT trên MockCinemaAdapter
      mockCinemaAdapter.setSimulationMode('TIMEOUT');

      const validDto = {
        orderId: movieOrder.orderCode,
        providerTransactionId: 'BANK_TX_TIMEOUT_002',
        amount: Number(movieOrder.totalAmount),
        status: 'SUCCESS',
      };
      const timeoutRes: any = await paymentService.processWebhook(
        { 'x-vlife-signature': signWebhook(validDto) },
        validDto,
      );

      // Khi Cinema API Timeout -> Giữ trạng thái BOOKING_CONFIRMING, chưa xuất vé
      expect(timeoutRes.requiresReconciliation).toBe(true);
      expect(timeoutRes.movieBookingStatus).toBe(MovieBookingStatus.BOOKING_CONFIRMING);

      // Phục hồi kết nối rạp -> Chạy đối soát reconcileConfirmingBooking
      mockCinemaAdapter.setSimulationMode('NORMAL');
      const reconciled: any = await movieBookingService.reconcileConfirmingBooking(movieOrder.id);

      expect(reconciled.success).toBe(true);
      expect(reconciled.movieBookingStatus).toBe(MovieBookingStatus.TICKET_ISSUED);
      expect(reconciled.ticket.barcode).toMatch(/^VLMV-PRT-/);
    });

    it('3.3 E2E Failure Path: Payment Success + Cinema Booking Failure -> Refund Pending -> Refund Success + Seat Released + No Ticket', async () => {
      const seatId = testSeatIds[12];
      await seatHoldService.holdSeats(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      const movieOrder = await movieOrderService.createMovieOrder(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      await paymentService.createPaymentOrder(userBId, {
        movieOrderId: movieOrder.id,
      });

      // Bật giả lập BOOKING_FAILED tại rạp
      mockCinemaAdapter.setSimulationMode('BOOKING_FAILED');

      const validDto = {
        orderId: movieOrder.orderCode,
        providerTransactionId: 'BANK_TX_FAIL_REFUND_003',
        amount: Number(movieOrder.totalAmount),
        status: 'SUCCESS',
      };

      // Giai đoạn A: Giả lập lỗi hoàn tiền tạm thời để kiểm tra trạng thái trung gian REFUND_PENDING + Refund FAILED
      movieBookingService.setSimulateRefundFailure(true);
      const pendingRefundRes: any = await paymentService.processWebhook(
        { 'x-vlife-signature': signWebhook(validDto) },
        validDto,
      );

      expect(pendingRefundRes.movieBookingStatus).toBe(MovieBookingStatus.REFUND_PENDING);
      expect(pendingRefundRes.paymentStatus).toBe(PaymentStatus.REFUND_PENDING);
      expect(pendingRefundRes.refund.status).toBe(RefundStatus.FAILED);

      // Giai đoạn B: Tắt giả lập lỗi hoàn tiền -> Thực thi hoàn tiền thành công (REFUNDED)
      movieBookingService.setSimulateRefundFailure(false);
      const finalRefundRes: any = await movieBookingService.initiateAndExecuteMovieRefund(
        movieOrder.id,
        'Rạp hết ghế khi xác nhận đặt vé',
      );

      expect(finalRefundRes.refunded).toBe(true);
      expect(finalRefundRes.paymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(finalRefundRes.movieOrderStatus).toBe(MovieOrderStatus.REFUNDED);
      expect(finalRefundRes.movieBookingStatus).toBe(MovieBookingStatus.REFUNDED);
      expect(finalRefundRes.refund.status).toBe(RefundStatus.SUCCESS);

      // Kiểm tra KHÔNG có vé nào được tạo
      const ticketCount = await prisma.movieTicket.count({
        where: { booking: { movieOrderId: movieOrder.id } },
      });
      expect(ticketCount).toBe(0);

      // Kiểm tra ghế đã được giải phóng về AVAILABLE và SeatHold = RELEASED
      const updatedShowtimeSeat = await prisma.showtimeSeat.findUnique({
        where: { showtimeId_seatId: { showtimeId: testShowtimeId, seatId } },
      });
      expect(updatedShowtimeSeat?.status).toBe(ShowtimeSeatStatus.AVAILABLE);

      const updatedHolds = await prisma.seatHold.findMany({
        where: { movieOrderId: movieOrder.id },
      });
      expect(updatedHolds.every((h) => h.status === SeatHoldStatus.RELEASED)).toBe(true);

      // Kiểm tra Transaction REFUND đã được ghi vào hệ thống Transaction chung
      const refundTx = await prisma.transaction.findFirst({
        where: {
          referenceId: movieOrder.id,
          referenceType: 'MovieOrder',
          type: TransactionType.REFUND,
        },
      });
      expect(refundTx).toBeDefined();
      expect((refundTx?.metadata as any)?.serviceType).toBe('MOVIE');

      mockCinemaAdapter.resetSimulation();
    });

    it('3.4 Payment Failed Webhook: Releases SeatHold immediately and marks MovieOrder/MovieBooking CANCELLED', async () => {
      const seatId = testSeatIds[13];
      await seatHoldService.holdSeats(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      const movieOrder = await movieOrderService.createMovieOrder(userBId, {
        showtimeId: testShowtimeId,
        seatIds: [seatId],
      });

      await paymentService.createPaymentOrder(userBId, {
        movieOrderId: movieOrder.id,
      });

      const failedDto = {
        orderId: movieOrder.orderCode,
        providerTransactionId: 'BANK_TX_BANK_REJECT_004',
        amount: Number(movieOrder.totalAmount),
        status: 'FAILED',
      };

      const failRes: any = await paymentService.processWebhook(
        { 'x-vlife-signature': signWebhook(failedDto) },
        failedDto,
      );

      expect(failRes.success).toBe(false);
      expect(failRes.paymentStatus).toBe(PaymentStatus.PAYMENT_FAILED);
      expect(failRes.movieBookingStatus).toBe(MovieBookingStatus.CANCELLED);

      const checkSeat = await prisma.showtimeSeat.findUnique({
        where: { showtimeId_seatId: { showtimeId: testShowtimeId, seatId } },
      });
      expect(checkSeat?.status).toBe(ShowtimeSeatStatus.AVAILABLE);
    });
  });
});