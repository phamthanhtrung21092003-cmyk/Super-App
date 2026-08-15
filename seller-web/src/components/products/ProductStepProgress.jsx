import React from 'react';
import { Check } from 'lucide-react';

export const PRODUCT_CREATION_STEPS = [
  { id: 1, number: '01', title: 'Thông tin cơ bản' },
  { id: 2, number: '02', title: 'Hình ảnh & Video' },
  { id: 3, number: '03', title: 'Phân loại / SKU' },
  { id: 4, number: '04', title: 'Giá & Tồn kho' },
  { id: 5, number: '05', title: 'Vận chuyển' },
  { id: 6, number: '06', title: 'Thông tin bổ sung' },
  { id: 7, number: '07', title: 'Xem trước & Đăng' }
];

export default function ProductStepProgress({ currentStep = 1, onSelectStep }) {
  return (
    <div className="product-step-progress-wrapper">
      <div className="product-step-progress-track">
        {PRODUCT_CREATION_STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          let statusClass = 'pending';
          if (isCompleted) statusClass = 'completed';
          if (isCurrent) statusClass = 'active';

          return (
            <React.Fragment key={step.id}>
              <div 
                className={`step-item ${statusClass}`}
                onClick={() => {
                  if (isCompleted && onSelectStep) {
                    onSelectStep(step.id);
                  }
                }}
                title={isPending ? 'Hoàn thành bước hiện tại để tiếp tục' : step.title}
              >
                <div className="step-circle">
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-number-text">{step.number}</span>
                  <span className="step-title-text">{step.title}</span>
                </div>
              </div>

              {idx < PRODUCT_CREATION_STEPS.length - 1 && (
                <div className={`step-connector-line ${step.id < currentStep ? 'filled' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
