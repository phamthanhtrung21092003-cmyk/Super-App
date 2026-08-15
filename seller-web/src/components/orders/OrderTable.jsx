import React, { useState } from 'react';
import OrderRow from './OrderRow';
import OrderEmptyState from './OrderEmptyState';
import OrderBulkActions from './OrderBulkActions';
import OrderConfirmModal from './OrderConfirmModal';
import OrderCancelModal from './OrderCancelModal';
import PackingModal from './PackingModal';
import HandoverModal from './HandoverModal';
import ReturnRequestModal from './ReturnRequestModal';
import OrderPrintModal from './OrderPrintModal';
import { ChevronLeft, ChevronRight, ChevronDown, Package, Clock, Eye, CheckCircle2, Box, Truck, ShieldAlert } from 'lucide-react';

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

  // Active Interactive Modal States
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [packingOrder, setPackingOrder] = useState(null);
  const [handoverOrder, setHandoverOrder] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [returningOrder, setReturningOrder] = useState(null);

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
    onBulkUpdateStatus(selectedIds, 'Chờ đóng gói');
    setSelectedIds([]);
  };

  const handleBulkPrintAll = () => {
    if (orders.length > 0) {
      setPrintingOrder(orders.find(o => selectedIds.includes(o.id)) || orders[0]);
    }
  };

  const handleBulkExportSelected = () => {
    alert(`📥 Đã xuất dữ liệu cho ${selectedIds.length} đơn hàng đã chọn.`);
  };

  return (
    <div className="order-table-card-container">
      {hasOrders ? (
        <>
          {/* Desktop & Tablet Table */}
          <div className="table-responsive-wrapper desktop-order-table-view">
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
                  <th className="col-order-code">Mã đơn</th>
                  <th className="col-product-item">Sản phẩm</th>
                  <th className="col-customer">Khách hàng</th>
                  <th className="col-total-amount">Tổng tiền</th>
                  <th className="col-payment">Thanh toán</th>
                  <th className="col-shipping">Vận chuyển</th>
                  <th className="col-status">Trạng thái</th>
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
                    onConfirmOrder={(ord) => setConfirmingOrder(ord)}
                    onCancelOrder={(ord) => setCancellingOrder(ord)}
                    onPackOrder={(ord) => setPackingOrder(ord)}
                    onHandoverOrder={(ord) => setHandoverOrder(ord)}
                    onPrintOrder={(ord) => setPrintingOrder(ord)}
                    onProcessReturn={(ord) => setReturningOrder(ord)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Requirement 17) */}
          <div className="mobile-order-cards-view">
            {orders.map(order => {
              const firstItem = order.items?.[0] || { name: 'Sản phẩm', price: 0, image: '' };
              const custName = typeof order.customer === 'object' ? order.customer.name : order.customer;
              const totalMoney = order.summary?.total || order.total || 0;

              return (
                <div 
                  key={order.id} 
                  className="mobile-order-card"
                  onClick={() => onViewOrderDetail(order)}
                >
                  <div className="mobile-card-top-row">
                    <span className="mobile-order-code">{order.code || `#${order.id}`}</span>
                    <span className="mobile-order-status-tag">{order.status}</span>
                  </div>

                  <div className="mobile-card-product-row">
                    <img src={firstItem.image} alt={firstItem.name} className="mobile-prod-thumb" />
                    <div className="mobile-prod-info">
                      <h4 className="mobile-prod-name">{firstItem.name}</h4>
                      <span className="mobile-prod-meta">
                        {firstItem.variant ? `${firstItem.variant} • ` : ''}x{firstItem.quantity || 1}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-card-footer-row">
                    <div className="mobile-cust-info">
                      <span className="mobile-cust-name">{custName}</span>
                      <span className="mobile-order-date">{order.date}</span>
                    </div>
                    <div className="mobile-price-action">
                      <span className="mobile-total-price">{Number(totalMoney).toLocaleString('vi-VN')}đ</span>
                      <button 
                        type="button" 
                        className="mobile-btn-detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrderDetail(order);
                        }}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <button type="button" className="page-nav-btn" disabled>
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="page-number-btn active">1</button>
              <button type="button" className="page-nav-btn" disabled>
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

      {/* Interactive Modals */}
      {confirmingOrder && (
        <OrderConfirmModal 
          order={confirmingOrder}
          onClose={() => setConfirmingOrder(null)}
          onConfirm={(id) => {
            onUpdateOrderStatus(id, 'Chờ đóng gói');
            setConfirmingOrder(null);
          }}
        />
      )}

      {cancellingOrder && (
        <OrderCancelModal 
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onConfirmCancel={(id, reason) => {
            onUpdateOrderStatus(id, 'Đã hủy', reason);
            setCancellingOrder(null);
          }}
        />
      )}

      {packingOrder && (
        <PackingModal 
          order={packingOrder}
          onClose={() => setPackingOrder(null)}
          onCompletePacking={(id) => {
            onUpdateOrderStatus(id, 'Chờ bàn giao');
            setPackingOrder(null);
          }}
        />
      )}

      {handoverOrder && (
        <HandoverModal 
          order={handoverOrder}
          onClose={() => setHandoverOrder(null)}
          onConfirmHandover={(id, trackingNo) => {
            onUpdateOrderStatus(id, 'Đang giao', null, trackingNo);
            setHandoverOrder(null);
          }}
        />
      )}

      {returningOrder && (
        <ReturnRequestModal 
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onApprove={(id) => {
            onUpdateOrderStatus(id, 'Hoàn thành');
            setReturningOrder(null);
          }}
          onReject={(id) => {
            setReturningOrder(null);
          }}
        />
      )}

      {printingOrder && (
        <OrderPrintModal 
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
