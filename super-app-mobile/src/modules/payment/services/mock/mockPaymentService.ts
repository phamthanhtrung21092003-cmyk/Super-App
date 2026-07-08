import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IPaymentService } from '../../types';
import { MOCK_WALLET_BALANCE, MOCK_TRANSACTIONS_LIST, MOCK_LINKED_BANKS, Transaction, LinkedBank } from './mockData/payments';

export const mockPaymentService: IPaymentService = {
  async getWalletBalance(): Promise<number> {
    await simulateLatency(200, 600);
    simulateNetworkError(0.01);
    return MOCK_WALLET_BALANCE;
  },

  async getTransactions(): Promise<Transaction[]> {
    await simulateLatency(400, 1000);
    simulateNetworkError(0.01);
    return MOCK_TRANSACTIONS_LIST;
  },

  async addTransaction(amount: number, type: 'in' | 'out', title: string, desc?: string): Promise<Transaction> {
    await simulateLatency(500, 1200);
    simulateNetworkError(0.01);
    
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      title,
      desc,
      amount: `${type === 'in' ? '+' : '-'}${amount.toLocaleString('vi-VN')}đ`,
      type,
      date: 'Vừa xong',
      icon: type === 'in' ? 'arrow-down-outline' : 'arrow-up-outline',
      bg: type === 'in' ? '#D1FAE5' : '#FEE2E2',
      color: type === 'in' ? '#10B981' : '#EF4444'
    };
    
    MOCK_TRANSACTIONS_LIST.unshift(newTx);
    return newTx;
  },

  async getLinkedBanks(): Promise<LinkedBank[]> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    return MOCK_LINKED_BANKS;
  },

  async addLinkedBank(name: string, account: string): Promise<LinkedBank> {
    await simulateLatency(600, 1500);
    simulateNetworkError(0.01);

    const colors = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];
    const icons = ['leaf', 'diamond', 'star', 'flash', 'business'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newBank: LinkedBank = {
      id: `bank_${Date.now()}`,
      name,
      account: `**** ${account.slice(-4)}`,
      color: randomColor,
      icon: randomIcon
    };

    MOCK_LINKED_BANKS.push(newBank);
    return newBank;
  }
};
export default mockPaymentService;
