import React from 'react';

export default function RevenueSources({ sourcesData }) {
  const sources = sourcesData?.sources || [
    { id: 'product', name: 'Sản phẩm', percent: 78.2, amount: '98.400.000đ', color: '#00B14F' },
    { id: 'livestream', name: 'Livestream', percent: 12.6, amount: '15.900.000đ', color: '#1877F2' },
    { id: 'video', name: 'Video', percent: 6.3, amount: '7.900.000đ', color: '#F97316' },
    { id: 'other', name: 'Khác', percent: 2.9, amount: '3.600.000đ', color: '#9333EA' }
  ];

  const totalText = sourcesData?.formattedTotal || '125.800.000đ';

  return (
    <div className="finance-sources-card">
      <h3 className="card-heading-title">Doanh thu theo nguồn</h3>

      <div className="donut-chart-flex-wrapper">
        {/* SVG Donut Chart with Center Text */}
        <div className="donut-svg-box">
          <svg viewBox="0 0 160 160" className="donut-svg-el">
            {/* Segment 1: Sản phẩm (78.2% -> strokeDasharray) */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#00B14F"
              strokeWidth="22"
              strokeDasharray="294.7 377"
              strokeDashoffset="0"
              transform="rotate(-90 80 80)"
            />
            {/* Segment 2: Livestream (12.6%) */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#1877F2"
              strokeWidth="22"
              strokeDasharray="47.5 377"
              strokeDashoffset="-294.7"
              transform="rotate(-90 80 80)"
            />
            {/* Segment 3: Video (6.3%) */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#F97316"
              strokeWidth="22"
              strokeDasharray="23.7 377"
              strokeDashoffset="-342.2"
              transform="rotate(-90 80 80)"
            />
            {/* Segment 4: Khác (2.9%) */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#9333EA"
              strokeWidth="22"
              strokeDasharray="11 377"
              strokeDashoffset="-366"
              transform="rotate(-90 80 80)"
            />
          </svg>

          <div className="donut-center-info-block">
            <span className="donut-center-amount">{totalText}</span>
            <span className="donut-center-label">Tổng doanh thu</span>
          </div>
        </div>

        {/* Legend Stack */}
        <div className="sources-legend-stack">
          {sources.map(src => (
            <div key={src.id} className="legend-item-row">
              <div className="legend-name-group">
                <span className="legend-dot-indicator" style={{ backgroundColor: src.color }}></span>
                <span className="legend-source-name">{src.name}</span>
              </div>

              <div className="legend-values-group">
                <span className="legend-percent-tag">{src.percent}%</span>
                <span className="legend-amount-val">{src.formattedAmount || src.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
