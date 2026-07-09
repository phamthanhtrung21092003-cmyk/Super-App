import { realWalletService } from './realWalletService';
import { mockWalletService } from './mock/mockWalletService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const walletService = isMockMode ? mockWalletService : realWalletService;
