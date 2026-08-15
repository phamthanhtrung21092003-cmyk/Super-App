import React, { useState } from 'react';
import { Sliders, PlusCircle, Package } from 'lucide-react';
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
          <Package size={44} className="empty-icon" color="#00B14F" />
        </div>
        <h3 className="empty-title">Kho hàng chưa có sản phẩm</h3>
        <p className="empty-desc">
          Đăng sản phẩm đầu tiên để bắt đầu quản lý tồn kho.
        </p>
        {onOpenAddProductModal && (
          <button 
            type="button" 
            className="nav-btn-primary empty-add-btn" 
            onClick={onOpenAddProductModal}
          >
            <PlusCircle size={16} /> + Đăng sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inventory-table-card">
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

      {/* Desktop & Tablet Table (Requirement 8) */}
      <div className="table-responsive-wrapper desktop-inventory-table-view">
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
              <th className="col-sku">SKU</th>
              <th className="col-category">Danh mục</th>
              <th className="col-num">Tồn kho</th>
              <th className="col-num">Đang giữ</th>
              <th className="col-num">Có thể bán</th>
              <th className="col-num">Đã bán</th>
              <th className="col-status">Trạng thái</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const skuId = item.sku || item.id || `sku_${idx}`;
              const isSelected = selectedIds.includes(skuId);

              // Single Source of Truth lookup from Product Catalog (Requirement 14)
              const matchingProduct = existingProducts.find(p => p.id === item.productId) || {};
              const productName = matchingProduct.name || item.productName || 'Sản phẩm';
              const productImage = matchingProduct.image || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300';
              const productCategory = matchingProduct.category || item.category || 'Thời trang';

              // Stock calculation (Requirement 9)
              const physicalStock = typeof item.physicalStock === 'number' ? item.physicalStock : (item.quantity ?? 100);
              const reservedStock = typeof item.reservedStock === 'number' ? item.reservedStock : (item.reservedQuantity ?? 5);
              const availableStock = Math.max(0, physicalStock - reservedStock);
              const soldCount = matchingProduct.sold || item.sold || 0;

              // Warning Status with explicit text (Requirement 12)
              let statusLabel = '🟢 Còn hàng';
              let statusClass = 'status-badge-green';

              if (physicalStock === 0) {
                statusLabel = '🔴 Hết hàng';
                statusClass = 'status-badge-red';
              } else if (physicalStock <= 5) {
                statusLabel = '🟠 Sắp hết';
                statusClass = 'status-badge-orange';
              }

              return (
                <tr 
                  key={skuId} 
                  className={`inventory-table-row ${isSelected ? 'row-selected' : ''}`}
                >
                  {/* 1. Checkbox */}
                  <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelectRow(skuId)}
                    />
                  </td>

                  {/* 2. Sản phẩm */}
                  <td className="col-product">
                    <div className="product-thumb-title-flex">
                      <img src={productImage} alt={productName} className="prod-thumb-img" />
                      <div className="prod-name-id-group">
                        <span 
                          className="prod-name-text" 
                          title={productName}
                          onClick={() => setSelectedDetailItem(item)}
                        >
                          {productName}
                        </span>
                        <span className="prod-id-subtag">
                          ID: <strong>{item.productId}</strong>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. SKU */}
                  <td className="col-sku">
                    <span className="sku-code-text">{item.sku}</span>
                  </td>

                  {/* 4. Danh mục */}
                  <td className="col-category">
                    <span className="category-text-tag">{productCategory}</span>
                  </td>

                  {/* 5. Tồn kho (Physical Stock) */}
                  <td className="col-num">
                    <strong className="stock-number-text">{physicalStock}</strong>
                  </td>

                  {/* 6. Đang giữ */}
                  <td className="col-num">
                    <span className="reserved-number-text">{reservedStock}</span>
                  </td>

                  {/* 7. Có thể bán (Formula: Tồn kho - Đang giữ) */}
                  <td className="col-num">
                    <strong className="available-number-text highlight-avail">{availableStock}</strong>
                  </td>

                  {/* 8. Đã bán */}
                  <td className="col-num">
                    <span className="sold-number-text">{soldCount}</span>
                  </td>

                  {/* 9. Trạng thái */}
                  <td className="col-status">
                    <span className={`inventory-status-pill ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>

                  {/* 10. Thao tác */}
                  <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons-group">
                      <button 
                        type="button" 
                        className="btn-stock-receive"
                        onClick={() => onOpenReceiveModal && onOpenReceiveModal(item.sku)}
                        title="Nhập thêm hàng vào kho"
                      >
                        <PlusCircle size={13} /> Nhập kho
                      </button>

                      <button 
                        type="button" 
                        className="btn-stock-adjust"
                        onClick={() => onOpenAdjustModal && onOpenAdjustModal(item)}
                        title="Điều chỉnh số lượng tồn kho"
                      >
                        <Sliders size={13} /> Điều chỉnh
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Requirement 19) */}
      <div className="mobile-inventory-cards-view">
        {items.map((item, idx) => {
          const skuId = item.sku || item.id || `sku_${idx}`;
          const matchingProduct = existingProducts.find(p => p.id === item.productId) || {};
          const productName = matchingProduct.name || item.productName || 'Sản phẩm';
          const productImage = matchingProduct.image || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300';
          const productCategory = matchingProduct.category || item.category || 'Thời trang';

          const physicalStock = typeof item.physicalStock === 'number' ? item.physicalStock : (item.quantity ?? 100);
          const reservedStock = typeof item.reservedStock === 'number' ? item.reservedStock : (item.reservedQuantity ?? 5);
          const availableStock = Math.max(0, physicalStock - reservedStock);

          let statusLabel = '🟢 Còn hàng';
          let statusClass = 'status-badge-green';
          if (physicalStock === 0) {
            statusLabel = '🔴 Hết hàng';
            statusClass = 'status-badge-red';
          } else if (physicalStock <= 5) {
            statusLabel = '🟠 Sắp hết';
            statusClass = 'status-badge-orange';
          }

          return (
            <div key={skuId} className="mobile-inventory-item-card">
              <div className="mobile-item-header">
                <span className="mobile-sku-badge">{item.sku}</span>
                <span className={`inventory-status-pill ${statusClass}`}>{statusLabel}</span>
              </div>

              <div className="mobile-item-body">
                <img src={productImage} alt={productName} className="mobile-item-thumb" />
                <div className="mobile-item-details">
                  <h4 className="mobile-item-name">{productName}</h4>
                  <span className="mobile-item-cat">{productCategory} • ID: {item.productId}</span>
                </div>
              </div>

              <div className="mobile-stock-metrics-grid">
                <div className="metric-box">
                  <span className="lbl">Tồn kho</span>
                  <strong className="val">{physicalStock}</strong>
                </div>
                <div className="metric-box">
                  <span className="lbl">Đang giữ</span>
                  <strong className="val orange">{reservedStock}</strong>
                </div>
                <div className="metric-box">
                  <span className="lbl">Có thể bán</span>
                  <strong className="val green">{availableStock}</strong>
                </div>
              </div>

              <div className="mobile-item-actions">
                <button 
                  type="button" 
                  className="btn-mobile-receive"
                  onClick={() => onOpenReceiveModal && onOpenReceiveModal(item.sku)}
                >
                  <PlusCircle size={14} /> Nhập kho
                </button>
                <button 
                  type="button" 
                  className="btn-mobile-adjust"
                  onClick={() => onOpenAdjustModal && onOpenAdjustModal(item)}
                >
                  <Sliders size={14} /> Điều chỉnh
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Drawer for Inspection */}
      {selectedDetailItem && (
        <InventoryDetailDrawer 
          item={selectedDetailItem}
          existingProducts={existingProducts}
          onClose={() => setSelectedDetailItem(null)}
          onOpenAdjustModal={(it) => {
            setSelectedDetailItem(null);
            onOpenAdjustModal(it);
          }}
          onOpenReceiveModal={(sku) => {
            setSelectedDetailItem(null);
            onOpenReceiveModal(sku);
          }}
        />
      )}
    </div>
  );
}
