import React, { useState } from 'react';
import { Sliders, AlertTriangle, X } from 'lucide-react';

export default function AdjustInventoryModal({ 
  item, 
  onClose, 
  onConfirmAdjust 
}) {
  const currentPhysical = item?.physicalStock ?? item?.quantity ?? 100;
  const currentReserved = item?.reservedStock ?? item?.reservedQuantity ?? 5;

  const [newPhysicalStr, setNewPhysicalStr] = useState(currentPhysical.toString());
  const [reason, setReason] = useState('Kiểm kê');
  const [customNote, setCustomNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!item) return null;

  const newPhysical = parseInt(newPhysicalStr, 10) || 0;
  const diff = newPhysical - currentPhysical;

  const handleStockChange = (val) => {
    setNewPhysicalStr(val);
    const num = parseInt(val, 10) || 0;
    if (num < currentReserved) {
      setErrorMsg(`Tồn kho mới (${num}) không thể nhỏ hơn số lượng hàng đang giữ cho đơn (${currentReserved})!`);
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPhysical < currentReserved) {
      setErrorMsg(`Tồn kho mới (${newPhysical}) không thể nhỏ hơn số lượng hàng đang giữ cho đơn (${currentReserved})!`);
      return;
    }
    const finalReason = reason === 'Khác' ? (customNote || 'Khác') : reason;
    onConfirmAdjust(item.sku || item.productId || item.id, newPhysical, finalReason);
  };

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div className="inventory-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Sliders size={20} className="header-icon-green" />
            <h3 className="modal-title">Điều chỉnh tồn kho</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="modal-info-summary-box">
            <div className="summary-row">
              <span className="lbl">Sản phẩm:</span>
              <strong>{item.productName || item.name}</strong>
            </div>
            <div className="summary-row">
              <span className="lbl">Product ID / SKU:</span>
              <code>{item.productId || 'p1'} / {item.sku || 'SKU-001'}</code>
            </div>
            <div className="summary-row">
              <span className="lbl">Tồn kho hiện tại:</span>
              <strong>{currentPhysical} sản phẩm</strong>
            </div>
            <div className="summary-row">
              <span className="lbl">Đang giữ cho đơn:</span>
              <strong style={{ color: '#F97316' }}>{currentReserved} sản phẩm</strong>
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Số lượng mới (*):</label>
            <input 
              type="number"
              min="0"
              className="modal-input-control"
              value={newPhysicalStr}
              onChange={(e) => handleStockChange(e.target.value)}
              placeholder="Nhập số lượng tồn kho mới..."
            />
          </div>

          {/* Diff Calculator Banner */}
          <div className="diff-calculator-banner">
            <span>Chênh lệch điều chỉnh:</span>
            <strong className={`diff-val ${diff >= 0 ? 'positive' : 'negative'}`}>
              {diff > 0 ? `+${diff}` : diff} sản phẩm
            </strong>
          </div>

          {errorMsg && (
            <div className="modal-error-alert">
              <AlertTriangle size={15} /> {errorMsg}
            </div>
          )}

          {/* 5 Lý do (Requirement 11) */}
          <div className="form-group-field">
            <label className="field-label">Lý do điều chỉnh (*):</label>
            <select 
              className="modal-select-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Kiểm kê">Kiểm kê</option>
              <option value="Hàng hỏng">Hàng hỏng</option>
              <option value="Hàng thất lạc">Hàng thất lạc</option>
              <option value="Nhập bổ sung">Nhập bổ sung</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {reason === 'Khác' && (
            <div className="form-group-field">
              <label className="field-label">Chi tiết lý do khác:</label>
              <textarea 
                rows={2}
                className="modal-textarea-control"
                placeholder="Nhập lý do chi tiết..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
          )}

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="nav-btn-primary"
              disabled={!!errorMsg}
            >
              Xác nhận điều chỉnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
