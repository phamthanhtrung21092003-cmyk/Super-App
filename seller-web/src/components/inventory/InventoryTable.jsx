import React, { useState } from 'react';
import { Sliders, PlusCircle, Eye, Package, Clock } from 'lucide-react';
import InventoryBulkActions from './InventoryBulkActions';
import InventoryDetailDrawer from './InventoryDetailDrawer';

export default function InventoryTable({ 
  items = [], 
  existingProducts = [],
  onOpenReceiveModal,
  onOpenAdjustModal, 
  onOpenAddProductModal,
  onBulkAction
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.sku || i.id));
    }
  };

  const toggleSelectRow = (skuOrId) => {
    if (selectedIds.includes(skuOrId)) {
      setSelectedIds(selectedIds.filter(i => i !== skuOrId));
    } else {
      setSelectedIds([...selectedIds, skuOrId]);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="inventory-empty-card">
        <div className="empty-icon-circle">
          <Package size={36} className="empty-icon" />
        </div>
        <h3 className="empty-title">Kho hàng chưa có sản phẩm</h3>
        <p className="empty-desc">
          Đăng sản phẩm đầu tiên để bắt đầu quản lý tồn kho trên S-SHOPPING Kênh Người Bán.
        </p>
        {onOpenAddProductModal && (
          <button className="nav-btn-primary empty-add-btn" onClick={onOpenAddProductModal}>
            + Đăng sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inventory-table-card" style={{ position: 'relative' }}>
      {/* Floating Bulk Action Bar */}
      <InventoryBulkActions 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkAdjust={() => {
          const valStr = prompt(`Cập nhật số lượng tồn thực tế cho ${selectedIds.length} SKU đã chọn:`);
          if (valStr !== null && onBulkAction) {
            onBulkAction('adjust', selectedIds, parseInt(valStr, 10));
            setSelectedIds([]);
          }
        }}
        onBulkExport={() => {
          alert(`📥 Đã xuất báo cáo tồn kho Excel cho ${selectedIds.length} SKU đã chọn.`);
        }}
      />

      <div className="table-responsive-wrapper">
        <table className="inventory-data-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="col-product">Sản phẩm</th>
              <th className="col-pid">Product ID</th>
              <th className="col-sku">SKU</th>
              <th className="col-variant">Phân loại</th>
              <th className="col-num">Tồn thực tế</th>
              <th className="col-num">Đang giữ</th>
              <th className="col-num">Có thể bán</th>
              <th className="col-num">Đã bán</th>
              <th className="col-status">Trạng thái</th>
              <th className="col-date">Cập nhật</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const skuId = item.sku || item.id || `sku_${idx}`;
              const isSelected = selectedIds.includes(skuId);

              // Single Source of Truth lookup from Product Catalog
              const matchingProduct = existingProducts.find(p => p.id === item.productId) || {};
              const productName = item.productName || matchingProduct.name || item.name || 'Áo thun nam basic';
              const productImage = item.image || matchingProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300';
              const productId = item.productId || matchingProduct.id || 'p2';
              const variant = item.variant || item.variants || 'Đen / M';

              const physicalStock = item.physicalStock !== undefined ? item.physicalStock : (item.quantity || 128);
              const reservedStock = item.reservedStock !== undefined ? item.reservedStock : (item.reservedQuantity || 12);
              const availableStock = Math.max(0, physicalStock - reservedStock);
              const soldQuantity = item.soldQuantity !== undefined ? item.soldQuantity : (item.sold || 1245);
              const minimumStock = item.minimumStock || 10;

              // Status badge logic
              let statusText = '🟢 Còn hàng';
              let badgeClass = 'status-tag-green';

              if (availableStock === 0) {
                statusText = '🔴 Hết hàng';
                badgeClass = 'status-tag-red';
              } else if (availableStock <= minimumStock) {
                statusText = '🟠 Sắp hết';
                badgeClass = 'status-tag-yellow';
              }

              const fullItemObj = {
                ...item,
                productName,
                image: productImage,
                productId,
                variant,
                physicalStock,
                reservedStock,
                availableStock,
                soldQuantity,
                minimumStock
              };

              return (
                <tr key={skuId} className={isSelected ? 'selected-row' : ''}>
                  <td className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelectRow(skuId)}
                    />
                  </td>

                  {/* Product Thumb & Title */}
                  <td className="col-product">
                    <div className="inv-product-cell">
                      <img src={productImage} alt={productName} className="inv-item-thumb" />
                      <span 
                        className="inv-item-title clickable-title"
                        onClick={() => setSelectedDetailItem(fullItemObj)}
                        title={productName}
                      >
                        {productName}
                      </span>
                    </div>
                  </td>

                  {/* Product ID */}
                  <td className="col-pid">
                    <code className="monospace-tag">{productId}</code>
                  </td>

                  {/* SKU */}
                  <td className="col-sku">
                    <span className="product-sku-code">{item.sku || 'ATB-BLK-M'}</span>
                  </td>

                  {/* Phân loại Variant */}
                  <td className="col-variant">
                    <span className="variant-tag-text">{variant}</span>
                  </td>

                  {/* Tồn thực tế */}
                  <td className="col-num">
                    <strong className="physical-stock-val">{physicalStock}</strong>
                  </td>

                  {/* Đang giữ */}
                  <td className="col-num">
                    <span className="reserved-stock-val">{reservedStock}</span>
                  </td>

                  {/* Có thể bán = Physical - Reserved */}
                  <td className="col-num">
                    <strong className={`available-stock-val ${availableStock === 0 ? 'zero' : ''}`}>
                      {availableStock}
                    </strong>
                  </td>

                  {/* Đã bán */}
                  <td className="col-num">
                    <span className="sold-val-text">{soldQuantity}</span>
                  </td>

                  {/* Trạng thái */}
                  <td className="col-status">
                    <span className={`product-status-badge ${badgeClass}`}>
                      {statusText}
                    </span>
                  </td>

                  {/* Cập nhật */}
                  <td className="col-date">
                    <span className="created-date-text">{item.updatedAt || '13/08/2026'}</span>
                  </td>

                  {/* Thao tác */}
                  <td className="col-actions">
                    <div className="row-actions-group" style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="row-action-btn view-btn"
                        onClick={() => setSelectedDetailItem(fullItemObj)}
                        title="Xem chi tiết tồn kho SKU"
                      >
                        <Eye size={15} />
                      </button>

                      <button 
                        className="row-action-btn edit-btn"
                        onClick={() => onOpenAdjustModal(fullItemObj)}
                        title="Điều chỉnh tồn kho"
                      >
                        <Sliders size={15} />
                      </button>

                      <button 
                        className="row-action-btn toggle-btn"
                        onClick={() => onOpenReceiveModal(item.sku)}
                        title="Nhập kho nhanh SKU này"
                      >
                        <PlusCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inventory Detail Drawer */}
      {selectedDetailItem && (
        <InventoryDetailDrawer 
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onOpenReceive={(sku) => {
            setSelectedDetailItem(null);
            onOpenReceiveModal(sku);
          }}
          onOpenAdjust={(it) => {
            setSelectedDetailItem(null);
            onOpenAdjustModal(it);
          }}
        />
      )}
    </div>
  );
}
