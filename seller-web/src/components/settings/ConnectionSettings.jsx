import React from 'react';
import { Smartphone, Database, Truck, CreditCard, Video, Radio, Key } from 'lucide-react';

export default function ConnectionSettings() {
  const connections = [
    { name: 'V-life Super App Video Feed', desc: 'Đồng bộ xuất bản Video & Livestream', status: 'Đã kết nối', isConnected: true, icon: Smartphone, color: '#00B14F', bg: '#E6F4EA' },
    { name: 'V-life Open API Key', desc: 'Khóa API tích hợp phần mềm bán hàng POS', status: 'Đã kết nối', isConnected: true, icon: Key, color: '#1877F2', bg: '#EFF6FF' },
    { name: 'Hệ thống Quản lý Kho V-life WMS', desc: 'Tự động trừ tồn kho khi chốt đơn', status: 'Đã kết nối', isConnected: true, icon: Database, color: '#059669', bg: '#ECFDF5' },
    { name: 'Đối tác Vận chuyển (GHN, ViettelPost, J&T)', desc: 'Tự động tạo vận đơn & gọi tài xế lấy hàng', status: 'Đã kết nối', isConnected: true, icon: Truck, color: '#F97316', bg: '#FFF7ED' },
    { name: 'Cổng Thanh toán NAPAS / V-life Pay', desc: 'Xử lý thanh toán tự động & đối soát tiền ví', status: 'Đã kết nối', isConnected: true, icon: CreditCard, color: '#9333EA', bg: '#F3E8FF' }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Kết nối & Tích hợp API</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Trạng thái liên kết giữa Seller Center với các hệ sinh thái V-life Super App và đối tác
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {connections.map((c, idx) => {
          const IconComp = c.icon;
          return (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{c.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.desc}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="c-tag-pill" style={{ background: c.isConnected ? '#E6F4EA' : '#F1F5F9', color: c.isConnected ? '#00B14F' : '#64748B' }}>
                  {c.isConnected ? '🟢 Đã kết nối' : '⚪ Chưa kết nối'}
                </span>
                <button className="nav-btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => alert(`Cài đặt kết nối ${c.name}`)}>
                  Thiết lập
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
