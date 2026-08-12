import React from 'react';
import { X, BarChart2, DollarSign, Package, Layers, AlertTriangle, Printer, Download } from 'lucide-react';

export default function StockReportModal({ stats, inventoryItems = [], onClose }) {
  const lowStockItems = inventoryItems.filter(i => i.quantity > 0 && i.quantity <= 30);
  const outOfStockItems = inventoryItems.filter(i => i.quantity <= 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-card-box report-modal-large">
        <div className="modal-header-flex">
          <div>
            <h3 className="modal-title-text">
              <BarChart2 size={18} color="#00B14F" /> Báo cáo tổng quan tồn kho
            </h3>
            <p className="modal-subtitle-text">
              Thống kê giá trị hàng tồn kho và các cảnh báo nhập hàng - Ngày 12/08/2026
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="report-summary-cards">
          <div className="report-mini-card green">
            <DollarSign size={20} />
            <div>
              <span className="card-lbl">Tổng giá trị tồn kho</span>
              <strong>{stats?.formattedTotalValue || '0đ'}</strong>
            </div>
          </div>

          <div className="report-mini-card blue">
            <Package size={20} />
            <div>
              <span className="card-lbl">Tổng số SKU</span>
              <strong>{stats?.totalSku || 0} SKU</strong>
            </div>
          </div>

          <div className="report-mini-card orange">
            <Layers size={20} />
            <div>
              <span className="card-lbl">Tổng sản phẩm tồn</span>
              <strong>{(stats?.totalQuantity || 0).toLocaleString('vi-VN')} SP</strong>
            </div>
          </div>
        </div>

        {/* Warning Sections */}
        <div className="report-sections-grid">
          {/* Low Stock Section */}
          <div className="report-section-box">
            <h4 className="section-title warning">
              <AlertTriangle size={16} /> Cần nhập thêm hàng ({lowStockItems.length} sản phẩm)
            </h4>
            <div className="report-items-list">
              {lowStockItems.map(item => (
                <div key={item.id} className="report-item-row">
                  <span>{item.productName} ({item.sku})</span>
                  <strong className="orange-text">Còn {item.quantity} SP</strong>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-muted font-size-small">Không có sản phẩm nào sắp hết hàng.</p>
              )}
            </div>
          </div>

          {/* Out of Stock Section */}
          <div className="report-section-box">
            <h4 className="section-title danger">
              <AlertTriangle size={16} /> Đã hết hàng ({outOfStockItems.length} sản phẩm)
            </h4>
            <div className="report-items-list">
              {outOfStockItems.map(item => (
                <div key={item.id} className="report-item-row">
                  <span>{item.productName} ({item.sku})</span>
                  <strong className="red-text">Hết hàng (0 SP)</strong>
                </div>
              ))}
              {outOfStockItems.length === 0 && (
                <p className="text-muted font-size-small">Không có sản phẩm nào bị hết hàng.</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions-flex justify-between">
          <div className="report-action-buttons">
            <button className="nav-btn-secondary" onClick={() => alert('🖨️ Đang gửi báo cáo đến máy in...')}>
              <Printer size={15} /> In báo cáo
            </button>
            <button className="nav-btn-secondary" onClick={() => alert('📥 Đã xuất báo cáo Excel (.xlsx)!')}>
              <Download size={15} /> Xuất Excel
            </button>
          </div>

          <button className="nav-btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
