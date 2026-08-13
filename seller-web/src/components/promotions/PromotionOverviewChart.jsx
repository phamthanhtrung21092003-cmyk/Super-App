import React, { useState } from 'react';

export default function PromotionOverviewChart({ stats }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const activeCount = stats?.active || 6;
  const upcomingCount = stats?.upcoming || 3;
  const endedCount = stats?.ended || 9;
  const totalCount = stats?.total || 18;

  const activePct = ((activeCount / totalCount) * 100).toFixed(1);
  const upcomingPct = ((upcomingCount / totalCount) * 100).toFixed(1);
  const endedPct = ((endedCount / totalCount) * 100).toFixed(1);

  const items = [
    { name: 'Đang diễn ra', count: activeCount, percent: activePct, color: '#00B14F' },
    { name: 'Sắp diễn ra', count: upcomingCount, percent: upcomingPct, color: '#F97316' },
    { name: 'Đã kết thúc', count: endedCount, percent: endedPct, color: '#94A3B8' }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Tổng quan khuyến mãi</h3>
      </div>

      <div className="cash-flow-body">
        {/* SVG Doughnut Graphic */}
        <div className="doughnut-container">
          <svg viewBox="0 0 100 100" className="doughnut-svg">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
            
            {/* Đang diễn ra (33.3% ~ 80 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#00B14F" strokeWidth="12"
              strokeDasharray="80 238" 
              strokeDashoffset="60"
              className={`doughnut-segment ${hoveredIdx === 0 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(0)}
              onMouseLeave={() => setHoveredIdx(null)}
            />

            {/* Sắp diễn ra (16.7% ~ 40 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#F97316" strokeWidth="12"
              strokeDasharray="40 238" 
              strokeDashoffset="-20"
              className={`doughnut-segment ${hoveredIdx === 1 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(1)}
              onMouseLeave={() => setHoveredIdx(null)}
            />

            {/* Đã kết thúc (50% ~ 119 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#94A3B8" strokeWidth="12"
              strokeDasharray="119 238" 
              strokeDashoffset="-60"
              className={`doughnut-segment ${hoveredIdx === 2 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(2)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </svg>

          <div className="doughnut-center-text">
            <strong className="total-val">{totalCount}</strong>
            <span className="lbl">Tổng</span>
          </div>
        </div>

        {/* Legends List */}
        <div className="doughnut-legends-stack">
          {items.map((it, idx) => (
            <div 
              key={idx} 
              className={`legend-item-row ${hoveredIdx === idx ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="legend-left">
                <span className="color-dot" style={{ backgroundColor: it.color }}></span>
                <span className="item-name">{it.name}</span>
              </div>
              <div className="legend-right">
                <strong className="item-amount">{it.count}</strong>
                <span className="item-percent">({it.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
