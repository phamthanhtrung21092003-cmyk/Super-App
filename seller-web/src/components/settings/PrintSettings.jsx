import React, { useState } from 'react';
import { Printer, Eye, CheckCircle2 } from 'lucide-react';

export default function PrintSettings() {
  const [paperSize, setPaperSize] = useState('A6');
  const [printerType, setPrinterType] = useState('thermal');
  const [showLogo, setShowLogo] = useState(true);
  const [showShopPhone, setShowShopPhone] = useState(true);
  const [showItemNotes, setShowItemNotes] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Đã lưu cấu hình mẫu in!');
  };

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <div className="card-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-heading-title">Cài đặt Mẫu in</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Thiết lập khổ giấy và định dạng in phiếu đóng gói & vận đơn
          </p>
        </div>

        <button className="nav-btn-secondary" style={{ fontSize: '11px' }} onClick={() => alert('Đang mở bản in thử nghiệm...')}>
          <Eye size={13} /> In thử mẫu
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-row-grid-2">
          <div className="form-group-field">
            <label className="field-label">Khổ giấy in tiêu chuẩn:</label>
            <select 
              className="modal-select-control"
              value={paperSize}
              onChange={e => setPaperSize(e.target.value)}
            >
              <option value="A6">Khổ A6 (100x150mm - Chuẩn máy in nhiệt TMĐT)</option>
              <option value="A4">Khổ A4 (Chuẩn máy in văn phòng thông thường)</option>
              <option value="A5">Khổ A5 (Nửa tờ A4)</option>
            </select>
          </div>

          <div className="form-group-field">
            <label className="field-label">Loại máy in sử dụng:</label>
            <select 
              className="modal-select-control"
              value={printerType}
              onChange={e => setPrinterType(e.target.value)}
            >
              <option value="thermal">Máy in nhiệt (Thermal Printer USB/LAN)</option>
              <option value="laser">Máy in Laser / Phun màu thông thường</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px' }}>Tùy chọn hiển thị trên phiếu in</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showLogo} onChange={() => setShowLogo(!showLogo)} className="stylish-checkbox" />
              In kèm Logo thương hiệu Shop trên đầu phiếu
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showShopPhone} onChange={() => setShowShopPhone(!showShopPhone)} className="stylish-checkbox" />
              Hiển thị số điện thoại Hotline Shop
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showItemNotes} onChange={() => setShowItemNotes(!showItemNotes)} className="stylish-checkbox" />
              In kèm mã SKU & ghi chú phân loại màu/size chi tiết
            </label>
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" className="nav-btn-primary" style={{ padding: '10px 24px' }}>
            <CheckCircle2 size={16} /> Lưu cài đặt mẫu in
          </button>
        </div>
      </form>
    </div>
  );
}
