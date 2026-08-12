import React, { useState } from 'react';
import ProductRow from './ProductRow';
import ProductEmptyState from './ProductEmptyState';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function ProductTable({ 
  products = [], 
  onOpenAddProductModal,
  onEditProduct,
  onToggleStatusProduct,
  onDeleteProduct 
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const hasProducts = products && products.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="product-table-card-container">
      {hasProducts ? (
        <>
          <div className="table-responsive-wrapper">
            <table className="product-data-table">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="col-product-info">Sản phẩm</th>
                  <th className="col-sku">SKU</th>
                  <th className="col-price">Giá</th>
                  <th className="col-stock">Tồn kho</th>
                  <th className="col-sold">Đã bán</th>
                  <th className="col-status">Trạng thái</th>
                  <th className="col-date">Ngày tạo ▼</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {products.map(product => (
                  <ProductRow 
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.includes(product.id)}
                    onToggleSelect={handleToggleSelect}
                    onEdit={onEditProduct}
                    onToggleStatus={onToggleStatusProduct}
                    onDelete={onDeleteProduct}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="table-pagination-footer">
            <div className="pagination-info-text">
              Hiển thị 1 - {products.length} của {products.length} sản phẩm
            </div>

            <div className="pagination-controls-group">
              <button className="page-nav-btn" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="page-number-btn active">1</button>
              <button className="page-nav-btn" disabled>
                <ChevronRight size={16} />
              </button>

              <div className="page-size-selector">
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <ProductEmptyState onOpenAddProductModal={onOpenAddProductModal} />
      )}
    </div>
  );
}
