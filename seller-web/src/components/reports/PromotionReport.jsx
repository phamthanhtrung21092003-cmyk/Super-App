import React from 'react';
import { Tag, Percent, Award, DollarSign } from 'lucide-react';

export default function PromotionReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Chiến dịch đã tạo</span>
          <div className="kpi-value-number">18 chiến dịch</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Lượt Voucher đã dùng</span>
          <div className="kpi-value-number green-text">2.450 lượt</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Chi phí Khuyến mãi</span>
          <div className="kpi-value-number danger-item">12.450.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Doanh thu kéo về (ROI)</span>
          <div className="kpi-value-number green-text">112.380.000 đ (ROI 802%)</div>
        </div>
      </div>
    </div>
  );
}
