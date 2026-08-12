import React from 'react';
import { 
  ShoppingCart, Package, Truck, RotateCcw, 
  MessageSquare, ChevronRight, Inbox, BookOpen
} from 'lucide-react';

export default function PendingActions({ pendingItems = [], onActionClick, onNavigateTab }) {
  const defaultItems = [
    {
      id: 'pending_confirm',
      title: 'Đơn chờ xác nhận',
      count: 0,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      targetTab: 'orders',
      orderFilter: 'Chờ xác nhận',
      icon: ShoppingCart
    },
    {
      id: 'pending_pack',
      title: 'Đơn chờ đóng gói',
      count: 0,
      bgColor: '#FFF7ED',
      iconColor: '#F97316',
      targetTab: 'orders',
      orderFilter: 'Chờ đóng gói',
      icon: Package
    },
    {
      id: 'pending_handover',
      title: 'Đơn chờ bàn giao',
      count: 0,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2',
      targetTab: 'orders',
      orderFilter: 'Chờ bàn giao',
      icon: Truck
    },
    {
      id: 'returns',
      title: 'Yêu cầu trả hàng',
      count: 0,
      bgColor: '#F3E8FF',
      iconColor: '#A855F7',
      targetTab: 'orders',
      orderFilter: 'Trả hàng',
      icon: RotateCcw
    },
    {
      id: 'unread_chats',
      title: 'Tin nhắn chưa trả lời',
      count: 0,
      bgColor: '#F0FDF4',
      iconColor: '#00B14F',
      targetTab: 'chat',
      orderFilter: null,
      icon: MessageSquare
    }
  ];

  const itemsToRender = (pendingItems && pendingItems.length > 0) 
    ? pendingItems.map(item => {
        const found = defaultItems.find(d => d.id === item.id || d.key === item.key);
        return found ? { ...found, count: item.count } : item;
      })
    : defaultItems;

  const totalCount = itemsToRender.reduce((sum, i) => sum + (i.count || 0), 0);

  const handleClick = (item) => {
    if (onActionClick) {
      onActionClick(item.targetTab, item.orderFilter);
    }
  };

  return (
    <section className="pending-actions-section">
      <div className="section-header-title">
        <h3>Việc cần xử lý</h3>
      </div>

      {totalCount > 0 ? (
        <div className="pending-actions-grid">
          {itemsToRender.map(item => {
            const IconComp = item.icon || ShoppingCart;

            return (
              <div 
                key={item.id} 
                className="action-card-item"
                onClick={() => handleClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(item)}
                title={`Mở trang ${item.title}`}
                aria-label={`${item.title}: ${item.count} items`}
              >
                <div 
                  className="action-card-icon-box"
                  style={{ backgroundColor: item.bgColor, color: item.iconColor }}
                >
                  <IconComp size={20} />
                </div>

                <div className="action-card-text">
                  <span className="action-card-label">{item.title}</span>
                  <span className="action-card-count">{item.count}</span>
                </div>

                <ChevronRight size={16} className="action-card-arrow" />
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Empty State for New Sellers */
        <div className="pending-empty-banner">
          <div className="inbox-icon-circle">
            <Inbox size={22} className="inbox-icon" />
          </div>
          <div className="empty-pending-text">
            <strong>Bạn chưa có việc nào cần xử lý</strong>
            <p>Đơn hàng mới, yêu cầu hủy/trả hàng và tin nhắn người mua sẽ xuất hiện tự động tại đây.</p>
          </div>
          {onNavigateTab && (
            <button className="nav-btn-secondary guide-btn" onClick={() => onNavigateTab('settings')}>
              <BookOpen size={15} /> Xem hướng dẫn bán hàng
            </button>
          )}
        </div>
      )}
    </section>
  );
}
