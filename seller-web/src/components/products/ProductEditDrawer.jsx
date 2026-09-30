import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { generateProductDescription } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

export default function ProductEditDrawer({ product, isOpen, onClose, onSave }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Thời trang',
    price: 0,
    origPrice: 0,
    stock: 0,
    sku: '',
    status: 'Đang bán',
    image: '',
    description: ''
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        category: product.category || 'Thời trang',
        price: product.price || 0,
        origPrice: product.origPrice || (product.price ? product.price * 1.2 : 0),
        stock: product.stock !== undefined ? product.stock : 50,
        sku: product.sku || '',
        status: product.status || 'Đang bán',
        image: product.image || '',
        description: product.description || ''
      });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAiOptimize = async () => {
    if (!formData.name.trim()) {
      toast.warning('Vui lòng nhập tên sản phẩm trước khi tạo mô tả bằng AI!');
      return;
    }

    setIsAiGenerating(true);
    try {
      const generated = await generateProductDescription({
        name: formData.name,
        category: formData.category,
        features: formData.description,
        price: formData.price
      });
      setFormData((prev) => ({ ...prev, description: generated }));
      toast.success('✨ Gemini AI đã tối ưu hóa mô tả sản phẩm chuẩn SEO e-commerce!');
    } catch {
      toast.error('Có lỗi xảy ra khi tạo mô tả bằng AI.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Tên sản phẩm không được để trống!');
      return;
    }
    if (Number(formData.price) <= 0) {
      toast.error('Giá bán sản phẩm phải lớn hơn 0!');
      return;
    }

    onSave({
      ...formData,
      price: Number(formData.price),
      origPrice: Number(formData.origPrice) || Number(formData.price),
      stock: Number(formData.stock)
    });
    toast.success(`✅ Đã cập nhật thông tin sản phẩm "${formData.name}" thành công!`);
    onClose();
  };

  return (
    <div className="drawer-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div 
        className="drawer-content-box"
        style={{
          width: '580px',
          maxWidth: '100%',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Chỉnh sửa sản phẩm</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã SKU: {formData.sku || formData.id}</span>
          </div>
          <button 
            onClick={onClose} 
            style={{ padding: '6px', borderRadius: '8px', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Product Name */}
          <div>
            <label className="input-label-text">Tên sản phẩm *</label>
            <input 
              type="text" 
              className="stylish-input"
              style={{ paddingLeft: '14px' }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          {/* Category & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="input-label-text">Ngành hàng / Danh mục</label>
              <select 
                className="stylish-input"
                style={{ paddingLeft: '14px' }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Điện thoại">Điện thoại</option>
                <option value="Thời trang">Thời trang</option>
                <option value="Mỹ phẩm">Mỹ phẩm</option>
                <option value="Điện tử">Điện tử</option>
                <option value="Gia dụng">Gia dụng</option>
                <option value="Mẹ & Bé">Mẹ & Bé</option>
              </select>
            </div>
            <div>
              <label className="input-label-text">Trạng thái bán</label>
              <select 
                className="stylish-input"
                style={{ paddingLeft: '14px' }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Đang bán">Đang bán</option>
                <option value="Hết hàng">Hết hàng</option>
                <option value="Tạm ẩn">Tạm ẩn</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="input-label-text">Giá bán (đ) *</label>
              <input 
                type="number" 
                className="stylish-input"
                style={{ paddingLeft: '14px' }}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label-text">Giá niêm yết (đ)</label>
              <input 
                type="number" 
                className="stylish-input"
                style={{ paddingLeft: '14px' }}
                value={formData.origPrice}
                onChange={(e) => setFormData({ ...formData, origPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label-text">Tồn kho</label>
              <input 
                type="number" 
                className="stylish-input"
                style={{ paddingLeft: '14px' }}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          {/* Image URL with preview */}
          <div>
            <label className="input-label-text">Đường dẫn ảnh sản phẩm (Image URL)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="stylish-input"
                style={{ paddingLeft: '14px', flex: 1 }}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              {formData.image && (
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                />
              )}
            </div>
          </div>

          {/* Description with Gemini AI Generator */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label-text" style={{ marginBottom: 0 }}>Mô tả chi tiết sản phẩm</label>
              <button 
                type="button" 
                onClick={handleAiOptimize}
                disabled={isAiGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
                  border: '1px solid #C7D2FE',
                  color: '#4F46E5',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: isAiGenerating ? 'not-allowed' : 'pointer'
                }}
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Gemini AI đang viết...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} color="#4F46E5" />
                    <span>✨ Gemini AI Tối ưu mô tả</span>
                  </>
                )}
              </button>
            </div>
            <textarea 
              className="stylish-input"
              rows={9}
              style={{ padding: '12px 14px', resize: 'vertical', minHeight: '160px', lineHeight: '1.5' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập thông tin sản phẩm hoặc bấm 'Gemini AI Tối ưu mô tả' để tự động tạo..."
            />
          </div>

          {/* Drawer Actions */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="nav-btn-secondary"
              onClick={onClose}
              style={{ minWidth: '100px', justifyContent: 'center' }}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="nav-btn-primary"
              style={{ minWidth: '150px', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
