import { realAddressService } from './realAddressService';
import { mockAddressService } from './mock/mockAddressService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const addressService = isMockMode ? mockAddressService : realAddressService;
