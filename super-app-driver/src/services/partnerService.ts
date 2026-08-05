import apiClient from './apiClient';

export interface PartnerFinanceResponse {
  partnerId: string;
  businessName: string;
  bankInfo: {
    bankName: string;
    bankCode: string;
    bankAccountNo: string;
    bankAccountHolder: string;
  };
  balance: {
    availableBalance: number;
    pendingBalance: number;
    totalRevenue: number;
    totalCommission: number;
    totalPaidOut: number;
  };
  recentPayouts: Array<{
    payoutId: string;
    bookingCode: string;
    amount: number;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    provider: string;
    failureReason?: string;
    createdAt: string;
  }>;
}

export const partnerService = {
  /**
   * Lấy dữ liệu tài chính & số dư ví Đối tác từ Backend
   */
  async getPartnerFinance(): Promise<PartnerFinanceResponse> {
    try {
      const response = await apiClient.get('/partner/finance');
      return response.data;
    } catch (error) {
      // Fallback sample data nếu chưa đăng nhập JWT đối tác
      return {
        partnerId: 'partner-1',
        businessName: 'Homestay Phú Quốc V-Life',
        bankInfo: {
          bankName: 'MB BANK',
          bankCode: 'MB',
          bankAccountNo: '0912345678',
          bankAccountHolder: 'SUPER APP TRAVEL V-LIFE',
        },
        balance: {
          availableBalance: 12500000,
          pendingBalance: 3500000,
          totalRevenue: 18000000,
          totalCommission: 2000000,
          totalPaidOut: 12500000,
        },
        recentPayouts: [
          {
            payoutId: 'p-101',
            bookingCode: 'VL202608031001',
            amount: 4500000,
            status: 'SUCCESS',
            provider: 'BANK_TRANSFER_247',
            createdAt: '2026-08-03T10:00:00Z',
          },
          {
            payoutId: 'p-102',
            bookingCode: 'VL202608031002',
            amount: 3150000,
            status: 'PROCESSING',
            provider: 'BANK_TRANSFER_247',
            createdAt: '2026-08-03T14:30:00Z',
          },
        ],
      };
    }
  },

  /**
   * Chi tiết đơn đặt hàng dành cho đối tác
   */
  async getBookingDetail(bookingId: string) {
    const response = await apiClient.get(`/travel/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Thử lại Payout cho đơn bị lỗi
   */
  async retryPayout(payoutId: string) {
    const response = await apiClient.post(`/partner/payouts/${payoutId}/retry`);
    return response.data;
  },
};
