import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CinemaBrand } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ICinemaAdapter } from './cinema-adapter.interface';
import {
  CinemaCapability,
  CinemaProviderRuntimeConfig,
  CinemaWebhookPayloadDto,
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
} from './dto/normalized-cinema.dto';
import {
  CinemaIntegrationErrorCode,
  CinemaIntegrationException,
  UnsupportedCapabilityError,
} from './cinema-integration.errors';
import { CgvAdapter } from './adapters/cgv.adapter';
import { LotteAdapter } from './adapters/lotte.adapter';
import { GalaxyAdapter } from './adapters/galaxy.adapter';
import { BetaAdapter } from './adapters/beta.adapter';
import { BhdAdapter } from './adapters/bhd.adapter';
import { CinestarAdapter } from './adapters/cinestar.adapter';
import { MockCinemaAdapter } from './adapters/mock-cinema.adapter';

export interface StructuredIntegrationLog {
  integrationId: string;
  provider: CinemaBrand | string;
  operation: string;
  requestId: string;
  durationMs: number;
  attempt: number;
  success: boolean;
  errorCode?: CinemaIntegrationErrorCode;
}

const SENSITIVE_KEYS = new Set([
  'apikey',
  'api_key',
  'apisecret',
  'api_secret',
  'webhooksecret',
  'webhook_secret',
  'password',
  'token',
  'accesstoken',
  'authorization',
  'secret',
  'customerphone',
  'customeremail',
  'phone',
  'email',
]);

@Injectable()
export class CinemaIntegrationService {
  private readonly logger = new Logger(CinemaIntegrationService.name);
  private readonly adapterByBrand = new Map<CinemaBrand, ICinemaAdapter>();
  private readonly adapterByKey = new Map<string, ICinemaAdapter>();
  private useMockFallback = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cgvAdapter: CgvAdapter,
    private readonly lotteAdapter: LotteAdapter,
    private readonly galaxyAdapter: GalaxyAdapter,
    private readonly betaAdapter: BetaAdapter,
    private readonly bhdAdapter: BhdAdapter,
    private readonly cinestarAdapter: CinestarAdapter,
    private readonly mockCinemaAdapter: MockCinemaAdapter,
  ) {
    this.registerAdapter(this.cgvAdapter);
    this.registerAdapter(this.lotteAdapter);
    this.registerAdapter(this.galaxyAdapter);
    this.registerAdapter(this.betaAdapter);
    this.registerAdapter(this.bhdAdapter);
    this.registerAdapter(this.cinestarAdapter);
    // Register mock adapter ONLY by its explicit key so it never overwrites production brand adapters
    this.adapterByKey.set(this.mockCinemaAdapter.adapterKey, this.mockCinemaAdapter);
  }

  private registerAdapter(adapter: ICinemaAdapter): void {
    this.adapterByBrand.set(adapter.brand, adapter);
    this.adapterByKey.set(adapter.adapterKey, adapter);
  }

  /**
   * Allows tests or explicit sandbox mode to route requests through MockCinemaAdapter
   * while keeping production adapters strictly separated.
   */
  setUseMockFallback(enabled: boolean): void {
    this.useMockFallback = enabled;
  }

  /**
   * Resolves the registered ICinemaAdapter by CinemaBrand or adapterKey without scattered if/else.
   */
  resolveAdapter(brandOrKey: CinemaBrand | string, adapterKey?: string): ICinemaAdapter {
    if (this.useMockFallback || adapterKey === this.mockCinemaAdapter.adapterKey) {
      return this.mockCinemaAdapter;
    }

    if (adapterKey && this.adapterByKey.has(adapterKey)) {
      return this.adapterByKey.get(adapterKey)!;
    }

    const byBrand = this.adapterByBrand.get(brandOrKey as CinemaBrand);
    if (byBrand) {
      return byBrand;
    }

    const byKey = this.adapterByKey.get(String(brandOrKey));
    if (byKey) {
      return byKey;
    }

    throw new CinemaIntegrationException({
      errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
      message: `Unsupported cinema provider or adapter: ${String(brandOrKey)}`,
      provider: brandOrKey,
      retryable: false,
    });
  }

  /**
   * Loads runtime configuration from CinemaIntegration table + environment variables.
   * Never stores or logs plaintext secrets from DB.
   */
  async getRuntimeConfig(brand: CinemaBrand): Promise<CinemaProviderRuntimeConfig> {
    const record = await this.prisma.cinemaIntegration.findUnique({
      where: { brand },
    });

    if (!record) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: `Cinema integration not configured for brand ${brand}`,
        provider: brand,
        retryable: false,
      });
    }

    if (!record.isActive) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: `Cinema integration for ${brand} is currently disabled`,
        provider: brand,
        retryable: false,
      });
    }

    const capabilities = this.parseCapabilities(record.config, brand, record.supportsCancel);
    const { apiKey, apiSecret } = this.resolveCredentialsFromEnv(brand, record.config);

    return {
      integrationId: record.id,
      brand: record.brand,
      adapterKey: record.adapterKey,
      providerName: record.providerName,
      baseUrl: record.baseUrl || `https://sandbox-api.${brand.toLowerCase()}.vn`,
      apiVersion: record.apiVersion || 'v1',
      authType: record.authType || 'API_KEY',
      apiKey,
      apiSecret,
      timeoutMs: record.timeoutMs > 0 ? record.timeoutMs : 8000,
      retryLimit: record.retryLimit >= 0 ? Math.min(record.retryLimit, 3) : 2,
      holdTtlSeconds: record.holdTtlSeconds > 0 ? record.holdTtlSeconds : 600,
      supportsCancel: record.supportsCancel,
      capabilities,
      isActive: record.isActive,
      useMockTransport: this.useMockFallback || Boolean((record.config as any)?.mode === 'SANDBOX'),
    };
  }

  private parseCapabilities(
    configJson: unknown,
    brand: CinemaBrand,
    supportsCancel: boolean,
  ): CinemaCapability[] {
    if (configJson && typeof configJson === 'object' && !Array.isArray(configJson)) {
      const obj = configJson as Record<string, unknown>;
      if (Array.isArray(obj.capabilities)) {
        return obj.capabilities as CinemaCapability[];
      }
    }
    const adapter = this.adapterByBrand.get(brand);
    const baseCaps = adapter
      ? [...adapter.getSupportedCapabilities()]
      : [
          CinemaCapability.SHOWTIME,
          CinemaCapability.SEAT_MAP,
          CinemaCapability.SEAT_AVAILABILITY,
          CinemaCapability.BOOKING,
          CinemaCapability.TICKET,
        ];

    if (supportsCancel && !baseCaps.includes(CinemaCapability.CANCELLATION)) {
      baseCaps.push(CinemaCapability.CANCELLATION);
    }
    return baseCaps;
  }

  private resolveCredentialsFromEnv(
    brand: CinemaBrand,
    configJson?: unknown,
  ): { apiKey?: string; apiSecret?: string } {
    const prefix = brand.toUpperCase();
    const apiKeyEnvName = `${prefix}_API_KEY`;
    const apiSecretEnvName = `${prefix}_API_SECRET`;

    let customRef: string | undefined;
    let isSandboxMode = false;
    if (configJson && typeof configJson === 'object' && !Array.isArray(configJson)) {
      const obj = configJson as Record<string, unknown>;
      if (typeof obj.credentialEnvKey === 'string') {
        customRef = obj.credentialEnvKey;
      }
      if (obj.mode === 'SANDBOX') {
        isSandboxMode = true;
      }
    }

    const apiKey =
      this.configService.get<string>(apiKeyEnvName) ??
      (customRef ? this.configService.get<string>(customRef) : undefined) ??
      (isSandboxMode ? `sandbox-${prefix.toLowerCase()}-key` : undefined);
    const apiSecret = this.configService.get<string>(apiSecretEnvName);

    return { apiKey, apiSecret };
  }

  /**
   * Redacts any secret/token/PII fields from objects before logging.
   */
  sanitizeObject(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[-_]/g, ''))) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Executes an adapter operation with:
   * - Capability verification
   * - Timeout protection
   * - Bounded Retry policy (ONLY for retryable read operations; NEVER for createBooking)
   * - Error normalization
   * - Structured secure logging
   */
  private async executeOperation<T>(options: {
    brand: CinemaBrand;
    operation: string;
    requiredCapability?: CinemaCapability;
    allowRetry: boolean;
    fn: (adapter: ICinemaAdapter, config: CinemaProviderRuntimeConfig) => Promise<T>;
  }): Promise<T> {
    const requestId = randomUUID();
    const config = await this.getRuntimeConfig(options.brand);
    const primaryAdapter = this.resolveAdapter(config.brand, config.adapterKey);
    const adapter =
      config.useMockTransport &&
      typeof (primaryAdapter as any).hasCustomTransport === 'function' &&
      !(primaryAdapter as any).hasCustomTransport()
        ? this.mockCinemaAdapter
        : primaryAdapter;

    if (
      options.requiredCapability &&
      !adapter.supportsCapability(options.requiredCapability, config)
    ) {
      throw new UnsupportedCapabilityError(
        config.brand,
        options.requiredCapability,
        options.operation,
      );
    }

    const maxAttempts = options.allowRetry ? Math.max(1, config.retryLimit) : 1;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt += 1;
      const startTime = Date.now();
      try {
        const result = await this.withTimeout(
          options.fn(adapter, config),
          config.timeoutMs,
          config.brand,
          options.operation,
        );

        const durationMs = Date.now() - startTime;
        this.writeStructuredLog({
          integrationId: config.integrationId,
          provider: config.brand,
          operation: options.operation,
          requestId,
          durationMs,
          attempt,
          success: true,
        });

        return result;
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const normalizedError = this.normalizeError(err, config.brand, options.operation);

        this.writeStructuredLog({
          integrationId: config.integrationId,
          provider: config.brand,
          operation: options.operation,
          requestId,
          durationMs,
          attempt,
          success: false,
          errorCode: normalizedError.errorCode,
        });

        const shouldRetry =
          options.allowRetry && normalizedError.retryable && attempt < maxAttempts;

        if (!shouldRetry) {
          throw normalizedError;
        }
      }
    }

    throw new CinemaIntegrationException({
      errorCode: CinemaIntegrationErrorCode.UNKNOWN_INTEGRATION_ERROR,
      message: `Operation ${options.operation} exhausted all attempts`,
      provider: options.brand,
      operation: options.operation,
      retryable: false,
    });
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    provider: CinemaBrand | string,
    operation: string,
  ): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new CinemaIntegrationException({
                errorCode: CinemaIntegrationErrorCode.CINEMA_TIMEOUT,
                message: `Cinema provider ${provider} timed out during ${operation} after ${timeoutMs}ms`,
                provider,
                operation,
                retryable: true,
              }),
            );
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  normalizeError(
    error: unknown,
    provider: CinemaBrand | string,
    operation: string,
  ): CinemaIntegrationException {
    if (error instanceof CinemaIntegrationException) {
      return error;
    }

    const rawMessage = error instanceof Error ? error.message : String(error);
    const lower = rawMessage.toLowerCase();

    if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('aborted')) {
      return new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_TIMEOUT,
        message: `Provider ${provider} timed out on ${operation}`,
        provider,
        operation,
        retryable: true,
      });
    }

    if (lower.includes('401') || lower.includes('403') || lower.includes('unauthorized') || lower.includes('credential')) {
      return new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.INVALID_CREDENTIAL,
        message: `Invalid credentials for cinema provider ${provider}`,
        provider,
        operation,
        retryable: false,
      });
    }

    if (lower.includes('429') || lower.includes('rate limit') || lower.includes('too many requests')) {
      return new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.RATE_LIMITED,
        message: `Rate limit exceeded for cinema provider ${provider}`,
        provider,
        operation,
        retryable: true,
      });
    }

    if (lower.includes('502') || lower.includes('503') || lower.includes('504') || lower.includes('econnrefused')) {
      return new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.CINEMA_UNAVAILABLE,
        message: `Cinema provider ${provider} is currently unavailable`,
        provider,
        operation,
        retryable: true,
      });
    }

    return new CinemaIntegrationException({
      errorCode: CinemaIntegrationErrorCode.UNKNOWN_INTEGRATION_ERROR,
      message: `Unexpected error from provider ${provider} during ${operation}`,
      provider,
      operation,
      retryable: false,
    });
  }

  private writeStructuredLog(entry: StructuredIntegrationLog): void {
    const payload = JSON.stringify(entry);
    if (entry.success) {
      this.logger.log(payload);
    } else {
      this.logger.warn(payload);
    }
  }

  // ============================================================================
  // PUBLIC INTEGRATION OPERATIONS
  // ============================================================================

  async getMovies(brand: CinemaBrand): Promise<NormalizedMovieDto[]> {
    return this.executeOperation({
      brand,
      operation: 'getMovies',
      allowRetry: true,
      fn: (adapter, config) => adapter.getMovies(config),
    });
  }

  async getCinemas(brand: CinemaBrand): Promise<NormalizedCinemaDto[]> {
    return this.executeOperation({
      brand,
      operation: 'getCinemas',
      allowRetry: true,
      fn: (adapter, config) => adapter.getCinemas(config),
    });
  }

  async getAuditoriums(
    brand: CinemaBrand,
    cinemaExternalId: string,
  ): Promise<NormalizedAuditoriumDto[]> {
    return this.executeOperation({
      brand,
      operation: 'getAuditoriums',
      allowRetry: true,
      fn: (adapter, config) => adapter.getAuditoriums(cinemaExternalId, config),
    });
  }

  async getShowtimes(
    brand: CinemaBrand,
    params: { cinemaExternalId: string; movieExternalId?: string; date?: string },
  ): Promise<NormalizedShowtimeDto[]> {
    return this.executeOperation({
      brand,
      operation: 'getShowtimes',
      requiredCapability: CinemaCapability.SHOWTIME,
      allowRetry: true,
      fn: (adapter, config) => adapter.getShowtimes(params, config),
    });
  }

  async getSeats(
    brand: CinemaBrand,
    auditoriumExternalId: string,
  ): Promise<NormalizedSeatDto[]> {
    return this.executeOperation({
      brand,
      operation: 'getSeats',
      requiredCapability: CinemaCapability.SEAT_MAP,
      allowRetry: true,
      fn: (adapter, config) => adapter.getSeats(auditoriumExternalId, config),
    });
  }

  async getSeatAvailability(
    brand: CinemaBrand,
    externalShowtimeId: string,
  ): Promise<NormalizedSeatAvailabilityDto> {
    return this.executeOperation({
      brand,
      operation: 'getSeatAvailability',
      requiredCapability: CinemaCapability.SEAT_AVAILABILITY,
      allowRetry: true,
      fn: (adapter, config) => adapter.getSeatAvailability(externalShowtimeId, config),
    });
  }

  /**
   * Creates a booking at the partner cinema system.
   * CRITICAL: allowRetry is strictly FALSE to prevent duplicate booking creation.
   * Requires idempotencyKey (orderCode / bookingCode / requestId).
   */
  async createBooking(
    brand: CinemaBrand,
    request: CreateCinemaBookingRequestDto,
  ): Promise<NormalizedCinemaBookingDto> {
    if (!request.idempotencyKey || request.idempotencyKey.trim().length < 4) {
      throw new CinemaIntegrationException({
        errorCode: CinemaIntegrationErrorCode.BOOKING_FAILED,
        message: 'idempotencyKey is mandatory for createBooking()',
        provider: brand,
        operation: 'createBooking',
        retryable: false,
      });
    }

    return this.executeOperation({
      brand,
      operation: 'createBooking',
      requiredCapability: CinemaCapability.BOOKING,
      allowRetry: false,
      fn: (adapter, config) => adapter.createBooking(request, config),
    });
  }

  async cancelBooking(
    brand: CinemaBrand,
    request: CancelCinemaBookingRequestDto,
  ): Promise<NormalizedCancelBookingResultDto> {
    return this.executeOperation({
      brand,
      operation: 'cancelBooking',
      requiredCapability: CinemaCapability.CANCELLATION,
      allowRetry: false,
      fn: (adapter, config) => adapter.cancelBooking(request, config),
    });
  }

  async getBooking(
    brand: CinemaBrand,
    externalBookingId: string,
  ): Promise<NormalizedCinemaBookingDto> {
    return this.executeOperation({
      brand,
      operation: 'getBooking',
      requiredCapability: CinemaCapability.BOOKING,
      allowRetry: true,
      fn: (adapter, config) => adapter.getBooking(externalBookingId, config),
    });
  }

  async getTicket(
    brand: CinemaBrand,
    externalBookingId: string,
  ): Promise<NormalizedCinemaTicketDto> {
    return this.executeOperation({
      brand,
      operation: 'getTicket',
      requiredCapability: CinemaCapability.TICKET,
      allowRetry: true,
      fn: (adapter, config) => adapter.getTicket(externalBookingId, config),
    });
  }

  // ============================================================================
  // WEBHOOK / CALLBACK PREPARATION (SECTION 12)
  // ============================================================================

  async handleBookingWebhook(payload: CinemaWebhookPayloadDto): Promise<{
    acknowledged: boolean;
    provider: CinemaBrand;
    eventType: string;
    externalBookingId: string;
    normalizedStatus: string;
  }> {
    const config = await this.getRuntimeConfig(payload.brand);
    this.logger.log(
      JSON.stringify({
        integrationId: config.integrationId,
        provider: payload.brand,
        operation: 'handleBookingWebhook',
        eventType: payload.eventType,
        externalBookingId: payload.externalBookingId,
      }),
    );

    return {
      acknowledged: true,
      provider: payload.brand,
      eventType: payload.eventType,
      externalBookingId: payload.externalBookingId,
      normalizedStatus: payload.status,
    };
  }

  async handleTicketWebhook(payload: CinemaWebhookPayloadDto): Promise<{
    acknowledged: boolean;
    provider: CinemaBrand;
    externalBookingId: string;
    externalTicketId?: string;
    barcode?: string;
  }> {
    const config = await this.getRuntimeConfig(payload.brand);
    this.logger.log(
      JSON.stringify({
        integrationId: config.integrationId,
        provider: payload.brand,
        operation: 'handleTicketWebhook',
        externalBookingId: payload.externalBookingId,
        externalTicketId: payload.externalTicketId,
      }),
    );

    return {
      acknowledged: true,
      provider: payload.brand,
      externalBookingId: payload.externalBookingId,
      externalTicketId: payload.externalTicketId,
      barcode: payload.barcode,
    };
  }

  async handleBookingStatusUpdate(payload: CinemaWebhookPayloadDto): Promise<{
    acknowledged: boolean;
    provider: CinemaBrand;
    externalBookingId: string;
    status: string;
  }> {
    const config = await this.getRuntimeConfig(payload.brand);
    this.logger.log(
      JSON.stringify({
        integrationId: config.integrationId,
        provider: payload.brand,
        operation: 'handleBookingStatusUpdate',
        externalBookingId: payload.externalBookingId,
        status: payload.status,
      }),
    );

    return {
      acknowledged: true,
      provider: payload.brand,
      externalBookingId: payload.externalBookingId,
      status: payload.status,
    };
  }
}