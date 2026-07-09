export interface Wallet {
  id: string;
  userId: string;
  walletNumber: string;
  balance: string;
  pendingBalance: string;
  rewardPoints: number;
  currency: 'VND';
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface IWalletService {
  getMyWallet(): Promise<Wallet>;
}

export interface IWalletRepository {
  getMyWallet(): Promise<Wallet>;
  refreshMyWallet(): Promise<Wallet>;
}
