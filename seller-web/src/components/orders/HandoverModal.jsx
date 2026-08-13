import React from 'react';
import { Truck, Barcode, MapPin, X } from 'lucide-react';

export default function HandoverModal({ order, onClose, onConfirmHandover }) {
  if (!order) return null;

  const trackingNo = order.shipping?.trackingNo || `VLX${Math.floor(100000000 + Math.random() * 900000000)}`;
  const provider = order.shipping?.providerName || order.shipping?.provider || 'V-life Delivery';
  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901234567', address: '123 Nguyễn Huệ, Q.1, TP.HCM' };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Truck size={20} className="header-icon-green" />
            <h3 className="modal-title">Bàn giao ĐVVC - Đơn #{order.code || order.id}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="handover-carrier-card">
            <div className="carrier-badge-box">
              <Truck size={24} />
            </div>
            <div className="carrier-details-text">
              <span className="lbl">Đơn vị vận chuyển tiếp nhận:</span>
              <strong className="carrier-name">{provider}</strong>
              <span className="sub">Mã vận đơn tự động: <strong>{trackingNo}</strong></span>
            </div>
          </div>

          <div className="modal-info-summary-box">
            <div className="summary-row">
              <span className="lbl"><MapPin size={13} /> Địa chỉ lấy hàng:</span>
              <span>Kho tổng S-SHOPPING (123 Nguyễn Văn Linh, Q.7, TP.HCM)</span>
            </div>
            <div className="summary-row">
              <span className="lbl"><Barcode size={13} /> Người nhận:</span>
              <strong>{customer.name} ({customer.phone})</strong>
            </div>
          </div>

          <p className="modal-note-text">
            📦 Sau khi bấm <strong>"Xác nhận bàn giao"</strong>, shipper của {provider} sẽ quét mã vận đơn <code>{trackingNo}</code> và đơn hàng chuyển sang trạng thái <strong>Đang giao</strong>.
          </p>

          <div className="modal-actions-footer">
            <button className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button className="nav-btn-primary" onClick={() => onConfirmHandover(order.id, trackingNo)}>
              Xác nhận bàn giao vận chuyển
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
