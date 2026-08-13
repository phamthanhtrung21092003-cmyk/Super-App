import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function OrderCancelModal({ order, onClose, onConfirmCancel }) {
  const [reason, setReason] = useState('Hết hàng trong kho');
  const [customNote, setCustomNote] = useState('');

  if (!order) return null;

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    const finalReason = reason === 'Lý do khác' ? (customNote || 'Lý do khác') : reason;
    onConfirmCancel(order.id, finalReason);
  };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel danger-theme" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <AlertTriangle size={20} className="header-icon-red" />
            <h3 className="modal-title">Hủy đơn hàng {order.code || `#${order.id}`}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCancelSubmit} className="modal-form-body">
          <div className="modal-alert-box danger-alert">
            <p>
              Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy, đơn hàng sẽ chuyển sang trạng thái <strong>Đã hủy (CANCELLED)</strong> và thông báo cho người mua.
            </p>
          </div>

          <div className="form-group-field">
            <label className="field-label">Vui lòng chọn lý do hủy đơn (*):</label>
            <div className="radio-reasons-group">
              {[
                'Hết hàng trong kho',
                'Không thể giao đến địa chỉ này',
                'Khách hàng nhắn tin yêu cầu hủy',
                'Thông tin người nhận không chính xác',
                'Lý do khác'
              ].map((r, idx) => (
                <label key={idx} className="radio-option-label">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={r} 
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {reason === 'Lý do khác' && (
            <div className="form-group-field">
              <label className="field-label">Ghi chú chi tiết lý do hủy:</label>
              <textarea 
                rows={3} 
                className="modal-textarea-control"
                placeholder="Nhập chi tiết lý do hủy đơn hàng..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
          )}

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Quay lại
            </button>
            <button type="submit" className="nav-btn-primary danger-delete-btn">
              Xác nhận hủy đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
