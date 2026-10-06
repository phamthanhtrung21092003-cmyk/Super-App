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
export class BetaAdapter extends BaseCinemaAdapter {
  readonly brand = CinemaBrand.BETA;
  readonly adapterKey = 'beta-adapter';

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
      externalMovieId: String(raw.FilmId || raw.id),
      title: raw.FilmNameVn || raw.title,
      originalTitle: raw.FilmNameEn || raw.originalTitle,
      description: raw.StoryLine || raw.description,
      duration: Number(raw.DurationMin || raw.duration || 115),
      genre: raw.Categories || raw.genre || 'Hài, Tình cảm',
      language: raw.AudioLang || raw.language || 'Tiếng Việt',
      ageRating: raw.AgeLimit || raw.ageRating || 'T13',
      posterUrl: raw.PosterImage || raw.posterUrl || '',
      backdropUrl: raw.BannerImage || raw.backdropUrl,
      trailerUrl: raw.YoutubeTrailer || raw.trailerUrl,
      releaseDate: raw.PremiereDate || raw.releaseDate,
      status:
        raw.StatusFlag === 'COMING_SOON'
          ? 'COMING_SOON'
          : raw.StatusFlag === 'ENDED'
            ? 'ENDED'
            : 'NOW_SHOWING',
    };
  }

  mapCinema(raw: any): NormalizedCinemaDto {
    return {
      externalCinemaId: String(raw.CineplexCode || raw.id),
      name: raw.CineplexName || raw.name,
      brand: CinemaBrand.BETA,
      address: raw.AddressText || raw.address,
      city: raw.ProvinceName || raw.city || 'TP. Hà Nội',
      latitude: raw.GeoLat !== undefined ? Number(raw.GeoLat) : undefined,
      longitude: raw.GeoLng !== undefined ? Number(raw.GeoLng) : undefined,
      phone: raw.Hotline || raw.phone || '1900 636807',
    };
  }

  mapAuditorium(raw: any): NormalizedAuditoriumDto {
    return {
      externalAuditoriumId: String(raw.HallCode || raw.id),
      cinemaExternalId: String(raw.CineplexCode || raw.cinemaExternalId),
      name: raw.HallName || raw.name,
      totalRows: Number(raw.RowCount || raw.totalRows || 6),
      totalCols: Number(raw.ColCount || raw.totalCols || 8),
      capacity: Number(raw.SeatCapacity || raw.capacity || 44),
      screenType: raw.HallType || raw.screenType || '2D Standard',
    };
  }

  mapShowtime(raw: any): NormalizedShowtimeDto {
    return {
      externalShowtimeId: String(raw.ScheduleCode || raw.id),
      movieExternalId: String(raw.FilmId || raw.movieExternalId),
      cinemaExternalId: String(raw.CineplexCode || raw.cinemaExternalId),
      auditoriumExternalId: String(raw.HallCode || raw.auditoriumExternalId),
      startTime: raw.StartDateTime || raw.startTime,
      endTime: raw.EndDateTime || raw.endTime,
      language: raw.SubFormat || raw.language || 'Phụ đề Việt',
      format: raw.ProjectionFormat || raw.format || '2D',
      basePrice: Number(raw.TicketBasePrice || raw.basePrice || 55000),
      vipPrice: Number(raw.VipPrice || raw.vipPrice || 65000),
      couplePrice: Number(raw.CouplePrice || raw.couplePrice || 130000),
    };
  }

  mapSeat(raw: any): NormalizedSeatDto {
    return {
      externalSeatId: String(raw.SeatKey || `${raw.RowChar}${raw.ColNum}`),
      auditoriumExternalId: String(raw.HallCode || raw.auditoriumExternalId || 'H1'),
      row: String(raw.RowChar || raw.row),
      number: Number(raw.ColNum || raw.number),
      seatType: this.normalizeSeatType(raw.SeatKind || raw.seatType),
      status: this.normalizeSeatStatus(raw.SeatState ?? raw.status),
      price: raw.PriceValue !== undefined ? Number(raw.PriceValue) : undefined,
    };
  }

  mapBooking(raw: any): NormalizedCinemaBookingDto {
    return {
      externalBookingId: String(raw.OrderCode || raw.externalBookingId),
      bookingCode: String(raw.PinCode || raw.bookingCode || raw.OrderCode),
      brand: CinemaBrand.BETA,
      externalShowtimeId: String(raw.ScheduleCode || raw.externalShowtimeId),
      seatExternalIds: Array.isArray(raw.SeatKeys) ? raw.SeatKeys : raw.seatExternalIds || [],
      status: (raw.status as MovieBookingStatus) || MovieBookingStatus.BOOKING_CONFIRMED,
      confirmedAt: raw.ConfirmedAt || new Date().toISOString(),
      rawMetadata: raw,
    };
  }

  mapTicket(raw: any): NormalizedCinemaTicketDto {
    return {
      externalTicketId: String(raw.TicketNo || raw.externalTicketId),
      externalBookingId: String(raw.OrderCode || raw.externalBookingId),
      barcode: String(raw.PrintCode || raw.PickupCounterBarcode || raw.barcode),
      ticketType: MovieTicketType.PRINT_AT_COUNTER,
      status: MovieTicketStatus.ISSUED,
      cinemaName: raw.CineplexName || raw.cinemaName || 'Beta Cinemas',
      auditoriumName: raw.HallName || raw.auditoriumName || 'Phòng 1',
      movieTitle: raw.FilmNameVn || raw.movieTitle || '',
      startTime: raw.StartDateTime || raw.startTime || new Date().toISOString(),
      seatCodes: Array.isArray(raw.SeatLabels) ? raw.SeatLabels : raw.seatCodes || [],
      issuedAt: raw.IssuedTime || new Date().toISOString(),
      expiresAt: raw.ExpireAt || new Date(Date.now() + 86400_000).toISOString(),
    };
  }
}