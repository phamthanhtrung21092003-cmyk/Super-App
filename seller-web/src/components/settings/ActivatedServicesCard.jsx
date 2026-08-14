import React from 'react';
import { Package, ShoppingBag, Radio, Tag, Truck, CreditCard } from 'lucide-react';

export default function ActivatedServicesCard() {
  const services = [
    { name: 'Sản phẩm', status: 'Đã kích hoạt', icon: Package, color: '#00B14F', bg: '#E6F4EA' },
    { name: 'Đơn hàng', status: 'Đã kích hoạt', icon: ShoppingBag, color: '#1877F2', bg: '#EFF6FF' },
    { name: 'Livestream', status: 'Đã kích hoạt', icon: Radio, color: '#EF4444', bg: '#FEF2F2' },
    { name: 'Khuyến mãi', status: 'Đã kích hoạt', icon: Tag, color: '#F97316', bg: '#FFF7ED' },
    { name: 'Vận chuyển', status: 'Đã kích hoạt', icon: Truck, color: '#9333EA', bg: '#F3E8FF' },
    { name: 'Thanh toán', status: 'Đã kích hoạt', icon: CreditCard, color: '#0284C7', bg: '#E0F2FE' }
  ];

  return (
    <div className="finance-chart-card" style={{ marginTop: '20px' }}>
      <div className="card-header-row">
        <h3 className="card-heading-title">Dịch vụ đã kích hoạt</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginTop: '14px' }}>
        {services.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <div key={idx} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={18} />
              </div>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{s.name}</strong>
              <span style={{ fontSize: '10px', color: '#00B14F', fontWeight: '800' }}>🟢 {s.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
