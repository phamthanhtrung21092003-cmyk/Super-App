import React, { useState } from 'react';
import { Eye, Printer, MapPin, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ShippingEmptyState from './ShippingEmptyState';
import ShippingBulkActions from './ShippingBulkActions';

export default function ShippingTable({ 
  shippingOrders = [], 
  onViewDetail, 
  onOpenPrintLabel,
  onOpenFailedModal,
  onHandoverShipment,
  onNavigateToProducts 
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!shippingOrders || shippingOrders.length === 0) {
    return <ShippingEmptyState onNavigateToProducts={onNavigateToProducts} />;
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(shippingOrders.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil(shippingOrders.length / pageSize) || 1;
  const pagedOrders = shippingOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Chờ lấy hàng':
        return { bg: '#FFF7ED', color: '#F97316', border: '#FFEDD5', icon: '⏱️' };
      case 'Đã lấy hàng':
        return { bg: '#EFF6FF', color: '#1877F2', border: '#DBEAFE', icon: '📦' };
      case 'Đang vận chuyển':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: '🚛' };
      case 'Đang giao':
        return { bg: '#F3E8FF', color: '#9333EA', border: '#E9D5FF', icon: '🛵' };
      case 'Giao thành công':
      case 'Đã giao':
        return { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', icon: '✅' };
      case 'Giao thất bại':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: '⚠️' };
      case 'Đã hoàn':
        return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', icon: '↩️' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', icon: '📦' };
    }
  };

  return (
    <div className="shipping-table-card" style={{ position: 'relative' }}>
      {/* Bulk Actions Floating Bar */}
      <ShippingBulkActions 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkPrint={() => {
          alert(`🖨️ Đã gửi lệnh in nhãn vận chuyển hàng loạt cho ${selectedIds.length} vận đơn!`);
        }}
        onBulkExport={() => {
          alert(`📥 Đã xuất báo cáo Excel cho ${selectedIds.length} vận đơn đã chọn.`);
        }}
      />

      <div className="shipping-table-responsive-wrapper">
        <table className="shipping-master-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === pagedOrders.length && pagedOrders.length > 0} 
                  onChange={handleSelectAll} 
                  className="stylish-checkbox"
                />
              </th>
              <th>Mã đơn</th>
              <th>Mã vận đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Đơn vị vận chuyển</th>
              <th>Phí vận chuyển</th>
              <th>Trạng thái</th>
              <th>Ngày dự kiến</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const badge = getStatusBadgeStyle(item.status);
              const custName = typeof item.customer === 'object' ? item.customer.name : (item.customerName || item.customer || 'Nguyễn Văn B');
              const custPhone = typeof item.customer === 'object' ? item.customer.phone : (item.customerPhone || '0901234567');
              const firstItem = item.items?.[0] || { name: 'Áo thun nam basic', quantity: 2, productId: 'p2', sku: 'ATB-BLK-M' };

              return (
                <tr key={item.id} className={isSelected ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectOne(item.id)}
                      className="stylish-checkbox"
                    />
                  </td>
                  <td>
                    <span 
                      className="order-code-green-btn" 
                      onClick={() => onViewDetail(item)}
                      role="button"
                    >
                      #{item.code || item.orderId || item.id}
                    </span>
                  </td>
                  <td>
                    <span className="tracking-no-code">{item.trackingNo || 'VLX123456789'}</span>
                  </td>
                  <td>
                    <div className="customer-info-cell">
                      <span className="cust-name font-bold">{custName}</span>
                      <span className="cust-phone-sub">{custPhone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="shipping-product-mini-cell">
                      <span className="prod-name-title">{firstItem.name}</span>
                      <span className="prod-sku-tag">ID: {firstItem.productId || 'p2'} | SKU: {firstItem.sku || 'ATB-BLK-M'} x{firstItem.quantity || 1}</span>
                    </div>
                  </td>
                  <td>
                    <div className="provider-cell-row">
                      <span className="provider-tag green-tag">
                        {item.provider || item.carrierId || 'V-life Delivery'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong className="shipping-fee-text">
                      {(item.shippingFee || 25000).toLocaleString('vi-VN')}đ
                    </strong>
                  </td>
                  <td>
                    <span 
                      className="shipping-status-badge"
                      style={{ 
                        backgroundColor: badge.bg, 
                        color: badge.color, 
                        borderColor: badge.border 
                      }}
                    >
                      <span className="badge-icon">{badge.icon}</span> {item.status}
                    </span>
                  </td>
                  <td>
                    <span className="estimated-date-text">{item.estimatedDate || '15/08/2026'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-cell" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button 
                        className="action-view-btn" 
                        onClick={() => onViewDetail(item)}
                        title="Xem chi tiết vận đơn"
                      >
                        Xem
                      </button>

                      <button 
                        className="action-icon-btn" 
                        onClick={() => onOpenPrintLabel(item)}
                        title="In nhãn vận chuyển"
                      >
                        <Printer size={14} />
                      </button>

                      {item.status === 'Chờ lấy hàng' && (
                        <button 
                          className="nav-btn-primary action-small-btn"
                          onClick={() => onHandoverShipment(item.id)}
                          title="Xác nhận shipper đã lấy hàng"
                        >
                          <CheckCircle2 size={13} /> Bàn giao
                        </button>
                      )}

                      {item.status === 'Giao thất bại' && (
                        <button 
                          className="nav-btn-secondary action-small-btn danger-btn"
                          onClick={() => onOpenFailedModal(item)}
                          title="Xử lý giao thất bại"
                        >
                          <AlertTriangle size={13} /> Xử lý
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="shipping-pagination-bar">
        <div className="pagination-info-text">
          Hiển thị 1 - {pagedOrders.length} của {shippingOrders.length} vận đơn
        </div>

        <div className="pagination-controls">
          <button 
            className="pag-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(page => (
            <button 
              key={page}
              className={`pag-number-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button 
            className="pag-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight size={16} />
          </button>

          <select className="page-size-select">
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </select>
        </div>
      </div>
    </div>
  );
}
