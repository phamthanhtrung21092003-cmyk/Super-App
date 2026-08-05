import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  IPaymentProvider,
  VerifiedWebhookResult,
} from './payment-provider.interface';

@Injectable()
export class VietQrWebhookProvider implements IPaymentProvider {
  readonly name = 'VIETQR';

  verifyAndParseWebhook(
    headers: Record<string, any>,
    body: any,
    webhookSecret: string,
  ): VerifiedWebhookResult {
    const rawPayload = body || {};
    const signature =
      headers['x-vlife-signature'] ||
      headers['x-signature'] ||
      body.signature ||
      '';

    const orderId = body.orderId || body.content || body.addInfo || '';
    const providerTransactionId =
      body.providerTransactionId || body.transactionId || body.id || '';
    const amount = Number(body.amount || 0);
    const currency = body.currency || 'VND';
    // Hỗ trợ cả 2 trường: 
    // - body.status: 'FAILED' (standard webhook format)
    // - body.isSuccess: false (explicit boolean from internal providers/tests)
    const isSuccess =
      body.isSuccess !== undefined ? Boolean(body.isSuccess) : body.status !== 'FAILED';

    // 1. Kiểm tra HMAC Signature nếu secret được cấu hình
    if (webhookSecret && webhookSecret !== 'NONE') {
      const dataToSign = `${orderId}|${providerTransactionId}|${amount}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(dataToSign)
        .digest('hex');

      if (signature !== expectedSignature) {
        return {
          isValid: false,
          orderId,
          providerTransactionId,
          amount,
          currency,
          isSuccess: false,
          rawPayload,
          failureReason: 'Chữ ký HMAC Webhook không hợp lệ (Invalid Signature)',
        };
      }
    }

    return {
      isValid: true,
      orderId,
      providerTransactionId,
      amount,
      currency,
      isSuccess,
      rawPayload,
    };
  }
}
