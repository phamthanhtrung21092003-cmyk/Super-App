import React, { useEffect, useRef } from 'react';
import { Package, MoreVertical, ArrowLeft, User } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

export default function ChatWindow({
  conversation,
  messages = [],
  existingProducts = [],
  existingOrders = [],
  customerOrders = [],
  quickReplies = [],
  onSendMessage,
  onOpenProductPicker,
  onOpenOrderPicker,
  onViewProduct,
  onViewOrder,
  onToggleCustomerInfo,
  onBackToList
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="chat-window-empty-panel">
        <div className="empty-chat-illustration">
          <span className="chat-bubble-emoji">💬</span>
        </div>
        <h3 className="empty-chat-title">Chưa chọn cuộc trò chuyện</h3>
        <p className="empty-chat-desc">
          Vui lòng chọn một khách hàng từ danh sách bên trái để bắt đầu nhắn tin và tư vấn bán hàng.
        </p>
      </div>
    );
  }

  const {
    customerName = 'Khách hàng',
    customerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status = 'online'
  } = conversation;

  return (
    <div className="chat-window-panel">
      {/* 1. Chat Header Bar */}
      <div className="chat-header-bar">
        <div className="chat-header-left">
          {/* Mobile Back Button */}
          {onBackToList && (
            <button 
              type="button" 
              className="chat-back-btn" 
              onClick={onBackToList}
              title="Quay lại danh sách tin nhắn"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="chat-header-avatar-wrap">
            <img src={customerAvatar} alt={customerName} className="chat-avatar-img" />
            <span className={`chat-online-badge ${status === 'online' ? 'online' : 'offline'}`} />
          </div>

          <div className="chat-header-user-info">
            <h4 className="chat-user-name">{customerName}</h4>
            <span className="chat-user-status">
              {status === 'online' ? '🟢 Đang hoạt động' : 'Offline gần đây'}
            </span>
          </div>
        </div>

        <div className="chat-header-right">
          {/* Quick view orders button */}
          {customerOrders.length > 0 && (
            <button 
              type="button" 
              className="chat-header-action-btn"
              onClick={() => onViewOrder && onViewOrder(customerOrders[0])}
              title="Xem đơn hàng gần nhất của khách"
            >
              <Package size={14} className="icon-blue" />
              <span>Xem đơn hàng</span>
            </button>
          )}

          {/* Toggle Customer Info for Tablet / Mobile */}
          {onToggleCustomerInfo && (
            <button 
              type="button" 
              className="chat-header-info-toggle-btn"
              onClick={onToggleCustomerInfo}
              title="Xem hồ sơ khách hàng"
            >
              <User size={16} />
            </button>
          )}

          <button 
            type="button" 
            className="chat-header-more-btn"
            title="Tùy chọn khác"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Container */}
      <div className="chat-messages-container">
        <div className="chat-security-tip-banner">
          🔒 Để bảo vệ quyền lợi, vui lòng không giao dịch ngoài nền tảng S-SHOPPING / V-life.
        </div>

        {messages.map(msg => (
          <MessageBubble 
            key={msg.id}
            message={msg}
            existingProducts={existingProducts}
            existingOrders={existingOrders}
            onViewProduct={onViewProduct}
            onViewOrder={onViewOrder}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Composer in Footer */}
      <MessageComposer 
        onSendMessage={onSendMessage}
        onOpenProductPicker={onOpenProductPicker}
        onOpenOrderPicker={onOpenOrderPicker}
        quickReplies={quickReplies}
      />
    </div>
  );
}
