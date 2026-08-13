import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function CashFlowChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const items = [
    { name: 'Tiền hàng', amount: 230450000, percent: 92.8, color: '#00B14F' },
    { name: 'Phí sàn', amount: 12560000, percent: 5.1, color: '#F97316' },
    { name: 'Phí vận chuyển', amount: 5310000, percent: 2.1, color: '#1877F2' }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Dòng tiền</h3>
      </div>

      <div className="cash-flow-body">
        {/* SVG Doughnut Graphic */}
        <div className="doughnut-container">
          <svg viewBox="0 0 100 100" className="doughnut-svg">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
            
            {/* Tiền hàng (92.8% ~ 222 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#00B14F" strokeWidth="12"
              strokeDasharray="222 238" 
              strokeDashoffset="60"
              className={`doughnut-segment ${hoveredIdx === 0 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(0)}
              onMouseLeave={() => setHoveredIdx(null)}
            />

            {/* Phí sàn (5.1% ~ 12 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#F97316" strokeWidth="12"
              strokeDasharray="12 238" 
              strokeDashoffset="-162"
              className={`doughnut-segment ${hoveredIdx === 1 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(1)}
              onMouseLeave={() => setHoveredIdx(null)}
            />

            {/* Phí vận chuyển (2.1% ~ 5 deg) */}
            <circle 
              cx="50" cy="50" r="38" fill="none" 
              stroke="#1877F2" strokeWidth="12"
              strokeDasharray="5 238" 
              strokeDashoffset="-174"
              className={`doughnut-segment ${hoveredIdx === 2 ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(2)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </svg>

          <div className="doughnut-center-text">
            <strong className="total-val">248.32M đ</strong>
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
                <strong className="item-amount">{it.amount.toLocaleString('vi-VN')} đ</strong>
                <span className="item-percent">({it.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
