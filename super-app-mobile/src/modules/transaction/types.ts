export interface Transaction {
  id: string;
  walletId: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  type: string;
  direction: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  currency: 'VND';
  description?: string;
  referenceId?: string;
  referenceType?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionService {
  getMyTransactions(page?: number, limit?: number): Promise<{ items: Transaction[]; total: number }>;
}

export interface ITransactionRepository {
  getMyTransactions(): Promise<Transaction[]>;
  refreshMyTransactions(): Promise<Transaction[]>;
}
