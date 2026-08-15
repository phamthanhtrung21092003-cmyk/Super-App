import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

export default function ReceiveInventoryModal({ 
  existingProducts = [], 
  prefilledSku = '',
  onClose, 
  onConfirmReceive 
}) {
  const initialProduct = existingProducts.find(p => p.sku === prefilledSku) || existingProducts[0] || {};
  const [selectedProductId, setSelectedProductId] = useState(initialProduct.id || 'p1');
  const [selectedSku, setSelectedSku] = useState(prefilledSku || initialProduct.sku || 'SKU-001');
  const [quantity, setQuantity] = useState('50');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('Nhập hàng từ nhà cung cấp');

  const numQty = parseInt(quantity, 10) || 0;

  const handleProductChange = (pId) => {
    setSelectedProductId(pId);
    const prod = existingProducts.find(p => p.id === pId);
    if (prod) {
      setSelectedSku(prod.sku || `SKU-${pId}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numQty <= 0) {
      alert('Số lượng nhập kho phải lớn hơn 0.');
      return;
    }
    onConfirmReceive(selectedProductId, selectedSku, numQty, reason, note);
  };

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div className="inventory-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <PlusCircle size={20} className="header-icon-green" />
            <h3 className="modal-title">Nhập kho</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* 1. Chọn sản phẩm */}
          <div className="form-group-field">
            <label className="field-label">Chọn sản phẩm (*):</label>
            <select 
              className="modal-select-control"
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              {existingProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku || `SKU-${p.id}`} | ID: {p.id})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Số lượng nhập */}
          <div className="form-group-field">
            <label className="field-label">Số lượng nhập (*):</label>
            <div className="quantity-input-wrapper">
              <input 
                type="number"
                min="1"
                className="modal-input-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Nhập số lượng..."
              />
              <span className="qty-unit-tag">sản phẩm</span>
            </div>
          </div>

          {/* 3. Lý do */}
          <div className="form-group-field">
            <label className="field-label">Lý do nhập kho:</label>
            <select 
              className="modal-select-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Nhập hàng từ nhà cung cấp">Nhập hàng từ nhà cung cấp</option>
              <option value="Nhập bổ sung kiểm kê">Nhập bổ sung kiểm kê</option>
              <option value="Hàng hoàn trả về kho">Hàng hoàn trả về kho</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* 4. Ghi chú */}
          <div className="form-group-field">
            <label className="field-label">Ghi chú (Tùy chọn):</label>
            <textarea 
              rows={2}
              className="modal-textarea-control"
              placeholder="Nhập số hóa đơn hoặc ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nav-btn-primary">
              Xác nhận nhập kho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
