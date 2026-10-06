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
export class BhdAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.BHD;
  readonly adapterKey = 'bhd-adapter';

  protected readonly defaultCapabilities: CinemaCapability[] = [
    CinemaCapability.SHOWTIME,
    CinemaCapability.SEAT_MAP,
    CinemaCapability.SEAT_AVAILABILITY,
    CinemaCapability.BOOKING,
    CinemaCapability.CANCELLATION,
    CinemaCapability.TICKET,
  ];

  mapMovie(raw: any): NormalizedMovieDto {
    return {
      externalMovieId: String(raw.bhd_movie_id || raw.id),
      title: raw.movie_title || raw.title,
      originalTitle: raw.original_title || raw.originalTitle,
      description: raw.synopsis || raw.description,
      duration: Number(raw.runtime_mins || raw.duration || 120),
      genre: Array.isArray(raw.genres) ? raw.genres.join(', ') : raw.genre || 'Hành động',
      language: raw.spoken_lang || raw.language || 'Tiếng Anh',
      ageRating: raw.rating_code || raw.ageRating || 'T16',
      posterUrl: raw.poster_url || raw.posterUrl || '',
      backdropUrl: raw.backdrop_url || raw.backdropUrl,
      trailerUrl: raw.trailer_url || raw.trailerUrl,
      releaseDate: raw.release_date || raw.releaseDate,
      status: raw.showing_state || 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.bhd_location_id || raw.id),
      name: raw.location_name || raw.name,
      brand: CinemaBrand.BHD,
      address: raw.street_address || raw.address,
      city: raw.city || 'TP. Hồ Chí Minh',
      latitude: raw.lat !== undefined ? Number(raw.lat) : undefined,
      longitude: raw.lng !== undefined ? Number(raw.lng) : undefined,
      phone: raw.phone_number || raw.phone || '1900 2099',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.bhd_screen_id || raw.id),
      cinemaExternalId: String(raw.bhd_location_id || raw.cinemaExternalId),
      name: raw.screen_name || raw.name,
      totalRows: Number(raw.total_rows || 6),
      totalCols: Number(raw.total_cols || 8),
      capacity: Number(raw.seat_count || raw.capacity || 44),
      screenType: raw.screen_format || raw.screenType || '2D Onyx',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.bhd_session_id || raw.id),
      movieExternalId: String(raw.bhd_movie_id || raw.movieExternalId),
      cinemaExternalId: String(raw.bhd_location_id || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.bhd_screen_id || raw.auditoriumExternalId),
      startTime: raw.session_start || raw.startTime,
      endTime: raw.session_end || raw.endTime,
      language: raw.sub_lang || raw.language || 'Phụ đề Việt',
      format: raw.format_code || raw.format || '2D',
      basePrice: Number(raw.standard_price || raw.basePrice || 75000),
      vipPrice: Number(raw.vip_price || raw.vipPrice || 90000),
      couplePrice: Number(raw.double_price || raw.couplePrice || 180000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.bhd_seat_id || `${raw.row_id}${raw.col_id}`),
      auditoriumExternalId: String(raw.bhd_screen_id || raw.auditoriumExternalId || 'S1'),
      row: String(raw.row_id || raw.row),
      number: Number(raw.col_id || raw.number),
      seatType: this.normalizeSeatType(raw.seat_category || raw.seatType),
      status: this.normalizeSeatStatus(raw.availability ?? raw.status),
      price: raw.seat_price !== undefined ? Number(raw.seat_price) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.bhd_booking_id || raw.externalBookingId),
      bookingCode: String(raw.pickup_code || raw.bookingCode || raw.bhd_booking_id),
      brand: CinemaBrand.BHD,
      externalShowtimeId: String(raw.bhd_session_id || raw.externalShowtimeId),
      seatExternalIds: Array.isArray(raw.seat_ids) ? raw.seat_ids : raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.confirmed_at || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.bhd_ticket_id || raw.externalTicketId),
      externalBookingId: String(raw.bhd_booking_id || raw.externalBookingId),
      barcode: String(raw.kiosk_barcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.location_name || raw.cinemaName || 'BHD Star Cineplex',
      auditoriumName: raw.screen_name || raw.auditoriumName || 'Screen 1',
      movieTitle: raw.movie_title || raw.movieTitle || '',
      startTime: raw.session_start || raw.startTime || new Date().toISOString(),
      seatCodes: Array.isArray(raw.seat_codes) ? raw.seat_codes : raw.seatCodes || [],
      issuedAt: raw.issued_at || new Date().toISOString(),
      expiresAt: raw.expires_at || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}