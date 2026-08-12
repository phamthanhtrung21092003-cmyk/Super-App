import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

export default function OrderFilters({ 
  searchQuery, 
  onSearchChange,
  dateRange,
  onDateRangeChange,
  providerFilter,
  onProviderChange,
  onResetFilters
}) {
  return (
    <div className="order-filters-toolbar">
      {/* Search Input */}
      <div className="filter-search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm kiếm đơn hàng, mã đơn, tên khách hàng, SĐT..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search-input"
        />
      </div>

      {/* Filter Options Group */}
      <div className="filter-options-group">
        {/* Date Range Picker */}
        <div className="date-picker-button-wrapper">
          <Calendar size={15} className="calendar-icon" />
          <span className="date-range-text">01/08/2026 - 11/08/2026</span>
        </div>

        {/* Channel Select */}
        <select className="filter-stylish-select">
          <option value="all">Tất cả kênh</option>
          <option value="app">S-Shopping App</option>
          <option value="web">S-Shopping Web</option>
          <option value="livestream">V-life Livestream</option>
        </select>

        {/* Shipping Provider Select */}
        <select 
          value={providerFilter} 
          onChange={(e) => onProviderChange(e.target.value)}
          className="filter-stylish-select"
        >
          <option value="Tất cả">Tất cả vận chuyển</option>
          <option value="GHN">Giao Hàng Nhanh (GHN)</option>
          <option value="J&T">J&T Express</option>
          <option value="Viettel Post">Viettel Post</option>
        </select>

        {/* Filter Trigger Button */}
        <button className="nav-btn-secondary filter-btn">
          <Filter size={15} /> Bộ lọc
        </button>

        {/* Clear Filters Button */}
        {(searchQuery || providerFilter !== 'Tất cả') && (
          <button 
            className="clear-filter-link-btn"
            onClick={onResetFilters}
          >
            <X size={14} /> Xóa lọc
          </button>
        )}
      </div>
    </div>
  );
}
