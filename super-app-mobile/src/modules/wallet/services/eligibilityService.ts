export interface EligibilityCheckResult {
  isEligible: boolean;
  reasons: string[];
}

export const eligibilityService = {
  /**
   * Check pre-registration eligibility:
   * 1. Minimum age check (16+ years old)
   * 2. V-life Account status check (Not locked / suspended)
   * 3. Existing wallet check
   */
  async checkEligibility(userBirthDate?: string, isAccountLocked: boolean = false, hasExistingWallet: boolean = false): Promise<EligibilityCheckResult> {
    const reasons: string[] = [];

    if (hasExistingWallet) {
      reasons.push('Tài khoản V-life của bạn đã có Ví điện tử được kích hoạt.');
    }

    if (isAccountLocked) {
      reasons.push('Tài khoản V-life của bạn đang bị khóa hoặc hạn chế dịch vụ tài chính.');
    }

    if (userBirthDate) {
      const birth = new Date(userBirthDate);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age < 16) {
        reasons.push('Người dùng phải đủ 16 tuổi trở lên để đăng ký Ví điện tử V-life.');
      }
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  }
};
