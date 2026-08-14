import React, { useState } from 'react';
import { Settings, CheckCircle2, X } from 'lucide-react';

export default function ReportCustomizeModal({ onClose }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'aov', 'visits', 'conversion']);

  const toggleMetric = (id) => {
    if (selectedMetrics.includes(id)) {
      setSelectedMetrics(selectedMetrics.filter(i => i !== id));
    } else {
      setSelectedMetrics([...selectedMetrics, id]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Đã lưu cấu hình Tùy chỉnh Báo cáo!');
    onClose();
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Settings size={20} className="header-icon-green" />
            <h3 className="modal-title">Tùy chỉnh Báo cáo kinh doanh</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form-body">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Chọn các chỉ số KPI và biểu đồ bạn muốn hiển thị trên màn hình Báo cáo Tổng quan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'revenue', label: 'Doanh thu tổng & Doanh thu thuần' },
              { id: 'orders', label: 'Số lượng Đơn hàng & Tỷ lệ hoàn thành' },
              { id: 'aov', label: 'Giá trị đơn hàng trung bình (AOV)' },
              { id: 'visits', label: 'Lượt truy cập gian hàng & lượt xem' },
              { id: 'conversion', label: 'Tỷ lệ chuyển đổi đơn hàng (%)' },
              { id: 'livestream', label: 'Doanh thu từ Livestream & Video Feed' },
              { id: 'profit', label: 'Biên lợi nhuận gộp & Chi phí' }
            ].map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-page)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedMetrics.includes(m.id)}
                  onChange={() => toggleMetric(m.id)}
                  className="stylish-checkbox"
                />
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{m.label}</span>
              </label>
            ))}
          </div>

          <div className="modal-actions-footer" style={{ marginTop: '20px' }}>
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nav-btn-primary">
              <CheckCircle2 size={15} /> Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
