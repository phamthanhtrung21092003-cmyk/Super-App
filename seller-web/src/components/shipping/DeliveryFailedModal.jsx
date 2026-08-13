import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, X } from 'lucide-react';

export default function DeliveryFailedModal({ shipment, onClose, onRetryDelivery, onReturnShipment }) {
  const [failedReason, setFailedReason] = useState('Khách hàng hẹn lại thời gian giao');

  if (!shipment) return null;

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel danger-theme" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <AlertTriangle size={20} className="header-icon-red" />
            <h3 className="modal-title">Xử lý Vận đơn Giao thất bại - #{shipment.code || shipment.trackingNo}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="modal-info-summary-box warning-border">
            <div className="summary-row">
              <span className="lbl">Mã đơn / Vận đơn:</span>
              <code>#{shipment.code || shipment.id} / {shipment.trackingNo || 'VLX123456789'}</code>
            </div>
            <div className="summary-row">
              <span className="lbl">Lý do giao không thành công:</span>
              <strong className="reason-text-orange">{failedReason}</strong>
            </div>
            <div className="summary-row">
              <span className="lbl">Đơn vị vận chuyển:</span>
              <span>{shipment.provider || 'V-life Delivery'}</span>
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Cập nhật lý do báo cáo từ tài xế:</label>
            <select 
              className="modal-select-control"
              value={failedReason}
              onChange={(e) => setFailedReason(e.target.value)}
            >
              <option value="Khách hàng hẹn lại thời gian giao">Khách hàng hẹn lại thời gian giao</option>
              <option value="Không liên lạc được với người nhận (Gọi 3 cuộc)">Không liên lạc được với người nhận (Gọi 3 cuộc)</option>
              <option value="Khách hàng từ chối nhận hàng (Khách đổi ý)">Khách hàng từ chối nhận hàng (Khách đổi ý)</option>
              <option value="Sai địa chỉ / Không tìm thấy địa chỉ">Sai địa chỉ / Không tìm thấy địa chỉ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <p className="modal-note-text">
            💡 Vui lòng chọn <strong>"Phát lại lần 2"</strong> để yêu cầu tài xế giao lại, hoặc <strong>"Xác nhận Hoàn hàng"</strong> để gửi đơn về kho Seller.
          </p>

          <div className="modal-actions-footer">
            <button 
              type="button" 
              className="nav-btn-secondary danger-text-btn"
              onClick={() => onReturnShipment(shipment.id)}
            >
              <RotateCcw size={15} /> Xác nhận Hoàn hàng
            </button>
            <button 
              type="button" 
              className="nav-btn-primary"
              onClick={() => onRetryDelivery(shipment.id)}
            >
              <RefreshCw size={15} /> Giao lại (Phát lại Lần 2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
