import React from 'react';
import { X, Truck, User, MapPin, Package, Calendar, Clock, DollarSign, Phone, Printer } from 'lucide-react';
import ShippingTimeline from './ShippingTimeline';

export default function ShippingDetailDrawer({ 
  shipment, 
  onClose, 
  onOpenPrintLabel 
}) {
  if (!shipment) return null;

  const trackingNo = shipment.trackingNo || 'VLX123456789';
  const provider = shipment.provider || 'V-life Delivery';
  const customerName = shipment.customerName || 'Nguyễn Văn B';
  const customerPhone = shipment.customerPhone || '0901 234 567';
  const customerAddr = shipment.address || '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM';
  const estDate = shipment.estimatedDate || '15/08/2026';

  const mockItems = shipment.items || [
    { name: 'Áo thun nam basic', productId: 'p2', sku: 'ATB-BLK-M', variant: 'Đen / M', quantity: 2, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' }
  ];

  return (
    <div className="inventory-drawer-backdrop" onClick={onClose}>
      <div className="inventory-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="sku-pill-tag">Tracking: {trackingNo}</span>
            <h2 className="drawer-product-name">Chi tiết vận đơn #{shipment.code || shipment.id}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body-scroll">
          {/* Timeline Hành Trình Vận Chuyển */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Clock size={16} /> Hành trình vận chuyển (Tracking Timeline)
            </h3>
            <ShippingTimeline shipment={shipment} />

            {/* Mock Map Preview Box */}
            <div className="mock-map-container" style={{ marginTop: '16px', background: '#E2E8F0', height: '120px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px', border: '1px dashed #94A3B8' }}>
              <span>🗺️ Bản đồ hành trình tuyến đường giao hàng minh họa</span>
            </div>
          </div>

          {/* SECTION 1: Thông tin Đơn hàng */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Package size={16} /> Thông tin đơn hàng
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Mã đơn hàng</span>
                <strong className="v-val">#{shipment.code || shipment.id}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Mã vận đơn (Tracking No)</span>
                <code className="v-val">{trackingNo}</code>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Ngày tạo đơn</span>
                <span className="v-val">{shipment.date || '13/08/2026 10:30'}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Phương thức thanh toán</span>
                <span className="v-val">{shipment.paymentMethod || 'Ví V-life (Đã thanh toán)'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Thông tin Khách hàng */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <User size={16} /> Thông tin người nhận
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Họ và tên</span>
                <strong className="v-val">{customerName}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Số điện thoại</span>
                <span className="v-val">{customerPhone}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Địa chỉ nhận hàng</span>
                <span className="v-val">{customerAddr}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Thông tin Vận chuyển & Phí */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Truck size={16} /> Chi tiết ĐVVC & Phí vận chuyển
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Đơn vị vận chuyển</span>
                <strong className="v-val green-text">{provider}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Tài xế phụ trách (MOCK)</span>
                <span className="v-val">Nguyễn Văn C (SDT: 0912 345 678)</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Dự kiến giao hàng</span>
                <span className="v-val">{estDate}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Phí vận chuyển dự kiến</span>
                <span className="v-val">25.000đ</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">👉 Người mua trả</span>
                <span className="v-val">20.000đ</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">👉 Shop hỗ trợ</span>
                <span className="v-val">5.000đ</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Sản phẩm trong đơn */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Package size={16} /> Danh sách sản phẩm trong vận đơn
            </h3>
            {mockItems.map((it, idx) => (
              <div key={idx} className="item-confirm-row">
                <img src={it.image} alt={it.name} className="confirm-thumb" />
                <div className="confirm-details">
                  <span className="item-name-text">{it.name}</span>
                  <span className="item-sub-tags">Product ID: {it.productId} | SKU: {it.sku} ({it.variant})</span>
                </div>
                <strong>x{it.quantity}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="drawer-action-footer">
          <button className="nav-btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button className="nav-btn-primary" onClick={() => onOpenPrintLabel(shipment)}>
            <Printer size={15} /> In nhãn vận chuyển
          </button>
        </div>
      </div>
    </div>
  );
}
