import React from 'react';
import { Users, UserPlus, RefreshCw } from 'lucide-react';

export default function CustomerReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng khách hàng</span>
          <div className="kpi-value-number">980 khách</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Khách hàng mới</span>
          <div className="kpi-value-number green-text">640 khách (65.3%)</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Khách hàng quay lại</span>
          <div className="kpi-value-number green-text">340 khách (34.7%)</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Giá trị chi tiêu TB / Khách</span>
          <div className="kpi-value-number">159.900 đ</div>
        </div>
      </div>

      <div className="finance-chart-card">
        <h3 className="card-heading-title">Phân tích tần suất quay lại mua hàng</h3>
        <div style={{ marginTop: '16px', background: 'var(--bg-page)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <strong style={{ fontSize: '24px', color: '#1877F2' }}>34.7% Khách hàng mua từ 2 lần trở lên</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Tỷ lệ trung thành cao nhờ chiến dịch Chăm sóc khách hàng & Voucher tri ân</span>
        </div>
      </div>
    </div>
  );
}
