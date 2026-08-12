import React from 'react';
import { Layers } from 'lucide-react';

export default function ProductVariants({ formData, onChange }) {
  return (
    <div className="form-step-card">
      <h3 className="step-card-title">
        <Layers size={18} /> 3. Phân loại sản phẩm (Biến thể)
      </h3>
      <p className="step-card-desc">Thiết lập các nhóm phân loại như Màu sắc, Kích thước hoặc Dung lượng.</p>

      <div className="form-inputs-stack">
        <div className="form-group-item">
          <label className="form-field-label">Danh sách phân loại / Biến thể</label>
          <input 
            type="text" 
            placeholder="Ví dụ: Phân loại: Đen, Trắng, Xanh • Size S, M, L, XL" 
            value={formData.variants || ''} 
            onChange={(e) => onChange('variants', e.target.value)}
            className="stylish-form-input"
          />
          <span className="field-hint-text">Phân cách các biến thể bằng dấu phẩy hoặc dấu gạch đứng.</span>
        </div>

        <div className="form-group-item">
          <label className="form-field-label">Mã SKU Phân loại (SKU Code)</label>
          <input 
            type="text" 
            placeholder="Tự động tạo hoặc nhập thủ công (Ví dụ: ATN-BLACK-M)" 
            value={formData.sku || ''} 
            onChange={(e) => onChange('sku', e.target.value)}
            className="stylish-form-input font-monospace"
          />
        </div>
      </div>
    </div>
  );
}
