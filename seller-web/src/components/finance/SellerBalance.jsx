import React from 'react';
import { Wallet, ArrowDownRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function SellerBalance({ balance, onOpenWithdraw, onOpenDetail }) {
  const available = balance?.available || 62850000;
  const pending = balance?.pending || 35620000;
  const receivable = balance?.receivable || 5000000;

  return (
    <div className="finance-chart-card seller-balance-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">
          Số dư tài khoản <span className="info-icon" title="Số dư thực tế có thể rút về tài khoản ngân hàng">ℹ️</span>
        </h3>
      </div>

      <div className="balance-body">
        {/* Main Available Balance */}
        <div className="available-balance-block">
          <span className="lbl-text">Số dư khả dụng</span>
          <div className="main-amount-text">{available.toLocaleString('vi-VN')} đ</div>
        </div>

        {/* Sub metrics */}
        <div className="balance-sub-metrics">
          <div className="sub-metric-row">
            <div className="left-lbl">
              <Clock size={14} className="icon-orange" />
              <span>Đang chờ thanh toán</span>
            </div>
            <strong className="right-val">{pending.toLocaleString('vi-VN')} đ</strong>
          </div>

          <div className="sub-metric-row">
            <div className="left-lbl">
              <ShieldCheck size={14} className="icon-blue" />
              <span>Nợ cần thu</span>
            </div>
            <strong className="right-val">{receivable.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="balance-actions-footer">
          <button className="nav-btn-primary withdraw-btn" onClick={onOpenWithdraw}>
            <ArrowDownRight size={16} /> Rút tiền
          </button>
          <button className="nav-btn-secondary detail-btn" onClick={onOpenDetail}>
            Xem chi tiết <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
