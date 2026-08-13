import React from 'react';
import { Calendar, Filter, Search, RotateCcw } from 'lucide-react';

export default function TransactionFilters({ 
  searchQuery, 
  onSearchChange, 
  dateRange, 
  onDateRangeChange,
  onResetFilters 
}) {
  return (
    <div className="finance-filters-bar">
      <div className="filter-controls-left">
        {/* Date Range Selector Button */}
        <div className="date-picker-input-group">
          <Calendar size={14} className="calendar-icon" />
          <input 
            type="text"
            className="date-range-field"
            value={dateRange || '07/05/2026 - 13/05/2026'}
            onChange={(e) => onDateRangeChange && onDateRangeChange(e.target.value)}
            placeholder="Từ ngày - Đến ngày"
          />
        </div>

        {/* Filter Popup Button */}
        <button className="filter-toggle-btn" onClick={() => alert('Mở bộ lọc tìm kiếm nâng cao...')}>
          <Filter size={14} /> Bộ lọc
        </button>

        {searchQuery && (
          <button className="reset-filter-btn" onClick={onResetFilters}>
            <RotateCcw size={13} /> Đặt lại
          </button>
        )}
      </div>

      <div className="filter-controls-right">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input 
            type="text"
            className="search-control-input"
            placeholder="🔍 Tìm kiếm giao dịch..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
