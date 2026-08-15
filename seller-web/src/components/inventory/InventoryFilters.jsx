import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Check, X } from 'lucide-react';

export default function InventoryFilters({
  searchQuery = '',
  onSearchChange,
  stockStatusFilter = 'Tất cả',
  onStockStatusChange,
  categoryFilter = 'Tất cả',
  onCategoryChange,
  warehouseFilter = 'Tất cả',
  onWarehouseChange,
  stockRangeFilter = 'Tất cả',
  onStockRangeChange,
  categories = [],
  onResetFilters,
  onApplyFilters
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Temporary local states when panel is open
  const [tempStatus, setTempStatus] = useState(stockStatusFilter);
  const [tempCategory, setTempCategory] = useState(categoryFilter);
  const [tempWarehouse, setTempWarehouse] = useState(warehouseFilter);
  const [tempStockRange, setTempStockRange] = useState(stockRangeFilter);

  const handleOpenPanel = () => {
    setTempStatus(stockStatusFilter);
    setTempCategory(categoryFilter);
    setTempWarehouse(warehouseFilter);
    setTempStockRange(stockRangeFilter);
    setIsPanelOpen(!isPanelOpen);
  };

  const handleApply = () => {
    if (onStockStatusChange) onStockStatusChange(tempStatus);
    if (onCategoryChange) onCategoryChange(tempCategory);
    if (onWarehouseChange) onWarehouseChange(tempWarehouse);
    if (onStockRangeChange) onStockRangeChange(tempStockRange);
    if (onApplyFilters) onApplyFilters();
    setIsPanelOpen(false);
  };

  const handleReset = () => {
    setTempStatus('Tất cả');
    setTempCategory('Tất cả');
    setTempWarehouse('Tất cả');
    setTempStockRange('Tất cả');
    if (onResetFilters) onResetFilters();
    setIsPanelOpen(false);
  };

  const hasActiveFilters = searchQuery !== '' || 
    stockStatusFilter !== 'Tất cả' || 
    categoryFilter !== 'Tất cả' || 
    warehouseFilter !== 'Tất cả' || 
    stockRangeFilter !== 'Tất cả';

  return (
    <div className="inventory-filters-wrapper">
      <div className="inventory-filters-row">
        {/* Search Input (Requirement 6) */}
        <div className="inventory-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="🔍 Tìm tên sản phẩm, SKU…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Dropdowns & Buttons */}
        <div className="inventory-dropdowns-group">
          {/* Quick Status Select */}
          <div className="filter-select-wrapper">
            <label className="filter-select-label">Trạng thái:</label>
            <div className="select-inner-box">
              <select 
                value={stockStatusFilter} 
                onChange={(e) => onStockStatusChange(e.target.value)}
                className="filter-select"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Còn hàng">🟢 Còn hàng (&gt; 5)</option>
                <option value="Sắp hết">🟠 Sắp hết hàng (≤ 5)</option>
                <option value="Hết hàng">🔴 Hết hàng (= 0)</option>
              </select>
              <ChevronDown size={14} className="select-chevron" />
            </div>
          </div>

          {/* Quick Category Select */}
          <div className="filter-select-wrapper">
            <label className="filter-select-label">Danh mục:</label>
            <div className="select-inner-box">
              <select 
                value={categoryFilter} 
                onChange={(e) => onCategoryChange(e.target.value)}
                className="filter-select"
              >
                <option value="Tất cả">Tất cả danh mục</option>
                {categories && categories.length > 0 ? (
                  categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))
                ) : (
                  <>
                    <option value="Thời trang nam">Thời trang nam</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Thiết bị điện tử">Thiết bị điện tử</option>
                    <option value="Giày dép">Giày dép</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </>
                )}
              </select>
              <ChevronDown size={14} className="select-chevron" />
            </div>
          </div>

          {/* Advanced Filter Button */}
          <button 
            type="button" 
            className={`filter-btn-secondary ${isPanelOpen ? 'active' : ''} ${hasActiveFilters ? 'has-badge' : ''}`}
            onClick={handleOpenPanel}
          >
            <Filter size={15} /> Bộ lọc
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button 
              type="button" 
              className="filter-btn-icon" 
              onClick={handleReset} 
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filter Panel (Requirement 7) */}
      {isPanelOpen && (
        <div className="inventory-advanced-filter-panel">
          <div className="filter-panel-grid">
            {/* 1. Trạng thái */}
            <div className="filter-field-col">
              <label className="filter-field-label">Trạng thái tồn kho</label>
              <select 
                value={tempStatus} 
                onChange={(e) => setTempStatus(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Còn hàng">🟢 Còn hàng (&gt; 5)</option>
                <option value="Sắp hết">🟠 Sắp hết hàng (≤ 5)</option>
                <option value="Hết hàng">🔴 Hết hàng (= 0)</option>
              </select>
            </div>

            {/* 2. Danh mục */}
            <div className="filter-field-col">
              <label className="filter-field-label">Danh mục sản phẩm</label>
              <select 
                value={tempCategory} 
                onChange={(e) => setTempCategory(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả danh mục</option>
                <option value="Thời trang nam">Thời trang nam</option>
                <option value="Thời trang">Thời trang</option>
                <option value="Thiết bị điện tử">Thiết bị điện tử</option>
                <option value="Giày dép">Giày dép</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </select>
            </div>

            {/* 3. Kho lấy hàng */}
            <div className="filter-field-col">
              <label className="filter-field-label">Kho lưu trữ</label>
              <select 
                value={tempWarehouse} 
                onChange={(e) => setTempWarehouse(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả kho</option>
                <option value="Kho Tổng Hà Nội">Kho Tổng Hà Nội</option>
                <option value="Kho Tổng TP.HCM">Kho Tổng TP.HCM</option>
                <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
              </select>
            </div>

            {/* 4. Khoảng tồn kho */}
            <div className="filter-field-col">
              <label className="filter-field-label">Khoảng tồn kho</label>
              <select 
                value={tempStockRange} 
                onChange={(e) => setTempStockRange(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả số lượng</option>
                <option value="under10">Dưới 10 sản phẩm</option>
                <option value="10to50">Từ 10 - 50 sản phẩm</option>
                <option value="above50">Trên 50 sản phẩm</option>
              </select>
            </div>
          </div>

          {/* Action Buttons: [ Áp dụng ] & [ Đặt lại ] */}
          <div className="filter-panel-actions-row">
            <button 
              type="button" 
              className="btn-filter-reset" 
              onClick={handleReset}
            >
              <RotateCcw size={14} /> Đặt lại
            </button>
            <button 
              type="button" 
              className="btn-filter-apply" 
              onClick={handleApply}
            >
              <Check size={15} /> Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
