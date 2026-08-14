import React from 'react';

export default function ActivityLogs() {
  const logs = [
    { time: '13:30 - 14/08/2026', action: 'Đăng nhập Seller Center', device: 'Chrome / Windows 11', ip: '14.162.15.89', status: 'Thành công' },
    { time: '13:25 - 14/08/2026', action: 'Cập nhật thông tin Shop', device: 'Chrome / Windows 11', ip: '14.162.15.89', status: 'Thành công' },
    { time: '11:45 - 14/08/2026', action: 'Tạo buổi Livestream #LIVE006', device: 'Chrome / Windows 11', ip: '14.162.15.89', status: 'Thành công' },
    { time: '09:15 - 14/08/2026', action: 'Xác nhận đơn hàng #VL000128', device: 'Chrome / Windows 11', ip: '14.162.15.89', status: 'Thành công' },
    { time: '18:20 - 13/08/2026', action: 'Đổi mật khẩu tài khoản', device: 'Safari / iPhone 15', ip: '113.190.22.14', status: 'Thành công' }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Nhật ký hoạt động</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Lịch sử đăng nhập và các thao tác quan trọng trên tài khoản người bán
      </p>

      <div className="tx-table-responsive" style={{ border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table className="tx-master-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Thiết bị & IP</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, idx) => (
              <tr key={idx}>
                <td><span className="tx-time-cell">{l.time}</span></td>
                <td><strong style={{ fontSize: '13px' }}>{l.action}</strong></td>
                <td><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l.device} • {l.ip}</span></td>
                <td>
                  <span className="c-tag-pill" style={{ background: '#E6F4EA', color: '#00B14F' }}>
                    🟢 {l.status}
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
