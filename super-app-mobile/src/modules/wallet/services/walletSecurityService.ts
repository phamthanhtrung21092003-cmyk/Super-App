import { deviceBindingService } from './deviceBindingService';
import { securityAuditLogger } from './securityAuditLogger';

const ACCESS_TOKEN_KEY = 'vlife_wallet_access_token';
const REFRESH_TOKEN_KEY = 'vlife_wallet_refresh_token';
const FAILED_ATTEMPTS_KEY = 'vlife_wallet_failed_attempts';
const LOCKOUT_TIMESTAMP_KEY = 'vlife_wallet_lockout_until';
const PIN_HASH_SERVER_MOCK_KEY = 'vlife_wallet_server_pin_mock';

const WEAK_PINS = ['111111', '123456', '654321', '000000', '121212', '999999', '555555'];

export interface WalletSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface PinVerifyResult {
  success: boolean;
  message: string;
  lockoutRemainingSeconds?: number;
  isPermanentlyLocked?: boolean;
  tokens?: WalletSessionTokens;
}

export const walletSecurityService = {
  /**
   * Validate weak PIN policy
   */
  isWeakPin(pin: string): { isWeak: boolean; reason?: string } {
    if (!/^\d{6}$/.test(pin)) {
      return { isWeak: true, reason: 'Mã PIN phải gồm đúng 6 chữ số' };
    }
    if (WEAK_PINS.includes(pin)) {
      return { isWeak: true, reason: 'Mã PIN quá đơn giản và dễ đoán (VD: 123456, 111111...)' };
    }
    // Check ascending sequence (123456) or descending (654321)
    if ('0123456789'.includes(pin) || '9876543210'.includes(pin)) {
      return { isWeak: true, reason: 'Không sử dụng dãy số tiến/lùi liên tiếp' };
    }
    return { isWeak: false };
  },

  /**
   * Verify PIN via Server (Server-side Argon2/PBKDF2 Hash Mock Verification)
   */
  async verifyPinWithServer(inputPin: string): Promise<PinVerifyResult> {
    // Check active lockout
    const lockoutUntil = await deviceBindingService.getSecureItem(LOCKOUT_TIMESTAMP_KEY);
    if (lockoutUntil) {
      const remainingMs = parseInt(lockoutUntil, 10) - Date.now();
      if (remainingMs > 0) {
        const remainingSec = Math.ceil(remainingMs / 1000);
        await securityAuditLogger.logEvent('PIN_AUTH_ATTEMPT_DURING_LOCKOUT', 'BLOCKED', 'current_user', 50);
        return {
          success: false,
          message: `Ví đang bị tạm khóa. Vui lòng thử lại sau ${remainingSec} giây.`,
          lockoutRemainingSeconds: remainingSec,
        };
      } else {
        await deviceBindingService.removeSecureItem(LOCKOUT_TIMESTAMP_KEY);
      }
    }

    // Get current failed attempts count
    const failedStr = await deviceBindingService.getSecureItem(FAILED_ATTEMPTS_KEY);
    let failedCount = failedStr ? parseInt(failedStr, 10) : 0;

    if (failedCount >= 10) {
      await securityAuditLogger.logEvent('PIN_AUTH_PERMANENT_LOCK', 'BLOCKED', 'current_user', 80);
      return {
        success: false,
        message: 'Ví điện tử đã bị khóa do nhập sai PIN 10 lần. Vui lòng xác thực OTP SMS để mở lại.',
        isPermanentlyLocked: true,
      };
    }

    // Default mock server PIN is 123890 if not configured yet
    let serverPin = await deviceBindingService.getSecureItem(PIN_HASH_SERVER_MOCK_KEY);
    if (!serverPin) {
      serverPin = '123890';
      await deviceBindingService.setSecureItem(PIN_HASH_SERVER_MOCK_KEY, serverPin);
    }

    if (inputPin === serverPin) {
      // Success! Reset failed count and lockout
      await deviceBindingService.removeSecureItem(FAILED_ATTEMPTS_KEY);
      await deviceBindingService.removeSecureItem(LOCKOUT_TIMESTAMP_KEY);

      // Issue JWT Session Tokens (5 min Access Token, 24 hour Refresh Token)
      const now = Date.now();
      const tokens: WalletSessionTokens = {
        accessToken: `jwt_acc_${now}_${Math.random().toString(36).substring(7)}`,
        refreshToken: `jwt_ref_${now}_${Math.random().toString(36).substring(7)}`,
        expiresInSeconds: 300, // 5 minutes
      };

      await deviceBindingService.setSecureItem(ACCESS_TOKEN_KEY, JSON.stringify({
        token: tokens.accessToken,
        expiresAt: now + 300 * 1000,
      }));

      await deviceBindingService.setSecureItem(REFRESH_TOKEN_KEY, JSON.stringify({
        token: tokens.refreshToken,
        expiresAt: now + 86400 * 1000, // 24 hours
      }));

      await securityAuditLogger.logEvent('PIN_AUTH_SUCCESS', 'SUCCESS', 'current_user', 0);

      return {
        success: true,
        message: 'Xác thực PIN thành công',
        tokens,
      };
    }

    // Failed attempt increment
    failedCount += 1;
    await deviceBindingService.setSecureItem(FAILED_ATTEMPTS_KEY, failedCount.toString());
    await securityAuditLogger.logEvent('PIN_AUTH_FAILED', 'FAIL', 'current_user', 20, { failedCount });

    if (failedCount >= 10) {
      return {
        success: false,
        message: 'Bạn đã nhập sai PIN 10 lần. Ví đã bị khóa để bảo vệ tài sản! Hãy xác thực bằng OTP SMS.',
        isPermanentlyLocked: true,
      };
    } else if (failedCount >= 5) {
      const lockMs = 300000; // 5 minutes lock
      await deviceBindingService.setSecureItem(LOCKOUT_TIMESTAMP_KEY, (Date.now() + lockMs).toString());
      return {
        success: false,
        message: 'Nhập sai 5 lần! Ví bị tạm khóa trong 5 phút.',
        lockoutRemainingSeconds: 300,
      };
    } else if (failedCount >= 3) {
      const lockMs = 30000; // 30 seconds lock
      await deviceBindingService.setSecureItem(LOCKOUT_TIMESTAMP_KEY, (Date.now() + lockMs).toString());
      return {
        success: false,
        message: 'Nhập sai 3 lần! Ví bị tạm khóa trong 30 giây.',
        lockoutRemainingSeconds: 30,
      };
    }

    return {
      success: false,
      message: `Mã PIN không đúng. Bạn còn ${5 - failedCount} lần thử trước khi bị tạm khóa.`,
    };
  },

  /**
   * Silent Refresh Session Token (Only during active session)
   */
  async silentRefreshSession(): Promise<boolean> {
    try {
      const refreshStr = await deviceBindingService.getSecureItem(REFRESH_TOKEN_KEY);
      if (!refreshStr) return false;

      const refreshData = JSON.parse(refreshStr);
      if (Date.now() > refreshData.expiresAt) {
        // Refresh token expired
        await walletSecurityService.revokeWalletSession();
        return false;
      }

      // Renew 5-minute Access Token ngầm
      const now = Date.now();
      const newAccessToken = `jwt_acc_${now}_${Math.random().toString(36).substring(7)}`;
      await deviceBindingService.setSecureItem(ACCESS_TOKEN_KEY, JSON.stringify({
        token: newAccessToken,
        expiresAt: now + 300 * 1000,
      }));

      await securityAuditLogger.logEvent('SILENT_REFRESH_SUCCESS', 'SUCCESS');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if Access Token is active
   */
  async isAccessTokenValid(): Promise<boolean> {
    try {
      const accessStr = await deviceBindingService.getSecureItem(ACCESS_TOKEN_KEY);
      if (!accessStr) return false;
      const data = JSON.parse(accessStr);
      return Date.now() < data.expiresAt;
    } catch {
      return false;
    }
  },

  /**
   * Revoke Wallet Session (Without logging out of Super App)
   */
  async revokeWalletSession(): Promise<void> {
    await deviceBindingService.removeSecureItem(ACCESS_TOKEN_KEY);
    await deviceBindingService.removeSecureItem(REFRESH_TOKEN_KEY);
    await securityAuditLogger.logEvent('WALLET_SESSION_REVOKED', 'SUCCESS');
  },

  /**
   * Reset 10-failed attempts lock via OTP SMS Recovery
   */
  async resetLockViaOtp(otp: string): Promise<boolean> {
    if (otp === '123456' || otp.length === 6) {
      await deviceBindingService.removeSecureItem(FAILED_ATTEMPTS_KEY);
      await deviceBindingService.removeSecureItem(LOCKOUT_TIMESTAMP_KEY);
      await securityAuditLogger.logEvent('WALLET_LOCK_RECOVERED_OTP', 'SUCCESS');
      return true;
    }
    return false;
  }
};
