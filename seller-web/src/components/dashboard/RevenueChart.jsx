import React, { useState, useEffect } from 'react';
import { Info, TrendingUp, Plus, BarChart3, ArrowUpRight } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function RevenueChart({ 
  existingOrders = [], 
  onOpenAddProductModal,
  onNavigateToReports 
}) {
  const [days, setDays] = useState(7);
  const [chartData, setChartData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    sellerService.getRevenueChartData(days, existingOrders).then(data => setChartData(data));
  }, [days, existingOrders]);

  if (!chartData) return null;

  const points = chartData.points || [];
  const hasData = points.length > 0 && chartData.totalRevenue > 0;

  const maxRevenue = hasData ? Math.max(...points.map(p => p.revenue), 1000000) : 1000000;
  
  // Chart dimensions & SVG math
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Calculate coordinates for points
  const pointsCoords = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * chartW;
    const y = height - paddingY - (p.revenue / maxRevenue) * chartH;
    return { ...p, x, y };
  });

  const linePath = pointsCoords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = pointsCoords.length > 0
    ? `${linePath} L ${pointsCoords[pointsCoords.length - 1].x} ${height - paddingY} L ${pointsCoords[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="dashboard-card chart-card-container">
      {/* Card Header */}
      <div className="card-header-flex">
        <div className="card-title-group">
          <h3>
            Doanh thu <Info size={14} className="info-icon" title="Tổng doanh thu từ các đơn hàng thành công" />
          </h3>
          {onNavigateToReports && (
            <button 
              type="button"
              className="link-see-all-btn inline-report-btn"
              onClick={onNavigateToReports}
            >
              Báo cáo chi tiết <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        <div className="chart-filter-pills">
          {[
            { label: '7 ngày', value: 7 },
            { label: '30 ngày', value: 30 },
            { label: '90 ngày', value: 90 }
          ].map(filter => (
            <button 
              key={filter.value}
              className={`filter-pill-btn ${days === filter.value ? 'active' : ''}`}
              onClick={() => setDays(filter.value)}
              aria-label={`Xem biểu đồ doanh thu ${filter.label}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Summary Row */}
      <div className="chart-revenue-summary">
        <span className="summary-amount-text">{chartData.formattedRevenue || '0đ'}</span>
        {chartData.growthPercent !== null && chartData.growthPercent !== undefined ? (
          <span className="summary-trend-pill trend-up">
            <TrendingUp size={14} /> ↑ {chartData.growthPercent}% so với {days} ngày trước
          </span>
        ) : (
          <span className="summary-trend-pill neutral-trend">
            Chưa có dữ liệu so sánh
          </span>
        )}
      </div>

      {/* Main Chart Area: Render SVG when data exists, Empty State when no data */}
      {hasData ? (
        <div className="svg-chart-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg-chart">
            <defs>
              <linearGradient id="chart-green-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B14F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00B14F" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = height - paddingY - ratio * chartH;
              return (
                <line 
                  key={idx} 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#E2E8F0" 
                  strokeDasharray="4 4" 
                />
              );
            })}

            <path d={areaPath} fill="url(#chart-green-gradient)" />
            <path d={linePath} fill="none" stroke="#00B14F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {pointsCoords.map((pt, idx) => (
              <g key={idx} className="chart-point-group" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={hoveredPoint?.date === pt.date ? 6 : 4} 
                  fill="#ffffff" 
                  stroke="#00B14F" 
                  strokeWidth={hoveredPoint?.date === pt.date ? 3 : 2} 
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                />
              </g>
            ))}
          </svg>

          {hoveredPoint && (
            <div 
              className="chart-hover-tooltip"
              style={{ 
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 15}%` 
              }}
            >
              <div className="tooltip-date-header">📅 {hoveredPoint.date}</div>
              <div className="tooltip-revenue-row">💰 {hoveredPoint.revenue.toLocaleString('vi-VN')}đ</div>
              <div className="tooltip-orders-row">📦 {hoveredPoint.orders} đơn hàng</div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Graphic */
        <div className="chart-empty-state-box">
          <div className="empty-chart-icon-circle">
            <BarChart3 size={28} className="empty-icon" />
          </div>
          <h4 className="empty-state-title">Chưa có dữ liệu doanh thu</h4>
          <p className="empty-state-desc">
            Doanh thu sẽ được biểu diễn theo mốc thời gian tự động ngay khi Shop phát sinh đơn hàng đầu tiên.
          </p>
          {onOpenAddProductModal && (
            <button className="nav-btn-primary empty-state-btn" onClick={onOpenAddProductModal}>
              <Plus size={16} /> Đăng sản phẩm đầu tiên
            </button>
          )}
        </div>
      )}

      {/* X-Axis Date Labels (Only if data exists) */}
      {hasData && (
        <div className="chart-x-labels">
          {points.map((pt, idx) => (
            <span key={idx} className="x-label-text">{pt.date}</span>
          ))}
        </div>
      )}
    </div>
  );
}
