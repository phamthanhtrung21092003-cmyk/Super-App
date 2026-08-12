import React from 'react';
import { 
  Rocket, CheckCircle2, Circle, Plus, 
  Truck, CreditCard 
} from 'lucide-react';

export default function OnboardingChecklist({ 
  onOpenAddProductModal, 
  onNavigateTab 
}) {
  const steps = [
    { id: 1, title: 'Tạo cửa hàng', completed: true },
    { id: 2, title: 'Hoàn tất thông tin người bán', completed: true },
    { id: 3, title: 'Thêm địa chỉ lấy hàng', completed: true },
    { id: 4, title: 'Thiết lập phương thức nhận tiền', completed: true },
    { 
      id: 5, 
      title: 'Đăng sản phẩm đầu tiên', 
      completed: false, 
      isPrimary: true,
      actionText: '+ Đăng sản phẩm',
      onClick: onOpenAddProductModal 
    },
    { 
      id: 6, 
      title: 'Thiết lập vận chuyển & giao hàng', 
      completed: false,
      actionText: 'Thiết lập',
      onClick: () => onNavigateTab('shipping') 
    },
    { 
      id: 7, 
      title: 'Đăng Video giới thiệu sản phẩm', 
      completed: false,
      actionText: 'Đăng Video',
      onClick: () => onNavigateTab('video') 
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="dashboard-card onboarding-card-highlight">
      {/* Onboarding Header */}
      <div className="onboarding-header-row">
        <div className="onboarding-title-group">
          <div className="rocket-icon-circle">
            <Rocket size={22} className="rocket-icon" />
          </div>
          <div>
            <h2 className="onboarding-main-heading">🚀 Bắt đầu bán hàng trên S-Shopping</h2>
            <p className="onboarding-sub-heading">
              Hoàn thành các bước đơn giản dưới đây để bắt đầu đăng bán sản phẩm và nhận đơn hàng đầu tiên.
            </p>
          </div>
        </div>

        {/* Progress Bar Badge */}
        <div className="onboarding-progress-container">
          <div className="progress-text-label">
            <span>Tiến độ hoàn tất:</span>
            <strong>{completedCount}/{steps.length} bước</strong>
          </div>
          <div className="progress-track-bg">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Checklist Items */}
      <div className="checklist-items-grid">
        {steps.map(step => (
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
                className={`step-action-btn ${step.isPrimary ? 'primary-cta' : 'secondary-cta'}`}
                onClick={step.onClick}
              >
                {step.actionText}
              </button>
            )}

            {step.completed && (
              <span className="step-done-badge">Hoàn thành</span>
            )}
          </div>
        ))}
      </div>

      {/* Big Action CTA Banner */}
      <div className="onboarding-cta-banner">
        <div className="cta-left-text">
          <strong>Sẵn sàng kinh doanh?</strong> Đăng sản phẩm đầu tiên chỉ trong 2 phút!
        </div>
        <div className="cta-buttons-group">
          <button 
            className="nav-btn-primary big-add-prod-btn"
            onClick={onOpenAddProductModal}
          >
            <Plus size={18} /> Đăng sản phẩm đầu tiên
          </button>
          <button 
            className="nav-btn-secondary"
            onClick={() => onNavigateTab('shipping')}
          >
            <Truck size={16} /> Cấu hình vận chuyển
          </button>
          <button 
            className="nav-btn-secondary"
            onClick={() => onNavigateTab('finance')}
          >
            <CreditCard size={16} /> Tài khoản nhận tiền
          </button>
        </div>
      </div>
    </div>
  );
}
