import { realUserService } from './realUserService';
import { mockUserService } from './mock/mockUserService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const userService = isMockMode ? mockUserService : realUserService;
