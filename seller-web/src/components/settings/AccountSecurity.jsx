import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

export default function AccountSecurity() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Tài khoản & Bảo mật</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Quản lý thông tin tài khoản chủ shop và các thiết lập an toàn bảo mật
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Info Box */}
        <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px' }}>Thông tin tài khoản</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tên người bán:</span>
              <strong style={{ display: 'block', marginTop: '2px' }}>Nguyễn Văn A</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mã định danh Seller ID:</span>
              <strong style={{ display: 'block', marginTop: '2px' }}>S001-VN</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email đăng nhập:</span>
              <strong style={{ display: 'block', marginTop: '2px' }}>shopabc@v-life.vn</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Số điện thoại xác thực:</span>
              <strong style={{ display: 'block', marginTop: '2px' }}>0912 *** 678</strong>
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Cài đặt bảo mật</h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <KeyRound size={20} style={{ color: '#F97316' }} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Mật khẩu đăng nhập</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đổi mật khẩu định kỳ để bảo vệ gian hàng của bạn</span>
              </div>
            </div>
            <button className="nav-btn-secondary" onClick={() => alert('Mở hộp thoại đổi mật khẩu tài khoản...')}>
              Đổi mật khẩu
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={20} style={{ color: '#00B14F' }} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Xác thực 2 bước (2FA OTP)</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gửi mã OTP về SMS hoặc ứng dụng Authenticator khi đăng nhập</span>
              </div>
            </div>
            <button 
              className={`action-small-btn ${twoFactorEnabled ? 'nav-btn-primary' : 'nav-btn-secondary'}`}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? '🟢 Đang bật 2FA' : '⚪ Đang tắt'}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>Thiết bị đang đăng nhập</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Laptop size={18} style={{ color: '#00B14F' }} />
                <div>
                  <strong style={{ fontSize: '12px' }}>Chrome trên Windows (Thiết bị hiện tại)</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>IP: 14.162.15.89 • TP. Hồ Chí Minh</span>
                </div>
              </div>
              <span style={{ fontSize: '10px', color: '#00B14F', fontWeight: '800' }}>Đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
