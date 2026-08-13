import React from 'react';
import { X, PlusCircle, Sliders, Layers, Calendar, Clock, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export default function InventoryDetailDrawer({ 
  item, 
  onClose, 
  onOpenReceive, 
  onOpenAdjust 
}) {
  if (!item) return null;

  const physical = item.physicalStock || item.quantity || 128;
  const reserved = item.reservedStock || item.reservedQuantity || 12;
  const available = Math.max(0, physical - reserved);
  const sold = item.soldQuantity || item.sold || 0;
  const minStock = item.minimumStock || 10;

  const mockTransactions = [
    { time: '13/08 09:30', type: 'Giữ hàng', typeCode: 'RESERVE', qty: -2, before: 130, after: 128, reason: 'Đơn hàng #VL000128', user: 'Hệ thống' },
    { time: '12/08 14:00', type: 'Nhập kho', typeCode: 'RECEIVE', qty: +50, before: 80, after: 130, reason: 'Nhập hàng từ NCC', user: 'Kho tổng' },
    { time: '11/08 11:15', type: 'Điều chỉnh', typeCode: 'ADJUST', qty: -5, before: 85, after: 80, reason: 'Hàng lỗi kiểm kê', user: 'Quản lý kho' }
  ];

  return (
    <div className="inventory-drawer-backdrop" onClick={onClose}>
      <div className="inventory-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="sku-pill-tag">SKU: {item.sku}</span>
            <h2 className="drawer-product-name">{item.productName || item.name}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body-scroll">
          {/* Hero Stock Breakdown Card */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics">
              <div className="bk-metric-box">
                <span className="lbl">Tồn kho thực tế</span>
                <strong className="val">{physical} SP</strong>
              </div>
              <div className="bk-metric-box warning-border">
                <span className="lbl">Đang giữ cho đơn</span>
                <strong className="val orange-text">{reserved} SP</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Có thể bán (Available)</span>
                <strong className="val green-text">{available} SP</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Tổng số đã bán</span>
                <strong className="val">{sold} SP</strong>
              </div>
            </div>
            <div className="formula-note-row">
              <code>Công thức: Có thể bán ({available}) = Tồn thực tế ({physical}) - Đang giữ ({reserved})</code>
            </div>
          </div>

          {/* Section 1: Thông tin sản phẩm từ Product Catalog */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Layers size={16} /> Thông tin từ Product Catalog
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Product ID</span>
                <strong className="v-val">{item.productId || 'p2'}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Mã SKU phân loại</span>
                <span className="v-val sku-tag">{item.sku}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Phân loại biến thể</span>
                <span className="v-val">{item.variant || 'Đen / M'}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Ngưỡng tồn tối thiểu</span>
                <span className="v-val">{minStock} sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Section 2: Lịch sử biến động tồn kho SKU */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Clock size={16} /> Lịch sử biến động kho SKU này
            </h3>

            <div className="history-logs-stack">
              {mockTransactions.map((tx, idx) => (
                <div key={idx} className="tx-log-item-row">
                  <div className="tx-log-left">
                    <span className={`tx-type-badge ${tx.typeCode.toLowerCase()}`}>
                      {tx.qty > 0 ? `+${tx.qty}` : tx.qty}
                    </span>
                    <div className="tx-info-block">
                      <strong className="tx-reason-title">{tx.type}: {tx.reason}</strong>
                      <span className="tx-meta-sub">{tx.time} • Thực hiện bởi: {tx.user}</span>
                    </div>
                  </div>
                  <div className="tx-log-right">
                    <span className="stock-change-text">{tx.before} → <strong>{tx.after}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-action-footer">
          <button 
            className="nav-btn-secondary" 
            onClick={() => {
              onClose();
              onOpenAdjust(item);
            }}
          >
            <Sliders size={15} /> Điều chỉnh tồn
          </button>
          <button 
            className="nav-btn-primary" 
            onClick={() => {
              onClose();
              onOpenReceive(item.sku);
            }}
          >
            <PlusCircle size={15} /> + Nhập kho SKU này
          </button>
        </div>
      </div>
    </div>
  );
}
