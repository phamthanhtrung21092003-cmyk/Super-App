import React from 'react';

export default function TransactionTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'Tất cả', label: 'Tất cả' },
    { id: 'Doanh thu', label: 'Doanh thu' },
    { id: 'Chi phí', label: 'Chi phí' },
    { id: 'Hoàn tiền', label: 'Hoàn tiền' },
    { id: 'Đối soát', label: 'Đối soát' },
    { id: 'Công nợ', label: 'Công nợ' }
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
