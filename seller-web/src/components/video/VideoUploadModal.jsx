import React, { useState } from 'react';
import { Upload, Video, Tag, Share2, CheckCircle2, ChevronRight, ChevronLeft, X, Link2 } from 'lucide-react';
import VideoProductSelector from './VideoProductSelector';
import AffiliateProductSelector from './AffiliateProductSelector';

export default function VideoUploadModal({
  catalogProducts = [],
  onClose,
  onSubmitVideo
}) {
  const [step, setStep] = useState(1);

  // Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [hashtags, setHashtags] = useState('#BSelling #Trending');
  const [videoType, setVideoType] = useState('Video ngắn');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300');
  const [productType, setProductType] = useState('OWN_PRODUCT'); // 'OWN_PRODUCT' or 'AFFILIATE'

  // Selected Products
  const [selectedOwnProductIds, setSelectedOwnProductIds] = useState(['p1']);
  const [selectedAffiliateProductIds, setSelectedAffiliateProductIds] = useState([]);

  const toggleOwnProduct = (id) => {
    if (selectedOwnProductIds.includes(id)) {
      setSelectedOwnProductIds(selectedOwnProductIds.filter(i => i !== id));
    } else {
      setSelectedOwnProductIds([...selectedOwnProductIds, id]);
    }
  };

  const toggleAffiliateProduct = (id) => {
    if (selectedAffiliateProductIds.includes(id)) {
      setSelectedAffiliateProductIds(selectedAffiliateProductIds.filter(i => i !== id));
    } else {
      setSelectedAffiliateProductIds([...selectedAffiliateProductIds, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1 && !videoTitle.trim()) {
      alert('Vui lòng nhập tiêu đề video!');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      const newVid = {
        id: `V${Math.floor(100000 + Math.random() * 900000)}`,
        sellerId: 'S001',
        title: videoTitle,
        description: videoDesc,
        type: videoType,
        thumbnailUrl: thumbnailUrl,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: '02:45',
        status: 'PUBLISHED',
        views: 0,
        likes: 0,
        clicks: 0,
        orders: 0,
        revenue: 0,
        productCount: productType === 'OWN_PRODUCT' ? selectedOwnProductIds.length : selectedAffiliateProductIds.length,
        productType: productType,
        productIds: productType === 'OWN_PRODUCT' ? selectedOwnProductIds : selectedAffiliateProductIds,
        createdAt: new Date().toLocaleString('vi-VN')
      };
      onSubmitVideo(newVid);
    }
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Video size={20} className="header-icon-green" />
            <h3 className="modal-title">Đăng video bán hàng mới lên V-life</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)', padding: '10px 20px', gap: '8px' }}>
          {[
            { num: 1, label: 'Thông tin Video' },
            { num: 2, label: 'Chọn loại sản phẩm' },
            { num: 3, label: 'Gắn sản phẩm & Đăng' }
          ].map(s => (
            <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: step === s.num ? '800' : '600', color: step === s.num ? '#00B14F' : 'var(--text-muted)' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === s.num ? '#00B14F' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                {s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {/* STEP 1: VIDEO INFO & UPLOAD DROPZONE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* File Dropzone */}
              <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-page)', cursor: 'pointer' }}>
                <Upload size={32} style={{ color: '#00B14F', marginBottom: '8px' }} />
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>Kéo thả video vào đây hoặc bấm để chọn file</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Định dạng MP4, MOV. Tối đa 500MB, độ phân giải Full HD 1080p</span>
              </div>

              <div className="form-group-field">
                <label className="field-label">Tiêu đề video (*):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  placeholder="VD: Review chi tiết Áo thun nam Basic thoáng mát..."
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div className="form-group-field">
                <label className="field-label">Mô tả video & Hashtags:</label>
                <textarea 
                  className="modal-input-control"
                  style={{ height: '70px', padding: '10px' }}
                  placeholder="Mô tả sản phẩm trong video..."
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                />
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-field">
                  <label className="field-label">Loại định dạng Video:</label>
                  <select 
                    className="modal-select-control"
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value)}
                  >
                    <option value="Video ngắn">Video ngắn (Short Video Feed)</option>
                    <option value="Video dài">Video dài (Review chi tiết)</option>
                    <option value="Livestream">Replay Livestream</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label className="field-label">URL Ảnh bìa (Thumbnail):</label>
                  <input 
                    type="text"
                    className="modal-input-control"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE PRODUCT TYPE (OWN SHOP VS AFFILIATE) */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)' }}>
                Bạn muốn gắn loại sản phẩm nào vào Video?
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                  className={`report-item-row ${productType === 'OWN_PRODUCT' ? 'active' : ''}`}
                  style={{ 
                    padding: '20px', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start', 
                    gap: '10px',
                    border: productType === 'OWN_PRODUCT' ? '2px solid #00B14F' : '1px solid var(--border)',
                    background: productType === 'OWN_PRODUCT' ? '#F0FDF4' : 'var(--bg-surface)'
                  }}
                  onClick={() => setProductType('OWN_PRODUCT')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E6F4EA', color: '#00B14F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={20} />
                    </div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>🛍️ Sản phẩm của tôi</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Gắn trực tiếp các sản phẩm thuộc gian hàng của bạn từ <strong>Product Catalog</strong> để bán hàng trực tiếp.
                  </p>
                </div>

                <div 
                  className={`report-item-row ${productType === 'AFFILIATE' ? 'active' : ''}`}
                  style={{ 
                    padding: '20px', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start', 
                    gap: '10px',
                    border: productType === 'AFFILIATE' ? '2px solid #EC4899' : '1px solid var(--border)',
                    background: productType === 'AFFILIATE' ? '#FCE7F3' : 'var(--bg-surface)'
                  }}
                  onClick={() => setProductType('AFFILIATE')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FCE7F3', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Share2 size={20} />
                    </div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>💰 Affiliate</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Quảng bá sản phẩm của Shop khác trên V-life để nhận <strong>hoa hồng Affiliate 5% - 8%</strong> trên mỗi đơn hàng phát sinh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ATTACH PRODUCTS FROM CATALOG / AFFILIATE */}
          {step === 3 && (
            <div>
              {productType === 'OWN_PRODUCT' ? (
                <VideoProductSelector 
                  catalogProducts={catalogProducts}
                  selectedIds={selectedOwnProductIds}
                  onToggleSelect={toggleOwnProduct}
                />
              ) : (
                <AffiliateProductSelector 
                  selectedAffiliateIds={selectedAffiliateProductIds}
                  onToggleSelect={toggleAffiliateProduct}
                />
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="modal-actions-footer">
            {step > 1 ? (
              <button type="button" className="nav-btn-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={15} /> Quay lại
              </button>
            ) : (
              <button type="button" className="nav-btn-secondary" onClick={onClose}>
                Hủy
              </button>
            )}

            <button type="submit" className="nav-btn-primary">
              {step < 3 ? (
                <>Tiếp tục <ChevronRight size={15} /></>
              ) : (
                <><CheckCircle2 size={15} /> Đăng Video lên V-life ngay</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
