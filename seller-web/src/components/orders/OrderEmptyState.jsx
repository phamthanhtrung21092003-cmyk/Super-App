import React from 'react';
import { ShoppingCart, Plus, HelpCircle } from 'lucide-react';

export default function OrderEmptyState({ onNavigateToProducts }) {
  return (
    <div className="order-table-empty-box">
      <div className="empty-illustration-container">
        <div className="empty-box-icon-bg">
          <ShoppingCart size={48} className="clipboard-icon" color="#00B14F" />
        </div>
      </div>

      <h3 className="empty-heading-title">Chưa có đơn hàng</h3>
      <p className="empty-heading-desc">
        Đơn hàng của khách sẽ xuất hiện tại đây khi Shop bắt đầu có đơn đầu tiên.
      </p>

      <div className="empty-actions-row">
        <button 
          type="button"
          className="nav-btn-primary empty-add-product-btn"
          onClick={onNavigateToProducts}
        >
          <Plus size={16} /> Đăng sản phẩm
        </button>

        <button 
          type="button"
          className="nav-btn-secondary empty-guide-btn"
          onClick={() => alert('Đang mở Trung tâm Trợ giúp người bán S-SHOPPING.')}
        >
          <HelpCircle size={15} /> Tìm hiểu thêm
        </button>
      </div>
    </div>
  );
}
