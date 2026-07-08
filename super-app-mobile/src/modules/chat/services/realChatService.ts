import apiClient from '../../../services/apiClient';
import { IChatService } from '../types';
import { ChatRoom, Message } from './mock/mockData/chats';

export const realChatService: IChatService = {
  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  },

  async getMessages(roomId: string): Promise<Message[]> {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  },

  async sendMessage(roomId: string, text: string): Promise<Message> {
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
      text,
    });
    return response.data;
  },
};
