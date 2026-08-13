import React from 'react';
import { Printer, Barcode, X } from 'lucide-react';

export default function ShippingLabelModal({ shipment, onClose }) {
  if (!shipment) return null;

  const trackingNo = shipment.trackingNo || 'VLX123456789';
  const provider = shipment.provider || 'V-life Delivery';
  const customerName = shipment.customerName || 'Nguyễn Văn B';
  const customerPhone = shipment.customerPhone || '0901234567';
  const customerAddress = shipment.address || '123 Nguyễn Huệ, Q.1, TP.HCM';
  const codAmount = shipment.cod || shipment.totalAmount || 263000;

  const handlePrint = () => {
    alert(`🖨️ Đã gửi lệnh in Nhãn vận chuyển cho mã vận đơn ${trackingNo}!`);
    onClose();
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Printer size={20} className="header-icon-green" />
            <h3 className="modal-title">In nhãn vận chuyển - {trackingNo}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="paper-print-preview-container">
            <div className="paper-sheet">
              <div className="label-preview-content">
                <div className="label-header">
                  <strong className="brand-logo-text">S-SHOPPING SELLER CENTER</strong>
                  <span className="carrier-badge">{provider}</span>
                </div>

                <div className="barcode-mock-box">
                  <Barcode size={48} className="barcode-svg" />
                  <span className="tracking-text">{trackingNo}</span>
                </div>

                <div className="label-address-grid">
                  <div className="addr-box">
                    <span className="lbl">NGƯỜI GỬI:</span>
                    <strong>SHOP THỜI TRANG BASIC OFFICIAL</strong>
                    <p>Kho Long Biên, Hà Nội - 0988 777 666</p>
                  </div>
                  <div className="addr-box">
                    <span className="lbl">NGƯỜI NHẬN:</span>
                    <strong>{customerName}</strong>
                    <p>{customerAddress}</p>
                    <p>SDT: {customerPhone}</p>
                  </div>
                </div>

                <div className="label-cod-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '8px', fontSize: '12px' }}>
                  <span>Mã đơn: <strong>#{shipment.code || shipment.id}</strong></span>
                  <strong style={{ color: '#00B14F', fontSize: '14px' }}>Tiền thu hộ COD: {codAmount.toLocaleString('vi-VN')}đ</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="nav-btn-secondary" onClick={onClose}>
              Đóng
            </button>
            <button type="button" className="nav-btn-primary" onClick={handlePrint}>
              <Printer size={16} /> In nhãn ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
