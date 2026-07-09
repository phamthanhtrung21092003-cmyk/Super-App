import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletService } from '../services';
import { IWalletRepository, Wallet } from '../types';

const WALLET_KEY = 'user_wallet';

export const walletRepository: IWalletRepository = {
  async getMyWallet(): Promise<Wallet> {
    try {
      const stored = await AsyncStorage.getItem(WALLET_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.refreshMyWallet();
    } catch (error) {
      console.error('[WalletRepository] Failed to get wallet from storage:', error);
      return this.refreshMyWallet();
    }
  },

  async refreshMyWallet(): Promise<Wallet> {
    try {
      const wallet = await walletService.getMyWallet();
      await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
      return wallet;
    } catch (error) {
      console.error('[WalletRepository] Failed to refresh wallet:', error);
      throw error;
    }
  },
};
export default walletRepository;
