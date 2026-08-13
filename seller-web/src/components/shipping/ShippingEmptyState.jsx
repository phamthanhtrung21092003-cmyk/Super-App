import React from 'react';
import { Truck, Plus, BookOpen } from 'lucide-react';

export default function ShippingEmptyState({ onNavigateToProducts }) {
  return (
    <div className="shipping-empty-box">
      <div className="empty-illustration-container">
        <div className="empty-box-icon-bg">
          <Truck size={48} className="truck-empty-icon" />
        </div>
      </div>

      <h3 className="empty-heading-title">Chưa có đơn vận chuyển</h3>
      <p className="empty-heading-desc">
        Khi khách hàng đặt mua sản phẩm, các đơn hàng cần xử lý vận chuyển sẽ tự động xuất hiện tại đây.
      </p>

      <div className="empty-actions-row">
        <button 
          className="nav-btn-primary empty-add-product-btn"
          onClick={onNavigateToProducts}
        >
          <Plus size={16} /> Đăng sản phẩm đầu tiên
        </button>

        <button 
          className="nav-btn-secondary empty-guide-btn"
          onClick={() => alert('Đang mở Hướng dẫn cấu hình đơn vị vận chuyển & Giao nhận hàng S-Shopping!')}
        >
          <BookOpen size={16} /> Xem hướng dẫn vận chuyển
        </button>
      </div>
    </div>
  );
}
