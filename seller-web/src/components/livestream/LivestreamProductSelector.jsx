import React, { useState } from 'react';
import { Search, Tag, Check, X } from 'lucide-react';

export default function LivestreamProductSelector({ catalogProducts = [], selectedIds = [], onToggleSelect }) {
  const [search, setSearch] = useState('');

  const defaultCatalog = catalogProducts && catalogProducts.length > 0 ? catalogProducts : [
    { id: 'p1', name: 'Giày Sneaker Unisex Sport', sku: 'GS-WHT-42', price: 450000, stock: 45 },
    { id: 'p2', name: 'Áo thun nam basic', sku: 'ATB-BLK-M', price: 150000, stock: 128 },
    { id: 'p3', name: 'Sạc dự phòng 20000mAh', sku: 'SDP-20K-BLK', price: 550000, stock: 14 }
  ];

  const filtered = defaultCatalog.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || p.id.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Đã chọn: <strong className="green-text">{selectedIds.length}</strong> sản phẩm bán trong Livestream
        </span>

        <div className="search-input-wrapper" style={{ width: '220px' }}>
          <Search size={14} className="search-icon" />
          <input 
            type="text"
            className="search-control-input"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tx-table-responsive" style={{ maxHeight: '240px', border: '1px solid var(--border)', borderRadius: '10px' }}>
        <table className="tx-master-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>Chọn</th>
              <th>Sản phẩm thuộc Shop</th>
              <th>SKU</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prod => {
              const isSel = selectedIds.includes(prod.id);
              return (
                <tr key={prod.id} className={isSel ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={isSel} 
                      onChange={() => onToggleSelect(prod.id)} 
                      className="stylish-checkbox"
                    />
                  </td>
                  <td>
                    <strong className="tx-product-name">{prod.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ID: {prod.id}</span>
                  </td>
                  <td><code>{prod.sku || 'SKU-001'}</code></td>
                  <td><strong>{(prod.price || 150000).toLocaleString('vi-VN')} đ</strong></td>
                  <td><span className="wh-status-badge">{prod.stock || prod.physicalStock || 50} sp</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
