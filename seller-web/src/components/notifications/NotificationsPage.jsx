import React, { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import sellerService, { MOCK_NOTIFICATIONS_DATA } from '../../data/sellerService';
import NotificationTabs from './NotificationTabs';
import NotificationSearch from './NotificationSearch';
import NotificationList from './NotificationList';
import NotificationDetailDrawer from './NotificationDetailDrawer';

export default function NotificationsPage({
  notifications = MOCK_NOTIFICATIONS_DATA,
  onUpdateNotifications,
  initialTab = 'all',
  onDeepLinkNavigate
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Sync initialTab if passed from props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Counts per tab
  const unreadCount = notifications.filter(n => !n.read).length;
  const counts = {
    order: notifications.filter(n => n.type === 'ORDER').length,
    product: notifications.filter(n => n.type === 'INVENTORY' || n.type === 'PRODUCT').length,
    finance: notifications.filter(n => n.type === 'FINANCE').length,
    promotion: notifications.filter(n => n.type === 'PROMOTION').length,
    system: notifications.filter(n => n.type === 'SYSTEM' || n.type === 'VIDEO' || n.type === 'LIVESTREAM').length
  };

  // Filter & Search notifications
  const filteredNotifications = notifications.filter(item => {
    // 1. Tab filter
    if (activeTab === 'unread' && item.read) return false;
    if (activeTab === 'order' && item.type !== 'ORDER') return false;
    if (activeTab === 'product' && item.type !== 'INVENTORY' && item.type !== 'PRODUCT') return false;
    if (activeTab === 'finance' && item.type !== 'FINANCE') return false;
    if (activeTab === 'promotion' && item.type !== 'PROMOTION') return false;
    if (activeTab === 'system' && item.type !== 'SYSTEM' && item.type !== 'VIDEO' && item.type !== 'LIVESTREAM') return false;

    // 2. Search query (title, content, type, categoryName, referenceId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title && item.title.toLowerCase().includes(q);
      const matchContent = item.content && item.content.toLowerCase().includes(q);
      const matchType = item.type && item.type.toLowerCase().includes(q);
      const matchCat = item.categoryName && item.categoryName.toLowerCase().includes(q);
      const matchRef = item.referenceId && item.referenceId.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchType && !matchCat && !matchRef) return false;
    }

    return true;
  });

  // Handlers
  const handleSelectNotification = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      const updated = await sellerService.markNotificationAsRead(notif.id, notifications);
      if (onUpdateNotifications) onUpdateNotifications(updated);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    const updated = await sellerService.markNotificationAsRead(notifId, notifications);
    if (onUpdateNotifications) onUpdateNotifications(updated);
  };

  const handleMarkAllAsRead = async () => {
    const updated = await sellerService.markAllNotificationsAsRead(notifications);
    if (onUpdateNotifications) onUpdateNotifications(updated);
    alert('✅ Đã đánh dấu tất cả thông báo là đã đọc.');
  };

  const handleDeleteNotification = async (notifId) => {
    const updated = await sellerService.deleteNotification(notifId, notifications);
    if (onUpdateNotifications) onUpdateNotifications(updated);
  };

  const handleResetFilter = () => {
    setActiveTab('all');
    setSearchQuery('');
  };

  return (
    <div className="notifications-page-container">
      {/* 1. Page Header (Requirement 4) */}
      <div className="notifications-page-header">
        <div className="noti-header-title-group">
          <h1 className="noti-page-main-heading">Thông báo</h1>
          <p className="noti-page-sub-heading">
            Cập nhật mới nhất về đơn hàng, Shop và hoạt động kinh doanh.
          </p>
        </div>

        <div className="noti-header-actions-group">
          <button 
            type="button" 
            className="btn-mark-all-read-action"
            onClick={handleMarkAllAsRead}
            title="Đánh dấu tất cả thông báo đã đọc"
          >
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* 2. Search Box (Requirement 6) */}
      <NotificationSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Filter Tabs (Requirement 5) */}
      <NotificationTabs 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadCount}
        counts={counts}
      />

      {/* 4. Notification List Stream (Requirement 7 & 15) */}
      <NotificationList 
        notifications={filteredNotifications}
        isFiltering={activeTab !== 'all' || searchQuery !== ''}
        onSelectNotification={handleSelectNotification}
        onMarkAsRead={handleMarkAsRead}
        onDeleteNotification={handleDeleteNotification}
        onResetFilter={handleResetFilter}
      />

      {/* 5. Notification Detail Drawer (Requirement 12 & 13) */}
      {selectedNotification && (
        <NotificationDetailDrawer 
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDeepLinkNavigate={onDeepLinkNavigate}
        />
      )}
    </div>
  );
}
