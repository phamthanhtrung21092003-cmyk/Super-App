import React, { useState } from 'react';
import { Upload, Eye, CheckCircle2, Calendar } from 'lucide-react';

export default function ShopInformation({ onPreviewShop }) {
  const [shopName, setShopName] = useState('Cửa hàng ABC');
  const [displayName, setDisplayName] = useState('Shop ABC Official');
  const [phone, setPhone] = useState('0912 345 678');
  const [email, setEmail] = useState('shopabc@v-life.vn');
  const [desc, setDesc] = useState('Chuyên cung cấp các sản phẩm chất lượng, chính hãng với giá tốt nhất. Cam kết đem đến trải nghiệm mua sắm tuyệt vời cho khách hàng.');
  const [socialLink, setSocialLink] = useState('https://facebook.com/shopabc');
  const [category, setCategory] = useState('Thời trang');
  const [joinDate, setJoinDate] = useState('01/08/2026');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800');

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Đã lưu thay đổi thông tin Cửa hàng thành công!');
  };

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <div className="card-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-heading-title">Thông tin cửa hàng</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Cập nhật và quản lý thông tin cơ bản của cửa hàng
          </p>
        </div>

        <button 
          className="nav-btn-secondary" 
          style={{ fontSize: '11px', padding: '6px 12px' }}
          onClick={() => alert('Đang mở trang Xem trước gian hàng trên V-life Super App...')}
        >
          <Eye size={13} /> Xem trước gian hàng
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Logo & Banner Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px' }}>
          {/* Logo Box */}
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '8px' }}>Logo cửa hàng</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <button 
                  type="button" 
                  className="nav-btn-secondary" 
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                  onClick={() => alert('Mở trình chọn ảnh logo cửa hàng...')}
                >
                  <Upload size={11} /> Thay đổi logo
                </button>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>JPG, PNG, tối đa 2MB</span>
              </div>
            </div>
          </div>

          {/* Banner Box */}
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '8px' }}>Banner cửa hàng</label>
            <div style={{ position: 'relative', width: '100%', height: '70px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                type="button" 
                className="nav-btn-secondary" 
                style={{ position: 'absolute', bottom: '6px', right: '6px', fontSize: '9px', padding: '2px 8px', background: 'rgba(255,255,255,0.9)' }}
                onClick={() => alert('Mở trình chọn ảnh banner cửa hàng...')}
              >
                <Upload size={10} /> Thay đổi banner
              </button>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>JPG, PNG, tối đa 5MB (1200x300px)</span>
          </div>
        </div>

        {/* Input Fields Row 1 */}
        <div className="form-row-grid-2">
          <div className="form-group-field">
            <label className="field-label">Tên cửa hàng (*):</label>
            <input 
              type="text"
              className="modal-input-control"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="field-label">Tên hiển thị (*):</label>
            <input 
              type="text"
              className="modal-input-control"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        {/* Input Fields Row 2 */}
        <div className="form-row-grid-2">
          <div className="form-group-field">
            <label className="field-label">Số điện thoại (*):</label>
            <input 
              type="text"
              className="modal-input-control"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="field-label">Email liên hệ (*):</label>
            <input 
              type="email"
              className="modal-input-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Description Textarea */}
        <div className="form-group-field">
          <label className="field-label">Mô tả cửa hàng:</label>
          <textarea 
            className="modal-input-control"
            style={{ height: '70px', padding: '10px' }}
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{desc.length}/500 ký tự</span>
        </div>

        {/* Social Link */}
        <div className="form-group-field">
          <label className="field-label">Website / Link mạng xã hội:</label>
          <input 
            type="text"
            className="modal-input-control"
            value={socialLink}
            onChange={e => setSocialLink(e.target.value)}
          />
        </div>

        {/* Category & Status Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group-field">
            <label className="field-label">Ngành hàng chính:</label>
            <select 
              className="modal-select-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Thời trang">Thời trang</option>
              <option value="Giày dép">Giày dép</option>
              <option value="Gia dụng">Gia dụng</option>
              <option value="Công nghệ">Công nghệ</option>
              <option value="Mỹ phẩm">Mỹ phẩm</option>
            </select>
          </div>

          <div className="form-group-field">
            <label className="field-label">Ngày tham gia:</label>
            <div className="date-picker-input-group">
              <Calendar size={14} className="calendar-icon" />
              <input 
                type="text"
                className="date-range-field"
                style={{ width: '100%' }}
                value={joinDate}
                disabled
              />
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Trạng thái cửa hàng:</label>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#E6F4EA', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <strong style={{ fontSize: '12px', color: '#00B14F' }}>🟢 Đang hoạt động</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" className="nav-btn-primary" style={{ padding: '10px 24px' }}>
            <CheckCircle2 size={16} /> Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
