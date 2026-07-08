import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentService } from '../services';
import { IPaymentRepository } from '../types';
import { Transaction, LinkedBank } from '../services/mock/mockData/payments';

const BALANCE_KEY = 'wallet_balance';
const BANKS_KEY = 'linked_banks';
const TXS_KEY = 'transactions_list';

export const paymentRepository: IPaymentRepository = {
  async getWalletBalance(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(BALANCE_KEY);
      if (stored) {
        return parseInt(stored, 10);
      }
      const balance = await paymentService.getWalletBalance();
      await AsyncStorage.setItem(BALANCE_KEY, balance.toString());
      return balance;
    } catch (error) {
      console.error('[PaymentRepository] Failed to get wallet balance:', error);
      return 1000000000; // Trả về mặc định 1 tỷ nếu lỗi
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const stored = await AsyncStorage.getItem(TXS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const txs = await paymentService.getTransactions();
      await AsyncStorage.setItem(TXS_KEY, JSON.stringify(txs));
      return txs;
    } catch (error) {
      console.error('[PaymentRepository] Failed to get transactions:', error);
      throw error;
    }
  },

  async addTransaction(amount: number, type: 'in' | 'out', title: string, desc?: string): Promise<Transaction> {
    try {
      const newTx = await paymentService.addTransaction(amount, type, title, desc);
      
      // Cập nhật số dư trong local storage
      const currentBalance = await this.getWalletBalance();
      const newBalance = type === 'in' ? currentBalance + amount : currentBalance - amount;
      await AsyncStorage.setItem(BALANCE_KEY, newBalance.toString());

      // Cập nhật danh sách giao dịch trong local storage
      const currentTxs = await this.getTransactions();
      const updatedTxs = [newTx, ...currentTxs];
      await AsyncStorage.setItem(TXS_KEY, JSON.stringify(updatedTxs));

      return newTx;
    } catch (error) {
      console.error('[PaymentRepository] Failed to add transaction:', error);
      throw error;
    }
  },

  async getLinkedBanks(): Promise<LinkedBank[]> {
    try {
      const stored = await AsyncStorage.getItem(BANKS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const banks = await paymentService.getLinkedBanks();
      await AsyncStorage.setItem(BANKS_KEY, JSON.stringify(banks));
      return banks;
    } catch (error) {
      console.error('[PaymentRepository] Failed to get linked banks:', error);
      throw error;
    }
  },

  async addLinkedBank(name: string, account: string): Promise<LinkedBank> {
    try {
      const newBank = await paymentService.addLinkedBank(name, account);
      
      const currentBanks = await this.getLinkedBanks();
      const updatedBanks = [...currentBanks, newBank];
      await AsyncStorage.setItem(BANKS_KEY, JSON.stringify(updatedBanks));

      return newBank;
    } catch (error) {
      console.error('[PaymentRepository] Failed to add linked bank:', error);
      throw error;
    }
  }
};
export default paymentRepository;
