import React from 'react';
import { PlusCircle, Sliders, Printer } from 'lucide-react';

export default function InventoryHeader({ 
  onOpenReceiveModal, 
  onOpenAdjustModal, 
  onExportReport 
}) {
  return (
    <div className="inventory-header-container">
      <div className="inventory-header-title-group">
        <h1 className="inventory-header-title">KHO HÀNG</h1>
        <p className="inventory-header-subtitle">
          Quản lý tồn kho, SKU và biến động hàng hóa của cửa hàng
        </p>
      </div>

      <div className="inventory-header-actions-group">
        <button className="nav-btn-secondary" onClick={onOpenAdjustModal}>
          <Sliders size={16} /> Điều chỉnh tồn kho
        </button>

        <button className="nav-btn-secondary" onClick={onExportReport}>
          <Printer size={16} /> Xuất báo cáo
        </button>

        <button className="nav-btn-primary" onClick={onOpenReceiveModal}>
          <PlusCircle size={16} /> + Nhập kho
        </button>
      </div>
    </div>
  );
}
