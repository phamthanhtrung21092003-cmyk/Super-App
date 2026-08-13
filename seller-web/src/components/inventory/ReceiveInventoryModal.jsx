import React, { useState } from 'react';
import { PlusCircle, Package, X } from 'lucide-react';

export default function ReceiveInventoryModal({ 
  existingProducts = [], 
  prefilledSku,
  onClose, 
  onConfirmReceive 
}) {
  const [selectedProductId, setSelectedProductId] = useState(existingProducts[0]?.id || 'p2');
  const [selectedSku, setSelectedSku] = useState(prefilledSku || existingProducts[0]?.sku || 'ATB-BLK-M');
  const [quantity, setQuantity] = useState('50');
  const [reason, setReason] = useState('Nhập hàng từ nhà cung cấp');
  const [note, setNote] = useState('');

  const numQty = parseInt(quantity, 10) || 0;

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
            <h3 className="modal-title">Tạo phiếu Nhập kho</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-group-field">
            <label className="field-label">Chọn sản phẩm nhập kho (*):</label>
            <select 
              className="modal-select-control"
              value={selectedProductId}
              onChange={(e) => {
                const pId = e.target.value;
                setSelectedProductId(pId);
                const prod = existingProducts.find(p => p.id === pId);
                if (prod) setSelectedSku(prod.sku || `SKU-${pId}`);
              }}
            >
              {existingProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Product ID: {p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-field">
            <label className="field-label">Mã SKU phân loại (*):</label>
            <input 
              type="text"
              className="modal-input-control"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              placeholder="VD: ATB-BLK-M"
            />
          </div>

          <div className="form-group-field">
            <label className="field-label">Số lượng nhập bổ sung (*):</label>
            <div className="quantity-input-wrapper">
              <input 
                type="number"
                min="1"
                className="modal-input-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <span className="qty-unit-tag">sản phẩm</span>
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Lý do nhập kho:</label>
            <select 
              className="modal-select-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Nhập hàng từ nhà cung cấp">Nhập hàng từ nhà cung cấp</option>
              <option value="Hàng hoàn trả về kho">Hàng hoàn trả về kho</option>
              <option value="Nhập bổ sung kiểm kê">Nhập bổ sung kiểm kê</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-group-field">
            <label className="field-label">Ghi chú (Tùy chọn):</label>
            <textarea 
              rows={2}
              className="modal-textarea-control"
              placeholder="Nhập mã phiếu giao hàng hoặc ghi chú..."
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
