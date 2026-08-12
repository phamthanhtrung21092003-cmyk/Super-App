import React from 'react';
import { ClipboardList, Plus, BookOpen } from 'lucide-react';

export default function OrderEmptyState({ onNavigateToProducts }) {
  return (
    <div className="order-table-empty-box">
      <div className="empty-illustration-container">
        <div className="empty-box-icon-bg">
          <ClipboardList size={44} className="clipboard-icon" />
        </div>
      </div>

      <h3 className="empty-heading-title">Chưa có đơn hàng nào</h3>
      <p className="empty-heading-desc">
        Đơn hàng mới sẽ tự động xuất hiện tại đây khi khách hàng chốt đơn mua sản phẩm của bạn trên S-Shopping.
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
          onClick={() => alert('Đang mở Hướng dẫn tối ưu Gian hàng & Bán hàng hiệu quả trên S-Shopping!')}
        >
          <BookOpen size={16} /> Xem hướng dẫn
        </button>
      </div>
    </div>
  );
}
