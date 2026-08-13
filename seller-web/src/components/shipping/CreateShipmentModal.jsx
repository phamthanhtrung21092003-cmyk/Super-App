import React, { useState } from 'react';
import { Truck, Package, MapPin, X, AlertCircle } from 'lucide-react';

export default function CreateShipmentModal({ 
  order, 
  activeCarriers = [], 
  onClose, 
  onCreateShipment,
  onNavigateToCarrierSetup 
}) {
  const [selectedCarrier, setSelectedCarrier] = useState(activeCarriers[0]?.id || 'v-life-delivery');
  const [weight, setWeight] = useState('500'); // grams
  const [dimensions, setDimensions] = useState('20x15x10'); // cm

  if (!order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901234567', address: '123 Nguyễn Huệ, Quận 1, TP.HCM' };
  const items = order.items || [];
  const orderTotal = order.summary?.total || order.total || 0;

  // Filter only active carriers
  const availableCarriers = activeCarriers.filter(c => c.active !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availableCarriers.length === 0) return;
    
    const trackingNo = `VLX${Math.floor(100000000 + Math.random() * 900000000)}`;
    const carrierObj = availableCarriers.find(c => c.id === selectedCarrier) || availableCarriers[0];
    
    onCreateShipment(order.id, carrierObj.name || 'V-life Delivery', trackingNo);
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Truck size={20} className="header-icon-green" />
            <h3 className="modal-title">Tạo vận đơn giao hàng - Đơn #{order.code || order.id}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {availableCarriers.length === 0 ? (
          <div className="modal-form-body empty-carrier-alert-box">
            <AlertCircle size={36} className="warning-icon-red" />
            <h3>Chưa có đơn vị vận chuyển được kích hoạt</h3>
            <p>Vui lòng bật ít nhất một đơn vị vận chuyển trong phần cài đặt trước khi tạo vận đơn.</p>
            <button className="nav-btn-primary" onClick={() => { onClose(); onNavigateToCarrierSetup(); }}>
              Thiết lập vận chuyển ngay
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form-body">
            {/* Customer Summary Card */}
            <div className="modal-info-summary-box">
              <div className="summary-row">
                <span className="lbl"><MapPin size={13} /> Người nhận:</span>
                <strong>{customer.name} ({customer.phone})</strong>
              </div>
              <div className="summary-row">
                <span className="lbl">Địa chỉ giao hàng:</span>
                <span>{customer.address || customer.city}</span>
              </div>
              <div className="summary-row">
                <span className="lbl">Sản phẩm:</span>
                <span>{items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
              </div>
              <div className="summary-row">
                <span className="lbl">Giá trị đơn hàng:</span>
                <strong className="green-price-text">{orderTotal.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>

            {/* Carrier Selector */}
            <div className="form-group-field">
              <label className="field-label">Chọn Đơn vị vận chuyển tiếp nhận (*):</label>
              <div className="carrier-radio-list">
                {availableCarriers.map(c => (
                  <label key={c.id} className={`carrier-radio-item ${selectedCarrier === c.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="carrier" 
                      value={c.id}
                      checked={selectedCarrier === c.id}
                      onChange={(e) => setSelectedCarrier(e.target.value)}
                    />
                    <div className="carrier-item-info">
                      <strong className="c-name">{c.name}</strong>
                      <span className="c-sub">Thời gian: {c.time || '1-2 ngày'} • Phí: 25.000đ</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight & Dimension */}
            <div className="form-row-grid-2">
              <div className="form-group-field">
                <label className="field-label">Trọng lượng (gram):</label>
                <input 
                  type="number"
                  className="modal-input-control"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="form-group-field">
                <label className="field-label">Kích thước (DxRxC cm):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions-footer">
              <button type="button" className="nav-btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="nav-btn-primary">
                Xác nhận tạo vận đơn
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
