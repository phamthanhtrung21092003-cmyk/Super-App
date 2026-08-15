import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';

export default function NotificationList({
  notifications = [],
  isFiltering = false,
  onSelectNotification,
  onMarkAsRead,
  onDeleteNotification,
  onResetFilter
}) {
  const [displayCount, setDisplayCount] = useState(6);

  const visibleNotifications = notifications.slice(0, displayCount);
  const hasMore = notifications.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  if (!notifications || notifications.length === 0) {
    return (
      <NotificationEmptyState 
        isFiltering={isFiltering}
        onResetFilter={onResetFilter}
      />
    );
  }

  return (
    <div className="notification-list-wrapper">
      <div className="notification-cards-stream">
        {visibleNotifications.map(item => (
          <NotificationItem 
            key={item.id}
            notification={item}
            onClick={onSelectNotification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDeleteNotification}
          />
        ))}
      </div>

      {/* Load More Button (Requirement 15) */}
      {hasMore && (
        <div className="noti-load-more-container">
          <button 
            type="button" 
            className="btn-noti-load-more"
            onClick={handleLoadMore}
          >
            <span>Xem thêm thông báo</span>
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
