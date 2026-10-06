import { Platform } from 'react-native';
import apiClient from './apiClient';

export type CinemaBrandType = 'CGV' | 'LOTTE' | 'GALAXY' | 'BETA' | 'BHD' | 'CINESTAR';

export type BackendSeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
export type MobileSeatDisplayStatus =
  | 'AVAILABLE'
  | 'HELD_BY_ME'
  | 'HELD_BY_OTHER'
  | 'BOOKED'
  | 'UNAVAILABLE';

export interface BackendMovie {
  id: string;
  externalCode?: string | null;
  title: string;
  originalTitle?: string | null;
  slug: string;
  description?: string | null;
  genres: string[];
  durationMin: number;
  language?: string | null;
  subtitle?: string | null;
  ageRating: string;
  posterUrl: string;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  releaseDate?: string | null;
  rating: number | string;
  isShowing: boolean;
  isActive: boolean;
  showtimes?: BackendShowtime[];
}

export interface BackendCinema {
  id: string;
  brand: CinemaBrandType;
  externalCode: string;
  name: string;
  slug: string;
  city: string;
  district?: string | null;
  address: string;
  phone?: string | null;
  openingHours?: string | null;
  facilities: string[];
  isActive: boolean;
  integration?: {
    brand: CinemaBrandType;
    providerName: string;
    holdTtlSeconds: number;
    supportsCancel: boolean;
    isActive: boolean;
  };
}

export interface BackendAuditorium {
  id: string;
  cinemaId: string;
  externalCode: string;
  name: string;
  roomType: string;
  totalSeats: number;
}

export interface BackendShowtime {
  id: string;
  externalCode: string;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  screeningFormat: string;
  audioType?: string | null;
  subtitleType?: string | null;
  startTime: string;
  endTime: string;
  basePrice: number | string;
  vipPrice: number | string;
  couplePrice: number | string;
  serviceFee: number | string;
  isActive: boolean;
  movie?: BackendMovie;
  cinema?: BackendCinema;
  auditorium?: BackendAuditorium;
}

export interface BackendShowtimeSeat {
  id: string;
  showtimeId: string;
  seatId: string;
  seatCode: string;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE' | 'SWEETBOX';
  price: number | string;
  status: BackendSeatStatus;
  heldByUserId?: string | null;
  holdExpiresAt?: string | null;
  seat: {
    id: string;
    rowLabel: string;
    seatNumber: number;
    seatCode: string;
    seatType: 'STANDARD' | 'VIP' | 'COUPLE' | 'SWEETBOX';
  };
}

export interface BackendShowtimeWithSeats extends BackendShowtime {
  showtimeSeats: BackendShowtimeSeat[];
}

export interface BackendCombo {
  id: string;
  cinemaId?: string | null;
  brand?: CinemaBrandType | null;
  code: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  savingsText?: string | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface BackendVoucher {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number | string;
  maxDiscountAmount?: number | string | null;
  minOrderAmount: number | string;
  cinemaBrand?: CinemaBrandType | null;
  validFrom: string;
  validUntil: string;
  status: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucherId: string;
  voucherCode: string;
  title: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  seatsSubtotal: number;
  combosSubtotal: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}

export interface SeatHoldItem {
  id: string;
  showtimeId: string;
  seatId: string;
  seatCode: string;
  userId: string;
  status: 'HELD' | 'RELEASED' | 'CONVERTED' | 'EXPIRED';
  expiresAt: string;
}

export interface SeatHoldResponse {
  showtimeId: string;
  userId: string;
  ttlSeconds: number;
  expiresAt: string;
  holds: SeatHoldItem[];
}

export interface CreateMovieOrderPayload {
  showtimeId: string;
  seatIds: string[];
  combos?: { comboId: string; quantity: number }[];
  voucherCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  idempotencyKey?: string;
}

export interface BackendMovieTicket {
  id: string;
  bookingId: string;
  movieId: string;
  cinemaId: string;
  showtimeId: string;
  ticketCode: string;
  barcode: string;
  barcodeFormat: string;
  qrPayload?: string | null;
  ticketType: 'PRINT_AT_COUNTER' | 'KIOSK_SCAN' | 'DIRECT_ENTRY';
  seatCodes: string[];
  comboSummary?: { name: string; quantity: number; unitPrice: number }[] | null;
  status: 'ISSUED' | 'PRINTED_AT_COUNTER' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';
  issuedAt: string;
  printedAt?: string | null;
  checkedInAt?: string | null;
  movie?: BackendMovie;
  cinema?: BackendCinema;
  showtime?: BackendShowtime;
  booking?: {
    id: string;
    bookingCode: string;
    partnerBookingCode?: string | null;
    adapterBrand: CinemaBrandType;
    status: string;
    movieOrder?: BackendMovieOrder;
  };
}

export interface BackendMovieOrder {
  id: string;
  orderCode: string;
  userId: string;
  movieId: string;
  cinemaId: string;
  showtimeId: string;
  voucherId?: string | null;
  voucherCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  seatsSubtotal: number | string;
  combosSubtotal: number | string;
  serviceFee: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  currency: string;
  status: 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  expiresAt: string;
  paidAt?: string | null;
  createdAt: string;
  items?: {
    id: string;
    itemType: 'SEAT' | 'COMBO';
    seatId?: string | null;
    comboId?: string | null;
    name: string;
    seatCode?: string | null;
    seatType?: string | null;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
  }[];
  movie?: BackendMovie;
  cinema?: BackendCinema;
  showtime?: BackendShowtime;
  booking?: {
    id: string;
    bookingCode: string;
    partnerBookingCode?: string | null;
    adapterBrand: CinemaBrandType;
    status: 'PENDING' | 'BOOKING_CONFIRMING' | 'CONFIRMED' | 'TICKET_ISSUED' | 'FAILED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
    failureReason?: string | null;
    tickets?: BackendMovieTicket[];
  };
  payments?: any[];
  refunds?: any[];
}

/**
 * Phân giải chính xác 5 trạng thái ghế trên Mobile từ dữ liệu Server
 */
export function resolveMobileSeatStatus(
  seat: BackendShowtimeSeat,
  currentUserId?: string | null,
  myHeldSeatIds?: string[],
): MobileSeatDisplayStatus {
  const now = Date.now();
  const isHoldActive =
    seat.status === 'HELD' &&
    (!seat.holdExpiresAt || new Date(seat.holdExpiresAt).getTime() > now);

  if (seat.status === 'BOOKED') {
    return 'BOOKED';
  }
  if (seat.status === 'BLOCKED') {
    return 'UNAVAILABLE';
  }
  if (isHoldActive) {
    const heldByMe =
      (currentUserId && seat.heldByUserId === currentUserId) ||
      (myHeldSeatIds && (myHeldSeatIds.includes(seat.seatId) || myHeldSeatIds.includes(seat.id)));
    return heldByMe ? 'HELD_BY_ME' : 'HELD_BY_OTHER';
  }
  return 'AVAILABLE';
}

/**
 * Sao chép chuỗi thực tế vào Clipboard của thiết bị (Web / Native)
 */
export async function copyToDeviceClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const RN = require('react-native');
    if (RN.Clipboard && typeof RN.Clipboard.setString === 'function') {
      RN.Clipboard.setString(text);
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

export const movieService = {
  async getMovies(): Promise<BackendMovie[]> {
    const response = await apiClient.get('/movies');
    return response.data;
  },

  async getMovieById(idOrSlug: string): Promise<BackendMovie> {
    const response = await apiClient.get(`/movies/${encodeURIComponent(idOrSlug)}`);
    return response.data;
  },

  async getCinemas(params?: { brand?: string; city?: string }): Promise<BackendCinema[]> {
    const query: Record<string, string> = {};
    if (params?.brand && params.brand !== 'all') {
      query.brand = params.brand.toUpperCase();
    }
    if (params?.city && params.city !== 'Tất cả tỉnh thành') {
      query.city = params.city;
    }
    const response = await apiClient.get('/movies/cinemas', { params: query });
    return response.data;
  },

  async getShowtimes(params?: { movieId?: string; cinemaId?: string }): Promise<BackendShowtime[]> {
    const response = await apiClient.get('/movies/showtimes', { params });
    return response.data;
  },

  async getShowtimeSeats(showtimeId: string): Promise<BackendShowtimeWithSeats> {
    const response = await apiClient.get(`/movies/showtimes/${encodeURIComponent(showtimeId)}/seats`);
    return response.data;
  },

  async getCombos(cinemaId?: string): Promise<BackendCombo[]> {
    const response = await apiClient.get('/movies/combos', {
      params: cinemaId ? { cinemaId } : undefined,
    });
    return response.data;
  },

  async getVouchers(cinemaId?: string): Promise<BackendVoucher[]> {
    const response = await apiClient.get('/movies/vouchers', {
      params: cinemaId ? { cinemaId } : undefined,
    });
    return response.data;
  },

  async validateVoucher(payload: {
    voucherCode: string;
    showtimeId?: string;
    seatIds?: string[];
    combos?: { comboId: string; quantity: number }[];
    subtotal?: number;
  }): Promise<VoucherValidationResult> {
    const response = await apiClient.post('/movies/vouchers/validate', payload);
    return response.data;
  },

  async holdSeats(payload: {
    showtimeId: string;
    seatIds: string[];
    idempotencyKey?: string;
  }): Promise<SeatHoldResponse> {
    const response = await apiClient.post('/movies/seat-holds', payload);
    return response.data;
  },

  async releaseSeats(payload: {
    showtimeId: string;
    seatIds?: string[];
    holdIds?: string[];
  }): Promise<{ releasedCount: number; seatIds: string[] }> {
    const response = await apiClient.post('/movies/seat-holds/release', payload);
    return response.data;
  },

  async createMovieOrder(payload: CreateMovieOrderPayload): Promise<BackendMovieOrder> {
    const response = await apiClient.post('/movies/orders', payload);
    return response.data;
  },

  async getMyOrders(): Promise<BackendMovieOrder[]> {
    const response = await apiClient.get('/movies/orders');
    return response.data;
  },

  async getOrderById(orderId: string): Promise<BackendMovieOrder> {
    const response = await apiClient.get(`/movies/orders/${encodeURIComponent(orderId)}`);
    return response.data;
  },

  async reconcileOrder(orderId: string): Promise<any> {
    const response = await apiClient.post(`/movies/orders/${encodeURIComponent(orderId)}/reconcile`);
    return response.data;
  },

  async getMyTickets(): Promise<BackendMovieTicket[]> {
    const response = await apiClient.get('/movies/tickets');
    return response.data;
  },

  async getTicketById(ticketId: string): Promise<BackendMovieTicket> {
    const response = await apiClient.get(`/movies/tickets/${encodeURIComponent(ticketId)}`);
    return response.data;
  },
};
