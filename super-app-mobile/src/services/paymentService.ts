import apiClient from './apiClient';

export interface CreateBookingPayload {
  serviceId: string;
  startDate: string;
  endDate: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentOrderPayload {
  bookingId?: string;
  movieOrderId?: string;
  provider?: string;
  idempotencyKey?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentId: string;
  amount: number;
  provider: string;
  paymentStatus: 'PENDING' | 'PAYMENT_PROCESSING' | 'PAID' | 'PAYMENT_FAILED' | 'PAYMENT_EXPIRED' | 'REFUNDED';
  // Travel fields
  bookingStatus?: 'PENDING_PAYMENT' | 'PAYMENT_PAID' | 'PAYOUT_PROCESSING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bookingCode?: string;
  serviceTitle?: string;
  // Movie fields
  movieOrderId?: string;
  orderCode?: string;
  movieOrderStatus?: 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  movieBookingStatus?: 'PENDING' | 'BOOKING_CONFIRMING' | 'CONFIRMED' | 'TICKET_ISSUED' | 'FAILED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
  movieTitle?: string;
  cinemaName?: string;
  tickets?: any[];
  expiresAt: string;
  isExpired: boolean;
}

export const paymentService = {
  /**
   * Khởi tạo đơn đặt dịch vụ Travel (Booking) - Server tính giá
   */
  async createBooking(payload: CreateBookingPayload) {
    const response = await apiClient.post('/travel/bookings', payload);
    return response.data;
  },

  /**
   * Chi tiết đơn đặt dịch vụ Travel
   */
  async getBookingById(bookingId: string) {
    const response = await apiClient.get(`/travel/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Lịch sử đơn đặt Travel của người dùng
   */
  async getUserBookingsHistory() {
    try {
      const response = await apiClient.get('/travel/bookings/history');
      return response.data;
    } catch (error) {
      return { bookings: [] };
    }
  },

  /**
   * Khởi tạo đơn thanh toán dùng chung V-Life Payment Core (Travel bookingId hoặc Movie movieOrderId)
   */
  async createPaymentOrder(payload: CreatePaymentOrderPayload) {
    const response = await apiClient.post('/payments/create-order', payload);
    return response.data;
  },

  /**
   * Tra cứu trạng thái thanh toán thời gian thực (Polling API - dùng chung cho Travel & Movie)
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const response = await apiClient.get(`/payments/status/${orderId}`);
    return response.data;
  },
};
