import React from 'react';
import { PlusCircle, Download } from 'lucide-react';

export default function InventoryHeader({ 
  onOpenReceiveModal, 
  onExportReport 
}) {
  return (
    <div className="inventory-header-container">
      <div className="inventory-header-title-group">
        <h1 className="inventory-header-title">KHO HÀNG</h1>
        <p className="inventory-header-subtitle">
          Quản lý tồn kho và số lượng sản phẩm của Shop.
        </p>
      </div>

      <div className="inventory-header-actions-group">
        <button 
          type="button"
          className="nav-btn-primary" 
          onClick={onOpenReceiveModal}
        >
          <PlusCircle size={16} /> + Nhập kho
        </button>

        <button 
          type="button"
          className="nav-btn-secondary" 
          onClick={onExportReport}
        >
          <Download size={15} /> Xuất dữ liệu
        </button>
      </div>
    </div>
  );
}
