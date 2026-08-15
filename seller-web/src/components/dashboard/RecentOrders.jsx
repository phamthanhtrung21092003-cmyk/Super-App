import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ShoppingBag, Plus } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function RecentOrders({ 
  existingOrders = [], 
  onNavigateToOrders, 
  onSelectOrder,
  onOpenAddProductModal 
}) {
  const [ordersList, setOrdersList] = useState([]);

  useEffect(() => {
    sellerService.getRecentOrders(existingOrders, 5).then(data => setOrdersList(data));
  }, [existingOrders]);

  const handleOrderClick = (order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    } else if (onNavigateToOrders) {
      onNavigateToOrders('orders', order.status);
    }
  };

  return (
    <div className="dashboard-card recent-orders-card">
      {/* Header */}
      <div className="card-header-flex">
        <h3 className="card-title-heading">Đơn hàng gần đây</h3>
        {ordersList.length > 0 && (
          <button 
            className="link-see-all-btn"
            onClick={() => onNavigateToOrders && onNavigateToOrders('orders', 'Tất cả')}
          >
            Xem tất cả <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* Orders List or Empty State */}
      {ordersList.length > 0 ? (
        <div className="orders-vertical-list">
          {ordersList.map((item, idx) => {
            let statusClass = 'status-tag-default';
            if (item.status === 'Chờ xác nhận') statusClass = 'status-tag-orange';
            if (item.status === 'Đang giao') statusClass = 'status-tag-blue';
            if (item.status === 'Chờ lấy hàng' || item.status === 'Chờ đóng gói') statusClass = 'status-tag-purple';
            if (item.status === 'Hoàn thành') statusClass = 'status-tag-green';

            const customerName = typeof item.customer === 'object' 
              ? (item.customer?.name || item.customer?.fullName || 'Khách hàng') 
              : (item.customer || 'Khách hàng');

            const avatarUrl = (typeof item.customer === 'object' ? item.customer?.avatar : item.avatar) 
              || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`;

            const totalVal = typeof item.total === 'number' 
              ? item.total 
              : (item.summary?.totalAmount || parseInt(item.total, 10) || 0);

            const itemsLabel = item.items 
              || (item.products?.length ? `${item.products.length} sản phẩm` : '1 sản phẩm');

            return (
              <div 
                key={item.id || item.orderId || `order-${idx}`} 
                className="order-row-item"
                onClick={() => handleOrderClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOrderClick(item)}
                title={`Xem chi tiết đơn hàng ${item.id}`}
              >
                <div className="customer-avatar-box">
                  <img src={avatarUrl} alt={customerName} className="customer-avatar" />
                </div>

                <div className="order-details-col">
                  <span className="order-code-text">{item.code || item.id}</span>
                  <span className="customer-name-text">{customerName}</span>
                </div>

                <div className="order-item-count-col">
                  <span className="item-count-text">{itemsLabel}</span>
                </div>

                <div className="order-price-col">
                  <span className="order-total-price">{(totalVal || 0).toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="order-status-col">
                  <span className={`status-pill-badge ${statusClass}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="widget-empty-state-box">
          <div className="empty-widget-icon-circle">
            <ShoppingBag size={24} className="empty-icon" />
          </div>
          <h4 className="empty-widget-title">Chưa có đơn hàng</h4>
          <p className="empty-widget-desc">
            Đơn hàng đầu tiên của bạn sẽ xuất hiện tại đây sau khi người mua đặt hàng.
          </p>
          {onOpenAddProductModal && (
            <button className="nav-btn-primary empty-widget-btn" onClick={onOpenAddProductModal}>
              <Plus size={15} /> Đăng sản phẩm đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
}
