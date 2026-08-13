import React from 'react';
import { CheckCircle2, Package, MapPin, Truck, X } from 'lucide-react';

export default function OrderConfirmModal({ order, onClose, onConfirm }) {
  if (!order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901234567', address: '123 Nguyễn Huệ, Q.1, TP.HCM' };
  const items = order.items || [];
  const totalAmount = order.summary?.total || order.total || 0;

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <CheckCircle2 size={20} className="header-icon-green" />
            <h3 className="modal-title">Xác nhận xử lý đơn hàng {order.code || `#${order.id}`}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="modal-info-summary-box">
            <div className="summary-row">
              <span className="lbl"><MapPin size={13} /> Khách hàng:</span>
              <strong>{customer.name} ({customer.phone})</strong>
            </div>
            <div className="summary-row">
              <span className="lbl"><Truck size={13} /> Đơn vị vận chuyển:</span>
              <span>{order.shipping?.providerName || 'V-life Delivery'}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Tổng tiền thanh toán:</span>
              <strong className="green-price-text">{totalAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          <div className="modal-items-list-block">
            <h4 className="block-title"><Package size={14} /> Danh sách sản phẩm xác nhận:</h4>
            <div className="items-scroll-wrapper">
              {items.map((it, idx) => (
                <div key={idx} className="item-confirm-row">
                  <img src={it.image} alt={it.name} className="confirm-thumb" />
                  <div className="confirm-details">
                    <span className="item-name-text">{it.name}</span>
                    <span className="item-sub-tags">
                      Product ID: <strong>{it.productId || 'p2'}</strong> | SKU: <strong>{it.sku || 'ATB-BLK-M'}</strong>
                    </span>
                    <span className="item-variant-text">{it.variant || 'Mặc định'}</span>
                  </div>
                  <div className="confirm-qty-price">
                    <span className="qty-tag">x{it.quantity || 1}</span>
                    <strong>{((it.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="modal-note-text">
            💡 Đơn hàng sau khi xác nhận sẽ chuyển sang trạng thái <strong>Chờ đóng gói</strong> để nhân viên kho chuẩn bị hàng.
          </p>

          <div className="modal-actions-footer">
            <button className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button className="nav-btn-primary" onClick={() => onConfirm(order.id)}>
              Xác nhận đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
