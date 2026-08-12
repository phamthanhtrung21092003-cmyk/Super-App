import React from 'react';

export default function ProductBasicInfo({ formData, onChange }) {
  return (
    <div className="form-step-card">
      <h3 className="step-card-title">1. Thông tin cơ bản</h3>
      <p className="step-card-desc">Điền thông tin chính xác giúp sản phẩm dễ dàng tìm thấy trên S-Shopping.</p>

      <div className="form-inputs-stack">
        {/* Tên sản phẩm */}
        <div className="form-group-item">
          <label className="form-field-label required">Tên sản phẩm</label>
          <input 
            type="text" 
            placeholder="Ví dụ: Áo thun nam basic Essential Cotton Premium..." 
            value={formData.name || ''} 
            onChange={(e) => onChange('name', e.target.value)}
            className="stylish-form-input"
            maxLength={120}
          />
          <span className="field-hint-text">{(formData.name || '').length}/120 ký tự</span>
        </div>

        {/* Danh mục */}
        <div className="form-group-item">
          <label className="form-field-label required">Danh mục sản phẩm</label>
          <select 
            value={formData.category || 'Thời trang'} 
            onChange={(e) => onChange('category', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Thời trang">Thời trang & May mặc</option>
            <option value="Điện thoại">Điện thoại & Phụ kiện công nghệ</option>
            <option value="Giày dép">Giày dép & Túi xách</option>
            <option value="Mỹ phẩm">Mỹ phẩm & Làm đẹp</option>
            <option value="Đồ gia dụng">Đồ gia dụng & Đời sống</option>
            <option value="Thể thao">Thể thao & Dã ngoại</option>
          </select>
        </div>

        {/* Thương hiệu */}
        <div className="form-group-item">
          <label className="form-field-label">Thương hiệu / Nhãn hàng</label>
          <input 
            type="text" 
            placeholder="No Brand / Nike / Samsung..." 
            value={formData.brand || ''} 
            onChange={(e) => onChange('brand', e.target.value)}
            className="stylish-form-input"
          />
        </div>

        {/* Mô tả chi tiết */}
        <div className="form-group-item">
          <label className="form-field-label required">Mô tả sản phẩm</label>
          <textarea 
            placeholder="Mô tả chi tiết chất liệu, công dụng, thông số kỹ thuật, hướng dẫn bảo quản..." 
            value={formData.description || ''} 
            onChange={(e) => onChange('description', e.target.value)}
            className="stylish-form-textarea"
            rows={5}
          />
        </div>
      </div>
    </div>
  );
}
