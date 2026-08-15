import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import ProductStepProgress from './ProductStepProgress';
import ProductBasicInfo from './ProductBasicInfo';
import ProductImageUpload from './ProductImageUpload';
import ProductVideoUpload from './ProductVideoUpload';
import ProductPreview from './ProductPreview';
import ProductFormActions from './ProductFormActions';
import sellerService from '../../data/sellerService';

export default function AddProduct({
  initialDraft = null,
  onCancel,
  onSaveDraftSuccess,
  onStepComplete
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    id: initialDraft?.id || null,
    name: initialDraft?.name || '',
    category: initialDraft?.category || '',
    brand: initialDraft?.brand || 'Không có thương hiệu',
    description: initialDraft?.description || '',
    images: initialDraft?.images || [],
    videos: initialDraft?.videos || [],
    price: initialDraft?.price || '',
    origPrice: initialDraft?.origPrice || '',
    stock: initialDraft?.stock || ''
  });

  const [errors, setErrors] = useState({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');
  const [notification, setNotification] = useState(null);

  // Field change handler
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field if any
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleClearError = (fieldName) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  // Save Draft to Mock State & Service Layer
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      let savedDraft;
      if (formData.id) {
        savedDraft = await sellerService.updateProductDraft(formData.id, formData);
      } else {
        savedDraft = await sellerService.createProductDraft(formData);
        setFormData(prev => ({ ...prev, id: savedDraft.id }));
      }

      setDraftSavedMessage('Đã lưu bản nháp');
      setNotification({
        type: 'success',
        message: `Đã lưu bản nháp "${savedDraft.name || 'Sản phẩm mới'}" thành công.`
      });

      if (onSaveDraftSuccess) onSaveDraftSuccess(savedDraft);
      setTimeout(() => setDraftSavedMessage(''), 3000);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Lỗi khi lưu bản nháp sản phẩm.'
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Step 1 Validation and Proceed to Step 2
  const handleNextStep = async () => {
    // Validate required fields: Tên sản phẩm, Danh mục, Ít nhất 1 hình ảnh
    const validation = await sellerService.validateProductDraft(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setNotification({
        type: 'error',
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc trước khi chuyển sang bước tiếp theo.'
      });
      setTimeout(() => setNotification(null), 4000);

      // Scroll to the first error
      const firstErrorKey = Object.keys(validation.errors)[0];
      if (firstErrorKey === 'name') {
        document.getElementById('prod-name-input')?.focus();
      } else if (firstErrorKey === 'category') {
        document.getElementById('prod-category-select')?.focus();
      }
      return;
    }

    // Validation passed
    setErrors({});
    
    // Auto-save draft
    let savedDraft;
    if (formData.id) {
      savedDraft = await sellerService.updateProductDraft(formData.id, { ...formData, currentStep: 1 });
    } else {
      savedDraft = await sellerService.createProductDraft({ ...formData, currentStep: 1 });
      setFormData(prev => ({ ...prev, id: savedDraft.id }));
    }

    setNotification({
      type: 'success',
      message: '✓ Thông tin cơ bản hợp lệ! Sẵn sàng chuyển sang Bước 02: Hình ảnh & Video.'
    });

    if (onStepComplete) {
      onStepComplete(1, savedDraft);
    }
  };

  return (
    <div className="add-product-page-container">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`toast-notification-banner ${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="add-product-header">
        <div className="header-left-col">
          <div className="breadcrumb-nav">
            <span className="breadcrumb-link" onClick={onCancel}>Sản phẩm</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Thêm sản phẩm</span>
          </div>
          <h1 className="add-product-title">Thêm sản phẩm</h1>
          <p className="add-product-subtitle">
            Điền đầy đủ thông tin để sản phẩm có thể được đăng bán trên V-life.
          </p>
        </div>

        <div className="header-actions-col">
          <button
            type="button"
            className="btn-header-secondary"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
          >
            <Bookmark size={15} /> {isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button
            type="button"
            className="btn-header-secondary"
            onClick={onCancel}
          >
            <X size={15} /> Thoát
          </button>
        </div>
      </div>

      {/* 2. Step Progress Bar */}
      <ProductStepProgress 
        currentStep={currentStep} 
        onSelectStep={(step) => setCurrentStep(step)} 
      />

      {/* 3. Main Form & Realtime Preview Grid */}
      <div className="add-product-content-grid">
        {/* Left Form Column (~68%) */}
        <div className="form-main-column">
          {/* Card 1: Thông tin cơ bản */}
          <ProductBasicInfo
            formData={formData}
            errors={errors}
            onChangeField={handleFieldChange}
            onClearError={handleClearError}
          />

          {/* Card 2: Hình ảnh sản phẩm */}
          <ProductImageUpload
            images={formData.images || []}
            error={errors.images}
            onChangeImages={(imgs) => handleFieldChange('images', imgs)}
            onClearError={handleClearError}
          />

          {/* Card 3: Video sản phẩm */}
          <ProductVideoUpload
            videos={formData.videos || []}
            onChangeVideos={(vids) => handleFieldChange('videos', vids)}
          />

          {/* Card 4: Action Footer */}
          <ProductFormActions
            onCancel={onCancel}
            onSaveDraft={handleSaveDraft}
            onNextStep={handleNextStep}
            isSavingDraft={isSavingDraft}
            draftSavedMessage={draftSavedMessage}
          />
        </div>

        {/* Right Sticky Preview Column (~32%) */}
        <div className="preview-side-column">
          <ProductPreview formData={formData} />
        </div>
      </div>
    </div>
  );
}
