import React from 'react';
import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function ProductRow({ 
  product, 
  isSelected, 
  onToggleSelect, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) {

  let statusBadgeClass = 'status-tag-green';
  if (product.status === 'Tạm ẩn') statusBadgeClass = 'status-tag-yellow';
  if (product.status === 'Hết hàng' || product.stock === 0) statusBadgeClass = 'status-tag-red';
  if (product.status === 'Bản nháp') statusBadgeClass = 'status-tag-blue';

  return (
    <tr className={`product-table-row ${isSelected ? 'row-selected' : ''}`}>
      {/* Checkbox */}
      <td className="col-checkbox">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
          className="row-checkbox"
        />
      </td>

      {/* Product Image & Name */}
      <td className="col-product-info">
        <div className="product-info-wrapper">
          <img src={product.image} alt={product.name} className="product-table-thumb" />
          <div className="product-name-block">
            <span className="product-title-name" title={product.name}>{product.name}</span>
            <span className="product-category-subtag">{product.category} • {product.variants || 'Mặc định'}</span>
          </div>
        </div>
      </td>

      {/* SKU */}
      <td className="col-sku">
        <span className="product-sku-code">{product.sku}</span>
      </td>

      {/* Price */}
      <td className="col-price">
        <div className="price-block">
          <span className="current-price">{Number(product.price).toLocaleString('vi-VN')}đ</span>
          {product.origPrice && product.origPrice > product.price && (
            <span className="original-price">{Number(product.origPrice).toLocaleString('vi-VN')}đ</span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="col-stock">
        <span className={`stock-count-text ${product.stock === 0 ? 'out-of-stock' : ''}`}>
          {product.stock}
        </span>
      </td>

      {/* Sold */}
      <td className="col-sold">
        <span className="sold-count-text">{product.sold || 0}</span>
      </td>

      {/* Status */}
      <td className="col-status">
        <span className={`product-status-badge ${statusBadgeClass}`}>
          {product.stock === 0 ? 'Hết hàng' : product.status}
        </span>
      </td>

      {/* Created At */}
      <td className="col-date">
        <span className="created-date-text">{product.createdAt || '12/08/2026'}</span>
      </td>

      {/* Actions */}
      <td className="col-actions">
        <div className="row-actions-group">
          <button 
            className="row-action-btn edit-btn"
            onClick={() => onEdit(product)}
            title="Chỉnh sửa sản phẩm"
          >
            <Edit2 size={15} />
          </button>

          <button 
            className="row-action-btn toggle-btn"
            onClick={() => onToggleStatus(product)}
            title={product.status === 'Đang bán' ? "Tạm ẩn sản phẩm" : "Hiện sản phẩm"}
          >
            {product.status === 'Đang bán' ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          <button 
            className="row-action-btn delete-btn"
            onClick={() => onDelete(product)}
            title="Xóa sản phẩm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
