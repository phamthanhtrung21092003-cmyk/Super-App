import React from 'react';
import { Wallet, DollarSign, ArrowUpRight, Scale } from 'lucide-react';

export default function FinancialReport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng doanh thu chốt</span>
          <div className="kpi-value-number green-text">156.780.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Phí nền tảng S-SHOPPING (2%)</span>
          <div className="kpi-value-number danger-item">3.135.600 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Số dư ví khả dụng</span>
          <div className="kpi-value-number green-text">142.450.000 đ</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tiền đang đối soát</span>
          <div className="kpi-value-number">11.194.400 đ</div>
        </div>
      </div>
    </div>
  );
}
