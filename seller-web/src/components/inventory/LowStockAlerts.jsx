import React from 'react';
import { AlertTriangle, PlusCircle, XCircle, ChevronRight } from 'lucide-react';

export default function LowStockAlerts({ lowStockItems = [], onOpenReceive }) {
  if (!lowStockItems || lowStockItems.length === 0) return null;

  return (
    <div className="low-stock-alerts-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">
          <AlertTriangle size={18} className="warning-icon-orange" /> Cảnh báo tồn kho cần nhập bổ sung
        </h3>
        <span className="alerts-count-tag">{lowStockItems.length} SKU cần chú ý</span>
      </div>

      <div className="alerts-items-scroll">
        {lowStockItems.map(item => {
          const isOutOfStock = (item.availableStock || item.available || item.quantity || 0) === 0;

          return (
            <div key={item.sku || item.id} className={`alert-item-row ${isOutOfStock ? 'out-of-stock-row' : 'low-stock-row'}`}>
              <div className="alert-item-left">
                <span className={`status-dot ${isOutOfStock ? 'red' : 'orange'}`}></span>
                <div className="alert-item-details">
                  <strong className="item-prod-name">{item.productName || item.name}</strong>
                  <span className="item-sku-sub">
                    Product ID: <strong>{item.productId || 'p2'}</strong> | SKU: <code>{item.sku}</code> ({item.variant || 'Mặc định'})
                  </span>
                </div>
              </div>

              <div className="alert-item-right">
                <div className="stock-badge-box">
                  <span className="lbl">{isOutOfStock ? 'Hết hàng' : 'Còn lại'}</span>
                  <strong className={`val ${isOutOfStock ? 'red' : 'orange'}`}>
                    {item.availableStock !== undefined ? item.availableStock : (item.available || item.quantity || 0)} SP
                  </strong>
                </div>

                <button 
                  className="nav-btn-primary quick-receive-btn"
                  onClick={() => onOpenReceive(item.sku)}
                  title="Nhập kho ngay cho SKU này"
                >
                  <PlusCircle size={14} /> + Nhập kho
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
