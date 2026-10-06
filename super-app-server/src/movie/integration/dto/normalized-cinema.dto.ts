import { CinemaBrand, SeatType, ShowtimeSeatStatus, MovieBookingStatus, MovieTicketType, MovieTicketStatus } from '@prisma/client';

export enum CinemaCapability {
  SHOWTIME = 'SHOWTIME',
  SEAT_MAP = 'SEAT_MAP',
  SEAT_AVAILABILITY = 'SEAT_AVAILABILITY',
  BOOKING = 'BOOKING',
  CANCELLATION = 'CANCELLATION',
  REFUND = 'REFUND',
  TICKET = 'TICKET',
}

export interface CinemaProviderRuntimeConfig {
  integrationId: string;
  brand: CinemaBrand;
  adapterKey: string;
  providerName: string;
  baseUrl: string;
  apiVersion: string;
  authType: string;
  apiKey?: string;
  apiSecret?: string;
  timeoutMs: number;
  retryLimit: number;
  holdTtlSeconds: number;
  supportsCancel: boolean;
  capabilities: CinemaCapability[];
  isActive: boolean;
  useMockTransport?: boolean;
}

export interface NormalizedMovieDto {
  externalMovieId: string;
  title: string;
  originalTitle?: string;
  description?: string;
  duration: number; // minutes
  genre: string;
  language: string;
  ageRating: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  releaseDate?: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
}

export interface NormalizedCinemaDto {
  externalCinemaId: string;
  name: string;
  brand: CinemaBrand;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export interface NormalizedAuditoriumDto {
  externalAuditoriumId: string;
  cinemaExternalId: string;
  name: string;
  totalRows: number;
  totalCols: number;
  capacity: number;
  screenType: string;
}

export interface NormalizedShowtimeDto {
  externalShowtimeId: string;
  movieExternalId: string;
  cinemaExternalId: string;
  auditoriumExternalId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  language: string;
  format: string;
  basePrice: number;
  vipPrice: number;
  couplePrice: number;
}

export interface NormalizedSeatDto {
  externalSeatId: string;
  auditoriumExternalId: string;
  row: string;
  number: number;
  seatType: SeatType;
  status: ShowtimeSeatStatus;
  price?: number;
}

export interface NormalizedSeatAvailabilityDto {
  externalShowtimeId: string;
  seats: NormalizedSeatDto[];
  updatedAt: string;
}

export interface CreateCinemaBookingRequestDto {
  idempotencyKey: string;
  orderCode: string;
  externalShowtimeId: string;
  cinemaExternalId: string;
  seatExternalIds: string[];
  combos?: {
    comboCode: string;
    quantity: number;
    unitPrice: number;
  }[];
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  totalAmount: number;
}

export interface NormalizedCinemaBookingDto {
  externalBookingId: string;
  bookingCode: string;
  brand: CinemaBrand;
  externalShowtimeId: string;
  seatExternalIds: string[];
  status: MovieBookingStatus;
  confirmedAt?: string;
  expiresAt?: string;
  rawMetadata?: Record<string, any>;
}

export interface CancelCinemaBookingRequestDto {
  idempotencyKey: string;
  externalBookingId: string;
  reason?: string;
}

export interface NormalizedCancelBookingResultDto {
  externalBookingId: string;
  cancelled: boolean;
  status: MovieBookingStatus;
  cancelledAt: string;
  refundEligible: boolean;
}

export interface NormalizedCinemaTicketDto {
  externalTicketId: string;
  externalBookingId: string;
  barcode: string;
  ticketType: MovieTicketType;
  status: MovieTicketStatus;
  cinemaName: string;
  auditoriumName: string;
  movieTitle: string;
  startTime: string;
  seatCodes: string[];
  issuedAt: string;
  expiresAt: string;
}

export interface HoldCinemaSeatRequestDto {
  idempotencyKey: string;
  externalShowtimeId: string;
  seatExternalIds: string[];
  ttlSeconds: number;
}

export interface NormalizedSeatHoldResultDto {
  externalHoldId: string;
  externalShowtimeId: string;
  seatExternalIds: string[];
  expiresAt: string;
}

export interface ReleaseCinemaSeatRequestDto {
  idempotencyKey: string;
  externalHoldId: string;
  externalShowtimeId: string;
  seatExternalIds: string[];
}

export interface RefundCinemaBookingRequestDto {
  idempotencyKey: string;
  externalBookingId: string;
  amount: number;
  reason?: string;
}

export interface CinemaWebhookPayloadDto {
  brand: CinemaBrand;
  eventType: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_FAILED' | 'TICKET_ISSUED' | 'TICKET_USED';
  externalBookingId: string;
  externalTicketId?: string;
  barcode?: string;
  status: string;
  timestamp: string;
  signature?: string;
  rawPayload?: Record<string, any>;
}