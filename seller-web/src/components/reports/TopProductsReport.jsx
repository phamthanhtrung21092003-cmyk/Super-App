import React from 'react';

export default function TopProductsReport({ catalogProducts = [], onOpenProductDetail }) {
  const topProducts = [
    { rank: 1, id: 'p2', name: 'Áo thun nam Basic', code: 'P00123', revenue: 25450000, thumb: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200' },
    { rank: 2, id: 'p4', name: 'Quần jean slim fit', code: 'P00456', revenue: 18750000, thumb: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=200' },
    { rank: 3, id: 'p1', name: 'Giày sneaker A1', code: 'P00789', revenue: 15320000, thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
    { rank: 4, id: 'p5', name: 'Áo khoác nam bomber', code: 'P00234', revenue: 12860000, thumb: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200' },
    { rank: 5, id: 'p6', name: 'Túi đeo chéo nam', code: 'P00987', revenue: 9450000, thumb: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200' }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Top sản phẩm theo doanh thu</h3>
        <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Xem tất cả &gt;</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {topProducts.map(p => (
          <div 
            key={p.rank} 
            className="report-item-row clickable-card" 
            style={{ padding: '6px 8px' }}
            onClick={() => onOpenProductDetail && onOpenProductDetail(p)}
          >
            <span style={{ width: '20px', fontSize: '11px', fontWeight: '900', color: p.rank <= 3 ? '#00B14F' : 'var(--text-muted)' }}>
              #{p.rank}
            </span>

            <img src={p.thumb} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '6px' }}>
              <strong style={{ fontSize: '11px', color: 'var(--text-primary)' }} className="truncate-text">{p.name}</strong>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{p.code}</span>
            </div>

            <strong style={{ fontSize: '11px', color: '#00B14F' }}>
              {p.revenue.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
