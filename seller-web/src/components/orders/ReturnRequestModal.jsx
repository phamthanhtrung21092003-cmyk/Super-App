import React from 'react';
import { RotateCcw, AlertCircle, Image as ImageIcon, CheckCircle2, XCircle, X } from 'lucide-react';

export default function ReturnRequestModal({ order, onClose, onApprove, onReject }) {
  if (!order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer, phone: '0901234567' };
  const items = order.items || [];
  const returnReason = order.cancelReason || order.returnReason || 'Sản phẩm lỗi do nhà sản xuất (Bị rách chỉ, giao sai màu)';
  const refundAmount = order.summary?.total || order.total || 0;

  const mockProofImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300'
  ];

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div className="order-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <RotateCcw size={20} className="header-icon-orange" />
            <h3 className="modal-title">Yêu cầu Trả hàng / Hoàn tiền - Đơn #{order.code || order.id}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="modal-info-summary-box">
            <div className="summary-row">
              <span className="lbl">Khách hàng yêu cầu:</span>
              <strong>{customer.name} ({customer.phone})</strong>
            </div>
            <div className="summary-row">
              <span className="lbl">Lý do trả hàng:</span>
              <strong className="reason-text-orange">{returnReason}</strong>
            </div>
            <div className="summary-row">
              <span className="lbl">Số tiền đề nghị hoàn:</span>
              <strong className="green-price-text">{refundAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          {/* Items returned */}
          <div className="modal-items-list-block">
            <h4 className="block-title">Sản phẩm trả lại:</h4>
            {items.map((it, idx) => (
              <div key={idx} className="item-confirm-row">
                <img src={it.image} alt={it.name} className="confirm-thumb" />
                <div className="confirm-details">
                  <span className="item-name-text">{it.name}</span>
                  <span className="item-sub-tags">Product ID: {it.productId || 'p2'} | SKU: {it.sku || 'ATB-BLK-M'}</span>
                </div>
                <strong>x{it.quantity || 1}</strong>
              </div>
            ))}
          </div>

          {/* Proof Photos */}
          <div className="proof-photos-card">
            <h4 className="block-title"><ImageIcon size={14} /> Hình ảnh/Bằng chứng người mua tải lên:</h4>
            <div className="proof-thumbs-row">
              {mockProofImages.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt={`Proof ${idx}`} className="proof-img" />
              ))}
            </div>
          </div>

          <div className="modal-actions-footer">
            <button 
              type="button" 
              className="nav-btn-secondary danger-text-btn"
              onClick={() => onReject(order.id)}
            >
              <XCircle size={15} /> Từ chối yêu cầu
            </button>
            <button 
              type="button" 
              className="nav-btn-primary"
              onClick={() => onApprove(order.id)}
            >
              <CheckCircle2 size={15} /> Chấp nhận hoàn tiền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
