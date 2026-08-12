import React, { useState } from 'react';
import { X, Plus, Minus, Edit2, AlertTriangle } from 'lucide-react';

export default function AdjustStockModal({ 
  item, 
  onClose, 
  onConfirm 
}) {
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' | 'SUB' | 'SET'
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!item) return null;

  const currentQty = item.quantity || 0;
  const numAmount = parseInt(amount, 10) || 0;

  let calculatedNewQty = currentQty;
  if (adjustType === 'ADD') calculatedNewQty = currentQty + numAmount;
  if (adjustType === 'SUB') calculatedNewQty = Math.max(0, currentQty - numAmount);
  if (adjustType === 'SET') calculatedNewQty = Math.max(0, numAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ (lớn hơn 0).');
      return;
    }
    if (adjustType === 'SUB' && numAmount > currentQty) {
      setError(`Không thể xuất quá số lượng tồn kho hiện tại (${currentQty} sản phẩm).`);
      return;
    }

    setError('');
    onConfirm(item.productId || item.id, adjustType, numAmount, reason);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card-box adjust-stock-modal">
        {/* Modal Header */}
        <div className="modal-header-flex">
          <h3 className="modal-title-text">Điều chỉnh tồn kho</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Product Overview Card */}
        <div className="modal-product-summary-box">
          <img src={item.image} alt={item.productName} className="modal-prod-thumb" />
          <div className="modal-prod-meta">
            <h4 className="modal-prod-title">{item.productName}</h4>
            <span className="modal-prod-sku">SKU: <strong>{item.sku}</strong></span>
          </div>
          <div className="modal-stock-stats">
            <span className="stock-stat-label">Tồn kho hiện tại:</span>
            <strong className="stock-stat-val">{currentQty}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Adjustment Type Selector */}
          <div className="form-group-item">
            <label className="form-input-label">Loại điều chỉnh *</label>
            <div className="adjust-type-pills-row">
              <button 
                type="button" 
                className={`type-pill-btn add ${adjustType === 'ADD' ? 'active' : ''}`}
                onClick={() => { setAdjustType('ADD'); setError(''); }}
              >
                <Plus size={14} /> + Nhập thêm
              </button>
              <button 
                type="button" 
                className={`type-pill-btn sub ${adjustType === 'SUB' ? 'active' : ''}`}
                onClick={() => { setAdjustType('SUB'); setError(''); }}
              >
                <Minus size={14} /> - Xuất kho
              </button>
              <button 
                type="button" 
                className={`type-pill-btn set ${adjustType === 'SET' ? 'active' : ''}`}
                onClick={() => { setAdjustType('SET'); setError(''); }}
              >
                <Edit2 size={14} /> ± Điều chỉnh
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-group-item">
            <label className="form-input-label">
              {adjustType === 'SET' ? 'Số lượng tồn mới *' : 'Số lượng thay đổi *'}
            </label>
            <input 
              type="number" 
              min="1"
              placeholder="Nhập số lượng..."
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className="form-control-input"
              autoFocus
            />
          </div>

          {/* Calculated Preview */}
          {numAmount > 0 && (
            <div className="calculation-preview-box">
              <span>Dự kiến tồn kho sau điều chỉnh:</span>
              <strong className="new-qty-tag">{calculatedNewQty} sản phẩm</strong>
            </div>
          )}

          {/* Reason Input */}
          <div className="form-group-item">
            <label className="form-input-label">Nguyên nhân *</label>
            <input 
              type="text" 
              placeholder="Ví dụ: Nhập hàng mới, Hàng bị hỏng, Kiểm kê định kỳ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-control-input"
            />
          </div>

          {error && (
            <div className="modal-error-banner">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions-flex">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nav-btn-primary">
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
