import React from 'react';
import { MessageSquare, Clock, Eye, CheckCircle2, Box, Truck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function OrderRow({ 
  order, 
  isSelected = false, 
  onToggleSelect, 
  onViewDetail, 
  onConfirmOrder,
  onPackOrder,
  onHandoverOrder,
  onTrackShipping,
  onProcessReturn
}) {
  const customerName = typeof order.customer === 'object' ? order.customer.name : order.customer;
  const customerPhone = typeof order.customer === 'object' ? order.customer.phone : '';
  const customerCity = typeof order.customer === 'object' ? order.customer.city : '';

  const firstItem = order.items?.[0] || { 
    name: 'Sản phẩm S-Shopping', 
    quantity: 1, 
    price: 0, 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', 
    productId: 'p1', 
    sku: 'SKU-001' 
  };
  const extraItemsCount = (order.items?.length || 1) - 1;

  const totalAmount = order.summary?.total || order.total || 0;
  const paymentMethod = order.summary?.paymentMethod || 'Ví V-life';
  const paymentStatus = order.summary?.paymentStatus || 'Chưa thanh toán';

  // Badge Color Styles by Status
  let statusBadgeClass = 'order-badge-green';
  if (order.status === 'Chờ xác nhận') {
    statusBadgeClass = 'order-badge-orange-alert';
  } else if (order.status === 'Chờ đóng gói' || order.status === 'Chờ lấy hàng') {
    statusBadgeClass = 'order-badge-blue-soft';
  } else if (order.status === 'Chờ bàn giao') {
    statusBadgeClass = 'order-badge-purple-soft';
  } else if (order.status === 'Đang giao') {
    statusBadgeClass = 'order-badge-indigo-soft';
  } else if (order.status === 'Hoàn thành' || order.status === 'Đã giao') {
    statusBadgeClass = 'order-badge-green-soft';
  } else if (order.status === 'Đã hủy') {
    statusBadgeClass = 'order-badge-red-soft';
  } else if (order.status === 'Trả hàng / Hoàn tiền' || order.status === 'Trả hàng/Hoàn tiền' || order.status === 'Trả hàng') {
    statusBadgeClass = 'order-badge-yellow-soft';
  }

  // Render contextual primary action button based on order status (Requirement 11)
  const renderContextualActionButton = () => {
    switch (order.status) {
      case 'Chờ xác nhận':
        return (
          <button 
            type="button"
            className="row-action-btn primary-action"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmOrder && onConfirmOrder(order);
            }}
            title="Xác nhận đơn hàng"
          >
            <CheckCircle2 size={13} /> Xác nhận
          </button>
        );
      case 'Chờ đóng gói':
      case 'Chờ lấy hàng':
        return (
          <button 
            type="button"
            className="row-action-btn pack-action"
            onClick={(e) => {
              e.stopPropagation();
              onPackOrder && onPackOrder(order);
            }}
            title="Xác nhận đã đóng gói xong"
          >
            <Box size={13} /> Đã đóng gói
          </button>
        );
      case 'Chờ bàn giao':
        return (
          <button 
            type="button"
            className="row-action-btn handover-action"
            onClick={(e) => {
              e.stopPropagation();
              onHandoverOrder && onHandoverOrder(order);
            }}
            title="Bàn giao đơn hàng cho đơn vị vận chuyển"
          >
            <Truck size={13} /> Bàn giao ĐVVC
          </button>
        );
      case 'Đang giao':
        return (
          <button 
            type="button"
            className="row-action-btn track-action"
            onClick={(e) => {
              e.stopPropagation();
              if (onTrackShipping) onTrackShipping(order);
              else onViewDetail(order);
            }}
            title="Theo dõi hành trình vận chuyển"
          >
            <Truck size={13} /> Theo dõi
          </button>
        );
      case 'Trả hàng / Hoàn tiền':
      case 'Trả hàng/Hoàn tiền':
      case 'Trả hàng':
        return (
          <button 
            type="button"
            className="row-action-btn return-action"
            onClick={(e) => {
              e.stopPropagation();
              if (onProcessReturn) onProcessReturn(order);
              else onViewDetail(order);
            }}
            title="Xử lý yêu cầu trả hàng / hoàn tiền"
          >
            <ShieldAlert size={13} /> Xử lý hoàn
          </button>
        );
      case 'Hoàn thành':
      case 'Đã hủy':
      default:
        return (
          <button 
            type="button"
            className="row-action-btn view-action"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(order);
            }}
            title="Xem chi tiết đơn hàng"
          >
            <Eye size={13} /> Chi tiết
          </button>
        );
    }
  };

  return (
    <tr className={`order-table-row ${isSelected ? 'row-selected' : ''}`} onClick={() => onViewDetail(order)}>
      {/* 1. Checkbox */}
      <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(order.id)}
          className="row-checkbox"
        />
      </td>

      {/* 2. Mã đơn & Ngày đặt */}
      <td className="col-order-code">
        <div className="order-code-wrapper">
          <span 
            className="order-code-text"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(order);
            }}
            title="Xem chi tiết đơn hàng"
          >
            {order.code || `#${order.id}`}
          </span>
          <span className="order-date-sub">{order.date}</span>
          {order.hasNewChat && (
            <span className="chat-badge-pill">
              <MessageSquare size={10} /> Chat mới
            </span>
          )}
        </div>
      </td>

      {/* 3. Sản phẩm */}
      <td className="col-product-item">
        <div className="order-product-thumb-row">
          <img src={firstItem.image} alt={firstItem.name} className="order-item-thumb" />
          <div className="order-item-details">
            <span className="item-title-name" title={firstItem.name}>{firstItem.name}</span>
            <span className="item-sku-subtag">
              ID: <strong>{firstItem.productId || 'p1'}</strong> | SKU: <strong>{firstItem.sku || 'SKU-001'}</strong>
            </span>
            <span className="item-variant-qty">
              {firstItem.variant ? `${firstItem.variant} • ` : ''}x{firstItem.quantity || 1}
              {extraItemsCount > 0 && <strong className="extra-count-text"> +{extraItemsCount} SP khác</strong>}
            </span>
          </div>
        </div>
      </td>

      {/* 4. Khách hàng */}
      <td className="col-customer">
        <div className="customer-info-block">
          <span className="customer-name">{customerName}</span>
          {customerPhone && <span className="customer-phone">{customerPhone}</span>}
          {customerCity && <span className="customer-city">{customerCity}</span>}
        </div>
      </td>

      {/* 5. Tổng tiền */}
      <td className="col-total-amount">
        <div className="amount-info-block">
          <span className="total-money-text">{Number(totalAmount).toLocaleString('vi-VN')}đ</span>
          <span className="shipping-fee-sub">
            {order.summary?.shippingFee ? `+${Number(order.summary.shippingFee).toLocaleString('vi-VN')}đ ship` : 'Free ship'}
          </span>
        </div>
      </td>

      {/* 6. Thanh toán */}
      <td className="col-payment">
        <div className="payment-info-block">
          <span className="payment-method-badge">{paymentMethod}</span>
          <span className={`payment-status-dot ${paymentStatus.includes('Đã') ? 'paid' : 'unpaid'}`}>
            {paymentStatus}
          </span>
        </div>
      </td>

      {/* 7. Vận chuyển */}
      <td className="col-shipping">
        <div className="shipping-info-block">
          <span className="provider-name-text">{order.shipping?.providerName || order.shipping?.provider || 'Đang cập nhật'}</span>
          {order.shipping?.trackingNo && order.shipping.trackingNo !== '--' && (
            <span className="tracking-code-sub">{order.shipping.trackingNo}</span>
          )}
        </div>
      </td>

      {/* 8. Trạng thái */}
      <td className="col-status">
        <span className={`order-status-badge ${statusBadgeClass}`}>
          {order.status}
        </span>
        {order.countdownTimer && order.status === 'Chờ xác nhận' && (
          <span className="order-timer-sub">
            <Clock size={10} /> {order.countdownTimer}
          </span>
        )}
      </td>

      {/* 9. Thao tác */}
      <td className="col-actions" onClick={(e) => e.stopPropagation()}>
        <div className="row-actions-group">
          {renderContextualActionButton()}
          <button 
            type="button" 
            className="row-action-btn view-btn"
            onClick={() => onViewDetail(order)}
            title="Xem chi tiết"
          >
            <Eye size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
