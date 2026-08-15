import React from 'react';
import { CheckCircle2, Circle, Lock, Sparkles, Rocket, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ShopSetupSummary({ 
  steps = [], 
  completedCount = 4, 
  totalCount = 7, 
  progressPercent = 57, 
  onContinueNextStep,
  onOpenAddProduct 
}) {
  const nextPendingStep = steps.find(s => s.status !== 'COMPLETED' && s.key !== 'finalReview');

  return (
    <div className="shop-setup-summary-card">
      <div className="summary-card-header">
        <div className="summary-badge-icon">
          <Rocket size={18} />
        </div>
        <h3 className="summary-heading">Trạng thái Shop</h3>
      </div>

      {/* Progress Bar in Card */}
      <div className="summary-progress-box">
        <div className="summary-progress-label">
          <span>Tiến độ hoàn tất:</span>
          <strong>{completedCount}/{totalCount}</strong>
        </div>
        <div className="summary-track-bar">
          <div 
            className="summary-fill-bar" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="summary-percent-text">{progressPercent}% hoàn thành</span>
      </div>

      {/* Checklist List */}
      <div className="summary-checklist-items">
        {steps.map(s => {
          const isDone = s.status === 'COMPLETED';
          const isLocked = s.status === 'LOCKED';

          return (
            <div key={s.id} className={`summary-step-row ${isDone ? 'is-done' : 'is-pending'}`}>
              <div className="summary-step-icon">
                {isDone ? (
                  <CheckCircle2 size={16} className="icon-done" />
                ) : isLocked ? (
                  <Lock size={14} className="icon-locked" />
                ) : (
                  <Circle size={15} className="icon-pending" />
                )}
              </div>
              <span className="summary-step-title">{s.title}</span>
              {isDone && <span className="summary-done-chip">Xong</span>}
            </div>
          );
        })}
      </div>

      {/* Notice Banner */}
      <div className="summary-notice-callout">
        <Sparkles size={16} color="var(--primary)" />
        <p>
          {completedCount === totalCount 
            ? 'Cửa hàng đã sẵn sàng 100%! Bạn có thể bắt đầu tiếp cận hàng triệu khách hàng.'
            : 'Hoàn thành các bước còn lại để Shop sẵn sàng hoạt động trên V-life.'}
        </p>
      </div>

      {/* Next Step Action Button */}
      {nextPendingStep && (
        <button 
          type="button" 
          className="nav-btn-primary summary-action-btn"
          onClick={() => {
            if (nextPendingStep.key === 'firstProduct') {
              onOpenAddProduct();
            } else {
              onContinueNextStep(nextPendingStep);
            }
          }}
        >
          <span>Tiếp tục: {nextPendingStep.title}</span>
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
