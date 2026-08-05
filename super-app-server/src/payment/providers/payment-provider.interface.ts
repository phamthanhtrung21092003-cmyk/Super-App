import { PaymentWebhookDto } from '../dto/payment-webhook.dto';

export interface VerifiedWebhookResult {
  isValid: boolean;
  orderId: string;
  providerTransactionId: string;
  amount: number;
  currency: string;
  isSuccess: boolean;
  rawPayload: any;
  failureReason?: string;
}

export interface IPaymentProvider {
  /**
   * Tên định danh Provider (VIETQR, VNPAY, MOMO, MOCK...)
   */
  readonly name: string;

  /**
   * Xác minh chữ ký bảo mật (HMAC-SHA256) & Parse thông tin Webhook
   */
  verifyAndParseWebhook(
    headers: Record<string, any>,
    body: PaymentWebhookDto | any,
    secret: string,
  ): VerifiedWebhookResult;
}
