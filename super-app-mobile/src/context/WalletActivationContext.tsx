import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletActivationService, WalletProfile, DraftRegistrationData } from '../modules/wallet/services/walletActivationService';
import { ekycService, OcrResult } from '../modules/wallet/services/ekycService';
import { eligibilityService } from '../modules/wallet/services/eligibilityService';

export type ActivationStep =
  | 'ELIGIBILITY_CHECK'
  | 'PERMISSIONS'
  | 'WELCOME'
  | 'TERMS'
  | 'PHONE_CONFIRM'
  | 'OTP'
  | 'IDENTITY_CCCD'
  | 'FACE_VERIFY'
  | 'EKYC_PROCESSING'
  | 'REVIEW_INFO'
  | 'CREATE_PIN'
  | 'CONFIRM_PIN'
  | 'BIOMETRIC'
  | 'ACTIVATING'
  | 'SUCCESS';

interface WalletActivationContextType {
  currentStep: ActivationStep;
  setStep: (step: ActivationStep) => void;
  
  // Registration State
  phone: string;
  setPhone: (phone: string) => void;
  
  ocrData: OcrResult | null;
  setOcrData: (data: OcrResult | null) => void;
  
  createdPin: string;
  setCreatedPin: (pin: string) => void;
  
  enableBiometric: boolean;
  setEnableBiometric: (enable: boolean) => void;
  
  createdProfile: WalletProfile | null;
  
  // OTP Counter
  resendOtpCount: number;
  incrementResendOtp: () => boolean; // returns false if max 3 resends exceeded
  
  // Draft Progress
  draftProgress: DraftRegistrationData | null;
  resumeDraft: () => void;
  
  // Actions
  processEligibility: (birthDate?: string) => Promise<{ isEligible: boolean; reasons: string[] }>;
  submitOcrImages: (front: string, back: string) => Promise<OcrResult>;
  verifyFaceLiveness: (failedCount: number) => Promise<{ success: boolean; requiresCskh: boolean; message?: string }>;
  finalizeWalletActivation: () => Promise<WalletProfile>;
}

const WalletActivationContext = createContext<WalletActivationContextType | undefined>(undefined);

export const WalletActivationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<ActivationStep>('ELIGIBILITY_CHECK');
  const [phone, setPhone] = useState<string>('0987 123 456'); // Default S-life user phone
  const [ocrData, setOcrData] = useState<OcrResult | null>(null);
  const [createdPin, setCreatedPin] = useState<string>('');
  const [enableBiometric, setEnableBiometric] = useState<boolean>(true);
  const [resendOtpCount, setResendOtpCount] = useState<number>(0);
  const [createdProfile, setCreatedProfile] = useState<WalletProfile | null>(null);
  const [draftProgress, setDraftProgress] = useState<DraftRegistrationData | null>(null);

  // Load draft progress on mount
  useEffect(() => {
    walletActivationService.getDraftProgress().then((draft) => {
      if (draft) {
        setDraftProgress(draft);
      }
    });
  }, []);

  const resumeDraft = () => {
    if (draftProgress) {
      setPhone(draftProgress.phone);
      setCurrentStep(draftProgress.step as ActivationStep);
    }
  };

  const incrementResendOtp = (): boolean => {
    if (resendOtpCount >= 3) {
      return false; // Exceeded max 3 resends
    }
    setResendOtpCount((prev) => prev + 1);
    return true;
  };

  const processEligibility = async (birthDate?: string) => {
    return await eligibilityService.checkEligibility(birthDate, false, false);
  };

  const submitOcrImages = async (front: string, back: string): Promise<OcrResult> => {
    const res = await ekycService.processOcrCccd(front, back);
    if (res.success) {
      setOcrData(res);
    }
    return res;
  };

  const verifyFaceLiveness = async (failedCount: number) => {
    const res = await ekycService.verifyFaceLiveness(failedCount);
    return {
      success: res.success,
      requiresCskh: !!res.requiresCskhSupport,
      message: res.errorMessage,
    };
  };

  const finalizeWalletActivation = async (): Promise<WalletProfile> => {
    const res = await walletActivationService.createWalletOnServer({
      phone,
      fullName: ocrData?.fullName || 'NGUYỄN THÀNH TRUNG',
      cccdNumber: ocrData?.cccdNumber || '038203001234',
      birthDate: ocrData?.birthDate || '21/09/2003',
      pin: createdPin || '123890',
      enableBiometric,
    });
    setCreatedProfile(res.profile);
    return res.profile;
  };

  return (
    <WalletActivationContext.Provider
      value={{
        currentStep,
        setStep: setCurrentStep,
        phone,
        setPhone,
        ocrData,
        setOcrData,
        createdPin,
        setCreatedPin,
        enableBiometric,
        setEnableBiometric,
        createdProfile,
        resendOtpCount,
        incrementResendOtp,
        draftProgress,
        resumeDraft,
        processEligibility,
        submitOcrImages,
        verifyFaceLiveness,
        finalizeWalletActivation,
      }}
    >
      {children}
    </WalletActivationContext.Provider>
  );
};

export const useWalletActivation = () => {
  const context = useContext(WalletActivationContext);
  if (!context) {
    throw new Error('useWalletActivation must be used within a WalletActivationProvider');
  }
  return context;
};
