import React, { createContext, useContext, useState } from 'react';

export interface MovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  poster: string;
  ageRating: string; // 'T13', 'T16', 'T18', 'P'
  duration: string; // "1h49'"
  hasTrailer: boolean;
  genres: string;
  showtimes: {
    format: string; // "2D Lồng Tiếng", "2D Phụ Đề Việt"
    times: { time: string; price: number; priceText: string; available: boolean }[];
  }[];
}

export interface SelectedSeat {
  id: string; // "E5"
  row: string; // "E"
  number: number; // 5
  type: 'standard' | 'vip' | 'couple';
  price: number;
}

export interface ConcessionCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  savingsText?: string;
}

export interface BookingState {
  movie: MovieItem | null;
  selectedDate: string; // "27/07/2026"
  dateLabel: string; // "Thứ Hai · 27/07"
  cinemaName: string; // "Beta Xuân Thủy"
  roomName: string; // "Phòng chiếu P7"
  format: string; // "2D LỒNG TIẾNG"
  ageRating: string; // "T13"
  time: string; // "17:30"
  basePrice: number; // 50000
  selectedSeats: SelectedSeat[];
  selectedCombos: ConcessionCombo[];
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string; // "Chuyển khoản / Quét mã QR"
  bookingCode?: string;
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
    roomName?: string
  ) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  updateComboQuantity: (comboId: string, delta: number) => void;
  setCustomerDetails: (fullName: string, phone: string, email: string) => void;
  resetBooking: () => void;
  getSeatsTotalPrice: () => number;
  getCombosTotalPrice: () => number;
  getGrandTotal: () => number;
}

const DEFAULT_BOOKING: BookingState = {
  movie: null,
  selectedDate: '27/07/2026',
  dateLabel: 'Thứ Hai · 27/07',
  cinemaName: 'Beta Xuân Thủy',
  roomName: 'Phòng chiếu P7',
  format: '2D LỒNG TIẾNG',
  ageRating: 'T13',
  time: '17:30',
  basePrice: 50000,
  selectedSeats: [],
  selectedCombos: [],
  customerInfo: {
    fullName: '',
    phone: '',
    email: '',
  },
  paymentMethod: 'Chuyển khoản / Quét mã QR',
};

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booking, setBooking] = useState<BookingState>(DEFAULT_BOOKING);

  const selectShowtime = (
    movie: MovieItem,
    format: string,
    time: string,
    price: number,
    dateLabel: string = 'Thứ Hai · 27/07',
    cinemaName: string = 'Beta Xuân Thủy',
    roomName: string = 'Phòng chiếu P7'
  ) => {
    setBooking(prev => ({
      ...prev,
      movie,
      format,
      time,
      basePrice: price,
      dateLabel,
      cinemaName,
      roomName,
      ageRating: movie.ageRating,
      selectedSeats: [],
      selectedCombos: [],
    }));
  };

  const toggleSeat = (seat: SelectedSeat) => {
    setBooking(prev => {
      const exists = prev.selectedSeats.find(s => s.id === seat.id);
      let updated: SelectedSeat[];
      if (exists) {
        updated = prev.selectedSeats.filter(s => s.id !== seat.id);
      } else {
        updated = [...prev.selectedSeats, seat];
      }
      return { ...prev, selectedSeats: updated };
    });
  };

  const updateComboQuantity = (comboId: string, delta: number) => {
    setBooking(prev => {
      const existing = prev.selectedCombos.find(c => c.id === comboId);
      let updatedCombos: ConcessionCombo[];
      if (!existing && delta > 0) {
        const mockCombo = MOCK_COMBOS.find(c => c.id === comboId);
        if (mockCombo) {
          updatedCombos = [...prev.selectedCombos, { ...mockCombo, quantity: delta }];
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
      return { ...prev, selectedCombos: updatedCombos };
    });
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
    return booking.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const getCombosTotalPrice = () => {
    return booking.selectedCombos.reduce((sum, combo) => sum + combo.price * combo.quantity, 0);
  };

  const getGrandTotal = () => {
    const seatsTotal = getSeatsTotalPrice();
    const combosTotal = getCombosTotalPrice();
    const serviceFee = seatsTotal > 0 ? 5000 : 0;
    return seatsTotal + combosTotal + serviceFee;
  };

  return (
    <CinemaContext.Provider
      value={{
        booking,
        setBooking,
        selectShowtime,
        toggleSeat,
        updateComboQuantity,
        setCustomerDetails,
        resetBooking,
        getSeatsTotalPrice,
        getCombosTotalPrice,
        getGrandTotal,
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

export const MOCK_COMBOS: ConcessionCombo[] = [
  {
    id: 'beta-combo-69oz',
    name: 'Beta Combo 69oz',
    description: 'TIẾT KIỆM 28K!!! Gồm: 1 Bắp (69oz) + 1 Nước có gas (22oz)',
    price: 68000,
    quantity: 0,
    savingsText: 'TIẾT KIỆM 28K!!!',
  },
  {
    id: 'sweet-combo-69oz',
    name: 'Sweet Combo 69oz',
    description: 'TIẾT KIỆM 46K!!! Gồm: 1 Bắp (69oz) + 2 Nước có gas (22oz)',
    price: 88000,
    quantity: 0,
    savingsText: 'TIẾT KIỆM 46K!!!',
  },
];
