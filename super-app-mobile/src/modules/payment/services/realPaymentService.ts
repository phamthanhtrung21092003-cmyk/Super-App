import apiClient from '../../../services/apiClient';
import { IPaymentService } from '../types';
import { Transaction, LinkedBank } from './mock/mockData/payments';

export const realPaymentService: IPaymentService = {
  async getWalletBalance(): Promise<number> {
    const response = await apiClient.get('/payment/balance');
    return response.data.balance;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/payment/transactions');
    return response.data;
  },

  async addTransaction(amount: number, type: 'in' | 'out', title: string, desc?: string): Promise<Transaction> {
    const response = await apiClient.post('/payment/transactions', {
      amount,
      type,
      title,
      desc
    });
    return response.data;
  },

  async getLinkedBanks(): Promise<LinkedBank[]> {
    const response = await apiClient.get('/payment/banks');
    return response.data;
  },

  async addLinkedBank(name: string, account: string): Promise<LinkedBank> {
    const response = await apiClient.post('/payment/banks', {
      name,
      account
    });
    return response.data;
  }
};
