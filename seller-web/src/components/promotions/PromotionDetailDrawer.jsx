import React from 'react';
import { X, Tag, BarChart2, ShoppingBag, Package, DollarSign, Clock, FileText } from 'lucide-react';

export default function PromotionDetailDrawer({ promotion, onClose, catalogProducts = [] }) {
  if (!promotion) return null;

  const budget = promotion.budget || 2000000;
  const spent = promotion.spent || 1450000;
  const revenue = promotion.revenue || 32450000;
  const orders = promotion.orders || 142;
  const roi = budget > 0 ? Math.round(((revenue - spent) / spent) * 100) : 0;

  // Participating Catalog Products
  const participatingProducts = catalogProducts.filter(p => promotion.productIds?.includes(p.id)) || [
    { id: 'p1', name: 'Giày Sneaker Unisex Sport', sku: 'GS-WHT-42', price: 450000 },
    { id: 'p2', name: 'Áo thun nam basic', sku: 'ATB-BLK-M', price: 150000 }
  ];

  return (
    <div className="inventory-drawer-backdrop" onClick={onClose}>
      <div className="inventory-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="sku-pill-tag">Mã KM: {promotion.code || promotion.id}</span>
            <h2 className="drawer-product-name">{promotion.name}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body-scroll">
          {/* Main Hero Performance Card */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics">
              <div className="bk-metric-box">
                <span className="lbl">Ngân sách cài đặt</span>
                <strong className="val">{budget.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box warning-border">
                <span className="lbl">Đã sử dụng</span>
                <strong className="val orange-text">{spent.toLocaleString('vi-VN')} đ ({Math.round((spent/budget)*100)}%)</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Doanh thu phát sinh</span>
                <strong className="val green-text">{revenue.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Chỉ số ROI</span>
                <strong className="val green-text">+{roi}% ROI</strong>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <FileText size={16} /> Thông tin chương trình
            </h3>
            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Loại khuyến mãi</span>
                <span className="v-val">{promotion.type}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Trạng thái</span>
                <strong className="v-val green-text">🟢 {promotion.status}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Thời gian áp dụng</span>
                <span className="v-val">{promotion.time || '08/08/2026 - 12/08/2026'}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Tổng số đơn hàng</span>
                <strong className="v-val">{orders} đơn hàng</strong>
              </div>
            </div>
          </div>

          {/* Participating Products Section */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Package size={16} /> Sản phẩm từ Catalog tham gia ({participatingProducts.length})
            </h3>
            <div className="tx-table-responsive">
              <table className="tx-master-table">
                <thead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>SKU</th>
                    <th>Giá niêm yết</th>
                  </tr>
                </thead>
                <tbody>
                  {participatingProducts.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <strong className="tx-product-name">{prod.name}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ID: {prod.id}</span>
                      </td>
                      <td><code>{prod.sku || 'SKU-001'}</code></td>
                      <td><strong>{(prod.price || 150000).toLocaleString('vi-VN')} đ</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="drawer-action-footer">
          <button className="nav-btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
