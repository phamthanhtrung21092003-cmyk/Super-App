import React from 'react';
import { Plus, ShoppingBag, Video, Radio, Tag, BarChart3 } from 'lucide-react';

export default function QuickActions({ onNavigate, onOpenAddProductModal }) {
  const actions = [
    { id: 'add_prod', title: '+ Đăng sản phẩm', icon: Plus, bgColor: '#F0FDF4', iconColor: '#00B14F', action: onOpenAddProductModal, isHighlight: true },
    { id: 'orders_mgmt', title: 'Quản lý đơn', icon: ShoppingBag, bgColor: '#EFF6FF', iconColor: '#1877F2', action: () => onNavigate('orders') },
    { id: 'post_video', title: 'Đăng Video', icon: Video, bgColor: '#F3E8FF', iconColor: '#A855F7', action: () => onNavigate('video') },
    { id: 'create_live', title: 'Tạo Livestream', icon: Radio, bgColor: '#FEF2F2', iconColor: '#EF4444', action: () => onNavigate('livestream') },
    { id: 'create_voucher', title: 'Tạo Voucher', icon: Tag, bgColor: '#FFF7ED', iconColor: '#F97316', action: () => onNavigate('marketing') },
    { id: 'view_reports', title: 'Xem doanh thu', icon: BarChart3, bgColor: '#E0F2FE', iconColor: '#0284C7', action: () => onNavigate('analytics') }
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
