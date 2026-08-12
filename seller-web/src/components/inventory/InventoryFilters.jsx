import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';

export default function InventoryFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockStatusFilter,
  onStockStatusChange,
  warehouseFilter,
  onWarehouseChange,
  warehouses = [],
  onResetFilters
}) {
  return (
    <div className="inventory-filters-row">
      {/* Search Input Box */}
      <div className="inventory-search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm, SKU, mã vạch..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="inventory-dropdowns-group">
        {/* Category Select */}
        <div className="filter-select-wrapper">
          <label className="filter-select-label">Danh mục</label>
          <div className="select-inner-box">
            <select 
              value={categoryFilter} 
              onChange={(e) => onCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="Tất cả">Tất cả danh mục</option>
              <option value="Thời trang nam">Thời trang nam</option>
              <option value="Giày dép">Giày dép</option>
              <option value="Phụ kiện">Phụ kiện</option>
              <option value="Thiết bị điện tử">Thiết bị điện tử</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>

        {/* Stock Status Select */}
        <div className="filter-select-wrapper">
          <label className="filter-select-label">Trạng thái tồn kho</label>
          <div className="select-inner-box">
            <select 
              value={stockStatusFilter} 
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="filter-select"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Tồn kho tốt">Tồn kho tốt</option>
              <option value="Sắp hết hàng">Sắp hết hàng</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>

        {/* Warehouse Select */}
        <div className="filter-select-wrapper">
          <label className="filter-select-label">Kho</label>
          <div className="select-inner-box">
            <select 
              value={warehouseFilter} 
              onChange={(e) => onWarehouseChange(e.target.value)}
              className="filter-select"
            >
              <option value="Tất cả">Tất cả kho</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>

        {/* Action Buttons */}
        <button className="filter-btn-secondary" title="Bộ lọc nâng cao">
          <SlidersHorizontal size={15} /> Bộ lọc
        </button>

        <button className="filter-btn-icon" onClick={onResetFilters} title="Làm mới bộ lọc">
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
