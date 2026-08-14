import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryPerformance() {
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { name: 'Thời trang nam', revenue: 68450000, share: '43.7%', orders: 562, sold: 1245, views: 36850, conversion: '2.41%', profit: 28450000 },
    { name: 'Giày dép', revenue: 32750000, share: '20.9%', orders: 245, sold: 376, views: 18650, conversion: '1.82%', profit: 13780000 },
    { name: 'Phụ kiện', revenue: 18350000, share: '11.7%', orders: 156, sold: 289, views: 9850, conversion: '1.58%', profit: 7250000 },
    { name: 'Thời trang nữ', revenue: 16980000, share: '10.8%', orders: 168, sold: 312, views: 10250, conversion: '1.64%', profit: 6780000 },
    { name: 'Khác', revenue: 20250000, share: '12.9%', orders: 117, sold: 198, views: 6850, conversion: '1.28%', profit: 6190000 }
  ];

  return (
    <div className="shipping-table-card" style={{ marginTop: '16px' }}>
      <div className="card-header-row" style={{ padding: '16px 20px 0' }}>
        <h3 className="card-heading-title">Hiệu quả theo danh mục</h3>
      </div>

      <div className="shipping-table-responsive-wrapper">
        <table className="shipping-master-table">
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Doanh thu</th>
              <th>Tỷ trọng</th>
              <th>Đơn hàng</th>
              <th>Sản phẩm đã bán</th>
              <th>Lượt xem</th>
              <th>Tỷ lệ chuyển đổi</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr key={idx}>
                <td><strong style={{ fontSize: '13px' }}>{cat.name}</strong></td>
                <td><strong style={{ color: '#00B14F', fontSize: '13px' }}>{cat.revenue.toLocaleString('vi-VN')} đ</strong></td>
                <td><span className="c-tag-pill" style={{ background: '#E6F4EA', color: '#00B14F' }}>{cat.share}</span></td>
                <td>{cat.orders}</td>
                <td>{cat.sold} sp</td>
                <td>{cat.views.toLocaleString('vi-VN')}</td>
                <td><strong style={{ color: '#1877F2' }}>{cat.conversion}</strong></td>
                <td><strong style={{ color: '#059669' }}>{cat.profit.toLocaleString('vi-VN')} đ</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shipping-pagination-bar">
        <div className="pagination-info-text">
          Hiển thị 1 - {categories.length} trong 5 danh mục
        </div>

        <div className="pagination-controls">
          <button className="pag-btn" disabled><ChevronLeft size={16} /></button>
          <button className="pag-number-btn active">1</button>
          <button className="pag-btn" disabled><ChevronRight size={16} /></button>
          <select className="page-size-select"><option>10 / trang</option></select>
        </div>
      </div>
    </div>
  );
}
