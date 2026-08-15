import React, { useState } from 'react';
import { ShoppingBag, Search, X, Check } from 'lucide-react';

export default function ProductPickerModal({
  existingProducts = [],
  onSelectProduct,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = existingProducts.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = p.name && p.name.toLowerCase().includes(q);
    const matchSku = p.sku && p.sku.toLowerCase().includes(q);
    const matchId = p.id && p.id.toLowerCase().includes(q);
    return matchName || matchSku || matchId;
  });

  return (
    <div className="picker-modal-backdrop" onClick={onClose}>
      <div className="picker-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="picker-header-bar">
          <div className="picker-title-wrap">
            <ShoppingBag size={18} className="icon-green" />
            <h3 className="picker-main-title">Chọn sản phẩm gửi cho khách hàng</h3>
          </div>
          <button type="button" className="picker-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="picker-search-bar">
          <Search size={15} className="picker-search-icon" />
          <input 
            type="text" 
            placeholder="Tìm theo tên sản phẩm, SKU hoặc Product ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="picker-search-input"
          />
        </div>

        {/* Product List from Catalog (Requirement 12) */}
        <div className="picker-items-scroll">
          {filtered.length > 0 ? (
            filtered.map(product => (
              <div key={product.id} className="picker-product-row">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150'} 
                  alt={product.name} 
                  className="picker-thumb-img"
                />
                <div className="picker-product-info">
                  <h5 className="picker-item-name">{product.name}</h5>
                  <div className="picker-item-meta">
                    <span className="picker-sku-tag">SKU: {product.sku || `SKU-${product.id}`}</span>
                    <span className="picker-stock-tag">Tồn: {product.stock ?? 100}</span>
                  </div>
                  <div className="picker-item-price">
                    {(product.price || 299000).toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-picker-send"
                  onClick={() => onSelectProduct(product.id)}
                >
                  <Check size={14} /> Gửi sản phẩm
                </button>
              </div>
            ))
          ) : (
            <div className="picker-empty-state">
              <ShoppingBag size={36} className="empty-icon" />
              <p>Không tìm thấy sản phẩm phù hợp trong Catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
