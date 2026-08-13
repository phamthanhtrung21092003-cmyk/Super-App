import React, { useState } from 'react';
import { X, Wallet, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

export default function WithdrawModal({ 
  availableBalance = 18500000, 
  onClose, 
  onSuccessWithdraw 
}) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numAmount = Number(withdrawAmount.replace(/[^0-9]/g, '')) || 0;

  const handlePercentClick = (percent) => {
    const calc = Math.floor((availableBalance * percent) / 100);
    setWithdrawAmount(calc.toString());
    setErrorMsg('');
  };

  const handleAmountChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    setWithdrawAmount(clean);
    if (Number(clean) > availableBalance) {
      setErrorMsg('Số tiền rút vượt quá số dư khả dụng!');
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ muốn rút.');
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg('Số tiền rút vượt quá số dư khả dụng!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccessWithdraw) {
        onSuccessWithdraw(numAmount);
      } else {
        alert(`Đã gửi yêu cầu rút ${numAmount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng thành công!`);
        onClose();
      }
    }, 600);
  };

  return (
    <div className="withdraw-modal-backdrop" onClick={onClose}>
      <div className="withdraw-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Wallet size={20} className="header-icon-green" />
            <h3 className="modal-title">Rút tiền về tài khoản ngân hàng</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Số dư khả dụng banner */}
          <div className="balance-info-banner">
            <span className="balance-label">Số dư khả dụng</span>
            <strong className="balance-value">{availableBalance.toLocaleString('vi-VN')}đ</strong>
          </div>

          {/* Amount input */}
          <div className="form-group-field">
            <label className="field-label">Số tiền muốn rút (VNĐ)</label>
            <div className="amount-input-wrapper">
              <input 
                type="text" 
                placeholder="Nhập số tiền muốn rút..." 
                value={withdrawAmount ? Number(withdrawAmount).toLocaleString('vi-VN') : ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="amount-input-control"
              />
              <span className="currency-suffix">VNĐ</span>
            </div>
          </div>

          {/* Quick percent pills */}
          <div className="percent-pills-row">
            <button type="button" className="percent-pill-btn" onClick={() => handlePercentClick(25)}>25%</button>
            <button type="button" className="percent-pill-btn" onClick={() => handlePercentClick(50)}>50%</button>
            <button type="button" className="percent-pill-btn" onClick={() => handlePercentClick(75)}>75%</button>
            <button type="button" className="percent-pill-btn highlight" onClick={() => handlePercentClick(100)}>Tối đa (100%)</button>
          </div>

          {/* Validation error message */}
          {errorMsg && (
            <div className="modal-error-alert">
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}

          {/* Bank Destination Info */}
          <div className="bank-destination-card">
            <div className="bank-logo-icon">
              <Building2 size={22} />
            </div>
            <div className="bank-details-text">
              <span className="bank-name">Ngân hàng MB BANK (Chi nhánh TP.HCM)</span>
              <strong className="bank-account">**** **** **** 1234</strong>
              <span className="bank-owner">Chủ tài khoản: NGUYEN VAN A</span>
            </div>
            <span className="verified-badge"><CheckCircle2 size={13} /> Đã xác thực</span>
          </div>

          {/* Actions */}
          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="nav-btn-primary submit-withdraw-btn"
              disabled={isSubmitting || !!errorMsg || numAmount <= 0}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
