import React from 'react';
import { Plus, Truck, CreditCard, Video, Radio, BookOpen } from 'lucide-react';

export default function QuickActions({ onNavigate, onOpenAddProductModal }) {
  const actions = [
    { id: 'add_prod', title: '+ Đăng sản phẩm', icon: Plus, bgColor: '#F0FDF4', iconColor: '#00B14F', action: onOpenAddProductModal, isHighlight: true },
    { id: 'shipping_setup', title: 'Thiết lập vận chuyển', icon: Truck, bgColor: '#EFF6FF', iconColor: '#1877F2', action: () => onNavigate('shipping') },
    { id: 'payment_setup', title: 'Thiết lập thanh toán', icon: CreditCard, bgColor: '#FFF7ED', iconColor: '#F97316', action: () => onNavigate('finance') },
    { id: 'post_video', title: 'Đăng Video', icon: Video, bgColor: '#F3E8FF', iconColor: '#A855F7', action: () => onNavigate('video') },
    { id: 'create_live', title: 'Tạo Livestream', icon: Radio, bgColor: '#FEF2F2', iconColor: '#EF4444', action: () => onNavigate('livestream') },
    { id: 'seller_guide', title: 'Xem hướng dẫn', icon: BookOpen, bgColor: '#E0F2FE', iconColor: '#0284C7', action: () => onNavigate('settings') }
  ];

  return (
    <div className="dashboard-card quick-actions-card">
      <div className="card-header-flex">
        <h3 className="card-title-heading">Thao tác nhanh</h3>
      </div>

      <div className="quick-actions-grid-6">
        {actions.map(act => {
          const IconComp = act.icon;

          return (
            <div 
              key={act.id} 
              className={`quick-action-tile ${act.isHighlight ? 'highlight-tile' : ''}`}
              onClick={act.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && act.action()}
              aria-label={`Thao tác nhanh: ${act.title}`}
            >
              <div className="quick-action-icon-circle" style={{ backgroundColor: act.bgColor, color: act.iconColor }}>
                <IconComp size={20} />
              </div>
              <span className="quick-action-title-text">{act.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
