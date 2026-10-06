import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieTicketStatus,
  MovieTicketType,
  SeatType,
  ShowtimeSeatStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CinemaIntegrationService } from './cinema-integration.service';
import { CgvAdapter } from './adapters/cgv.adapter';
import { LotteAdapter } from './adapters/lotte.adapter';
import { GalaxyAdapter } from './adapters/galaxy.adapter';
import { BetaAdapter } from './adapters/beta.adapter';
import { BhdAdapter } from './adapters/bhd.adapter';
import { CinestarAdapter } from './adapters/cinestar.adapter';
import { MockCinemaAdapter } from './adapters/mock-cinema.adapter';
import {
  CinemaCapability,
  CinemaProviderRuntimeConfig,
} from './dto/normalized-cinema.dto';
import {
  CinemaIntegrationErrorCode,
  CinemaIntegrationException,
  UnsupportedCapabilityError,
} from './cinema-integration.errors';

describe('Phase 2 — Cinema Integration Platform & Adapters', () => {
  let service: CinemaIntegrationService;
  let cgvAdapter: CgvAdapter;
  let lotteAdapter: LotteAdapter;
  let galaxyAdapter: GalaxyAdapter;
  let betaAdapter: BetaAdapter;
  let bhdAdapter: BhdAdapter;
  let cinestarAdapter: CinestarAdapter;
  let mockCinemaAdapter: MockCinemaAdapter;

  const mockCinemaIntegrations: Record<string, any> = {
    CGV: {
      id: 'int-cgv-01',
      brand: CinemaBrand.CGV,
      adapterKey: 'cgv-adapter',
      providerName: 'CGV Cinemas Vietnam',
      baseUrl: 'https://sandbox.cgv.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: true,
      isActive: true,
      config: {
        capabilities: [
          CinemaCapability.SHOWTIME,
          CinemaCapability.SEAT_MAP,
          CinemaCapability.SEAT_AVAILABILITY,
          CinemaCapability.BOOKING,
          CinemaCapability.CANCELLATION,
          CinemaCapability.TICKET,
        ],
      },
    },
    LOTTE: {
      id: 'int-lotte-01',
      brand: CinemaBrand.LOTTE,
      adapterKey: 'lotte-adapter',
      providerName: 'Lotte Cinema Vietnam',
      baseUrl: 'https://sandbox.lottecinema.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: true,
      isActive: true,
      config: {},
    },
    GALAXY: {
      id: 'int-galaxy-01',
      brand: CinemaBrand.GALAXY,
      adapterKey: 'galaxy-adapter',
      providerName: 'Galaxy Cinema Vietnam',
      baseUrl: 'https://sandbox.galaxycine.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: false,
      isActive: true,
      config: {},
    },
    BETA: {
      id: 'int-beta-01',
      brand: CinemaBrand.BETA,
      adapterKey: 'beta-adapter',
      providerName: 'Beta Cinemas Vietnam',
      baseUrl: 'https://sandbox.betacinemas.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: true,
      isActive: true,
      config: {},
    },
    BHD: {
      id: 'int-bhd-01',
      brand: CinemaBrand.BHD,
      adapterKey: 'bhd-adapter',
      providerName: 'BHD Star Cineplex',
      baseUrl: 'https://sandbox.bhdstar.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: true,
      isActive: true,
      config: {},
    },
    CINESTAR: {
      id: 'int-cinestar-01',
      brand: CinemaBrand.CINESTAR,
      adapterKey: 'cinestar-adapter',
      providerName: 'Cinestar Vietnam',
      baseUrl: 'https://sandbox.cinestar.com.vn',
      apiVersion: 'v1',
      authType: 'API_KEY',
      timeoutMs: 200,
      retryLimit: 3,
      holdTtlSeconds: 600,
      supportsCancel: true,
      isActive: true,
      config: {},
    },
  };

  const mockEnvVars: Record<string, string> = {
    CGV_API_KEY: 'secret-cgv-key-do-not-leak',
    LOTTE_API_KEY: 'secret-lotte-key-do-not-leak',
    GALAXY_API_KEY: 'secret-galaxy-key-do-not-leak',
    BETA_API_KEY: 'secret-beta-key-do-not-leak',
    BHD_API_KEY: 'secret-bhd-key-do-not-leak',
    CINESTAR_API_KEY: 'secret-cinestar-key-do-not-leak',
  };

  const mockPrismaService = {
    cinemaIntegration: {
      findUnique: jest.fn(({ where }: { where: { brand: CinemaBrand } }) => {
        return Promise.resolve(mockCinemaIntegrations[where.brand] || null);
      }),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => mockEnvVars[key]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CinemaIntegrationService,
        CgvAdapter,
        LotteAdapter,
        GalaxyAdapter,
        BetaAdapter,
        BhdAdapter,
        CinestarAdapter,
        MockCinemaAdapter,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CinemaIntegrationService>(CinemaIntegrationService);
    cgvAdapter = module.get<CgvAdapter>(CgvAdapter);
    lotteAdapter = module.get<LotteAdapter>(LotteAdapter);
    galaxyAdapter = module.get<GalaxyAdapter>(GalaxyAdapter);
    betaAdapter = module.get<BetaAdapter>(BetaAdapter);
    bhdAdapter = module.get<BhdAdapter>(BhdAdapter);
    cinestarAdapter = module.get<CinestarAdapter>(CinestarAdapter);
    mockCinemaAdapter = module.get<MockCinemaAdapter>(MockCinemaAdapter);
    mockCinemaAdapter.resetSimulation();
  });

  // ==========================================================================
  // 1. ADAPTER NORMALIZATION & CONTRACT TESTS (ALL 6 BRANDS)
  // ==========================================================================
  describe('1. Adapter Data Normalization across 6 Cinema Brands', () => {
    const sampleRuntimeConfig = (brand: CinemaBrand): CinemaProviderRuntimeConfig => ({
      integrationId: `int-${brand}`,
      brand,
      adapterKey: `${brand.toLowerCase()}-adapter`,
      providerName: `${brand} Provider`,
      baseUrl: `https://api.${brand.toLowerCase()}.vn`,
      apiVersion: 'v1',
      authType: 'API_KEY',
      apiKey: 'test-key-123',
      timeoutMs: 1000,
      retryLimit: 2,
      holdTtlSeconds: 600,
      supportsCancel: true,
      capabilities: [
        CinemaCapability.SHOWTIME,
        CinemaCapability.SEAT_MAP,
        CinemaCapability.SEAT_AVAILABILITY,
        CinemaCapability.BOOKING,
        CinemaCapability.CANCELLATION,
        CinemaCapability.TICKET,
      ],
      isActive: true,
    });

    it('CGV Adapter normalizes Movie, Cinema, Showtime, Seat, Booking, Cancel & Ticket', async () => {
      const cfg = sampleRuntimeConfig(CinemaBrand.CGV);
      cgvAdapter.setTransport(async ({ url }) => {
        if (url.endsWith('/movies')) {
          return [
            {
              movie_code: 'CGV-M1',
              movie_title_vn: 'Mai',
              movie_title_en: 'Mai (2024)',
              running_time_min: 131,
              genre_name: 'Tâm lý, Tình cảm',
              rating_code: 'T18',
              opening_date: '2026-02-10',
              is_now_showing: true,
            },
          ];
        }
        if (url.endsWith('/cinemas')) {
          return [
            {
              site_code: 'CGV-S1',
              site_name: 'CGV Vincom Đồng Khởi',
              site_address: '72 Lê Thánh Tôn',
              region_name: 'TP.HCM',
              gps_lat: 10.77,
              gps_lng: 106.7,
            },
          ];
        }
        if (url.endsWith('/seats')) {
          return {
            seats: [
              {
                seat_id: 'CGV-SEAT-A1',
                screen_code: 'CGV-AUD-1',
                row_name: 'A',
                col_no: 1,
                grade_code: 'SWEETBOX',
                seat_price: 240000,
                seat_state: 'HELD',
              },
            ],
          };
        }
        if (url.includes('/showtimes')) {
          return [
            {
              session_id: 'CGV-SH-1',
              movie_code: 'CGV-M1',
              site_code: 'CGV-S1',
              screen_code: 'CGV-AUD-1',
              session_start_time: '2026-10-05T10:00:00Z',
              session_end_time: '2026-10-05T12:15:00Z',
              projection_type: 'IMAX',
              standard_price: 110000,
              vip_price: 140000,
              sweetbox_price: 280000,
            },
          ];
        }
        if (url.endsWith('/bookings')) {
          return {
            cgv_reservation_no: 'CGV-BK-999',
            cgv_booking_pin: 'PIN-8888',
            session_id: 'CGV-SH-1',
            reserved_seats: ['CGV-SEAT-A1'],
            status: MovieBookingStatus.BOOKING_CONFIRMED,
          };
        }
        if (url.includes('/cancel')) {
          return { externalBookingId: 'CGV-BK-999', cancelled: true };
        }
        if (url.includes('/ticket')) {
          return {
            ticket_no: 'CGV-TK-1',
            cgv_reservation_no: 'CGV-BK-999',
            kiosk_barcode: 'CGV-BAR-8888',
            seat_labels: ['A1'],
          };
        }
        return [];
      });

      const movies = await cgvAdapter.getMovies(cfg);
      expect(movies[0].externalMovieId).toBe('CGV-M1');
      expect(movies[0].status).toBe('NOW_SHOWING');

      const cinemas = await cgvAdapter.getCinemas(cfg);
      expect(cinemas[0].brand).toBe(CinemaBrand.CGV);
      expect(cinemas[0].externalCinemaId).toBe('CGV-S1');

      const showtimes = await cgvAdapter.getShowtimes({ cinemaExternalId: 'CGV-S1' }, cfg);
      expect(showtimes[0].externalShowtimeId).toBe('CGV-SH-1');
      expect(showtimes[0].couplePrice).toBe(280000);

      const seatAvail = await cgvAdapter.getSeatAvailability('CGV-SH-1', cfg);
      expect(seatAvail.seats[0].seatType).toBe(SeatType.COUPLE);
      expect(seatAvail.seats[0].status).toBe(ShowtimeSeatStatus.HELD);

      const booking = await cgvAdapter.createBooking(
        {
          idempotencyKey: 'idem-cgv-1',
          orderCode: 'ORD-1',
          cinemaExternalId: 'CGV-S1',
          externalShowtimeId: 'CGV-SH-1',
          seatExternalIds: ['CGV-SEAT-A1'],
          customer: { fullName: 'Nguyen Van A', phone: '0909000111' },
          totalAmount: 240000,
        },
        cfg,
      );
      expect(booking.externalBookingId).toBe('CGV-BK-999');
      expect(booking.status).toBe(MovieBookingStatus.BOOKING_CONFIRMED);

      const cancelled = await cgvAdapter.cancelBooking(
        { idempotencyKey: 'idem-cancel-1', externalBookingId: 'CGV-BK-999' },
        cfg,
      );
      expect(cancelled.cancelled).toBe(true);
      expect(cancelled.status).toBe(MovieBookingStatus.CANCELLED);

      const ticket = await cgvAdapter.getTicket('CGV-BK-999', cfg);
      expect(ticket.ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);
      expect(ticket.barcode).toBe('CGV-BAR-8888');
    });

    it('Lotte, Galaxy, Beta, BHD, and Cinestar Adapters normalize distinct provider formats accurately', () => {
      const lotteMovie = lotteAdapter.mapMovie({
        RepresentationMovieCode: 'LOT-M1',
        film_nm: 'Đào, Phở và Piano',
        play_time: 105,
        genre_cd: 'Lịch sử',
        grade_cd: 'T13',
        release_ymd: '2026-02-10',
      });
      expect(lotteMovie.externalMovieId).toBe('LOT-M1');
      expect(lotteMovie.status).toBe('NOW_SHOWING');

      const galaxyMovie = galaxyAdapter.mapMovie({
        glx_film_id: 'GLX-M1',
        name_vn: 'Kẻ Ăn Hồn',
        duration_minutes: 109,
        categories: 'Kinh dị',
        censor_rating: 'T18',
      });
      expect(galaxyMovie.externalMovieId).toBe('GLX-M1');

      const betaMovie = betaAdapter.mapMovie({
        FilmId: 'BETA-M1',
        FilmNameVn: 'Bộ Tứ Báo Thủ',
        DurationMin: 128,
        Categories: 'Hài, Tình cảm',
        StatusFlag: 'COMING_SOON',
      });
      expect(betaMovie.externalMovieId).toBe('BETA-M1');
      expect(betaMovie.status).toBe('COMING_SOON');

      const bhdShowtime = bhdAdapter.mapShowtime({
        bhd_session_id: 'BHD-SH-1',
        bhd_movie_id: 'BHD-M1',
        bhd_location_id: 'BHD-LOC-1',
        bhd_screen_id: 'BHD-SCR-1',
        session_start: '2026-10-05T18:00:00Z',
        session_end: '2026-10-05T20:00:00Z',
        standard_price: 85000,
        vip_price: 105000,
        double_price: 210000,
      });
      expect(bhdShowtime.externalShowtimeId).toBe('BHD-SH-1');
      expect(bhdShowtime.couplePrice).toBe(210000);

      const csSeat = cinestarAdapter.mapSeat({
        csSeatId: 'CS-S1',
        csRoomCode: 'CS-R1',
        csRow: 'E',
        csCol: 10,
        csType: 'NORMAL',
        csPrice: 65000,
        csStatus: 'BLOCKED',
      });
      expect(csSeat.seatType).toBe(SeatType.STANDARD);
      expect(csSeat.status).toBe(ShowtimeSeatStatus.BLOCKED);
    });
  });
  // ==========================================================================
  // 2. INTEGRATION SERVICE ORCHESTRATION, RETRY, TIMEOUT & CAPABILITIES
  // ==========================================================================
  describe('2. CinemaIntegrationService Selection, Retry, Timeout & Capability Guards', () => {
    it('resolves the exact production adapter for all 6 brands without scattered if/else', () => {
      expect(service.resolveAdapter(CinemaBrand.CGV)).toBe(cgvAdapter);
      expect(service.resolveAdapter(CinemaBrand.LOTTE)).toBe(lotteAdapter);
      expect(service.resolveAdapter(CinemaBrand.GALAXY)).toBe(galaxyAdapter);
      expect(service.resolveAdapter(CinemaBrand.BETA)).toBe(betaAdapter);
      expect(service.resolveAdapter(CinemaBrand.BHD)).toBe(bhdAdapter);
      expect(service.resolveAdapter(CinemaBrand.CINESTAR)).toBe(cinestarAdapter);
      expect(service.resolveAdapter('mock-cinema-adapter')).toBe(mockCinemaAdapter);
    });

    it('throws CINEMA_UNAVAILABLE for unsupported provider', () => {
      expect(() => service.resolveAdapter('UNKNOWN_BRAND' as CinemaBrand)).toThrow(
        CinemaIntegrationException,
      );
      try {
        service.resolveAdapter('UNKNOWN_BRAND' as CinemaBrand);
      } catch (err) {
        expect((err as CinemaIntegrationException).errorCode).toBe(
          CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        );
      }
    });

    it('throws CINEMA_UNAVAILABLE when integration is disabled (isActive = false)', async () => {
      mockPrismaService.cinemaIntegration.findUnique.mockResolvedValueOnce({
        ...mockCinemaIntegrations.CGV,
        isActive: false,
      });

      await expect(service.getMovies(CinemaBrand.CGV)).rejects.toMatchObject({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
      });
    });

    it('retries read operations (getMovies) on transient timeout/unavailable errors and succeeds', async () => {
      let attempts = 0;
      cgvAdapter.setTransport(async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('503 Service Unavailable');
        }
        return [
          {
            movie_code: 'CGV-RETRY-OK',
            movie_title_vn: 'Phim Retry Thành Công',
            running_time_min: 120,
          },
        ];
      });

      const movies = await service.getMovies(CinemaBrand.CGV);
      expect(attempts).toBe(3);
      expect(movies).toHaveLength(1);
      expect(movies[0].externalMovieId).toBe('CGV-RETRY-OK');
    });

    it('enforces timeout and throws CINEMA_TIMEOUT when provider hangs beyond timeoutMs', async () => {
      cgvAdapter.setTransport(async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return [];
      });

      await expect(service.getMovies(CinemaBrand.CGV)).rejects.toMatchObject({
        errorCode: CinemaIntegrationErrorCode.CINEMA_TIMEOUT,
      });
    });

    it('NEVER auto-retries createBooking() on timeout or transient error to prevent duplicate bookings', async () => {
      let createBookingCalls = 0;
      cgvAdapter.setTransport(async () => {
        createBookingCalls += 1;
        throw new Error('ETIMEDOUT network timeout during booking');
      });

      await expect(
        service.createBooking(CinemaBrand.CGV, {
          idempotencyKey: 'idem-no-retry-001',
          orderCode: 'ORD-NO-RETRY-001',
          cinemaExternalId: 'CGV-S1',
          externalShowtimeId: 'CGV-SH-1',
          seatExternalIds: ['A1'],
          customer: { fullName: 'Nguyen Van A', phone: '0909111222' },
          totalAmount: 95000,
        }),
      ).rejects.toMatchObject({
        errorCode: CinemaIntegrationErrorCode.CINEMA_TIMEOUT,
      });

      // Strictly 1 attempt - no automatic retry on createBooking!
      expect(createBookingCalls).toBe(1);
    });

    it('throws UnsupportedCapabilityError (UNSUPPORTED_CAPABILITY) when capability is not supported', async () => {
      mockPrismaService.cinemaIntegration.findUnique.mockResolvedValueOnce({
        ...mockCinemaIntegrations.BETA,
        supportsCancel: false,
        config: {
          capabilities: [CinemaCapability.SHOWTIME], // BOOKING is missing
        },
      });

      await expect(
        service.createBooking(CinemaBrand.BETA, {
          idempotencyKey: 'idem-cap-test',
          orderCode: 'ORD-CAP-1',
          cinemaExternalId: 'BETA-C1',
          externalShowtimeId: 'BETA-S1',
          seatExternalIds: ['A1'],
          customer: { fullName: 'Nguyen Van B', phone: '0909222333' },
          totalAmount: 70000,
        }),
      ).rejects.toThrow(UnsupportedCapabilityError);
    });
  });

  // ==========================================================================
  // 3. SECURITY, CREDENTIALS & IDEMPOTENCY TESTS
  // ==========================================================================
  describe('3. Security, Secret Redaction & Idempotency Enforcement', () => {
    it('redacts API keys, secrets, tokens, passwords, and customer phone/email from logs', () => {
      const rawSensitivePayload = {
        provider: 'CGV',
        apiKey: 'secret-cgv-key-do-not-leak',
        apiSecret: 'top-secret-hmac',
        webhookSecret: 'whsec_999999',
        authorization: 'Bearer eyJhbGciOi...',
        nested: {
          password: 'my-password',
          customerPhone: '0909123456',
          customerEmail: 'user@vlife.vn',
          safeField: 'visible-value',
        },
      };

      const sanitized = service.sanitizeObject(rawSensitivePayload);
      const serialized = JSON.stringify(sanitized);

      expect(serialized).not.toContain('secret-cgv-key-do-not-leak');
      expect(serialized).not.toContain('top-secret-hmac');
      expect(serialized).not.toContain('whsec_999999');
      expect(serialized).not.toContain('eyJhbGciOi');
      expect(serialized).not.toContain('0909123456');
      expect(serialized).not.toContain('user@vlife.vn');
      expect((sanitized.nested as any).safeField).toBe('visible-value');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('returns INVALID_CREDENTIAL when API key is missing in environment', async () => {
      mockConfigService.get.mockReturnValue(undefined); // Missing API key

      await expect(service.getMovies(CinemaBrand.CGV)).rejects.toMatchObject({
        errorCode: CinemaIntegrationErrorCode.INVALID_CREDENTIAL,
      });

      // Restore mock
      mockConfigService.get.mockImplementation((key: string) => mockEnvVars[key]);
    });

    it('rejects createBooking when idempotencyKey is empty', async () => {
      await expect(
        service.createBooking(CinemaBrand.CGV, {
          idempotencyKey: '  ',
          orderCode: 'ORD-EMPTY-IDEM',
          cinemaExternalId: 'CGV-S1',
          externalShowtimeId: 'CGV-SH-1',
          seatExternalIds: ['A1'],
          customer: { fullName: 'Nguyen Van C', phone: '0909333444' },
          totalAmount: 95000,
        }),
      ).rejects.toMatchObject({
        errorCode: CinemaIntegrationErrorCode.BOOKING_FAILED,
      });
    });
  });

  // ==========================================================================
  // 4. MOCK CINEMA ADAPTER & WEBHOOK PREPARATION TESTS
  // ==========================================================================
  describe('4. MockCinemaAdapter Simulation & Webhook Readiness', () => {
    beforeEach(() => {
      service.setUseMockFallback(true);
    });

    afterEach(() => {
      service.setUseMockFallback(false);
    });

    it('simulates full flow: movies, cinemas, auditoriums, showtimes, seats, seatAvailability, idempotent booking & tickets', async () => {
      const movies = await service.getMovies(CinemaBrand.CGV);
      expect(movies.length).toBeGreaterThanOrEqual(2);

      const cinemas = await service.getCinemas(CinemaBrand.CGV);
      expect(cinemas[0].brand).toBe(CinemaBrand.CGV);

      const auditoriums = await service.getAuditoriums(CinemaBrand.CGV, cinemas[0].externalCinemaId);
      expect(auditoriums[0].screenType).toBe('2D IMAX');

      const showtimes = await service.getShowtimes(CinemaBrand.CGV, {
        cinemaExternalId: cinemas[0].externalCinemaId,
        movieExternalId: movies[0].externalMovieId,
      });
      expect(showtimes[0].basePrice).toBe(95000);

      const seats = await service.getSeats(CinemaBrand.CGV, auditoriums[0].externalAuditoriumId);
      expect(seats).toHaveLength(3);

      const availability = await service.getSeatAvailability(
        CinemaBrand.CGV,
        showtimes[0].externalShowtimeId,
      );
      expect(availability.seats.some((s) => s.status === ShowtimeSeatStatus.AVAILABLE)).toBe(true);

      const bookingReq = {
        idempotencyKey: 'idem-mock-booking-100',
        orderCode: 'ORD-100',
        cinemaExternalId: cinemas[0].externalCinemaId,
        externalShowtimeId: showtimes[0].externalShowtimeId,
        seatExternalIds: [seats[0].externalSeatId],
        customer: { fullName: 'Tran Thi D', phone: '0909555666' },
        totalAmount: seats[0].price || 95000,
      };

      const firstBooking = await service.createBooking(CinemaBrand.CGV, bookingReq);
      const duplicateBookingReplay = await service.createBooking(CinemaBrand.CGV, bookingReq);

      // Idempotent replay returns identical booking
      expect(duplicateBookingReplay.externalBookingId).toBe(firstBooking.externalBookingId);

      const ticket = await service.getTicket(CinemaBrand.CGV, firstBooking.externalBookingId);
      expect(ticket.ticketType).toBe(MovieTicketType.PRINT_AT_COUNTER);
      expect(ticket.status).toBe(MovieTicketStatus.ISSUED);
    });

    it('processes webhook preparation handlers cleanly', async () => {
      const bookingWh = await service.handleBookingWebhook({
        brand: CinemaBrand.CGV,
        eventType: 'BOOKING_CONFIRMED',
        externalBookingId: 'CGV-BK-100',
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
      });
      expect(bookingWh.acknowledged).toBe(true);
      expect(bookingWh.normalizedStatus).toBe('CONFIRMED');

      const ticketWh = await service.handleTicketWebhook({
        brand: CinemaBrand.LOTTE,
        eventType: 'TICKET_ISSUED',
        externalBookingId: 'LOT-BK-200',
        externalTicketId: 'TK-1',
        barcode: 'BAR-1',
        status: 'ISSUED',
        timestamp: new Date().toISOString(),
      });
      expect(ticketWh.acknowledged).toBe(true);
      expect(ticketWh.barcode).toBe('BAR-1');
    });
  });
});