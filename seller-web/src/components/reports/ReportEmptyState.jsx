import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';

export default function ReportEmptyState({ onAddProduct, onNavigateToTab }) {
  return (
    <div className="shipping-empty-state-card" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '20px' }}>
      <div className="empty-icon-circle" style={{ width: '80px', height: '80px', background: '#E6F4EA', color: '#00B14F', fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        📊
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
        Chưa có dữ liệu báo cáo
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
        Dữ liệu báo cáo sẽ xuất hiện tự động sau khi cửa hàng của bạn đăng bán sản phẩm và phát sinh đơn hàng đầu tiên.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          className="nav-btn-secondary" 
          onClick={() => alert('Đang mở Hướng dẫn đọc & phân tích chỉ số kinh doanh Seller Center...')}
        >
          <HelpCircle size={15} /> Xem hướng dẫn
        </button>

        <button 
          className="nav-btn-primary" 
          onClick={() => onNavigateToTab && onNavigateToTab('products')}
        >
          <Plus size={16} /> + Đăng sản phẩm ngay
        </button>
      </div>
    </div>
  );
}
