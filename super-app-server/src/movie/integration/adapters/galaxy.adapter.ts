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
export class GalaxyAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.GALAXY;
  readonly adapterKey = 'galaxy-adapter';

  protected readonly defaultCapabilities: CinemaCapability[] = [
    CinemaCapability.SHOWTIME,
    CinemaCapability.SEAT_MAP,
    CinemaCapability.SEAT_AVAILABILITY,
    CinemaCapability.BOOKING,
    CinemaCapability.TICKET,
  ];

  mapMovie(raw: any): NormalizedMovieDto {
    return {
      externalMovieId: String(raw.glx_film_id || raw.id),
      title: raw.name_vn || raw.title,
      originalTitle: raw.name_en || raw.originalTitle,
      description: raw.short_desc || raw.description,
      duration: Number(raw.duration_minutes || raw.duration || 110),
      genre: raw.categories || raw.genre || 'Hành Động',
      language: raw.spoken_lang || 'Tiếng Việt',
      ageRating: raw.censor_rating || 'T13',
      posterUrl: raw.image_portrait || raw.posterUrl || '',
      backdropUrl: raw.image_landscape || raw.backdropUrl,
      trailerUrl: raw.trailer || raw.trailerUrl,
      releaseDate: raw.publish_date || raw.releaseDate,
      status: 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.glx_cinema_id || raw.id),
      name: raw.cinema_name || raw.name,
      brand: CinemaBrand.GALAXY,
      address: raw.full_address || raw.address,
      city: raw.province_name || raw.city || 'TP. Hồ Chí Minh',
      latitude: raw.lat !== undefined ? Number(raw.lat) : undefined,
      longitude: raw.lng !== undefined ? Number(raw.lng) : undefined,
      phone: raw.phone || '1900 2224',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.hall_id || raw.id),
      cinemaExternalId: String(raw.glx_cinema_id || raw.cinemaExternalId),
      name: raw.hall_name || raw.name,
      totalRows: Number(raw.rows || 6),
      totalCols: Number(raw.cols || 8),
      capacity: Number(raw.capacity || 44),
      screenType: raw.projection || '2D Dolby Atmos',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.session_code || raw.id),
      movieExternalId: String(raw.glx_film_id || raw.movieExternalId),
      cinemaExternalId: String(raw.glx_cinema_id || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.hall_id || raw.auditoriumExternalId),
      startTime: raw.show_time || raw.startTime,
      endTime: raw.end_time || raw.endTime,
      language: raw.sub_lang || 'Phụ Đề Việt',
      format: raw.version_code || '2D',
      basePrice: Number(raw.price_std || 65000),
      vipPrice: Number(raw.price_vip || 75000),
      couplePrice: Number(raw.price_couple || 150000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.code || `${raw.physical_row}${raw.physical_col}`),
      auditoriumExternalId: String(raw.hall_id || 'H1'),
      row: String(raw.physical_row || raw.row),
      number: Number(raw.physical_col || raw.number),
      seatType: this.normalizeSeatType(raw.area_category || raw.seatType),
      status: this.normalizeSeatStatus(raw.is_available ?? raw.status),
      price: raw.price !== undefined ? Number(raw.price) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.vista_trans_id || raw.externalBookingId),
      bookingCode: String(raw.pickup_code || raw.vista_trans_id),
      brand: CinemaBrand.GALAXY,
      externalShowtimeId: String(raw.session_code || raw.externalShowtimeId),
      seatExternalIds: raw.seats || raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.created_time || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.voucher_no || raw.externalTicketId),
      externalBookingId: String(raw.vista_trans_id || raw.externalBookingId),
      barcode: String(raw.counter_barcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.cinema_name || 'Galaxy Cinema',
      auditoriumName: raw.hall_name || 'RAP 1',
      movieTitle: raw.name_vn || '',
      startTime: raw.show_time || new Date().toISOString(),
      seatCodes: raw.seats || [],
      issuedAt: raw.issued_time || new Date().toISOString(),
      expiresAt: raw.expire_time || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}