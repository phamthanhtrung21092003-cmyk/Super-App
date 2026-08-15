import React from 'react';
import { 
  Store, ShieldCheck, MapPin, CreditCard, 
  Truck, Package, CheckCircle2, Lock, 
  Circle, AlertTriangle, ArrowRight, Edit3, Plus,
  Sparkles, Check
} from 'lucide-react';

export default function ShopSetupStepCard({ 
  step, 
  onActionClick, 
  onToggleCarrier, 
  missingStepsCount = 0,
  onOpenAddProduct 
}) {
  const getStepIcon = (key) => {
    switch (key) {
      case 'shopInfo': return Store;
      case 'verification': return ShieldCheck;
      case 'pickupAddress': return MapPin;
      case 'payoutAccount': return CreditCard;
      case 'shipping': return Truck;
      case 'firstProduct': return Package;
      case 'finalReview': return CheckCircle2;
      default: return Store;
    }
  };

  const StepIcon = getStepIcon(step.key);

  // Render Status Badge with Text & Icon (Requirement 5)
  const renderStatusBadge = () => {
    if (step.status === 'COMPLETED') {
      return (
        <span className="step-status-badge status-completed">
          <CheckCircle2 size={14} /> ✓ Đã hoàn thành
        </span>
      );
    }
    if (step.status === 'READY') {
      return (
        <span className="step-status-badge status-ready">
          <Sparkles size={14} /> 🟢 Sẵn sàng hoàn tất
        </span>
      );
    }
    if (step.status === 'LOCKED') {
      return (
        <span className="step-status-badge status-locked">
          <Lock size={14} /> 🔒 Chưa thể thực hiện
        </span>
      );
    }
    if (step.key === 'verification' && step.status !== 'COMPLETED') {
      return (
        <span className="step-status-badge status-warning">
          <AlertTriangle size={14} /> ⚠ Chưa hoàn thành
        </span>
      );
    }
    return (
      <span className="step-status-badge status-pending">
        <Circle size={14} /> ○ Chưa hoàn thành
      </span>
    );
  };

  // Render Step Content Data Preview
  const renderStepPreview = () => {
    const d = step.data || {};

    if (step.key === 'shopInfo') {
      return d.name ? (
        <div className="step-data-preview-box">
          <div className="preview-mini-logo">
            <img src={d.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="Logo" />
          </div>
          <div className="preview-text-block">
            <span className="preview-primary-text">{d.name}</span>
            <span className="preview-sub-text">Ngành hàng: <strong>{d.category || 'Thời trang'}</strong> • {d.description || 'Chính hãng S-Shopping'}</span>
          </div>
        </div>
      ) : (
        <p className="preview-empty-text">Shop chưa thiết lập tên, logo và danh mục ngành hàng.</p>
      );
    }

    if (step.key === 'verification') {
      return d.status === 'COMPLETED' ? (
        <div className="step-data-preview-box">
          <div className="verified-shield-icon">
            <ShieldCheck size={22} color="#00B14F" />
          </div>
          <div className="preview-text-block">
            <span className="preview-primary-text">Chủ Shop: {d.ownerName || 'Nguyễn Văn A'}</span>
            <span className="preview-sub-text">Định danh S-Life SSO & CCCD: {d.idNumber || '079203001234'} • Xác thực lúc {d.verifiedDate || '12/08/2026'}</span>
          </div>
        </div>
      ) : (
        <p className="preview-empty-text">Chưa xác minh danh tính người bán. Cần xác thực để đảm bảo quyền lợi thanh toán.</p>
      );
    }

    if (step.key === 'pickupAddress') {
      return d.address ? (
        <div className="step-data-preview-box">
          <div className="preview-map-icon">
            <MapPin size={22} color="#1877F2" />
          </div>
          <div className="preview-text-block">
            <span className="preview-primary-text">{d.contactName} ({d.phone})</span>
            <span className="preview-sub-text">{d.address}, {d.ward}, {d.district}, {d.city}</span>
          </div>
        </div>
      ) : (
        <p className="preview-empty-text">Shop chưa có địa chỉ lấy hàng. Bấm thêm địa chỉ để bưu tá đến nhận đơn.</p>
      );
    }

    if (step.key === 'payoutAccount') {
      return d.accountNumber ? (
        <div className="step-data-preview-box">
          <div className="preview-bank-icon">
            <CreditCard size={22} color="#00B14F" />
          </div>
          <div className="preview-text-block">
            <span className="preview-primary-text">{d.bankName} - {d.accountNumber}</span>
            <span className="preview-sub-text">Chủ TK: <strong>{d.accountHolder}</strong> • <span className="napas-chip">✓ Napas 24/7 Auto-Verified</span></span>
          </div>
        </div>
      ) : (
        <p className="preview-empty-text">Chưa thiết lập tài khoản nhận tiền. Doanh thu bán hàng sẽ được chuyển tự động vào tài khoản này.</p>
      );
    }

    if (step.key === 'shipping') {
      const carriers = d.carriers || [];
      return (
        <div className="step-carriers-inline-list">
          {carriers.map(c => (
            <div key={c.id} className={`carrier-pill-card ${c.enabled ? 'is-enabled' : ''}`}>
              <div className="carrier-label-group">
                <span className="carrier-name">{c.name}</span>
                <span className="carrier-type-tag">{c.type}</span>
              </div>
              <label className="toggle-switch-card mini-toggle" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={c.enabled} 
                  onChange={() => onToggleCarrier && onToggleCarrier(c.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>
      );
    }

    if (step.key === 'firstProduct') {
      const count = d.count || 0;
      return count > 0 ? (
        <div className="step-data-preview-box">
          <div className="preview-product-icon">
            <Package size={22} color="#00B14F" />
          </div>
          <div className="preview-text-block">
            <span className="preview-primary-text">Gian hàng đã có <strong>{count} sản phẩm</strong> trong danh mục</span>
            <span className="preview-sub-text">Sản phẩm đã sẵn sàng hiển thị và nhận đơn đặt hàng từ người mua.</span>
          </div>
        </div>
      ) : (
        <p className="preview-empty-text">Shop chưa có sản phẩm nào. Hãy đăng sản phẩm đầu tiên để bắt đầu bán hàng.</p>
      );
    }

    if (step.key === 'finalReview') {
      return (
        <div className="final-review-checklist-preview">
          <div className="review-criteria-row">
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Thông tin Shop</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Xác minh</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Địa chỉ lấy hàng</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Tài khoản nhận tiền</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Vận chuyển</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-icon">✓</span>
              <span>Sản phẩm đầu tiên</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`shop-setup-step-card ${step.status === 'COMPLETED' ? 'card-completed' : ''} ${step.status === 'READY' ? 'card-ready' : ''} ${step.status === 'LOCKED' ? 'card-locked' : ''}`}>
      {/* Top Header of Card */}
      <div className="step-card-main-row">
        <div className="step-number-col">
          <span className="step-num-text">{step.stepNumber}</span>
          <div className={`step-icon-circle ${step.status}`}>
            <StepIcon size={20} />
          </div>
        </div>

        <div className="step-content-col">
          <div className="step-title-status-row">
            <h3 className="step-title">{step.title}</h3>
            {renderStatusBadge()}
          </div>
          <p className="step-description">{step.desc}</p>

          {/* Dynamic Content Details */}
          <div className="step-details-container">
            {renderStepPreview()}
          </div>
        </div>

        {/* Action Button Column */}
        <div className="step-action-col">
          {step.key === 'firstProduct' ? (
            <button 
              type="button" 
              className="nav-btn-primary step-btn-cta"
              onClick={onOpenAddProduct}
            >
              <Plus size={15} /> {step.actionText}
            </button>
          ) : step.key === 'finalReview' ? (
            <button 
              type="button" 
              className={`step-btn-cta ${step.status === 'READY' || step.status === 'COMPLETED' ? 'nav-btn-primary final-btn' : 'nav-btn-secondary locked-btn'}`}
              onClick={() => onActionClick(step)}
              disabled={step.status === 'LOCKED'}
            >
              {step.status === 'LOCKED' ? `Còn thiếu ${missingStepsCount} bước` : step.actionText}
            </button>
          ) : (
            <button 
              type="button" 
              className={`step-btn-cta ${step.status === 'COMPLETED' ? 'nav-btn-secondary edit-btn' : 'nav-btn-primary'}`}
              onClick={() => onActionClick(step)}
            >
              {step.status === 'COMPLETED' && <Edit3 size={13} />}
              {step.actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
