import React from 'react';
import { DollarSign, Package, TrendingDown, Layers, ShieldCheck, Tag } from 'lucide-react';

export default function ProductPricing({ formData, onChange }) {
  const priceVal = parseFloat(formData.price) || 0;
  const origPriceVal = parseFloat(formData.origPrice) || 0;

  const discountPercent = (origPriceVal > priceVal && origPriceVal > 0)
    ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100)
    : 0;

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <DollarSign size={20} />
        </div>
        <div>
          <h3 className="step-card-title">4. Giá & Tồn kho sản phẩm</h3>
          <p className="step-card-desc">Thiết lập giá niêm yết, giá khuyến mãi và số lượng hàng trong kho.</p>
        </div>
      </div>

      <div className="form-inputs-grid-2">
        {/* Giá bán lẻ (Khuyến mãi) */}
        <div className="form-group-item">
          <label className="form-field-label required">Giá bán lẻ (VNĐ)</label>
          <div className="input-with-suffix">
            <input 
              type="number" 
              placeholder="189000" 
              value={formData.price || ''} 
              onChange={(e) => onChange('price', e.target.value)}
              className="stylish-form-input font-bold"
              required
            />
            <span className="suffix-text">₫</span>
          </div>
          <span className="field-tip-text">Giá người mua thực tế thanh toán trên sàn.</span>
        </div>

        {/* Giá gốc trước giảm */}
        <div className="form-group-item">
          <div className="form-label-row">
            <label className="form-field-label">Giá niêm yết / Giá gốc (VNĐ)</label>
            {discountPercent > 0 && (
              <span className="discount-calc-badge">
                <TrendingDown size={12} /> Giảm {discountPercent}%
              </span>
            )}
          </div>
          <div className="input-with-suffix">
            <input 
              type="number" 
              placeholder="250000" 
              value={formData.origPrice || ''} 
              onChange={(e) => onChange('origPrice', e.target.value)}
              className="stylish-form-input"
            />
            <span className="suffix-text">₫</span>
          </div>
          <span className="field-tip-text">Giá gạch ngang hiển thị để kích thích người mua.</span>
        </div>

        {/* Số lượng tồn kho */}
        <div className="form-group-item">
          <div className="form-label-row">
            <label className="form-field-label required">
              <Package size={14} /> Tổng số lượng tồn kho
            </label>
            {formData.hasVariants && (
              <span className="synced-badge">
                <Layers size={12} /> Tự động tính từ các phân loại
              </span>
            )}
          </div>
          <input 
            type="number" 
            placeholder="100" 
            value={formData.stock || ''} 
            onChange={(e) => onChange('stock', e.target.value)}
            className="stylish-form-input"
            readOnly={formData.hasVariants}
            style={formData.hasVariants ? { background: 'var(--bg-page)', cursor: 'not-allowed' } : {}}
            required
          />
          <span className="field-tip-text">
            {formData.hasVariants 
              ? 'Tổng số lượng được cộng dồn tự động từ bảng phân loại ở Bước 3.'
              : 'Số lượng sản phẩm thực tế sẵn sàng giao trong kho.'}
          </span>
        </div>

        {/* Trạng thái niêm yết */}
        <div className="form-group-item">
          <label className="form-field-label required">Trạng thái đăng bán</label>
          <select 
            value={formData.status || 'Đang bán'} 
            onChange={(e) => onChange('status', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Đang bán">🟢 Đang bán (Hiển thị ngay trên sàn S-Shopping)</option>
            <option value="Tạm ẩn">🟡 Tạm ẩn (Ẩn khỏi tìm kiếm của người mua)</option>
            <option value="Bản nháp">⚪ Bản nháp (Lưu tạm, chưa đăng bán)</option>
          </select>
        </div>

        {/* Giới hạn mua hàng */}
        <div className="form-group-item">
          <label className="form-field-label">Số lượng mua tối thiểu mỗi đơn</label>
          <input 
            type="number" 
            placeholder="1" 
            value={formData.minOrderQty || '1'} 
            onChange={(e) => onChange('minOrderQty', e.target.value)}
            className="stylish-form-input"
            min={1}
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label">Số lượng mua tối đa mỗi đơn</label>
          <input 
            type="number" 
            placeholder="Không giới hạn (ví dụ: 10)" 
            value={formData.maxOrderQty || ''} 
            onChange={(e) => onChange('maxOrderQty', e.target.value)}
            className="stylish-form-input"
          />
          <span className="field-tip-text">Tránh tình trạng gom hàng hoặc đầu cơ với giá khuyến mãi sốc.</span>
        </div>
      </div>
    </div>
  );
}
