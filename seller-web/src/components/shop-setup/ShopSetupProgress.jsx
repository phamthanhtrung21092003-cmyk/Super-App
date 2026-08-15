import React from 'react';
import { Rocket, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ShopSetupProgress({ 
  completedCount = 4, 
  totalCount = 7, 
  progressPercent = 57, 
  isNewShop = false,
  onBackToDashboard 
}) {
  const remainingCount = totalCount - completedCount;

  return (
    <div className="shop-setup-header-banner">
      {/* Top breadcrumb / Back button */}
      <div className="setup-top-back-row">
        <button 
          type="button" 
          className="nav-btn-secondary back-to-dash-btn"
          onClick={onBackToDashboard}
        >
          <ArrowLeft size={16} /> Quay lại Trang chủ Seller Center
        </button>

        {completedCount === totalCount ? (
          <span className="shop-readiness-tag is-ready">
            <CheckCircle2 size={13} /> Shop Đã Sẵn Sàng Hoạt Động
          </span>
        ) : (
          <span className="shop-readiness-tag in-progress">
            🟢 Đang Thiết Lập Onboarding ({completedCount}/{totalCount})
          </span>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="setup-title-grid">
        <div className="setup-title-left">
          <div className="setup-rocket-icon-box">
            <Rocket size={26} />
          </div>
          <div>
            <h1 className="setup-main-title">
              {isNewShop && completedCount === 0 ? 'Chào mừng đến với S-SHOPPING' : 'Hoàn thiện Shop của bạn'}
            </h1>
            <p className="setup-sub-title">
              {isNewShop && completedCount === 0 
                ? 'Bạn đã đăng ký tài khoản thành công. Hãy hoàn thành các bước bên dưới để kích hoạt gian hàng và bắt đầu bán hàng.'
                : 'Hoàn thành các bước bên dưới để Shop sẵn sàng hoạt động và tiếp cận khách hàng trên V-life.'}
            </p>
          </div>
        </div>

        {/* Progress Bar Badge on Desktop */}
        <div className="setup-progress-box">
          <div className="progress-label-row">
            <span className="progress-title-text">Tiến độ thiết lập</span>
            <strong className="progress-number-text">{completedCount}/{totalCount} bước hoàn thành</strong>
          </div>

          <div className="progress-track-bar">
            <div 
              className="progress-fill-gradient" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="progress-hint-row">
            {completedCount === totalCount ? (
              <span className="hint-success">🎉 Xin chúc mừng! Bạn đã hoàn tất tất cả 7 bước.</span>
            ) : (
              <span className="hint-pending">
                <Sparkles size={13} /> Còn thiếu <strong>{remainingCount} bước</strong> nữa để hoàn tất kích hoạt.
              </span>
            )}
            <span className="percent-text">{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
