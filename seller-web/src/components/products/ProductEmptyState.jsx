import React from 'react';
import { Package, Plus } from 'lucide-react';

export default function ProductEmptyState({ onOpenAddProductModal }) {
  return (
    <div className="product-table-empty-box">
      <div className="empty-illustration-container">
        <div className="empty-box-icon-bg">
          <Package size={48} className="open-box-icon" />
        </div>
      </div>

      <h3 className="empty-heading-title">Bạn chưa có sản phẩm nào</h3>
      <p className="empty-heading-desc">
        Hãy thêm sản phẩm đầu tiên để bắt đầu bán hàng trên S-Shopping.
      </p>

      <button 
        className="nav-btn-primary empty-add-product-btn"
        onClick={onOpenAddProductModal}
      >
        <Plus size={18} /> Thêm sản phẩm đầu tiên
      </button>
    </div>
  );
}
