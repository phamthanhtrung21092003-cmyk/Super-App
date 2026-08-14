import React, { useState } from 'react';
import { BarChart2, X, Eye, MousePointer, ShoppingBag, DollarSign } from 'lucide-react';

export default function VideoAnalyticsModal({ video, onClose }) {
  const [period, setPeriod] = useState('7d');

  if (!video) return null;

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <BarChart2 size={20} className="header-icon-green" />
            <h3 className="modal-title">Phân tích hiệu quả Video: {video.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã Video: <strong>{video.id}</strong></span>
            
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
              <div className="bk-metric-box">
                <span className="lbl">Lượt xem (Views)</span>
                <strong className="val">{(video.views || 25840).toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Click sản phẩm</span>
                <strong className="val">{(video.clicks || 1890).toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Đơn hàng chốt</span>
                <strong className="val">{video.orders || 86} đơn</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Doanh thu phát sinh</span>
                <strong className="val green-text">{(video.revenue || 12450000).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📈 Biểu đồ tăng trưởng lượt xem & chuyển đổi đơn hàng qua từng ngày</span>
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
