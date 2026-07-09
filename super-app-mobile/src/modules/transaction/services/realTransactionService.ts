import apiClient from '../../../services/apiClient';
import { ITransactionService, Transaction } from '../types';

export const realTransactionService: ITransactionService = {
  async getMyTransactions(page = 1, limit = 20): Promise<{ items: Transaction[]; total: number }> {
    const response = await apiClient.get('/wallet/transactions', {
      params: { page, limit },
    });
    const items = response.data.items || [];
    const total = response.data.meta?.total || items.length;
    return { items, total };
  },
};
