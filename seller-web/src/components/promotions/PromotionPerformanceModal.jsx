import React, { useState } from 'react';
import { BarChart2, X, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

export default function PromotionPerformanceModal({ promotion, onClose }) {
  const [period, setPeriod] = useState('7d');

  if (!promotion) return null;

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <BarChart2 size={20} className="header-icon-green" />
            <h3 className="modal-title">Báo cáo hiệu quả: {promotion.name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã KM: <strong>{promotion.code || promotion.id}</strong></span>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              {['7d', '30d', '90d'].map(p => (
                <button 
                  key={p} 
                  className={`status-tag ${period === p ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                  onClick={() => setPeriod(p)}
                >
                  {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : '90 ngày'}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics">
              <div className="bk-metric-box primary-border">
                <span className="lbl">Tổng doanh thu KM</span>
                <strong className="val green-text">{(promotion.revenue || 32450000).toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Số đơn hàng</span>
                <strong className="val">142 đơn</strong>
              </div>
              <div className="bk-metric-box warning-border">
                <span className="lbl">Chi phí đã dùng</span>
                <strong className="val orange-text">{(promotion.spent || 1450000).toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Tỷ lệ ROI</span>
                <strong className="val green-text">+2,138% ROI</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📈 Biểu đồ tăng trưởng doanh thu & đơn hàng phát sinh từ khuyến mãi</span>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
