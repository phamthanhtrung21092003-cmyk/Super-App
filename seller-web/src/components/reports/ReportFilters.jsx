import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

export default function ReportFilters({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  comparison,
  onComparisonChange,
  store,
  onStoreChange,
  category,
  onCategoryChange,
  onResetFilters
}) {
  return (
    <div className="finance-filters-bar" style={{ marginTop: '12px' }}>
      <div className="filter-controls-left" style={{ flexWrap: 'wrap', gap: '10px' }}>
        {/* Date range display */}
        <div className="date-picker-input-group">
          <Calendar size={14} className="calendar-icon" />
          <input 
            type="text"
            className="date-range-field"
            style={{ width: '170px' }}
            value={dateRange || '07/08/2026 - 13/08/2026'}
            onChange={(e) => onDateRangeChange && onDateRangeChange(e.target.value)}
          />
        </div>

        {/* Period Presets */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-page)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {['7d', '30d', '90d', 'custom'].map(p => (
            <button 
              key={p} 
              className={`status-tag ${period === p ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
              onClick={() => onPeriodChange(p)}
            >
              {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : p === '90d' ? '90 ngày' : 'Tùy chọn'}
            </button>
          ))}
        </div>

        {/* Comparison Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>So sánh với:</span>
          <select 
            className="modal-select-control" 
            style={{ width: '130px', padding: '6px 10px', fontSize: '12px' }}
            value={comparison}
            onChange={(e) => onComparisonChange(e.target.value)}
          >
            <option value="previous_period">Kỳ trước (7 ngày trước)</option>
            <option value="previous_year">Cùng kỳ năm ngoái</option>
          </select>
        </div>

        {/* Store Dropdown */}
        <select 
          className="modal-select-control" 
          style={{ width: '140px', padding: '6px 10px', fontSize: '12px' }}
          value={store}
          onChange={(e) => onStoreChange(e.target.value)}
        >
          <option value="all">Tất cả cửa hàng</option>
          <option value="shop_hcm">Shop HCM Main Store</option>
          <option value="shop_hn">Shop Hà Nội Branch</option>
        </select>

        {/* Category Dropdown */}
        <select 
          className="modal-select-control" 
          style={{ width: '140px', padding: '6px 10px', fontSize: '12px' }}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          <option value="fashion">Thời trang nam</option>
          <option value="shoes">Giày dép</option>
          <option value="accessories">Phụ kiện</option>
        </select>

        <button className="filter-toggle-btn" onClick={() => alert('Mở bộ lọc báo cáo chuyên sâu...')}>
          <Filter size={14} /> Bộ lọc
        </button>

        {(period !== '7d' || store !== 'all' || category !== 'all') && (
          <button className="reset-filter-btn" onClick={onResetFilters}>
            <RotateCcw size={13} /> Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
