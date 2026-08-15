import React from 'react';
import { ShoppingBag, Star, ShieldCheck, Truck, Eye, Sparkles } from 'lucide-react';

export default function ProductPreview({ formData = {} }) {
  const hasContent = (formData.name && formData.name.trim().length > 0) || (formData.images && formData.images.length > 0);
  const primaryImage = formData.images && formData.images.length > 0 ? formData.images[0] : null;

  return (
    <div className="product-preview-sticky-container">
      <div className="preview-card">
        {/* Preview Card Header */}
        <div className="preview-card-header">
          <div className="preview-title-flex">
            <Eye size={16} className="preview-header-icon" />
            <h4 className="preview-title">Xem trước sản phẩm</h4>
          </div>
          <span className="preview-mode-badge">
            <Sparkles size={11} /> Realtime
          </span>
        </div>

        <div className="preview-card-body">
          {!hasContent ? (
            <div className="preview-empty-box">
              <div className="preview-empty-icon-circle">
                <ShoppingBag size={36} />
              </div>
              <p className="preview-empty-title">Chưa có thông tin sản phẩm</p>
              <p className="preview-empty-desc">
                Nhập tên, chọn danh mục và tải ảnh sản phẩm để xem trước giao diện hiển thị trên ứng dụng V-life.
              </p>
            </div>
          ) : (
            <div className="preview-content-box">
              {/* Mobile Product Mock Card */}
              <div className="mobile-product-mock">
                {/* Product Image Area */}
                <div className="mock-image-container">
                  {primaryImage ? (
                    <img src={primaryImage} alt="Xem trước sản phẩm" className="mock-prod-img" />
                  ) : (
                    <div className="mock-img-placeholder">
                      <ShoppingBag size={40} className="placeholder-icon" />
                      <span>Chưa có hình ảnh</span>
                    </div>
                  )}

                  {formData.category && (
                    <span className="mock-category-pill">{formData.category}</span>
                  )}
                </div>

                {/* Product Meta Info Area */}
                <div className="mock-info-container">
                  {/* Brand & Badge */}
                  <div className="mock-brand-row">
                    <span className="mock-brand-tag">
                      {formData.brand || 'Không có thương hiệu'}
                    </span>
                    <span className="mock-verified-badge">
                      <ShieldCheck size={12} /> Chính hãng
                    </span>
                  </div>

                  {/* Product Title */}
                  <h5 className="mock-prod-title">
                    {formData.name || 'Tên sản phẩm sẽ hiển thị tại đây...'}
                  </h5>

                  {/* Rating placeholder */}
                  <div className="mock-rating-row">
                    <div className="stars-group">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span className="mock-rating-score">5.0</span>
                    <span className="mock-sold-count">• Đã bán 0</span>
                  </div>

                  {/* Price Area: Only show if seller has provided a price */}
                  {formData.price && Number(formData.price) > 0 ? (
                    <div className="mock-price-row">
                      <span className="mock-main-price">
                        {Number(formData.price).toLocaleString('vi-VN')}đ
                      </span>
                      {formData.origPrice && Number(formData.origPrice) > Number(formData.price) && (
                        <span className="mock-orig-price">
                          {Number(formData.origPrice).toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mock-price-pending-row">
                      <span className="price-pending-text">Giá sẽ thiết lập ở Bước 04</span>
                    </div>
                  )}

                  {/* Shipping Tag */}
                  <div className="mock-shipping-tag-row">
                    <Truck size={13} className="truck-icon" />
                    <span>Giao hàng siêu tốc qua V-life Express</span>
                  </div>
                </div>
              </div>

              {/* Realtime Detail Snippet */}
              {formData.description && formData.description.trim().length > 0 && (
                <div className="preview-description-snippet">
                  <span className="snippet-label">Mô tả rút gọn:</span>
                  <p className="snippet-text">
                    {formData.description.length > 140 
                      ? `${formData.description.slice(0, 140)}...` 
                      : formData.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="preview-card-footer">
          <span className="footer-note-text">
            Mô phỏng hiển thị trên Super App V-life (iOS / Android / Web)
          </span>
        </div>
      </div>
    </div>
  );
}
