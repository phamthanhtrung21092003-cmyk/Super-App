import React from 'react';

export default function NotificationTabs({
  activeTab = 'all',
  onSelectTab,
  unreadCount = 0,
  counts = {}
}) {
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc', badge: unreadCount > 0 ? unreadCount : null, isAlert: true },
    { id: 'order', label: 'Đơn hàng', badge: counts.order || null },
    { id: 'product', label: 'Sản phẩm', badge: counts.product || null },
    { id: 'finance', label: 'Tài chính', badge: counts.finance || null },
    { id: 'promotion', label: 'Khuyến mãi', badge: counts.promotion || null },
    { id: 'system', label: 'Hệ thống', badge: counts.system || null }
  ];

  return (
    <div className="notification-tabs-navbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`noti-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.badge !== null && tab.badge !== undefined && (
            <span className={`noti-tab-badge ${tab.isAlert ? 'badge-red' : 'badge-neutral'}`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
