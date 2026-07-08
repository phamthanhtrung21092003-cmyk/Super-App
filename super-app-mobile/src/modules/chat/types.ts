import { ChatRoom, Message } from './services/mock/mockData/chats';

export interface IChatService {
  getChatRooms(): Promise<ChatRoom[]>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(roomId: string, text: string): Promise<Message>;
}

export interface IChatRepository {
  getChatRooms(): Promise<ChatRoom[]>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(roomId: string, text: string): Promise<Message>;
}
