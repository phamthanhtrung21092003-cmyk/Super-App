import React from 'react';
import { ShieldCheck, Globe, Calendar, Clock, Sparkles } from 'lucide-react';

export default function ProductAdditionalInfo({ formData, onChange }) {
  const isPreOrder = Boolean(formData.isPreOrder);

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="step-card-title">6. Thông tin bổ sung & Thuộc tính sản phẩm</h3>
          <p className="step-card-desc">Cung cấp xuất xứ, chất liệu và chính sách bảo hành để tạo dựng lòng tin tối đa với khách hàng.</p>
        </div>
      </div>

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
            <option value="Việt Nam">🇻🇳 Việt Nam</option>
            <option value="Nhật Bản">🇯🇵 Nhật Bản</option>
            <option value="Hàn Quốc">🇰🇷 Hàn Quốc</option>
            <option value="Mỹ">🇺🇸 Mỹ (USA)</option>
            <option value="Trung Quốc">🇨🇳 Trung Quốc</option>
            <option value="Thái Lan">🇹🇭 Thái Lan</option>
            <option value="Đức">🇩🇪 Đức (Germany)</option>
            <option value="Khác">Khác / Nhập khẩu</option>
          </select>
        </div>

        {/* Chất liệu / Thành phần */}
        <div className="form-group-item">
          <label className="form-field-label">Chất liệu / Thành phần cấu tạo</label>
          <input 
            type="text" 
            placeholder="Ví dụ: 100% Cotton Compact, Nhựa ABS, Thép không gỉ..." 
            value={formData.material || ''} 
            onChange={(e) => onChange('material', e.target.value)}
            className="stylish-form-input"
          />
        </div>

        {/* Thời gian bảo hành */}
        <div className="form-group-item">
          <label className="form-field-label">Thời hạn bảo hành</label>
          <select 
            value={formData.warranty || '12 tháng'} 
            onChange={(e) => onChange('warranty', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Không bảo hành">Không bảo hành</option>
            <option value="1 tháng">1 tháng (Đổi mới 1:1)</option>
            <option value="3 tháng">3 tháng</option>
            <option value="6 tháng">6 tháng</option>
            <option value="12 tháng">12 tháng (1 năm)</option>
            <option value="24 tháng">24 tháng (2 năm chính hãng)</option>
            <option value="Trọn đời">Bảo hành trọn đời</option>
          </select>
        </div>

        {/* Loại hình bảo hành */}
        <div className="form-group-item">
          <label className="form-field-label">Loại hình bảo hành</label>
          <select 
            value={formData.warrantyType || 'Bảo hành điện tử'} 
            onChange={(e) => onChange('warrantyType', e.target.value)}
            className="stylish-form-select"
          >
            <option value="Bảo hành điện tử">Bảo hành điện tử (Theo SĐT / Serial)</option>
            <option value="Bảo hành qua tem / phiếu">Bảo hành bằng Tem / Phiếu bảo hành</option>
            <option value="Bảo hành chính hãng">Bảo hành chính hãng tại trung tâm bảo hành</option>
            <option value="Bảo hành của Shop">Bảo hành bởi Người bán</option>
          </select>
        </div>
      </div>

      {/* Hàng đặt trước (Pre-order) */}
      <div className="preorder-settings-box">
        <div className="preorder-toggle-row">
          <div>
            <div className="preorder-title">
              <Clock size={16} color="var(--primary)" />
              <strong>Hàng Đặt Trước (Pre-Order)</strong>
            </div>
            <p className="preorder-desc">Bật chế độ này nếu bạn cần nhiều thời gian hơn để chuẩn bị và sản xuất hàng hóa.</p>
          </div>

          <label className="toggle-switch-card mini-toggle">
            <input 
              type="checkbox" 
              checked={isPreOrder} 
              onChange={(e) => onChange('isPreOrder', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {isPreOrder && (
          <div className="preorder-days-input-row">
            <label className="form-field-label">Thời gian giao hàng dự kiến (Số ngày chuẩn bị hàng):</label>
            <div className="input-with-suffix" style={{ maxWidth: '200px' }}>
              <input 
                type="number" 
                min={7} 
                max={30} 
                value={formData.preOrderDays || '7'} 
                onChange={(e) => onChange('preOrderDays', e.target.value)}
                className="stylish-form-input"
              />
              <span className="suffix-text">ngày</span>
            </div>
            <span className="field-tip-text">Tối thiểu 7 ngày, tối đa 30 ngày.</span>
          </div>
        )}
      </div>
    </div>
  );
}
