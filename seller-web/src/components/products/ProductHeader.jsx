import React from 'react';
import { Plus, Upload } from 'lucide-react';

export default function ProductHeader({ onOpenAddProductModal }) {
  return (
    <div className="product-module-header">
      <div className="product-module-title-group">
        <h1 className="product-module-main-heading">Sản phẩm</h1>
        <p className="product-module-sub-heading">
          Quản lý tất cả sản phẩm trong cửa hàng của bạn. Thêm, chỉnh sửa, ẩn/hiện hoặc xóa sản phẩm.
        </p>
      </div>

      <div className="product-module-actions-group">
        <button 
          className="nav-btn-secondary import-products-btn"
          title="Nhập sản phẩm từ file Excel/CSV"
        >
          <Upload size={16} /> Nhập sản phẩm
        </button>

        <button 
          className="nav-btn-primary add-product-main-btn"
          onClick={onOpenAddProductModal}
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>
    </div>
  );
}
