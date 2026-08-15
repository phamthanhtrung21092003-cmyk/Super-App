import React from 'react';
import { Truck, Scale, Box, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ProductShipping({ formData, onChange }) {
  const weight = parseFloat(formData.weight) || 500;
  const length = parseFloat(formData.length) || 20;
  const width = parseFloat(formData.width) || 15;
  const height = parseFloat(formData.height) || 10;

  // Thể tích quy đổi: (Dài x Rộng x Cao) / 6000 (kg) -> quy về gram: / 6 (gram)
  const volumetricWeightGram = Math.round((length * width * height) / 6);

  const shippingChannels = [
    { id: 'express', name: 'Nhanh (GHN / Viettel Post / SPX)', time: '1-3 ngày', price: '22.000đ - 35.000đ', enabled: true },
    { id: 'instant', name: 'Hỏa Tốc (GrabExpress / BeDelivery)', time: '1-2 giờ', price: '45.000đ - 60.000đ', enabled: formData.enableInstant !== false },
    { id: 'economy', name: 'Tiết kiệm (VNPost EMS)', time: '3-5 ngày', price: '15.000đ - 22.000đ', enabled: true }
  ];

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <Truck size={20} />
        </div>
        <div>
          <h3 className="step-card-title">5. Vận chuyển & Kích thước đóng gói</h3>
          <p className="step-card-desc">Cân nặng và kích thước thực tế sau khi đóng hộp bọc hàng để các đơn vị vận chuyển tính cước phí chuẩn xác.</p>
        </div>
      </div>

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
              required
            />
            <span className="suffix-text">gram</span>
          </div>
          <span className="field-tip-text">Trọng lượng bao gồm cả sản phẩm, hộp đựng, túi bóng khí và bao bì bọc hàng.</span>
        </div>

        {/* Kích thước bọc hàng */}
        <div className="form-group-item">
          <div className="form-label-row">
            <label className="form-field-label required">
              <Box size={14} /> Kích thước đóng gói (D x R x C cm)
            </label>
            <span className="volumetric-badge">
              Quy đổi: ~{volumetricWeightGram}g
            </span>
          </div>
          <div className="dimensions-inputs-trio">
            <input 
              type="number" 
              placeholder="Dài" 
              value={formData.length || ''} 
              onChange={(e) => onChange('length', e.target.value)}
              className="stylish-form-input"
            />
            <span className="dim-sep">×</span>
            <input 
              type="number" 
              placeholder="Rộng" 
              value={formData.width || ''} 
              onChange={(e) => onChange('width', e.target.value)}
              className="stylish-form-input"
            />
            <span className="dim-sep">×</span>
            <input 
              type="number" 
              placeholder="Cao" 
              value={formData.height || ''} 
              onChange={(e) => onChange('height', e.target.value)}
              className="stylish-form-input"
            />
          </div>
          <span className="field-tip-text">Đơn vị: centimet (cm). Phí vận chuyển tính theo giá trị lớn hơn giữa cân nặng thực và cân nặng quy đổi.</span>
        </div>
      </div>

      {/* Danh sách kênh vận chuyển */}
      <div className="shipping-channels-section">
        <label className="form-field-label">Kênh vận chuyển kích hoạt cho sản phẩm này</label>
        <div className="shipping-channels-list">
          {shippingChannels.map(ch => (
            <div key={ch.id} className="shipping-channel-card">
              <div className="channel-info-left">
                <div className="channel-icon-circle">
                  <Truck size={16} />
                </div>
                <div>
                  <div className="channel-title">{ch.name}</div>
                  <div className="channel-subtitle">Thời gian giao: {ch.time} • Cước phí ước tính: {ch.price}</div>
                </div>
              </div>

              <div className="channel-action-right">
                <label className="toggle-switch-card mini-toggle">
                  <input 
                    type="checkbox" 
                    checked={ch.enabled} 
                    onChange={(e) => {
                      if (ch.id === 'instant') onChange('enableInstant', e.target.checked);
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
