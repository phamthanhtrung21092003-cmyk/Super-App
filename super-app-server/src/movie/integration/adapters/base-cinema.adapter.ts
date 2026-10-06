import { CinemaBrand, SeatType, ShowtimeSeatStatus } from '@prisma/client';
import { ICinemaAdapter } from '../cinema-adapter.interface';
import {
  CinemaCapability,
  CinemaProviderRuntimeConfig,
  NormalizedMovieDto,
  NormalizedCinemaDto,
  NormalizedAuditoriumDto,
  NormalizedShowtimeDto,
  NormalizedSeatDto,
  NormalizedSeatAvailabilityDto,
  CreateCinemaBookingRequestDto,
  NormalizedCinemaBookingDto,
  CancelCinemaBookingRequestDto,
  NormalizedCancelBookingResultDto,
  NormalizedCinemaTicketDto,
} from '../dto/normalized-cinema.dto';
import {
  CinemaIntegrationErrorCode,
  CinemaIntegrationException,
  UnsupportedCapabilityError,
} from '../cinema-integration.errors';

export type CinemaHttpTransport = (params: {
  method: 'GET' | 'POST';
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeoutMs: number;
}) => Promise<any>;

export abstract class BaseCinemaAdapter implements ICinemaAdapter {
  abstract readonly brand: CinemaBrand;
  abstract readonly adapterKey: string;
  protected abstract readonly defaultCapabilities: CinemaCapability[];

  private customTransport?: CinemaHttpTransport;

  public setTransport(transport?: CinemaHttpTransport): void {
    this.customTransport = transport;
  }

  public hasCustomTransport(): boolean {
    return Boolean(this.customTransport);
  }

  getSupportedCapabilities(config?: CinemaProviderRuntimeConfig): CinemaCapability[] {
    if (config?.capabilities && config.capabilities.length > 0) {
      return config.capabilities;
    }
    return this.defaultCapabilities;
  }

  supportsCapability(capability: CinemaCapability, config?: CinemaProviderRuntimeConfig): boolean {
    return this.getSupportedCapabilities(config).includes(capability);
  }

  protected assertCapability(
    capability: CinemaCapability,
    config: CinemaProviderRuntimeConfig,
    operation: string,
  ): void {
    if (!this.supportsCapability(capability, config)) {
      throw new UnsupportedCapabilityError(this.brand, capability, operation);
    }
  }

  protected assertCredentials(config: CinemaProviderRuntimeConfig, operation: string): void {
    if (!config.baseUrl) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: `Chưa cấu hình Base URL cho hệ thống rạp ${this.brand}`,
        provider: this.brand,
        operation,
        retryable: false,
      });
    }

    if (!config.apiKey || config.apiKey.trim() === '' || config.apiKey === 'INVALID_KEY') {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.INVALID_CREDENTIAL,
        message: `Thông tin xác thực (API Key) của rạp ${this.brand} không hợp lệ hoặc chưa được cấu hình trong biến môi trường`,
        provider: this.brand,
        operation,
        retryable: false,
      });
    }
  }

  protected assertIdempotencyKey(idempotencyKey: string, operation: string): void {
    if (!idempotencyKey || idempotencyKey.trim().length < 4) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_FAILED,
        message: `Thao tác ${operation} bắt buộc phải có idempotencyKey hợp lệ để chống trùng lặp`,
        provider: this.brand,
        operation,
        retryable: false,
      });
    }
  }

  protected async executePartnerRequest(params: {
    operation: string;
    method: 'GET' | 'POST';
    endpoint: string;
    config: CinemaProviderRuntimeConfig;
    body?: any;
    idempotencyKey?: string;
  }): Promise<any> {
    this.assertCredentials(params.config, params.operation);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': 'V-LIFE-SUPER-APP',
      'X-Api-Version': params.config.apiVersion || 'v1',
      Authorization: `Bearer ${params.config.apiKey}`,
    };

    if (params.idempotencyKey) {
      headers['X-Idempotency-Key'] = params.idempotencyKey;
    }

    const fullUrl = `${params.config.baseUrl.replace(/\/$/, '')}/${params.endpoint.replace(/^\//, '')}`;

    if (!this.customTransport) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: `Kết nối đối tác thực tế của rạp ${this.brand} (${fullUrl}) hiện chưa sẵn sàng`,
        provider: this.brand,
        operation: params.operation,
        retryable: true,
      });
    }

    return this.customTransport({
      method: params.method,
      url: fullUrl,
      headers,
      body: params.body,
      timeoutMs: params.config.timeoutMs || 10000,
    });
  }

  protected normalizeSeatType(rawType: string): SeatType {
    const upper = (rawType || '').toUpperCase();
    if (upper.includes('COUPLE') || upper.includes('SWEETBOX') || upper.includes('PAIR') || upper.includes('DOUBLE')) {
      return SeatType.COUPLE;
    }
    if (upper.includes('VIP') || upper.includes('PRIME') || upper.includes('DELUXE')) {
      return SeatType.VIP;
    }
    return SeatType.STANDARD;
  }

  protected normalizeSeatStatus(rawStatus: string | number | boolean): ShowtimeSeatStatus {
    if (typeof rawStatus === 'boolean') {
      return rawStatus ? ShowtimeSeatStatus.AVAILABLE : ShowtimeSeatStatus.BOOKED;
    }
    const upper = String(rawStatus || '').toUpperCase();
    if (upper === 'AVAILABLE' || upper === 'FREE' || upper === '0' || upper === 'OPEN') {
      return ShowtimeSeatStatus.AVAILABLE;
    }
    if (upper === 'HELD' || upper === 'LOCKED' || upper === 'HOLD' || upper === '1') {
      return ShowtimeSeatStatus.HELD;
    }
    if (upper === 'BLOCKED' || upper === 'MAINTENANCE' || upper === 'DISABLED') {
      return ShowtimeSeatStatus.BLOCKED;
    }
    return ShowtimeSeatStatus.BOOKED;
  }

  abstract mapMovie(raw: any): NormalizedMovieDto;
  abstract mapCinema(raw: any): NormalizedCinemaDto;
  abstract mapAuditorium(raw: any): NormalizedAuditoriumDto;
  abstract mapShowtime(raw: any): NormalizedShowtimeDto;
  abstract mapSeat(raw: any): NormalizedSeatDto;
  abstract mapBooking(raw: any): NormalizedCinemaBookingDto;
  abstract mapTicket(raw: any): NormalizedCinemaTicketDto;

  async getMovies(config: CinemaProviderRuntimeConfig): Promise<NormalizedMovieDto[]> {
    this.assertCapability(CinemaCapability.SHOWTIME, config, 'getMovies');
    const rawList = await this.executePartnerRequest({
      operation: 'getMovies',
      method: 'GET',
      endpoint: '/movies',
      config,
    });
    return Array.isArray(rawList) ? rawList.map((item) => this.mapMovie(item)) : [];
  }

  async getCinemas(config: CinemaProviderRuntimeConfig): Promise<NormalizedCinemaDto[]> {
    this.assertCapability(CinemaCapability.SHOWTIME, config, 'getCinemas');
    const rawList = await this.executePartnerRequest({
      operation: 'getCinemas',
      method: 'GET',
      endpoint: '/cinemas',
      config,
    });
    return Array.isArray(rawList) ? rawList.map((item) => this.mapCinema(item)) : [];
  }

  async getAuditoriums(
    cinemaExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedAuditoriumDto[]> {
    this.assertCapability(CinemaCapability.SEAT_MAP, config, 'getAuditoriums');
    const rawList = await this.executePartnerRequest({
      operation: 'getAuditoriums',
      method: 'GET',
      endpoint: `/cinemas/${encodeURIComponent(cinemaExternalId)}/auditoriums`,
      config,
    });
    return Array.isArray(rawList) ? rawList.map((item) => this.mapAuditorium(item)) : [];
  }

  async getShowtimes(
    params: { cinemaExternalId: string; movieExternalId?: string; date?: string },
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedShowtimeDto[]> {
    this.assertCapability(CinemaCapability.SHOWTIME, config, 'getShowtimes');
    const rawList = await this.executePartnerRequest({
      operation: 'getShowtimes',
      method: 'GET',
      endpoint: `/cinemas/${encodeURIComponent(params.cinemaExternalId)}/showtimes`,
      config,
    });
    return Array.isArray(rawList) ? rawList.map((item) => this.mapShowtime(item)) : [];
  }

  async getSeats(
    auditoriumExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatDto[]> {
    this.assertCapability(CinemaCapability.SEAT_MAP, config, 'getSeats');
    const rawList = await this.executePartnerRequest({
      operation: 'getSeats',
      method: 'GET',
      endpoint: `/auditoriums/${encodeURIComponent(auditoriumExternalId)}/seats`,
      config,
    });
    return Array.isArray(rawList) ? rawList.map((item) => this.mapSeat(item)) : [];
  }

  async getSeatAvailability(
    externalShowtimeId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatAvailabilityDto> {
    this.assertCapability(CinemaCapability.SEAT_AVAILABILITY, config, 'getSeatAvailability');
    const raw = await this.executePartnerRequest({
      operation: 'getSeatAvailability',
      method: 'GET',
      endpoint: `/showtimes/${encodeURIComponent(externalShowtimeId)}/seats`,
      config,
    });
    const seatsArray = Array.isArray(raw?.seats) ? raw.seats : Array.isArray(raw) ? raw : [];
    return {
      externalShowtimeId,
      seats: seatsArray.map((item: any) => this.mapSeat(item)),
      updatedAt: new Date().toISOString(),
    };
  }

  async createBooking(
    request: CreateCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto> {
    this.assertCapability(CinemaCapability.BOOKING, config, 'createBooking');
    this.assertIdempotencyKey(request.idempotencyKey, 'createBooking');
    const raw = await this.executePartnerRequest({
      operation: 'createBooking',
      method: 'POST',
      endpoint: '/bookings',
      config,
      body: request,
      idempotencyKey: request.idempotencyKey,
    });
    return this.mapBooking(raw);
  }

  async cancelBooking(
    request: CancelCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCancelBookingResultDto> {
    this.assertCapability(CinemaCapability.CANCELLATION, config, 'cancelBooking');
    this.assertIdempotencyKey(request.idempotencyKey, 'cancelBooking');
    const raw = await this.executePartnerRequest({
      operation: 'cancelBooking',
      method: 'POST',
      endpoint: `/bookings/${encodeURIComponent(request.externalBookingId)}/cancel`,
      config,
      body: request,
      idempotencyKey: request.idempotencyKey,
    });
    return {
      externalBookingId: raw.externalBookingId || raw.booking_id || request.externalBookingId,
      cancelled: Boolean(raw.cancelled ?? true),
      status: 'CANCELLED',
      cancelledAt: raw.cancelledAt || new Date().toISOString(),
      refundEligible: Boolean(raw.refundEligible ?? config.supportsCancel),
    };
  }

  async getBooking(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto> {
    this.assertCapability(CinemaCapability.BOOKING, config, 'getBooking');
    const raw = await this.executePartnerRequest({
      operation: 'getBooking',
      method: 'GET',
      endpoint: `/bookings/${encodeURIComponent(externalBookingId)}`,
      config,
    });
    return this.mapBooking(raw);
  }

  async getTicket(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaTicketDto> {
    this.assertCapability(CinemaCapability.TICKET, config, 'getTicket');
    const raw = await this.executePartnerRequest({
      operation: 'getTicket',
      method: 'GET',
      endpoint: `/bookings/${encodeURIComponent(externalBookingId)}/ticket`,
      config,
    });
    return this.mapTicket(raw);
  }
}