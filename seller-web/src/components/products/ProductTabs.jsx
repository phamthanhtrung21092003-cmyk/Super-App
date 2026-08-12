import React from 'react';

export default function ProductTabs({ activeTab, onSelectTab, metrics }) {
  const tabs = [
    { id: 'all', label: 'Tất cả', count: metrics?.total || 0 },
    { id: 'active', label: 'Đang bán', count: metrics?.active || 0 },
    { id: 'hidden', label: 'Tạm ẩn', count: metrics?.hidden || 0 },
    { id: 'outofstock', label: 'Hết hàng', count: metrics?.outofstock || 0 },
    { id: 'draft', label: 'Bản nháp', count: metrics?.draft || 0 }
  ];

  return (
    <div className="product-tabs-navbar" role="tablist">
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`product-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(t.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span className="tab-label">{t.label}</span>
            <span className="tab-count-badge">({t.count})</span>
          </button>
        );
      })}
    </div>
  );
}
