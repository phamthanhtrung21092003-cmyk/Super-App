import React from 'react';
import { Sliders, Download, CheckCircle2, X } from 'lucide-react';

export default function InventoryBulkActions({ 
  selectedCount, 
  onClearSelection, 
  onBulkAdjust, 
  onBulkExport 
}) {
  if (!selectedCount || selectedCount <= 0) return null;

  return (
    <div className="product-bulk-floating-bar">
      <div className="bulk-bar-left">
        <span className="bulk-count-badge">
          <CheckCircle2 size={16} /> Đã chọn <strong>{selectedCount}</strong> SKU trong kho
        </span>
        <button className="clear-selection-btn" onClick={onClearSelection}>
          <X size={14} /> Bỏ chọn
        </button>
      </div>

      <div className="bulk-bar-actions">
        <button className="bulk-action-btn" onClick={onBulkAdjust} title="Điều chỉnh tồn kho hàng loạt">
          <Sliders size={14} /> Điều chỉnh tồn hàng loạt
        </button>

        <button className="bulk-action-btn" onClick={onBulkExport} title="Xuất báo cáo tồn kho các SKU đã chọn">
          <Download size={14} /> Xuất dữ liệu Excel
        </button>
      </div>
    </div>
  );
}
