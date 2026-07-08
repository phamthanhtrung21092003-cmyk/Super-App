import { Transaction, LinkedBank } from './services/mock/mockData/payments';

export interface IPaymentService {
  getWalletBalance(): Promise<number>;
  getTransactions(): Promise<Transaction[]>;
  addTransaction(amount: number, type: 'in' | 'out', title: string, desc?: string): Promise<Transaction>;
  getLinkedBanks(): Promise<LinkedBank[]>;
  addLinkedBank(name: string, account: string): Promise<LinkedBank>;
}

export interface IPaymentRepository {
  getWalletBalance(): Promise<number>;
  getTransactions(): Promise<Transaction[]>;
  addTransaction(amount: number, type: 'in' | 'out', title: string, desc?: string): Promise<Transaction>;
  getLinkedBanks(): Promise<LinkedBank[]>;
  addLinkedBank(name: string, account: string): Promise<LinkedBank>;
}
