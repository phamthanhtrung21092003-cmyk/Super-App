import React from 'react';
import { 
  Rocket, CheckCircle2, Circle, Plus, 
  Truck, CreditCard, ChevronRight, Sparkles, Store
} from 'lucide-react';

export default function OnboardingChecklist({ 
  setupData = null,
  onOpenAddProductModal, 
  onNavigateTab 
}) {
  const completedCount = setupData?.completedCount ?? 4;
  const totalCount = setupData?.totalCount ?? 7;
  const progressPercent = setupData?.progressPercent ?? Math.round((completedCount / totalCount) * 100);

  const defaultSteps = [
    { id: 1, title: 'Thông tin Shop', completed: true },
    { id: 2, title: 'Xác minh người bán', completed: true },
    { id: 3, title: 'Địa chỉ lấy hàng', completed: true },
    { id: 4, title: 'Tài khoản nhận tiền', completed: true },
    { 
      id: 5, 
      title: 'Thiết lập vận chuyển', 
      completed: false,
      actionText: 'Thiết lập',
      onClick: () => onNavigateTab('shop_setup') 
    },
    { 
      id: 6, 
      title: 'Đăng sản phẩm đầu tiên', 
      completed: false, 
      isPrimary: true,
      actionText: '+ Đăng sản phẩm',
      onClick: onOpenAddProductModal 
    },
    { 
      id: 7, 
      title: 'Kiểm tra & hoàn tất Shop', 
      completed: false,
      actionText: 'Hoàn tất Shop',
      onClick: () => onNavigateTab('shop_setup') 
    }
  ];

  const stepsToRender = setupData?.steps 
    ? setupData.steps.map(s => ({
        id: s.id,
        title: s.title,
        completed: s.status === 'COMPLETED',
        isPrimary: s.key === 'firstProduct',
        actionText: s.actionText,
        onClick: s.key === 'firstProduct' ? onOpenAddProductModal : () => onNavigateTab('shop_setup')
      }))
    : defaultSteps;

  return (
    <div className="dashboard-card onboarding-card-highlight">
      {/* Onboarding Header */}
      <div className="onboarding-header-row">
        <div 
          className="onboarding-title-group cursor-pointer"
          onClick={() => onNavigateTab('shop_setup')}
          title="Nhấp để mở trang Hoàn thiện Shop đầy đủ"
          role="button"
          tabIndex={0}
        >
          <div className="rocket-icon-circle">
            <Rocket size={22} className="rocket-icon" />
          </div>
          <div>
            <div className="onboarding-heading-with-btn">
              <h2 className="onboarding-main-heading">🚀 Hoàn thiện thiết lập Shop</h2>
              <span className="view-full-setup-link">
                Chi tiết 7 bước <ChevronRight size={14} />
              </span>
            </div>
            <p className="onboarding-sub-heading">
              Hoàn thành các bước bên dưới để kích hoạt gian hàng và bắt đầu bán hàng trên S-Shopping V-life.
            </p>
          </div>
        </div>

        {/* Progress Bar Badge */}
        <div 
          className="onboarding-progress-container cursor-pointer"
          onClick={() => onNavigateTab('shop_setup')}
          title="Nhấp để mở trang Hoàn thiện Shop"
        >
          <div className="progress-text-label">
            <span>Tiến độ hoàn tất:</span>
            <strong>{completedCount}/{totalCount} bước</strong>
          </div>
          <div className="progress-track-bg">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-percent-sub">{progressPercent}% hoàn thành</span>
        </div>
      </div>

      {/* Main Checklist Items */}
      <div className="checklist-items-grid">
        {stepsToRender.map(step => (
          <div 
            key={step.id} 
            className={`checklist-item-row ${step.completed ? 'completed' : 'pending'} ${step.isPrimary ? 'primary-focus' : ''}`}
          >
            <div className="checklist-item-left">
              {step.completed ? (
                <CheckCircle2 size={18} className="check-icon-success" />
              ) : (
                <Circle size={18} className="circle-icon-pending" />
              )}
              <span className="step-title-text">{step.title}</span>
            </div>

            {!step.completed && step.actionText && (
              <button 
                type="button"
                className={`step-action-btn ${step.isPrimary ? 'primary-cta' : 'secondary-cta'}`}
                onClick={step.onClick}
              >
                {step.actionText}
              </button>
            )}

            {step.completed && (
              <span className="step-done-badge">✓ Xong</span>
            )}
          </div>
        ))}
      </div>

      {/* Big Action CTA Banner */}
      <div className="onboarding-cta-banner">
        <div className="cta-left-text">
          <Sparkles size={18} color="var(--primary)" />
          <span><strong>Hoàn tất thiết lập nhanh:</strong> Mở giao diện 7 bước để hoàn thiện toàn bộ thông tin Shop!</span>
        </div>
        <div className="cta-buttons-group">
          <button 
            type="button"
            className="nav-btn-primary big-add-prod-btn"
            onClick={() => onNavigateTab('shop_setup')}
          >
            <Store size={17} /> Mở trang Hoàn Thiện Shop
          </button>
          <button 
            type="button"
            className="nav-btn-secondary"
            onClick={onOpenAddProductModal}
          >
            <Plus size={16} /> + Đăng sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
