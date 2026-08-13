import React from 'react';
import { Gift, Plus } from 'lucide-react';

export default function PromotionEmptyState({ onCreatePromotion }) {
  return (
    <div className="shipping-empty-state-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="empty-icon-circle" style={{ width: '80px', height: '80px', background: '#E6F4EA', color: '#00B14F', fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        🎁
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
        Chưa có chương trình khuyến mãi
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
        Bạn chưa tạo chương trình khuyến mãi nào cho cửa hàng. Hãy tạo chương trình để kích cầu mua sắm và tăng doanh thu!
      </p>
      <button 
        className="nav-btn-primary" 
        style={{ padding: '10px 20px', margin: '0 auto' }}
        onClick={onCreatePromotion}
      >
        <Plus size={16} /> Tạo chương trình đầu tiên
      </button>
    </div>
  );
}
