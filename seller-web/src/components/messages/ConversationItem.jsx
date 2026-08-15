import React from 'react';

export default function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect 
}) {
  const {
    id,
    customerName,
    customerAvatar,
    lastMessage,
    lastMessageTime,
    unreadCount = 0,
    status = 'offline'
  } = conversation;

  return (
    <div 
      className={`conversation-list-item ${isActive ? 'active-conv' : ''} ${unreadCount > 0 ? 'is-unread' : ''}`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(id)}
    >
      {/* Avatar with status indicator dot */}
      <div className="conv-avatar-wrapper">
        <img 
          src={customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
          alt={customerName} 
          className="conv-avatar-img"
        />
        <span className={`conv-status-dot ${status === 'online' ? 'online' : 'offline'}`} />
      </div>

      {/* Main Info */}
      <div className="conv-content-body">
        <div className="conv-top-row">
          <span className="conv-customer-name">{customerName}</span>
          <span className="conv-time-text">{lastMessageTime}</span>
        </div>

        <div className="conv-bottom-row">
          <p className="conv-last-msg-preview">
            {lastMessage || 'Bắt đầu cuộc trò chuyện...'}
          </p>
          {unreadCount > 0 && (
            <span className="conv-unread-pill">
              ● {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
