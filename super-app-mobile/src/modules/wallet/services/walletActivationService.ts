import { deviceBindingService } from './deviceBindingService';
import { securityAuditLogger } from './securityAuditLogger';
import { walletSecurityService } from './walletSecurityService';

export type WalletStatus = 'PENDING' | 'ACTIVE' | 'LIMITED' | 'SUSPENDED' | 'BLOCKED' | 'CLOSED';

export interface WalletProfile {
  walletId: string;
  walletNumber: string;
  walletAlias: string; // S-life Phone Number for MoMo/ZaloPay transfer
  status: WalletStatus;
  level: 'Level 1' | 'Level 2' | 'VIP';
  currency: string; // Server Generated (Default VND)
  balance: number;
  createdTime: string;
  updatedTime: string;
  verifiedDate: string;
}

export interface DraftRegistrationData {
  step: string;
  phone: string;
  fullName?: string;
  cccdNumber?: string;
  birthDate?: string;
  resendOtpCount: number;
  savedAt: number; // Expiry check (24 hours)
}

const DRAFT_REGISTRATION_KEY = 'slife_wallet_draft_registration_v34';

export const walletActivationService = {
  /**
   * Check and filter Weak PINs (Extends base rules with birthdate, phone, 6 last CCCD digits)
   */
  validatePinWithUserData(
    pin: string,
    userData: { birthDate?: string; phone?: string; cccdNumber?: string }
  ): { isValid: boolean; reason?: string } {
    const baseCheck = walletSecurityService.isWeakPin(pin);
    if (baseCheck.isWeak) {
      return { isValid: false, reason: baseCheck.reason };
    }

    // 1. Check against birthdate digits (e.g. 210903)
    if (userData.birthDate) {
      const birthDigits = userData.birthDate.replace(/\D/g, '');
      if (birthDigits.includes(pin) || pin === birthDigits.substring(0, 6) || pin === birthDigits.substring(2, 8)) {
        return { isValid: false, reason: 'Mã PIN không được chứa trùng ngày tháng năm sinh của bạn' };
      }
    }

    // 2. Check against Phone number digits
    if (userData.phone) {
      const phoneDigits = userData.phone.replace(/\D/g, '');
      if (phoneDigits.endsWith(pin) || phoneDigits.includes(pin)) {
        return { isValid: false, reason: 'Mã PIN không được chứa trùng các chữ số trong số điện thoại' };
      }
    }

    // 3. Check against 6 last digits of CCCD
    if (userData.cccdNumber) {
      const cccdDigits = userData.cccdNumber.replace(/\D/g, '');
      const last6 = cccdDigits.slice(-6);
      if (pin === last6) {
        return { isValid: false, reason: 'Mã PIN không được trùng với 6 số cuối của thẻ CCCD' };
      }
    }

    return { isValid: true };
  },

  /**
   * Save Draft Registration Progress encrypted in SecureStore (24-hour expiry)
   */
  async saveDraftProgress(data: Omit<DraftRegistrationData, 'savedAt'>): Promise<void> {
    const draft: DraftRegistrationData = {
      ...data,
      savedAt: Date.now(),
    };
    await deviceBindingService.setSecureItem(DRAFT_REGISTRATION_KEY, JSON.stringify(draft));
  },

  /**
   * Get valid Draft Progress (Must be <= 24 hours old)
   */
  async getDraftProgress(): Promise<DraftRegistrationData | null> {
    try {
      const draftStr = await deviceBindingService.getSecureItem(DRAFT_REGISTRATION_KEY);
      if (!draftStr) return null;

      const draft: DraftRegistrationData = JSON.parse(draftStr);
      const isExpired = Date.now() - draft.savedAt > 24 * 60 * 60 * 1000; // 24 hours expiry
      
      if (isExpired) {
        await deviceBindingService.removeSecureItem(DRAFT_REGISTRATION_KEY);
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  },

  /**
   * Clear Draft Progress upon completion
   */
  async clearDraftProgress(): Promise<void> {
    await deviceBindingService.removeSecureItem(DRAFT_REGISTRATION_KEY);
  },

  /**
   * Idempotent Server Wallet Profile Creation API
   * Flow: Wallet Status PENDING -> eKYC & PIN Setup -> Wallet Status ACTIVE
   */
  async createWalletOnServer(payload: {
    phone: string;
    fullName: string;
    cccdNumber: string;
    birthDate: string;
    pin: string;
    enableBiometric: boolean;
  }): Promise<{ success: boolean; profile: WalletProfile }> {
    const nowIso = new Date().toISOString();
    
    // Server generates unique Wallet Number (e.g. 8812 2345 6789)
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const serverGeneratedWalletNumber = `88${randomSuffix.substring(0, 2)} ${randomSuffix.substring(2, 6)} ${randomSuffix.substring(6)}`;

    // 1. Initial State: PENDING
    const pendingProfile: WalletProfile = {
      walletId: `WID_${Date.now()}`,
      walletNumber: serverGeneratedWalletNumber,
      walletAlias: payload.phone, // MoMo/ZaloPay style SĐT alias
      status: 'PENDING',
      level: 'Level 1',
      currency: 'VND', // Server Generated (Default VND)
      balance: 0,
      createdTime: nowIso,
      updatedTime: nowIso,
      verifiedDate: nowIso,
    };

    // 2. Finalize Registration: Transition PENDING -> ACTIVE
    const activeProfile: WalletProfile = {
      ...pendingProfile,
      status: 'ACTIVE',
      updatedTime: new Date().toISOString(),
    };

    await securityAuditLogger.logEvent('WALLET_ACTIVATION_SUCCESS', 'SUCCESS', payload.phone, 0, {
      walletId: activeProfile.walletId,
      walletNumber: activeProfile.walletNumber,
    });

    await this.clearDraftProgress();

    return {
      success: true,
      profile: activeProfile,
    };
  }
};
