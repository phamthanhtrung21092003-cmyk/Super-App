import { CinemaBrand } from '@prisma/client';

export enum CinemaIntegrationErrorCode {
  CINEMA_UNAVAILABLE = 'CINEMA_UNAVAILABLE',
  CINEMA_TIMEOUT = 'CINEMA_TIMEOUT',
  INVALID_CREDENTIAL = 'INVALID_CREDENTIAL',
  UNSUPPORTED_CAPABILITY = 'UNSUPPORTED_CAPABILITY',
  MOVIE_NOT_FOUND = 'MOVIE_NOT_FOUND',
  SHOWTIME_NOT_FOUND = 'SHOWTIME_NOT_FOUND',
  SEAT_NOT_FOUND = 'SEAT_NOT_FOUND',
  BOOKING_FAILED = 'BOOKING_FAILED',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN_INTEGRATION_ERROR = 'UNKNOWN_INTEGRATION_ERROR',
}

export class CinemaIntegrationException extends Error {
  public readonly errorCode: CinemaIntegrationErrorCode;
  public readonly provider?: CinemaBrand | string;
  public readonly operation?: string;
  public readonly retryable: boolean;

  constructor(params: {
    errorCode: CinemaIntegrationErrorCode;
    message: string;
    provider?: CinemaBrand | string;
    operation?: string;
    retryable?: boolean;
  }) {
    super(params.message);
    this.name = 'CinemaIntegrationException';
    this.errorCode = params.errorCode;
    this.provider = params.provider;
    this.operation = params.operation;
    this.retryable = params.retryable ?? false;
  }
}

export class UnsupportedCapabilityError extends CinemaIntegrationException {
  constructor(provider: CinemaBrand | string, capability: string, operation?: string) {
    super({
      errorCode: CinemaIntegrationErrorCode.UNSUPPORTED_CAPABILITY,
      message: `Hệ thống rạp ${provider} không hỗ trợ tính năng ${capability}`,
      provider,
      operation,
      retryable: false,
    });
    this.name = 'UnsupportedCapabilityError';
  }
}