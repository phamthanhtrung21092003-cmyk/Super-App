import React from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';

export default function VideoFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  timeFilter,
  onTimeChange,
  onResetFilters
}) {
  return (
    <div className="finance-filters-bar" style={{ marginTop: '12px' }}>
      <div className="filter-controls-left" style={{ flexWrap: 'wrap', gap: '10px' }}>
        {/* Search input */}
        <div className="search-input-wrapper" style={{ minWidth: '240px' }}>
          <Search size={15} className="search-icon" />
          <input 
            type="text"
            className="search-control-input"
            style={{ width: '100%' }}
            placeholder="🔍 Tìm tên video, mô tả, sản phẩm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <select 
          className="modal-select-control" 
          style={{ width: '140px', padding: '6px 10px', fontSize: '12px' }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="Tất cả">Trạng thái: Tất cả</option>
          <option value="Đã đăng">Đã đăng</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Tạm ẩn">Tạm ẩn</option>
          <option value="Vi phạm">Vi phạm</option>
        </select>

        {/* Type Dropdown */}
        <select 
          className="modal-select-control"
          style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="Tất cả">Loại video: Tất cả</option>
          <option value="Video ngắn">Video ngắn</option>
          <option value="Video dài">Video dài</option>
          <option value="Livestream">Livestream</option>
          <option value="Affiliate">Affiliate</option>
        </select>

        {/* Time Filter */}
        <div className="date-picker-input-group">
          <Calendar size={14} className="calendar-icon" />
          <input 
            type="text"
            className="date-range-field"
            style={{ width: '150px' }}
            value={timeFilter || '7 ngày qua'}
            onChange={(e) => onTimeChange && onTimeChange(e.target.value)}
          />
        </div>

        <button className="filter-toggle-btn" onClick={() => alert('Mở bộ lọc video nâng cao...')}>
          <Filter size={14} /> Bộ lọc
        </button>

        {(searchQuery || statusFilter !== 'Tất cả' || typeFilter !== 'Tất cả') && (
          <button className="reset-filter-btn" onClick={onResetFilters}>
            <RotateCcw size={13} /> Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
