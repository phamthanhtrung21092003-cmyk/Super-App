import React from 'react';
import { DollarSign, Package } from 'lucide-react';

export default function ProductPricing({ formData, onChange }) {
  return (
    <div className="form-step-card">
      <h3 className="step-card-title">
        <DollarSign size={18} /> 4. Giá & Kho hàng
      </h3>
      <p className="step-card-desc">Thiết lập giá niêm yết, giá khuyến mãi và số lượng hàng trong kho.</p>

      <div className="form-inputs-grid-2">
        {/* Giá bán lẻ */}
        <div className="form-group-item">
          <label className="form-field-label required">Giá bán lẻ (VNĐ)</label>
          <div className="input-with-suffix">
            <input 
              type="number" 
              placeholder="0" 
              value={formData.price || ''} 
              onChange={(e) => onChange('price', e.target.value)}
              className="stylish-form-input"
            />
            <span className="suffix-text">đ</span>
          </div>
        </div>

        {/* Giá gốc trước giảm */}
        <div className="form-group-item">
          <label className="form-field-label">Giá gốc / Niêm yết (VNĐ)</label>
          <div className="input-with-suffix">
            <input 
              type="number" 
              placeholder="0" 
              value={formData.origPrice || ''} 
              onChange={(e) => onChange('origPrice', e.target.value)}
              className="stylish-form-input"
            />
            <span className="suffix-text">đ</span>
          </div>
        </div>

        {/* Số lượng tồn kho */}
        <div className="form-group-item">
          <label className="form-field-label required">
            <Package size={14} /> Số lượng tồn kho kho hàng
          </label>
          <input 
            type="number" 
            placeholder="100" 
            value={formData.stock || ''} 
            onChange={(e) => onChange('stock', e.target.value)}
            className="stylish-form-input"
          />
        </div>

        {/* Trạng thái niêm yết */}
        <div className="form-group-item">
          <label className="form-field-label">Trạng thái đăng bán</label>
          <select 
            value={formData.status || 'Đang bán'} 
            onChange={(e) => onChange('status', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Đang bán">Đang bán (Hiển thị công khai)</option>
            <option value="Tạm ẩn">Tạm ẩn (Ẩn khỏi gian hàng)</option>
            <option value="Bản nháp">Bản nháp (Lưu nháp)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
