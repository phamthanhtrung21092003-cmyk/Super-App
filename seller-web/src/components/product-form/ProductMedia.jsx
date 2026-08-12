import React from 'react';
import { UploadCloud, Image as ImageIcon, Star, Trash2, Video } from 'lucide-react';

export default function ProductMedia({ formData, onChange }) {
  const images = formData.images || [];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newUrls = files.map(file => URL.createObjectURL(file));
    const updated = [...images, ...newUrls];
    onChange('images', updated);
    if (!formData.image && updated.length > 0) {
      onChange('image', updated[0]);
    }
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange('images', updated);
    if (updated.length > 0) {
      onChange('image', updated[0]);
    } else {
      onChange('image', '');
    }
  };

  const handleSetMainImage = (url) => {
    onChange('image', url);
  };

  return (
    <div className="form-step-card">
      <h3 className="step-card-title">2. Hình ảnh & Video sản phẩm</h3>
      <p className="step-card-desc">Tải lên tối đa 8 hình ảnh chất lượng cao và 1 video ngắn giúp tăng tỷ lệ chốt đơn.</p>

      {/* Drag & Drop Upload Zone */}
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
          <strong className="upload-main-text">Tải ảnh lên từ máy tính</strong>
          <span className="upload-sub-text">Hoặc kéo thả file ảnh (PNG, JPG, WEBP) vào đây</span>
          <span className="upload-format-badge">Tối đa 5MB / ảnh • Khuyên dùng tỷ lệ 1:1 (Square)</span>
        </label>
      </div>

      {/* Uploaded Images Gallery Preview */}
      {images.length > 0 && (
        <div className="media-gallery-preview-grid">
          {images.map((imgUrl, idx) => {
            const isMain = formData.image === imgUrl || idx === 0;

            return (
              <div key={idx} className={`gallery-item-card ${isMain ? 'is-main-cover' : ''}`}>
                <img src={imgUrl} alt={`Product ${idx}`} className="gallery-thumb-img" />

                {isMain && (
                  <span className="main-cover-badge">
                    <Star size={10} fill="#fff" /> Ảnh bìa
                  </span>
                )}

                <div className="gallery-item-overlay-actions">
                  {!isMain && (
                    <button 
                      className="overlay-btn set-main-btn"
                      onClick={() => handleSetMainImage(imgUrl)}
                      title="Đặt làm ảnh bìa đại diện"
                    >
                      Đặt ảnh bìa
                    </button>
                  )}
                  <button 
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
      )}

      {/* Video Upload Field */}
      <div className="video-upload-section">
        <label className="form-field-label">
          <Video size={16} /> Video giới thiệu sản phẩm (Tùy chọn)
        </label>
        <input 
          type="text" 
          placeholder="Dán link Video (mp4, youtube short, v-life video)..." 
          value={formData.videoUrl || ''} 
          onChange={(e) => onChange('videoUrl', e.target.value)}
          className="stylish-form-input"
        />
      </div>
    </div>
  );
}
