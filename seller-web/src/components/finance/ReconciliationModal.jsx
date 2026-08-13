import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, FileSpreadsheet, X } from 'lucide-react';

export default function ReconciliationModal({ onClose }) {
  const [selectedCycle, setSelectedCycle] = useState('Kỳ 01/08/2026 - 15/08/2026');

  const reconciliationCycles = [
    {
      id: 'cyc_01',
      period: 'Kỳ 01/08/2026 - 15/08/2026',
      totalGross: 248320000,
      totalFee: 17870000,
      totalRefund: 1200000,
      netAmount: 229250000,
      status: 'Đã đối soát',
      payoutDate: '16/08/2026'
    },
    {
      id: 'cyc_02',
      period: 'Kỳ 16/07/2026 - 31/07/2026',
      totalGross: 185400000,
      totalFee: 12400000,
      totalRefund: 800000,
      netAmount: 172200000,
      status: 'Đã hoàn tất thanh toán',
      payoutDate: '01/08/2026'
    }
  ];

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <CheckCircle2 size={20} className="header-icon-green" />
            <h3 className="modal-title">Đối soát tài chính gian hàng</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="form-group-field">
            <label className="field-label">Chọn kỳ đối soát tài chính:</label>
            <select 
              className="modal-select-control"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              {reconciliationCycles.map(c => (
                <option key={c.id} value={c.period}>
                  {c.period} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Breakdown Card */}
          <div className="stock-hero-breakdown-card">
            <div className="breakdown-grid-metrics">
              <div className="bk-metric-box">
                <span className="lbl">Tổng doanh thu đơn hàng</span>
                <strong className="val">248.320.000 đ</strong>
              </div>
              <div className="bk-metric-box warning-border">
                <span className="lbl">Tổng các khoản phí (Phí sàn + Phí VC)</span>
                <strong className="val orange-text">-17.870.000 đ</strong>
              </div>
              <div className="bk-metric-box">
                <span className="lbl">Tổng tiền hoàn trả khách</span>
                <strong className="val">-1.200.000 đ</strong>
              </div>
              <div className="bk-metric-box primary-border">
                <span className="lbl">Số tiền thực nhận chuyển về Ví</span>
                <strong className="val green-text">229.250.000 đ</strong>
              </div>
            </div>
            <div className="formula-note-row">
              <code>Trạng thái: 🟢 Đã đối soát thành công (Dự kiến chuyển tiền ngày 16/08/2026)</code>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Đóng
            </button>
            <button type="button" className="nav-btn-primary" onClick={() => alert('📥 Đã tải file sao kê đối soát chi tiết (.xlsx)...')}>
              <FileSpreadsheet size={15} /> Tải file đối soát Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
