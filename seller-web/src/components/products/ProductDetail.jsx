import React from 'react';
import { X, Edit2, Eye, EyeOff, Package, Tag, ShoppingBag, DollarSign, Calendar, Info, Layers } from 'lucide-react';

export default function ProductDetail({ 
  product, 
  onClose, 
  onEdit, 
  onToggleStatus 
}) {
  if (!product) return null;

  const totalRevenue = (Number(product.price) || 0) * (Number(product.sold) || 0);

  return (
    <div className="product-detail-drawer-backdrop" onClick={onClose}>
      <div className="product-detail-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="product-id-badge">ID: {product.id}</span>
            <h2 className="drawer-product-name" title={product.name}>{product.name}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="drawer-body-scroll">
          {/* Main Thumbnail Image & Quick Metrics */}
          <div className="product-hero-card">
            <img src={product.image} alt={product.name} className="hero-product-image" />
            <div className="hero-metrics-grid">
              <div className="metric-box">
                <span className="box-lbl">Giá bán</span>
                <strong className="box-val green-text">{Number(product.price).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="metric-box">
                <span className="box-lbl">Tồn kho</span>
                <strong className="box-val">{product.stock} SP</strong>
              </div>
              <div className="metric-box">
                <span className="box-lbl">Đã bán</span>
                <strong className="box-val">{product.sold || 0} đơn</strong>
              </div>
              <div className="metric-box">
                <span className="box-lbl">Tổng doanh thu</span>
                <strong className="box-val green-text">{totalRevenue.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Thông tin cơ bản */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Info size={16} /> Thông tin cơ bản Single Source of Truth
            </h3>

            <div className="key-value-stack">
              <div className="kv-row">
                <span className="k-lbl">Product ID</span>
                <strong className="v-val monospace-tag">{product.id}</strong>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Mã SKU chính</span>
                <span className="v-val sku-tag">{product.sku}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Danh mục sản phẩm</span>
                <span className="v-val">{product.category}</span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Trạng thái gian hàng</span>
                <span className={`v-val status-badge ${product.status === 'Đang bán' ? 'active' : 'hidden'}`}>
                  {product.status}
                </span>
              </div>
              <div className="kv-row">
                <span className="k-lbl">Ngày tạo sản phẩm</span>
                <span className="v-val">{product.createdAt || '12/08/2026'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Danh sách biến thể & SKU matrix */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Layers size={16} /> Bảng biến thể phân loại (SKU Matrix)
            </h3>

            <div className="variant-matrix-table-wrapper">
              <table className="variant-matrix-table">
                <thead>
                  <tr>
                    <th>Biến thể</th>
                    <th>SKU</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{product.variants || 'Mặc định'}</strong></td>
                    <td><code>{product.sku}</code></td>
                    <td style={{ color: '#00B14F', fontWeight: '800' }}>{Number(product.price).toLocaleString('vi-VN')}đ</td>
                    <td><strong>{product.stock}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Mô tả sản phẩm */}
          {product.description && (
            <div className="drawer-section-card">
              <h3 className="section-title">
                <FileText size={16} /> Mô tả sản phẩm
              </h3>
              <p className="product-description-text">{product.description}</p>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-action-footer">
          <button 
            className="nav-btn-secondary" 
            onClick={() => {
              onClose();
              onToggleStatus(product);
            }}
          >
            {product.status === 'Đang bán' ? <EyeOff size={15} /> : <Eye size={15} />}
            {product.status === 'Đang bán' ? ' Tạm ẩn sản phẩm' : ' Hiện sản phẩm'}
          </button>

          <button 
            className="nav-btn-primary" 
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            <Edit2 size={15} /> Chỉnh sửa sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
