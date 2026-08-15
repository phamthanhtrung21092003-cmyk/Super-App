import React, { useRef } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, Star, ArrowLeft, ArrowRight, AlertCircle, Plus } from 'lucide-react';

export const SAMPLE_PRESET_IMAGES = [
  { label: 'Áo thun trắng', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { label: 'Áo polo nam', url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600' },
  { label: 'Giày Sneaker', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
  { label: 'Balo Laptop', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { label: 'Đồng hồ da', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
  { label: 'Ví da cao cấp', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600' }
];

export default function ProductImageUpload({
  images = [],
  error,
  onChangeImages,
  onClearError
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImgs = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      const combined = [...images, ...newImgs].slice(0, 9);
      onChangeImages(combined);
      if (error && onClearError) onClearError('images');
    }
  };

  const handleAddPreset = (url) => {
    if (!images.includes(url) && images.length < 9) {
      const combined = [...images, url];
      onChangeImages(combined);
      if (error && onClearError) onClearError('images');
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    const updated = images.filter((_, idx) => idx !== indexToDelete);
    onChangeImages(updated);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChangeImages([target, ...rest]);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeImages(updated);
  };

  return (
    <div className="product-form-card">
      <div className="form-card-header">
        <div className="header-title-flex">
          <h3 className="form-card-title">Hình ảnh sản phẩm <span className="required-star">*</span></h3>
          <span className="image-counter-pill">{images.length}/9 ảnh</span>
        </div>
        <span className="form-card-subtitle">
          Hình ảnh rõ nét, chụp nhiều góc độ giúp khách hàng dễ dàng đưa ra quyết định mua
        </span>
      </div>

      <div className="form-card-body">
        {/* Upload Drop Zone */}
        <div 
          className={`image-upload-dropzone ${error ? 'dropzone-error' : ''}`}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="dropzone-icon-circle">
            <UploadCloud size={28} />
          </div>
          <p className="dropzone-main-text">
            <strong>Kéo thả hình ảnh vào đây</strong> hoặc click để chọn ảnh
          </p>
          <p className="dropzone-sub-text">
            Định dạng JPG, PNG, WEBP • Tối đa 10MB / ảnh • Tỷ lệ chuẩn 1:1 vuông
          </p>
          <button 
            type="button" 
            className="dropzone-btn-select"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current && fileInputRef.current.click();
            }}
          >
            <ImageIcon size={15} /> Chọn hình ảnh từ máy tính
          </button>
        </div>

        {/* Validation Error Message */}
        {error && (
          <p className="field-error-message" style={{ marginTop: '10px' }}>
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {/* Note about Cover Image */}
        <div className="image-guide-banner">
          <Star size={14} className="star-icon" />
          <span>Ảnh đầu tiên với nhãn <strong>Ảnh đại diện</strong> sẽ được dùng làm ảnh chính hiển thị trên sàn V-life.</span>
        </div>

        {/* Thumbnail Preview Grid */}
        {images.length > 0 && (
          <div className="image-thumbnails-grid">
            {images.map((imgUrl, index) => {
              const isPrimary = index === 0;

              return (
                <div key={index} className={`thumbnail-card ${isPrimary ? 'primary-thumb' : ''}`}>
                  <img src={imgUrl} alt={`Ảnh ${index + 1}`} className="thumb-preview-img" />
                  
                  {isPrimary && (
                    <span className="primary-badge">
                      <Star size={10} fill="#ffffff" /> Ảnh đại diện
                    </span>
                  )}

                  <div className="thumb-hover-actions">
                    {!isPrimary && (
                      <button
                        type="button"
                        className="thumb-action-btn primary-btn"
                        title="Đặt làm ảnh đại diện"
                        onClick={() => handleSetPrimary(index)}
                      >
                        <Star size={13} />
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        type="button"
                        className="thumb-action-btn"
                        title="Di chuyển sang trái"
                        onClick={() => handleMove(index, -1)}
                      >
                        <ArrowLeft size={13} />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        className="thumb-action-btn"
                        title="Di chuyển sang phải"
                        onClick={() => handleMove(index, 1)}
                      >
                        <ArrowRight size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="thumb-action-btn delete-btn"
                      title="Xóa ảnh"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {images.length < 9 && (
              <button
                type="button"
                className="add-more-thumb-box"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Plus size={20} />
                <span>Thêm ảnh</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Mock Sample Presets (For fast UI testing) */}
        <div className="mock-presets-row">
          <span className="preset-label">Mẫu ảnh test nhanh:</span>
          <div className="preset-chips-list">
            {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip-btn"
                onClick={() => handleAddPreset(preset.url)}
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
