import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function FinancialOverview({ existingOrders = [], onNavigate }) {
  const [finData, setFinData] = useState(null);

  useEffect(() => {
    sellerService.getFinancialOverview(existingOrders).then(data => setFinData(data));
  }, [existingOrders]);

  if (!finData) return null;

  return (
    <div className="dashboard-card financial-overview-card">
      <div className="card-header-flex">
        <h3 className="card-title-heading">
          <Wallet size={16} className="text-primary-icon" /> Tài chính & Ví Seller
        </h3>
        <button className="link-see-all-btn" onClick={() => onNavigate && onNavigate('finance')}>
          Xem chi tiết <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="finance-balances-row">
        <div className="balance-item main-balance">
          <span className="balance-label">Số dư khả dụng</span>
          <span className="balance-value green-val">{finData.formattedAvailable || '0đ'}</span>
        </div>

        <div className="balance-item">
          <span className="balance-label">Đang đối soát</span>
          <span className="balance-value orange-val">{finData.formattedPending || '0đ'}</span>
        </div>

        <div className="balance-item">
          <span className="balance-label">Doanh thu tháng</span>
          <span className="balance-value dark-val">{finData.formattedMonthly || '0đ'}</span>
        </div>
      </div>

      {finData.hasBankAccount ? (
        <div className="napas-verified-footer">
          <ShieldCheck size={14} className="shield-icon" />
          <span>Tài khoản ngân hàng chính chủ đã xác minh Napas 24/7</span>
        </div>
      ) : (
        <div className="napas-unverified-footer" onClick={() => onNavigate && onNavigate('finance')}>
          <AlertCircle size={14} className="warning-icon" />
          <span>Chưa thiết lập tài khoản nhận tiền – <strong>[Thiết lập ngay]</strong></span>
        </div>
      )}
    </div>
  );
}
