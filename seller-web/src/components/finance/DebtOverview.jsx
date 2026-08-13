import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export default function DebtOverview({ onOpenDetail }) {
  return (
    <div className="finance-chart-card debt-overview-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Công nợ gian hàng</h3>
        <button className="nav-btn-secondary" onClick={onOpenDetail}>
          Xem chi tiết <ChevronRight size={14} />
        </button>
      </div>

      <div className="breakdown-grid-metrics" style={{ marginTop: '12px' }}>
        <div className="bk-metric-box primary-border">
          <span className="lbl">Phải thu (Công nợ chờ từ S-Shopping)</span>
          <strong className="val green-text">5.000.000 đ</strong>
        </div>

        <div className="bk-metric-box">
          <span className="lbl">Phải trả (Phí chưa thanh toán)</span>
          <strong className="val">0 đ</strong>
        </div>

        <div className="bk-metric-box">
          <span className="lbl">Đã thanh toán (Tháng 08)</span>
          <strong className="val">18.500.000 đ</strong>
        </div>

        <div className="bk-metric-box warning-border">
          <span className="lbl">Đang chờ thanh toán</span>
          <strong className="val orange-text">35.620.000 đ</strong>
        </div>
      </div>
    </div>
  );
}
