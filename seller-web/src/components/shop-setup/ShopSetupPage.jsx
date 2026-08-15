import React, { useState, useEffect } from 'react';
import ShopSetupProgress from './ShopSetupProgress';
import ShopSetupStepCard from './ShopSetupStepCard';
import ShopSetupSummary from './ShopSetupSummary';
import ShopSetupModals from './ShopSetupModals';
import sellerService from '../../data/sellerService';
import { CheckCircle2 } from 'lucide-react';

export default function ShopSetupPage({ 
  shopSetupState = null,
  onUpdateShopSetupState,
  isNewShop = false,
  existingProducts = [],
  onNavigateTab,
  onOpenAddProduct 
}) {
  const [setupData, setSetupData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Load Shop Setup Status
  useEffect(() => {
    sellerService.getShopSetupStatus(shopSetupState, isNewShop, existingProducts)
      .then(res => setSetupData(res));
  }, [shopSetupState, isNewShop, existingProducts]);

  if (!setupData) return null;

  const { completedCount, totalCount, progressPercent, steps, rawState } = setupData;
  const missingStepsCount = totalCount - completedCount;

  // Handle Step Action Click
  const handleStepAction = (step) => {
    if (step.key === 'shopInfo') {
      setActiveModal('shopInfo');
    } else if (step.key === 'verification') {
      setActiveModal('verification');
    } else if (step.key === 'pickupAddress') {
      setActiveModal('pickupAddress');
    } else if (step.key === 'payoutAccount') {
      setActiveModal('payoutAccount');
    } else if (step.key === 'shipping') {
      // Toggle first disabled carrier or all
      const updatedCarriers = (rawState.shipping?.carriers || []).map(c => ({ ...c, enabled: true }));
      handleSaveStepData('shipping', { status: 'COMPLETED', carriers: updatedCarriers });
      showToast('Đã kích hoạt các kênh vận chuyển tiêu chuẩn!');
    } else if (step.key === 'firstProduct') {
      onOpenAddProduct();
    } else if (step.key === 'finalReview') {
      if (step.status === 'READY') {
        setActiveModal('finalReview');
      }
    }
  };

  // Toggle individual carrier
  const handleToggleCarrier = (carrierId) => {
    const currentCarriers = rawState.shipping?.carriers || [];
    const updated = currentCarriers.map(c => {
      if (c.id === carrierId) {
        return { ...c, enabled: !c.enabled };
      }
      return c;
    });

    const hasAnyEnabled = updated.some(c => c.enabled);
    handleSaveStepData('shipping', {
      status: hasAnyEnabled ? 'COMPLETED' : 'PENDING',
      carriers: updated
    });
  };

  // Save Step Data from Modals
  const handleSaveStepData = (stepKey, stepUpdates) => {
    sellerService.updateShopSetupStep(rawState, stepKey, stepUpdates).then(updatedState => {
      if (onUpdateShopSetupState) {
        onUpdateShopSetupState(updatedState);
      }
      sellerService.getShopSetupStatus(updatedState, isNewShop, existingProducts).then(res => {
        setSetupData(res);
      });
    });
    showToast(`Đã cập nhật ${getStepTitle(stepKey)} thành công!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const getStepTitle = (key) => {
    switch (key) {
      case 'shopInfo': return 'Thông tin Shop';
      case 'verification': return 'Xác minh người bán';
      case 'pickupAddress': return 'Địa chỉ lấy hàng';
      case 'payoutAccount': return 'Tài khoản nhận tiền';
      case 'shipping': return 'Thiết lập vận chuyển';
      case 'firstProduct': return 'Sản phẩm đầu tiên';
      case 'finalReview': return 'Kích hoạt Shop';
      default: return 'Thông tin';
    }
  };

  return (
    <div className="shop-setup-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="setup-toast-notification">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Progress & Header */}
      <ShopSetupProgress 
        completedCount={completedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
        isNewShop={isNewShop}
        onBackToDashboard={() => onNavigateTab('home')}
      />

      {/* Main Two Column Layout */}
      <div className="shop-setup-main-grid">
        {/* Left Column: 7 Step Cards */}
        <div className="shop-setup-steps-col">
          {steps.map(step => (
            <ShopSetupStepCard 
              key={step.id}
              step={step}
              onActionClick={handleStepAction}
              onToggleCarrier={handleToggleCarrier}
              missingStepsCount={missingStepsCount}
              onOpenAddProduct={onOpenAddProduct}
            />
          ))}
        </div>

        {/* Right Column: Summary & Status Card */}
        <div className="shop-setup-summary-col">
          <ShopSetupSummary 
            steps={steps}
            completedCount={completedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
            onContinueNextStep={handleStepAction}
            onOpenAddProduct={onOpenAddProduct}
          />
        </div>
      </div>

      {/* Interactive Modal Drawers */}
      <ShopSetupModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSaveStep={handleSaveStepData}
        initialData={rawState}
      />
    </div>
  );
}
