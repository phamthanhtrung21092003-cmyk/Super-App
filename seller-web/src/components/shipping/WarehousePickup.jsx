import React from 'react';
import { Warehouse, CheckCircle2, Truck } from 'lucide-react';

export default function WarehousePickup({ warehouses = [], onManageWarehouses }) {
  const defaultWarehouses = [
    {
      id: 'wh_hn',
      name: 'Kho chính Hà Nội',
      code: 'WH-HN-01',
      address: 'Số 123 Đường Nguyễn Văn Cừ, Long Biên, Hà Nội',
      status: '🟢 Đang hoạt động',
      carriers: ['V-life Delivery', 'GHN', 'Viettel Post']
    },
    {
      id: 'wh_hcm',
      name: 'Kho Tân Bình TP.HCM',
      code: 'WH-HCM-02',
      address: '456 Trường Chinh, Q. Tân Bình, TP. Hồ Chí Minh',
      status: '🟢 Đang hoạt động',
      carriers: ['V-life Delivery', 'J&T Express']
    }
  ];

  const list = warehouses && warehouses.length > 0 ? warehouses : defaultWarehouses;

  return (
    <div className="warehouse-pickup-card">
      <div className="card-header-row">
        <div className="title-block">
          <h3 className="card-heading-title">Kho / Điểm lấy hàng của Seller</h3>
          <span className="card-subtitle-info">Địa điểm kho vật lý lưu trữ sản phẩm chờ shipper đến lấy</span>
        </div>
        <button className="nav-btn-secondary manage-wh-btn" onClick={onManageWarehouses}>
          <Warehouse size={14} /> Quản lý kho
        </button>
      </div>

      <div className="warehouses-grid-layout">
        {list.map(wh => (
          <div key={wh.id} className="wh-item-card">
            <div className="wh-card-top">
              <div className="wh-icon-box">
                <Warehouse size={20} />
              </div>
              <span className="wh-status-badge">{wh.status}</span>
            </div>

            <h4 className="wh-name-title">{wh.name} ({wh.code})</h4>
            <p className="wh-address-text">{wh.address}</p>

            <div className="wh-carriers-list">
              <span className="lbl"><Truck size={12} /> ĐVVC hỗ trợ:</span>
              <div className="carrier-tags-row">
                {wh.carriers.map((c, idx) => (
                  <span key={idx} className="c-tag-pill">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
