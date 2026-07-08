export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'driver' | 'merchant' | 'support';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const generateMockChats = (): ChatRoom[] => {
  const rooms: ChatRoom[] = [
    {
      id: 'room_1',
      participantId: 'drv_1',
      participantName: 'Trần Minh Hoàng',
      participantAvatar: 'https://i.pravatar.cc/150?img=11',
      participantRole: 'driver',
      lastMessage: '',
      lastMessageTime: '08:45',
      unreadCount: 0,
      messages: []
    },
    {
      id: 'room_2',
      participantId: 'res_1',
      participantName: 'Highlands Coffee - Lê Lợi',
      participantAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150',
      participantRole: 'merchant',
      lastMessage: '',
      lastMessageTime: 'Hôm qua',
      unreadCount: 0,
      messages: []
    },
    {
      id: 'room_3',
      participantId: 'support_staff',
      participantName: 'Tổng đài hỗ trợ V-life',
      participantAvatar: 'https://ui-avatars.com/api/?name=Support&background=00c6ff&color=fff',
      participantRole: 'support',
      lastMessage: '',
      lastMessageTime: '08:15',
      unreadCount: 1,
      messages: []
    }
  ];

  // Các đoạn chat mẫu để ghép nối tạo ra hơn 200 tin nhắn
  const driverTexts = [
    'Chào bạn, tôi đã nhận đơn hàng của bạn rồi nhé.',
    'Tôi đang di chuyển đến điểm đón/nhà hàng.',
    'Đường hơi kẹt xe một chút, mong bạn thông cảm đợi tôi vài phút nhé.',
    'Tôi đã lấy được đồ ăn/đến điểm đón rồi. Chuẩn bị chạy sang chỗ bạn đây.',
    'Tôi đã đến nơi rồi ạ. Tôi đang đứng trước cổng tòa nhà.',
    'Bạn mặc áo màu gì thế để tôi dễ tìm?',
    'Số điện thoại của bạn có gọi được không?',
    'Vâng ạ, tôi thấy bạn rồi.',
    'Cảm ơn bạn đã sử dụng dịch vụ nhé! Chúc bạn ngày mới tốt lành!',
    'Bạn nhớ đánh giá 5 sao cho tôi nhé. Cảm ơn bạn!'
  ];

  const userTexts = [
    'Dạ vâng anh, em đợi được ạ.',
    'Anh cứ đi cẩn thận nhé, không cần vội đâu ạ.',
    'Em mặc áo thun màu trắng, quần jean đen nha anh.',
    'Dạ số điện thoại này em dùng chính chủ, anh gọi lúc nào cũng được.',
    'Em xuống ngay đây ạ, đợi em 2 phút nhé.',
    'Anh giao tới sảnh tòa nhà giúp em nha.',
    'Đồ ăn có nóng không anh ơi?',
    'Ok anh, em đã nhận được đồ ăn rồi.',
    'Cảm ơn anh tài xế nhiệt tình nha! Chúc anh đắt khách.',
    'Em đã đánh giá 5 sao cho anh rồi nhé!'
  ];

  // Tạo hội thoại chi tiết cho phòng chat 1 (Tài xế Trần Minh Hoàng)
  // Tổng cộng tạo 100 tin nhắn nhắn qua lại giữa khách hàng và tài xế
  const room1Messages: Message[] = [];
  let baseTime = new Date();
  baseTime.setMinutes(baseTime.getMinutes() - 120);

  for (let i = 0; i < 100; i++) {
    const isDriver = i % 2 === 0;
    const textPool = isDriver ? driverTexts : userTexts;
    const text = textPool[Math.floor(i / 10) % textPool.length] + ` (Simulated msg #${i + 1})`;
    
    // Tăng thời gian dần lên
    const msgTime = new Date(baseTime.getTime() + i * 60 * 1000); 
    const timeStr = msgTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    room1Messages.push({
      id: `msg_1_${i}`,
      senderId: isDriver ? 'drv_1' : 'user_id',
      senderName: isDriver ? 'Trần Minh Hoàng' : 'Phạm Thành Trung',
      text,
      timestamp: timeStr,
      isRead: true
    });
  }
  rooms[0].messages = room1Messages;
  rooms[0].lastMessage = room1Messages[room1Messages.length - 1].text;
  rooms[0].lastMessageTime = room1Messages[room1Messages.length - 1].timestamp;

  // Tạo hội thoại chi tiết cho phòng chat 2 (Merchant Highlands Coffee)
  // 60 tin nhắn
  const room2Messages: Message[] = [];
  const merchantTexts = [
    'Chào quý khách, chúng tôi đã nhận được đơn hàng nấu nước.',
    'Cửa hàng đang bắt đầu pha chế món uống của bạn.',
    'Món trà sen vàng hiện tại hết hạt sen rồi ạ, chúng tôi thay bằng thạch nha?',
    'Dạ vâng, cảm ơn quý khách đã đồng ý.',
    'Đơn hàng pha chế xong và đã bàn giao cho tài xế đi giao.',
    'Chúc quý khách ngon miệng!'
  ];

  const userMerchantTexts = [
    'Dạ ok ạ, làm nhanh giúp em nhé cửa hàng.',
    'Thay thạch cũng được ạ, không sao đâu.',
    'Cho em xin thêm một vài ống hút nhé.',
    'Dạ em cảm ơn cửa hàng.'
  ];

  let baseTime2 = new Date();
  baseTime2.setDate(baseTime2.getDate() - 1);
  baseTime2.setHours(10, 0, 0);

  for (let i = 0; i < 60; i++) {
    const isMerchant = i % 2 === 0;
    const text = isMerchant 
      ? merchantTexts[Math.floor(i / 6) % merchantTexts.length]
      : userMerchantTexts[Math.floor(i / 6) % userMerchantTexts.length];
    
    const msgTime = new Date(baseTime2.getTime() + i * 3 * 60 * 1000);
    const timeStr = msgTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    room2Messages.push({
      id: `msg_2_${i}`,
      senderId: isMerchant ? 'res_1' : 'user_id',
      senderName: isMerchant ? 'Highlands Coffee' : 'Phạm Thành Trung',
      text: text + ` (#${i + 1})`,
      timestamp: timeStr,
      isRead: true
    });
  }
  rooms[1].messages = room2Messages;
  rooms[1].lastMessage = room2Messages[room2Messages.length - 1].text;
  rooms[1].lastMessageTime = 'Hôm qua';

  // Tạo hội thoại chi tiết cho phòng chat 3 (Tổng đài Support)
  // 50 tin nhắn để đạt tổng cộng 210 tin nhắn
  const room3Messages: Message[] = [];
  const supportTexts = [
    'Xin chào, V-life CSKH có thể hỗ trợ gì cho quý khách?',
    'Về lỗi thanh toán ví của bạn, chúng tôi đang chuyển bộ phận kỹ thuật kiểm tra.',
    'Hệ thống ghi nhận giao dịch của bạn đã hoàn tất và tiền sẽ hoàn về thẻ sau 3-5 ngày.',
    'Cảm ơn bạn đã phản hồi, chúng tôi sẽ nỗ lực cải thiện dịch vụ.',
    'Quý khách còn câu hỏi nào khác cần hỗ trợ không ạ?'
  ];

  const userSupportTexts = [
    'Chào ad, mình bị lỗi khi liên kết ngân hàng Vietcombank.',
    'Mình bị trừ tiền tài khoản ngân hàng nhưng ví V-life vẫn chưa nhận được.',
    'Dạ mình đã gửi ảnh chụp màn hình giao dịch rồi ạ.',
    'Ok ad, mình đã hiểu. Cảm ơn ad nhé.',
    'Mình không còn câu hỏi nào. Đánh giá 5 sao cho support nha.'
  ];

  let baseTime3 = new Date();
  baseTime3.setMinutes(baseTime3.getMinutes() - 60);

  for (let i = 0; i < 50; i++) {
    const isSupport = i % 2 === 0;
    const text = isSupport 
      ? supportTexts[Math.floor(i / 5) % supportTexts.length]
      : userSupportTexts[Math.floor(i / 5) % userSupportTexts.length];
    
    const msgTime = new Date(baseTime3.getTime() + i * 60 * 1000);
    const timeStr = msgTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    room3Messages.push({
      id: `msg_3_${i}`,
      senderId: isSupport ? 'support_staff' : 'user_id',
      senderName: isSupport ? 'CSKH V-life' : 'Phạm Thành Trung',
      text: text + ` (#${i + 1})`,
      timestamp: timeStr,
      isRead: i < 49 ? true : false
    });
  }
  rooms[2].messages = room3Messages;
  rooms[2].lastMessage = room3Messages[room3Messages.length - 1].text;
  rooms[2].lastMessageTime = room3Messages[room3Messages.length - 1].timestamp;

  return rooms;
};

export const MOCK_CHATS = generateMockChats();
export const MOCK_CHATS_COUNT = 210; // Tổng cộng 210 tin nhắn
