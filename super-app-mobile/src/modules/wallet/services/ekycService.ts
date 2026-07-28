export interface OcrResult {
  success: boolean;
  fullName?: string;
  birthDate?: string;
  cccdNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  address?: string;
  errorMessage?: string;
}

export interface FaceLivenessResult {
  success: boolean;
  score: number;
  triesRemaining: number;
  errorMessage?: string;
  requiresCskhSupport?: boolean;
}

const REGISTERED_CCCDS_KEY = 'vlife_registered_cccds_list';

export const ekycService = {
  /**
   * Simulate OCR Scanning of CCCD (Front & Back) with validity checks
   */
  async processOcrCccd(frontImageUri: string, backImageUri: string): Promise<OcrResult> {
    if (!frontImageUri || !backImageUri) {
      return {
        success: false,
        errorMessage: 'Vui lòng cung cấp đầy đủ ảnh chụp mặt trước và mặt sau của CCCD.',
      };
    }

    // Simulate OCR Extraction
    const mockCccdNumber = '038203001234';

    // Check duplicate CCCD in system
    const isDuplicate = await this.checkCccdDuplicate(mockCccdNumber);
    if (isDuplicate) {
      return {
        success: false,
        errorMessage: 'CCCD này đã được liên kết với một Ví V-life khác.',
      };
    }

    return {
      success: true,
      fullName: 'NGUYỄN THÀNH TRUNG',
      birthDate: '21/09/2003',
      cccdNumber: mockCccdNumber,
      issueDate: '15/10/2021',
      expiryDate: '21/09/2043',
      address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    };
  },

  /**
   * Check duplicate CCCD in system
   */
  async checkCccdDuplicate(cccdNumber: string): Promise<boolean> {
    // Registered list simulation
    const registeredList = ['012345678901', '099999999999'];
    return registeredList.includes(cccdNumber);
  },

  /**
   * Simulate Liveness Face Matching (Max 3 failed tries limit)
   */
  async verifyFaceLiveness(failedCount: number): Promise<FaceLivenessResult> {
    if (failedCount >= 2) { // 3rd failed attempt
      return {
        success: false,
        score: 0.45,
        triesRemaining: 0,
        errorMessage: 'Xác minh khuôn mặt thất bại quá 3 lần. Luồng eKYC bị tạm khóa 30 phút.',
        requiresCskhSupport: true,
      };
    }

    // High accuracy simulation
    return {
      success: true,
      score: 0.98,
      triesRemaining: 3 - (failedCount + 1),
    };
  }
};
