import React from 'react';
import { ArrowRight, Bookmark, X, CheckCircle2 } from 'lucide-react';

export default function ProductFormActions({
  onCancel,
  onSaveDraft,
  onNextStep,
  isSavingDraft = false,
  draftSavedMessage = ''
}) {
  return (
    <div className="product-form-actions-card">
      <div className="actions-left-group">
        <button
          type="button"
          className="btn-action-secondary btn-cancel"
          onClick={onCancel}
        >
          <X size={15} /> Hủy bỏ
        </button>

        {draftSavedMessage && (
          <span className="draft-saved-notice">
            <CheckCircle2 size={14} color="#00B14F" /> {draftSavedMessage}
          </span>
        )}
      </div>

      <div className="actions-right-group">
        <button
          type="button"
          className="btn-action-secondary btn-save-draft"
          onClick={onSaveDraft}
          disabled={isSavingDraft}
        >
          <Bookmark size={15} /> {isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
        </button>

        <button
          type="button"
          className="btn-action-primary btn-next-step"
          onClick={onNextStep}
        >
          <span>Tiếp theo</span> <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
