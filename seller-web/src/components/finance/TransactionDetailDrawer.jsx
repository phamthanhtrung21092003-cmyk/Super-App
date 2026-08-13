import React from 'react';
import { X, DollarSign, Clock, FileText, CheckCircle2, ArrowUpRight, ArrowDownLeft, ShieldCheck, Tag } from 'lucide-react';

export default function TransactionDetailDrawer({ transaction, onClose }) {
  if (!transaction) return null;

  const grossAmount = transaction.amount || transaction.grossAmount || 1250000;
  const fee = transaction.fee || 25000;
  const netAmount = transaction.netAmount !== undefined ? transaction.netAmount : (grossAmount - fee);
  const isIncome = grossAmount > 0;

  return (
    <div className="inventory-drawer-backdrop" onClick={onClose}>
      <div className="inventory-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="sku-pill-tag">Mã GD: #{transaction.id || 'TX10098'}</span>
            <h2 className="drawer-product-name">{transaction.content || transaction.description || 'Giao dịch tài chính'}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body-scroll">
          {/* Main Amount Card */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics">
              <div className="bk-metric-box">
                <span className="lbl">Số tiền giao dịch</span>
                <strong className={`val ${isIncome ? 'green-text' : 'orange-text'}`}>
                  {isIncome ? `+${grossAmount.toLocaleString('vi-VN')} đ` : `${grossAmount.toLocaleString('vi-VN')} đ`}
                </strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Phí xử lý</span>
                <strong className="val">{fee > 0 ? `-${fee.toLocaleString('vi-VN')} đ` : '0 đ'}</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Thực nhận / Thực chi</span>
                <strong className="val green-text">{netAmount.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Trạng thái</span>
                <strong className="val green-text">🟢 {transaction.status || 'Hoàn tất'}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Detailed Metadata */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <FileText size={16} /> Thông tin chi tiết giao dịch
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Mã giao dịch (TxID)</span>
                <code className="v-val">#{transaction.id || 'TX10098'}</code>
              </div>
              {transaction.orderId && (
                <div className="kv-row">
                  <span className="k-lbl">Mã đơn hàng liên quan</span>
                  <strong className="v-val green-text">#{transaction.orderId}</strong>
                </div>
              )}
              <div className="kv-row">
                <span className="k-lbl">Thời gian ghi nhận</span>
                <span className="v-val">{transaction.time || transaction.date || '13/08/2026 10:30'}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Phân loại giao dịch</span>
                <span className="v-val">{transaction.type || 'Doanh thu'}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Kênh phát sinh (Nguồn)</span>
                <span className="v-val">{transaction.source || 'Đơn hàng S-Shopping'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Timeline */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Clock size={16} /> Tiến trình đối soát & ghi sổ
            </h3>
            <div className="history-logs-stack">
              <div className="tx-log-item-row">
                <div className="tx-log-left">
                  <span className="tx-type-badge receive">+</span>
                  <div className="tx-info-block">
                    <strong className="tx-reason-title">Ghi nhận giao dịch tài chính</strong>
                    <span className="tx-meta-sub">{transaction.time || '13/08/2026 10:30'} • Tự động từ Hệ thống</span>
                  </div>
                </div>
              </div>
              <div className="tx-log-item-row">
                <div className="tx-log-left">
                  <span className="tx-type-badge receive">✓</span>
                  <div className="tx-info-block">
                    <strong className="tx-reason-title">Đối soát & cộng vào Số dư khả dụng</strong>
                    <span className="tx-meta-sub">{transaction.time || '13/08/2026 10:30'} • Ví S-Shopping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-action-footer">
          <button className="nav-btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
