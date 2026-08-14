import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function PerformanceOverview() {
  const items = [
    { label: 'Tổng chi phí', value: '12.450.000 đ', change: '+14.3%', isCost: true },
    { label: 'Chi phí quảng cáo', value: '8.750.000 đ', change: '+16.6%', isCost: true },
    { label: 'Phí vận chuyển', value: '3.700.000 đ', change: '+8.4%', isCost: true },
    { label: 'Lợi nhuận gộp', value: '62.450.000 đ', change: '+28.5%', isPrimary: true },
    { label: 'Biên lợi nhuận', value: '39.9%', change: '+4.2%', isPrimary: true }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Tổng quan hiệu quả</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {items.map((it, idx) => (
          <div key={idx} className="sub-metric-row" style={{ padding: '8px 12px' }}>
            <span className="left-lbl" style={{ fontSize: '12px' }}>{it.label}</span>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '13px', color: it.isPrimary ? '#00B14F' : 'var(--text-primary)', display: 'block' }}>
                {it.value}
              </strong>
              <span className={`change-badge ${it.isCost ? 'danger-item' : 'positive'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                <TrendingUp size={9} /> {it.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
