import React from 'react';
import { Plus } from 'lucide-react';

export default function VideoEmptyState({ onUploadVideo }) {
  return (
    <div className="shipping-empty-state-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="empty-icon-circle" style={{ width: '80px', height: '80px', background: '#E6F4EA', color: '#00B14F', fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        🎬
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
        Chưa có video nào
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
        Đăng video đầu tiên để giới thiệu sản phẩm và tiếp cận hàng triệu khách hàng mua sắm trên V-life Super App.
      </p>
      <button 
        className="nav-btn-primary" 
        style={{ padding: '10px 20px', margin: '0 auto' }}
        onClick={onUploadVideo}
      >
        <Plus size={16} /> Đăng video ngay
      </button>
    </div>
  );
}
