import React from 'react';
import { ArrowDownLeft, ArrowUpRight, BarChart2, Plus, RefreshCw } from 'lucide-react';

export default function InventoryHeader({ 
  onOpenReceiveModal, 
  onOpenIssueModal, 
  onOpenReportModal,
  isNewShopState,
  onToggleShopState
}) {
  return (
    <div className="inventory-header-container">
      <div className="inventory-header-title-group">
        <h1 className="inventory-header-title">Kho hàng</h1>
        <p className="inventory-header-subtitle">
          Quản lý tồn kho sản phẩm và theo dõi xuất nhập kho
        </p>
      </div>

      <div className="inventory-header-actions-group">
        {/* Test State A / State B Toggle Pill */}
        <button 
          className={`state-toggle-pill-btn ${isNewShopState ? 'state-new' : 'state-active'}`}
          onClick={onToggleShopState}
          title="Chuyển đổi thử nghiệm giữa Shop mới (0 tồn kho) và Shop có sản phẩm"
        >
          <RefreshCw size={13} /> State: {isNewShopState ? 'Shop mới (0 SP)' : 'Shop có dữ liệu'}
        </button>

        <button className="nav-btn-secondary btn-receive-stock" onClick={onOpenReceiveModal}>
          <ArrowDownLeft size={16} /> Nhập kho
        </button>

        <button className="nav-btn-secondary btn-issue-stock" onClick={onOpenIssueModal}>
          <ArrowUpRight size={16} /> Xuất kho
        </button>

        <button className="nav-btn-primary btn-report-stock" onClick={onOpenReportModal}>
          <BarChart2 size={16} /> Báo cáo tồn kho
        </button>
      </div>
    </div>
  );
}
