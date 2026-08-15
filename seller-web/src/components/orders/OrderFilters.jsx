import React, { useState } from 'react';
import { Search, Calendar, Filter, X, RotateCcw, Check, ChevronDown } from 'lucide-react';

export default function OrderFilters({ 
  searchQuery = '', 
  onSearchChange,
  dateRange = 'all',
  onDateRangeChange,
  statusFilter = 'Tất cả',
  onStatusChange,
  paymentFilter = 'Tất cả',
  onPaymentChange,
  providerFilter = 'Tất cả',
  onProviderChange,
  warehouseFilter = 'Tất cả',
  onWarehouseChange,
  onResetFilters,
  onApplyFilters
}) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Local temporary states when panel is open
  const [tempStatus, setTempStatus] = useState(statusFilter);
  const [tempPayment, setTempPayment] = useState(paymentFilter);
  const [tempProvider, setTempProvider] = useState(providerFilter);
  const [tempWarehouse, setTempWarehouse] = useState(warehouseFilter);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const handleOpenPanel = () => {
    setTempStatus(statusFilter);
    setTempPayment(paymentFilter);
    setTempProvider(providerFilter);
    setTempWarehouse(warehouseFilter);
    setTempDateRange(dateRange);
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  const handleApply = () => {
    if (onStatusChange) onStatusChange(tempStatus);
    if (onPaymentChange) onPaymentChange(tempPayment);
    if (onProviderChange) onProviderChange(tempProvider);
    if (onWarehouseChange) onWarehouseChange(tempWarehouse);
    if (onDateRangeChange) onDateRangeChange(tempDateRange);
    if (onApplyFilters) onApplyFilters();
    setIsFilterPanelOpen(false);
  };

  const handleReset = () => {
    setTempStatus('Tất cả');
    setTempPayment('Tất cả');
    setTempProvider('Tất cả');
    setTempWarehouse('Tất cả');
    setTempDateRange('all');
    if (onResetFilters) onResetFilters();
    setIsFilterPanelOpen(false);
  };

  const hasActiveFilters = searchQuery !== '' || 
    statusFilter !== 'Tất cả' || 
    paymentFilter !== 'Tất cả' || 
    providerFilter !== 'Tất cả' || 
    warehouseFilter !== 'Tất cả' ||
    dateRange !== 'all';

  return (
    <div className="order-filters-container">
      <div className="order-filters-toolbar">
        {/* Search Input (Requirement 7) */}
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="🔍 Tìm mã đơn hàng, tên khách hàng, sản phẩm…" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-search-input"
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

        {/* Quick Dropdowns & Filter Trigger */}
        <div className="filter-options-group">
          {/* Quick Shipping Provider Select */}
          <select 
            value={providerFilter} 
            onChange={(e) => onProviderChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="Tất cả">Tất cả ĐVVC</option>
            <option value="Viettel Post">Viettel Post</option>
            <option value="GHN">Giao Hàng Nhanh (GHN)</option>
            <option value="J&T">J&T Express</option>
            <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
            <option value="SPX">Shopee Xpress (SPX)</option>
          </select>

          {/* Quick Warehouse Select */}
          <select 
            value={warehouseFilter} 
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="filter-stylish-select"
          >
            <option value="Tất cả">Tất cả kho lấy hàng</option>
            <option value="Kho Tổng Hà Nội">Kho Tổng Hà Nội</option>
            <option value="Kho Tổng TP.HCM">Kho Tổng TP.HCM</option>
            <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
          </select>

          {/* Filter Popover Trigger Button */}
          <button 
            type="button"
            className={`nav-btn-secondary filter-btn ${isFilterPanelOpen ? 'active' : ''} ${hasActiveFilters ? 'has-badge' : ''}`}
            onClick={handleOpenPanel}
          >
            <Filter size={15} /> 
            <span>Bộ lọc nâng cao</span>
            <ChevronDown size={14} />
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button 
              type="button"
              className="clear-filter-link-btn"
              onClick={handleReset}
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw size={13} /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filter Panel (Requirement 8) */}
      {isFilterPanelOpen && (
        <div className="advanced-filter-panel-card">
          <div className="filter-panel-grid">
            {/* 1. Ngày đặt hàng */}
            <div className="filter-field-col">
              <label className="filter-field-label">Ngày đặt hàng</label>
              <div className="date-picker-button-wrapper">
                <Calendar size={14} className="calendar-icon" />
                <select 
                  value={tempDateRange} 
                  onChange={(e) => setTempDateRange(e.target.value)}
                  className="inline-filter-select"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="month">Tháng 08/2026</option>
                </select>
              </div>
            </div>

            {/* 2. Trạng thái */}
            <div className="filter-field-col">
              <label className="filter-field-label">Trạng thái đơn hàng</label>
              <select 
                value={tempStatus} 
                onChange={(e) => setTempStatus(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Chờ đóng gói">Chờ đóng gói</option>
                <option value="Chờ bàn giao">Chờ bàn giao</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
                <option value="Trả hàng / Hoàn tiền">Trả hàng / Hoàn tiền</option>
              </select>
            </div>

            {/* 3. Phương thức thanh toán */}
            <div className="filter-field-col">
              <label className="filter-field-label">Phương thức thanh toán</label>
              <select 
                value={tempPayment} 
                onChange={(e) => setTempPayment(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả phương thức</option>
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="Ví V-life">Ví V-life</option>
                <option value="Thẻ ngân hàng">Thẻ ngân hàng / Visa / Master</option>
              </select>
            </div>

            {/* 4. Đơn vị vận chuyển */}
            <div className="filter-field-col">
              <label className="filter-field-label">Đơn vị vận chuyển</label>
              <select 
                value={tempProvider} 
                onChange={(e) => setTempProvider(e.target.value)}
                className="filter-stylish-select full-width"
              >
                <option value="Tất cả">Tất cả ĐVVC</option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                <option value="J&T">J&T Express</option>
                <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                <option value="SPX">Shopee Xpress (SPX)</option>
              </select>
            </div>

            {/* 5. Kho lấy hàng */}
            <div className="filter-field-col">
              <label className="filter-field-label">Kho lấy hàng</label>
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
          </div>

          {/* Panel Action Buttons */}
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
              <Check size={15} /> Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
