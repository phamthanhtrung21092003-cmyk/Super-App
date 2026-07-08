import { realAuthService } from './realAuthService';
import { mockAuthService } from './mock/mockAuthService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const authService = isMockMode ? mockAuthService : realAuthService;
