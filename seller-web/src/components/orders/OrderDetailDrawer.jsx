import React, { useState } from 'react';
import { 
  X, MessageSquare, Copy, CheckCircle2, Truck, 
  MapPin, Phone, User, Package, Printer, Check, Box, Send, ShieldAlert, AlertCircle 
} from 'lucide-react';

export default function OrderDetailDrawer({ 
  order, 
  onClose, 
  onUpdateStatus 
}) {
  const [copySuccess, setCopySuccess] = useState('');

  if (!order) return null;

  const customer = typeof order.customer === 'object' 
    ? order.customer 
    : { name: order.customer, phone: '0901 234 567', address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' };
  
  const items = order.items || [];
  const summary = order.summary || { 
    subtotal: 0, 
    shippingFee: 0, 
    discount: 0, 
    total: order.total || 0, 
    paymentMethod: 'Ví V-life',
    paymentStatus: 'Chưa thanh toán' 
  };
  const shipping = order.shipping || { 
    providerName: 'Giao Hàng Nhanh (GHN)', 
    trackingNo: 'GHN123456789VN',
    service: 'Giao tiêu chuẩn' 
  };

  // 6-step Timeline: Đặt hàng -> Xác nhận -> Đóng gói -> Bàn giao -> Đang giao -> Hoàn thành (Requirement 10)
  const getStepIndex = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 0;
      case 'Chờ đóng gói': return 1;
      case 'Chờ bàn giao': return 2;
      case 'Đang giao': return 3;
      case 'Hoàn thành': return 5;
      case 'Đã hủy': return -1;
      case 'Trả hàng / Hoàn tiền': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const steps = [
    { title: 'Đặt hàng', date: order.date || '15/08 10:30' },
    { title: 'Xác nhận', date: currentStepIdx >= 1 ? '15/08 10:35' : '--' },
    { title: 'Đóng gói', date: currentStepIdx >= 2 ? '15/08 11:20' : '--' },
    { title: 'Bàn giao', date: currentStepIdx >= 3 ? '15/08 14:00' : '--' },
    { title: 'Đang giao', date: currentStepIdx >= 4 ? '15/08 15:30' : '--' },
    { title: 'Hoàn thành', date: currentStepIdx >= 5 ? '16/08 09:00' : '--' }
  ];

  const handleCopyCode = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopySuccess(`Đã sao chép ${label}!`);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  return (
    <div className="order-detail-drawer-backdrop" onClick={onClose}>
      <div className="order-detail-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header-bar">
          <div className="drawer-title-group">
            <h2 className="drawer-main-title">Chi tiết đơn hàng</h2>
            <div className="drawer-code-badges">
              <span className="drawer-order-code">{order.code || `#${order.id}`}</span>
              <span className="drawer-status-pill">{order.status}</span>
            </div>
          </div>

          <div className="drawer-header-right">
            <button 
              type="button" 
              className="chat-with-customer-btn"
              onClick={() => alert(`Mở cửa sổ Chat với khách hàng ${customer.name}`)}
            >
              <MessageSquare size={15} /> Chat với khách
            </button>
            <button type="button" className="drawer-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Copy Toast Indicator */}
        {copySuccess && (
          <div className="drawer-copy-toast">
            <CheckCircle2 size={14} /> {copySuccess}
          </div>
        )}

        {/* 6-step Timeline Stepper (Requirement 10) */}
        <div className="drawer-timeline-card">
          <h4 className="timeline-section-title">Tiến trình xử lý đơn hàng</h4>
          <div className="timeline-stepper-track">
            {steps.map((step, idx) => {
              const isCompleted = order.status !== 'Đã hủy' && idx <= currentStepIdx;
              const isCurrent = order.status !== 'Đã hủy' && idx === currentStepIdx;

              return (
                <div 
                  key={idx} 
                  className={`timeline-step-item ${isCompleted ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                >
                  <div className="step-circle-icon">
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="step-label-title">{step.title}</span>
                  <span className="step-label-date">{step.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body Stack */}
        <div className="drawer-body-stack">
          {/* Thông tin đơn hàng & Ngày đặt */}
          <div className="drawer-section-card">
            <div className="section-card-header-row">
              <h3 className="section-card-title">
                <Package size={16} /> Thông tin đơn hàng
              </h3>
              <span className="info-date-tag">Ngày đặt: {order.date}</span>
            </div>
            <div className="order-meta-info-grid">
              <div className="meta-info-item">
                <span className="meta-lbl">Mã đơn hàng:</span>
                <strong className="meta-val">
                  {order.code || `#${order.id}`}
                  <button 
                    type="button" 
                    className="copy-mini-btn" 
                    onClick={() => handleCopyCode(order.code || `#${order.id}`, 'Mã đơn')}
                  >
                    <Copy size={12} />
                  </button>
                </strong>
              </div>
              <div className="meta-info-item">
                <span className="meta-lbl">Kho lấy hàng:</span>
                <span className="meta-val">{order.warehouse || 'Kho Tổng Hà Nội'}</span>
              </div>
              <div className="meta-info-item">
                <span className="meta-lbl">Kênh bán:</span>
                <span className="meta-val">S-Shopping App</span>
              </div>
              <div className="meta-info-item">
                <span className="meta-lbl">Trạng thái:</span>
                <span className="meta-val highlight-green">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="drawer-section-card">
            <h3 className="section-card-title">
              <User size={16} /> Thông tin khách hàng & Nhận hàng
            </h3>
            <div className="customer-detail-box">
              <div className="customer-name-phone-row">
                <strong className="cust-name-text">{customer.name}</strong>
                <span className="cust-phone-text">
                  <Phone size={13} /> {customer.phone}
                  <button 
                    type="button" 
                    className="copy-icon-btn" 
                    onClick={() => handleCopyCode(customer.phone, 'Số điện thoại')}
                  >
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
                <Package size={16} /> Danh sách sản phẩm ({items.length})
              </h3>
            </div>

            <div className="items-list-container">
              {items.map((item, idx) => (
                <div key={idx} className="drawer-product-item-row">
                  <img src={item.image} alt={item.name} className="drawer-item-thumb" />
                  <div className="drawer-item-info">
                    <span className="drawer-item-title">{item.name}</span>
                    <span className="drawer-item-variant">
                      Phân loại: <strong>{item.variant || 'Mặc định'}</strong> | SKU: <strong>{item.sku || 'SKU-001'}</strong>
                    </span>
                    <span className="drawer-item-price">
                      Đơn giá: {item.price ? `${Number(item.price).toLocaleString('vi-VN')}đ` : ''}
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

          {/* Chi tiết thanh toán */}
          <div className="drawer-section-card">
            <h3 className="section-card-title">Chi tiết thanh toán</h3>
            <div className="payment-summary-rows-stack">
              <div className="summary-line-row">
                <span>Tổng tiền hàng:</span>
                <span>{(summary.subtotal || summary.total || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-line-row">
                <span>Phí vận chuyển:</span>
                <span>{(summary.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              {summary.discount !== 0 && (
                <div className="summary-line-row discount-row">
                  <span>Voucher giảm giá Shop:</span>
                  <span>-{(Math.abs(summary.discount || 0)).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="summary-line-row grand-total-row">
                <strong>Tổng thanh toán:</strong>
                <strong className="grand-total-price">
                  {(summary.total || 0).toLocaleString('vi-VN')}đ
                </strong>
              </div>
              <div className="payment-method-row-flex">
                <span>Phương thức: <strong>{summary.paymentMethod || 'Ví V-life'}</strong></span>
                <span className="pay-status-tag">Trạng thái: <strong>{summary.paymentStatus || 'Chưa thanh toán'}</strong></span>
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
                <span className="shipping-service-pill">{shipping.service || 'Giao tiêu chuẩn'}</span>
              </div>
              <div className="tracking-code-row">
                <span>Mã vận đơn: <strong>{shipping.trackingNo || 'Chưa có mã'}</strong></span>
                {shipping.trackingNo && shipping.trackingNo !== '--' && (
                  <button 
                    type="button" 
                    className="copy-icon-btn" 
                    onClick={() => handleCopyCode(shipping.trackingNo, 'Mã vận đơn')}
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer with contextual actions (Requirement 11) */}
        <div className="drawer-action-footer">
          {order.status === 'Chờ xác nhận' && (
            <button 
              type="button"
              className="nav-btn-primary drawer-action-btn-confirm"
              onClick={() => {
                onUpdateStatus(order.id, 'Chờ đóng gói');
                onClose();
              }}
            >
              <Check size={16} /> Xác nhận đơn hàng
            </button>
          )}

          {order.status === 'Chờ đóng gói' && (
            <button 
              type="button"
              className="nav-btn-primary drawer-action-btn-pack"
              onClick={() => {
                onUpdateStatus(order.id, 'Chờ bàn giao');
                onClose();
              }}
            >
              <Box size={16} /> Hoàn tất đóng gói
            </button>
          )}

          {order.status === 'Chờ bàn giao' && (
            <button 
              type="button"
              className="nav-btn-primary drawer-action-btn-handover"
              onClick={() => {
                onUpdateStatus(order.id, 'Đang giao');
                onClose();
              }}
            >
              <Truck size={16} /> Bàn giao cho ĐVVC
            </button>
          )}

          {order.status === 'Đang giao' && (
            <button 
              type="button"
              className="nav-btn-primary drawer-action-btn-complete"
              onClick={() => {
                onUpdateStatus(order.id, 'Hoàn thành');
                onClose();
              }}
            >
              <CheckCircle2 size={16} /> Xác nhận đã giao thành công
            </button>
          )}

          <button 
            type="button" 
            className="nav-btn-secondary drawer-print-btn" 
            onClick={() => alert(`🖨️ Đang in phiếu giao hàng cho đơn #${order.code || order.id}`)}
          >
            <Printer size={16} /> In phiếu giao
          </button>

          <button type="button" className="nav-btn-secondary drawer-close-alt-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
