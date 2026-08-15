import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Package, Plus } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function TopProducts({ existingProducts = [], onNavigateToProducts, onOpenAddProductModal }) {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    sellerService.getTopSellingProducts(existingProducts, 3).then(data => setTopProducts(data));
  }, [existingProducts]);

  const handleProductClick = (product) => {
    if (onNavigateToProducts) {
      onNavigateToProducts(product || 'products');
    }
  };

  return (
    <div className="dashboard-card top-products-card">
      {/* Header */}
      <div className="card-header-flex">
        <h3 className="card-title-heading">Sản phẩm bán chạy</h3>
        {topProducts.length > 0 && (
          <button 
            className="link-see-all-btn"
            onClick={() => handleProductClick()}
          >
            Xem tất cả <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* Top Products List or Empty State */}
      {topProducts.length > 0 ? (
        <div className="top-products-list">
          {topProducts.map(p => (
            <div 
              key={p.productId} 
              className="top-product-item"
              onClick={() => handleProductClick(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleProductClick(p)}
              title={`Xem sản phẩm ${p.name}`}
            >
              <div className="rank-badge-box">
                <span className={`rank-number rank-${p.rank}`}>{p.rank}</span>
              </div>

              <img src={p.image} alt={p.name} className="product-thumb-img" />

              <div className="product-info-col">
                <h4 className="product-title-text">{p.name}</h4>
                <span className="product-sku-tag">SKU: {p.sku} • {p.variantInfo}</span>
              </div>

              <div className="product-sold-col">
                <span className="sold-label-text">Đã bán</span>
                <span className="sold-count-number">{p.sold}</span>
              </div>

              <div className="product-revenue-col">
                <span className="revenue-label-text">Doanh thu</span>
                <span className="revenue-amount-text">{p.formattedRevenue}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="widget-empty-state-box">
          <div className="empty-widget-icon-circle">
            <Package size={24} className="empty-icon" />
          </div>
          <h4 className="empty-widget-title">Chưa có sản phẩm</h4>
          <p className="empty-widget-desc">
            Đăng sản phẩm đầu tiên để bắt đầu hiển thị danh sách sản phẩm bán chạy.
          </p>
          <button 
            className="nav-btn-primary empty-widget-btn" 
            onClick={onOpenAddProductModal || handleProductClick}
          >
            <Plus size={15} /> + Thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
}
