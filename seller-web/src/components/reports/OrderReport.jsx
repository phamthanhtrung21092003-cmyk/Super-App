import React from 'react';
import { ShoppingBag, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function OrderReport({ existingOrders = [] }) {
  const total = existingOrders.length || 1248;
  const completed = existingOrders.filter(o => o.status === 'Đã hoàn thành').length || 1180;
  const cancelled = existingOrders.filter(o => o.status === 'Đã hủy').length || 42;
  const returned = existingOrders.filter(o => o.status === 'Trả hàng/Hoàn tiền').length || 26;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng đơn hàng</span>
          <div className="kpi-value-number">{total} đơn</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Đơn hoàn thành</span>
          <div className="kpi-value-number green-text">{completed} đơn</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Đơn hủy</span>
          <div className="kpi-value-number danger-item">{cancelled} đơn</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Đơn trả hàng/hoàn tiền</span>
          <div className="kpi-value-number">{returned} đơn</div>
        </div>
      </div>

      <div className="finance-chart-card">
        <h3 className="card-heading-title">Tỷ lệ hoàn thành đơn hàng</h3>
        <div style={{ marginTop: '16px', background: 'var(--bg-page)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <strong style={{ fontSize: '28px', color: '#00B14F' }}>94.5%</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Tỷ lệ đơn hàng giao thành công chuẩn cam kết</span>
        </div>
      </div>
    </div>
  );
}
