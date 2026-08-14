import React from 'react';
import { Truck, CheckCircle2, Clock, RotateCcw } from 'lucide-react';

export default function ShippingReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng đơn đã giao ĐVVC</span>
          <div className="kpi-value-number">1.248 đơn</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tỷ lệ giao đúng hạn</span>
          <div className="kpi-value-number green-text">98.2%</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng phí vận chuyển</span>
          <div className="kpi-value-number">3.700.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tỷ lệ giao thất bại</span>
          <div className="kpi-value-number danger-item">1.8%</div>
        </div>
      </div>
    </div>
  );
}
