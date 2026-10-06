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
export class CinestarAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.CINESTAR;
  readonly adapterKey = 'cinestar-adapter';

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
      externalMovieId: String(raw.csMovieCode || raw.id),
      title: raw.csTitle || raw.title,
      originalTitle: raw.csOriginalTitle || raw.originalTitle,
      description: raw.csDescription || raw.description,
      duration: Number(raw.csDuration || raw.duration || 110),
      genre: Array.isArray(raw.csGenreList) ? raw.csGenreList.join(', ') : raw.genre || 'Hành động',
      language: raw.csLanguage || raw.language || 'Tiếng Việt',
      ageRating: raw.csCensorRating || raw.ageRating || 'T13',
      posterUrl: raw.csPosterUrl || raw.posterUrl || '',
      backdropUrl: raw.csBannerUrl || raw.backdropUrl,
      trailerUrl: raw.csTrailerUrl || raw.trailerUrl,
      releaseDate: raw.csReleaseDate || raw.releaseDate,
      status:
        raw.csStatus === 'UPCOMING'
          ? 'COMING_SOON'
          : raw.csStatus === 'ARCHIVED'
            ? 'ENDED'
            : 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.csTheaterCode || raw.id),
      name: raw.csTheaterName || raw.name,
      brand: CinemaBrand.CINESTAR,
      address: raw.csAddress || raw.address,
      city: raw.csCity || raw.city || 'TP. Hồ Chí Minh',
      latitude: raw.csLat !== undefined ? Number(raw.csLat) : undefined,
      longitude: raw.csLng !== undefined ? Number(raw.csLng) : undefined,
      phone: raw.csPhone || raw.phone || '028 7300 8881',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.csRoomCode || raw.id),
      cinemaExternalId: String(raw.csTheaterCode || raw.cinemaExternalId),
      name: raw.csRoomName || raw.name,
      totalRows: Number(raw.csTotalRows || 6),
      totalCols: Number(raw.csTotalCols || 8),
      capacity: Number(raw.csTotalSeats || raw.capacity || 44),
      screenType: raw.csRoomType || raw.screenType || '2D Dolby 7.1',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.csShowtimeCode || raw.id),
      movieExternalId: String(raw.csMovieCode || raw.movieExternalId),
      cinemaExternalId: String(raw.csTheaterCode || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.csRoomCode || raw.auditoriumExternalId),
      startTime: raw.csStartTime || raw.startTime,
      endTime: raw.csEndTime || raw.endTime,
      language: raw.csSub || raw.language || 'Phụ đề Việt',
      format: raw.csFormat || raw.format || '2D',
      basePrice: Number(raw.csPriceStandard || raw.basePrice || 45000),
      vipPrice: Number(raw.csPriceVip || raw.vipPrice || 55000),
      couplePrice: Number(raw.csPriceCouple || raw.couplePrice || 110000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.csSeatId || `${raw.csRow}${raw.csCol}`),
      auditoriumExternalId: String(raw.csRoomCode || raw.auditoriumExternalId || 'R1'),
      row: String(raw.csRow || raw.row),
      number: Number(raw.csCol || raw.number),
      seatType: this.normalizeSeatType(raw.csType || raw.seatType),
      status: this.normalizeSeatStatus(raw.csStatus ?? raw.status),
      price: raw.csPrice !== undefined ? Number(raw.csPrice) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.csBookingCode || raw.externalBookingId),
      bookingCode: String(raw.csPickupPin || raw.bookingCode || raw.csBookingCode),
      brand: CinemaBrand.CINESTAR,
      externalShowtimeId: String(raw.csShowtimeCode || raw.externalShowtimeId),
      seatExternalIds: Array.isArray(raw.csSeats) ? raw.csSeats : raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.csConfirmedAt || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.csTicketId || raw.externalTicketId),
      externalBookingId: String(raw.csBookingCode || raw.externalBookingId),
      barcode: String(raw.csBarcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.csTheaterName || raw.cinemaName || 'Cinestar',
      auditoriumName: raw.csRoomName || raw.auditoriumName || 'Rạp 1',
      movieTitle: raw.csTitle || raw.movieTitle || '',
      startTime: raw.csStartTime || raw.startTime || new Date().toISOString(),
      seatCodes: Array.isArray(raw.csSeats) ? raw.csSeats : raw.seatCodes || [],
      issuedAt: raw.csIssuedAt || new Date().toISOString(),
      expiresAt: raw.csExpireAt || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}