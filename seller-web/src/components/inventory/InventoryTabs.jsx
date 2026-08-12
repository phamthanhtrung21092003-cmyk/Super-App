import React from 'react';

export default function InventoryTabs({ 
  activeTab, 
  onSelectTab, 
  counts = { all: 0, positive: 0, low: 0, out: 0 } 
}) {
  const tabs = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'positive', label: 'Tồn kho dương', count: counts.positive },
    { id: 'low', label: 'Sắp hết hàng', count: counts.low },
    { id: 'out', label: 'Hết hàng', count: counts.out }
  ];

  return (
    <div className="inventory-tabs-row">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`inventory-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label} <span className="tab-count-badge">({tab.count})</span>
        </button>
      ))}
    </div>
  );
}
