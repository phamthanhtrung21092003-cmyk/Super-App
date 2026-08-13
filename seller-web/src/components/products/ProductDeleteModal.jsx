import React from 'react';
import { AlertTriangle, Trash2, EyeOff, X, ShieldAlert } from 'lucide-react';

export default function ProductDeleteModal({ product, onClose, onConfirmDelete, onConfirmHide }) {
  if (!product) return null;

  const hasOrders = (product.sold || 0) > 0;

  return (
    <div className="product-delete-modal-backdrop" onClick={onClose}>
      <div className="product-delete-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-icon-box">
            {hasOrders ? <ShieldAlert size={22} className="warning-icon" /> : <Trash2 size={22} className="danger-icon" />}
            <h3 className="modal-title">{hasOrders ? 'Không thể xóa sản phẩm' : 'Xác nhận xóa sản phẩm'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          <div className="product-preview-info">
            <img src={product.image} alt={product.name} className="modal-product-thumb" />
            <div className="modal-product-details">
              <h4 className="modal-product-name">{product.name}</h4>
              <p className="modal-product-sub">
                Product ID: <strong>{product.id}</strong> | SKU: <strong>{product.sku}</strong>
              </p>
              <span className="modal-product-sold">
                Tồn kho: {product.stock} | Đã bán: <strong>{product.sold || 0} đơn hàng</strong>
              </span>
            </div>
          </div>

          {hasOrders ? (
            <div className="modal-alert-box warning-alert">
              <AlertTriangle size={18} />
              <div>
                <strong>Sản phẩm này đã phát sinh lịch sử bán hàng!</strong>
                <p>
                  Để đảm bảo tính nhất quán dữ liệu đối soát và lịch sử đơn hàng của người mua, sản phẩm đã có đơn hàng không thể bị xóa vĩnh viễn khỏi hệ thống.
                </p>
                <p style={{ marginTop: '6px', color: '#B45309', fontWeight: '700' }}>
                  💡 Khuyến nghị: Bạn có thể chọn "Tạm ẩn sản phẩm" để ẩn sản phẩm khỏi cửa hàng ngay lập tức.
                </p>
              </div>
            </div>
          ) : (
            <div className="modal-alert-box danger-alert">
              <AlertTriangle size={18} />
              <div>
                <strong>Cảnh báo xóa vĩnh viễn!</strong>
                <p>
                  Sản phẩm chưa có đơn hàng. Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi Product Catalog không? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="nav-btn-secondary" onClick={onClose}>
            Hủy
          </button>

          {hasOrders ? (
            <button 
              className="nav-btn-primary hide-action-btn"
              onClick={() => onConfirmHide(product)}
            >
              <EyeOff size={15} /> Tạm ẩn sản phẩm khỏi gian hàng
            </button>
          ) : (
            <button 
              className="nav-btn-primary danger-delete-btn"
              onClick={() => onConfirmDelete(product.id)}
            >
              <Trash2 size={15} /> Xóa vĩnh viễn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
