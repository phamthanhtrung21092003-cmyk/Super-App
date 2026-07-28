export type RiskAuthRequirement = 'PIN_OR_BIOMETRIC' | 'REQUIRES_OTP' | 'BLOCK_AND_EKYC';

export interface RiskEvaluationResult {
  score: number;
  requirement: RiskAuthRequirement;
  reasons: string[];
}

export const riskEngineService = {
  /**
   * Evaluate action risk score (0 - 100)
   */
  evaluateRisk(context: {
    actionType: 'LOGIN' | 'TRANSFER' | 'WITHDRAW' | 'CHANGE_PIN' | 'LINK_BANK';
    amount?: number;
    isNewDevice?: boolean;
    isNewIp?: boolean;
    serverConfigLimit?: number;
    failedPinCount?: number;
  }): RiskEvaluationResult {
    let score = 0;
    const reasons: string[] = [];
    const thresholdLimit = context.serverConfigLimit || 10000000; // 10 Million VND default from server config

    if (context.isNewDevice) {
      score += 30;
      reasons.push('Đăng nhập trên thiết bị mới (+30)');
    }

    if (context.isNewIp) {
      score += 20;
      reasons.push('Vị trí IP mới (+20)');
    }

    if (context.amount && context.amount >= thresholdLimit) {
      score += 20;
      reasons.push(`Giao dịch vượt hạn mức cấu hình (${(thresholdLimit / 1000000).toLocaleString('vi-VN')}M đ) (+20)`);
    }

    if (context.actionType === 'WITHDRAW' || context.actionType === 'CHANGE_PIN' || context.actionType === 'LINK_BANK') {
      score += 15;
      reasons.push(`Thao tác nhạy cảm (${context.actionType}) (+15)`);
    }

    if (context.failedPinCount && context.failedPinCount >= 3) {
      score += 25;
      reasons.push(`Nhập sai PIN nhiều lần (${context.failedPinCount} lần) (+25)`);
    }

    let requirement: RiskAuthRequirement = 'PIN_OR_BIOMETRIC';
    if (score >= 70) {
      requirement = 'BLOCK_AND_EKYC';
    } else if (score >= 30) {
      requirement = 'REQUIRES_OTP';
    }

    return {
      score,
      requirement,
      reasons,
    };
  }
};
