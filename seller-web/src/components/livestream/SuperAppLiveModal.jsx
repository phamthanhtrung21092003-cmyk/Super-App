import React, { useState } from 'react';
import { Radio, Eye, Heart, ShoppingBag, Send, X, Pin, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SuperAppLiveModal({ livestream, onClose, catalogProducts = [] }) {
  const [viewMode, setViewMode] = useState('ROOM'); // 'FEED' or 'ROOM'
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [likesCount, setLikesCount] = useState(livestream?.likes || 12500);
  const [userComment, setUserComment] = useState('');
  const [chatList, setChatList] = useState([
    { user: 'Nguyễn Văn A', text: 'Áo này còn size M không shop?' },
    { user: 'Trần Thị B', text: 'Freeship HCM không ạ?' },
    { user: 'Shop S-SHOPPING', text: 'Dạ còn đủ size M, L, XL nhé bạn ơi! ❤️', isShop: true }
  ]);

  const targetProd = catalogProducts.find(p => p.id === (livestream?.pinnedProductId || 'p2')) || {
    id: 'p2',
    name: 'Áo thun nam basic',
    price: 150000,
    sku: 'ATB-BLK-M'
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setChatList([...chatList, { user: 'Bạn (Khách hàng V-life)', text: userComment }]);
    setUserComment('');
  };

  return (
    <div className="shipping-modal-backdrop" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="shipping-modal-panel" 
        style={{ 
          maxWidth: '380px', 
          borderRadius: '36px', 
          border: '8px solid #1E293B', 
          background: '#000', 
          color: '#fff', 
          overflow: 'hidden', 
          padding: 0,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Status Header Bar */}
        <div style={{ background: '#000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#EF4444', background: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>🔴 V-LIFE LIVE</span>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>{viewMode === 'FEED' ? 'Video Feed' : 'Live Room'}</span>
          </div>
          <button style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* FEED MODE MOCK */}
        {viewMode === 'FEED' && (
          <div style={{ position: 'relative', width: '100%', height: '560px', background: '#111', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>📱 Đang lướt V-life Video Feed...</span>

            <div 
              style={{ position: 'relative', width: '100%', height: '260px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #EF4444', cursor: 'pointer' }}
              onClick={() => setViewMode('ROOM')}
            >
              <img src={livestream?.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'} alt="Feed item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px' }}>
                🔴 LIVE STREAMING NOW
              </div>
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '8px 12px', borderRadius: '10px' }}>
                <strong style={{ fontSize: '12px', color: '#fff', display: 'block' }}>{livestream?.title || 'Top deal cuối tuần'}</strong>
                <span style={{ fontSize: '10px', color: '#00B14F' }}>👁️ 2.350 đang xem • Bấm để vào xem LIVE ngay &gt;</span>
              </div>
            </div>
          </div>
        )}

        {/* ROOM MODE (FULL LIVE STREAM SIMULATION) */}
        {viewMode === 'ROOM' && (
          <div style={{ position: 'relative', width: '100%', height: '560px', background: '#000' }}>
            {/* Background Stream Player */}
            <img src={livestream?.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'} alt="Live Stream Room" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />

            {/* Top Bar inside Stream */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 10px 4px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="Shop" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#fff', display: 'block' }}>S-SHOPPING Official</span>
                  <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: '800' }}>🔴 2.350 đang xem</span>
                </div>
                <button className="nav-btn-primary" style={{ fontSize: '9px', padding: '2px 8px', marginLeft: '6px' }}>
                  + Theo dõi
                </button>
              </div>
            </div>

            {/* Chat Stream overlay at left bottom */}
            <div style={{ position: 'absolute', bottom: '90px', left: '12px', width: '70%', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              {chatList.map((m, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '8px' }}>
                  <strong style={{ color: m.isShop ? '#00B14F' : '#38BDF8' }}>{m.user}: </strong>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>

            {/* Interactive Likes button right side */}
            <div style={{ position: 'absolute', right: '12px', bottom: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button 
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}
                onClick={() => setLikesCount(likesCount + 1)}
              >
                <Heart size={22} fill="#fff" />
              </button>
              <span style={{ fontSize: '10px', fontWeight: '800' }}>{(likesCount).toLocaleString('vi-VN')}</span>
            </div>

            {/* PINNED PRODUCT OVERLAY (PINNED AT BOTTOM) */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #00B14F' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} style={{ color: '#00B14F' }} />
                <div>
                  <span style={{ fontSize: '9px', color: '#00B14F', fontWeight: '900', display: 'block' }}>📌 ĐANG GHIM BÁN</span>
                  <strong style={{ fontSize: '11px', color: '#fff' }}>{targetProd.name}</strong>
                  <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '900', display: 'block' }}>{(targetProd.price || 150000).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <button 
                className="nav-btn-primary" 
                style={{ fontSize: '11px', padding: '6px 12px', background: '#00B14F' }}
                onClick={() => setShowBottomSheet(true)}
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}

        {/* QUICK PURCHASE BOTTOM SHEET SIMULATION */}
        {showBottomSheet && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 20 }}>
            <div style={{ background: '#1E293B', borderRadius: '24px 24px 0 0', padding: '20px', color: '#fff', borderTop: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px' }}>🛒 CHỐT ĐƠN QUICK PURCHASE</strong>
                <button style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowBottomSheet(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200" alt="Prod" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{targetProd.name}</strong>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Mã SP: {targetProd.id} • SKU: {targetProd.sku}</span>
                  <strong style={{ fontSize: '14px', color: '#00B14F', display: 'block', marginTop: '2px' }}>{(targetProd.price || 150000).toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>

              <button 
                className="nav-btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={() => {
                  alert(`🎉 Đặt hàng thành công sản phẩm ${targetProd.name}! Hệ thống đã tạo Order ghi nhận từ LivestreamID: ${livestream?.id || 'LIVE001'}`);
                  setShowBottomSheet(false);
                }}
              >
                <CheckCircle2 size={16} /> Thanh toán nhanh & Chốt đơn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
