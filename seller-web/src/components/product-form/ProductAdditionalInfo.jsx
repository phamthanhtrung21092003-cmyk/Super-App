import React from 'react';
import { ShieldCheck, Globe } from 'lucide-react';

export default function ProductAdditionalInfo({ formData, onChange }) {
  return (
    <div className="form-step-card">
      <h3 className="step-card-title">
        <ShieldCheck size={18} /> 6. Thông tin bổ sung
      </h3>
      <p className="step-card-desc">Cung cấp chế độ bảo hành và xuất xứ để tăng mức độ tin tưởng của người mua.</p>

      <div className="form-inputs-grid-2">
        {/* Xuất xứ */}
        <div className="form-group-item">
          <label className="form-field-label">
            <Globe size={14} /> Xuất xứ sản phẩm
          </label>
          <select 
            value={formData.origin || 'Việt Nam'} 
            onChange={(e) => onChange('origin', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Việt Nam">Việt Nam</option>
            <option value="Nhật Bản">Nhật Bản</option>
            <option value="Hàn Quốc">Hàn Quốc</option>
            <option value="Mỹ">Mỹ / USA</option>
            <option value="Trung Quốc">Trung Quốc</option>
            <option value="Thái Lan">Thái Lan</option>
          </select>
        </div>

        {/* Chế độ bảo hành */}
        <div className="form-group-item">
          <label className="form-field-label">Thời gian bảo hành</label>
          <select 
            value={formData.warranty || '12 tháng'} 
            onChange={(e) => onChange('warranty', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Không bảo hành">Không bảo hành</option>
            <option value="3 tháng">3 tháng</option>
            <option value="6 tháng">6 tháng</option>
            <option value="12 tháng">12 tháng (1 năm chính hãng)</option>
            <option value="24 tháng">24 tháng (2 năm chính hãng)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
