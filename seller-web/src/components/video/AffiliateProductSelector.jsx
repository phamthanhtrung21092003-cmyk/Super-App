import React, { useState } from 'react';
import { Search, Percent, Star, Plus, Check } from 'lucide-react';

export default function AffiliateProductSelector({ selectedAffiliateIds = [], onToggleSelect }) {
  const [search, setSearch] = useState('');

  const affiliateCatalog = [
    { id: 'P0098', name: 'Bàn phím Gaming Mechanical XYZ', shop: 'GearShop Official (S009)', price: 799000, commissionRate: 5, estCommission: 39950, sold: 1250, rating: 4.9 },
    { id: 'P0099', name: 'Tai nghe Bluetooth Noise Cancelling', shop: 'AudioWorld Vietnam (S012)', price: 1250000, commissionRate: 8, estCommission: 100000, sold: 890, rating: 4.8 },
    { id: 'P0100', name: 'Chuột không dây Ergonomic Ultra', shop: 'TechZone Store (S015)', price: 350000, commissionRate: 6, estCommission: 21000, sold: 3400, rating: 4.7 }
  ];

  const filtered = affiliateCatalog.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.shop.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Đã gắn: <strong style={{ color: '#EC4899' }}>{selectedAffiliateIds.length}</strong> sản phẩm Affiliate
        </span>

        <div className="search-input-wrapper" style={{ width: '240px' }}>
          <Search size={14} className="search-icon" />
          <input 
            type="text"
            className="search-control-input"
            placeholder="Tìm sản phẩm Affiliate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tx-table-responsive" style={{ maxHeight: '240px', border: '1px solid var(--border)', borderRadius: '10px' }}>
        <table className="tx-master-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>Gắn</th>
              <th>Sản phẩm Shop khác (Affiliate)</th>
              <th>Giá bán</th>
              <th>Tỷ lệ Hoa hồng</th>
              <th>Thu nhập / Đơn</th>
              <th>Đã bán</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prod => {
              const isSel = selectedAffiliateIds.includes(prod.id);
              return (
                <tr key={prod.id} className={isSel ? 'selected-row' : ''}>
                  <td>
                    <button 
                      type="button" 
                      className={`action-small-btn ${isSel ? 'nav-btn-primary' : 'nav-btn-secondary'}`}
                      onClick={() => onToggleSelect(prod.id)}
                      style={{ padding: '2px 8px', fontSize: '10px' }}
                    >
                      {isSel ? '✓ Đã gắn' : '+ Gắn'}
                    </button>
                  </td>
                  <td>
                    <strong className="tx-product-name">{prod.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{prod.shop} • ID: {prod.id}</span>
                  </td>
                  <td><strong>{prod.price.toLocaleString('vi-VN')} đ</strong></td>
                  <td><span className="c-tag-pill" style={{ background: '#FCE7F3', color: '#EC4899' }}>{prod.commissionRate}% Hoa hồng</span></td>
                  <td><strong style={{ color: '#00B14F' }}>+{prod.estCommission.toLocaleString('vi-VN')} đ</strong></td>
                  <td><span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{prod.sold} đã bán</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
