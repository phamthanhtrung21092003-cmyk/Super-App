import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { ITransactionService, Transaction } from '../../types';

export const mockTransactionService: ITransactionService = {
  async getMyTransactions(page = 1, limit = 20): Promise<{ items: Transaction[]; total: number }> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);

    const allMocks: Transaction[] = [
      {
        id: 'tx_1',
        walletId: 'mock_wallet_id',
        amount: '50000.00',
        balanceBefore: '1200000.00',
        balanceAfter: '1250000.00',
        type: 'TOP_UP',
        direction: 'CREDIT',
        status: 'SUCCESS',
        currency: 'VND',
        description: 'Nạp tiền ví S-Life từ Vietcombank',
        referenceId: 'topup_847192',
        referenceType: 'TOPUP',
        idempotencyKey: 'idem_topup_1',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'tx_2',
        walletId: 'mock_wallet_id',
        amount: '85000.00',
        balanceBefore: '1285000.00',
        balanceAfter: '1200000.00',
        type: 'RIDE_PAYMENT',
        direction: 'DEBIT',
        status: 'SUCCESS',
        currency: 'VND',
        description: 'Thanh toán chuyến xe V-Ride #R9482',
        referenceId: 'ride_9482',
        referenceType: 'RIDE',
        idempotencyKey: 'idem_ride_2',
        createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      },
      {
        id: 'tx_3',
        walletId: 'mock_wallet_id',
        amount: '120000.00',
        balanceBefore: '1285000.00',
        balanceAfter: '1285000.00',
        type: 'FOOD_PAYMENT',
        direction: 'DEBIT',
        status: 'PENDING',
        currency: 'VND',
        description: 'Thanh toán đặt món gà rán KFC #F2948',
        referenceId: 'food_2948',
        referenceType: 'FOOD',
        idempotencyKey: 'idem_food_3',
        createdAt: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
      },
      {
        id: 'tx_4',
        walletId: 'mock_wallet_id',
        amount: '15000.00',
        balanceBefore: '1270000.00',
        balanceAfter: '1285000.00',
        type: 'REWARD',
        direction: 'CREDIT',
        status: 'SUCCESS',
        currency: 'VND',
        description: 'Thưởng hoàn tiền S-Life Cash',
        referenceId: 'reward_0948',
        referenceType: 'REWARD',
        idempotencyKey: 'idem_reward_4',
        createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      },
      {
        id: 'tx_5',
        walletId: 'mock_wallet_id',
        amount: '200000.00',
        balanceBefore: '1470000.00',
        balanceAfter: '1270000.00',
        type: 'WITHDRAW',
        direction: 'DEBIT',
        status: 'SUCCESS',
        currency: 'VND',
        description: 'Rút tiền về Vietcombank',
        referenceId: 'withdraw_0294',
        referenceType: 'WITHDRAW',
        idempotencyKey: 'idem_withdraw_5',
        createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
      },
    ];

    const start = (page - 1) * limit;
    const items = allMocks.slice(start, start + limit);

    return {
      items,
      total: allMocks.length,
    };
  },
};
