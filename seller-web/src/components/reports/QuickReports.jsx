import React from 'react';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function QuickReports({ onSelectTab }) {
  const reports = [
    { id: 'revenue', title: 'Báo cáo doanh thu', desc: 'Phân tích doanh thu theo thời gian', icon: DollarSign, color: '#1877F2', bg: '#EFF6FF' },
    { id: 'orders', title: 'Báo cáo đơn hàng', desc: 'Phân tích đơn hàng và trạng thái', icon: ShoppingBag, color: '#00B14F', bg: '#E6F4EA' },
    { id: 'products', title: 'Báo cáo sản phẩm', desc: 'Hiệu quả bán hàng theo sản phẩm', icon: Package, color: '#F97316', bg: '#FFF7ED' },
    { id: 'customers', title: 'Báo cáo khách hàng', desc: 'Phân tích hành vi khách hàng', icon: Users, color: '#9333EA', bg: '#F3E8FF' }
  ];

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Báo cáo nhanh</h3>
        <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Xem tất cả &gt;</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {reports.map(r => {
          const IconComp = r.icon;
          return (
            <div 
              key={r.id} 
              className="report-item-row clickable-card" 
              style={{ padding: '8px 10px' }}
              onClick={() => onSelectTab(r.id)}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconComp size={16} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{r.title}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
