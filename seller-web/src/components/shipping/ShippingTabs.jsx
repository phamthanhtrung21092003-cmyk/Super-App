import React from 'react';

export default function ShippingTabs({ activeTab, onSelectTab, metrics }) {
  const tabs = [
    { id: 'Tất cả', label: 'Tất cả', count: metrics?.total || 148 },
    { id: 'Chờ lấy hàng', label: 'Chờ lấy hàng', count: metrics?.pendingPickup || 24 },
    { id: 'Đã lấy hàng', label: 'Đã lấy hàng', count: metrics?.pickedUp || 12 },
    { id: 'Đang vận chuyển', label: 'Đang vận chuyển', count: metrics?.delivering || 31 },
    { id: 'Đang giao', label: 'Đang giao', count: metrics?.onDelivery || 15 },
    { id: 'Giao thành công', label: 'Giao thành công', count: metrics?.success || 86 },
    { id: 'Giao thất bại', label: 'Giao thất bại', count: metrics?.failed || 4 },
    { id: 'Đã hoàn', label: 'Đã hoàn', count: metrics?.returned || 3 }
  ];

  return (
    <div className="order-tabs-navbar" role="tablist">
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
            <span className="tab-count-badge">({t.count})</span>
          </button>
        );
      })}
    </div>
  );
}
