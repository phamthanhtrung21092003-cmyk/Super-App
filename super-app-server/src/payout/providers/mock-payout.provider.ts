import { Injectable, Logger } from '@nestjs/common';
import { IPayoutProvider, PayoutRequest, PayoutResult } from './payout-provider.interface';

@Injectable()
export class MockPayoutProvider implements IPayoutProvider {
  private readonly logger = new Logger(MockPayoutProvider.name);
  readonly name = 'MOCK_PAYOUT_DEV_TEST';

  async executePayout(request: PayoutRequest): Promise<PayoutResult> {
    this.logger.log(
      `[DEV/TEST MOCK PAYOUT] Simulating payout of ${request.amount} VND for booking ${request.bookingCode} to Partner ${request.partnerId} (${request.bankName} - ${request.bankAccountNo})`,
    );

    // Kịch bản mô phỏng thành công cho môi trường DEV/TEST
    const providerTransactionId = `MOCK_PAYOUT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      isSuccess: true,
      providerTransactionId,
    };
  }
}
