import React from 'react';
import { Sparkles, Store } from 'lucide-react';

export default function WelcomeBar({ shopInfo, shopMode = 'DEMO', onToggleShopMode }) {
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
          <span className="status-title-text" style={{ color: '#00B14F', fontWeight: '700' }}>
            🟢 Shop đang hoạt động
          </span>
        </div>

        {/* Shop Mode Selector (Requirement 8 & 9: NEW_SHOP vs DEMO) */}
        {onToggleShopMode && (
          <button 
            type="button" 
            className={`shop-mode-toggle-pill ${shopMode === 'DEMO' ? 'is-demo' : 'is-new-shop'}`}
            onClick={onToggleShopMode}
            title={shopMode === 'DEMO' ? "Nhấp để chuyển sang trạng thái Shop mới (Trống)" : "Nhấp để chuyển sang chế độ Demo (Dữ liệu mẫu)"}
          >
            {shopMode === 'DEMO' ? (
              <>
                <Sparkles size={13} />
                <span>Chế độ: <strong>Dữ liệu DEMO</strong></span>
              </>
            ) : (
              <>
                <Store size={13} />
                <span>Chế độ: <strong>Shop Mới</strong></span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
