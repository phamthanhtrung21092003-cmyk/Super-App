import AsyncStorage from '@react-native-async-storage/async-storage';
import { transactionService } from '../services';
import { ITransactionRepository, Transaction } from '../types';

const TRANSACTIONS_KEY = 'user_transactions';

export const transactionRepository: ITransactionRepository = {
  async getMyTransactions(): Promise<Transaction[]> {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.refreshMyTransactions();
    } catch (error) {
      console.error('[TransactionRepository] Failed to get transactions from storage:', error);
      return this.refreshMyTransactions();
    }
  },

  async refreshMyTransactions(): Promise<Transaction[]> {
    try {
      const result = await transactionService.getMyTransactions(1, 20);
      const items = result.items || [];
      // Chỉ cache tối đa 20 giao dịch mới nhất
      const toCache = items.slice(0, 20);
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(toCache));
      return items;
    } catch (error) {
      console.error('[TransactionRepository] Failed to refresh transactions:', error);
      throw error;
    }
  },
};
export default transactionRepository;
