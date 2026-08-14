import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';

export default function ReportExportModal({ onClose }) {
  const [format, setFormat] = useState('excel');
  const [reportType, setReportType] = useState('full');

  const handleExport = (e) => {
    e.preventDefault();
    alert(`🎉 Đã xuất Báo cáo thành công dưới dạng file ${format.toUpperCase()}! File sẽ tự động tải về máy.`);
    onClose();
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Download size={20} className="header-icon-green" />
            <h3 className="modal-title">Xuất báo cáo phân tích kinh doanh</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleExport} className="modal-form-body">
          <div className="form-group-field">
            <label className="field-label">Chọn định dạng file xuất (*):</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div 
                className={`report-item-row ${format === 'excel' ? 'active' : ''}`}
                style={{ padding: '12px', flexDirection: 'column', alignItems: 'center', gap: '6px', border: format === 'excel' ? '2px solid #00B14F' : '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setFormat('excel')}
              >
                <FileSpreadsheet size={24} style={{ color: '#00B14F' }} />
                <strong style={{ fontSize: '12px' }}>Excel (.xlsx)</strong>
              </div>

              <div 
                className={`report-item-row ${format === 'csv' ? 'active' : ''}`}
                style={{ padding: '12px', flexDirection: 'column', alignItems: 'center', gap: '6px', border: format === 'csv' ? '2px solid #00B14F' : '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setFormat('csv')}
              >
                <Table size={24} style={{ color: '#1877F2' }} />
                <strong style={{ fontSize: '12px' }}>CSV (.csv)</strong>
              </div>

              <div 
                className={`report-item-row ${format === 'pdf' ? 'active' : ''}`}
                style={{ padding: '12px', flexDirection: 'column', alignItems: 'center', gap: '6px', border: format === 'pdf' ? '2px solid #00B14F' : '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setFormat('pdf')}
              >
                <FileText size={24} style={{ color: '#EF4444' }} />
                <strong style={{ fontSize: '12px' }}>PDF (.pdf)</strong>
              </div>
            </div>
          </div>

          <div className="form-group-field" style={{ marginTop: '14px' }}>
            <label className="field-label">Phạm vi báo cáo:</label>
            <select 
              className="modal-select-control"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="full">Báo cáo Tổng hợp toàn bộ chỉ số (Full Analytics)</option>
              <option value="revenue">Báo cáo Doanh thu & Dòng tiền</option>
              <option value="orders">Báo cáo Chi tiết đơn hàng</option>
              <option value="products">Báo cáo Hiệu quả Sản phẩm</option>
              <option value="livestream">Báo cáo Livestream & Video Feed</option>
            </select>
          </div>

          <div className="modal-actions-footer" style={{ marginTop: '20px' }}>
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nav-btn-primary">
              <CheckCircle2 size={15} /> Tải file Báo cáo ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
