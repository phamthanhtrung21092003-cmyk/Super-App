import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Star, Plus, Lock, ShieldCheck, X } from 'lucide-react';

export default function BankAccountManager({ accounts = [], onAddAccount, onSetDefault }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bankName, setBankName] = useState('Vietcombank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const defaultAccounts = [
    {
      id: 'bank_1',
      bankName: 'Ngân hàng TMCP Ngoại Thương (Vietcombank)',
      accountNumberMasked: '9704 **** **** 6868',
      accountHolder: 'NGUYEN VAN A',
      isDefault: true,
      verificationStatus: '🟢 Đã xác minh'
    },
    {
      id: 'bank_2',
      bankName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
      accountNumberMasked: '9704 **** **** 9999',
      accountHolder: 'NGUYEN VAN A',
      isDefault: false,
      verificationStatus: '🟢 Đã xác minh'
    }
  ];

  const list = accounts && accounts.length > 0 ? accounts : defaultAccounts;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber || !accountHolder) {
      alert('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản.');
      return;
    }
    const masked = `${accountNumber.slice(0, 4)} **** **** ${accountNumber.slice(-4)}`;
    onAddAccount && onAddAccount({ bankName, accountNumberMasked: masked, accountHolder: accountHolder.toUpperCase() });
    setIsAddModalOpen(false);
    alert('✅ Đã thêm tài khoản ngân hàng nhận tiền thành công! Trạng thái: Đã xác minh.');
  };

  return (
    <div className="bank-account-card">
      <div className="card-header-row">
        <div className="title-block">
          <h3 className="card-heading-title">Phương thức nhận tiền (Tài khoản Ngân hàng)</h3>
          <span className="card-subtitle-info">Tài khoản liên kết nhận tiền tự động khi thực hiện rút tiền hoặc đối soát</span>
        </div>
        <button className="nav-btn-primary add-bank-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={14} /> + Thêm tài khoản ngân hàng
        </button>
      </div>

      <div className="addresses-stack-list">
        {list.map(acc => (
          <div key={acc.id} className={`address-item-box ${acc.isDefault ? 'default' : ''}`}>
            <div className="addr-info-left">
              <div className="addr-title-row">
                <strong className="addr-name">{acc.bankName}</strong>
                {acc.isDefault && (
                  <span className="default-badge">
                    <Star size={11} fill="#00B14F" /> Tài khoản mặc định
                  </span>
                )}
              </div>
              <p className="contact-text">
                <CreditCard size={12} /> Số tài khoản: <strong>{acc.accountNumberMasked}</strong>
              </p>
              <p className="full-address-text">
                <ShieldCheck size={12} /> Chủ tài khoản: <strong>{acc.accountHolder}</strong> • Trạng thái: {acc.verificationStatus || '🟢 Đã xác minh'}
              </p>
            </div>

            <div className="addr-actions-right">
              {!acc.isDefault && (
                <button className="nav-btn-secondary set-def-btn" onClick={() => onSetDefault(acc.id)}>
                  Đặt làm mặc định
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Bank Modal */}
      {isAddModalOpen && (
        <div className="shipping-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="shipping-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="header-title-group">
                <CreditCard size={20} className="header-icon-green" />
                <h3 className="modal-title">Thêm tài khoản ngân hàng nhận tiền</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form-body">
              <div className="form-group-field">
                <label className="field-label">Tên Ngân hàng (*):</label>
                <select 
                  className="modal-select-control"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="Vietcombank">Vietcombank - Ngân hàng TMCP Ngoại Thương</option>
                  <option value="MB Bank">MB Bank - Ngân hàng TMCP Quân Đội</option>
                  <option value="Techcombank">Techcombank - Ngân hàng TMCP Kỹ Thương</option>
                  <option value="VietinBank">VietinBank - Ngân hàng TMCP Công Thương</option>
                  <option value="BIDV">BIDV - Ngân hàng TMCP Đầu tư và Phát triển</option>
                  <option value="VPBank">VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng</option>
                  <option value="ACB">ACB - Ngân hàng TMCP Á Châu</option>
                </select>
              </div>

              <div className="form-group-field">
                <label className="field-label">Số tài khoản (*):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  placeholder="Nhập số tài khoản ngân hàng..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="form-group-field">
                <label className="field-label">Họ tên chủ tài khoản (Viết hoa không dấu) (*):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  placeholder="VD: NGUYEN VAN A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>

              <div className="modal-note-text">
                🔒 Thông tin tài khoản được bảo mật và xác thực liên kết NAPAS tự động với tên chủ gian hàng.
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="nav-btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="nav-btn-primary">
                  Xác nhận thêm tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
