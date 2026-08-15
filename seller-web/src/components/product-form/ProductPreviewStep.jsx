import React, { useState } from 'react';
import { 
  Smartphone, Monitor, Star, ShieldCheck, 
  Truck, Heart, Share2, ShoppingCart, 
  ChevronRight, CheckCircle2, Play, Eye
} from 'lucide-react';

export default function ProductPreviewStep({ formData }) {
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const images = formData.images && formData.images.length > 0
    ? formData.images
    : (formData.image ? [formData.image] : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500']);

  const currentImg = images[selectedImageIdx] || images[0];

  const priceVal = parseFloat(formData.price) || 189000;
  const origPriceVal = parseFloat(formData.origPrice) || (priceVal * 1.25);
  const discountPercent = (origPriceVal > priceVal) 
    ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) 
    : 0;

  const [selectedOpt1, setSelectedOpt1] = useState(
    formData.variantGroup1Options && formData.variantGroup1Options.length > 0 ? formData.variantGroup1Options[0] : 'Đen'
  );
  const [selectedOpt2, setSelectedOpt2] = useState(
    formData.variantGroup2Options && formData.variantGroup2Options.length > 0 ? formData.variantGroup2Options[0] : 'M'
  );

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <Eye size={20} />
        </div>
        <div className="step-header-text">
          <h3 className="step-card-title">7. Xem trước sản phẩm (Live Buyer Preview)</h3>
          <p className="step-card-desc">Xem sản phẩm sẽ hiển thị như thế nào trong mắt người mua trên ứng dụng S-Shopping và Web.</p>
        </div>

        <div className="device-switcher-pills">
          <button 
            type="button" 
            className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('mobile')}
          >
            <Smartphone size={15} /> Ứng dụng Di Động
          </button>
          <button 
            type="button" 
            className={`device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('desktop')}
          >
            <Monitor size={15} /> Website Máy Tính
          </button>
        </div>
      </div>

      <div className={`preview-container-layout ${previewDevice}`}>
        {/* Device Frame */}
        <div className={`mockup-device-wrapper ${previewDevice}-wrapper`}>
          {previewDevice === 'mobile' ? (
            /* 📱 MOBILE APP MOCKUP */
            <div className="mobile-phone-mockup">
              <div className="phone-notch-bar">
                <span className="phone-time">09:41</span>
                <div className="phone-speaker"></div>
                <div className="phone-signals">5G 🔋</div>
              </div>

              <div className="mobile-scrollable-content">
                {/* Product Image Stage */}
                <div className="mobile-image-stage">
                  <img src={currentImg} alt="Preview" className="mobile-main-img" />
                  <div className="mobile-image-counter">
                    {selectedImageIdx + 1}/{images.length}
                  </div>
                  {discountPercent > 0 && (
                    <div className="mobile-discount-tag">-{discountPercent}%</div>
                  )}
                  {formData.videoUrl && (
                    <div className="mobile-video-indicator">
                      <Play size={12} fill="#fff" /> Video
                    </div>
                  )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="mobile-thumbs-strip">
                    {images.map((url, idx) => (
                      <div 
                        key={idx} 
                        className={`thumb-box ${selectedImageIdx === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImageIdx(idx)}
                      >
                        <img src={url} alt={`Thumb ${idx}`} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Price & Title Card */}
                <div className="mobile-product-meta-card">
                  <div className="mobile-price-row">
                    <span className="current-price-huge">{priceVal.toLocaleString('vi-VN')}₫</span>
                    {origPriceVal > priceVal && (
                      <span className="original-price-strike">{origPriceVal.toLocaleString('vi-VN')}₫</span>
                    )}
                    <span className="freeship-badge-pill">Freeship Xtra</span>
                  </div>

                  <div className="mall-title-row">
                    <span className="mall-badge-inline">MALL</span>
                    <h2 className="mobile-product-title">
                      {formData.name || 'Áo thun nam basic Cotton 100% thoáng mát'}
                    </h2>
                  </div>

                  <div className="mobile-rating-row">
                    <div className="stars-group">
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span className="rating-score">5.0</span>
                      <span className="rating-count">(124 đánh giá)</span>
                    </div>
                    <span className="sold-number-text">Đã bán 1.2k</span>
                  </div>
                </div>

                {/* Shipping info banner */}
                <div className="mobile-shipping-banner">
                  <div className="shipping-icon-circle">
                    <Truck size={15} color="#00B14F" />
                  </div>
                  <div className="shipping-text-block">
                    <strong>Giao hàng dự kiến: 1 - 3 ngày</strong>
                    <p>Miễn phí vận chuyển cho đơn hàng từ 150.000₫</p>
                  </div>
                </div>

                {/* Variants Selection */}
                {formData.hasVariants && (
                  <div className="mobile-variants-box">
                    <div className="variant-label-title">
                      {formData.variantGroup1Name || 'Màu sắc'}: <strong>{selectedOpt1}</strong>
                    </div>
                    <div className="variant-pills-row">
                      {(formData.variantGroup1Options || ['Đen', 'Trắng']).map(opt => (
                        <button 
                          key={opt}
                          type="button" 
                          className={`variant-select-chip ${selectedOpt1 === opt ? 'active' : ''}`}
                          onClick={() => setSelectedOpt1(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {formData.variantGroup2Options && formData.variantGroup2Options.length > 0 && (
                      <>
                        <div className="variant-label-title" style={{ marginTop: '12px' }}>
                          {formData.variantGroup2Name || 'Kích thước'}: <strong>{selectedOpt2}</strong>
                        </div>
                        <div className="variant-pills-row">
                          {formData.variantGroup2Options.map(opt => (
                            <button 
                              key={opt}
                              type="button" 
                              className={`variant-select-chip ${selectedOpt2 === opt ? 'active' : ''}`}
                              onClick={() => setSelectedOpt2(opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Product Specifications */}
                <div className="mobile-specs-card">
                  <h4 className="specs-card-heading">Chi tiết sản phẩm</h4>
                  <div className="spec-row-item">
                    <span className="spec-label">Danh mục</span>
                    <span className="spec-value">{formData.category || 'Thời trang nam'}</span>
                  </div>
                  <div className="spec-row-item">
                    <span className="spec-label">Thương hiệu</span>
                    <span className="spec-value">{formData.brand || 'No Brand'}</span>
                  </div>
                  <div className="spec-row-item">
                    <span className="spec-label">Xuất xứ</span>
                    <span className="spec-value">{formData.origin || 'Việt Nam'}</span>
                  </div>
                  <div className="spec-row-item">
                    <span className="spec-label">Bảo hành</span>
                    <span className="spec-value">{formData.warranty || '12 tháng'}</span>
                  </div>
                  <div className="spec-row-item">
                    <span className="spec-label">Kho hàng</span>
                    <span className="spec-value">{formData.stock || '100'} sản phẩm có sẵn</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mobile-description-card">
                  <h4 className="specs-card-heading">Mô tả sản phẩm</h4>
                  <div className="description-text-content">
                    {formData.description || 'Sản phẩm cao cấp, chất liệu thoáng mát, phom dáng chuẩn, đường may sắc nét.'}
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Bottom CTA */}
              <div className="mobile-sticky-bottom-bar">
                <button type="button" className="btn-chat-seller" title="Chat với Shop">
                  💬
                </button>
                <button type="button" className="btn-add-cart" title="Thêm vào giỏ hàng">
                  <ShoppingCart size={16} /> Thêm vào giỏ
                </button>
                <button type="button" className="btn-buy-now">
                  Mua Ngay
                </button>
              </div>
            </div>
          ) : (
            /* 💻 DESKTOP WEB MOCKUP */
            <div className="desktop-web-mockup">
              <div className="desktop-browser-bar">
                <div className="browser-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="browser-url-bar">
                  https://s-shopping.vn/product/{formData.name ? encodeURIComponent(formData.name.toLowerCase().slice(0, 30)) : 'ao-thun-nam'}
                </div>
              </div>

              <div className="desktop-product-grid">
                {/* Left: Gallery */}
                <div className="desktop-gallery-col">
                  <img src={currentImg} alt="Preview" className="desktop-hero-img" />
                  <div className="desktop-thumbs-row">
                    {images.map((url, idx) => (
                      <div 
                        key={idx} 
                        className={`thumb-box-desktop ${selectedImageIdx === idx ? 'active' : ''}`}
                        onClick={() => setSelectedImageIdx(idx)}
                      >
                        <img src={url} alt={`Thumb ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Info & Purchase */}
                <div className="desktop-info-col">
                  <div className="mall-title-row">
                    <span className="mall-badge-inline">S-SHOPPING MALL</span>
                    <h2 className="desktop-title">{formData.name || 'Áo thun nam basic Cotton 100%'}</h2>
                  </div>

                  <div className="desktop-rating-row">
                    <span className="rating-score">5.0 ★★★★★</span>
                    <span className="rating-divider">|</span>
                    <span>128 Đánh giá</span>
                    <span className="rating-divider">|</span>
                    <span>1.5k Đã bán</span>
                  </div>

                  <div className="desktop-price-banner">
                    {origPriceVal > priceVal && (
                      <span className="desktop-orig-price">{origPriceVal.toLocaleString('vi-VN')}₫</span>
                    )}
                    <span className="desktop-curr-price">{priceVal.toLocaleString('vi-VN')}₫</span>
                    {discountPercent > 0 && (
                      <span className="desktop-discount-tag">GIẢM {discountPercent}%</span>
                    )}
                  </div>

                  {/* Desktop Variants */}
                  {formData.hasVariants && (
                    <div className="desktop-variants-section">
                      <div className="variant-label">{formData.variantGroup1Name || 'Màu sắc'}:</div>
                      <div className="variant-chips-list">
                        {(formData.variantGroup1Options || ['Đen', 'Trắng']).map(opt => (
                          <button 
                            key={opt}
                            type="button" 
                            className={`desktop-variant-btn ${selectedOpt1 === opt ? 'active' : ''}`}
                            onClick={() => setSelectedOpt1(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {formData.variantGroup2Options && formData.variantGroup2Options.length > 0 && (
                        <>
                          <div className="variant-label" style={{ marginTop: '12px' }}>{formData.variantGroup2Name || 'Kích thước'}:</div>
                          <div className="variant-chips-list">
                            {formData.variantGroup2Options.map(opt => (
                              <button 
                                key={opt}
                                type="button" 
                                className={`desktop-variant-btn ${selectedOpt2 === opt ? 'active' : ''}`}
                                onClick={() => setSelectedOpt2(opt)}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="desktop-stock-row">
                    <span>Số lượng: <strong>1</strong></span>
                    <span className="stock-available">({formData.stock || 100} sản phẩm có sẵn)</span>
                  </div>

                  <div className="desktop-buttons-row">
                    <button type="button" className="desktop-cart-btn">
                      <ShoppingCart size={16} /> Thêm Vào Giỏ Hàng
                    </button>
                    <button type="button" className="desktop-buy-btn">
                      Mua Ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Readiness Checklist Summary */}
        <div className="preview-readiness-checklist">
          <div className="checklist-header">
            <CheckCircle2 size={18} color="var(--primary)" />
            <h4>Kiểm tra độ hoàn thiện sản phẩm</h4>
          </div>

          <div className="readiness-items-list">
            <div className="readiness-item">
              <span className={`status-icon ${formData.name ? 'ok' : 'missing'}`}>
                {formData.name ? '✓' : '○'}
              </span>
              <span>Tên sản phẩm ({formData.name ? 'Đã nhập' : 'Chưa có'})</span>
            </div>

            <div className="readiness-item">
              <span className={`status-icon ${images.length > 0 ? 'ok' : 'missing'}`}>
                {images.length > 0 ? '✓' : '○'}
              </span>
              <span>Hình ảnh ({images.length} ảnh)</span>
            </div>

            <div className="readiness-item">
              <span className={`status-icon ${formData.price > 0 ? 'ok' : 'missing'}`}>
                {formData.price > 0 ? '✓' : '○'}
              </span>
              <span>Giá bán lẻ ({formData.price ? `${Number(formData.price).toLocaleString('vi-VN')}₫` : 'Chưa thiết lập'})</span>
            </div>

            <div className="readiness-item">
              <span className={`status-icon ${formData.stock > 0 ? 'ok' : 'missing'}`}>
                {formData.stock > 0 ? '✓' : '○'}
              </span>
              <span>Tồn kho ({formData.stock || 0} sản phẩm)</span>
            </div>

            <div className="readiness-item">
              <span className={`status-icon ${formData.weight > 0 ? 'ok' : 'missing'}`}>
                {formData.weight > 0 ? '✓' : '○'}
              </span>
              <span>Thông tin vận chuyển ({formData.weight || 500}g)</span>
            </div>
          </div>

          <div className="readiness-badge-summary">
            <span className="badge-text">
              ✨ Sản phẩm sẵn sàng đăng bán với mức độ hoàn thiện <strong>100%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
