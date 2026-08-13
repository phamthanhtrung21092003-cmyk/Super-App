import React from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';

export default function PromotionFilters({
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
            placeholder="🔍 Tìm tên chương trình, mã chương trình..."
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
          <option value="Đang diễn ra">Đang diễn ra</option>
          <option value="Sắp diễn ra">Sắp diễn ra</option>
          <option value="Đã kết thúc">Đã kết thúc</option>
          <option value="Tạm dừng">Tạm dừng</option>
        </select>

        {/* Type Dropdown */}
        <select 
          className="modal-select-control"
          style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="Tất cả">Loại chương trình: Tất cả</option>
          <option value="Giảm giá sản phẩm">Giảm giá sản phẩm</option>
          <option value="Giảm giá toàn shop">Giảm giá toàn shop</option>
          <option value="Miễn phí vận chuyển">Miễn phí vận chuyển</option>
          <option value="Flash Sale">Flash Sale</option>
          <option value="Mua X tặng Y">Mua X tặng Y</option>
          <option value="Voucher">Voucher</option>
        </select>

        {/* Time Filter */}
        <div className="date-picker-input-group">
          <Calendar size={14} className="calendar-icon" />
          <input 
            type="text"
            className="date-range-field"
            style={{ width: '160px' }}
            value={timeFilter || 'Thời gian: Tất cả'}
            onChange={(e) => onTimeChange && onTimeChange(e.target.value)}
          />
        </div>

        <button className="filter-toggle-btn" onClick={() => alert('Mở bộ lọc khuyến mãi nâng cao...')}>
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
