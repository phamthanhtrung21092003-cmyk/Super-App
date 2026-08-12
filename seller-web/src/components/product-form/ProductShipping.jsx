import React from 'react';
import { Truck, Scale, Box } from 'lucide-react';

export default function ProductShipping({ formData, onChange }) {
  return (
    <div className="form-step-card">
      <h3 className="step-card-title">
        <Truck size={18} /> 5. Vận chuyển & Kích thước đóng gói
      </h3>
      <p className="step-card-desc">Cân nặng và kích thước đóng gói sau khi bọc hàng để đơn vị vận chuyển tính phí chính xác.</p>

      <div className="form-inputs-grid-2">
        {/* Cân nặng */}
        <div className="form-group-item">
          <label className="form-field-label required">
            <Scale size={14} /> Cân nặng sau đóng gói (Gram)
          </label>
          <div className="input-with-suffix">
            <input 
              type="number" 
              placeholder="500" 
              value={formData.weight || ''} 
              onChange={(e) => onChange('weight', e.target.value)}
              className="stylish-form-input"
            />
            <span className="suffix-text">gram</span>
          </div>
        </div>

        {/* Kích thước bọc hàng */}
        <div className="form-group-item">
          <label className="form-field-label">
            <Box size={14} /> Kích thước bọc hàng (Dài x Rộng x Cao cm)
          </label>
          <div className="dimensions-inputs-trio">
            <input 
              type="number" 
              placeholder="Dài (cm)" 
              value={formData.length || ''} 
              onChange={(e) => onChange('length', e.target.value)}
              className="stylish-form-input"
            />
            <span>x</span>
            <input 
              type="number" 
              placeholder="Rộng (cm)" 
              value={formData.width || ''} 
              onChange={(e) => onChange('width', e.target.value)}
              className="stylish-form-input"
            />
            <span>x</span>
            <input 
              type="number" 
              placeholder="Cao (cm)" 
              value={formData.height || ''} 
              onChange={(e) => onChange('height', e.target.value)}
              className="stylish-form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
