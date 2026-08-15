import React, { useState } from 'react';
import { User, Phone, Calendar, ShoppingCart, DollarSign, Copy, Check, X } from 'lucide-react';
import CustomerOrderHistory from './CustomerOrderHistory';

export default function CustomerInfo({ 
  conversation, 
  customerOrders = [],
  onViewOrder,
  onCloseMobileDrawer 
}) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!conversation) {
    return (
      <div className="customer-info-panel empty-info">
        <User size={36} className="empty-user-icon" />
        <p>Chọn một cuộc trò chuyện để xem hồ sơ khách hàng</p>
      </div>
    );
  }

  const {
    customerName = 'Khách hàng',
    customerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    customerPhone = '0987.654.321',
    customerJoinDate = '12/03/2025',
    customerTag = '⭐ Khách hàng thân thiết',
    totalOrders = 12,
    totalSpent = 8450000
  } = conversation;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customerPhone.replace(/[^0-9]/g, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="customer-info-panel">
      {/* 1. Header Bar */}
      <div className="cust-info-header">
        <h3 className="cust-info-title">Thông tin khách hàng</h3>
        {onCloseMobileDrawer && (
          <button type="button" className="cust-info-close-btn" onClick={onCloseMobileDrawer}>
            <X size={18} />
          </button>
        )}
      </div>

      <div className="cust-info-scroll-body">
        {/* 2. Customer Avatar & Name & Tag */}
        <div className="cust-profile-card">
          <img src={customerAvatar} alt={customerName} className="cust-big-avatar" />
          <h4 className="cust-full-name">{customerName}</h4>
          
          {/* Customer Tag (Requirement 16) */}
          <span className="cust-tag-badge">
            {customerTag}
          </span>
        </div>

        {/* 3. Customer Meta Info (Phone & Join Date) */}
        <div className="cust-meta-list-card">
          <div className="cust-meta-item">
            <div className="meta-left">
              <Phone size={14} className="icon-muted" />
              <span className="meta-lbl">Số điện thoại</span>
            </div>
            <div className="meta-right">
              <strong className="meta-val">{customerPhone}</strong>
              <button 
                type="button" 
                className="btn-copy-mini"
                onClick={handleCopyPhone}
                title="Sao chép số điện thoại"
              >
                {copiedPhone ? <Check size={13} color="#00B14F" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div className="cust-meta-item">
            <div className="meta-left">
              <Calendar size={14} className="icon-muted" />
              <span className="meta-lbl">Ngày tham gia</span>
            </div>
            <div className="meta-right">
              <span className="meta-val">{customerJoinDate}</span>
            </div>
          </div>
        </div>

        {/* 4. Customer KPI Stats Summary (Requirement 14) */}
        <div className="cust-kpi-stats-grid">
          <div className="cust-kpi-box">
            <div className="kpi-icon-circle blue">
              <ShoppingCart size={16} />
            </div>
            <div className="kpi-info-col">
              <span className="kpi-label">Tổng số đơn</span>
              <strong className="kpi-value">{totalOrders} đơn hàng</strong>
            </div>
          </div>

          <div className="cust-kpi-box">
            <div className="kpi-icon-circle green">
              <DollarSign size={16} />
            </div>
            <div className="kpi-info-col">
              <span className="kpi-label">Tổng chi tiêu</span>
              <strong className="kpi-value green-val">
                {totalSpent.toLocaleString('vi-VN')}đ
              </strong>
            </div>
          </div>
        </div>

        {/* 5. Recent Orders List (Requirement 15) */}
        <CustomerOrderHistory 
          orders={customerOrders}
          onViewOrder={onViewOrder}
        />
      </div>
    </div>
  );
}
