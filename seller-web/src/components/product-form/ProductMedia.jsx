import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Star, Trash2, Video, Play, ExternalLink, Sparkles, Check } from 'lucide-react';

export default function ProductMedia({ formData, onChange }) {
  const images = formData.images && formData.images.length > 0 
    ? formData.images 
    : (formData.image ? [formData.image] : []);

  const [sampleTab, setSampleTab] = useState('fashion');

  const sampleImageBanks = {
    fashion: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'
    ],
    shoes: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
    ],
    tech: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'
    ],
    cosmetics: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500',
      'https://images.unsplash.com/photo-1608248597359-002d26f04944?w=500',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'
    ]
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newUrls = files.map(file => URL.createObjectURL(file));
    const updated = [...images, ...newUrls].slice(0, 9);
    onChange('images', updated);
    if (!formData.image && updated.length > 0) {
      onChange('image', updated[0]);
    }
  };

  const handleAddSample = (url) => {
    if (images.includes(url)) return;
    if (images.length >= 9) {
      alert('Đã đạt giới hạn tối đa 9 ảnh cho sản phẩm!');
      return;
    }
    const updated = [...images, url];
    onChange('images', updated);
    if (!formData.image || !images.length) {
      onChange('image', url);
    }
  };

  const handleRemoveImage = (index) => {
    const targetUrl = images[index];
    const updated = images.filter((_, idx) => idx !== index);
    onChange('images', updated);
    if (formData.image === targetUrl) {
      onChange('image', updated.length > 0 ? updated[0] : '');
    }
  };

  const handleSetMainImage = (url) => {
    onChange('image', url);
    // Move main image to first position in array
    const filtered = images.filter(u => u !== url);
    onChange('images', [url, ...filtered]);
  };

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 className="step-card-title">2. Hình ảnh & Video sản phẩm</h3>
          <p className="step-card-desc">Tải lên tối đa 9 hình ảnh sắc nét và 1 video giới thiệu để tăng tỷ lệ chuyển đổi đơn hàng.</p>
        </div>
      </div>

      <div className="media-section-stack">
        {/* Upload Dropzone */}
        <div className="media-upload-dropzone">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileUpload} 
            id="product-image-upload-input"
            className="hidden-file-input"
          />
          <label htmlFor="product-image-upload-input" className="dropzone-label-box">
            <UploadCloud size={36} className="upload-cloud-icon" />
            <strong className="upload-main-text">Tải ảnh lên từ thiết bị</strong>
            <span className="upload-sub-text">Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 9 ảnh, mỗi ảnh tối đa 5MB)</span>
            <span className="upload-format-badge">Khuyên dùng tỷ lệ 1:1 (Kích thước tối thiểu 700x700px)</span>
          </label>
        </div>

        {/* Quick Sample Image Bank */}
        <div className="sample-images-selector-box">
          <div className="sample-header-row">
            <div className="sample-title-group">
              <Sparkles size={14} color="var(--primary)" />
              <span className="sample-title-text">Hoặc chọn ảnh mẫu Unsplash chất lượng cao:</span>
            </div>
            <div className="sample-category-tabs">
              {[
                { id: 'fashion', label: 'Thời trang' },
                { id: 'shoes', label: 'Giày dép' },
                { id: 'tech', label: 'Công nghệ' },
                { id: 'cosmetics', label: 'Mỹ phẩm' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  type="button" 
                  className={`sample-tab-btn ${sampleTab === tab.id ? 'active' : ''}`}
                  onClick={() => setSampleTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sample-thumbnails-grid">
            {sampleImageBanks[sampleTab].map((url, idx) => {
              const isSelected = images.includes(url);
              return (
                <div 
                  key={idx} 
                  className={`sample-thumb-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleAddSample(url)}
                  title={isSelected ? "Ảnh đã được chọn" : "Nhấp để thêm ảnh này vào sản phẩm"}
                >
                  <img src={url} alt={`Sample ${idx}`} />
                  {isSelected ? (
                    <span className="selected-check-badge"><Check size={12} /> Đã chọn</span>
                  ) : (
                    <span className="add-plus-badge">+ Thêm</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Gallery of Uploaded Images */}
        <div className="gallery-container">
          <div className="gallery-header-row">
            <label className="form-field-label required">
              Hình ảnh đã chọn ({images.length}/9)
            </label>
            <span className="field-tip-text">Ảnh đầu tiên hoặc ảnh có gắn sao sẽ làm ảnh bìa đại diện</span>
          </div>

          {images.length > 0 ? (
            <div className="media-gallery-preview-grid">
              {images.map((imgUrl, idx) => {
                const isMain = (formData.image === imgUrl) || (idx === 0 && !formData.image);

                return (
                  <div key={idx} className={`gallery-item-card ${isMain ? 'is-main-cover' : ''}`}>
                    <img src={imgUrl} alt={`Product ${idx}`} className="gallery-thumb-img" />

                    {isMain ? (
                      <span className="main-cover-badge">
                        <Star size={11} fill="#ffffff" /> Ảnh Bìa
                      </span>
                    ) : (
                      <span className="order-number-badge">#{idx + 1}</span>
                    )}

                    <div className="gallery-item-overlay-actions">
                      {!isMain && (
                        <button 
                          type="button"
                          className="overlay-btn set-main-btn"
                          onClick={() => handleSetMainImage(imgUrl)}
                          title="Đặt làm ảnh bìa đại diện"
                        >
                          Đặt làm bìa
                        </button>
                      )}
                      <button 
                        type="button"
                        className="overlay-btn delete-img-btn"
                        onClick={() => handleRemoveImage(idx)}
                        title="Xóa ảnh này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="gallery-empty-notice">
              <span>Chưa có hình ảnh nào. Vui lòng tải ảnh lên hoặc chọn từ kho ảnh mẫu bên trên.</span>
            </div>
          )}
        </div>

        {/* Video Upload / Link Section */}
        <div className="video-section-box">
          <div className="video-header-row">
            <label className="form-field-label">
              <Video size={16} /> Video giới thiệu sản phẩm (Tùy chọn)
            </label>
            <span className="field-tip-text">Video ngắn dưới 60s giúp tăng 45% tỷ lệ chốt đơn</span>
          </div>

          <div className="video-input-group">
            <input 
              type="text" 
              placeholder="Dán đường dẫn Video (MP4, YouTube Short, TikTok, V-life Video URL)..." 
              value={formData.videoUrl || ''} 
              onChange={(e) => onChange('videoUrl', e.target.value)}
              className="stylish-form-input"
            />
            {formData.videoUrl && (
              <button 
                type="button" 
                className="nav-btn-secondary view-video-btn"
                onClick={() => window.open(formData.videoUrl, '_blank')}
              >
                <ExternalLink size={14} /> Mở Video
              </button>
            )}
          </div>

          {formData.videoUrl && (
            <div className="video-preview-player-box">
              <div className="video-badge-indicator">
                <Play size={14} fill="currentColor" /> Sẵn sàng phát khi người mua xem chi tiết sản phẩm
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
