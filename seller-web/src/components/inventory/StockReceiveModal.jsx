import React, { useState } from 'react';
import { X, ArrowDownLeft, AlertTriangle } from 'lucide-react';

export default function StockReceiveModal({ 
  inventoryItems = [], 
  warehouses = [], 
  onClose, 
  onConfirm 
}) {
  const [selectedProductId, setSelectedProductId] = useState(inventoryItems[0]?.productId || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || 'wh_main');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedItem = inventoryItems.find(i => i.productId === selectedProductId || i.id === selectedProductId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 0;
    if (!selectedProductId) {
      setError('Vui lòng chọn sản phẩm cần nhập kho.');
      return;
    }
    if (qty <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ (> 0).');
      return;
    }

    setError('');
    onConfirm(selectedProductId, qty, selectedWarehouseId, notes);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card-box stock-receive-modal">
        <div className="modal-header-flex">
          <h3 className="modal-title-text">
            <ArrowDownLeft size={18} color="#00B14F" /> Nhập kho sản phẩm
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Select Product */}
          <div className="form-group-item">
            <label className="form-input-label">Chọn sản phẩm *</label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="form-control-select"
            >
              {inventoryItems.map(item => (
                <option key={item.id} value={item.productId || item.id}>
                  {item.productName} (SKU: {item.sku} - Tồn hiện tại: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Quick Info */}
          {selectedItem && (
            <div className="selected-item-preview">
              <img src={selectedItem.image} alt={selectedItem.productName} className="preview-img" />
              <div>
                <strong>{selectedItem.productName}</strong>
                <p>Mã SKU: {selectedItem.sku} | Tồn kho hiện tại: <span className="green-val">{selectedItem.quantity}</span></p>
              </div>
            </div>
          )}

          {/* Select Warehouse */}
          <div className="form-group-item">
            <label className="form-input-label">Kho nhận hàng *</label>
            <select 
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="form-control-select"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group-item">
            <label className="form-input-label">Số lượng nhập *</label>
            <input 
              type="number" 
              min="1"
              placeholder="Nhập số lượng..."
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setError(''); }}
              className="form-control-input"
            />
          </div>

          {/* Notes */}
          <div className="form-group-item">
            <label className="form-input-label">Ghi chú nhập kho</label>
            <input 
              type="text" 
              placeholder="Ví dụ: Nhập hàng lô tháng 8, Nhập hàng bổ sung..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control-input"
            />
          </div>

          {error && (
            <div className="modal-error-banner">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div className="modal-actions-flex">
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
