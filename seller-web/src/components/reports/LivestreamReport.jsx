import React from 'react';
import { Radio, Eye, Heart, ShoppingBag, DollarSign } from 'lucide-react';

export default function LivestreamReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng lượt xem Livestream</span>
          <div className="kpi-value-number">256.450</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Mốc xem cao nhất (Peak)</span>
          <div className="kpi-value-number danger-item">4.820 người</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Đơn chốt từ Livestream</span>
          <div className="kpi-value-number green-text">1.248 đơn</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Doanh thu từ Livestream</span>
          <div className="kpi-value-number green-text">156.780.000 đ</div>
        </div>
      </div>
    </div>
  );
}
