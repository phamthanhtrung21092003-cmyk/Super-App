import apiClient from '../../../services/apiClient';
import { IWalletService, Wallet } from '../types';

export const realWalletService: IWalletService = {
  async getMyWallet(): Promise<Wallet> {
    const response = await apiClient.get('/wallet/me');
    return response.data;
  },
};
