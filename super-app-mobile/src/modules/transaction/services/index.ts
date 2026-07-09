import { realTransactionService } from './realTransactionService';
import { mockTransactionService } from './mock/mockTransactionService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const transactionService = isMockMode ? mockTransactionService : realTransactionService;
