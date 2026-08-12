import React, { useState } from 'react';
import { Edit3, Clock, MoreHorizontal, Plus, Warehouse } from 'lucide-react';

export default function InventoryTable({ 
  items = [], 
  onOpenAdjustModal, 
  onOpenHistoryModal,
  onOpenAddProductModal,
  isNewShopState
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="inventory-empty-card">
        <div className="empty-icon-circle">
          <Warehouse size={36} className="empty-icon" />
        </div>
        <h3 className="empty-title">Kho hàng đang trống</h3>
        <p className="empty-desc">
          Đăng sản phẩm đầu tiên để bắt đầu quản lý tồn kho.
        </p>
        {onOpenAddProductModal && (
          <button className="nav-btn-primary empty-add-btn" onClick={onOpenAddProductModal}>
            <Plus size={16} /> + Thêm sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inventory-table-card">
      <div className="table-responsive-wrapper">
        <table className="inventory-data-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả sản phẩm trong kho"
                />
              </th>
              <th className="col-product">Sản phẩm</th>
              <th className="col-sku">SKU</th>
              <th className="col-category">Danh mục</th>
              <th className="col-warehouse">Kho</th>
              <th className="col-num">Tồn kho</th>
              <th className="col-num">Đã đặt</th>
              <th className="col-num">Khả dụng</th>
              <th className="col-cost">Giá vốn</th>
              <th className="col-val">Giá trị tồn kho</th>
              <th className="col-status">Trạng thái</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const available = Math.max(0, (item.quantity || 0) - (item.reservedQuantity || 0));
              const value = (item.quantity || 0) * (item.costPrice || 0);

              // Status badge colors
              let statusText = 'Tồn kho tốt';
              let badgeStyle = { color: '#00B14F', backgroundColor: '#E6F4EA' };

              if (item.quantity <= 0) {
                statusText = 'Hết hàng';
                badgeStyle = { color: '#EF4444', backgroundColor: '#FEF2F2' };
              } else if (item.quantity <= 30) {
                statusText = 'Sắp hết hàng';
                badgeStyle = { color: '#F97316', backgroundColor: '#FFF7ED' };
              }

              return (
                <tr key={item.id} className={isSelected ? 'selected-row' : ''}>
                  <td className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelectRow(item.id)}
                      aria-label={`Chọn ${item.productName}`}
                    />
                  </td>

                  <td className="col-product">
                    <div className="product-cell-flex">
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"} 
                        alt={item.productName} 
                        className="product-thumb-img"
                      />
                      <div className="product-meta-text">
                        <span className="product-name-title">{item.productName}</span>
                        <span className="product-id-tag">ID: {item.productId?.toUpperCase() || item.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="col-sku">
                    <span className="sku-code-text">{item.sku}</span>
                  </td>

                  <td className="col-category">
                    <span className="category-text">{item.category}</span>
                  </td>

                  <td className="col-warehouse">
                    <span className="warehouse-name-tag">{item.warehouseName || 'Kho chính'}</span>
                  </td>

                  <td className="col-num font-weight-bold">
                    {item.quantity}
                  </td>

                  <td className="col-num text-muted">
                    {item.reservedQuantity || 0}
                  </td>

                  <td className="col-num available-green-val">
                    {available}
                  </td>

                  <td className="col-cost">
                    {(item.costPrice || 0).toLocaleString('vi-VN')}đ
                  </td>

                  <td className="col-val font-weight-bold">
                    {value.toLocaleString('vi-VN')}đ
                  </td>

                  <td className="col-status">
                    <span className="stock-status-badge" style={badgeStyle}>
                      {statusText}
                    </span>
                  </td>

                  <td className="col-actions">
                    <div className="row-actions-group">
                      <button 
                        className="action-icon-btn" 
                        title="Điều chỉnh tồn kho"
                        onClick={() => onOpenAdjustModal(item)}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button 
                        className="action-icon-btn" 
                        title="Lịch sử xuất nhập kho"
                        onClick={() => onOpenHistoryModal(item)}
                      >
                        <Clock size={15} />
                      </button>

                      <button className="action-icon-btn" title="Thao tác khác">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination-footer">
        <span className="pagination-info-text">
          Hiển thị 1 - {items.length} của {items.length} sản phẩm
        </span>

        <div className="pagination-controls-group">
          <button className="page-nav-btn" disabled>&lt;</button>
          <button className="page-num-btn active">1</button>
          <button className="page-nav-btn" disabled>&gt;</button>

          <select className="page-size-select" defaultValue="10">
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </select>
        </div>
      </div>
    </div>
  );
}
