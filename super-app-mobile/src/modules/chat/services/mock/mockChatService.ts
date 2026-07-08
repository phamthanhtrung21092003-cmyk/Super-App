import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IChatService } from '../../types';
import { MOCK_CHATS, Message, ChatRoom } from './mockData/chats';

export const mockChatService: IChatService = {
  async getChatRooms(): Promise<ChatRoom[]> {
    await simulateLatency(300, 800);
    simulateNetworkError(0.01);
    return MOCK_CHATS;
  },

  async getMessages(roomId: string): Promise<Message[]> {
    await simulateLatency(300, 800);
    simulateNetworkError(0.01);
    const room = MOCK_CHATS.find(r => r.id === roomId);
    if (!room) throw new Error('Phòng chat không tồn tại.');
    return room.messages;
  },

  async sendMessage(roomId: string, text: string): Promise<Message> {
    await simulateLatency(300, 600);
    simulateNetworkError(0.01);
    
    const room = MOCK_CHATS.find(r => r.id === roomId);
    if (!room) throw new Error('Phòng chat không tồn tại.');

    const newMsg: Message = {
      id: `msg_${roomId}_user_${Date.now()}`,
      senderId: 'user_id',
      senderName: 'Phạm Thành Trung',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    
    room.messages.push(newMsg);
    room.lastMessage = text;
    room.lastMessageTime = newMsg.timestamp;

    // Giả lập đối tác tự động phản hồi sau 2 giây
    setTimeout(() => {
      const replies = [
        'Dạ vâng em nghe rồi ạ.',
        'Ok bạn nhé!',
        'Tôi nhận được thông tin rồi.',
        'Được rồi bạn ơi.',
        'Cảm ơn bạn đã phản hồi nhé!'
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: Message = {
        id: `msg_${roomId}_reply_${Date.now()}`,
        senderId: room.participantId,
        senderName: room.participantName,
        text: replyText + ' (Tài xế/Cửa hàng phản hồi giả lập)',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      room.messages.push(replyMsg);
      room.lastMessage = replyMsg.text;
      room.lastMessageTime = replyMsg.timestamp;
      room.unreadCount += 1;
    }, 2000);

    return newMsg;
  }
};
export default mockChatService;
