import React, { useState } from 'react';

export default function RevenueReportChart() {
  const [granularity, setGranularity] = useState('day');
  const [hoverData, setHoverData] = useState({ date: '10/08/2026', current: 45680000, previous: 32450000 });

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-heading-title">Doanh thu</h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '3px', background: '#00B14F', borderRadius: '2px' }}></span>
              Doanh thu (đ)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '3px', background: '#94A3B8', borderRadius: '2px' }}></span>
              Doanh thu 7 ngày trước (đ)
            </span>
          </div>
        </div>

        <select 
          className="modal-select-control" 
          style={{ width: '110px', fontSize: '11px', padding: '4px 8px' }}
          value={granularity}
          onChange={e => setGranularity(e.target.value)}
        >
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
        </select>
      </div>

      <div style={{ marginTop: '16px', position: 'relative' }}>
        {/* Hover Tooltip Box */}
        <div style={{ position: 'absolute', top: '10px', left: '42%', background: '#0F172A', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', boxShadow: 'var(--shadow-md)', zIndex: 5, pointerEvents: 'none' }}>
          <strong style={{ display: 'block', color: '#94A3B8' }}>{hoverData.date}</strong>
          <div style={{ color: '#00B14F', fontWeight: '800' }}>Doanh thu: {hoverData.current.toLocaleString('vi-VN')} đ</div>
          <div style={{ color: '#CBD5E1' }}>7 ngày trước: {hoverData.previous.toLocaleString('vi-VN')} đ</div>
        </div>

        {/* SVG Dual-Line Chart Simulation */}
        <svg viewBox="0 0 500 160" style={{ width: '100%', height: '180px' }}>
          {/* Grid Lines */}
          <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border)" />

          {/* Previous Period Line (Grey Dashed) */}
          <path d="M10,130 Q80,110 150,90 T290,70 T420,60 T490,40" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />

          {/* Current Period Line (Green Solid) */}
          <path d="M10,110 Q80,75 150,85 T290,40 T420,65 T490,20" fill="none" stroke="#00B14F" strokeWidth="3" />

          {/* Highlight Dot */}
          <circle cx="210" cy="50" r="5" fill="#00B14F" stroke="#fff" strokeWidth="2" />

          {/* X Axis Labels */}
          <text x="10" y="156" fill="var(--text-muted)" fontSize="10">07/08</text>
          <text x="90" y="156" fill="var(--text-muted)" fontSize="10">08/08</text>
          <text x="170" y="156" fill="var(--text-muted)" fontSize="10">09/08</text>
          <text x="250" y="156" fill="#00B14F" fontWeight="bold" fontSize="10">10/08</text>
          <text x="330" y="156" fill="var(--text-muted)" fontSize="10">11/08</text>
          <text x="410" y="156" fill="var(--text-muted)" fontSize="10">12/08</text>
          <text x="470" y="156" fill="var(--text-muted)" fontSize="10">13/08</text>
        </svg>
      </div>
    </div>
  );
}
