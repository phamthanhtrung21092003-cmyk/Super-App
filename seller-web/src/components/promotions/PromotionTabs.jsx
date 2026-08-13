import React from 'react';

export default function PromotionTabs({ activeTab, onSelectTab, metrics }) {
  const tabs = [
    { id: 'Tất cả', label: 'Tất cả', count: metrics?.total || 18 },
    { id: 'Đang diễn ra', label: 'Đang diễn ra', count: metrics?.active || 6 },
    { id: 'Sắp diễn ra', label: 'Sắp diễn ra', count: metrics?.upcoming || 3 },
    { id: 'Đã kết thúc', label: 'Đã kết thúc', count: metrics?.ended || 9 },
    { id: 'Tạm dừng', label: 'Tạm dừng', count: metrics?.paused || 0 }
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
