export interface PayoutRequest {
  payoutId: string;
  bookingCode: string;
  partnerId: string;
  bankName: string;
  bankCode: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  amount: number;
}

export interface PayoutResult {
  isSuccess: boolean;
  providerTransactionId?: string;
  failureReason?: string;
}

export interface IPayoutProvider {
  /**
   * Tên định danh Provider (MOCK_PAYMENT_DEV, BANK_247_PROD...)
   */
  readonly name: string;

  /**
   * Thực thi chuyển tiền Payout cho Đối tác
   */
  executePayout(request: PayoutRequest): Promise<PayoutResult>;
}
