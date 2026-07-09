import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IWalletService, Wallet } from '../../types';

export const mockWalletService: IWalletService = {
  async getMyWallet(): Promise<Wallet> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    
    return {
      id: 'mock_wallet_id',
      userId: 'mock_user_id',
      walletNumber: 'VL8888888888',
      balance: '1250000.00',
      pendingBalance: '150000.00',
      rewardPoints: 450,
      currency: 'VND',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
