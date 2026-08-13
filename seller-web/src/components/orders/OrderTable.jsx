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
    if (window.confirm(`Bạn có chắc muốn xác nhận hàng loạt ${selectedIds.length} đơn hàng đã chọn?`)) {
      onBulkUpdateStatus(selectedIds, 'Chờ đóng gói');
      setSelectedIds([]);
      alert(`✅ Đã xác nhận xử lý thành công ${selectedIds.length} đơn hàng!`);
    }
  };

  const handleBulkPrintAll = () => {
    alert(`🖨️ Đang gửi lệnh in phiếu giao cho ${selectedIds.length} đơn hàng đã chọn.`);
  };

  const handleBulkExportSelected = () => {
    alert(`📥 Đã xuất dữ liệu Excel cho ${selectedIds.length} đơn hàng.`);
  };

  return (
    <div className="order-table-card-container" style={{ position: 'relative' }}>
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
                  <th className="col-product-item">Sản phẩm</th>
                  <th className="col-customer">Khách hàng</th>
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
                    onConfirmOrder={(ord) => setConfirmingOrder(ord)}
                    onCancelOrder={(ord) => setCancellingOrder(ord)}
                    onPackOrder={(ord) => setPackingOrder(ord)}
                    onHandoverOrder={(ord) => setHandoverOrder(ord)}
                    onPrintOrder={(ord) => setPrintingOrder(ord)}
                    onViewReturnOrder={(ord) => setReturningOrder(ord)}
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

      {/* Interactive Modals */}
      {confirmingOrder && (
        <OrderConfirmModal 
          order={confirmingOrder}
          onClose={() => setConfirmingOrder(null)}
          onConfirm={(id) => {
            onUpdateOrderStatus(id, 'Chờ đóng gói');
            setConfirmingOrder(null);
            alert(`✅ Đã xác nhận đơn hàng #${id} thành công! Đơn hàng chuyển sang Chờ đóng gói.`);
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
            alert(`❌ Đã hủy đơn hàng #${id}. Lý do: ${reason}`);
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
            alert(`📦 Đã hoàn tất đóng gói đơn hàng #${id}! Đơn hàng sẵn sàng chờ bàn giao cho shipper.`);
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
            alert(`🚚 Đã bàn giao kiện hàng #${id} cho ĐVVC với mã vận đơn ${trackingNo}!`);
          }}
        />
      )}

      {returningOrder && (
        <ReturnRequestModal 
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onApprove={(id) => {
            onUpdateOrderStatus(id, 'Đã hoàn tiền');
            setReturningOrder(null);
            alert(`✅ Đã chấp nhận yêu cầu hoàn tiền cho đơn hàng #${id}.`);
          }}
          onReject={(id) => {
            setReturningOrder(null);
            alert(`❌ Đã từ chối yêu cầu hoàn tiền của đơn hàng #${id}.`);
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
