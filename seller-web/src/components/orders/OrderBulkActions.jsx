import React from 'react';
import { Printer, Download, Zap, X } from 'lucide-react';

export default function OrderBulkActions({ 
  selectedCount, 
  onClearSelection, 
  onBulkConfirm, 
  onBulkPrint, 
  onBulkExport 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="order-bulk-floating-bar">
      <div className="bulk-selected-info">
        <span className="selected-badge-count">Đã chọn {selectedCount} đơn hàng</span>
        <button 
          className="clear-selection-btn"
          onClick={onClearSelection}
          title="Bỏ chọn tất cả"
        >
          <X size={14} /> Bỏ chọn
        </button>
      </div>

      <div className="bulk-actions-buttons-group">
        <button className="nav-btn-secondary bulk-btn" onClick={onBulkPrint}>
          <Printer size={15} /> In đơn
        </button>

        <button className="nav-btn-secondary bulk-btn" onClick={onBulkExport}>
          <Download size={15} /> Xuất Excel
        </button>

        <button className="nav-btn-primary bulk-main-btn" onClick={onBulkConfirm}>
          <Zap size={15} /> Xử lý hàng loạt
        </button>
      </div>
    </div>
  );
}
