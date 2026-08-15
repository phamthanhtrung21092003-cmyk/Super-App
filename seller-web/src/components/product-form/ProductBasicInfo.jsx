import React from 'react';
import { FileText, Tag, Layers, Info, Check, Sparkles } from 'lucide-react';

export default function ProductBasicInfo({ formData, onChange }) {
  const categories = [
    { id: 'Thời trang nam', name: 'Thời trang Nam (Áo, Quần, Phụ kiện)' },
    { id: 'Thời trang nữ', name: 'Thời trang Nữ (Đầm, Váy, Áo kiểu)' },
    { id: 'Điện thoại & Phụ kiện', name: 'Điện thoại & Phụ kiện công nghệ' },
    { id: 'Giày dép & Túi xách', name: 'Giày dép, Túi xách & Balo' },
    { id: 'Mỹ phẩm & Làm đẹp', name: 'Mỹ phẩm, Chăm sóc da & Làm đẹp' },
    { id: 'Đồ gia dụng & Đời sống', name: 'Đồ gia dụng, Nội thất & Đời sống' },
    { id: 'Thể thao & Dã ngoại', name: 'Thể thao, Du lịch & Dã ngoại' },
    { id: 'Mẹ & Bé', name: 'Mẹ & Bé, Đồ chơi trẻ em' },
    { id: 'Bách hóa online', name: 'Bách hóa online & Thực phẩm' }
  ];

  const popularBrands = ['No Brand', 'Nike', 'Adidas', 'Uniqlo', 'Zara', 'Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Anker', 'Baseus'];

  const generateAITitle = () => {
    if (!formData.name) {
      onChange('name', 'Áo thun nam basic Cotton 100% thoáng mát co giãn 4 chiều phong cách Hàn Quốc');
    } else {
      onChange('name', `${formData.name} Cao Cấp Chính Hãng (Mẫu Mới 2026)`);
    }
  };

  const nameLength = (formData.name || '').length;

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="step-card-title">1. Thông tin cơ bản sản phẩm</h3>
          <p className="step-card-desc">Điền thông tin chính xác, chuẩn SEO giúp sản phẩm tiếp cận hàng triệu khách hàng trên S-Shopping.</p>
        </div>
      </div>

      <div className="form-inputs-stack">
        {/* Tên sản phẩm */}
        <div className="form-group-item">
          <div className="form-label-row">
            <label className="form-field-label required">Tên sản phẩm</label>
            <button 
              type="button" 
              className="ai-suggest-btn" 
              onClick={generateAITitle}
              title="Gợi ý tên chuẩn SEO bằng AI"
            >
              <Sparkles size={13} /> Gợi ý tên chuẩn SEO
            </button>
          </div>
          <input 
            type="text" 
            placeholder="Ví dụ: Áo thun nam basic Essential Cotton 100% co giãn 4 chiều..." 
            value={formData.name || ''} 
            onChange={(e) => onChange('name', e.target.value)}
            className={`stylish-form-input ${nameLength > 120 ? 'input-error' : ''}`}
            maxLength={140}
            required
          />
          <div className="field-meta-row">
            <span className="field-tip-text">💡 Công thức chuẩn: [Loại SP] + [Thương hiệu] + [Chất liệu/Đặc tính nổi bật] + [Mã/Model]</span>
            <span className={`field-counter-text ${nameLength > 120 ? 'text-danger' : ''}`}>
              {nameLength}/120 ký tự
            </span>
          </div>
        </div>

        {/* Danh mục ngành hàng */}
        <div className="form-group-item">
          <label className="form-field-label required">Ngành hàng / Danh mục sản phẩm</label>
          <select 
            value={formData.category || 'Thời trang nam'} 
            onChange={(e) => onChange('category', e.target.value)}
            className="stylish-form-select"
            required
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="field-tip-text">Chọn đúng ngành hàng giúp tối ưu tìm kiếm và tính đúng mức phí sàn.</span>
        </div>

        {/* Thương hiệu */}
        <div className="form-group-item">
          <label className="form-field-label">Thương hiệu / Nhãn hàng</label>
          <input 
            type="text" 
            placeholder="Nhập thương hiệu hoặc chọn gợi ý bên dưới..." 
            value={formData.brand || ''} 
            onChange={(e) => onChange('brand', e.target.value)}
            className="stylish-form-input"
          />
          <div className="brand-chips-row">
            <span className="chips-label">Gợi ý:</span>
            {popularBrands.map(b => (
              <button 
                key={b} 
                type="button" 
                className={`brand-chip-btn ${formData.brand === b ? 'selected' : ''}`}
                onClick={() => onChange('brand', b)}
              >
                {formData.brand === b && <Check size={11} />} {b}
              </button>
            ))}
          </div>
        </div>

        {/* Tình trạng hàng hóa */}
        <div className="form-group-item">
          <label className="form-field-label">Tình trạng sản phẩm</label>
          <div className="radio-pills-row">
            {[
              { value: 'Mới 100%', label: '✨ Mới 100% (Chưa qua sử dụng, nguyên seal)' },
              { value: 'Đã qua sử dụng', label: '🔄 Đã qua sử dụng (Like new / 99%)' }
            ].map(item => (
              <label key={item.value} className={`radio-pill-card ${formData.condition === item.value ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="productCondition"
                  value={item.value}
                  checked={formData.condition === item.value || (!formData.condition && item.value === 'Mới 100%')}
                  onChange={(e) => onChange('condition', e.target.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mô tả chi tiết sản phẩm */}
        <div className="form-group-item">
          <div className="form-label-row">
            <label className="form-field-label required">Mô tả sản phẩm</label>
            <span className="field-counter-text">{(formData.description || '').length}/3000 ký tự</span>
          </div>

          <div className="editor-quick-toolbar">
            <button 
              type="button" 
              className="editor-tool-btn" 
              onClick={() => onChange('description', (formData.description || '') + '\n• Điểm nổi bật: ')}
            >
              • Thêm gạch đầu dòng
            </button>
            <button 
              type="button" 
              className="editor-tool-btn" 
              onClick={() => onChange('description', (formData.description || '') + '\n📐 BẢNG QUY ĐỔI KÍCH CỠ:\n- Size S: 45-53kg\n- Size M: 54-62kg\n- Size L: 63-70kg\n- Size XL: 71-80kg')}
            >
              📐 Chèn bảng Size mẫu
            </button>
            <button 
              type="button" 
              className="editor-tool-btn" 
              onClick={() => onChange('description', (formData.description || '') + '\n🧼 HƯỚNG DẪN BẢO QUẢN:\n- Giặt ở nhiệt độ thường\n- Không dùng chất tẩy mạnh\n- Phơi nơi thoáng mát')}
            >
              🧼 Hướng dẫn bảo quản
            </button>
          </div>

          <textarea 
            placeholder="Mô tả chi tiết về sản phẩm:&#10;1. Đặc điểm nổi bật & Công dụng&#10;2. Chất liệu và thông số kỹ thuật&#10;3. Hướng dẫn chọn kích thước / Màu sắc&#10;4. Chính sách bảo hành và đổi trả..." 
            value={formData.description || ''} 
            onChange={(e) => onChange('description', e.target.value)}
            className="stylish-form-textarea"
            rows={7}
            maxLength={3000}
            required
          />
        </div>
      </div>
    </div>
  );
}
