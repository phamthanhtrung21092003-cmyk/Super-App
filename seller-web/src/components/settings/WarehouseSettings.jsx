import React from 'react';
import { MapPin, Plus, Edit3, Trash2 } from 'lucide-react';

export default function WarehouseSettings() {
  const warehouses = [
    {
      id: 'wh_1',
      name: 'Kho HCM - Tổng kho Miền Nam',
      address: '123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh',
      contact: 'Nguyễn Văn A',
      phone: '0912 345 678',
      isDefault: true,
      type: 'Kho lấy hàng & Kho trả hàng'
    },
    {
      id: 'wh_2',
      name: 'Kho Hà Nội - Chi nhánh Cầu Giấy',
      address: '456 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội',
      contact: 'Trần Văn B',
      phone: '0988 123 456',
      isDefault: false,
      type: 'Kho lấy hàng'
    }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <div className="card-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-heading-title">Địa chỉ kho hàng</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Quản lý địa chỉ kho lấy hàng và địa chỉ nhận hàng hoàn/trả
          </p>
        </div>

        <button className="nav-btn-primary" onClick={() => alert('Mở form thêm địa chỉ kho mới...')}>
          <Plus size={15} /> Thêm địa chỉ kho
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {warehouses.map(wh => (
          <div key={wh.id} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F4EA', color: '#00B14F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '14px' }}>{wh.name}</strong>
                  {wh.isDefault && (
                    <span className="c-tag-pill" style={{ background: '#E6F4EA', color: '#00B14F' }}>Mặc định</span>
                  )}
                  <span className="c-tag-pill" style={{ background: '#EFF6FF', color: '#1877F2' }}>{wh.type}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>{wh.address}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Người liên hệ: {wh.contact} • SĐT: {wh.phone}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="action-icon-btn" onClick={() => alert(`Chỉnh sửa ${wh.name}`)}>
                <Edit3 size={13} />
              </button>
              <button className="action-icon-btn" onClick={() => alert(`Xóa ${wh.name}`)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
