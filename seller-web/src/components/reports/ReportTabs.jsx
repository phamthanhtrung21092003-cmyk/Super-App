import React from 'react';

export default function ReportTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'revenue', label: 'Doanh thu' },
    { id: 'orders', label: 'Đơn hàng' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'customers', label: 'Khách hàng' },
    { id: 'livestream', label: 'Livestream' },
    { id: 'promotions', label: 'Khuyến mãi' },
    { id: 'shipping', label: 'Vận chuyển' },
    { id: 'finance', label: 'Tài chính' }
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
          </button>
        );
      })}
    </div>
  );
}
