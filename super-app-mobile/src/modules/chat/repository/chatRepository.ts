import { chatService } from '../services';
import { IChatRepository } from '../types';
import { ChatRoom, Message } from '../services/mock/mockData/chats';

export const chatRepository: IChatRepository = {
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      return await chatService.getChatRooms();
    } catch (error) {
      console.error('[ChatRepository] Failed to fetch chat rooms:', error);
      throw error;
    }
  },

  async getMessages(roomId: string): Promise<Message[]> {
    try {
      return await chatService.getMessages(roomId);
    } catch (error) {
      console.error(`[ChatRepository] Failed to fetch messages for room ${roomId}:`, error);
      throw error;
    }
  },

  async sendMessage(roomId: string, text: string): Promise<Message> {
    try {
      return await chatService.sendMessage(roomId, text);
    } catch (error) {
      console.error(`[ChatRepository] Failed to send message to room ${roomId}:`, error);
      throw error;
    }
  }
};
export default chatRepository;
