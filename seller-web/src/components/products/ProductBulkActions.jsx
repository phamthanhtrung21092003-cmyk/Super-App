import React from 'react';
import { Eye, EyeOff, Tag, Package, Trash2, CheckCircle2, X } from 'lucide-react';

export default function ProductBulkActions({ 
  selectedCount, 
  onClearSelection, 
  onBulkHide, 
  onBulkShow, 
  onBulkUpdatePrice, 
  onBulkUpdateStock, 
  onBulkDelete 
}) {
  if (!selectedCount || selectedCount <= 0) return null;

  return (
    <div className="product-bulk-floating-bar">
      <div className="bulk-bar-left">
        <span className="bulk-count-badge">
          <CheckCircle2 size={16} /> Đã chọn <strong>{selectedCount}</strong> sản phẩm
        </span>
        <button className="clear-selection-btn" onClick={onClearSelection}>
          <X size={14} /> Bỏ chọn
        </button>
      </div>

      <div className="bulk-bar-actions">
        <button className="bulk-action-btn" onClick={onBulkHide} title="Tạm ẩn các sản phẩm đã chọn">
          <EyeOff size={14} /> Tạm ẩn
        </button>

        <button className="bulk-action-btn" onClick={onBulkShow} title="Hiển thị lại các sản phẩm đã chọn">
          <Eye size={14} /> Hiển thị
        </button>

        <button className="bulk-action-btn" onClick={onBulkUpdatePrice} title="Cập nhật giá hàng loạt">
          <Tag size={14} /> Cập nhật giá
        </button>

        <button className="bulk-action-btn" onClick={onBulkUpdateStock} title="Cập nhật tồn kho hàng loạt">
          <Package size={14} /> Cập nhật tồn kho
        </button>

        <button className="bulk-action-btn danger" onClick={onBulkDelete} title="Xóa các sản phẩm đã chọn">
          <Trash2 size={14} /> Xóa
        </button>
      </div>
    </div>
  );
}
