import React from 'react';

export default function OrderTabs({ activeTab, onSelectTab, metrics }) {
  const tabs = [
    { id: 'all', label: 'Tất cả', count: metrics?.total || 0 },
    { id: 'confirm', label: 'Chờ xác nhận', count: metrics?.confirm || 0 },
    { id: 'packing', label: 'Chờ đóng gói', count: metrics?.packing || 0 },
    { id: 'handover', label: 'Chờ bàn giao', count: metrics?.handover || 0 },
    { id: 'delivering', label: 'Đang giao', count: metrics?.delivering || 0 },
    { id: 'delivered', label: 'Đã giao', count: metrics?.delivered || 0 },
    { id: 'completed', label: 'Hoàn thành', count: metrics?.completed || 0 },
    { id: 'cancelled', label: 'Đã hủy', count: metrics?.cancelled || 0 },
    { id: 'returned', label: 'Trả hàng/Hoàn tiền', count: metrics?.returned || 0 }
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
