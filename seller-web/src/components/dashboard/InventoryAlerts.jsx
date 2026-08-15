import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowUpRight, Warehouse, Plus } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function InventoryAlerts({ existingProducts = [], onNavigateToInventory, onOpenAddProductModal }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    sellerService.getInventoryAlerts(existingProducts).then(data => setAlerts(data));
  }, [existingProducts]);

  return (
    <div className="dashboard-card inventory-alerts-card">
      {/* Header */}
      <div className="card-header-flex">
        <h3 className="card-title-heading">
          <AlertCircle size={16} className="text-warning-icon" /> Cảnh báo tồn kho
        </h3>
        {alerts.length > 0 && (
          <button className="link-see-all-btn" onClick={() => onNavigateToInventory && onNavigateToInventory('Sắp hết')}>
            Quản lý kho <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* Alert List or Empty State */}
      {alerts.length > 0 ? (
        <div className="alerts-vertical-list">
          {alerts.map(item => (
            <div 
              key={item.id} 
              className="inventory-alert-row cursor-pointer"
              onClick={() => onNavigateToInventory && onNavigateToInventory('Sắp hết', item.sku || item.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateToInventory && onNavigateToInventory('Sắp hết', item.sku || item.name)}
              title={`Xem tồn kho sản phẩm: ${item.name}`}
            >
              <span className="alert-rank-index">{item.rank}</span>

              <img src={item.image} alt={item.name} className="alert-product-thumb" />

              <div className="alert-product-details">
                <span className="alert-product-name">{item.name}</span>
                <span className="alert-product-sku">SKU: {item.sku}</span>
              </div>

              <div className="alert-stock-status">
                <span className={`stock-badge ${item.isOutOfStock ? 'out-of-stock' : 'low-stock'}`}>
                  {item.statusLabel}
                </span>
              </div>

              <button 
                type="button"
                className="update-stock-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToInventory) onNavigateToInventory('Sắp hết', item.sku || item.name);
                }}
              >
                Nhập kho
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="widget-empty-state-box">
          <div className="empty-widget-icon-circle">
            <Warehouse size={24} className="empty-icon" />
          </div>
          <h4 className="empty-widget-title">Kho hàng đang trống</h4>
          <p className="empty-widget-desc">
            Bạn chưa có sản phẩm nào trong kho hàng. Hãy thêm sản phẩm để bắt đầu theo dõi tồn kho.
          </p>
          <button 
            className="nav-btn-primary empty-widget-btn" 
            onClick={onOpenAddProductModal || onNavigateToInventory}
          >
            <Plus size={15} /> Thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
}
