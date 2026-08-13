import React from 'react';
import { Calendar, User, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText } from 'lucide-react';

export default function InventoryTransactions({ transactions = [] }) {
  const defaultList = [
    {
      id: 'tx_101',
      time: '13/08/2026 09:30',
      productName: 'Áo thun nam basic',
      sku: 'ATB-BLK-M',
      type: 'Giữ hàng',
      typeCode: 'RESERVE',
      qty: -2,
      before: 130,
      after: 128,
      reason: 'Đơn hàng #VL000128',
      user: 'Hệ thống S-Shopping'
    },
    {
      id: 'tx_102',
      time: '12/08/2026 14:00',
      productName: 'Áo thun nam basic',
      sku: 'ATB-BLK-M',
      type: 'Nhập kho',
      typeCode: 'RECEIVE',
      qty: +50,
      before: 80,
      after: 130,
      reason: 'Nhập hàng từ NCC',
      user: 'Quản lý Kho'
    },
    {
      id: 'tx_103',
      time: '11/08/2026 16:20',
      productName: 'Giày Sneaker Unisex Sport',
      sku: 'GS-WHT-42',
      type: 'Điều chỉnh',
      typeCode: 'ADJUST',
      qty: -3,
      before: 45,
      after: 42,
      reason: 'Kiểm kê hư hỏng',
      user: 'Thủ kho'
    },
    {
      id: 'tx_104',
      time: '10/08/2026 10:15',
      productName: 'Sạc dự phòng 20000mAh',
      sku: 'SDP-20K-BLK',
      type: 'Xuất kho',
      typeCode: 'ISSUE',
      qty: -1,
      before: 15,
      after: 14,
      reason: 'Xuất bán đơn #SP250810-01',
      user: 'Shipper GHN'
    },
    {
      id: 'tx_105',
      time: '09/08/2026 15:45',
      productName: 'Áo sơ mi lụa nữ',
      sku: 'ASM-WHT-S',
      type: 'Hoàn hàng',
      typeCode: 'RETURN',
      qty: +1,
      before: 12,
      after: 13,
      reason: 'Khách hoàn trả đơn #VL000115',
      user: 'Hệ thống'
    }
  ];

  const activeList = transactions && transactions.length > 0 ? transactions : defaultList;

  return (
    <div className="inventory-transactions-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Lịch sử biến động kho hàng</h3>
        <span className="card-subtitle-info">Hiển thị {activeList.length} nhật ký biến động gần nhất</span>
      </div>

      <div className="tx-table-responsive">
        <table className="tx-master-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Loại biến động</th>
              <th style={{ textAlign: 'center' }}>Số lượng</th>
              <th>Tồn trước</th>
              <th>Tồn sau</th>
              <th>Lý do / Tham chiếu</th>
              <th>Người thực hiện</th>
            </tr>
          </thead>

          <tbody>
            {activeList.map(tx => {
              let badgeBg = '#E6F4EA';
              let badgeColor = '#00B14F';

              if (tx.qty < 0) {
                badgeBg = '#FEF2F2';
                badgeColor = '#EF4444';
              }
              if (tx.typeCode === 'RESERVE') {
                badgeBg = '#FFF7ED';
                badgeColor = '#F97316';
              }
              if (tx.typeCode === 'ADJUST') {
                badgeBg = '#EFF6FF';
                badgeColor = '#1877F2';
              }

              return (
                <tr key={tx.id}>
                  <td>
                    <span className="tx-time-cell">
                      <Calendar size={12} /> {tx.time}
                    </span>
                  </td>
                  <td>
                    <strong className="tx-product-name">{tx.productName}</strong>
                  </td>
                  <td>
                    <code>{tx.sku}</code>
                  </td>
                  <td>
                    <span className="tx-type-pill" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: badgeColor, fontSize: '14px' }}>
                      {tx.qty > 0 ? `+${tx.qty}` : tx.qty}
                    </strong>
                  </td>
                  <td>{tx.before}</td>
                  <td><strong>{tx.after}</strong></td>
                  <td>{tx.reason}</td>
                  <td>
                    <span className="tx-user-text">
                      <User size={11} /> {tx.user}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
