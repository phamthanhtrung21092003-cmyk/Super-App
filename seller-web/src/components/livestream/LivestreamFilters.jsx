import React from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';

export default function LivestreamFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  timeFilter,
  onTimeChange,
  onResetFilters
}) {
  return (
    <div className="finance-filters-bar" style={{ marginTop: '12px' }}>
      <div className="filter-controls-left" style={{ flexWrap: 'wrap', gap: '10px' }}>
        {/* Search input */}
        <div className="search-input-wrapper" style={{ minWidth: '260px' }}>
          <Search size={15} className="search-icon" />
          <input 
            type="text"
            className="search-control-input"
            style={{ width: '100%' }}
            placeholder="🔍 Tìm tên livestream, chủ đề..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <select 
          className="modal-select-control" 
          style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="Tất cả">Trạng thái: Tất cả</option>
          <option value="Đang diễn ra">🔴 LIVE Đang diễn ra</option>
          <option value="Sắp diễn ra">⏱️ Sắp diễn ra</option>
          <option value="Đã kết thúc">⚫ Đã kết thúc</option>
          <option value="Đã hủy">🔴 Đã hủy</option>
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

        <button className="filter-toggle-btn" onClick={() => alert('Mở bộ lọc livestream nâng cao...')}>
          <Filter size={14} /> Bộ lọc
        </button>

        {(searchQuery || statusFilter !== 'Tất cả') && (
          <button className="reset-filter-btn" onClick={onResetFilters}>
            <RotateCcw size={13} /> Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
