import React, { useState } from 'react';
import { Radio, Calendar, Clock, User, Upload, CheckCircle2, ChevronRight, ChevronLeft, X, Tag } from 'lucide-react';
import LivestreamProductSelector from './LivestreamProductSelector';

export default function LivestreamCreateModal({
  catalogProducts = [],
  onClose,
  onSubmitLivestream
}) {
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Thời trang');
  const [description, setDescription] = useState('');
  const [hostName, setHostName] = useState('MC Linh');
  const [scheduledDate, setScheduledDate] = useState('15/08/2026');
  const [scheduledTime, setScheduledTime] = useState('20:00');
  const [duration, setDuration] = useState('01:30:00');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400');
  const [selectedProductIds, setSelectedProductIds] = useState(['p1', 'p2']);

  const toggleProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(i => i !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleFinish = (statusAction) => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên livestream!');
      return;
    }

    const newLive = {
      id: `LIVE${Math.floor(100 + Math.random() * 900)}`,
      sellerId: 'S001',
      title: title,
      category: category,
      description: description,
      hostName: hostName,
      thumbnailUrl: thumbnailUrl,
      status: statusAction === 'LIVE' ? 'LIVE' : statusAction === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: `${scheduledDate} ${scheduledTime}`,
      duration: duration,
      viewers: statusAction === 'LIVE' ? 120 : 0,
      likes: 0,
      orders: 0,
      revenue: 0,
      productIds: selectedProductIds,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    onSubmitLivestream(newLive);
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div className="header-title-group">
            <Radio size={20} style={{ color: '#EF4444' }} />
            <h3 className="modal-title">Tạo buổi Livestream bán hàng mới trên V-life</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)', padding: '10px 20px', gap: '8px' }}>
          {[
            { num: 1, label: 'Thông tin buổi LIVE' },
            { num: 2, label: 'Ảnh bìa Thumbnail' },
            { num: 3, label: 'Chọn sản phẩm bán' }
          ].map(s => (
            <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: step === s.num ? '800' : '600', color: step === s.num ? '#EF4444' : 'var(--text-muted)' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: step === s.num ? '#EF4444' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                {s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="modal-form-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {/* STEP 1: GENERAL INFO & SCHEDULE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group-field">
                <label className="field-label">Tên buổi Livestream (*):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  placeholder="VD: Top deal cuối tuần - Giảm sốc đến 50%..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-field">
                  <label className="field-label">Chủ đề Livestream:</label>
                  <select 
                    className="modal-select-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Thời trang">Thời trang</option>
                    <option value="Gia dụng">Gia dụng thông minh</option>
                    <option value="Làm đẹp">Mỹ phẩm & Làm đẹp</option>
                    <option value="Công nghệ">Công nghệ & Phụ kiện</option>
                    <option value="Tổng hợp">Tổng hợp Super Sale</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label className="field-label">Tên Người dẫn / MC:</label>
                  <input 
                    type="text"
                    className="modal-input-control"
                    placeholder="VD: MC Linh"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-field">
                  <label className="field-label">Ngày phát sóng:</label>
                  <input 
                    type="text"
                    className="modal-input-control"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <div className="form-group-field">
                  <label className="field-label">Giờ phát sóng:</label>
                  <input 
                    type="text"
                    className="modal-input-control"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label className="field-label">Mô tả buổi phát sóng:</label>
                <textarea 
                  className="modal-input-control"
                  style={{ height: '60px', padding: '8px' }}
                  placeholder="Mô tả nội dung quà tặng, voucher freeship..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: THUMBNAIL DROPZONE */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-page)', cursor: 'pointer' }}>
                <Upload size={32} style={{ color: '#EF4444', marginBottom: '8px' }} />
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>Tải lên Ảnh bìa poster cho buổi Livestream</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Khuyên dùng tỉ lệ 9:16 hoặc 16:9, dung lượng dưới 5MB</span>
              </div>

              <div className="form-group-field">
                <label className="field-label">URL Ảnh bìa Thumbnail:</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: ATTACH PRODUCTS FROM CATALOG */}
          {step === 3 && (
            <div>
              <LivestreamProductSelector 
                catalogProducts={catalogProducts}
                selectedIds={selectedProductIds}
                onToggleSelect={toggleProduct}
              />
            </div>
          )}

          {/* Actions Footer */}
          <div className="modal-actions-footer" style={{ marginTop: '20px' }}>
            {step > 1 ? (
              <button type="button" className="nav-btn-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={15} /> Quay lại
              </button>
            ) : (
              <button type="button" className="nav-btn-secondary" onClick={onClose}>
                Hủy
              </button>
            )}

            {step < 3 ? (
              <button type="button" className="nav-btn-primary" onClick={() => setStep(step + 1)}>
                Tiếp tục <ChevronRight size={15} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="nav-btn-secondary" onClick={() => handleFinish('DRAFT')}>
                  Lưu nháp
                </button>
                <button type="button" className="nav-btn-secondary" style={{ background: '#FFF7ED', color: '#F97316', borderColor: '#FFEDD5' }} onClick={() => handleFinish('SCHEDULED')}>
                  ⏱️ Lên lịch
                </button>
                <button type="button" className="nav-btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleFinish('LIVE')}>
                  🔴 Bắt đầu LIVE ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
