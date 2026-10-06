import { Injectable } from '@nestjs/common';
import { CinemaBrand, MovieBookingStatus, MovieTicketStatus, MovieTicketType } from '@prisma/client';
import { BaseCinemaAdapter } from './base-cinema.adapter';
import {
  CinemaCapability,
  NormalizedAuditoriumDto,
  NormalizedCinemaBookingDto,
  NormalizedCinemaDto,
  NormalizedCinemaTicketDto,
  NormalizedMovieDto,
  NormalizedSeatDto,
  NormalizedShowtimeDto,
} from '../dto/normalized-cinema.dto';

@Injectable()
export class CgvAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.CGV;
  readonly adapterKey = 'cgv-adapter';

  protected readonly defaultCapabilities: CinemaCapability[] = [
    CinemaCapability.SHOWTIME,
    CinemaCapability.SEAT_MAP,
    CinemaCapability.SEAT_AVAILABILITY,
    CinemaCapability.BOOKING,
    CinemaCapability.TICKET,
  ];

  mapMovie(raw: any): NormalizedMovieDto {
    return {
      externalMovieId: String(raw.movie_code || raw.id),
      title: raw.movie_title_vn || raw.title,
      originalTitle: raw.movie_title_en || raw.originalTitle,
      description: raw.synopsis || raw.description,
      duration: Number(raw.running_time_min || raw.duration || 110),
      genre: raw.genre_name || raw.genre || 'Hành Động',
      language: raw.audio_lang || raw.language || 'Tiếng Việt',
      ageRating: raw.rating_code || raw.ageRating || 'T13',
      posterUrl: raw.poster_image_url || raw.posterUrl || '',
      backdropUrl: raw.banner_image_url || raw.backdropUrl,
      trailerUrl: raw.trailer_video_url || raw.trailerUrl,
      releaseDate: raw.opening_date || raw.releaseDate,
      status: raw.is_now_showing === false ? 'COMING_SOON' : 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.site_code || raw.id),
      name: raw.site_name || raw.name,
      brand: CinemaBrand.CGV,
      address: raw.site_address || raw.address,
      city: raw.region_name || raw.city || 'TP. Hà Nội',
      latitude: raw.gps_lat !== undefined ? Number(raw.gps_lat) : undefined,
      longitude: raw.gps_lng !== undefined ? Number(raw.gps_lng) : undefined,
      phone: raw.hotline || raw.phone || '1900 6017',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.screen_code || raw.id),
      cinemaExternalId: String(raw.site_code || raw.cinemaExternalId),
      name: raw.screen_name || raw.name,
      totalRows: Number(raw.row_count || raw.totalRows || 6),
      totalCols: Number(raw.col_count || raw.totalCols || 8),
      capacity: Number(raw.seat_capacity || raw.capacity || 44),
      screenType: raw.screen_format || raw.screenType || '2D IMAX',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.session_id || raw.id),
      movieExternalId: String(raw.movie_code || raw.movieExternalId),
      cinemaExternalId: String(raw.site_code || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.screen_code || raw.auditoriumExternalId),
      startTime: raw.session_start_time || raw.startTime,
      endTime: raw.session_end_time || raw.endTime,
      language: raw.subtitle_type || raw.language || 'Phụ Đề Việt',
      format: raw.projection_type || raw.format || '2D',
      basePrice: Number(raw.standard_price || raw.basePrice || 75000),
      vipPrice: Number(raw.vip_price || raw.vipPrice || 85000),
      couplePrice: Number(raw.sweetbox_price || raw.couplePrice || 170000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.seat_id || `${raw.row_name}${raw.col_no}`),
      auditoriumExternalId: String(raw.screen_code || raw.auditoriumExternalId || 'P1'),
      row: String(raw.row_name || raw.row),
      number: Number(raw.col_no || raw.number),
      seatType: this.normalizeSeatType(raw.grade_code || raw.seatType),
      status: this.normalizeSeatStatus(raw.seat_state ?? raw.status),
      price: raw.seat_price !== undefined ? Number(raw.seat_price) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.cgv_reservation_no || raw.externalBookingId),
      bookingCode: String(raw.cgv_booking_pin || raw.bookingCode || raw.cgv_reservation_no),
      brand: CinemaBrand.CGV,
      externalShowtimeId: String(raw.session_id || raw.externalShowtimeId),
      seatExternalIds: Array.isArray(raw.reserved_seats) ? raw.reserved_seats : raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.confirmed_at || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.ticket_no || raw.externalTicketId),
      externalBookingId: String(raw.cgv_reservation_no || raw.externalBookingId),
      barcode: String(raw.kiosk_barcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.site_name || raw.cinemaName || 'CGV Cinemas',
      auditoriumName: raw.screen_name || raw.auditoriumName || 'Cinema 1',
      movieTitle: raw.movie_title_vn || raw.movieTitle || '',
      startTime: raw.session_start_time || raw.startTime,
      seatCodes: Array.isArray(raw.seat_labels) ? raw.seat_labels : raw.seatCodes || [],
      issuedAt: raw.issued_at || new Date().toISOString(),
      expiresAt: raw.expires_at || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}