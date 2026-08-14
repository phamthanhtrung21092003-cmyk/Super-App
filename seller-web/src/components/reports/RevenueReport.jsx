import React from 'react';
import RevenueReportChart from './RevenueReportChart';
import ChannelRevenueChart from './ChannelRevenueChart';

export default function RevenueReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng doanh thu</span>
          <div className="kpi-value-number green-text">156.780.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Doanh thu thuần</span>
          <div className="kpi-value-number">148.500.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Lợi nhuận gộp</span>
          <div className="kpi-value-number green-text">62.450.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng chi phí</span>
          <div className="kpi-value-number danger-item">12.450.000 đ</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <RevenueReportChart />
        <ChannelRevenueChart />
      </div>
    </div>
  );
}
