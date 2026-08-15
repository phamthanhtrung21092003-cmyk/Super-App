import React from 'react';
import { Search, MessageSquare, X } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations = [],
  activeConversationId,
  activeFilter = 'all',
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  onSelectConversation
}) {
  const unreadTotal = conversations.filter(c => c.unreadCount > 0).length;
  const repliedTotal = conversations.filter(c => c.isReplied || c.unreadCount === 0).length;

  return (
    <div className="conversation-list-panel">
      {/* 1. Header Bar */}
      <div className="conv-list-header">
        <h3 className="conv-list-title">Tất cả tin nhắn</h3>
        <span className="conv-count-badge">{conversations.length}</span>
      </div>

      {/* 2. Search Input */}
      <div className="conv-search-box">
        <Search size={15} className="conv-search-icon" />
        <input 
          type="text" 
          placeholder="🔍 Tìm khách hàng…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="conv-search-input"
        />
        {searchQuery && (
          <button 
            type="button" 
            className="conv-clear-btn" 
            onClick={() => onSearchChange('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 3. 3 Status Tabs: Tất cả, Chưa đọc, Đã trả lời */}
      <div className="conv-tabs-bar">
        <button 
          type="button"
          className={`conv-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          Tất cả
        </button>

        <button 
          type="button"
          className={`conv-tab-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => onFilterChange('unread')}
        >
          Chưa đọc
          {unreadTotal > 0 && <span className="tab-pill-badge">{unreadTotal}</span>}
        </button>

        <button 
          type="button"
          className={`conv-tab-btn ${activeFilter === 'replied' ? 'active' : ''}`}
          onClick={() => onFilterChange('replied')}
        >
          Đã trả lời
          {repliedTotal > 0 && <span className="tab-pill-badge-neutral">{repliedTotal}</span>}
        </button>
      </div>

      {/* 4. Conversations List */}
      <div className="conv-scroll-list">
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <ConversationItem 
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={onSelectConversation}
            />
          ))
        ) : (
          <div className="conv-empty-state">
            <MessageSquare size={32} className="empty-conv-icon" />
            <p className="empty-conv-title">Không tìm thấy hội thoại</p>
            <span className="empty-conv-sub">
              {searchQuery ? `Không có kết quả cho "${searchQuery}"` : 'Chưa có tin nhắn trong mục này'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
