import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ShoppingBag, Plus } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function RecentOrders({ existingOrders = [], onNavigateToOrders, onOpenAddProductModal }) {
  const [ordersList, setOrdersList] = useState([]);

  useEffect(() => {
    sellerService.getRecentOrders(existingOrders, 5).then(data => setOrdersList(data));
  }, [existingOrders]);

  const handleOrderClick = (order) => {
    if (onNavigateToOrders) {
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
          {ordersList.map(item => {
            let statusClass = 'status-tag-default';
            if (item.status === 'Chờ xác nhận') statusClass = 'status-tag-orange';
            if (item.status === 'Đang giao') statusClass = 'status-tag-blue';
            if (item.status === 'Chờ lấy hàng') statusClass = 'status-tag-purple';
            if (item.status === 'Hoàn thành') statusClass = 'status-tag-green';

            return (
              <div 
                key={item.id} 
                className="order-row-item"
                onClick={() => handleOrderClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOrderClick(item)}
                title={`Xem chi tiết đơn hàng ${item.id}`}
              >
                <div className="customer-avatar-box">
                  <img src={item.avatar} alt={item.customer} className="customer-avatar" />
                </div>

                <div className="order-details-col">
                  <span className="order-code-text">{item.id}</span>
                  <span className="customer-name-text">{item.customer}</span>
                </div>

                <div className="order-item-count-col">
                  <span className="item-count-text">{item.items}</span>
                </div>

                <div className="order-price-col">
                  <span className="order-total-price">{item.total.toLocaleString('vi-VN')}đ</span>
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
