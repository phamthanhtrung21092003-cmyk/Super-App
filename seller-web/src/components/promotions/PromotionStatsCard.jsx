import React from 'react';
import { Gift, ShoppingBag, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';

export default function PromotionStatsCard({ onOpenReport }) {
  return (
    <div className="finance-chart-card promotion-stats-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Hiệu quả chương trình</h3>
      </div>

      <div className="reports-stack-list" style={{ marginTop: '12px' }}>
        {/* Metric 1: Revenue */}
        <div className="sub-metric-row">
          <div className="left-lbl">
            <Gift size={15} style={{ color: '#1877F2' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tổng doanh thu từ KM</span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '900' }}>112.380.000 đ</strong>
            </div>
          </div>
          <span className="change-badge positive" style={{ fontSize: '11px' }}>
            <TrendingUp size={12} /> +18.6%
          </span>
        </div>

        {/* Metric 2: Orders */}
        <div className="sub-metric-row">
          <div className="left-lbl">
            <ShoppingBag size={15} style={{ color: '#00B14F' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số đơn hàng từ KM</span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '900' }}>1.248 đơn</strong>
            </div>
          </div>
          <span className="change-badge positive" style={{ fontSize: '11px' }}>
            <TrendingUp size={12} /> +21.3%
          </span>
        </div>

        {/* Metric 3: Cost */}
        <div className="sub-metric-row">
          <div className="left-lbl">
            <DollarSign size={15} style={{ color: '#F97316' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chi phí khuyến mãi</span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '900' }}>12.450.000 đ</strong>
            </div>
          </div>
          <span className="change-badge positive" style={{ fontSize: '11px' }}>
            <TrendingUp size={12} /> +8.3%
          </span>
        </div>
      </div>

      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        <button 
          className="nav-btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '12px', color: '#00B14F' }}
          onClick={onOpenReport}
        >
          Xem báo cáo chi tiết <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
