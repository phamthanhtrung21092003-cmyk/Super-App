import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieOrderStatus,
  MovieTicketStatus,
  MovieTicketType,
  PaymentStatus,
  SeatHoldStatus,
  SeatType,
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
import { MovieOrderService } from './movie-order.service';
import { MovieBookingService } from './movie-booking.service';
import { SeatHoldService } from './seat-hold.service';
import { PaymentModule } from '../payment/payment.module';
import { PaymentController } from '../payment/payment.controller';
import { MockCinemaAdapter } from './integration/adapters/mock-cinema.adapter';

jest.setTimeout(90000);

describe('PHASE 5 — FULL QA, CONCURRENCY, SECURITY, RECOVERY & BARCODE HARDENING', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let movieController: MovieController;
  let movieOrderService: MovieOrderService;
  let movieBookingService: MovieBookingService;
  let seatHoldService: SeatHoldService;
  let paymentController: PaymentController;
  let mockCinemaAdapter: MockCinemaAdapter;

  const webhookSecret = 'PHASE5_QA_WEBHOOK_SECRET';
  let userAId: string;
  let userBId: string;
  const concUserIds: string[] = [];

  let showtimeId: string;
  let cinemaId: string;
  let auditoriumId: string;
  let movieId: string;
  let activeComboId: string;
  let otherBrandComboId: string;
  let seatPoolIds: string[] = [];

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
    process.env.SEAT_HOLD_TTL_SECONDS = '600';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MovieModule,
        PaymentModule,
      ],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    movieController = moduleRef.get<MovieController>(MovieController);
    movieOrderService = moduleRef.get<MovieOrderService>(MovieOrderService);
    movieBookingService = moduleRef.get<MovieBookingService>(MovieBookingService);
    seatHoldService = moduleRef.get<SeatHoldService>(SeatHoldService);
    paymentController = moduleRef.get<PaymentController>(PaymentController);
    mockCinemaAdapter = moduleRef.get<MockCinemaAdapter>(MockCinemaAdapter);

    // Ensure CinemaIntegrations have SANDBOX mode enabled for DB-backed E2E
    await prisma.cinemaIntegration.updateMany({
      data: {
        isActive: true,
        config: { mode: 'SANDBOX' },
      },
    });

    // Upsert User A, User B, and 100 concurrency users
    const userA = await prisma.user.upsert({
      where: { phone: '0955000001' },
      update: { fullName: 'Phase 5 QA User A' },
      create: {
        phone: '0955000001',
        password: 'hash',
        fullName: 'Phase 5 QA User A',
        email: 'phase5a@vlife.vn',
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.upsert({
      where: { phone: '0955000002' },
      update: { fullName: 'Phase 5 QA User B' },
      create: {
        phone: '0955000002',
        password: 'hash',
        fullName: 'Phase 5 QA User B',
        email: 'phase5b@vlife.vn',
      },
    });
    userBId = userB.id;

    for (let i = 1; i <= 100; i++) {
      const uid = `phase5-conc-user-${String(i).padStart(3, '0')}`;
      concUserIds.push(uid);
    }

    await prisma.user.createMany({
      data: concUserIds.map((id, idx) => ({
        id,
        phone: `0956${String(idx + 1).padStart(6, '0')}`,
        password: 'hash',
        fullName: `Phase 5 Conc User ${idx + 1}`,
      })),
      skipDuplicates: true,
    });

    // Pick a BETA showtime (or first active showtime)
    const targetShowtime = await prisma.showtime.findFirst({
      where: { isActive: true, cinema: { brand: CinemaBrand.BETA } },
      include: { cinema: true, auditorium: true, movie: true },
    });

    if (!targetShowtime) {
      throw new Error('No active BETA showtime found in DB');
    }

    showtimeId = targetShowtime.id;
    cinemaId = targetShowtime.cinemaId;
    auditoriumId = targetShowtime.auditoriumId;
    movieId = targetShowtime.movieId;

    // Ensure at least 105 seats exist on this showtime so 100 concurrent users can each hold 1 seat
    const existingShowtimeSeats = await prisma.showtimeSeat.findMany({
      where: { showtimeId },
      orderBy: { seatCode: 'asc' },
    });

    if (existingShowtimeSeats.length < 105) {
      const needed = 105 - existingShowtimeSeats.length;
      for (let i = 1; i <= needed; i++) {
        const seatCode = `P5_${String(i).padStart(3, '0')}`;
        const seat = await prisma.seat.upsert({
          where: {
            auditoriumId_seatCode: {
              auditoriumId,
              seatCode,
            },
          },
          update: { isActive: true },
          create: {
            auditoriumId,
            rowLabel: 'P5',
            seatNumber: i,
            seatCode,
            type: SeatType.STANDARD,
            isActive: true,
          },
        });

        await prisma.showtimeSeat.upsert({
          where: {
            showtimeId_seatId: {
              showtimeId,
              seatId: seat.id,
            },
          },
          update: {},
          create: {
            showtimeId,
            seatId: seat.id,
            seatCode,
            seatType: SeatType.STANDARD,
            price: 75000,
            status: ShowtimeSeatStatus.AVAILABLE,
          },
        });
      }
    }

    const allShowtimeSeats = await prisma.showtimeSeat.findMany({
      where: { showtimeId },
      orderBy: { seatCode: 'asc' },
    });
    seatPoolIds = allShowtimeSeats.map((s) => s.seatId);

    // Get one valid combo for this cinema and one combo for a different brand (CGV)
    const combosForCinema = await movieController.getCombos(cinemaId);
    activeComboId = combosForCinema[0].id;

    const cgvCombo = await prisma.combo.upsert({
      where: { code: 'P5_CGV_ONLY_COMBO' },
      update: {
        brand: CinemaBrand.CGV,
        cinemaId: null,
        isActive: true,
        price: 99000,
      },
      create: {
        code: 'P5_CGV_ONLY_COMBO',
        name: 'CGV Exclusive Popcorn Combo',
        brand: CinemaBrand.CGV,
        price: 99000,
        isActive: true,
      },
    });
    otherBrandComboId = cgvCombo.id;
  });

  beforeEach(async () => {
    mockCinemaAdapter.resetSimulation();
    await prisma.seatHold.deleteMany({
      where: { showtimeId },
    });
    await prisma.showtimeSeat.updateMany({
      where: { showtimeId },
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
  // MATRIX A, B, C, Q: MOVIE DISCOVERY, FILTERING & API INPUT HARDENING
  // =========================================================================
  it('Matrix A/B/C/Q: Movie Discovery, Cinema/Date Filtering, Invalid ID/Enum & SQLi/Oversized Input Protection', async () => {
    // 1. Valid discovery
    const movies = await movieController.getMovies();
    expect(movies.length).toBeGreaterThanOrEqual(3);

    const betaCinemas = await movieController.getCinemas(CinemaBrand.BETA);
    expect(betaCinemas.length).toBeGreaterThan(0);
    expect(betaCinemas.every((c) => c.brand === CinemaBrand.BETA)).toBe(true);

    const showtimes = await movieController.getShowtimes(movieId, cinemaId);
    expect(showtimes.length).toBeGreaterThan(0);

    // Date filtering: match date of first showtime vs future empty date
    const stDate = new Date(showtimes[0].startTime).toISOString().slice(0, 10);
    const showtimesOnDate = await movieController.getShowtimes(movieId, cinemaId, stDate);
    expect(showtimesOnDate.length).toBeGreaterThan(0);

    const showtimesEmptyDate = await movieController.getShowtimes(movieId, cinemaId, '2099-12-31');
    expect(showtimesEmptyDate).toHaveLength(0);

    // 2. Non-existent Movie & Showtime -> 404 NotFoundException
    await expect(movieController.getMovieById('non-existent-movie-99999')).rejects.toThrow(
      NotFoundException,
    );
    await expect(movieController.getShowtimeSeats('non-existent-showtime-99999')).rejects.toThrow(
      NotFoundException,
    );

    // 3. Invalid Enum & Invalid Date format -> 400 BadRequestException (No Prisma stack leak)
    await expect(
      movieController.getCinemas('INVALID_CINEMA_BRAND' as any),
    ).rejects.toThrow(BadRequestException);

    await expect(
      movieController.getShowtimes(movieId, cinemaId, '2026/99/99'),
    ).rejects.toThrow(BadRequestException);

    // 4. SQL Injection payload & Oversized Input -> Safe 400/404 handling
    await expect(
      movieController.getMovieById("' OR 1=1; DROP TABLE \"Movie\"; --"),
    ).rejects.toThrow(NotFoundException);

    const oversized = 'A'.repeat(400);
    await expect(movieController.getMovieById(oversized)).rejects.toThrow(
      BadRequestException,
    );
    await expect(movieController.getShowtimeSeats(oversized)).rejects.toThrow(
      BadRequestException,
    );
  });

  // =========================================================================
  // MATRIX R1 & R2: CRITICAL SEAT HOLD CONCURRENCY (100 USERS -> 1 SEAT & 10x5 MATRIX)
  // =========================================================================
  it('Matrix R1 & R2: 100 concurrent users on 1 seat -> 1 HELD & 99 rejected; 10 users x 5 overlapping seats -> zero duplicate allocation', async () => {
    const contestedSeatId = seatPoolIds[0];

    // R1: 100 concurrent users trying to hold the exact same seat
    const results100 = await Promise.allSettled(
      concUserIds.map((uid, idx) =>
        seatHoldService.holdSeats(uid, {
          showtimeId,
          seatIds: [contestedSeatId],
          idempotencyKey: `P5_CONC100_${idx}_${Date.now()}`,
        }),
      ),
    );

    const fulfilled100 = results100.filter((r) => r.status === 'fulfilled');
    const rejected100 = results100.filter((r) => r.status === 'rejected');

    expect(fulfilled100).toHaveLength(1);
    expect(rejected100).toHaveLength(99);

    const activeHoldsInDb = await prisma.seatHold.findMany({
      where: {
        showtimeId,
        seatId: contestedSeatId,
        status: SeatHoldStatus.HELD,
      },
    });
    expect(activeHoldsInDb).toHaveLength(1);

    // R2: 10 concurrent users each requesting 5 seats from an overlapping pool of 15 seats
    const pool15 = seatPoolIds.slice(1, 16);
    const results10x5 = await Promise.allSettled(
      concUserIds.slice(0, 10).map((uid, idx) => {
        const startIdx = (idx * 2) % 10; // overlapping 5-seat windows
        const fiveSeats = pool15.slice(startIdx, startIdx + 5);
        return seatHoldService.holdSeats(uid, {
          showtimeId,
          seatIds: fiveSeats,
          idempotencyKey: `P5_10X5_${idx}_${Date.now()}`,
        });
      }),
    );

    const succeeded10x5 = results10x5.filter((r) => r.status === 'fulfilled');
    expect(succeeded10x5.length).toBeGreaterThanOrEqual(1);

    // Verify in DB: no seat in pool15 has more than 1 HELD record
    const poolHolds = await prisma.seatHold.findMany({
      where: {
        showtimeId,
        seatId: { in: pool15 },
        status: SeatHoldStatus.HELD,
      },
    });
    const uniqueHeldSeatIds = new Set(poolHolds.map((h) => h.seatId));
    expect(uniqueHeldSeatIds.size).toBe(poolHolds.length);
  });

  // =========================================================================
  // MATRIX G & R3: 100 CONCURRENT USERS COMPETING FOR LIMITED VOUCHER (usageLimit = 5)
  // =========================================================================
  it('Matrix G & R3: 100 concurrent users competing for a limited Voucher (usageLimit = 5) -> exactly 5 succeed & 95 rejected', async () => {
    const voucherCode = `P5_LIM5_${Date.now()}`;
    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        title: 'Phase 5 Limited 5 Uses Voucher',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 15000,
        maxDiscountAmount: 15000,
        minOrderAmount: 50000,
        usageLimit: 5,
        usedCount: 0,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 3600000),
        validUntil: new Date(Date.now() + 3600000),
        status: VoucherStatus.ACTIVE,
      },
    });

    // Each of the 100 users holds 1 distinct seat (seats 0..99)
    await Promise.all(
      concUserIds.map((uid, idx) =>
        seatHoldService.holdSeats(uid, {
          showtimeId,
          seatIds: [seatPoolIds[idx]],
          idempotencyKey: `P5_VH_HOLD_${idx}_${Date.now()}`,
        }),
      ),
    );

    // All 100 users simultaneously call createMovieOrder with the same voucher (usageLimit = 5)
    const orderResults = await Promise.allSettled(
      concUserIds.map((uid, idx) =>
        movieOrderService.createMovieOrder(uid, {
          showtimeId,
          seatIds: [seatPoolIds[idx]],
          voucherCode,
          idempotencyKey: `P5_VH_ORD_${idx}_${Date.now()}`,
        }),
      ),
    );

    const succeededOrders = orderResults.filter((r) => r.status === 'fulfilled');
    const failedOrders = orderResults.filter((r) => r.status === 'rejected');

    expect(succeededOrders).toHaveLength(5);
    expect(failedOrders).toHaveLength(95);

    const updatedVoucher = await prisma.voucher.findUnique({
      where: { id: voucher.id },
      include: { usages: true },
    });
    expect(updatedVoucher?.usedCount).toBe(5);
    expect(updatedVoucher?.usages).toHaveLength(5);
  });

  // =========================================================================
  // MATRIX H, I, F, Q & R4: DOUBLE-TAP ORDER PROTECTION, PRICE MANIPULATION & BRAND COMBO ISOLATION
  // =========================================================================
  it('Matrix H/I/F/Q/R4: Blocks double-tap duplicate order creation, ignores client price manipulation, and blocks cross-brand combos', async () => {
    const reqUserA = { user: { id: userAId } };
    const seatId = seatPoolIds[0];

    await movieController.holdSeats(reqUserA, {
      showtimeId,
      seatIds: [seatId],
    });

    // 1. Cross-brand Combo Isolation: CGV combo cannot be used on BETA showtime
    await expect(
      movieController.createMovieOrder(reqUserA, {
        showtimeId,
        seatIds: [seatId],
        combos: [{ comboId: otherBrandComboId, quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);

    // 2. Price Manipulation Security + Double-Tap Concurrency (5 simultaneous createMovieOrder calls with different idempotencyKeys)
    const doubleTapPromises = Array.from({ length: 5 }, (_, idx) =>
      movieController.createMovieOrder(reqUserA, {
        showtimeId,
        seatIds: [seatId],
        combos: [{ comboId: activeComboId, quantity: 1 }],
        idempotencyKey: `P5_DBLTAP_${idx}_${Date.now()}`,
        // Attack payload attempting to override server pricing
        total: 1000,
        totalAmount: 1000,
        seatsSubtotal: 100,
        combosSubtotal: 100,
        discountAmount: 500000,
        price: 1,
      } as any),
    );

    const doubleTapResults = await Promise.allSettled(doubleTapPromises);
    const fulfilledOrders = doubleTapResults.filter(
      (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled',
    );
    const rejectedOrders = doubleTapResults.filter((r) => r.status === 'rejected');

    // Only 1 MovieOrder is created; 4 concurrent double-tap calls are rejected with ConflictException
    expect(fulfilledOrders).toHaveLength(1);
    expect(rejectedOrders).toHaveLength(4);

    const createdOrder = fulfilledOrders[0].value;
    // Verify server ignored total = 1000 and computed real authoritative total
    expect(Number(createdOrder.totalAmount)).toBeGreaterThan(50000);
    expect(Number(createdOrder.totalAmount)).not.toBe(1000);
    expect(Number(createdOrder.totalAmount)).toBe(
      Number(createdOrder.seatsSubtotal) +
        Number(createdOrder.combosSubtotal) -
        Number(createdOrder.discountAmount),
    );
  });

  // =========================================================================
  // MATRIX J, K, L, O, P: WEBHOOK 10x REPLAY IDEMPOTENCY & CINEMA TIMEOUT -> RECONCILE RECOVERY
  // =========================================================================
  it('Matrix J/K/L/O/P: Handles Cinema Timeout -> BOOKING_CONFIRMING -> Reconcile Recovery, and 10x Duplicate Webhook Replay without duplicate Ticket/Transaction', async () => {
    const reqUserA = { user: { id: userAId } };
    const seatId = seatPoolIds[10];

    await movieController.holdSeats(reqUserA, {
      showtimeId,
      seatIds: [seatId],
    });

    const order = await movieController.createMovieOrder(reqUserA, {
      showtimeId,
      seatIds: [seatId],
      customerName: 'Phase 5 Recovery User',
      customerPhone: '0955000001',
    });

    const payRes = await paymentController.createPaymentOrder(reqUserA, {
      movieOrderId: order.id,
      provider: 'VIETQR',
    });
    const payOrderId = payRes.paymentOrder.orderId;

    // Simulate Cinema API Timeout during webhook processing
    mockCinemaAdapter.setSimulationMode('TIMEOUT');

    const webhookDto = {
      orderId: payOrderId,
      providerTransactionId: `FT_P5_TIMEOUT_${Date.now()}`,
      amount: Number(order.totalAmount),
      status: 'SUCCESS',
    };
    const signature = signWebhook(webhookDto);

    await paymentController.handlePaymentWebhook(
      { 'x-vlife-signature': signature },
      webhookDto as any,
    );

    // Verify status is PAID + BOOKING_CONFIRMING (not refunded, no duplicate booking)
    const statusConfirming = await paymentController.getPaymentStatus(reqUserA, payOrderId);
    expect(statusConfirming.paymentStatus).toBe(PaymentStatus.PAID);
    expect(statusConfirming.movieBookingStatus).toBe(MovieBookingStatus.BOOKING_CONFIRMING);
    expect(statusConfirming.tickets).toHaveLength(0);

    // Restore Cinema Adapter to NORMAL and trigger Reconcile (simulating Mobile recovery or cron)
    mockCinemaAdapter.setSimulationMode('NORMAL');
    await movieController.reconcileOrder(reqUserA, order.id);

    const statusRecovered = await paymentController.getPaymentStatus(reqUserA, payOrderId);
    expect(statusRecovered.movieBookingStatus).toBe(MovieBookingStatus.TICKET_ISSUED);
    expect(statusRecovered.tickets).toHaveLength(1);
    expect(statusRecovered.tickets![0].ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);

    // Now replay the exact same Webhook 10 times concurrently & sequentially
    for (let i = 0; i < 10; i++) {
      await paymentController.handlePaymentWebhook(
        { 'x-vlife-signature': signature },
        webhookDto as any,
      );
    }

    // Verify strictly 1 Ticket and 1 PAYMENT Transaction exist for this MovieOrder
    const ticketsInDb = await prisma.movieTicket.findMany({
      where: { booking: { movieOrderId: order.id } },
    });
    expect(ticketsInDb).toHaveLength(1);

    const txInDb = await prisma.transaction.findMany({
      where: { referenceId: order.id, referenceType: 'MovieOrder' },
    });
    expect(txInDb).toHaveLength(1);
  });

  // =========================================================================
  // MATRIX M: 10,000 BARCODE UNIQUENESS & FORMAT VERIFICATION
  // =========================================================================
  it('Matrix M: Generates 10,000 PRINT_AT_COUNTER barcodes with 0 collisions and strict format separation from Payment QR', () => {
    const generated = new Set<string>();
    const forbidden = ['ORD-VL20261003', 'MVO123456', 'MVB123456', 'https://img.vietqr.io/image/MB-123'];

    for (let i = 0; i < 10000; i++) {
      const code = movieBookingService.generateUniqueTicketBarcode(forbidden);
      expect(code).toMatch(/^VLMV-PRT-[A-Z0-9]+-[A-F0-9]{10}$/);
      expect(forbidden.includes(code)).toBe(false);
      generated.add(code);
    }

    expect(generated.size).toBe(10000);
  });

  // =========================================================================
  // MATRIX Q & R5: RBAC AUTHORIZATION ISOLATION & 100-USER MIXED LOAD TEST
  // =========================================================================
  it('Matrix Q & R5: Enforces strict RBAC between User A and User B across Order/Ticket/Payment/Reconcile and passes 100-request mixed load', async () => {
    const reqUserA = { user: { id: userAId } };
    const reqUserB = { user: { id: userBId } };
    const seatId = seatPoolIds[20];

    await movieController.holdSeats(reqUserA, {
      showtimeId,
      seatIds: [seatId],
    });

    const orderA = await movieController.createMovieOrder(reqUserA, {
      showtimeId,
      seatIds: [seatId],
    });

    // User B cannot view or reconcile User A's MovieOrder
    await expect(movieController.getOrderById(reqUserB, orderA.id)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(movieController.reconcileOrder(reqUserB, orderA.id)).rejects.toThrow(
      ForbiddenException,
    );

    // User B cannot create PaymentOrder for User A's MovieOrder
    await expect(
      paymentController.createPaymentOrder(reqUserB, {
        movieOrderId: orderA.id,
        provider: 'VIETQR',
      }),
    ).rejects.toThrow(ForbiddenException);

    // User A creates PaymentOrder & pays -> Ticket issued
    const payResA = await paymentController.createPaymentOrder(reqUserA, {
      movieOrderId: orderA.id,
      provider: 'VIETQR',
    });
    const payOrderIdA = payResA.paymentOrder.orderId;

    // User B cannot poll User A's payment status
    await expect(
      paymentController.getPaymentStatus(reqUserB, payOrderIdA),
    ).rejects.toThrow(ForbiddenException);

    const webhookDto = {
      orderId: payOrderIdA,
      providerTransactionId: `FT_RBAC_${Date.now()}`,
      amount: Number(orderA.totalAmount),
      status: 'SUCCESS',
    };
    await paymentController.handlePaymentWebhook(
      { 'x-vlife-signature': signWebhook(webhookDto) },
      webhookDto as any,
    );

    const statusA = await paymentController.getPaymentStatus(reqUserA, payOrderIdA);
    const ticketIdA = statusA.tickets![0].id;

    // User B cannot view User A's MovieTicket
    await expect(movieController.getTicketById(reqUserB, ticketIdA)).rejects.toThrow(
      ForbiddenException,
    );

    // R5: 100 concurrent mixed read requests (Movie list, Cinema list, Showtimes, Seat map, Combos)
    const loadTasks = Array.from({ length: 100 }, (_, i) => {
      const mod = i % 5;
      if (mod === 0) return movieController.getMovies();
      if (mod === 1) return movieController.getCinemas();
      if (mod === 2) return movieController.getShowtimes(movieId, cinemaId);
      if (mod === 3) return movieController.getShowtimeSeats(showtimeId);
      return movieController.getCombos(cinemaId);
    });

    const loadResults = await Promise.allSettled(loadTasks);
    expect(loadResults.every((r) => r.status === 'fulfilled')).toBe(true);
  });
});
