import React from 'react';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';

export default function ShippingBulkActions({ 
  selectedCount, 
  onClearSelection, 
  onBulkPrint, 
  onBulkExport 
}) {
  if (!selectedCount || selectedCount <= 0) return null;

  return (
    <div className="product-bulk-floating-bar">
      <div className="bulk-bar-left">
        <span className="bulk-count-badge">
          <CheckCircle2 size={16} /> Đã chọn <strong>{selectedCount}</strong> vận đơn
        </span>
        <button className="clear-selection-btn" onClick={onClearSelection}>
          <X size={14} /> Bỏ chọn
        </button>
      </div>

      <div className="bulk-bar-actions">
        <button className="bulk-action-btn" onClick={onBulkPrint} title="In nhãn vận chuyển hàng loạt">
          <Printer size={14} /> In nhãn hàng loạt
        </button>

        <button className="bulk-action-btn" onClick={onBulkExport} title="Xuất báo cáo dữ liệu vận đơn Excel">
          <Download size={14} /> Xuất dữ liệu Excel
        </button>
      </div>
    </div>
  );
}
