import {
  PrismaClient,
  CinemaBrand,
  SeatHoldStatus,
  MovieOrderStatus,
  MovieOrderItemType,
  MovieBookingStatus,
  MovieTicketType,
  MovieTicketStatus,
  PaymentProvider,
  PaymentStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public';

describe('Phase 1 — Movie Domain Database & Prisma Schema Integrity Tests', () => {
  let pool: Pool;
  let prisma: PrismaClient;
  let testUserId: string;
  let testShowtimeId: string;
  let testCinemaId: string;
  let testMovieId: string;
  let testSeatE5Id: string;
  let testShowtimeSeatE5Id: string;
  let testComboId: string;
  let testVoucherId: string;
  const createdOrderIds: string[] = [];
  const createdBookingIds: string[] = [];
  const createdTicketIds: string[] = [];
  const createdHoldIds: string[] = [];
  const createdPaymentIds: string[] = [];

  beforeAll(async () => {
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    // Ensure a test user exists (Single Source of Truth User)
    const user = await prisma.user.upsert({
      where: { phone: '0900111222' },
      update: { fullName: 'Phase1 Movie Tester' },
      create: {
        phone: '0900111222',
        email: 'phase1.movie@vlife.vn',
        password: 'hashed_password',
        fullName: 'Phase1 Movie Tester',
      },
    });
    testUserId = user.id;

    const cinema = await prisma.cinema.findUniqueOrThrow({
      where: { code: 'beta-xuan-thuy' },
    });
    testCinemaId = cinema.id;

    const movie = await prisma.movie.findUniqueOrThrow({
      where: { slug: 'conan-movie-29-thien-than-sa-nga' },
    });
    testMovieId = movie.id;

    const showtime = await prisma.showtime.findFirstOrThrow({
      where: { cinemaId: testCinemaId, movieId: testMovieId },
    });
    testShowtimeId = showtime.id;

    const showtimeSeat = await prisma.showtimeSeat.findFirstOrThrow({
      where: { showtimeId: testShowtimeId, seatCode: 'E5' },
    });
    testShowtimeSeatE5Id = showtimeSeat.id;
    testSeatE5Id = showtimeSeat.seatId;

    const combo = await prisma.combo.findUniqueOrThrow({
      where: { code: 'BETA-COMBO-69OZ' },
    });
    testComboId = combo.id;

    const voucher = await prisma.voucher.findUniqueOrThrow({
      where: { code: 'VLIFEMOVIE20K' },
    });
    testVoucherId = voucher.id;
  });

  afterAll(async () => {
    // Clean up test records in reverse dependency order
    if (createdPaymentIds.length > 0) {
      await prisma.payment.deleteMany({ where: { id: { in: createdPaymentIds } } });
    }
    if (createdTicketIds.length > 0) {
      await prisma.movieTicket.deleteMany({ where: { id: { in: createdTicketIds } } });
    }
    if (createdBookingIds.length > 0) {
      await prisma.movieBooking.deleteMany({ where: { id: { in: createdBookingIds } } });
    }
    if (createdHoldIds.length > 0) {
      await prisma.seatHold.deleteMany({ where: { id: { in: createdHoldIds } } });
    }
    if (createdOrderIds.length > 0) {
      await prisma.voucherUsage.deleteMany({ where: { movieOrderId: { in: createdOrderIds } } });
      await prisma.movieOrderItem.deleteMany({ where: { movieOrderId: { in: createdOrderIds } } });
      await prisma.movieOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    await prisma.$disconnect();
    await pool.end();
  });

  it('1. Seed Verification: 6 Cinema Brands, Cinemas, Auditoriums, Seats, Movies, Showtimes, ShowtimeSeats, Combos, Vouchers exist', async () => {
    const integrations = await prisma.cinemaIntegration.findMany();
    expect(integrations.length).toBeGreaterThanOrEqual(6);

    const brands = integrations.map((i) => i.brand);
    expect(brands).toEqual(
      expect.arrayContaining([
        CinemaBrand.CGV,
        CinemaBrand.LOTTE,
        CinemaBrand.GALAXY,
        CinemaBrand.BETA,
        CinemaBrand.BHD,
        CinemaBrand.CINESTAR,
      ]),
    );

    const seatCount = await prisma.seat.count();
    expect(seatCount).toBeGreaterThanOrEqual(264);

    const showtimeSeatCount = await prisma.showtimeSeat.count();
    expect(showtimeSeatCount).toBeGreaterThanOrEqual(264);
  });

  it('2. Duplicate Active SeatHold Prevention: Partial unique index prevents 2 active HELD records for the same (showtimeId, seatId)', async () => {
    const hold1 = await prisma.seatHold.create({
      data: {
        holdCode: `HOLD-TEST-1-${Date.now()}`,
        showtimeId: testShowtimeId,
        seatId: testSeatE5Id,
        userId: testUserId,
        status: SeatHoldStatus.HELD,
        expiresAt: new Date(Date.now() + 600_000),
      },
    });
    createdHoldIds.push(hold1.id);

    // Attempting to create a second active HELD on the exact same showtimeId + seatId must fail
    await expect(
      prisma.seatHold.create({
        data: {
          holdCode: `HOLD-TEST-2-${Date.now()}`,
          showtimeId: testShowtimeId,
          seatId: testSeatE5Id,
          userId: testUserId,
          status: SeatHoldStatus.HELD,
          expiresAt: new Date(Date.now() + 600_000),
        },
      }),
    ).rejects.toThrow();

    // Once released, a new HELD on the same seat is allowed
    await prisma.seatHold.update({
      where: { id: hold1.id },
      data: { status: SeatHoldStatus.RELEASED, releasedAt: new Date() },
    });

    const hold2 = await prisma.seatHold.create({
      data: {
        holdCode: `HOLD-TEST-3-${Date.now()}`,
        showtimeId: testShowtimeId,
        seatId: testSeatE5Id,
        userId: testUserId,
        status: SeatHoldStatus.HELD,
        expiresAt: new Date(Date.now() + 600_000),
      },
    });
    createdHoldIds.push(hold2.id);
    expect(hold2.status).toBe(SeatHoldStatus.HELD);
  });

  it('3. Full End-to-End Relational Traceability: User -> MovieOrder (Seat + Combo + Voucher) -> Payment Core -> MovieBooking -> MovieTicket (Unique Barcode)', async () => {
    const suffix = Date.now();
    // 3.1 Create MovieOrder with snapshot pricing
    const order = await prisma.movieOrder.create({
      data: {
        orderCode: `MORD-${suffix}`,
        userId: testUserId,
        movieId: testMovieId,
        cinemaId: testCinemaId,
        showtimeId: testShowtimeId,
        voucherId: testVoucherId,
        voucherCode: 'VLIFEMOVIE20K',
        customerName: 'Phase1 Movie Tester',
        customerPhone: '0900111222',
        customerEmail: 'phase1.movie@vlife.vn',
        seatsSubtotal: 55000,
        combosSubtotal: 68000,
        serviceFee: 5000,
        discountAmount: 20000,
        totalAmount: 108000,
        status: MovieOrderStatus.PAYMENT_PENDING,
        idempotencyKey: `IDEM-MORD-${suffix}`,
        expiresAt: new Date(Date.now() + 600_000),
        items: {
          create: [
            {
              itemType: MovieOrderItemType.SEAT,
              seatId: testSeatE5Id,
              showtimeSeatId: testShowtimeSeatE5Id,
              nameSnapshot: 'Ghế VIP E5',
              codeSnapshot: 'E5',
              unitPrice: 55000,
              quantity: 1,
              totalPrice: 55000,
            },
            {
              itemType: MovieOrderItemType.COMBO,
              comboId: testComboId,
              nameSnapshot: 'Beta Combo 69oz',
              codeSnapshot: 'BETA-COMBO-69OZ',
              unitPrice: 68000,
              quantity: 1,
              totalPrice: 68000,
            },
          ],
        },
      },
      include: { items: true },
    });
    createdOrderIds.push(order.id);
    expect(order.items).toHaveLength(2);

    // 3.2 Link VoucherUsage (1 usage per order)
    const usage = await prisma.voucherUsage.create({
      data: {
        voucherId: testVoucherId,
        userId: testUserId,
        movieOrderId: order.id,
        discountAmount: 20000,
      },
    });
    expect(usage.movieOrderId).toBe(order.id);

    // 3.3 Link V-Life Shared Payment Core (Payment with movieOrderId, bookingId = null)
    const payment = await prisma.payment.create({
      data: {
        orderId: order.orderCode,
        movieOrderId: order.id,
        amount: order.totalAmount,
        provider: PaymentProvider.VIETQR,
        status: PaymentStatus.PAID,
        providerTransactionId: `BANK-MOVIE-${suffix}`,
        idempotencyKey: `PAY-MORD-${suffix}`,
      },
    });
    createdPaymentIds.push(payment.id);
    expect(payment.movieOrderId).toBe(order.id);
    expect(payment.bookingId).toBeNull();

    // 3.4 Create MovieBooking (1:1 with MovieOrder)
    const booking = await prisma.movieBooking.create({
      data: {
        bookingCode: `MBK-${suffix}`,
        movieOrderId: order.id,
        cinemaId: testCinemaId,
        showtimeId: testShowtimeId,
        externalBookingId: `BETA-EXT-${suffix}`,
        adapterBrand: CinemaBrand.BETA,
        status: MovieBookingStatus.TICKET_ISSUED,
        confirmedAt: new Date(),
      },
    });
    createdBookingIds.push(booking.id);

    // Duplicate MovieBooking for the same MovieOrder must fail (@unique movieOrderId)
    await expect(
      prisma.movieBooking.create({
        data: {
          bookingCode: `MBK-DUP-${suffix}`,
          movieOrderId: order.id,
          cinemaId: testCinemaId,
          showtimeId: testShowtimeId,
          adapterBrand: CinemaBrand.BETA,
          status: MovieBookingStatus.PENDING,
        },
      }),
    ).rejects.toThrow();

    // 3.5 Create MovieTicket with PRINT_AT_COUNTER and Unique Barcode (distinct from Payment OrderId)
    const barcodeValue = `BC-BETA-${suffix}-8899`;
    expect(barcodeValue).not.toBe(payment.orderId);

    const ticket = await prisma.movieTicket.create({
      data: {
        ticketCode: `TKT-${suffix}`,
        barcode: barcodeValue,
        bookingId: booking.id,
        movieId: testMovieId,
        cinemaId: testCinemaId,
        showtimeId: testShowtimeId,
        auditoriumName: 'Phòng chiếu P7',
        seatCodes: 'E5',
        combosSummary: '1x Beta Combo 69oz',
        ticketType: MovieTicketType.PRINT_AT_COUNTER,
        status: MovieTicketStatus.ISSUED,
        expiresAt: new Date(Date.now() + 86400_000),
      },
    });
    createdTicketIds.push(ticket.id);
    expect(ticket.ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);

    // Duplicate Barcode must fail (@unique barcode)
    await expect(
      prisma.movieTicket.create({
        data: {
          ticketCode: `TKT-DUP-${suffix}`,
          barcode: barcodeValue, // duplicate barcode
          bookingId: booking.id,
          movieId: testMovieId,
          cinemaId: testCinemaId,
          showtimeId: testShowtimeId,
          auditoriumName: 'Phòng chiếu P7',
          seatCodes: 'E5',
          ticketType: MovieTicketType.PRINT_AT_COUNTER,
          status: MovieTicketStatus.ISSUED,
          expiresAt: new Date(Date.now() + 86400_000),
        },
      }),
    ).rejects.toThrow();

    // 3.6 Verify reverse lookup from Barcode -> Ticket -> Booking -> MovieOrder -> Payment -> User
    const tracedTicket = await prisma.movieTicket.findUniqueOrThrow({
      where: { barcode: barcodeValue },
      include: {
        booking: {
          include: {
            movieOrder: {
              include: {
                user: true,
                payments: true,
                items: true,
              },
            },
          },
        },
      },
    });

    expect(tracedTicket.booking.movieOrder.user.id).toBe(testUserId);
    expect(tracedTicket.booking.movieOrder.payments[0].id).toBe(payment.id);
    expect(tracedTicket.booking.movieOrder.items).toHaveLength(2);
  });

  it('4. Restrict Behavior: Cannot delete a Movie or Cinema that has active Showtimes/Orders', async () => {
    await expect(
      prisma.movie.delete({ where: { id: testMovieId } }),
    ).rejects.toThrow();

    await expect(
      prisma.cinema.delete({ where: { id: testCinemaId } }),
    ).rejects.toThrow();
  });
});