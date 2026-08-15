import React from 'react';
import { 
  X, ShoppingCart, Package, Wallet, Tag, 
  Video, Radio, Megaphone, ArrowUpRight, Clock, Hash
} from 'lucide-react';

export default function NotificationDetailDrawer({
  notification,
  onClose,
  onDeepLinkNavigate
}) {
  if (!notification) return null;

  const {
    type = 'SYSTEM',
    title,
    content,
    createdAt,
    referenceId,
    categoryName
  } = notification;

  const getTypeConfig = (t) => {
    switch (t) {
      case 'ORDER':
        return {
          icon: ShoppingCart,
          bgColor: '#FEF2F2',
          iconColor: '#EF4444',
          label: 'Đơn hàng',
          actionText: 'Đi đến đơn hàng',
          targetTab: 'orders'
        };
      case 'INVENTORY':
      case 'PRODUCT':
        return {
          icon: Package,
          bgColor: '#FFF7ED',
          iconColor: '#F97316',
          label: 'Kho hàng',
          actionText: 'Đi đến kho hàng',
          targetTab: 'inventory'
        };
      case 'FINANCE':
        return {
          icon: Wallet,
          bgColor: '#F0FDF4',
          iconColor: '#00B14F',
          label: 'Tài chính',
          actionText: 'Đi đến tài chính',
          targetTab: 'finance'
        };
      case 'PROMOTION':
        return {
          icon: Tag,
          bgColor: '#F3E8FF',
          iconColor: '#9333EA',
          label: 'Khuyến mãi',
          actionText: 'Đi đến Khuyến mãi',
          targetTab: 'marketing'
        };
      case 'VIDEO':
        return {
          icon: Video,
          bgColor: '#EFF6FF',
          iconColor: '#1877F2',
          label: 'Kênh Video',
          actionText: 'Đi đến Kênh Video',
          targetTab: 'video'
        };
      case 'LIVESTREAM':
        return {
          icon: Radio,
          bgColor: '#FDF2F8',
          iconColor: '#DB2777',
          label: 'Livestream',
          actionText: 'Đi đến Livestream',
          targetTab: 'livestream'
        };
      case 'SYSTEM':
      default:
        return {
          icon: Megaphone,
          bgColor: '#F1F5F9',
          iconColor: '#475569',
          label: 'Hệ thống',
          actionText: 'Xem chi tiết cài đặt',
          targetTab: 'settings'
        };
    }
  };

  const config = getTypeConfig(type);
  const IconComp = config.icon;

  const handleActionClick = () => {
    if (onDeepLinkNavigate) {
      onDeepLinkNavigate(config.targetTab, referenceId, notification);
    }
    onClose();
  };

  return (
    <div className="noti-drawer-backdrop" onClick={onClose}>
      <div className="noti-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="noti-drawer-header">
          <div className="noti-drawer-title-wrap">
            <div 
              className="noti-drawer-icon"
              style={{ backgroundColor: config.bgColor, color: config.iconColor }}
            >
              <IconComp size={18} />
            </div>
            <h3 className="noti-drawer-title">Chi tiết thông báo</h3>
          </div>

          <button type="button" className="noti-drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="noti-drawer-body">
          <div className="noti-detail-meta-box">
            <span className="noti-detail-category-tag">
              {categoryName || config.label}
            </span>
            <div className="noti-detail-time">
              <Clock size={13} /> {createdAt}
            </div>
          </div>

          <h2 className="noti-detail-heading">{title}</h2>

          <div className="noti-detail-content-card">
            <p className="noti-detail-desc">{content}</p>
          </div>

          {referenceId && (
            <div className="noti-reference-info-card">
              <div className="ref-label">
                <Hash size={14} /> Mã tham chiếu:
              </div>
              <strong className="ref-value">{referenceId}</strong>
            </div>
          )}
        </div>

        {/* Footer with Deep Link Button (Requirement 12 & 13) */}
        <div className="noti-drawer-footer">
          <button type="button" className="btn-drawer-cancel" onClick={onClose}>
            Đóng
          </button>

          {config.actionText && (
            <button 
              type="button" 
              className="btn-drawer-action"
              onClick={handleActionClick}
            >
              {config.actionText} <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
