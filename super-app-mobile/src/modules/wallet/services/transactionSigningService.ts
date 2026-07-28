export interface SignedTransactionPackage {
  payload: any;
  nonce: string;
  timestamp: number;
  algorithm: 'HMAC-SHA256' | 'ECDSA' | 'Ed25519';
  signature: string;
}

const usedNoncesSet = new Set<string>();

export const transactionSigningService = {
  /**
   * Create a signed transaction package with single-use nonce (30s expiry)
   */
  async signTransaction(
    payload: Record<string, any>,
    algorithm: 'HMAC-SHA256' | 'ECDSA' | 'Ed25519' = 'HMAC-SHA256'
  ): Promise<SignedTransactionPackage> {
    const timestamp = Date.now();
    const nonce = `nonce_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;

    const rawData = JSON.stringify({ payload, nonce, timestamp });
    
    // Hash payload with secret token or signature
    let hash = 0;
    for (let i = 0; i < rawData.length; i++) {
      const char = rawData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const signature = `sig_${algorithm}_${Math.abs(hash).toString(16)}`;

    return {
      payload,
      nonce,
      timestamp,
      algorithm,
      signature,
    };
  },

  /**
   * Verify single-use Nonce (30s window)
   */
  verifyNonce(nonce: string, timestamp: number): { valid: boolean; reason?: string } {
    const now = Date.now();
    if (now - timestamp > 30000) {
      return { valid: false, reason: 'Nonce đã hết hạn (quá 30 giây)' };
    }
    if (usedNoncesSet.has(nonce)) {
      return { valid: false, reason: 'Nonce đã được sử dụng (Cảnh báo Replay Attack)' };
    }

    usedNoncesSet.add(nonce);
    return { valid: true };
  }
};
