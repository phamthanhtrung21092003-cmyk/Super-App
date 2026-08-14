import React, { useState } from 'react';
import { Eye, TrendingUp, Link2, Share2, Play, ChevronRight } from 'lucide-react';

export default function VideoOverviewChart({ onOpenDetail }) {
  const [period, setPeriod] = useState('7d');

  const trafficSources = [
    { name: 'Trang chủ V-life', percent: 45.6, color: '#00B14F' },
    { name: 'Tìm kiếm', percent: 28.3, color: '#F97316' },
    { name: 'Đề xuất Video Feed', percent: 15.8, color: '#1877F2' },
    { name: 'Trang Shop / Theo dõi', percent: 6.2, color: '#9333EA' },
    { name: 'Khác', percent: 4.1, color: '#94A3B8' }
  ];

  const trendingVideos = [
    { id: 'V000123', title: 'Review áo thun nam Basic', views: '25.840', duration: '02:45', thumb: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300' },
    { id: 'V000124', title: 'Top 5 bàn phím đáng mua', views: '42.350', duration: '05:12', thumb: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300' },
    { id: 'V000125', title: 'Unbox Giày Sneaker Sport', views: '32.140', duration: '03:20', thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Hiệu quả kênh (Views Trend Line Chart) */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Hiệu quả kênh Video</h3>
          <select className="modal-select-control" style={{ width: '100px', fontSize: '11px', padding: '4px 8px' }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
          </select>
        </div>

        <div style={{ marginTop: '12px', background: 'var(--bg-page)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mốc cao nhất: 11/08/2026</span>
            <strong className="green-text" style={{ fontSize: '12px' }}>45.860 lượt xem</strong>
          </div>
          {/* Simple Sparkline SVG Graph */}
          <svg viewBox="0 0 300 80" style={{ width: '100%', height: '70px' }}>
            <path d="M0,60 Q30,45 60,35 T120,50 T180,15 T240,30 T300,40" fill="none" stroke="#00B14F" strokeWidth="3" />
            <circle cx="180" cy="15" r="5" fill="#00B14F" />
          </svg>
        </div>
      </div>

      {/* 2. Nguồn traffic (Doughnut Chart) */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Nguồn traffic lượt xem</h3>
        </div>

        <div className="cash-flow-body" style={{ marginTop: '10px' }}>
          <div className="doughnut-legends-stack">
            {trafficSources.map((ts, idx) => (
              <div key={idx} className="legend-item-row">
                <div className="legend-left">
                  <span className="color-dot" style={{ backgroundColor: ts.color }}></span>
                  <span className="item-name">{ts.name}</span>
                </div>
                <strong className="item-percent">{ts.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Gắn link sản phẩm & Affiliate Box */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Gắn link sản phẩm & Affiliate</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="sub-metric-row clickable-card" style={{ padding: '12px' }}>
            <div className="left-lbl">
              <Link2 size={16} style={{ color: '#00B14F' }} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Sản phẩm của shop</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gắn trực tiếp sản phẩm từ cửa hàng</span>
              </div>
            </div>
            <strong className="green-text" style={{ fontSize: '14px' }}>186 &gt;</strong>
          </div>

          <div className="sub-metric-row clickable-card" style={{ padding: '12px' }}>
            <div className="left-lbl">
              <Share2 size={16} style={{ color: '#F97316' }} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Affiliate ngoài sàn</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gắn link sản phẩm từ shop khác</span>
              </div>
            </div>
            <strong style={{ fontSize: '14px', color: '#F97316' }}>32 &gt;</strong>
          </div>
        </div>
      </div>

      {/* 4. Video nổi bật Trending Videos */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Video nổi bật</h3>
          <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Xem tất cả &gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {trendingVideos.map(v => (
            <div key={v.id} className="report-item-row" style={{ padding: '8px 10px' }} onClick={() => onOpenDetail && onOpenDetail(v)}>
              <div style={{ position: 'relative', width: '50px', height: '65px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={v.thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '4px' }}>
                  {v.duration}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }} className="truncate-text">{v.title}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Eye size={12} /> {v.views} lượt xem
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
