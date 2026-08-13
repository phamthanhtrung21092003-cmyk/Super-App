import React from 'react';
import { Truck, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ShippingProviders({ providers = [] }) {
  return (
    <div className="shipping-providers-card-section">
      <div className="providers-section-header">
        <h3 className="section-header-title">Đơn vị vận chuyển</h3>
        <button className="view-all-providers-btn">
          Xem tất cả <ChevronRight size={14} />
        </button>
      </div>

      <div className="providers-cards-row">
        {providers.map(p => {
          return (
            <div key={p.id} className="provider-info-card">
              <div className="provider-card-top">
                <div className="provider-logo-badge" style={{ color: p.iconColor || '#00B14F' }}>
                  <Truck size={20} />
                </div>
                <div className="provider-name-block">
                  <h4 className="provider-name">{p.name}</h4>
                  <span className="provider-order-count">{p.orderCount} đơn</span>
                </div>
              </div>

              <div className="provider-card-body">
                <div className="provider-rate-row">
                  <span className="rate-label">Tỷ lệ giao thành công</span>
                  <strong className="rate-value">{p.successRate}</strong>
                </div>

                <div className="provider-status-badge">
                  <span className="status-dot-green">●</span> {p.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
