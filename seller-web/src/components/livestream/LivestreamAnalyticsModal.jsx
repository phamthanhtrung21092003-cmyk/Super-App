import React, { useState } from 'react';
import { BarChart2, X, Eye, Users, ShoppingBag, DollarSign, Heart, MessageSquare } from 'lucide-react';

export default function LivestreamAnalyticsModal({ livestream, onClose }) {
  const [period, setPeriod] = useState('7d');

  if (!livestream) return null;

  const views = livestream.viewers || livestream.views || 45680;
  const peakViewers = livestream.peakViewers || 4820;
  const orders = livestream.orders || 236;
  const revenue = livestream.revenue || 28450000;
  const likes = livestream.likes || 18920;
  const comments = livestream.comments || 3420;
  const conversionRate = views > 0 ? ((orders / views) * 100).toFixed(2) : '5.17';

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <BarChart2 size={20} className="header-icon-green" />
            <h3 className="modal-title">Thống kê hiệu quả Livestream: {livestream.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã Buổi LIVE: <strong>{livestream.id}</strong> • MC: <strong>{livestream.hostName || 'MC Linh'}</strong></span>
            
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

          {/* Key Metrics Grid */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="bk-metric-box">
                <span className="lbl">Tổng lượt xem (Views)</span>
                <strong className="val">{views.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Mốc xem cao nhất (Peak)</span>
                <strong className="val" style={{ color: '#EF4444' }}>{peakViewers.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Lượt tương tác Chat / Like</span>
                <strong className="val">{likes.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Đơn hàng chốt</span>
                <strong className="val">{orders} đơn</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Doanh thu phát sinh</span>
                <strong className="val green-text">{revenue.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Tỷ lệ chuyển đổi</span>
                <strong className="val green-text">{conversionRate}%</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📈 Biểu đồ biến động số lượng người xem (Realtime Viewers Peak) theo từng phút trong buổi Livestream</span>
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
