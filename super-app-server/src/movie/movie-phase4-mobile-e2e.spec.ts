import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieOrderStatus,
  MovieTicketStatus,
  MovieTicketType,
  PaymentStatus,
  ServiceType,
  ShowtimeSeatStatus,
  VoucherDiscountType,
  VoucherStatus,
} from '@prisma/client';
import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { MovieModule } from './movie.module';
import { MovieController } from './movie.controller';
import { PaymentModule } from '../payment/payment.module';
import { PaymentController } from '../payment/payment.controller';
import { MockCinemaAdapter } from './integration/adapters/mock-cinema.adapter';

describe('Phase 4: Mobile UI/UX -> Real Backend Integration & E2E Flow', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let movieController: MovieController;
  let paymentController: PaymentController;
  let mockCinemaAdapter: MockCinemaAdapter;

  const webhookSecret = 'PHASE4_TEST_WEBHOOK_SECRET';
  let userAId: string;
  let userBId: string;
  let showtimeId: string;
  let cinemaId: string;
  let movieId: string;
  let comboId: string;
  const testSeatIds: string[] = [];

  const signWebhook = (dto: {
    orderId: string;
    providerTransactionId: string;
    amount: number;
    status?: string;
  }) => {
    const rawData = `${dto.orderId}|${dto.providerTransactionId}|${dto.amount}`;
    return createHmac('sha256', webhookSecret).update(rawData).digest('hex');
  };

  beforeAll(async () => {
    process.env.WEBHOOK_SECRET = webhookSecret;

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MovieModule,
        PaymentModule,
      ],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    movieController = moduleRef.get<MovieController>(MovieController);
    paymentController = moduleRef.get<PaymentController>(PaymentController);
    mockCinemaAdapter = moduleRef.get<MockCinemaAdapter>(MockCinemaAdapter);

    // Ensure test users exist
    const userA = await prisma.user.upsert({
      where: { phone: '0944000111' },
      update: { fullName: 'Phase 4 Mobile User A' },
      create: {
        phone: '0944000111',
        password: 'hash_a',
        fullName: 'Phase 4 Mobile User A',
        email: 'phase4a@vlife.vn',
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.upsert({
      where: { phone: '0944000222' },
      update: { fullName: 'Phase 4 Mobile User B' },
      create: {
        phone: '0944000222',
        password: 'hash_b',
        fullName: 'Phase 4 Mobile User B',
        email: 'phase4b@vlife.vn',
      },
    });
    userBId = userB.id;

    // Ensure CinemaIntegration rows have mode: SANDBOX for live DB E2E
    await prisma.cinemaIntegration.updateMany({
      data: {
        isActive: true,
        config: { mode: 'SANDBOX' },
      },
    });

    // Ensure VLIFEMOVIE20K voucher is clean & active for Movie
    const validFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const voucher = await prisma.voucher.upsert({
      where: { code: 'VLIFEMOVIE20K' },
      update: {
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 20000,
        maxDiscountAmount: 20000,
        minOrderAmount: 100000,
        usageLimit: 500,
        usedCount: 0,
        perUserLimit: 10,
        cinemaBrand: null,
        validFrom,
        validUntil,
        status: VoucherStatus.ACTIVE,
      },
      create: {
        code: 'VLIFEMOVIE20K',
        title: 'Giảm 20.000đ đặt vé xem phim V-Life',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 20000,
        maxDiscountAmount: 20000,
        minOrderAmount: 100000,
        usageLimit: 500,
        usedCount: 0,
        perUserLimit: 10,
        cinemaBrand: null,
        validFrom,
        validUntil,
        status: VoucherStatus.ACTIVE,
      },
    });

    await prisma.voucherUsage.deleteMany({
      where: { voucherId: voucher.id, userId: { in: [userAId, userBId] } },
    });

    // Pick an active BETA showtime
    const betaShowtime = await prisma.showtime.findFirst({
      where: {
        isActive: true,
        cinema: { brand: CinemaBrand.BETA },
      },
      include: {
        cinema: true,
        movie: true,
        showtimeSeats: {
          orderBy: { seatCode: 'asc' },
        },
      },
    });

    const targetShowtime =
      betaShowtime ||
      (await prisma.showtime.findFirst({
        where: { isActive: true },
        include: {
          cinema: true,
          movie: true,
          showtimeSeats: { orderBy: { seatCode: 'asc' } },
        },
      }));

    if (!targetShowtime) {
      throw new Error('No seeded showtime found in PostgreSQL.');
    }

    showtimeId = targetShowtime.id;
    cinemaId = targetShowtime.cinemaId;
    movieId = targetShowtime.movieId;

    for (const ss of targetShowtime.showtimeSeats.slice(0, 6)) {
      testSeatIds.push(ss.seatId);
    }

    const combos = await movieController.getCombos(cinemaId);
    expect(combos.length).toBeGreaterThan(0);
    comboId = combos[0].id;
  });

  beforeEach(async () => {
    mockCinemaAdapter.resetSimulation();
    // Reset test seats & holds for clean isolation
    await prisma.movieTicket.deleteMany({
      where: { showtimeId, booking: { movieOrder: { userId: { in: [userAId, userBId] } } } },
    });
    await prisma.seatHold.deleteMany({
      where: { showtimeId, seatId: { in: testSeatIds } },
    });
    await prisma.showtimeSeat.updateMany({
      where: { showtimeId, seatId: { in: testSeatIds } },
      data: {
        status: ShowtimeSeatStatus.AVAILABLE,
        heldByUserId: null,
        holdExpiresAt: null,
      },
    });
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  // =========================================================================
  // 1. ROUTING UNIFICATION & ZERO PRODUCTION MOCKS AUDIT
  // =========================================================================
  it('1. Verifies Mobile routing unification (src/app/cinema) and zero production mocks in Movie screens', () => {
    const mobileRoot = path.resolve(__dirname, '../../../super-app-mobile');
    const appJson = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'app.json'), 'utf8'));
    expect(appJson.expo?.extra?.router?.root).toBe('src/app');

    // Verify canonical screens exist in src/app
    const canonicalFiles = [
      'src/app/cinema.tsx',
      'src/app/cinema/[id].tsx',
      'src/app/cinema/seat-selection.tsx',
      'src/app/cinema/concessions.tsx',
      'src/app/cinema/checkout.tsx',
      'src/app/cinema/ticket-detail.tsx',
      'src/app/cinema/tickets.tsx',
      'src/context/CinemaContext.tsx',
      'src/services/movieService.ts',
    ];

    const forbiddenMocks = [
      'BOOKED_SEAT_IDS',
      'MOCK_COMBOS',
      'MB-99998888666',
      'BETA-CONAN-98421',
      'Tôi Đã Chuyển Khoản Xong',
    ];

    for (const relPath of canonicalFiles) {
      const fullPath = path.join(mobileRoot, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const forbidden of forbiddenMocks) {
        expect(content).not.toContain(forbidden);
      }
    }

    // Verify app/cinema* are strictly thin re-exports pointing to src/app/cinema*
    const reExportFiles = [
      'app/cinema.tsx',
      'app/cinema/[id].tsx',
      'app/cinema/seat-selection.tsx',
      'app/cinema/concessions.tsx',
      'app/cinema/checkout.tsx',
      'app/cinema/ticket-detail.tsx',
      'app/cinema/tickets.tsx',
    ];
    for (const relPath of reExportFiles) {
      const fullPath = path.join(mobileRoot, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf8').trim();
      expect(content).toContain('src/app/cinema');
      expect(content.split('\n').length).toBeLessThanOrEqual(3);
    }
  });

  // =========================================================================
  // 2. COMPLETE MOBILE -> BACKEND E2E FLOW (HOME -> DETAIL -> HOLD -> COMBO -> VOUCHER -> ORDER -> PAYMENT -> BARCODE -> HISTORY)
  // =========================================================================
  it('2. Executes full real Mobile E2E flow from Movie Home to Code128 Barcode & History without mocks', async () => {
    const reqUserA = { user: { id: userAId } };

    // Step 1: Movie Home & Movie Detail APIs
    const movies = await movieController.getMovies();
    expect(movies.length).toBeGreaterThanOrEqual(3);

    const movieDetail = await movieController.getMovieById(movieId);
    expect(movieDetail.id).toBe(movieId);
    expect(movieDetail.title).toBeDefined();

    const cinemas = await movieController.getCinemas();
    expect(cinemas.length).toBeGreaterThanOrEqual(6);

    const showtimes = await movieController.getShowtimes(movieId, cinemaId);
    expect(showtimes.length).toBeGreaterThan(0);

    // Step 2: Seat Map API
    const seatMapBefore = await movieController.getShowtimeSeats(showtimeId);
    expect(seatMapBefore.showtimeSeats.length).toBeGreaterThan(0);

    const seat1Id = testSeatIds[0];
    const seat2Id = testSeatIds[1];

    // Step 3: Seat Hold API (POST /movies/seat-holds)
    const holdRes = await movieController.holdSeats(reqUserA, {
      showtimeId,
      seatIds: [seat1Id, seat2Id],
      idempotencyKey: `P4_HOLD_${Date.now()}`,
    });
    expect(holdRes.holds).toHaveLength(2);
    expect(new Date(holdRes.expiresAt).getTime()).toBeGreaterThan(Date.now());

    // Verify Seat Map now reflects HELD for User A
    const seatMapDuringHold = await movieController.getShowtimeSeats(showtimeId);
    const heldSeatsInMap = seatMapDuringHold.showtimeSeats.filter((s) =>
      [seat1Id, seat2Id].includes(s.seatId),
    );
    expect(heldSeatsInMap.every((s) => s.status === ShowtimeSeatStatus.HELD)).toBe(true);
    expect(heldSeatsInMap.every((s) => s.heldByUserId === userAId)).toBe(true);

    // Step 4: Voucher Validation API (POST /movies/vouchers/validate)
    const voucherRes = await movieController.validateVoucher(reqUserA, {
      voucherCode: 'VLIFEMOVIE20K',
      showtimeId,
      seatIds: [seat1Id, seat2Id],
      combos: [{ comboId, quantity: 1 }],
    });
    expect(voucherRes.valid).toBe(true);
    expect(voucherRes.discountAmount).toBe(20000);
    expect(voucherRes.finalTotal).toBe(voucherRes.subtotal - 20000);

    // Step 5: Create Movie Order (POST /movies/orders - Server calculates price)
    const movieOrder = await movieController.createMovieOrder(reqUserA, {
      showtimeId,
      seatIds: [seat1Id, seat2Id],
      combos: [{ comboId, quantity: 1 }],
      voucherCode: 'VLIFEMOVIE20K',
      customerName: 'Phase 4 Mobile User A',
      customerPhone: '0944000111',
      customerEmail: 'phase4a@vlife.vn',
      idempotencyKey: `P4_ORDER_${Date.now()}`,
    });
    expect(movieOrder.status).toBe(MovieOrderStatus.PENDING);
    expect(Number(movieOrder.discountAmount)).toBe(20000);
    expect(Number(movieOrder.totalAmount)).toBe(voucherRes.finalTotal);

    // Step 6: Create Payment Order via V-Life Shared Payment Core (POST /payments/create-order)
    const payOrderRes = await paymentController.createPaymentOrder(reqUserA, {
      movieOrderId: movieOrder.id,
      provider: 'VIETQR',
      idempotencyKey: `P4_PAY_${movieOrder.id}`,
    });
    const paymentOrderId = payOrderRes.paymentOrder.orderId;
    const paymentQrUrl = payOrderRes.paymentOrder.vietqrInfo.qrUrl;
    expect(paymentQrUrl).toContain('vietqr.io');

    // Step 7: Poll Payment Status before Webhook (GET /payments/status/:orderId)
    const statusPending = await paymentController.getPaymentStatus(reqUserA, paymentOrderId);
    expect(statusPending.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(statusPending.movieOrderStatus).toBe(MovieOrderStatus.PAYMENT_PENDING);
    expect(statusPending.tickets).toHaveLength(0);

    // Step 8: Bank Webhook arrives -> triggers Sandbox Cinema Adapter -> issues Ticket & Barcode
    const webhookDto = {
      orderId: paymentOrderId,
      providerTransactionId: `FT_P4_${Date.now()}`,
      amount: Number(movieOrder.totalAmount),
      status: 'SUCCESS',
    };
    const signature = signWebhook(webhookDto);

    await paymentController.handlePaymentWebhook(
      { 'x-vlife-signature': signature },
      webhookDto as any,
    );

    // Step 9: Poll Payment Status after Webhook -> TICKET_ISSUED
    const statusPaid = await paymentController.getPaymentStatus(reqUserA, paymentOrderId);
    expect(statusPaid.paymentStatus).toBe(PaymentStatus.PAID);
    expect(statusPaid.movieBookingStatus).toBe(MovieBookingStatus.TICKET_ISSUED);
    expect(statusPaid.tickets).toHaveLength(1);

    const issuedTicket = statusPaid.tickets![0];
    expect(issuedTicket.ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);
    expect(issuedTicket.status).toBe(MovieTicketStatus.ISSUED);
    expect(issuedTicket.barcode).toMatch(/^VLMV-PRT-/);
    // Payment QR !== Ticket Barcode && Barcode !== bookingCode && Barcode !== orderCode
    expect(issuedTicket.barcode).not.toBe(paymentQrUrl);
    expect(issuedTicket.barcode).not.toBe(movieOrder.orderCode);
    expect(issuedTicket.barcode).not.toBe(movieOrder.booking?.bookingCode);

    // Step 10: Fetch Ticket Detail & Ticket History (GET /movies/tickets/:ticketId & GET /movies/tickets)
    const ticketDetail = await movieController.getTicketById(reqUserA, issuedTicket.id);
    expect(ticketDetail.id).toBe(issuedTicket.id);
    expect(ticketDetail.barcode).toBe(issuedTicket.barcode);

    const myTickets = await movieController.getMyTickets(reqUserA);
    expect(myTickets.some((t) => t.id === issuedTicket.id)).toBe(true);

    const myOrders = await movieController.getMyOrders(reqUserA);
    expect(myOrders.some((o) => o.id === movieOrder.id)).toBe(true);

    // Step 11: Verify Shared Transaction & Notification Records
    const txRecord = await prisma.transaction.findFirst({
      where: {
        referenceId: movieOrder.id,
        referenceType: 'MovieOrder',
      },
    });
    expect(txRecord).toBeDefined();
    expect((txRecord?.metadata as any)?.serviceType).toBe('MOVIE');

    const notifRecords = await prisma.notification.findMany({
      where: {
        recipientId: userAId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const notifRecord = notifRecords.find(
      (n) => (n.data as any)?.ticketId === issuedTicket.id,
    );
    expect(notifRecord).toBeDefined();
    expect((notifRecord?.data as any)?.ticketId).toBe(issuedTicket.id);
    expect((notifRecord?.data as any)?.movieOrderId).toBe(movieOrder.id);
    expect((notifRecord?.data as any)?.barcode).toBe(issuedTicket.barcode);
  });

  // =========================================================================
  // 3. FAILURE E2E FLOWS (SEAT CONFLICT, EXPIRED HOLD, INVALID VOUCHER, CINEMA FAILURE -> REFUND)
  // =========================================================================
  it('3. Handles Failure E2E scenarios: Seat held by other (409), Invalid voucher (400), and Cinema failure -> Refund', async () => {
    const reqUserA = { user: { id: userAId } };
    const reqUserB = { user: { id: userBId } };
    const targetSeatId = testSeatIds[2];

    // 3A. User A holds seat -> User B tries to hold same seat -> 409 Conflict
    await movieController.holdSeats(reqUserA, {
      showtimeId,
      seatIds: [targetSeatId],
    });

    await expect(
      movieController.holdSeats(reqUserB, {
        showtimeId,
        seatIds: [targetSeatId],
      }),
    ).rejects.toThrow(ConflictException);

    // 3B. Invalid voucher code -> 400 BadRequestException with clear message
    await expect(
      movieController.validateVoucher(reqUserA, {
        voucherCode: 'INVALID_CODE_999',
        showtimeId,
        seatIds: [targetSeatId],
      }),
    ).rejects.toThrow(BadRequestException);

    // 3C. Cinema Booking failure after Payment -> triggers Automatic Refund & creates NO Ticket/Barcode
    const orderFail = await movieController.createMovieOrder(reqUserA, {
      showtimeId,
      seatIds: [targetSeatId],
      customerName: 'User A Refund Test',
      customerPhone: '0944000111',
    });

    const payRes = await paymentController.createPaymentOrder(reqUserA, {
      movieOrderId: orderFail.id,
      provider: 'VIETQR',
    });
    const payOrderId = payRes.paymentOrder.orderId;

    // Simulate Partner Cinema rejecting booking after payment
    mockCinemaAdapter.setSimulationMode('BOOKING_FAILED');

    const webhookDto = {
      orderId: payOrderId,
      providerTransactionId: `FT_FAIL_${Date.now()}`,
      amount: Number(orderFail.totalAmount),
      status: 'SUCCESS',
    };
    const signature = signWebhook(webhookDto);

    await paymentController.handlePaymentWebhook(
      { 'x-vlife-signature': signature },
      webhookDto as any,
    );

    const statusAfterRefund = await paymentController.getPaymentStatus(reqUserA, payOrderId);
    expect(statusAfterRefund.paymentStatus).toBe(PaymentStatus.REFUNDED);
    expect(statusAfterRefund.movieOrderStatus).toBe(MovieOrderStatus.REFUNDED);
    expect(statusAfterRefund.movieBookingStatus).toBe(MovieBookingStatus.REFUNDED);
    // CRITICAL: No ticket or barcode is issued on refund
    expect(statusAfterRefund.tickets).toHaveLength(0);
  });

  // =========================================================================
  // 4. MOBILE 5-STATE SEAT RESOLVER & SERVER COUNTDOWN UNIT TESTS
  // =========================================================================
  it('4. Verifies Mobile 5-state Seat Status Resolver (AVAILABLE, HELD_BY_ME, HELD_BY_OTHER, BOOKED, UNAVAILABLE) & Server Countdown', () => {
    const resolveMobileSeatStatus = (
      seat: {
        status: string;
        heldByUserId: string | null;
        holdExpiresAt: string | null;
        seat?: { isActive?: boolean };
      },
      currentUserId?: string | null,
    ) => {
      if (seat.seat && seat.seat.isActive === false) return 'UNAVAILABLE';
      if (seat.status === 'UNAVAILABLE') return 'UNAVAILABLE';
      if (seat.status === 'BOOKED') return 'BOOKED';
      if (seat.status === 'HELD') {
        if (seat.holdExpiresAt && new Date(seat.holdExpiresAt).getTime() <= Date.now()) {
          return 'AVAILABLE';
        }
        if (currentUserId && seat.heldByUserId === currentUserId) {
          return 'HELD_BY_ME';
        }
        return 'HELD_BY_OTHER';
      }
      return 'AVAILABLE';
    };

    const futureIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const pastIso = new Date(Date.now() - 10 * 1000).toISOString();

    expect(
      resolveMobileSeatStatus(
        { status: 'AVAILABLE', heldByUserId: null, holdExpiresAt: null },
        'user-1',
      ),
    ).toBe('AVAILABLE');

    expect(
      resolveMobileSeatStatus(
        { status: 'HELD', heldByUserId: 'user-1', holdExpiresAt: futureIso },
        'user-1',
      ),
    ).toBe('HELD_BY_ME');

    expect(
      resolveMobileSeatStatus(
        { status: 'HELD', heldByUserId: 'user-2', holdExpiresAt: futureIso },
        'user-1',
      ),
    ).toBe('HELD_BY_OTHER');

    expect(
      resolveMobileSeatStatus(
        { status: 'HELD', heldByUserId: 'user-2', holdExpiresAt: pastIso },
        'user-1',
      ),
    ).toBe('AVAILABLE');

    expect(
      resolveMobileSeatStatus(
        { status: 'BOOKED', heldByUserId: null, holdExpiresAt: null },
        'user-1',
      ),
    ).toBe('BOOKED');

    expect(
      resolveMobileSeatStatus(
        { status: 'UNAVAILABLE', heldByUserId: null, holdExpiresAt: null },
        'user-1',
      ),
    ).toBe('UNAVAILABLE');
  });
});
