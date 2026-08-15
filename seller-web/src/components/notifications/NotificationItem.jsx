import React, { useState } from 'react';
import { 
  ShoppingCart, Package, Wallet, Tag, 
  Video, Radio, Megaphone, ChevronRight, 
  MoreVertical, Check, Trash2 
} from 'lucide-react';

export default function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDelete
}) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    id,
    type = 'SYSTEM',
    title,
    content,
    createdAt,
    read = false,
    categoryName
  } = notification;

  // Icon, color and label configuration per notification type (Requirement 8)
  const getTypeConfig = (t) => {
    switch (t) {
      case 'ORDER':
        return {
          icon: ShoppingCart,
          bgColor: '#FEF2F2',
          iconColor: '#EF4444',
          label: 'Đơn hàng',
          tagClass: 'tag-red'
        };
      case 'INVENTORY':
      case 'PRODUCT':
        return {
          icon: Package,
          bgColor: '#FFF7ED',
          iconColor: '#F97316',
          label: 'Kho hàng',
          tagClass: 'tag-orange'
        };
      case 'FINANCE':
        return {
          icon: Wallet,
          bgColor: '#F0FDF4',
          iconColor: '#00B14F',
          label: 'Tài chính',
          tagClass: 'tag-green'
        };
      case 'PROMOTION':
        return {
          icon: Tag,
          bgColor: '#F3E8FF',
          iconColor: '#9333EA',
          label: 'Khuyến mãi',
          tagClass: 'tag-purple'
        };
      case 'VIDEO':
        return {
          icon: Video,
          bgColor: '#EFF6FF',
          iconColor: '#1877F2',
          label: 'Kênh Video',
          tagClass: 'tag-blue'
        };
      case 'LIVESTREAM':
        return {
          icon: Radio,
          bgColor: '#FDF2F8',
          iconColor: '#DB2777',
          label: 'Livestream',
          tagClass: 'tag-pink'
        };
      case 'SYSTEM':
      default:
        return {
          icon: Megaphone,
          bgColor: '#F1F5F9',
          iconColor: '#475569',
          label: 'Hệ thống',
          tagClass: 'tag-gray'
        };
    }
  };

  const config = getTypeConfig(type);
  const IconComp = config.icon;

  const handleRowClick = () => {
    if (onClick) onClick(notification);
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMarkReadAction = (e) => {
    e.stopPropagation();
    if (onMarkAsRead) onMarkAsRead(id);
    setShowMenu(false);
  };

  const handleDeleteAction = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
    setShowMenu(false);
  };

  return (
    <div 
      className={`notification-item-card ${!read ? 'is-unread' : 'is-read'}`}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRowClick()}
    >
      {/* 1. Left Icon */}
      <div 
        className="noti-icon-circle"
        style={{ backgroundColor: config.bgColor, color: config.iconColor }}
      >
        <IconComp size={20} />
      </div>

      {/* 2. Content Info */}
      <div className="noti-content-body">
        <div className="noti-header-row">
          <span className={`noti-category-tag ${config.tagClass}`}>
            {categoryName || config.label}
          </span>
          <span className="noti-time-text">{createdAt}</span>
        </div>

        <h4 className="noti-title-text">{title}</h4>
        <p className="noti-desc-text">{content}</p>
      </div>

      {/* 3. Right Status & Actions */}
      <div className="noti-right-actions" onClick={(e) => e.stopPropagation()}>
        {!read && (
          <span className="noti-new-badge">
            <span className="new-dot" /> Mới
          </span>
        )}

        <div className="noti-menu-container">
          <button 
            type="button" 
            className="noti-more-btn"
            onClick={handleToggleMenu}
            title="Thao tác"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="noti-dropdown-menu">
              {!read && (
                <button 
                  type="button" 
                  className="noti-menu-item"
                  onClick={handleMarkReadAction}
                >
                  <Check size={14} /> Đánh dấu đã đọc
                </button>
              )}
              <button 
                type="button" 
                className="noti-menu-item text-danger"
                onClick={handleDeleteAction}
              >
                <Trash2 size={14} /> Xóa thông báo
              </button>
            </div>
          )}
        </div>

        <ChevronRight size={16} className="noti-arrow-icon" />
      </div>
    </div>
  );
}
