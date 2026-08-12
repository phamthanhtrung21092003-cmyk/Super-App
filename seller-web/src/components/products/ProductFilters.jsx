import React from 'react';
import { Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';

export default function ProductFilters({ 
  searchQuery, 
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange
}) {
  const categories = [
    'Tất cả danh mục',
    'Thời trang',
    'Điện thoại',
    'Phụ kiện',
    'Giày dép',
    'Mỹ phẩm',
    'Đồ gia dụng'
  ];

  const statuses = [
    'Tất cả',
    'Đang bán',
    'Tạm ẩn',
    'Hết hàng',
    'Bản nháp'
  ];

  return (
    <div className="product-filters-toolbar">
      {/* Search Input Box */}
      <div className="filter-search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm theo tên, SKU, ID..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search-input"
        />
      </div>

      {/* Dropdown Filters Group */}
      <div className="filter-dropdowns-group">
        {/* Category Select */}
        <div className="filter-select-wrapper">
          <label className="select-label">Danh mục</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-stylish-select"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status Select */}
        <div className="filter-select-wrapper">
          <label className="select-label">Trạng thái</label>
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="filter-stylish-select"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Filter Trigger Button */}
        <button className="nav-btn-secondary filter-btn">
          <Filter size={16} /> Bộ lọc
        </button>

        {/* Sort Select */}
        <div className="filter-select-wrapper">
          <label className="select-label">Sắp xếp</label>
          <select 
            value={sortOrder} 
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="sold_desc">Bán chạy nhất</option>
          </select>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="view-mode-switch">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Hiển thị dạng danh sách"
          >
            <LayoutList size={16} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Hiển thị dạng lưới"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
