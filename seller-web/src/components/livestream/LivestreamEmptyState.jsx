import React from 'react';
import { Plus } from 'lucide-react';

export default function LivestreamEmptyState({ onCreateLivestream }) {
  return (
    <div className="shipping-empty-state-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="empty-icon-circle" style={{ width: '80px', height: '80px', background: '#FEF2F2', color: '#EF4444', fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        📺
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
        Chưa có livestream nào
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
        Bắt đầu livestream để giới thiệu sản phẩm và tương tác trực tiếp với hàng triệu khách hàng trên V-life Super App.
      </p>
      <button 
        className="nav-btn-primary" 
        style={{ padding: '10px 20px', margin: '0 auto', background: '#EF4444', borderColor: '#EF4444' }}
        onClick={onCreateLivestream}
      >
        <Plus size={16} /> Tạo livestream đầu tiên
      </button>
    </div>
  );
}
