import React from 'react';
import { 
  X, MessageSquare, Copy, CheckCircle2, Truck, 
  MapPin, Phone, User, Package, Printer, Check 
} from 'lucide-react';

export default function OrderDetailDrawer({ 
  order, 
  onClose, 
  onUpdateStatus 
}) {
  if (!order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901 234 567', address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' };
  const items = order.items || [];
  const summary = order.summary || { subtotal: 0, shippingFee: 0, discount: 0, total: order.total || 0, paymentMethod: 'Ví V-life' };
  const shipping = order.shipping || { providerName: 'Giao Hàng Nhanh (GHN)', trackingNo: 'GHN123456789VN' };

  const steps = [
    { title: 'Đặt hàng', date: order.date || '11/08 10:30', done: true },
    { title: 'Xác nhận', done: order.status !== 'Chờ xác nhận' },
    { title: 'Lấy hàng', done: ['Đang giao', 'Hoàn thành'].includes(order.status) },
    { title: 'Đang giao', done: ['Đang giao', 'Hoàn thành'].includes(order.status) },
    { title: 'Hoàn thành', done: order.status === 'Hoàn thành' }
  ];

  const handleCopyCode = (text) => {
    navigator.clipboard?.writeText(text);
    alert(`Đã sao chép: ${text}`);
  };

  return (
    <div className="order-detail-drawer-backdrop" onClick={onClose}>
      <div className="order-detail-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header-bar">
          <div className="drawer-title-group">
            <h2 className="drawer-main-title">Chi tiết đơn hàng</h2>
            <span className="drawer-order-code">{order.code || `#${order.id}`}</span>
          </div>

          <div className="drawer-header-right">
            <button className="chat-with-customer-btn">
              <MessageSquare size={15} /> Chat với khách
            </button>
            <button className="drawer-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="drawer-timeline-card">
          <div className="timeline-stepper-track">
            {steps.map((step, idx) => (
              <div key={idx} className={`timeline-step-item ${step.done ? 'is-done' : ''}`}>
                <div className="step-circle-icon">
                  {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className="step-label-title">{step.title}</span>
                {step.date && <span className="step-label-date">{step.date}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Content Body Stack */}
        <div className="drawer-body-stack">
          {/* Thông tin khách hàng */}
          <div className="drawer-section-card">
            <h3 className="section-card-title">
              <User size={16} /> Thông tin khách hàng
            </h3>
            <div className="customer-detail-box">
              <div className="customer-name-phone-row">
                <strong className="cust-name-text">{customer.name}</strong>
                <span className="cust-phone-text">
                  <Phone size={13} /> {customer.phone}
                  <button className="copy-icon-btn" onClick={() => handleCopyCode(customer.phone)}>
                    <Copy size={12} />
                  </button>
                </span>
              </div>
              <div className="cust-address-row">
                <MapPin size={14} className="pin-icon" />
                <span>{customer.address}</span>
              </div>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="drawer-section-card">
            <div className="section-card-header-row">
              <h3 className="section-card-title">
                <Package size={16} /> Thông tin sản phẩm
              </h3>
              <span className="items-count-pill">{items.length} sản phẩm</span>
            </div>

            <div className="items-list-container">
              {items.map((item, idx) => (
                <div key={idx} className="drawer-product-item-row">
                  <img src={item.image} alt={item.name} className="drawer-item-thumb" />
                  <div className="drawer-item-info">
                    <span className="drawer-item-title">{item.name}</span>
                    <span className="drawer-item-variant">{item.variant || 'Mặc định'}</span>
                    <span className="drawer-item-price">
                      {item.price ? `${item.price.toLocaleString('vi-VN')}đ` : ''}
                    </span>
                  </div>
                  <div className="drawer-item-qty-total">
                    <span className="qty-badge">x{item.quantity || 1}</span>
                    <strong className="total-item-price">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tóm tắt thanh toán */}
          <div className="drawer-section-card">
            <h3 className="section-card-title">Tóm tắt thanh toán</h3>
            <div className="payment-summary-rows-stack">
              <div className="summary-line-row">
                <span>Tổng tiền hàng</span>
                <span>{(summary.subtotal || summary.total || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-line-row">
                <span>Phí vận chuyển</span>
                <span>{(summary.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              {summary.discount !== 0 && (
                <div className="summary-line-row discount-row">
                  <span>Giảm giá</span>
                  <span>-{(Math.abs(summary.discount || 0)).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="summary-line-row grand-total-row">
                <strong>Tổng thanh toán</strong>
                <strong className="grand-total-price">
                  {(summary.total || 0).toLocaleString('vi-VN')}đ
                </strong>
              </div>
              <div className="payment-method-pill">
                Phương thức: <strong>{summary.paymentMethod || 'Ví V-life'}</strong>
              </div>
            </div>
          </div>

          {/* Thông tin vận chuyển */}
          <div className="drawer-section-card">
            <h3 className="section-card-title">
              <Truck size={16} /> Thông tin vận chuyển
            </h3>
            <div className="shipping-info-box">
              <div className="shipping-provider-line">
                <span className="provider-name">{shipping.providerName || shipping.provider || 'Giao Hàng Nhanh'}</span>
                <span className="tracking-status-text">Theo dõi</span>
              </div>
              <div className="tracking-code-row">
                <span>Mã vận đơn: <strong>{shipping.trackingNo || 'GHN123456789VN'}</strong></span>
                <button className="copy-icon-btn" onClick={() => handleCopyCode(shipping.trackingNo || 'GHN123456789VN')}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-action-footer">
          {order.status === 'Chờ xác nhận' ? (
            <button 
              className="nav-btn-primary drawer-confirm-main-btn"
              onClick={() => {
                onUpdateStatus(order.id, 'Chờ lấy hàng');
                onClose();
              }}
            >
              <Check size={16} /> Xác nhận đơn hàng
            </button>
          ) : (
            <button className="nav-btn-secondary drawer-print-btn" onClick={() => alert(`Đang in phiếu đơn hàng ${order.code}`)}>
              <Printer size={16} /> In đơn
            </button>
          )}

          <button className="nav-btn-secondary drawer-close-alt-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
