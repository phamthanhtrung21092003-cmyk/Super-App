import React, { useState } from 'react';
import { Radio, Eye, Heart, ShoppingBag, DollarSign, Pin, Send, StopCircle, X, Check } from 'lucide-react';

export default function LiveControlPanelModal({ livestream, catalogProducts = [], onClose, onEndLive }) {
  const [pinnedId, setPinnedId] = useState(livestream?.pinnedProductId || 'p2');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { user: 'Nguyễn Văn A', text: 'Áo này còn size M không shop?', time: '19:02' },
    { user: 'Trần Thị B', text: 'Freeship HCM không ạ?', time: '19:03' },
    { user: 'Shop S-SHOPPING', text: 'Dạ còn đủ size M, L, XL nhé bạn ơi! ❤️', isShop: true, time: '19:04' }
  ]);

  if (!livestream) return null;

  const linkedProducts = catalogProducts.filter(p => livestream.productIds?.includes(p.id)) || [
    { id: 'p1', name: 'Giày Sneaker Unisex Sport', price: 450000 },
    { id: 'p2', name: 'Áo thun nam basic', price: 150000 }
  ];

  const handleSendShopMsg = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { user: 'Shop S-SHOPPING', text: chatInput, isShop: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" style={{ maxWidth: '900px', background: '#0F172A', color: '#fff' }} onClick={(e) => e.stopPropagation()}>
        {/* Studio Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#EF4444', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={14} /> 🔴 SELLER STUDIO - LIVE NOW
            </span>
            <strong style={{ fontSize: '15px' }}>{livestream.title}</strong>
          </div>
          <button style={{ color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Realtime Realtime Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px 20px', background: '#1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} style={{ color: '#1877F2' }} />
            <div>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>Đang xem</span>
              <strong style={{ fontSize: '14px', color: '#fff' }}>👁️ 2.350 người</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: '#00B14F' }} />
            <div>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>Đơn chốt realtime</span>
              <strong style={{ fontSize: '14px', color: '#00B14F' }}>86 đơn</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} style={{ color: '#F97316' }} />
            <div>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>Doanh thu tạm tính</span>
              <strong style={{ fontSize: '14px', color: '#F97316' }}>12.800.000 đ</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} style={{ color: '#EC4899' }} />
            <div>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>Tim / Thích</span>
              <strong style={{ fontSize: '14px', color: '#EC4899' }}>12.5K</strong>
            </div>
          </div>
        </div>

        {/* Main Studio Body: Left Stream Screen & Right Chat + Pinned Products */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', padding: '16px 20px', height: '420px' }}>
          {/* Stream Preview Screen */}
          <div style={{ position: 'relative', background: '#000', borderRadius: '14px', overflow: 'hidden', border: '1px solid #334155' }}>
            <img src={livestream.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'} alt="Live Stream" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />

            {/* Pinned Product Overlay on Live Stream */}
            {pinnedId && (
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #00B14F' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pin size={16} style={{ color: '#00B14F' }} />
                  <div>
                    <span style={{ fontSize: '10px', color: '#00B14F', fontWeight: '800', display: 'block' }}>📌 ĐANG GHIM TẠI STREAM</span>
                    <strong style={{ fontSize: '12px', color: '#fff' }}>
                      {linkedProducts.find(p => p.id === pinnedId)?.name || 'Áo thun nam basic'}
                    </strong>
                  </div>
                </div>
                <strong style={{ fontSize: '12px', color: '#00B14F' }}>
                  {(linkedProducts.find(p => p.id === pinnedId)?.price || 150000).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            )}
          </div>

          {/* Right Panel: Pinned Product Selector + Realtime Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Products Pinned Controls */}
            <div style={{ background: '#1E293B', borderRadius: '12px', padding: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                🛍️ Danh sách sản phẩm phát trong buổi LIVE
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                {linkedProducts.map(prod => (
                  <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: '#0F172A', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#fff' }} className="truncate-text">{prod.name}</span>
                    <button 
                      className={`action-small-btn ${pinnedId === prod.id ? 'nav-btn-primary' : 'nav-btn-secondary'}`}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                      onClick={() => setPinnedId(pinnedId === prod.id ? null : prod.id)}
                    >
                      {pinnedId === prod.id ? '📌 Đang ghim' : 'Ghim'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Realtime Chat Box */}
            <div style={{ background: '#1E293B', borderRadius: '12px', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '6px' }}>
                💬 Live Chat Trực tiếp từ V-life App
              </span>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ padding: '4px 8px', borderRadius: '6px', background: m.isShop ? 'rgba(0,177,79,0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <strong style={{ color: m.isShop ? '#00B14F' : '#38BDF8' }}>{m.user}: </strong>
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendShopMsg} style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                <input 
                  type="text" 
                  style={{ flex: 1, background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '4px 8px', fontSize: '11px' }}
                  placeholder="Trả lời chat khách..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="nav-btn-primary" style={{ padding: '4px 8px' }}>
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>Studio đang đồng bộ tín hiệu trực tiếp với V-life Super App Video Feed.</span>

          <button 
            className="nav-btn-primary" 
            style={{ background: '#EF4444', borderColor: '#EF4444', fontSize: '12px', padding: '6px 16px' }}
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn Kết thúc buổi Livestream này không?')) {
                onEndLive(livestream.id);
                onClose();
              }
            }}
          >
            <StopCircle size={14} /> Kết thúc Buổi LIVE
          </button>
        </div>
      </div>
    </div>
  );
}
