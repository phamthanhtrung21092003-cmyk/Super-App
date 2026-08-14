import React, { useState } from 'react';
import { X, Play, Eye, Heart, MousePointer, ShoppingBag, DollarSign, Smartphone, Package, ExternalLink } from 'lucide-react';

export default function VideoDetailDrawer({ video, onClose, catalogProducts = [] }) {
  const [showSuperAppPreview, setShowSuperAppPreview] = useState(false);

  if (!video) return null;

  const views = video.views || 25840;
  const likes = video.likes || 2354;
  const clicks = video.clicks || 1890;
  const orders = video.orders || 86;
  const revenue = video.revenue || 12450000;
  const conversionRate = views > 0 ? ((orders / views) * 100).toFixed(2) : '3.41';

  // Linked products
  const linkedProducts = catalogProducts.filter(p => video.productIds?.includes(p.id)) || [
    { id: 'p1', name: 'Giày Sneaker Unisex Sport', sku: 'GS-WHT-42', price: 450000 },
    { id: 'p2', name: 'Áo thun nam basic', sku: 'ATB-BLK-M', price: 150000 }
  ];

  return (
    <div className="inventory-drawer-backdrop" onClick={onClose}>
      <div className="inventory-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header-bar">
          <div className="header-title-group">
            <span className="sku-pill-tag">VideoID: {video.id}</span>
            <h2 className="drawer-product-name">{video.title}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body-scroll">
          {/* Super App Integration Banner */}
          <div style={{ background: '#E6F4EA', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={24} style={{ color: '#00B14F' }} />
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>Xuất bản trên V-life Super App Video Feed</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dùng chung videoID <strong>{video.id}</strong> toàn hệ sinh thái</span>
              </div>
            </div>
            <button 
              className="nav-btn-primary" 
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => setShowSuperAppPreview(true)}
            >
              <Eye size={13} /> Xem trên Super App
            </button>
          </div>

          {/* Hero Performance Card */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="bk-metric-box">
                <span className="lbl">Lượt xem (Views)</span>
                <strong className="val">{views.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Lượt thích (Likes)</span>
                <strong className="val">{likes.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Click sản phẩm</span>
                <strong className="val">{clicks.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Đơn hàng chốt</span>
                <strong className="val">{orders} đơn</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Doanh thu phát sinh</span>
                <strong className="val green-text">{revenue.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Tỷ lệ chuyển đổi</span>
                <strong className="val green-text">{conversionRate}%</strong>
              </div>
            </div>
          </div>

          {/* Video Player Preview */}
          <div className="drawer-section-card">
            <h3 className="section-title">Preview Video Player</h3>
            <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <img src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#00B14F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Play size={24} fill="#fff" style={{ marginLeft: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Linked Products Section */}
          <div className="drawer-section-card">
            <h3 className="section-title">
              <Package size={16} /> Sản phẩm từ Catalog được gắn ({linkedProducts.length})
            </h3>
            <div className="tx-table-responsive">
              <table className="tx-master-table">
                <thead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>SKU</th>
                    <th>Giá bán</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedProducts.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <strong className="tx-product-name">{prod.name}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ID: {prod.id}</span>
                      </td>
                      <td><code>{prod.sku || 'SKU-001'}</code></td>
                      <td><strong>{(prod.price || 150000).toLocaleString('vi-VN')} đ</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="drawer-action-footer">
          <button className="nav-btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      {/* SUPER APP MOCK PREVIEW MODAL */}
      {showSuperAppPreview && (
        <div className="shipping-modal-backdrop" style={{ zIndex: 1000 }} onClick={() => setShowSuperAppPreview(false)}>
          <div className="shipping-modal-panel" style={{ maxWidth: '360px', borderRadius: '32px', border: '8px solid #1E293B', background: '#000', color: '#fff', overflow: 'hidden', padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#00B14F' }}>📱 V-LIFE SUPER APP VIDEO FEED</span>
              <button style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowSuperAppPreview(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '520px', background: '#111' }}>
              <img src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'} alt="Feed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Product Pin Overlay */}
              <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '12px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} style={{ color: '#00B14F' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#fff' }}>Áo thun nam basic</span>
                    <span style={{ fontSize: '10px', color: '#00B14F', fontWeight: '800' }}>150.000 đ</span>
                  </div>
                </div>
                <button className="nav-btn-primary" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={() => alert('Khách bấm [Xem sản phẩm] -> Mở Product Detail -> Mua hàng -> Tạo Order ghi nhận videoId: ' + video.id)}>
                  Mua Ngay
                </button>
              </div>

              {/* Action Icons Right Side */}
              <div style={{ position: 'absolute', right: '12px', bottom: '90px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Heart size={24} fill="#EF4444" style={{ color: '#EF4444' }} />
                  <span style={{ fontSize: '10px' }}>{likes}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Eye size={24} style={{ color: '#fff' }} />
                  <span style={{ fontSize: '10px' }}>{views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
