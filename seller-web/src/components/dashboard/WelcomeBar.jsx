import React from 'react';

export default function WelcomeBar({ shopInfo }) {
  const ownerName = shopInfo?.ownerName || shopInfo?.fullName || 'Nguyễn Văn A';

  return (
    <div className="dashboard-welcome-row">
      <div className="welcome-text-group">
        <h1 className="welcome-heading">
          Xin chào, {ownerName} <span className="wave-hand">👋</span>
        </h1>
        <p className="welcome-subtext">
          Chào mừng bạn quay lại S-Shopping Seller Center
        </p>
      </div>

      <div className="shop-status-badge-card">
        <div className="status-indicator">
          <span className="status-dot-pulse"></span>
          <span className="status-title-text" style={{ color: '#00B14F', fontWeight: '700' }}>🟢 Shop đang hoạt động</span>
        </div>
        <span className="status-timestamp-text">
          Cập nhật lúc: 09:30 • 12/08/2026
        </span>
      </div>
    </div>
  );
}
