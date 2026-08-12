import React, { useState } from 'react';
import OrderRow from './OrderRow';
import OrderEmptyState from './OrderEmptyState';
import OrderBulkActions from './OrderBulkActions';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function OrderTable({ 
  orders = [], 
  onNavigateToProducts,
  onViewOrderDetail,
  onUpdateOrderStatus,
  onBulkUpdateStatus
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const hasOrders = orders && orders.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkConfirmAll = () => {
    onBulkUpdateStatus(selectedIds, 'Chờ lấy hàng');
    setSelectedIds([]);
    alert(`✅ Đã xác nhận hàng loạt ${selectedIds.length} đơn hàng!`);
  };

  const handleBulkPrintAll = () => {
    alert(`🖨️ Đang in phiếu giao cho ${selectedIds.length} đơn hàng đã chọn.`);
  };

  const handleBulkExportSelected = () => {
    alert(`📥 Đã xuất dữ liệu Excel cho ${selectedIds.length} đơn hàng.`);
  };

  return (
    <div className="order-table-card-container">
      {hasOrders ? (
        <>
          <div className="table-responsive-wrapper">
            <table className="order-data-table">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="col-order-code">Mã đơn hàng</th>
                  <th className="col-customer">Khách hàng</th>
                  <th className="col-product-item">Sản phẩm</th>
                  <th className="col-total">Tổng tiền</th>
                  <th className="col-status">Trạng thái</th>
                  <th className="col-shipping">Vận chuyển</th>
                  <th className="col-date">Ngày đặt ▼</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {orders.map(order => (
                  <OrderRow 
                    key={order.id}
                    order={order}
                    isSelected={selectedIds.includes(order.id)}
                    onToggleSelect={handleToggleSelect}
                    onViewDetail={onViewOrderDetail}
                    onUpdateStatus={onUpdateOrderStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Floating Bulk Actions Bar */}
          <OrderBulkActions 
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onBulkConfirm={handleBulkConfirmAll}
            onBulkPrint={handleBulkPrintAll}
            onBulkExport={handleBulkExportSelected}
          />

          {/* Table Pagination Footer */}
          <div className="table-pagination-footer">
            <div className="pagination-info-text">
              Hiển thị 1 - {orders.length} của {orders.length} đơn hàng
            </div>

            <div className="pagination-controls-group">
              <button className="page-nav-btn" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="page-number-btn active">1</button>
              <button className="page-nav-btn" disabled>
                <ChevronRight size={16} />
              </button>

              <div className="page-size-selector">
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <OrderEmptyState onNavigateToProducts={onNavigateToProducts} />
      )}
    </div>
  );
}
