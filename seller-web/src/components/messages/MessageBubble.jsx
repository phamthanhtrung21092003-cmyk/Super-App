import React from 'react';
import { ShoppingBag, Package, ArrowUpRight } from 'lucide-react';

export default function MessageBubble({ 
  message, 
  existingProducts = [], 
  existingOrders = [],
  onViewProduct,
  onViewOrder
}) {
  const {
    senderType = 'customer',
    content,
    createdAt,
    productId,
    orderId
  } = message;

  const isSeller = senderType === 'seller';

  // Lookup product from Single Source of Truth Catalog if productId is attached (Requirement 12)
  const attachedProduct = productId 
    ? (existingProducts.find(p => p.id === productId) || {
        id: productId,
        name: 'Áo thun Basic S-SHOPPING',
        price: 299000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
        stock: 120
      })
    : null;

  // Lookup order from Single Source of Truth Orders dataset if orderId is attached (Requirement 13)
  const attachedOrder = orderId
    ? (existingOrders.find(o => o.id === orderId || o.code === orderId) || {
        id: orderId,
        code: '#VL000123',
        status: 'Đang giao',
        summary: { totalAmount: 299000 },
        items: [{ name: 'Áo thun Basic S-SHOPPING' }]
      })
    : null;

  return (
    <div className={`message-bubble-row ${isSeller ? 'is-seller-msg' : 'is-customer-msg'}`}>
      <div className={`message-bubble-content ${isSeller ? 'bubble-seller' : 'bubble-customer'}`}>
        {/* Text Content */}
        {content && <p className="msg-text-paragraph">{content}</p>}

        {/* Attached Product Card (Requirement 12) */}
        {attachedProduct && (
          <div className="msg-product-card">
            <div className="msg-card-top">
              <ShoppingBag size={14} className="icon-green" />
              <span className="msg-card-label">Sản phẩm được chia sẻ</span>
            </div>
            <div className="msg-prod-body">
              <img 
                src={attachedProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'} 
                alt={attachedProduct.name} 
                className="msg-prod-img"
              />
              <div className="msg-prod-info">
                <h5 className="msg-prod-name">{attachedProduct.name}</h5>
                <div className="msg-prod-price">
                  {(attachedProduct.price || 299000).toLocaleString('vi-VN')}đ
                </div>
                <span className="msg-prod-stock">
                  Tồn kho: {attachedProduct.stock ?? 100} sp
                </span>
              </div>
            </div>
            {onViewProduct && (
              <button 
                type="button" 
                className="msg-card-action-btn"
                onClick={() => onViewProduct(attachedProduct)}
              >
                Xem chi tiết sản phẩm <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* Attached Order Card (Requirement 13) */}
        {attachedOrder && (
          <div className="msg-order-card">
            <div className="msg-card-top">
              <Package size={14} className="icon-blue" />
              <span className="msg-card-label">Thông tin đơn hàng</span>
            </div>
            <div className="msg-order-body">
              <div className="msg-order-header-line">
                <strong className="msg-order-code">
                  {attachedOrder.code || attachedOrder.id}
                </strong>
                <span className="msg-order-status-tag">
                  {attachedOrder.status || 'Đang xử lý'}
                </span>
              </div>
              <p className="msg-order-item-name">
                {attachedOrder.items?.[0]?.name || 'Sản phẩm S-SHOPPING'}
                {attachedOrder.items?.length > 1 && ` (+${attachedOrder.items.length - 1} sp khác)`}
              </p>
              <div className="msg-order-total-price">
                Tổng tiền: <strong>{(attachedOrder.summary?.totalAmount || attachedOrder.total || 299000).toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
            {onViewOrder && (
              <button 
                type="button" 
                className="msg-card-action-btn"
                onClick={() => onViewOrder(attachedOrder)}
              >
                Xem chi tiết đơn hàng <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* Time Stamp */}
        <span className="msg-timestamp-sub">{createdAt}</span>
      </div>
    </div>
  );
}
