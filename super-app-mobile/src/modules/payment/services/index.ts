import { realPaymentService } from './realPaymentService';
import { mockPaymentService } from './mock/mockPaymentService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const paymentService = isMockMode ? mockPaymentService : realPaymentService;
