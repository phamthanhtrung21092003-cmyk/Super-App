import React from 'react';
import { CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function SettlementCard({ settlement }) {
  const info = settlement || {
    cycleName: 'Chu kỳ hiện tại (Tuần 33)',
    dateRange: '05/08/2026 - 11/08/2026',
    formattedRevenue: '5.200.000đ',
    formattedFee: '-520.000đ',
    formattedNetAmount: '4.680.000đ',
    payoutDate: '15/08/2026'
  };

  const steps = info.steps || [
    { label: 'Đang đối soát', date: '11/08', status: 'completed' },
    { label: 'Đã đối soát', date: '12/08', status: 'completed' },
    { label: 'Chờ chuyển khoản', date: '15/08', status: 'current' },
    { label: 'Đã chuyển khoản', date: '15/08', status: 'upcoming' }
  ];

  return (
    <div className="finance-settlement-card">
      <div className="settlement-card-header">
        <h3 className="card-heading-title">Chu kỳ đối soát</h3>
        <button className="view-history-link-btn" onClick={() => alert('Đang mở Lịch sử các đợt đối soát tài chính cũ...')}>
          Lịch sử đối soát
        </button>
      </div>

      <div className="settlement-cycle-banner">
        <div className="cycle-title-row">
          <strong className="cycle-name">{info.cycleName}</strong>
          <span className="cycle-dates"><Calendar size={12} /> {info.dateRange}</span>
        </div>

        <div className="cycle-breakdown-grid">
          <div className="breakdown-item">
            <span className="bk-label">Doanh thu</span>
            <strong className="bk-val">{info.formattedRevenue}</strong>
          </div>
          <div className="breakdown-item">
            <span className="bk-label">Phí và chiết khấu</span>
            <strong className="bk-val fee-negative">{info.formattedFee}</strong>
          </div>
          <div className="breakdown-item">
            <span className="bk-label">Số tiền sẽ chuyển</span>
            <strong className="bk-val net-positive">{info.formattedNetAmount}</strong>
          </div>
        </div>
      </div>

      {/* Timeline Horizontal Stepper */}
      <div className="settlement-stepper-row">
        {steps.map((step, idx) => {
          let nodeClass = 'upcoming';
          if (step.status === 'completed') nodeClass = 'completed';
          if (step.status === 'current') nodeClass = 'current';

          return (
            <div key={idx} className={`stepper-node-item ${nodeClass}`}>
              <div className="node-icon-circle">
                {step.status === 'completed' && <CheckCircle2 size={16} />}
                {step.status === 'current' && <Clock size={16} />}
                {step.status === 'upcoming' && <span className="empty-dot"></span>}
              </div>
              <span className="node-label-title">{step.label}</span>
              <span className="node-date-sub">{step.date}</span>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="settlement-footer-note">
        <span>Tiền sẽ được chuyển vào tài khoản của bạn vào ngày <strong>{info.payoutDate}</strong></span>
      </div>
    </div>
  );
}
