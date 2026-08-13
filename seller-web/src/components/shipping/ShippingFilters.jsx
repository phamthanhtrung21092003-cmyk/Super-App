import React from 'react';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';

export default function ShippingFilters({ 
  searchQuery, 
  onSearchChange,
  providerFilter,
  onProviderChange,
  statusFilter,
  onStatusChange,
  warehouseFilter,
  onWarehouseChange,
  onResetFilters
}) {
  return (
    <div className="shipping-filters-toolbar">
      {/* Search Input Box */}
      <div className="filter-search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm mã vận đơn, mã đơn hàng, tên khách hàng..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search-input"
        />
      </div>

      {/* Dropdown Filters Group */}
      <div className="filter-selects-group">
        {/* Đơn vị vận chuyển */}
        <div className="filter-select-wrapper">
          <label className="select-label">Đơn vị vận chuyển</label>
          <select 
            value={providerFilter} 
            onChange={(e) => onProviderChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="GHN">GHN (Giao Hàng Nhanh)</option>
            <option value="J&T Express">J&T Express</option>
            <option value="Viettel Post">Viettel Post</option>
            <option value="Ninja Van">Ninja Van</option>
            <option value="V-life Delivery">V-life Delivery</option>
          </select>
        </div>

        {/* Trạng thái vận chuyển */}
        <div className="filter-select-wrapper">
          <label className="select-label">Trạng thái vận chuyển</label>
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Chờ lấy hàng">Chờ lấy hàng</option>
            <option value="Đang lấy hàng">Đang lấy hàng</option>
            <option value="Đang vận chuyển">Đang vận chuyển</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Giao thất bại">Giao thất bại</option>
          </select>
        </div>

        {/* Kho lấy hàng */}
        <div className="filter-select-wrapper">
          <label className="select-label">Kho lấy hàng</label>
          <select 
            value={warehouseFilter} 
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Kho HCM">Kho HCM</option>
            <option value="Kho Hà Nội">Kho Hà Nội</option>
            <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
          </select>
        </div>

        {/* Thời gian */}
        <div className="filter-select-wrapper">
          <label className="select-label">Thời gian</label>
          <div className="date-picker-trigger-btn">
            <Calendar size={14} /> 7 ngày qua
          </div>
        </div>

        {/* Action Buttons */}
        <button className="nav-btn-primary filter-apply-btn">
          <Filter size={15} /> Lọc
        </button>

        <button className="nav-btn-secondary filter-reset-btn" onClick={onResetFilters}>
          <RotateCcw size={14} /> Đặt lại
        </button>
      </div>
    </div>
  );
}
