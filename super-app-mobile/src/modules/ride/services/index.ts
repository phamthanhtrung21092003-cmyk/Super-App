import { realRideService } from './realRideService';
import { mockRideService } from './mock/mockRideService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const rideService = isMockMode ? mockRideService : realRideService;
