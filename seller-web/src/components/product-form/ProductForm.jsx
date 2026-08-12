import React, { useState } from 'react';
import { ArrowLeft, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import ProductBasicInfo from './ProductBasicInfo';
import ProductMedia from './ProductMedia';
import ProductVariants from './ProductVariants';
import ProductPricing from './ProductPricing';
import ProductShipping from './ProductShipping';
import ProductAdditionalInfo from './ProductAdditionalInfo';

export default function ProductForm({ 
  initialData = null, 
  onSave, 
  onCancel 
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState(initialData || {
    name: '',
    category: 'Thời trang',
    brand: '',
    description: '',
    images: [],
    image: '',
    videoUrl: '',
    variants: '',
    sku: '',
    price: '',
    origPrice: '',
    stock: '100',
    status: 'Đang bán',
    weight: '500',
    length: '20',
    width: '15',
    height: '10',
    origin: 'Việt Nam',
    warranty: '12 tháng'
  });

  const [activeStep, setActiveStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    { id: 1, title: '1. Thông tin cơ bản' },
    { id: 2, title: '2. Hình ảnh & Video' },
    { id: 3, title: '3. Phân loại sản phẩm' },
    { id: 4, title: '4. Giá & Kho hàng' },
    { id: 5, title: '5. Vận chuyển' },
    { id: 6, title: '6. Thông tin bổ sung' }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleNextStep = () => {
    // Basic validation for Step 1
    if (activeStep === 1 && (!formData.name || formData.name.trim() === '')) {
      setErrorMessage('Vui lòng nhập Tên sản phẩm trước khi chuyển bước tiếp theo.');
      return;
    }
    if (activeStep < 6) setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('Tên sản phẩm không được để trống.');
      setActiveStep(1);
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage('Vui lòng nhập Giá bán hợp lệ cho sản phẩm.');
      setActiveStep(4);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="product-form-page-container">
      {/* Top Header Bar */}
      <div className="form-header-bar">
        <button className="nav-btn-secondary back-to-list-btn" onClick={onCancel}>
          <ArrowLeft size={16} /> Quay lại Danh sách sản phẩm
        </button>

        <h2 className="form-page-title">
          {isEditing ? `Chỉnh sửa sản phẩm: ${initialData.name}` : 'Thêm sản phẩm mới'}
        </h2>

        <div className="form-top-actions">
          <button className="nav-btn-secondary" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button className="nav-btn-primary save-product-btn" onClick={handleSubmitForm}>
            <Save size={16} /> {isEditing ? 'Cập nhật sản phẩm' : 'Lưu & Đăng sản phẩm'}
          </button>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="form-stepper-bar">
        {steps.map(step => {
          const isCurrent = activeStep === step.id;
          const isPassed = activeStep > step.id;

          return (
            <div 
              key={step.id} 
              className={`stepper-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="stepper-badge">
                {isPassed ? <CheckCircle2 size={14} /> : step.id}
              </div>
              <span className="stepper-title-text">{step.title}</span>
              {step.id < 6 && <ChevronRight size={14} className="stepper-arrow" />}
            </div>
          );
        })}
      </div>

      {/* Error Feedback Alert Banner */}
      {errorMessage && (
        <div className="form-error-alert-banner">
          ⚠️ <strong>Lỗi:</strong> {errorMessage}
        </div>
      )}

      {/* Step Content Container */}
      <form onSubmit={handleSubmitForm} className="product-form-content-body">
        {activeStep === 1 && <ProductBasicInfo formData={formData} onChange={handleFieldChange} />}
        {activeStep === 2 && <ProductMedia formData={formData} onChange={handleFieldChange} />}
        {activeStep === 3 && <ProductVariants formData={formData} onChange={handleFieldChange} />}
        {activeStep === 4 && <ProductPricing formData={formData} onChange={handleFieldChange} />}
        {activeStep === 5 && <ProductShipping formData={formData} onChange={handleFieldChange} />}
        {activeStep === 6 && <ProductAdditionalInfo formData={formData} onChange={handleFieldChange} />}

        {/* Bottom Wizard Stepper Navigation Footer */}
        <div className="form-wizard-footer">
          <button 
            type="button" 
            className="nav-btn-secondary"
            onClick={handlePrevStep}
            disabled={activeStep === 1}
          >
            ← Bước trước
          </button>

          <div className="wizard-right-buttons">
            {activeStep < 6 ? (
              <button 
                type="button" 
                className="nav-btn-primary"
                onClick={handleNextStep}
              >
                Bước tiếp theo →
              </button>
            ) : (
              <button 
                type="submit" 
                className="nav-btn-primary big-submit-btn"
              >
                <Save size={18} /> {isEditing ? 'Cập nhật sản phẩm' : 'Đăng sản phẩm ngay'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
