import React, { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, X } from 'lucide-react';

export default function ExportReportModal({ onClose }) {
  const [reportType, setReportType] = useState('revenue');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-13');
  const [fileFormat, setFileFormat] = useState('excel');

  const handleExport = (e) => {
    e.preventDefault();
    alert(`📥 Đã xuất báo cáo tài chính loại "${reportType.toUpperCase()}" định dạng ${fileFormat.toUpperCase()} từ ${fromDate} đến ${toDate}!`);
    onClose();
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Download size={20} className="header-icon-green" />
            <h3 className="modal-title">Xuất báo cáo tài chính</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleExport} className="modal-form-body">
          <div className="form-group-field">
            <label className="field-label">Chọn loại Báo cáo tài chính (*):</label>
            <div className="radio-reasons-group">
              {[
                { id: 'revenue', label: 'Báo cáo Doanh thu' },
                { id: 'expense', label: 'Báo cáo Chi phí & Phí sàn' },
                { id: 'profit', label: 'Báo cáo Lợi nhuận ước tính' },
                { id: 'transaction', label: 'Báo cáo Chi tiết Giao dịch' },
                { id: 'reconciliation', label: 'Báo cáo Đối soát tài chính' }
              ].map(opt => (
                <label key={opt.id} className="radio-option-label">
                  <input 
                    type="radio" 
                    name="reportType" 
                    value={opt.id}
                    checked={reportType === opt.id}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row-grid-2">
            <div className="form-group-field">
              <label className="field-label">Từ ngày:</label>
              <input 
                type="date"
                className="modal-input-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group-field">
              <label className="field-label">Đến ngày:</label>
              <input 
                type="date"
                className="modal-input-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Định dạng file xuất:</label>
            <div className="form-row-grid-2">
              <label className="radio-option-label">
                <input 
                  type="radio" 
                  name="format" 
                  value="excel"
                  checked={fileFormat === 'excel'}
                  onChange={(e) => setFileFormat(e.target.value)}
                />
                <span>Excel (.xlsx)</span>
              </label>

              <label className="radio-option-label">
                <input 
                  type="radio" 
                  name="format" 
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={(e) => setFileFormat(e.target.value)}
                />
                <span>CSV (.csv)</span>
              </label>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nav-btn-primary">
              <Download size={15} /> Xác nhận xuất báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
