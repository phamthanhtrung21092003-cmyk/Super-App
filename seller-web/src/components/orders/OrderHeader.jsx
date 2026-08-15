import React from 'react';
import { Download, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

export default function OrderHeader({ 
  totalOrders = 0, 
  isDemoState = true, 
  onToggleDemoState,
  onExportData,
  onOpenSettings
}) {
  return (
    <div className="order-module-header">
      <div className="order-title-block">
        <div className="order-title-row">
          <h1 className="order-main-heading">Quản lý đơn hàng</h1>

          {/* Testing State Toggle Pill */}
          <button 
            type="button"
            className={`state-toggle-pill ${isDemoState ? 'active-demo' : 'empty-demo'}`}
            onClick={onToggleDemoState}
            title="Chuyển đổi giữa trạng thái Shop có đơn và Shop mới (0 đơn) để kiểm thử"
          >
            {isDemoState ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            <span>{isDemoState ? `Giao diện Shop có đơn (${totalOrders})` : 'Giao diện Shop mới (0 đơn)'}</span>
          </button>
        </div>

        <p className="order-sub-heading">
          Quản lý và xử lý toàn bộ đơn hàng của Shop.
        </p>
      </div>

      <div className="order-header-actions">
        <button 
          type="button" 
          className="nav-btn-secondary export-btn" 
          onClick={onExportData}
          title="Xuất dữ liệu danh sách đơn hàng"
        >
          <Download size={15} /> Xuất dữ liệu
        </button>
        <button 
          type="button" 
          className="nav-btn-secondary settings-btn" 
          onClick={onOpenSettings}
          title="Cấu hình và thiết lập quy trình xử lý đơn"
        >
          <Settings size={15} /> ⚙ Thiết lập đơn hàng
        </button>
      </div>
    </div>
  );
}
