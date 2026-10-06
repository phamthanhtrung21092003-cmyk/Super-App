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
export class LotteAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.LOTTE;
  readonly adapterKey = 'lotte-adapter';

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
      externalMovieId: String(raw.RepresentationMovieCode || raw.id),
      title: raw.MovieNameVN || raw.title,
      originalTitle: raw.MovieNameENG || raw.originalTitle,
      description: raw.Synopsis || raw.description,
      duration: Number(raw.PlayTime || raw.duration || 115),
      genre: raw.MovieGenreName || raw.genre || 'Hành Động',
      language: raw.SoundTypeName || raw.language || 'Tiếng Việt',
      ageRating: raw.ViewGradeCode || raw.ageRating || 'T13',
      posterUrl: raw.PosterURL || raw.posterUrl || '',
      backdropUrl: raw.BackdropURL || raw.backdropUrl,
      trailerUrl: raw.TrailerURL || raw.trailerUrl,
      releaseDate: raw.ReleaseDate || raw.releaseDate,
      status: 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.CinemaID || raw.id),
      name: raw.CinemaNameVN || raw.name,
      brand: CinemaBrand.LOTTE,
      address: raw.AddressVN || raw.address,
      city: raw.CityName || raw.city || 'TP. Hà Nội',
      latitude: raw.Latitude !== undefined ? Number(raw.Latitude) : undefined,
      longitude: raw.Longitude !== undefined ? Number(raw.Longitude) : undefined,
      phone: raw.Telephone || raw.phone || '024 3775 2525',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.ScreenID || raw.id),
      cinemaExternalId: String(raw.CinemaID || raw.cinemaExternalId),
      name: raw.ScreenName || raw.name,
      totalRows: Number(raw.TotalRows || 6),
      totalCols: Number(raw.TotalCols || 8),
      capacity: Number(raw.TotalSeats || 44),
      screenType: raw.ScreenDivisionName || '2D Charlotte',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.PlaySequenceCode || raw.id),
      movieExternalId: String(raw.RepresentationMovieCode || raw.movieExternalId),
      cinemaExternalId: String(raw.CinemaID || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.ScreenID || raw.auditoriumExternalId),
      startTime: raw.StartTime || raw.startTime,
      endTime: raw.EndTime || raw.endTime,
      language: raw.CaptionName || 'Phụ Đề Việt',
      format: raw.FilmName || '2D',
      basePrice: Number(raw.StandardPrice || 65000),
      vipPrice: Number(raw.PrimePrice || 75000),
      couplePrice: Number(raw.CouplePrice || 150000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.SeatNo || `${raw.SeatRow}${raw.SeatCol}`),
      auditoriumExternalId: String(raw.ScreenID || 'S1'),
      row: String(raw.SeatRow || raw.row),
      number: Number(raw.SeatCol || raw.number),
      seatType: this.normalizeSeatType(raw.SeatClass || raw.seatType),
      status: this.normalizeSeatStatus(raw.SeatStatusCode ?? raw.status),
      price: raw.TicketPrice !== undefined ? Number(raw.TicketPrice) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.BookingNo || raw.externalBookingId),
      bookingCode: String(raw.BookingPin || raw.BookingNo),
      brand: CinemaBrand.LOTTE,
      externalShowtimeId: String(raw.PlaySequenceCode || raw.externalShowtimeId),
      seatExternalIds: raw.SeatList || raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.BookedAt || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.TicketID || raw.externalTicketId),
      externalBookingId: String(raw.BookingNo || raw.externalBookingId),
      barcode: String(raw.PrintBarcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.CinemaNameVN || 'LOTTE Cinema',
      auditoriumName: raw.ScreenName || 'Screen 1',
      movieTitle: raw.MovieNameVN || '',
      startTime: raw.StartTime || new Date().toISOString(),
      seatCodes: raw.SeatCodes || [],
      issuedAt: raw.IssuedAt || new Date().toISOString(),
      expiresAt: raw.ExpiresAt || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}