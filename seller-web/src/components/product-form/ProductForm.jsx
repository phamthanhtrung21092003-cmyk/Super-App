import React, { useState } from 'react';
import { 
  ArrowLeft, Save, CheckCircle2, ChevronRight, 
  FileText, Image as ImageIcon, Layers, DollarSign, 
  Truck, ShieldCheck, Eye, Sparkles, Send, Bookmark
} from 'lucide-react';
import ProductBasicInfo from './ProductBasicInfo';
import ProductMedia from './ProductMedia';
import ProductVariants from './ProductVariants';
import ProductPricing from './ProductPricing';
import ProductShipping from './ProductShipping';
import ProductAdditionalInfo from './ProductAdditionalInfo';
import ProductPreviewStep from './ProductPreviewStep';

export default function ProductForm({ 
  initialData = null, 
  onSave, 
  onCancel 
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState(initialData || {
    name: '',
    category: 'Thời trang nam',
    brand: 'No Brand',
    condition: 'Mới 100%',
    description: '',
    images: [],
    image: '',
    videoUrl: '',
    hasVariants: false,
    variantGroup1Name: 'Màu sắc',
    variantGroup1Options: ['Đen', 'Trắng', 'Xanh Navy'],
    variantGroup2Name: 'Kích thước',
    variantGroup2Options: ['M', 'L', 'XL'],
    variantMatrix: [],
    variants: '',
    sku: '',
    price: '189000',
    origPrice: '250000',
    stock: '100',
    minOrderQty: '1',
    maxOrderQty: '',
    status: 'Đang bán',
    weight: '350',
    length: '25',
    width: '20',
    height: '5',
    enableInstant: true,
    origin: 'Việt Nam',
    material: '100% Cotton Compact',
    warranty: '12 tháng',
    warrantyType: 'Bảo hành điện tử',
    isPreOrder: false,
    preOrderDays: '7'
  });

  const [activeStep, setActiveStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: FileText },
    { id: 2, title: 'Hình ảnh/Video', icon: ImageIcon },
    { id: 3, title: 'SKU & phân loại', icon: Layers },
    { id: 4, title: 'Giá & tồn kho', icon: DollarSign },
    { id: 5, title: 'Vận chuyển', icon: Truck },
    { id: 6, title: 'Thông tin bổ sung', icon: ShieldCheck },
    { id: 7, title: 'Xem trước', icon: Eye }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleNextStep = () => {
    // Step validation
    if (activeStep === 1 && (!formData.name || formData.name.trim() === '')) {
      setErrorMessage('Vui lòng nhập Tên sản phẩm trước khi chuyển bước tiếp theo.');
      return;
    }
    if (activeStep < 7) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('Vui lòng nhập ít nhất Tên sản phẩm để lưu bản nháp.');
      setActiveStep(1);
      return;
    }
    const draftData = { ...formData, status: 'Bản nháp' };
    setSuccessToast('Đã lưu bản nháp sản phẩm thành công!');
    setTimeout(() => {
      onSave(draftData);
    }, 800);
  };

  const handleSubmitForm = (e) => {
    if (e && e.preventDefault) e.preventDefault();

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

    // Set default fallback cover image if none chosen
    const finalData = {
      ...formData,
      image: formData.image || (formData.images && formData.images.length > 0 ? formData.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
      status: formData.status || 'Đang bán'
    };

    setSuccessToast(isEditing ? 'Đã cập nhật thông tin sản phẩm thành công!' : '🎉 Đã đăng bán sản phẩm lên S-Shopping thành công!');
    setTimeout(() => {
      onSave(finalData);
    }, 900);
  };

  return (
    <div className="product-form-page-container">
      {/* Top Header Bar */}
      <div className="form-header-bar">
        <button type="button" className="nav-btn-secondary back-to-list-btn" onClick={onCancel}>
          <ArrowLeft size={16} /> Danh sách sản phẩm
        </button>

        <div className="form-page-title-group">
          <h2 className="form-page-title">
            {isEditing ? `Chỉnh sửa sản phẩm: ${initialData.name}` : 'Đăng Bán Sản Phẩm Mới'}
          </h2>
          <span className="form-page-subtitle">Quy trình đăng bán 8 bước chuẩn thương mại điện tử</span>
        </div>

        <div className="form-top-actions">
          <button type="button" className="nav-btn-secondary draft-btn" onClick={handleSaveDraft} title="Lưu lại và tiếp tục chỉnh sửa sau">
            <Bookmark size={15} /> Lưu bản nháp
          </button>
          <button 
            type="button" 
            className={`nav-btn-secondary preview-btn ${activeStep === 7 ? 'active-highlight' : ''}`}
            onClick={() => setActiveStep(7)}
          >
            <Eye size={15} /> Xem trước
          </button>
          <button type="button" className="nav-btn-primary save-product-btn" onClick={handleSubmitForm}>
            <Send size={15} /> {isEditing ? 'Cập nhật sản phẩm' : 'Đăng sản phẩm'}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="form-success-toast-banner">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* 8-Step Navigation Stepper Bar */}
      <div className="form-stepper-bar">
        {steps.map(step => {
          const StepIcon = step.icon;
          const isCurrent = activeStep === step.id;
          const isPassed = activeStep > step.id;

          return (
            <div 
              key={step.id} 
              className={`stepper-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="stepper-badge">
                {isPassed ? <CheckCircle2 size={14} /> : <StepIcon size={13} />}
              </div>
              <div className="stepper-text-col">
                <span className="stepper-step-num">Bước {step.id}</span>
                <span className="stepper-title-text">{step.title}</span>
              </div>
              {step.id < 7 && <ChevronRight size={14} className="stepper-arrow" />}
            </div>
          );
        })}
      </div>

      {/* Error Feedback Alert Banner */}
      {errorMessage && (
        <div className="form-error-alert-banner">
          ⚠️ <strong>Lỗi thông tin:</strong> {errorMessage}
        </div>
      )}

      {/* Step Content Container Body */}
      <form onSubmit={handleSubmitForm} className="product-form-content-body">
        {activeStep === 1 && <ProductBasicInfo formData={formData} onChange={handleFieldChange} />}
        {activeStep === 2 && <ProductMedia formData={formData} onChange={handleFieldChange} />}
        {activeStep === 3 && <ProductVariants formData={formData} onChange={handleFieldChange} />}
        {activeStep === 4 && <ProductPricing formData={formData} onChange={handleFieldChange} />}
        {activeStep === 5 && <ProductShipping formData={formData} onChange={handleFieldChange} />}
        {activeStep === 6 && <ProductAdditionalInfo formData={formData} onChange={handleFieldChange} />}
        {activeStep === 7 && <ProductPreviewStep formData={formData} />}

        {/* Bottom Wizard Stepper Navigation Footer */}
        <div className="form-wizard-footer">
          <div className="footer-left-buttons">
            <button 
              type="button" 
              className="nav-btn-secondary"
              onClick={handlePrevStep}
              disabled={activeStep === 1}
            >
              ← Bước trước
            </button>
            <button 
              type="button" 
              className="nav-btn-secondary cancel-text-btn"
              onClick={onCancel}
            >
              Hủy bỏ
            </button>
          </div>

          <div className="wizard-right-buttons">
            <button 
              type="button" 
              className="nav-btn-secondary"
              onClick={handleSaveDraft}
            >
              <Bookmark size={15} /> Lưu nháp
            </button>

            {activeStep < 7 ? (
              <button 
                type="button" 
                className="nav-btn-primary next-step-btn"
                onClick={handleNextStep}
              >
                Bước tiếp theo →
              </button>
            ) : (
              <button 
                type="submit" 
                className="nav-btn-primary big-submit-btn"
              >
                <Send size={17} /> {isEditing ? 'Cập nhật sản phẩm' : 'Đăng sản phẩm ngay'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
