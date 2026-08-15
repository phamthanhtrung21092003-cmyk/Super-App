import React from 'react';
import { AlertCircle, ChevronDown, Info } from 'lucide-react';

export const PRODUCT_CATEGORIES = [
  'Thời trang',
  'Điện tử',
  'Gia dụng',
  'Làm đẹp',
  'Thể thao',
  'Phụ kiện',
  'Khác'
];

export const POPULAR_BRANDS = [
  'Không có thương hiệu',
  'S-Life Official',
  'Nike',
  'Adidas',
  'Uniqlo',
  'Samsung',
  'Apple',
  'Xiaomi',
  'Anker',
  'Baseus'
];

export default function ProductBasicInfo({
  formData,
  errors = {},
  onChangeField,
  onClearError
}) {
  const nameLength = (formData.name || '').length;
  const descriptionLength = (formData.description || '').length;

  const handleNameChange = (e) => {
    const val = e.target.value.slice(0, 120);
    onChangeField('name', val);
    if (errors.name && onClearError) onClearError('name');
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    onChangeField('category', val);
    if (errors.category && onClearError) onClearError('category');
  };

  const handleBrandChange = (e) => {
    onChangeField('brand', e.target.value);
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value.slice(0, 3000);
    onChangeField('description', val);
  };

  return (
    <div className="product-form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">Thông tin cơ bản</h3>
        <span className="form-card-subtitle">
          Cung cấp các thông tin nền tảng giúp người mua dễ dàng tìm thấy sản phẩm
        </span>
      </div>

      <div className="form-card-body">
        {/* 1. Tên sản phẩm */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label className="field-label" htmlFor="prod-name-input">
              Tên sản phẩm <span className="required-star">*</span>
            </label>
            <span className={`char-counter ${nameLength >= 115 ? 'warning' : ''}`}>
              {nameLength}/120
            </span>
          </div>

          <div className="field-input-wrapper">
            <input
              id="prod-name-input"
              type="text"
              className={`form-text-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Nhập tên sản phẩm"
              value={formData.name || ''}
              onChange={handleNameChange}
              maxLength={120}
              autoFocus
            />
          </div>

          {errors.name ? (
            <p className="field-error-message">
              <AlertCircle size={13} /> {errors.name}
            </p>
          ) : (
            <p className="field-helper-text">
              <Info size={13} /> Nên bao gồm: Loại sản phẩm + Thương hiệu + Tên chi tiết + Màu sắc / Kích thước (nếu có).
            </p>
          )}
        </div>

        {/* 2. Danh mục sản phẩm */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label className="field-label" htmlFor="prod-category-select">
              Danh mục <span className="required-star">*</span>
            </label>
          </div>

          <div className="field-select-wrapper">
            <select
              id="prod-category-select"
              className={`form-select-input ${errors.category ? 'input-error' : ''}`}
              value={formData.category || ''}
              onChange={handleCategoryChange}
            >
              <option value="">Chọn danh mục</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={16} className="select-dropdown-icon" />
          </div>

          {errors.category && (
            <p className="field-error-message">
              <AlertCircle size={13} /> {errors.category}
            </p>
          )}
        </div>

        {/* 3. Thương hiệu */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label className="field-label" htmlFor="prod-brand-select">
              Thương hiệu
            </label>
          </div>

          <div className="field-select-wrapper">
            <select
              id="prod-brand-select"
              className="form-select-input"
              value={formData.brand || 'Không có thương hiệu'}
              onChange={handleBrandChange}
            >
              {POPULAR_BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <ChevronDown size={16} className="select-dropdown-icon" />
          </div>
          <p className="field-helper-text">
            Chọn thương hiệu chính hãng hoặc để mặc định nếu là sản phẩm tự sản xuất.
          </p>
        </div>

        {/* 4. Mô tả sản phẩm */}
        <div className="form-field-group">
          <div className="field-label-row">
            <label className="field-label" htmlFor="prod-desc-textarea">
              Mô tả sản phẩm
            </label>
            <span className="char-counter">
              {descriptionLength}/3000
            </span>
          </div>

          <div className="field-textarea-wrapper">
            <textarea
              id="prod-desc-textarea"
              className="form-textarea-input"
              rows={6}
              placeholder="Nhập mô tả chi tiết sản phẩm (chất liệu, kích thước, công dụng, hướng dẫn sử dụng, bảo hành)..."
              value={formData.description || ''}
              onChange={handleDescriptionChange}
              maxLength={3000}
            />
          </div>
          <p className="field-helper-text">
            Mô tả chi tiết và trung thực giúp tăng 40% tỷ lệ chuyển đổi đơn hàng.
          </p>
        </div>
      </div>
    </div>
  );
}
