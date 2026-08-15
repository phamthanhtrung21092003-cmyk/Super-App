import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';

export default function NotificationEmptyState({ isFiltering = false, onResetFilter }) {
  return (
    <div className="notification-empty-container">
      <div className="empty-bell-circle">
        <Bell size={40} className="empty-bell-icon" />
      </div>
      <h3 className="empty-noti-heading">
        {isFiltering ? 'Không có thông báo phù hợp' : 'Bạn đã xem hết thông báo'}
      </h3>
      <p className="empty-noti-sub">
        {isFiltering 
          ? 'Không tìm thấy thông báo nào trong danh mục hoặc từ khóa đã chọn.' 
          : 'Thông báo mới về đơn hàng, kho hàng và khuyến mãi sẽ xuất hiện tự động tại đây.'}
      </p>

      {isFiltering && onResetFilter && (
        <button 
          type="button" 
          className="btn-noti-reset" 
          onClick={onResetFilter}
        >
          <RefreshCw size={14} /> Xem tất cả thông báo
        </button>
      )}
    </div>
  );
}
