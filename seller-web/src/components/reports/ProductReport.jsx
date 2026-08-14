import React from 'react';
import TopProductsReport from './TopProductsReport';

export default function ProductReport({ catalogProducts = [], onOpenProductDetail }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Tổng sản phẩm đang bán</span>
          <div className="kpi-value-number">186 sản phẩm</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Sản phẩm bán chạy</span>
          <div className="kpi-value-number green-text">42 sản phẩm</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Sản phẩm sắp hết hàng</span>
          <div className="kpi-value-number danger-item">5 sản phẩm</div>
        </div>
        <div className="finance-kpi-card">
          <span className="kpi-title-label">Sản phẩm chưa bán được</span>
          <div className="kpi-value-number">12 sản phẩm</div>
        </div>
      </div>

      <TopProductsReport catalogProducts={catalogProducts} onOpenProductDetail={onOpenProductDetail} />
    </div>
  );
}
