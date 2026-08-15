import React from 'react';
import { Package, X, Check } from 'lucide-react';

export default function OrderPickerModal({
  customerOrders = [],
  onSelectOrder,
  onClose
}) {
  return (
    <div className="picker-modal-backdrop" onClick={onClose}>
      <div className="picker-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="picker-header-bar">
          <div className="picker-title-wrap">
            <Package size={18} className="icon-blue" />
            <h3 className="picker-main-title">Chọn đơn hàng gửi cho khách hàng</h3>
          </div>
          <button type="button" className="picker-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Orders List (Requirement 13) */}
        <div className="picker-items-scroll">
          {customerOrders.length > 0 ? (
            customerOrders.map(order => (
              <div key={order.id || order.code} className="picker-order-row">
                <div className="picker-order-info">
                  <div className="picker-order-code-line">
                    <strong className="order-code-txt">{order.code || order.id}</strong>
                    <span className="order-status-pill">{order.status || 'Đang giao'}</span>
                  </div>
                  <p className="picker-order-product-name">
                    {order.items?.[0]?.name || 'Sản phẩm S-SHOPPING'}
                    {order.items?.length > 1 && ` (+${order.items.length - 1} sp)`}
                  </p>
                  <div className="picker-order-total-price">
                    Tổng tiền: <strong>{(order.summary?.totalAmount || order.total || 299000).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-picker-send-blue"
                  onClick={() => onSelectOrder(order.id || order.code)}
                >
                  <Check size={14} /> Gửi đơn hàng
                </button>
              </div>
            ))
          ) : (
            <div className="picker-empty-state">
              <Package size={36} className="empty-icon" />
              <p>Khách hàng chưa có đơn hàng nào tại Shop</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
