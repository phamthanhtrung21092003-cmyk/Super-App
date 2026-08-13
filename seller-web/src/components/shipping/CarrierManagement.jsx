import React from 'react';
import { Truck, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';

export default function CarrierManagement({ carriers = [], onToggleCarrier }) {
  const defaultCarriers = [
    {
      id: 'v-life-delivery',
      name: 'V-life Delivery',
      active: true,
      time: '1 - 2 ngày',
      fee: '20.000đ',
      desc: 'Dịch vụ giao vận độc quyền hệ sinh thái V-life'
    },
    {
      id: 'ghn',
      name: 'Giao Hàng Nhanh (GHN)',
      active: true,
      time: '2 - 3 ngày',
      fee: '22.000đ',
      desc: 'Mạng lưới phủ sóng 63 tỉnh thành'
    },
    {
      id: 'viettel-post',
      name: 'Viettel Post',
      active: true,
      time: '2 - 4 ngày',
      fee: '25.000đ',
      desc: 'Tối ưu tuyến đường liên tỉnh & hải đảo'
    },
    {
      id: 'jt-express',
      name: 'J&T Express',
      active: false,
      time: '2 - 3 ngày',
      fee: '22.000đ',
      desc: 'Dịch vụ vận chuyển Express chuẩn hóa'
    }
  ];

  const activeCarriers = carriers && carriers.length > 0 ? carriers : defaultCarriers;

  return (
    <div className="carrier-management-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Quản lý Đơn vị Vận chuyển</h3>
        <span className="card-subtitle-info">Bật/Tắt đối tác giao hàng phục vụ cho gian hàng</span>
      </div>

      <div className="carriers-grid-layout">
        {activeCarriers.map(carrier => (
          <div key={carrier.id} className={`carrier-card-item ${carrier.active ? 'active' : 'disabled'}`}>
            <div className="carrier-card-top">
              <div className="carrier-logo-box">
                <Truck size={22} />
              </div>
              <div className="carrier-status-toggle">
                <span className={`status-pill ${carrier.active ? 'active' : 'inactive'}`}>
                  {carrier.active ? '🟢 Đang hoạt động' : '⚪ Chưa kích hoạt'}
                </span>
                <label className="switch-toggle-label">
                  <input 
                    type="checkbox" 
                    checked={carrier.active}
                    onChange={() => onToggleCarrier(carrier.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <h4 className="carrier-name-title">{carrier.name}</h4>
            <p className="carrier-desc-text">{carrier.desc}</p>

            <div className="carrier-meta-footer">
              <span className="meta-tag"><Clock size={12} /> {carrier.time}</span>
              <span className="meta-tag"><DollarSign size={12} /> Từ {carrier.fee}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
