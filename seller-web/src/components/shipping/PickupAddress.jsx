import React from 'react';
import { MapPin, Phone, User, Star, Plus, Edit2 } from 'lucide-react';

export default function PickupAddress({ addresses = [], onAddAddress, onSetDefault }) {
  const defaultAddresses = [
    {
      id: 'addr_1',
      name: 'Kho tổng S-SHOPPING Hà Nội',
      contactName: 'Nguyễn Văn A',
      phone: '0988 777 666',
      address: 'Số 123 Đường Nguyễn Văn Cừ, Phường Bồ Đề, Quận Long Biên, Hà Nội',
      isDefault: true
    },
    {
      id: 'addr_2',
      name: 'Kho miền Nam (TP.HCM)',
      contactName: 'Trần Thị B',
      phone: '0901 234 567',
      address: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
      isDefault: false
    }
  ];

  const list = addresses && addresses.length > 0 ? addresses : defaultAddresses;

  return (
    <div className="pickup-address-card">
      <div className="card-header-row">
        <div className="title-block">
          <h3 className="card-heading-title">Địa chỉ lấy hàng của Shop</h3>
          <span className="card-subtitle-info">Địa chỉ shipper ĐVVC sẽ đến lấy hàng khi phát sinh đơn mới</span>
        </div>
        <button className="nav-btn-primary add-addr-btn" onClick={onAddAddress}>
          <Plus size={14} /> + Thêm địa chỉ mới
        </button>
      </div>

      <div className="addresses-stack-list">
        {list.map(addr => (
          <div key={addr.id} className={`address-item-box ${addr.isDefault ? 'default' : ''}`}>
            <div className="addr-info-left">
              <div className="addr-title-row">
                <strong className="addr-name">{addr.name}</strong>
                {addr.isDefault && (
                  <span className="default-badge">
                    <Star size={11} fill="#00B14F" /> Địa chỉ mặc định
                  </span>
                )}
              </div>
              <p className="contact-text">
                <User size={12} /> {addr.contactName} • <Phone size={12} /> {addr.phone}
              </p>
              <p className="full-address-text">
                <MapPin size={12} /> {addr.address}
              </p>
            </div>

            <div className="addr-actions-right">
              {!addr.isDefault && (
                <button className="nav-btn-secondary set-def-btn" onClick={() => onSetDefault(addr.id)}>
                  Đặt làm mặc định
                </button>
              )}
              <button className="icon-action-btn" title="Chỉnh sửa địa chỉ">
                <Edit2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
