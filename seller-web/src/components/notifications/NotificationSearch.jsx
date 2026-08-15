import React from 'react';
import { Search, X } from 'lucide-react';

export default function NotificationSearch({
  searchQuery = '',
  onSearchChange
}) {
  return (
    <div className="notification-search-box">
      <Search size={16} className="noti-search-icon" />
      <input 
        type="text" 
        placeholder="🔍 Tìm kiếm thông báo…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="noti-search-input"
      />
      {searchQuery && (
        <button 
          type="button" 
          className="noti-clear-btn" 
          onClick={() => onSearchChange('')}
          title="Xóa tìm kiếm"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
