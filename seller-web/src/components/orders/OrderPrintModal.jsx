import React, { useState } from 'react';
import { Printer, Barcode, Package, FileText, X, Check } from 'lucide-react';

export default function OrderPrintModal({ order, onClose }) {
  const [printType, setPrintType] = useState('shipping_label'); // 'shipping_label' | 'packing_slip'

  if (!order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901234567', address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' };
  const items = order.items || [];
  const trackingNo = order.shipping?.trackingNo || 'VLX123456789';
  const provider = order.shipping?.providerName || 'V-life Delivery';

  const handlePrint = () => {
    alert(`🖨️ Đã gửi lệnh in ${printType === 'shipping_label' ? 'Nhãn vận chuyển' : 'Phiếu đóng gói'} cho đơn hàng ${order.code || order.id}!`);
    onClose();
  };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Printer size={20} className="header-icon-green" />
            <h3 className="modal-title">In phiếu đơn hàng {order.code || `#${order.id}`}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          {/* Print Type Selector */}
          <div className="print-tabs-bar">
            <button 
              type="button" 
              className={`print-tab-btn ${printType === 'shipping_label' ? 'active' : ''}`}
              onClick={() => setPrintType('shipping_label')}
            >
              <Barcode size={15} /> Nhãn vận chuyển (Shipping Label)
            </button>
            <button 
              type="button" 
              className={`print-tab-btn ${printType === 'packing_slip' ? 'active' : ''}`}
              onClick={() => setPrintType('packing_slip')}
            >
              <FileText size={15} /> Phiếu đóng gói (Packing Slip)
            </button>
          </div>

          {/* Paper Preview Card */}
          <div className="paper-print-preview-container">
            <div className="paper-sheet">
              {printType === 'shipping_label' ? (
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
                      <p>123 Nguyễn Văn Linh, Q.7, TP.HCM - 0988 777 666</p>
                    </div>
                    <div className="addr-box">
                      <span className="lbl">NGƯỜI NHẬN:</span>
                      <strong>{customer.name}</strong>
                      <p>{customer.address}</p>
                      <p>SDT: {customer.phone}</p>
                    </div>
                  </div>

                  <div className="label-items-mini-list">
                    <span>Nội dung hàng: {items.map(i => `${i.name} (${i.variant}) x${i.quantity}`).join(', ')}</span>
                  </div>
                </div>
              ) : (
                <div className="slip-preview-content">
                  <h3 className="slip-title">PHIẾU ĐÓNG GÓI SẢN PHẨM</h3>
                  <div className="slip-meta">
                    <span>Mã đơn: <strong>{order.code || order.id}</strong></span>
                    <span>Ngày in: {new Date().toLocaleDateString('vi-VN')}</span>
                  </div>

                  <table className="slip-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Product ID</th>
                        <th>SKU</th>
                        <th>Tên sản phẩm</th>
                        <th>SL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><code>{it.productId || 'p2'}</code></td>
                          <td><code>{it.sku || 'ATB-BLK-M'}</code></td>
                          <td>{it.name} ({it.variant})</td>
                          <td><strong>{it.quantity || 1}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
