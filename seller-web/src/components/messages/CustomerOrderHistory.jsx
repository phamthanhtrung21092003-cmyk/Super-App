import React from 'react';
import { Package, ArrowUpRight, ShoppingBag } from 'lucide-react';

export default function CustomerOrderHistory({ 
  orders = [], 
  onViewOrder 
}) {
  const displayOrders = orders.slice(0, 3);

  return (
    <div className="customer-order-history-card">
      <div className="history-card-header">
        <h4 className="history-title">
          <Package size={15} className="icon-blue" /> Lịch sử đơn hàng
        </h4>
        <span className="orders-count-tag">{orders.length} đơn</span>
      </div>

      <div className="history-orders-list">
        {displayOrders.length > 0 ? (
          displayOrders.map(order => {
            const code = order.code || order.id || '#VL000123';
            const total = order.summary?.totalAmount || order.total || 299000;
            const status = order.status || 'Đang giao';

            let statusClass = 'status-green';
            if (status === 'Chờ xác nhận' || status === 'Chờ lấy hàng') statusClass = 'status-orange';
            else if (status === 'Đang giao') statusClass = 'status-blue';
            else if (status === 'Đã hủy' || status === 'Trả hàng') statusClass = 'status-red';

            return (
              <div 
                key={order.id || code} 
                className="history-order-item"
                onClick={() => onViewOrder && onViewOrder(order)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewOrder && onViewOrder(order)}
                title="Nhấp để xem chi tiết đơn hàng này"
              >
                <div className="history-item-top">
                  <strong className="history-code">{code}</strong>
                  <span className={`history-status-pill ${statusClass}`}>
                    {status}
                  </span>
                </div>

                <div className="history-item-bottom">
                  <span className="history-amount">{total.toLocaleString('vi-VN')}đ</span>
                  <span className="history-action-link">
                    Chi tiết <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="history-empty-box">
            <ShoppingBag size={24} className="empty-sub-icon" />
            <p>Khách hàng chưa có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
