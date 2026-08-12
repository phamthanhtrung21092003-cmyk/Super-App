import React, { useState } from 'react';
import { 
  Search, Bell, MessageSquare, HelpCircle, ChevronDown, 
  Menu, LogOut, Settings
} from 'lucide-react';

// Custom S-life Logo SVG Icon (Official Brand Emblem)
const SLifeIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="7" fill="url(#slife-header-grad)" />
    <path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12C4.5 16.14 7.86 19.5 12 19.5C16.14 19.5 19.5 16.14 19.5 12C19.5 7.86 16.14 4.5 12 4.5ZM13.8 15.6C12.42 15.6 11.22 14.82 10.62 13.68C10.44 13.32 10.74 12.9 11.16 12.9H12.84C13.14 12.9 13.44 13.14 13.62 13.44C13.86 13.86 14.34 14.1 14.88 14.1C15.54 14.1 16.08 13.56 16.08 12.9C16.08 12.24 15.54 11.7 14.88 11.7H11.7C10.05 11.7 8.7 10.35 8.7 8.7C8.7 7.05 10.05 5.7 11.7 5.7C13.08 5.7 14.28 6.48 14.88 7.62C15.06 7.98 14.76 8.4 14.34 8.4H12.66C12.36 8.4 12.06 8.16 11.88 7.86C11.64 7.44 11.16 7.2 10.62 7.2C9.96 7.2 9.42 7.74 9.42 8.4C9.42 9.06 9.96 9.6 10.62 9.6H13.8C15.45 9.6 16.8 10.95 16.8 12.6C16.8 14.25 15.45 15.6 13.8 15.6Z" fill="white"/>
    <defs>
      <linearGradient id="slife-header-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00B14F" />
        <stop offset="1" stopColor="#007333" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Header({ 
  user, 
  shopInfo, 
  isSidebarCollapsed, 
  onToggleSidebar, 
  onLogout,
  onNavigateTab
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="seller-header" role="banner">
      {/* Left: Brand Identity & Sidebar Collapse Button */}
      <div className="seller-header-left">
        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggleSidebar} 
          title={isSidebarCollapsed ? "Mở rộng menu Sidebar" : "Thu gọn menu Sidebar"}
          aria-label={isSidebarCollapsed ? "Mở rộng menu Sidebar" : "Thu gọn menu Sidebar"}
        >
          <Menu size={20} />
        </button>

        <div 
          className="header-brand-logo" 
          onClick={() => onNavigateTab('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateTab('home')}
          aria-label="S-SHOPPING Kênh Người Bán Trang chủ"
        >
          <SLifeIcon size={28} />
          <div className="brand-text-wrapper">
            <span className="brand-main-title">S-SHOPPING</span>
            <span className="brand-sub-title">Kênh Người Bán</span>
          </div>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="seller-header-center">
        <div className="header-search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm, đơn hàng, SKU..." 
            className="search-input"
            aria-label="Tìm kiếm sản phẩm, đơn hàng, SKU"
          />
          <kbd className="keyboard-shortcut-badge" aria-hidden="true">Ctrl + K</kbd>
        </div>
      </div>

      {/* Right: Quick Notifications, Messages, Help & Profile Dropdown */}
      <div className="seller-header-right">
        {/* Notifications */}
        <button className="header-action-icon-btn" title="Thông báo" aria-label="Thông báo">
          <Bell size={18} />
          <span className="header-badge-count red-badge" aria-label="0 thông báo">0</span>
        </button>

        {/* Messages / Chat */}
        <button 
          className="header-action-icon-btn" 
          title="Tin nhắn"
          aria-label="Mở Hộp thoại Tin nhắn Chat"
          onClick={() => onNavigateTab('chat')}
        >
          <MessageSquare size={18} />
          <span className="header-badge-count green-badge" aria-label="0 tin nhắn chưa đọc">0</span>
        </button>

        {/* Help Center */}
        <button className="header-action-icon-btn text-link-btn" title="Trợ giúp" aria-label="Trung tâm Trợ giúp người bán">
          <HelpCircle size={18} />
          <span className="hide-on-mobile">Trợ giúp</span>
        </button>

        {/* User Account Dropdown */}
        <div className="header-user-profile-container">
          <div 
            className="user-profile-trigger" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
            aria-label="Menu tài khoản người bán"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src={shopInfo?.logo || user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt="Avatar" 
              className="user-avatar-img"
            />
            <div className="user-info-text">
              <span className="user-name-title">{user?.ownerName || shopInfo?.ownerName || 'Nguyễn Văn A'}</span>
              <span className="user-shop-subtitle">{user?.shopName || shopInfo?.name || 'Shop mới'}</span>
            </div>
            <ChevronDown size={14} className={`dropdown-chevron ${showProfileMenu ? 'rotate' : ''}`} />
          </div>

          {/* Profile Dropdown Popup Menu */}
          {showProfileMenu && (
            <div className="profile-dropdown-menu" role="menu">
              <div className="dropdown-menu-header">
                <strong>{user?.ownerName || 'Nguyễn Văn A'}</strong>
                <p>{user?.shopName || 'Shop ABC'}</p>
              </div>
              <hr className="dropdown-divider" />
              <button 
                className="dropdown-menu-item"
                role="menuitem"
                onClick={() => { setShowProfileMenu(false); onNavigateTab('settings'); }}
              >
                <Settings size={16} /> Cài đặt Shop
              </button>
              <button 
                className="dropdown-menu-item logout-item"
                role="menuitem"
                onClick={() => { setShowProfileMenu(false); onLogout(); }}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
