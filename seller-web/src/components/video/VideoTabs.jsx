import React from 'react';

export default function VideoTabs({ activeTab, onSelectTab, metrics }) {
  const tabs = [
    { id: 'Tất cả video', label: 'Tất cả video', count: metrics?.total || 24 },
    { id: 'Video của tôi', label: 'Video của tôi', count: metrics?.own || 18 },
    { id: 'Affiliate', label: 'Affiliate', count: metrics?.affiliate || 6 },
    { id: 'Chờ duyệt', label: 'Chờ duyệt', count: metrics?.pending || 2 },
    { id: 'Đã đăng', label: 'Đã đăng', count: metrics?.published || 19 },
    { id: 'Tạm ẩn', label: 'Tạm ẩn', count: metrics?.paused || 2 },
    { id: 'Vi phạm', label: 'Vi phạm', count: metrics?.rejected || 1 }
  ];

  return (
    <div className="order-tabs-navbar finance-tabs-nav" role="tablist">
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`order-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(t.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span className="tab-label">{t.label}</span>
            <span className={`tab-count-badge ${isActive ? 'active' : ''}`}>{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}
