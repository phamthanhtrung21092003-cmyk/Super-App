import { Injectable } from '@nestjs/common';
import {
  CinemaBrand,
  MovieBookingStatus,
  MovieTicketStatus,
  MovieTicketType,
  SeatType,
  ShowtimeSeatStatus,
} from '@prisma/client';
import { BaseCinemaAdapter } from './base-cinema.adapter';
import {
  CinemaCapability,
  CinemaProviderRuntimeConfig,
  CreateCinemaBookingRequestDto,
  CancelCinemaBookingRequestDto,
  NormalizedAuditoriumDto,
  NormalizedCancelBookingResultDto,
  NormalizedCinemaBookingDto,
  NormalizedCinemaDto,
  NormalizedCinemaTicketDto,
  NormalizedMovieDto,
  NormalizedSeatAvailabilityDto,
  NormalizedSeatDto,
  NormalizedShowtimeDto,
} from '../dto/normalized-cinema.dto';
import {
  CinemaIntegrationErrorCode,
  CinemaIntegrationException,
} from '../cinema-integration.errors';

export type MockSimulationMode =
  | 'NORMAL'
  | 'TIMEOUT'
  | 'BOOKING_FAILED'
  | 'CANCELLATION_FAILED'
  | 'RATE_LIMITED'
  | 'CINEMA_UNAVAILABLE'
  | 'INVALID_CREDENTIAL';

@Injectable()
export class MockCinemaAdapter extends BaseCinemaAdapter {
  readonly brand: CinemaBrand = CinemaBrand.CGV;
  readonly adapterKey = 'mock-cinema-adapter';
  readonly isMockAdapter = true;

  protected readonly defaultCapabilities: CinemaCapability[] = [
    CinemaCapability.SHOWTIME,
    CinemaCapability.SEAT_MAP,
    CinemaCapability.SEAT_AVAILABILITY,
    CinemaCapability.BOOKING,
    CinemaCapability.CANCELLATION,
    CinemaCapability.TICKET,
  ];

  private simulationMode: MockSimulationMode = 'NORMAL';
  private simulatedDelayMs = 0;
  private readonly bookingsByIdempotencyKey = new Map<string, NormalizedCinemaBookingDto>();
  private readonly bookingsByExternalId = new Map<string, NormalizedCinemaBookingDto>();
  private readonly ticketsByBookingId = new Map<string, NormalizedCinemaTicketDto>();

  setSimulationMode(mode: MockSimulationMode, delayMs = 0): void {
    this.simulationMode = mode;
    this.simulatedDelayMs = delayMs;
  }

  resetSimulation(): void {
    this.simulationMode = 'NORMAL';
    this.simulatedDelayMs = 0;
    this.bookingsByIdempotencyKey.clear();
    this.bookingsByExternalId.clear();
    this.ticketsByBookingId.clear();
  }

  private async applySimulationEffects(config: CinemaProviderRuntimeConfig, operation: string): Promise<void> {
    if (this.simulatedDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedDelayMs));
    }

    if (this.simulationMode === 'TIMEOUT') {
      await new Promise((resolve) => setTimeout(resolve, (config.timeoutMs || 500) + 150));
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_TIMEOUT,
        message: 'Mock cinema simulated timeout',
        provider: config.brand,
        operation,
        retryable: true,
      });
    }

    if (this.simulationMode === 'CINEMA_UNAVAILABLE') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: 'Mock cinema provider is temporarily unavailable',
        provider: config.brand,
        operation,
        retryable: true,
      });
    }

    if (this.simulationMode === 'RATE_LIMITED') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.RATE_LIMITED,
        message: 'Mock cinema rate limit exceeded',
        provider: config.brand,
        operation,
        retryable: true,
      });
    }

    if (this.simulationMode === 'INVALID_CREDENTIAL') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.INVALID_CREDENTIAL,
        message: 'Mock cinema rejected credentials',
        provider: config.brand,
        operation,
        retryable: false,
      });
    }
  }

  async getMovies(config: CinemaProviderRuntimeConfig): Promise<NormalizedMovieDto[]> {
    this.assertCredentials(config, 'getMovies');
    await this.applySimulationEffects(config, 'getMovies');

    return [
      {
        externalMovieId: 'MOCK-MOV-01',
        title: 'Lật Mặt 8: Vòng Tay Nắng (Mock)',
        originalTitle: 'Face Off 8',
        description: 'Phim gia đình hành động Việt Nam - Dữ liệu giả lập từ MockCinemaAdapter.',
        duration: 132,
        genre: 'Hành động, Gia đình',
        language: 'Tiếng Việt',
        ageRating: 'T13',
        posterUrl: 'https://cdn.vlife.vn/movies/lat-mat-8-poster.jpg',
        backdropUrl: 'https://cdn.vlife.vn/movies/lat-mat-8-backdrop.jpg',
        trailerUrl: 'https://youtube.com/watch?v=latmat8',
        releaseDate: '2026-04-30',
        status: 'NOW_SHOWING',
      },
      {
        externalMovieId: 'MOCK-MOV-02',
        title: 'Dune: Messiah (Mock)',
        originalTitle: 'Dune: Part Three',
        description: 'Hành trình tiếp theo trên hành tinh cát Arrakis.',
        duration: 165,
        genre: 'Khoa học viễn tưởng, Phiêu lưu',
        language: 'Tiếng Anh',
        ageRating: 'T16',
        posterUrl: 'https://cdn.vlife.vn/movies/dune-3-poster.jpg',
        releaseDate: '2026-10-20',
        status: 'COMING_SOON',
      },
    ];
  }

  async getCinemas(config: CinemaProviderRuntimeConfig): Promise<NormalizedCinemaDto[]> {
    this.assertCredentials(config, 'getCinemas');
    await this.applySimulationEffects(config, 'getCinemas');

    return [
      {
        externalCinemaId: `${config.brand}-CIN-01`,
        name: `${config.brand} Vincom Đồng Khởi (Mock)`,
        brand: config.brand,
        address: '72 Lê Thánh Tôn, Quận 1',
        city: 'TP.HCM',
        latitude: 10.7781,
        longitude: 106.7019,
        phone: '19006017',
      },
    ];
  }

  async getAuditoriums(
    cinemaExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedAuditoriumDto[]> {
    this.assertCredentials(config, 'getAuditoriums');
    await this.applySimulationEffects(config, 'getAuditoriums');

    return [
      {
        externalAuditoriumId: `${cinemaExternalId}-AUD-01`,
        cinemaExternalId,
        name: 'Cinema 01 (IMAX)',
        totalRows: 6,
        totalCols: 8,
        capacity: 44,
        screenType: '2D IMAX',
      },
    ];
  }

  async getShowtimes(
    params: { cinemaExternalId: string; movieExternalId?: string; date?: string },
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedShowtimeDto[]> {
    this.assertCapability(CinemaCapability.SHOWTIME, config, 'getShowtimes');
    this.assertCredentials(config, 'getShowtimes');
    await this.applySimulationEffects(config, 'getShowtimes');

    if (params.movieExternalId === 'NOT_FOUND_MOVIE') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.MOVIE_NOT_FOUND,
        message: `Movie ${params.movieExternalId} not found`,
        provider: config.brand,
        operation: 'getShowtimes',
        retryable: false,
      });
    }

    return [
      {
        externalShowtimeId: `${config.brand}-SHT-1001`,
        movieExternalId: params.movieExternalId || 'MOCK-MOV-01',
        cinemaExternalId: params.cinemaExternalId || `${config.brand}-CIN-01`,
        auditoriumExternalId: `${config.brand}-CIN-01-AUD-01`,
        startTime: '2026-10-05T12:00:00.000Z',
        endTime: '2026-10-05T14:15:00.000Z',
        language: 'Phụ đề Việt',
        format: '2D',
        basePrice: 95000,
        vipPrice: 125000,
        couplePrice: 240000,
      },
    ];
  }

  async getSeats(
    auditoriumExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatDto[]> {
    this.assertCapability(CinemaCapability.SEAT_MAP, config, 'getSeats');
    this.assertCredentials(config, 'getSeats');
    await this.applySimulationEffects(config, 'getSeats');

    return [
      {
        externalSeatId: `${auditoriumExternalId}-A1`,
        auditoriumExternalId,
        row: 'A',
        number: 1,
        seatType: SeatType.STANDARD,
        status: ShowtimeSeatStatus.AVAILABLE,
        price: 95000,
      },
      {
        externalSeatId: `${auditoriumExternalId}-B1`,
        auditoriumExternalId,
        row: 'B',
        number: 1,
        seatType: SeatType.VIP,
        status: ShowtimeSeatStatus.AVAILABLE,
        price: 125000,
      },
      {
        externalSeatId: `${auditoriumExternalId}-C1`,
        auditoriumExternalId,
        row: 'C',
        number: 1,
        seatType: SeatType.COUPLE,
        status: ShowtimeSeatStatus.BOOKED,
        price: 240000,
      },
    ];
  }

  async getSeatAvailability(
    externalShowtimeId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatAvailabilityDto> {
    this.assertCapability(CinemaCapability.SEAT_AVAILABILITY, config, 'getSeatAvailability');
    this.assertCredentials(config, 'getSeatAvailability');
    await this.applySimulationEffects(config, 'getSeatAvailability');

    if (externalShowtimeId === 'NOT_FOUND_SHOWTIME') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.SHOWTIME_NOT_FOUND,
        message: `Showtime ${externalShowtimeId} not found`,
        provider: config.brand,
        operation: 'getSeatAvailability',
        retryable: false,
      });
    }

    const seats = await this.getSeats(`${config.brand}-CIN-01-AUD-01`, config);
    return {
      externalShowtimeId,
      seats,
      updatedAt: new Date().toISOString(),
    };
  }

  async createBooking(
    request: CreateCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto> {
    this.assertCapability(CinemaCapability.BOOKING, config, 'createBooking');
    this.assertCredentials(config, 'createBooking');
    this.assertIdempotencyKey(request.idempotencyKey, 'createBooking');
    await this.applySimulationEffects(config, 'createBooking');

    const existing = this.bookingsByIdempotencyKey.get(request.idempotencyKey);
    if (existing) {
      return existing;
    }

    if (this.simulationMode === 'BOOKING_FAILED' || request.orderCode.includes('FAIL')) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_FAILED,
        message: `Mock cinema failed to create booking for order ${request.orderCode}`,
        provider: config.brand,
        operation: 'createBooking',
        retryable: false,
      });
    }

    if (request.seatExternalIds.includes('INVALID_SEAT')) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.SEAT_NOT_FOUND,
        message: 'Requested seat does not exist in auditorium',
        provider: config.brand,
        operation: 'createBooking',
        retryable: false,
      });
    }

    const externalBookingId = `${config.brand}-BK-${request.orderCode}`;
    const bookingCode = `${config.brand}-PIN-${request.orderCode}`;

    const booking: NormalizedCinemaBookingDto = {
      externalBookingId,
      bookingCode,
      brand: config.brand,
      externalShowtimeId: request.externalShowtimeId,
      seatExternalIds: request.seatExternalIds,
      status: MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: new Date().toISOString(),
      rawMetadata: {
        mock: true,
        idempotencyKey: request.idempotencyKey,
      },
    };

    const ticket: NormalizedCinemaTicketDto = {
      externalTicketId: `${externalBookingId}-T1`,
      externalBookingId,
      barcode: `${config.brand}-COUNTER-${request.orderCode}`,
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: `${config.brand} Vincom Đồng Khởi (Mock)`,
      auditoriumName: 'Cinema 01 (IMAX)',
      movieTitle: 'Lật Mặt 8: Vòng Tay Nắng (Mock)',
      startTime: '2026-10-05T12:00:00.000Z',
      seatCodes: request.seatExternalIds,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    };

    this.bookingsByIdempotencyKey.set(request.idempotencyKey, booking);
    this.bookingsByExternalId.set(externalBookingId, booking);
    this.ticketsByBookingId.set(externalBookingId, ticket);

    return booking;
  }

  async cancelBooking(
    request: CancelCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCancelBookingResultDto> {
    this.assertCapability(CinemaCapability.CANCELLATION, config, 'cancelBooking');
    this.assertCredentials(config, 'cancelBooking');
    this.assertIdempotencyKey(request.idempotencyKey, 'cancelBooking');
    await this.applySimulationEffects(config, 'cancelBooking');

    if (this.simulationMode === 'CANCELLATION_FAILED') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CANCELLATION_FAILED,
        message: `Mock cinema failed to cancel booking ${request.externalBookingId}`,
        provider: config.brand,
        operation: 'cancelBooking',
        retryable: false,
      });
    }

    const existing = this.bookingsByExternalId.get(request.externalBookingId);
    if (!existing) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_NOT_FOUND,
        message: `Mock booking ${request.externalBookingId} not found`,
        provider: config.brand,
        operation: 'cancelBooking',
        retryable: false,
      });
    }

    const updated: NormalizedCinemaBookingDto = {
      ...existing,
      status: MovieBookingStatus.CANCELLED,
    };
    this.bookingsByExternalId.set(request.externalBookingId, updated);

    return {
      externalBookingId: request.externalBookingId,
      cancelled: true,
      status: MovieBookingStatus.CANCELLED,
      cancelledAt: new Date().toISOString(),
      refundEligible: true,
    };
  }

  async getBooking(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto> {
    this.assertCapability(CinemaCapability.BOOKING, config, 'getBooking');
    this.assertCredentials(config, 'getBooking');
    await this.applySimulationEffects(config, 'getBooking');

    const existing = this.bookingsByExternalId.get(externalBookingId);
    if (!existing) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_NOT_FOUND,
        message: `Mock booking ${externalBookingId} not found`,
        provider: config.brand,
        operation: 'getBooking',
        retryable: false,
      });
    }
    return existing;
  }

  async getTicket(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaTicketDto> {
    this.assertCapability(CinemaCapability.TICKET, config, 'getTicket');
    this.assertCredentials(config, 'getTicket');
    await this.applySimulationEffects(config, 'getTicket');

    const ticket = this.ticketsByBookingId.get(externalBookingId);
    if (!ticket) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_NOT_FOUND,
        message: `Ticket for booking ${externalBookingId} not found`,
        provider: config.brand,
        operation: 'getTicket',
        retryable: false,
      });
    }
    return ticket;
  }

  mapMovie(raw: any): NormalizedMovieDto {
    return raw;
  }
  mapCinema(raw: any): NormalizedCinemaDto {
    return raw;
  }
  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return raw;
  }
  mapShowtime(raw: any): NormalizedShowtimeDto {
    return raw;
  }
  mapSeat(raw: any): NormalizedSeatDto {
    return raw;
  }
  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return raw;
  }
  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return raw;
  }
}