import React from 'react';

export default function ChannelRevenueChart() {
  const channels = [
    { name: 'Đơn hàng thường', revenue: 81820000, percent: 52.2, color: '#00B14F' },
    { name: 'Livestream', revenue: 44950000, percent: 28.7, color: '#F97316' },
    { name: 'Video ngắn', revenue: 17720000, percent: 11.3, color: '#9333EA' },
    { name: 'Khuyến mãi', revenue: 8290000, percent: 5.1, color: '#1877F2' },
    { name: 'Khác', revenue: 4000000, percent: 2.7, color: '#94A3B8' }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Doanh thu theo kênh</h3>
      </div>

      <div className="cash-flow-body" style={{ marginTop: '14px', alignItems: 'center' }}>
        {/* Doughnut Chart Canvas with Center Text */}
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#00B14F" strokeWidth="16" strokeDasharray="131 251" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="16" strokeDasharray="72 251" strokeDashoffset="-131" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#9333EA" strokeWidth="16" strokeDasharray="28 251" strokeDashoffset="-203" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1877F2" strokeWidth="16" strokeDasharray="13 251" strokeDashoffset="-231" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#94A3B8" strokeWidth="16" strokeDasharray="7 251" strokeDashoffset="-244" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-primary)' }}>156.780.000 đ</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Tổng</span>
          </div>
        </div>

        {/* Channel Legends List */}
        <div className="doughnut-legends-stack" style={{ flex: 1 }}>
          {channels.map((ch, idx) => (
            <div key={idx} className="legend-item-row" style={{ padding: '3px 0' }}>
              <div className="legend-left">
                <span className="color-dot" style={{ backgroundColor: ch.color }}></span>
                <span className="item-name" style={{ fontSize: '11px' }}>{ch.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>
                  {ch.revenue.toLocaleString('vi-VN')} đ
                </span>
                <strong className="item-percent" style={{ fontSize: '11px' }}>{ch.percent}%</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
