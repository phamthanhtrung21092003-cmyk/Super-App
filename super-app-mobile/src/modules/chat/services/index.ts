import { realChatService } from './realChatService';
import { mockChatService } from './mock/mockChatService';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const isMockMode = appEnv === 'mock';

export const chatService = isMockMode ? mockChatService : realChatService;
