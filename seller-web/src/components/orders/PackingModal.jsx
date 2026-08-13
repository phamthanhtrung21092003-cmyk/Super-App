import React, { useState } from 'react';
import { Package, CheckSquare, X } from 'lucide-react';

export default function PackingModal({ order, onClose, onCompletePacking }) {
  const items = order?.items || [];
  const [checkedItems, setCheckedItems] = useState({});

  if (!order) return null;

  const handleToggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isAllChecked = items.length === 0 || items.every((_, idx) => checkedItems[idx]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCompletePacking(order.id);
  };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Package size={20} className="header-icon-green" />
            <h3 className="modal-title">Đóng gói hàng đơn #{order.code || order.id}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="modal-alert-box warning-alert">
            <p>
              Vui lòng tích kiểm tra từng sản phẩm trong đơn hàng đúng mã <strong>SKU</strong> và số lượng trước khi dán nhãn đóng gói.
            </p>
          </div>

          <div className="packing-checklist-stack">
            <h4 className="block-title"><CheckSquare size={14} /> Danh sách đóng gói:</h4>
            {items.map((it, idx) => (
              <label key={idx} className={`packing-check-item ${checkedItems[idx] ? 'checked' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={!!checkedItems[idx]}
                  onChange={() => handleToggleCheck(idx)}
                />
                <img src={it.image} alt={it.name} className="packing-thumb" />
                <div className="packing-info">
                  <strong className="it-name">{it.name}</strong>
                  <span className="it-sub">Product ID: <strong>{it.productId || 'p2'}</strong> | SKU: <strong>{it.sku || 'ATB-BLK-M'}</strong></span>
                  <span className="it-var">{it.variant || 'Mặc định'}</span>
                </div>
                <div className="packing-qty">
                  <span className="qty-tag">SL: x{it.quantity || 1}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="nav-btn-primary"
              disabled={!isAllChecked}
            >
              Hoàn tất đóng gói & Chuyển Chờ bàn giao
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
