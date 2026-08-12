import React from 'react';
import { MessageSquare, Clock, ChevronDown, Check } from 'lucide-react';

export default function OrderRow({ 
  order, 
  isSelected, 
  onToggleSelect, 
  onViewDetail, 
  onUpdateStatus 
}) {
  const customerName = typeof order.customer === 'object' ? order.customer.name : order.customer;
  const customerPhone = typeof order.customer === 'object' ? order.customer.phone : '';
  const customerCity = typeof order.customer === 'object' ? order.customer.city : '';

  const firstItem = order.items?.[0] || { name: 'Sản phẩm S-Shopping', quantity: 1, price: 0, image: '' };
  const extraItemsCount = (order.items?.length || 1) - 1;

  const totalAmount = order.summary?.total || order.total || 0;
  const paymentMethod = order.summary?.paymentMethod || 'Ví V-life';

  // Badge Color Styles by Status
  let statusBadgeClass = 'order-badge-green';
  let actionBtnText = 'Xem';
  let actionBtnPrimary = false;

  if (order.status === 'Chờ xác nhận') {
    statusBadgeClass = 'order-badge-orange-alert';
    actionBtnText = 'Xử lý';
    actionBtnPrimary = true;
  } else if (order.status === 'Chờ lấy hàng' || order.status === 'Chờ đóng gói') {
    statusBadgeClass = 'order-badge-blue-soft';
    actionBtnText = 'Xem';
  } else if (order.status === 'Đang giao' || order.status === 'Chờ bàn giao') {
    statusBadgeClass = 'order-badge-purple-soft';
    actionBtnText = 'Xem';
  } else if (order.status === 'Hoàn thành') {
    statusBadgeClass = 'order-badge-green-soft';
    actionBtnText = 'Xem';
  } else if (order.status === 'Đã hủy') {
    statusBadgeClass = 'order-badge-red-soft';
    actionBtnText = 'Xem';
  } else if (order.status === 'Trả hàng/Hoàn tiền' || order.status === 'Trả hàng') {
    statusBadgeClass = 'order-badge-yellow-soft';
    actionBtnText = 'Xem';
  }

  return (
    <tr className={`order-table-row ${isSelected ? 'row-selected' : ''}`}>
      {/* Checkbox */}
      <td className="col-checkbox">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(order.id)}
          className="row-checkbox"
        />
      </td>

      {/* Code & Chat badge */}
      <td className="col-order-code">
        <div className="order-code-wrapper">
          <span 
            className="order-code-text"
            onClick={() => onViewDetail(order)}
            title="Xem chi tiết đơn hàng"
          >
            {order.code || `#${order.id}`}
          </span>
          {order.hasNewChat && (
            <span className="chat-badge-pill">
              <MessageSquare size={10} /> Chat mới
            </span>
          )}
        </div>
      </td>

      {/* Customer Info */}
      <td className="col-customer">
        <div className="customer-info-block">
          <span className="customer-name">{customerName}</span>
          {customerPhone && <span className="customer-phone">{customerPhone}</span>}
          {customerCity && <span className="customer-city">{customerCity}</span>}
        </div>
      </td>

      {/* Product Info */}
      <td className="col-product-item">
        <div className="order-product-thumb-row">
          <img src={firstItem.image} alt={firstItem.name} className="order-item-thumb" />
          <div className="order-item-details">
            <span className="item-title-name">{firstItem.name}</span>
            <span className="item-variant-qty">
              {firstItem.variant ? `${firstItem.variant} ` : ''}x{firstItem.quantity || 1}
              {extraItemsCount > 0 && <strong className="extra-count-text"> +{extraItemsCount} sản phẩm khác</strong>}
            </span>
          </div>
        </div>
      </td>

      {/* Total Amount & Payment Tag */}
      <td className="col-total">
        <div className="total-amount-block">
          <span className="total-val-text">{totalAmount.toLocaleString('vi-VN')}đ</span>
          <span className="payment-tag-pill">{paymentMethod}</span>
        </div>
      </td>

      {/* Status Badge & Countdown Timer */}
      <td className="col-status">
        <div className="status-badge-block">
          <span className={`order-status-badge ${statusBadgeClass}`}>
            {order.status}
          </span>
          {order.countdownTimer && (
            <span className="countdown-timer-text">
              <Clock size={11} /> Còn {order.countdownTimer}
            </span>
          )}
          {order.cancelReason && (
            <span className="cancel-reason-text">⏱️ {order.cancelReason}</span>
          )}
        </div>
      </td>

      {/* Shipping Provider */}
      <td className="col-shipping">
        <div className="shipping-provider-block">
          <span className="provider-logo-tag">{order.shipping?.provider || 'GHN'}</span>
          <span className="shipping-service-name">{order.shipping?.service || 'Giao tiêu chuẩn'}</span>
        </div>
      </td>

      {/* Created Date */}
      <td className="col-date">
        <span className="order-created-date">{order.date || '11/08 10:30'}</span>
      </td>

      {/* Actions */}
      <td className="col-actions">
        <div className="order-row-actions">
          {actionBtnPrimary ? (
            <button 
              className="nav-btn-primary action-btn-primary"
              onClick={() => onUpdateStatus(order.id, 'Chờ lấy hàng')}
            >
              <Check size={14} /> {actionBtnText}
            </button>
          ) : (
            <button 
              className="nav-btn-secondary action-btn-view"
              onClick={() => onViewDetail(order)}
            >
              {actionBtnText} <ChevronDown size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
