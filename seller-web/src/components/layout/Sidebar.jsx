import React from 'react';
import { 
  Home, Package, FileText, Warehouse, MessageSquare, Truck, 
  Wallet, Tag, Video, Radio, BarChart3, Settings, Store,
  ChevronRight, ArrowRight
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  isCollapsed,
  productCount = 0,
  orderCount = 0,
  unreadMessageCount = 8,
  setupProgressBadge = null
}) {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, badge: null },
    { id: 'shop_setup', label: 'Hoàn thiện Shop', icon: Store, badge: setupProgressBadge, hasSubMenu: false },
    { id: 'products', label: 'Sản phẩm', icon: Package, badge: productCount > 0 ? productCount : null, hasSubMenu: true },
    { id: 'orders', label: 'Đơn hàng', icon: FileText, badge: orderCount > 0 ? orderCount : null, hasSubMenu: true },
    { id: 'inventory', label: 'Kho hàng', icon: Warehouse, badge: null, hasSubMenu: true },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare, badge: unreadMessageCount > 0 ? unreadMessageCount : null, hasSubMenu: false },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck, badge: null, hasSubMenu: true },
    { id: 'finance', label: 'Tài chính', icon: Wallet, badge: null, hasSubMenu: true },
    { id: 'marketing', label: 'Khuyến mãi', icon: Tag, badge: null, hasSubMenu: true },
    { id: 'video', label: 'Kênh Video', icon: Video, badge: null, hasSubMenu: true },
    { id: 'livestream', label: 'Livestream', icon: Radio, badge: null, hasSubMenu: true },
    { id: 'analytics', label: 'Báo cáo', icon: BarChart3, badge: null, hasSubMenu: true },
    { id: 'settings', label: 'Cài đặt Shop', icon: Settings, badge: null, hasSubMenu: true }
  ];

  return (
    <aside className={`seller-sidebar ${isCollapsed ? 'collapsed' : ''}`} role="navigation">
      <nav className="sidebar-nav-list">
        {menuItems.map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div 
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-item-left">
                <IconComp size={19} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="nav-item-right">
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="nav-badge-count">{item.badge}</span>
                  )}
                  {item.hasSubMenu && (
                    <ChevronRight size={14} className="nav-chevron-arrow" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Promo Card (Hidden when collapsed) */}
      {!isCollapsed && (
        <div className="sidebar-promo-banner">
          <span className="promo-tag">Tham gia ngay</span>
          <h4 className="promo-title">Chiến dịch Freeship tháng 8</h4>
          <p className="promo-desc">Tăng doanh thu vượt trội với hỗ trợ phí ship 0đ</p>
          <button className="promo-action-btn">
            Tham gia ngay <ArrowRight size={14} />
          </button>
          
          <div className="promo-illustration">
            <Truck size={42} className="truck-icon-glow" />
          </div>
        </div>
      )}
    </aside>
  );
}
