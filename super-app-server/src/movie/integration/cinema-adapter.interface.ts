import { CinemaBrand } from '@prisma/client';
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
  HoldCinemaSeatRequestDto,
  NormalizedSeatHoldResultDto,
  ReleaseCinemaSeatRequestDto,
  RefundCinemaBookingRequestDto,
} from './dto/normalized-cinema.dto';

export interface ICinemaAdapter {
  readonly brand: CinemaBrand;
  readonly adapterKey: string;

  /**
   * Trả về danh sách các capability mà rạp hỗ trợ
   */
  getSupportedCapabilities(config?: CinemaProviderRuntimeConfig): CinemaCapability[];

  /**
   * Kiểm tra rạp có hỗ trợ capability cụ thể không
   */
  supportsCapability(capability: CinemaCapability, config?: CinemaProviderRuntimeConfig): boolean;

  /**
   * Danh sách phim từ hệ thống rạp (đã chuẩn hóa)
   */
  getMovies(config: CinemaProviderRuntimeConfig): Promise<NormalizedMovieDto[]>;

  /**
   * Danh sách cụm rạp của hệ thống rạp (đã chuẩn hóa)
   */
  getCinemas(config: CinemaProviderRuntimeConfig): Promise<NormalizedCinemaDto[]>;

  /**
   * Danh sách phòng chiếu theo cụm rạp
   */
  getAuditoriums(
    cinemaExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedAuditoriumDto[]>;

  /**
   * Danh sách suất chiếu theo cụm rạp & ngày
   */
  getShowtimes(
    params: { cinemaExternalId: string; movieExternalId?: string; date?: string },
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedShowtimeDto[]>;

  /**
   * Sơ đồ ghế của phòng chiếu
   */
  getSeats(
    auditoriumExternalId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatDto[]>;

  /**
   * Trạng thái ghế trống/đã đặt theo từng suất chiếu
   */
  getSeatAvailability(
    externalShowtimeId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatAvailabilityDto>;

  /**
   * Đặt vé chính thức tại hệ thống rạp (BẮT BUỘC có idempotencyKey, KHÔNG tự động retry nếu timeout)
   */
  createBooking(
    request: CreateCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto>;

  /**
   * Hủy booking tại hệ thống rạp (nếu rạp hỗ trợ CANCELLATION, BẮT BUỘC có idempotencyKey)
   */
  cancelBooking(
    request: CancelCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCancelBookingResultDto>;

  /**
   * Tra cứu trạng thái booking từ hệ thống rạp
   */
  getBooking(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaBookingDto>;

  /**
   * Lấy thông tin vé & Barcode quét tại quầy (PRINT_AT_COUNTER)
   */
  getTicket(
    externalBookingId: string,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedCinemaTicketDto>;

  /**
   * Mở rộng cho Phase 3: Khóa ghế trên hệ thống rạp (Optional contract)
   */
  holdSeat?(
    request: HoldCinemaSeatRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<NormalizedSeatHoldResultDto>;

  /**
   * Mở rộng cho Phase 3: Giải phóng ghế trên hệ thống rạp (Optional contract)
   */
  releaseSeat?(
    request: ReleaseCinemaSeatRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<{ released: boolean }>;

  /**
   * Mở rộng cho Phase 3: Yêu cầu hoàn tiền trên hệ thống rạp (Optional contract)
   */
  refundBooking?(
    request: RefundCinemaBookingRequestDto,
    config: CinemaProviderRuntimeConfig,
  ): Promise<{ refunded: boolean; externalRefundId?: string }>;
}