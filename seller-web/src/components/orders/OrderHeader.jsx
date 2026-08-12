import React from 'react';
import { Download, Settings, Printer, ToggleLeft, ToggleRight } from 'lucide-react';

export default function OrderHeader({ 
  totalOrders, 
  isDemoState, 
  onToggleDemoState 
}) {
  return (
    <div className="order-module-header">
      <div className="order-title-block">
        <div className="order-title-row">
          <h1 className="order-main-heading">Quản lý đơn hàng</h1>

          {/* Testing State Toggle Pill */}
          <button 
            className={`state-toggle-pill ${isDemoState ? 'active-demo' : 'empty-demo'}`}
            onClick={onToggleDemoState}
            title="Chuyển đổi giữa trạng thái Shop có đơn và Shop mới (0 đơn) để kiểm thử"
          >
            {isDemoState ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            <span>{isDemoState ? `Giao diện Shop có đơn (${totalOrders})` : 'Giao diện Shop mới (0 đơn)'}</span>
          </button>
        </div>

        <p className="order-sub-heading">
          Theo dõi, xử lý và quản lý toàn bộ đơn hàng của cửa hàng
        </p>
      </div>

      <div className="order-header-actions">
        <button className="nav-btn-secondary export-btn" title="Xuất danh sách đơn hàng">
          <Download size={15} /> Xuất danh sách
        </button>
        <button className="nav-btn-secondary settings-btn" title="Cấu hình xử lý đơn">
          <Settings size={15} /> Cài đặt
        </button>
        <button className="nav-btn-secondary print-btn" title="In phiếu giao hàng">
          <Printer size={15} /> In đơn hàng
        </button>
      </div>
    </div>
  );
}
