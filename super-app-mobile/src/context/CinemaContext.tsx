import React, { createContext, useContext, useState } from 'react';
import { BackendMovieOrder, BackendMovieTicket } from '../services/movieService';

export interface ShowtimeSlotItem {
  showtimeId: string;
  cinemaId: string;
  cinemaName: string;
  cinemaBrand: string;
  auditoriumName: string;
  time: string;
  startTimeIso: string;
  price: number;
  priceText: string;
  available: boolean;
}

export interface MovieItem {
  id: string;
  slug?: string;
  title: string;
  originalTitle?: string;
  description?: string;
  poster: string;
  bannerUrl?: string;
  trailerUrl?: string;
  ageRating: string;
  duration: string;
  durationMin?: number;
  language?: string;
  subtitle?: string;
  releaseDate?: string;
  isShowing?: boolean;
  hasTrailer: boolean;
  genres: string;
  showtimes: {
    format: string;
    times: ShowtimeSlotItem[];
  }[];
}

export interface SelectedSeat {
  id: string; // seatCode e.g. "A3"
  seatId: string; // DB Seat.id
  showtimeSeatId?: string; // DB ShowtimeSeat.id
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple';
  price: number;
}

export interface ConcessionCombo {
  id: string;
  code?: string;
  brand?: string | null;
  cinemaId?: string | null;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  savingsText?: string;
}

export interface BookingState {
  movie: MovieItem | null;
  cinemaId: string;
  cinemaBrand: string;
  cinemaName: string;
  roomName: string;
  showtimeId: string;
  startTimeIso?: string;
  selectedDate: string;
  dateLabel: string;
  format: string;
  ageRating: string;
  time: string;
  basePrice: number;
  selectedSeats: SelectedSeat[];
  holdIds: string[];
  holdExpiresAt: string | null;
  availableCombos: ConcessionCombo[];
  selectedCombos: ConcessionCombo[];
  voucherCode: string;
  voucherTitle?: string;
  discountAmount: number;
  serverOrder: BackendMovieOrder | null;
  issuedTicket: BackendMovieTicket | null;
  movieOrderId?: string;
  ticketId?: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  bookingCode?: string;
}

interface SelectShowtimeMetadata {
  showtimeId?: string;
  cinemaId?: string;
  cinemaBrand?: string;
  startTimeIso?: string;
  selectedDate?: string;
}

interface CinemaContextType {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  selectShowtime: (
    movie: MovieItem,
    format: string,
    time: string,
    price: number,
    dateLabel?: string,
    cinemaName?: string,
    roomName?: string,
    meta?: SelectShowtimeMetadata
  ) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  setSeatHolds: (holdIds: string[], expiresAt: string, seats?: SelectedSeat[]) => void;
  clearExpiredHold: () => void;
  setAvailableCombos: (combos: ConcessionCombo[]) => void;
  updateComboQuantity: (comboId: string, delta: number, comboSource?: ConcessionCombo) => void;
  applyValidatedVoucher: (code: string, discountAmount: number, title?: string) => void;
  clearVoucher: () => void;
  setServerMovieOrder: (order: BackendMovieOrder | null) => void;
  setIssuedTicket: (ticket: BackendMovieTicket | null) => void;
  setCustomerDetails: (fullName: string, phone: string, email: string) => void;
  resetBooking: () => void;
  getSeatsTotalPrice: () => number;
  getCombosTotalPrice: () => number;
  getDiscountAmount: () => number;
  getGrandTotal: () => number;
  getRemainingHoldSeconds: () => number;
}

const DEFAULT_BOOKING: BookingState = {
  movie: null,
  cinemaId: '',
  cinemaBrand: '',
  cinemaName: '',
  roomName: '',
  showtimeId: '',
  startTimeIso: undefined,
  selectedDate: '',
  dateLabel: '',
  format: '2D',
  ageRating: 'T13',
  time: '',
  basePrice: 0,
  selectedSeats: [],
  holdIds: [],
  holdExpiresAt: null,
  availableCombos: [],
  selectedCombos: [],
  voucherCode: '',
  voucherTitle: undefined,
  discountAmount: 0,
  serverOrder: null,
  issuedTicket: null,
  movieOrderId: undefined,
  ticketId: undefined,
  customerInfo: {
    fullName: '',
    phone: '',
    email: '',
  },
  paymentMethod: 'Chuyển khoản VietQR (V-Life Payment Core)',
};

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booking, setBooking] = useState<BookingState>(DEFAULT_BOOKING);

  const selectShowtime = (
    movie: MovieItem,
    format: string,
    time: string,
    price: number,
    dateLabel: string = '',
    cinemaName: string = '',
    roomName: string = '',
    meta?: SelectShowtimeMetadata
  ) => {
    setBooking(prev => ({
      ...prev,
      movie,
      format,
      time,
      basePrice: price,
      dateLabel,
      selectedDate: meta?.selectedDate || dateLabel,
      cinemaName,
      roomName,
      cinemaId: meta?.cinemaId || '',
      cinemaBrand: meta?.cinemaBrand || '',
      showtimeId: meta?.showtimeId || '',
      startTimeIso: meta?.startTimeIso,
      ageRating: movie.ageRating,
      selectedSeats: [],
      holdIds: [],
      holdExpiresAt: null,
      selectedCombos: [],
      voucherCode: '',
      voucherTitle: undefined,
      discountAmount: 0,
      serverOrder: null,
      issuedTicket: null,
      movieOrderId: undefined,
      ticketId: undefined,
      bookingCode: undefined,
    }));
  };

  const toggleSeat = (seat: SelectedSeat) => {
    setBooking(prev => {
      const exists = prev.selectedSeats.find(s => s.seatId === seat.seatId || s.id === seat.id);
      const updated = exists
        ? prev.selectedSeats.filter(s => s.seatId !== seat.seatId && s.id !== seat.id)
        : [...prev.selectedSeats, seat];
      return {
        ...prev,
        selectedSeats: updated,
        serverOrder: null,
      };
    });
  };

  const setSeatHolds = (holdIds: string[], expiresAt: string, seats?: SelectedSeat[]) => {
    setBooking(prev => ({
      ...prev,
      holdIds,
      holdExpiresAt: expiresAt,
      ...(seats ? { selectedSeats: seats } : {}),
    }));
  };

  const clearExpiredHold = () => {
    setBooking(prev => ({
      ...prev,
      selectedSeats: [],
      holdIds: [],
      holdExpiresAt: null,
      selectedCombos: [],
      voucherCode: '',
      voucherTitle: undefined,
      discountAmount: 0,
      serverOrder: null,
      movieOrderId: undefined,
    }));
  };

  const setAvailableCombos = (combos: ConcessionCombo[]) => {
    setBooking(prev => ({
      ...prev,
      availableCombos: combos,
    }));
  };

  const updateComboQuantity = (comboId: string, delta: number, comboSource?: ConcessionCombo) => {
    setBooking(prev => {
      const existing = prev.selectedCombos.find(c => c.id === comboId);
      let updatedCombos: ConcessionCombo[];
      if (!existing && delta > 0) {
        const catalogCombo = comboSource || prev.availableCombos.find(c => c.id === comboId);
        if (catalogCombo) {
          updatedCombos = [...prev.selectedCombos, { ...catalogCombo, quantity: delta }];
        } else {
          updatedCombos = prev.selectedCombos;
        }
      } else if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          updatedCombos = prev.selectedCombos.filter(c => c.id !== comboId);
        } else {
          updatedCombos = prev.selectedCombos.map(c =>
            c.id === comboId ? { ...c, quantity: newQty } : c
          );
        }
      } else {
        updatedCombos = prev.selectedCombos;
      }
      return {
        ...prev,
        selectedCombos: updatedCombos,
        serverOrder: null,
      };
    });
  };

  const applyValidatedVoucher = (code: string, discountAmount: number, title?: string) => {
    setBooking(prev => ({
      ...prev,
      voucherCode: code,
      discountAmount,
      voucherTitle: title,
      serverOrder: null,
    }));
  };

  const clearVoucher = () => {
    setBooking(prev => ({
      ...prev,
      voucherCode: '',
      discountAmount: 0,
      voucherTitle: undefined,
      serverOrder: null,
    }));
  };

  const setServerMovieOrder = (order: BackendMovieOrder | null) => {
    setBooking(prev => ({
      ...prev,
      serverOrder: order,
      movieOrderId: order?.id,
      bookingCode: order?.booking?.bookingCode || order?.orderCode || prev.bookingCode,
      holdExpiresAt: order?.expiresAt || prev.holdExpiresAt,
      discountAmount: order ? Number(order.discountAmount) : prev.discountAmount,
    }));
  };

  const setIssuedTicket = (ticket: BackendMovieTicket | null) => {
    setBooking(prev => ({
      ...prev,
      issuedTicket: ticket,
      ticketId: ticket?.id,
      bookingCode: ticket?.booking?.bookingCode || ticket?.ticketCode || prev.bookingCode,
    }));
  };

  const setCustomerDetails = (fullName: string, phone: string, email: string) => {
    setBooking(prev => ({
      ...prev,
      customerInfo: { fullName, phone, email },
    }));
  };

  const resetBooking = () => {
    setBooking(DEFAULT_BOOKING);
  };

  const getSeatsTotalPrice = () => {
    if (booking.serverOrder) {
      return Number(booking.serverOrder.seatsSubtotal);
    }
    return booking.selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);
  };

  const getCombosTotalPrice = () => {
    if (booking.serverOrder) {
      return Number(booking.serverOrder.combosSubtotal);
    }
    return booking.selectedCombos.reduce((sum, combo) => sum + Number(combo.price) * combo.quantity, 0);
  };

  const getDiscountAmount = () => {
    if (booking.serverOrder) {
      return Number(booking.serverOrder.discountAmount);
    }
    return booking.discountAmount || 0;
  };

  const getGrandTotal = () => {
    if (booking.serverOrder) {
      return Number(booking.serverOrder.totalAmount);
    }
    const seatsTotal = getSeatsTotalPrice();
    const combosTotal = getCombosTotalPrice();
    const discount = getDiscountAmount();
    return Math.max(0, seatsTotal + combosTotal - discount);
  };

  const getRemainingHoldSeconds = () => {
    const expiresIso = booking.serverOrder?.expiresAt || booking.holdExpiresAt;
    if (!expiresIso) return 0;
    const diffMs = new Date(expiresIso).getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  return (
    <CinemaContext.Provider
      value={{
        booking,
        setBooking,
        selectShowtime,
        toggleSeat,
        setSeatHolds,
        clearExpiredHold,
        setAvailableCombos,
        updateComboQuantity,
        applyValidatedVoucher,
        clearVoucher,
        setServerMovieOrder,
        setIssuedTicket,
        setCustomerDetails,
        resetBooking,
        getSeatsTotalPrice,
        getCombosTotalPrice,
        getDiscountAmount,
        getGrandTotal,
        getRemainingHoldSeconds,
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
};