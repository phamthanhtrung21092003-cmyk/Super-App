import React, { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import sellerService, { MOCK_CONVERSATIONS_DATA, MOCK_MESSAGES_DATA } from '../../data/sellerService';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import CustomerInfo from './CustomerInfo';
import ProductPickerModal from './ProductPickerModal';
import OrderPickerModal from './OrderPickerModal';

export default function MessagesPage({
  existingProducts = [],
  existingOrders = [],
  initialFilter = 'all',
  onViewProduct,
  onViewOrder
}) {
  // 1. Data States
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS_DATA);
  const [activeConversationId, setActiveConversationId] = useState('conv_1');
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES_DATA);
  const [quickReplies, setQuickReplies] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);

  // 2. Filter & Search States
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Modals & Drawers States
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
  const [showCustomerDrawerMobile, setShowCustomerDrawerMobile] = useState(false);

  // Sync initialFilter from props (e.g. when navigated from Dashboard "unread")
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  // Load quick reply templates
  useEffect(() => {
    sellerService.getQuickReplies().then(res => setQuickReplies(res));
  }, []);

  // Update active conversation & customer orders
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    if (activeConversation) {
      sellerService.getCustomerOrders(activeConversation.customerId, existingOrders).then(res => {
        setCustomerOrders(res);
      });
    }
  }, [activeConversation, existingOrders]);

  // Filtered conversations list
  const filteredConversations = conversations.filter(c => {
    // Tab filter
    if (activeFilter === 'unread' && c.unreadCount <= 0) return false;
    if (activeFilter === 'replied' && !c.isReplied && c.unreadCount > 0) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.customerName && c.customerName.toLowerCase().includes(q);
      const matchMsg = c.lastMessage && c.lastMessage.toLowerCase().includes(q);
      const matchPhone = c.customerPhone && c.customerPhone.includes(q);
      if (!matchName && !matchMsg && !matchPhone) return false;
    }

    return true;
  });

  // Current messages thread
  const activeMessages = activeConversationId ? (allMessages[activeConversationId] || []) : [];

  // Handlers
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    // Mark conversation as read
    sellerService.markConversationAsRead(convId, conversations).then(updated => {
      setConversations(updated);
    });
  };

  const handleMarkAllAsRead = async () => {
    const updated = await sellerService.markAllConversationsAsRead(conversations);
    setConversations(updated);
    alert('✅ Đã đánh dấu tất cả cuộc trò chuyện là đã đọc.');
  };

  const handleSendMessage = async (msgData) => {
    if (!activeConversationId) return;
    const res = await sellerService.sendMessage(activeConversationId, msgData, allMessages, conversations);
    setAllMessages(res.updatedMessages);
    setConversations(res.updatedConversations);
  };

  const handleSelectProduct = (productId) => {
    handleSendMessage({
      content: 'Chào bạn! Đây là thông tin chi tiết sản phẩm bạn đang quan tâm:',
      productId
    });
    setIsProductPickerOpen(false);
  };

  const handleSelectOrder = (orderId) => {
    handleSendMessage({
      content: 'Shop gửi thông tin cập nhật về đơn hàng của bạn:',
      orderId
    });
    setIsOrderPickerOpen(false);
  };

  return (
    <div className="messages-page-wrapper">
      {/* 1. Page Header (Requirement 5) */}
      <div className="messages-page-header">
        <div className="messages-title-block">
          <h1 className="messages-main-title">Trung tâm Tin nhắn</h1>
          <p className="messages-sub-title">
            Quản lý và trả lời khách hàng của Shop.
          </p>
        </div>

        <div className="messages-header-actions">
          <button 
            type="button" 
            className="btn-mark-all-read"
            onClick={handleMarkAllAsRead}
            title="Đánh dấu tất cả tin nhắn đã đọc"
          >
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Layout Container (Requirement 6) */}
      <div className="messages-layout-3cols">
        {/* Column 1: Conversation List (28%) */}
        <div className={`col-conversation-list ${activeConversationId && 'has-active-conv'}`}>
          <ConversationList 
            conversations={filteredConversations}
            activeConversationId={activeConversationId}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Column 2: Chat Window (47%) */}
        <div className={`col-chat-window ${!activeConversationId && 'hide-on-mobile'}`}>
          <ChatWindow 
            conversation={activeConversation}
            messages={activeMessages}
            existingProducts={existingProducts}
            existingOrders={existingOrders}
            customerOrders={customerOrders}
            quickReplies={quickReplies}
            onSendMessage={handleSendMessage}
            onOpenProductPicker={() => setIsProductPickerOpen(true)}
            onOpenOrderPicker={() => setIsOrderPickerOpen(true)}
            onViewProduct={onViewProduct}
            onViewOrder={onViewOrder}
            onToggleCustomerInfo={() => setShowCustomerDrawerMobile(!showCustomerDrawerMobile)}
            onBackToList={() => setActiveConversationId(null)}
          />
        </div>

        {/* Column 3: Customer Info (25%) */}
        <div className="col-customer-info desktop-only">
          <CustomerInfo 
            conversation={activeConversation}
            customerOrders={customerOrders}
            onViewOrder={onViewOrder}
          />
        </div>
      </div>

      {/* Customer Info Drawer on Tablet / Mobile */}
      {showCustomerDrawerMobile && (
        <div className="mobile-customer-drawer-backdrop" onClick={() => setShowCustomerDrawerMobile(false)}>
          <div className="mobile-customer-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <CustomerInfo 
              conversation={activeConversation}
              customerOrders={customerOrders}
              onViewOrder={(ord) => {
                setShowCustomerDrawerMobile(false);
                if (onViewOrder) onViewOrder(ord);
              }}
              onCloseMobileDrawer={() => setShowCustomerDrawerMobile(false)}
            />
          </div>
        </div>
      )}

      {/* Product Picker Modal (Requirement 12) */}
      {isProductPickerOpen && (
        <ProductPickerModal 
          existingProducts={existingProducts}
          onSelectProduct={handleSelectProduct}
          onClose={() => setIsProductPickerOpen(false)}
        />
      )}

      {/* Order Picker Modal (Requirement 13) */}
      {isOrderPickerOpen && (
        <OrderPickerModal 
          customerOrders={customerOrders.length > 0 ? customerOrders : existingOrders}
          onSelectOrder={handleSelectOrder}
          onClose={() => setIsOrderPickerOpen(false)}
        />
      )}
    </div>
  );
}
