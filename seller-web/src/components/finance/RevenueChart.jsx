import React, { useState } from 'react';
import { Info, Calendar } from 'lucide-react';

export default function RevenueChart() {
  const [period, setPeriod] = useState('30');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Mock data points based on selected period
  const dataPoints30 = [
    { date: '14/07', revenue: 7500000, formattedRevenue: '7.500.000đ', orders: 18, x: 20, y: 140 },
    { date: '16/07', revenue: 6200000, formattedRevenue: '6.200.000đ', orders: 15, x: 60, y: 160 },
    { date: '18/07', revenue: 12800000, formattedRevenue: '12.800.000đ', orders: 32, x: 100, y: 70 },
    { date: '20/07', revenue: 6900000, formattedRevenue: '6.900.000đ', orders: 16, x: 140, y: 150 },
    { date: '22/07', revenue: 11400000, formattedRevenue: '11.400.000đ', orders: 27, x: 180, y: 85 },
    { date: '24/07', revenue: 5800000, formattedRevenue: '5.800.000đ', orders: 14, x: 220, y: 165 },
    { date: '26/07', revenue: 7900000, formattedRevenue: '7.900.000đ', orders: 19, x: 260, y: 135 },
    { date: '28/07', revenue: 12500000, formattedRevenue: '12.500.000đ', orders: 30, x: 300, y: 75 },
    { date: '30/07', revenue: 7200000, formattedRevenue: '7.200.000đ', orders: 17, x: 340, y: 145 },
    { date: '01/08', revenue: 11500000, formattedRevenue: '11.500.000đ', orders: 28, x: 380, y: 85 },
    { date: '03/08', revenue: 10800000, formattedRevenue: '10.800.000đ', orders: 26, x: 420, y: 95 },
    { date: '06/08', revenue: 17200000, formattedRevenue: '17.200.000đ', orders: 42, x: 460, y: 30 },
    { date: '08/08', revenue: 9460000, formattedRevenue: '9.460.000đ', orders: 23, x: 500, y: 110 },
    { date: '10/08', revenue: 11600000, formattedRevenue: '11.600.000đ', orders: 29, x: 540, y: 85 },
    { date: '11/08', revenue: 4200000, formattedRevenue: '4.200.000đ', orders: 11, x: 580, y: 180 }
  ];

  const activePoints = dataPoints30;

  // Generate SVG Path String
  const pathD = activePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${activePoints[activePoints.length - 1].x} 220 L ${activePoints[0].x} 220 Z`;

  return (
    <div className="finance-chart-card">
      <div className="chart-card-header">
        <div className="chart-title-block">
          <h3 className="chart-heading-title">
            Doanh thu theo ngày <Info size={14} className="info-icon" title="Tổng doanh thu thực tế được ghi nhận từng ngày" />
          </h3>
          <span className="chart-unit-subtitle">Đơn vị: VNĐ</span>
        </div>

        {/* Filter Pills */}
        <div className="chart-period-pills-row">
          {[
            { id: '7', label: '7 ngày' },
            { id: '30', label: '30 ngày' },
            { id: '90', label: '90 ngày' }
          ].map(p => (
            <button 
              key={p.id} 
              className={`period-pill-btn ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}

          <button className="period-pill-btn custom-date-btn" onClick={() => alert('Đang mở bộ lọc chọn ngày tùy chỉnh.')}>
            <Calendar size={13} /> Tùy chọn
          </button>
        </div>
      </div>

      {/* Line Chart Area */}
      <div className="chart-canvas-container">
        <svg viewBox="0 0 600 240" className="revenue-line-svg">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B14F" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00B14F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Y Lines */}
          <line x1="20" y1="40" x2="580" y2="40" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="20" y1="90" x2="580" y2="90" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="580" y2="140" stroke="var(--border)" strokeDasharray="3 3" />
          <line x1="20" y1="190" x2="580" y2="190" stroke="var(--border)" strokeDasharray="3 3" />

          {/* Y Axis Labels */}
          <text x="5" y="44" className="chart-axis-label">20M</text>
          <text x="5" y="94" className="chart-axis-label">15M</text>
          <text x="5" y="144" className="chart-axis-label">10M</text>
          <text x="5" y="194" className="chart-axis-label">5M</text>
          <text x="12" y="222" className="chart-axis-label">0</text>

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Main Line */}
          <path d={pathD} fill="none" stroke="#00B14F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Nodes */}
          {activePoints.map((pt, idx) => {
            const isHovered = hoveredPoint?.x === pt.x;

            return (
              <g key={idx}>
                {isHovered && (
                  <line 
                    x1={pt.x} 
                    y1="30" 
                    x2={pt.x} 
                    y2="220" 
                    stroke="#00B14F" 
                    strokeDasharray="4 4" 
                    strokeWidth="1.5" 
                  />
                )}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isHovered ? 6 : 4} 
                  fill="#ffffff" 
                  stroke="#00B14F" 
                  strokeWidth={isHovered ? 3 : 2.5} 
                  className="chart-dot-node"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div 
            className="chart-hover-tooltip"
            style={{ 
              left: `${(hoveredPoint.x / 600) * 100}%`,
              top: `${(hoveredPoint.y / 240) * 100 - 15}%` 
            }}
          >
            <div className="tooltip-date-header">{hoveredPoint.date}</div>
            <div className="tooltip-rev-row">
              Doanh thu: <strong>{hoveredPoint.formattedRevenue}</strong>
            </div>
            <div className="tooltip-order-row">
              Đơn hàng: {hoveredPoint.orders} đơn
            </div>
          </div>
        )}

        {/* X Axis Labels */}
        <div className="chart-x-labels-row">
          <span>14/07</span>
          <span>18/07</span>
          <span>22/07</span>
          <span>26/07</span>
          <span>30/07</span>
          <span>03/08</span>
          <span>07/08</span>
          <span>11/08</span>
        </div>
      </div>
    </div>
  );
}
