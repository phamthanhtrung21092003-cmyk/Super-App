import { realVideoService } from './realVideoService';
import { IVideoService } from '../types';

export const videoService: IVideoService = realVideoService;
export { realVideoService };
