import { realFoodService } from './realFoodService';
import { mockFoodService } from './mock/mockFoodService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const foodService = isMockMode ? mockFoodService : realFoodService;
