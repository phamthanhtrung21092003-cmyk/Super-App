import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function FeeSettings() {
  const fees = [
    { name: 'Phí cố định nền tảng (Platform Fee)', rate: '2.0%', desc: 'Áp dụng trên tổng giá trị đơn hàng thành công', status: 'Đang áp dụng' },
    { name: 'Phí thanh toán trực tuyến (Payment Gateway)', rate: '1.5%', desc: 'Áp dụng khi khách thanh toán qua Thẻ/QR/Ví', status: 'Đang áp dụng' },
    { name: 'Phí dịch vụ vận chuyển V-life Delivery', rate: 'Theo biểu phí ĐVVC', desc: 'Tự động tính theo khối lượng & khoảng cách', status: 'Đang áp dụng' },
    { name: 'Phí hoa hồng Video / Livestream', rate: 'Miễn phí (0%)', desc: 'Chính sách hỗ trợ Seller mới', status: 'Ưu đãi 0%' }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <div className="card-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-heading-title">Phí & Lệ phí sàn</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Biểu phí dịch vụ và chi phí vận hành áp dụng cho tài khoản người bán
          </p>
        </div>

        <button className="nav-btn-secondary" style={{ fontSize: '11px' }} onClick={() => alert('Mở trang chi tiết chính sách biểu phí S-SHOPPING...')}>
          <ExternalLink size={13} /> Xem chi tiết biểu phí
        </button>
      </div>

      <div className="tx-table-responsive" style={{ border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table className="tx-master-table">
          <thead>
            <tr>
              <th>Loại phí</th>
              <th>Mức phí áp dụng</th>
              <th>Ghi chú điều kiện</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f, idx) => (
              <tr key={idx}>
                <td><strong style={{ fontSize: '13px' }}>{f.name}</strong></td>
                <td><strong style={{ color: '#00B14F', fontSize: '13px' }}>{f.rate}</strong></td>
                <td><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</span></td>
                <td>
                  <span className="c-tag-pill" style={{ background: '#E6F4EA', color: '#00B14F' }}>
                    🟢 {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
