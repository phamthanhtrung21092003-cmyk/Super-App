import { simulateLatency } from '../../../../services/mock/mockUtils';
import {
  IUserService,
  UserProfile,
  Address,
  CheckUsernameResponse,
  OtpRequestResponse,
  OtpVerifyPhoneResponse,
  OtpVerifyEmailResponse,
  UserDevice,
} from '../../types';
import { MOCK_USER_PROFILES, MOCK_ADDRESSES } from './mockData/users';
import { deviceInfoService, DeviceInfoPayload } from '../../../../services/deviceInfoService';

interface PendingOtp {
  otp: string;
  targetValue: string;
  expiresAt: number;
  attempts: number;
}

let mockPhoneOtp: PendingOtp | null = null;
let mockEmailOtp: PendingOtp | null = null;
let mockPhoneRateLimit = { count: 0, resetTime: 0 };
let mockEmailRateLimit = { count: 0, resetTime: 0 };

// KHÔNG hardcode bất kỳ thiết bị giả nào (iPhone, Pixel, S24...)
// Lịch sử thiết bị bắt đầu rỗng và chỉ ghi nhận các sự kiện đăng nhập thực tế.
let MOCK_DEVICES: UserDevice[] = [];

export const mockUserService: IUserService & {
  recordDeviceLogin: (info?: DeviceInfoPayload) => Promise<void>;
  recordDeviceLogout: () => Promise<void>;
} = {
  /**
   * Ghi nhận sự kiện Đăng nhập thực tế của thiết bị trong Mock Mode
   */
  async recordDeviceLogin(info?: DeviceInfoPayload): Promise<void> {
    const deviceInfo = info || (await deviceInfoService.getDeviceInfo());
    const isMobile = deviceInfo.platform.toLowerCase().includes('ios') ||
                     deviceInfo.platform.toLowerCase().includes('android') ||
                     deviceInfo.platform.toLowerCase().includes('mobile');

    // Quy tắc 1 Mobile Active: Chuyển các thiết bị mobile khác sang LOGGED_OUT
    if (isMobile) {
      MOCK_DEVICES.forEach(d => {
        if (d.deviceId !== deviceInfo.deviceId && d.status === 'ACTIVE') {
          d.status = 'LOGGED_OUT';
          d.loggedOutAt = new Date().toISOString();
          d.isCurrent = false;
        }
      });
    }

    const existingIdx = MOCK_DEVICES.findIndex(d => d.deviceId === deviceInfo.deviceId);
    if (existingIdx !== -1) {
      // Re-login thiết bị cũ -> Kích hoạt ACTIVE, không tạo duplicate
      MOCK_DEVICES[existingIdx].status = 'ACTIVE';
      MOCK_DEVICES[existingIdx].lastLoginAt = new Date().toISOString();
      MOCK_DEVICES[existingIdx].lastActiveAt = new Date().toISOString();
      MOCK_DEVICES[existingIdx].loggedOutAt = undefined;
      MOCK_DEVICES[existingIdx].isCurrent = true;
      MOCK_DEVICES[existingIdx].deviceName = deviceInfo.deviceName;
      MOCK_DEVICES[existingIdx].modelName = deviceInfo.modelName;
      MOCK_DEVICES[existingIdx].osVersion = deviceInfo.osVersion;
    } else {
      // Thiết bị mới đăng nhập
      const newDevice: UserDevice = {
        id: 'dev_' + Date.now(),
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        manufacturer: deviceInfo.manufacturer,
        modelName: deviceInfo.modelName,
        platform: deviceInfo.platform,
        osVersion: deviceInfo.osVersion,
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        loggedOutAt: undefined,
        createdAt: new Date().toISOString(),
        isCurrent: true,
      };
      MOCK_DEVICES.push(newDevice);
    }
  },

  /**
   * Ghi nhận sự kiện Đăng xuất của thiết bị hiện tại trong Mock Mode
   */
  async recordDeviceLogout(): Promise<void> {
    const currentDeviceId = await deviceInfoService.getDeviceId();
    const target = MOCK_DEVICES.find(d => d.deviceId === currentDeviceId);
    if (target) {
      target.status = 'LOGGED_OUT';
      target.loggedOutAt = new Date().toISOString();
      target.isCurrent = false;
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile> {
    await simulateLatency(200, 400);
    const profile = MOCK_USER_PROFILES.find(u => u.id === userId) || MOCK_USER_PROFILES[0];
    return { ...profile };
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await simulateLatency(300, 600);
    const profileIdx = MOCK_USER_PROFILES.findIndex(u => u.id === userId);
    const targetIdx = profileIdx !== -1 ? profileIdx : 0;
    const profile = MOCK_USER_PROFILES[targetIdx];

    // Check duplicate username in mock
    if (data.username && data.username.toLowerCase() !== profile.username?.toLowerCase()) {
      const check = await this.checkUsername(data.username);
      if (!check.available) {
        throw new Error(check.message);
      }
    }

    const updated = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    MOCK_USER_PROFILES[targetIdx] = updated;
    return { ...updated };
  },

  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    await simulateLatency(150, 300);
    const trimmed = username?.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 30) {
      return {
        available: false,
        message: 'Username phải từ 3 đến 30 ký tự',
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return {
        available: false,
        message: 'Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_)',
      };
    }

    const isTaken = MOCK_USER_PROFILES.some(
      u => u.username?.toLowerCase() === trimmed && u.id !== 'mock_user_trung'
    );

    if (isTaken) {
      return {
        available: false,
        message: 'Username này đã có người sử dụng. Vui lòng chọn tên khác.',
      };
    }

    return {
      available: true,
      message: 'Username hợp lệ và có thể sử dụng',
    };
  },

  async requestPhoneOtp(newPhone: string, password: string): Promise<OtpRequestResponse> {
    await simulateLatency(300, 500);
    const trimmed = newPhone.trim();

    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(trimmed)) {
      throw new Error('Số điện thoại không đúng định dạng Việt Nam (10 chữ số: 03x, 05x, 07x, 08x, 09x)');
    }

    if (!password || password.trim().length === 0) {
      throw new Error('Vui lòng nhập mật khẩu để xác thực');
    }

    const isTaken = MOCK_USER_PROFILES.some(
      u => u.phone === trimmed && u.id !== 'mock_user_trung'
    );
    if (isTaken) {
      throw new Error('Số điện thoại này đã được đăng ký bởi tài khoản khác');
    }

    const now = Date.now();
    if (now > mockPhoneRateLimit.resetTime) {
      mockPhoneRateLimit = { count: 1, resetTime: now + 5 * 60 * 1000 };
    } else {
      if (mockPhoneRateLimit.count >= 3) {
        throw new Error('Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 5 phút.');
      }
      mockPhoneRateLimit.count++;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockPhoneOtp = {
      otp,
      targetValue: trimmed,
      expiresAt: now + 3 * 60 * 1000,
      attempts: 0,
    };

    return {
      message: 'Mã xác thực OTP đã được gửi đến số điện thoại mới.',
      expiresIn: 180,
      devOtp: otp,
    };
  },

  async verifyPhoneOtp(newPhone: string, otp: string): Promise<OtpVerifyPhoneResponse> {
    await simulateLatency(300, 500);
    const trimmed = newPhone.trim();

    if (!mockPhoneOtp || mockPhoneOtp.targetValue !== trimmed) {
      throw new Error('Không tìm thấy yêu cầu đổi số điện thoại hoặc số không khớp.');
    }

    const now = Date.now();
    if (now > mockPhoneOtp.expiresAt) {
      mockPhoneOtp = null;
      throw new Error('Mã OTP đã hết hạn (sau 3 phút). Vui lòng yêu cầu lại mã.');
    }

    if (mockPhoneOtp.attempts >= 5) {
      mockPhoneOtp = null;
      throw new Error('Bạn đã nhập sai OTP quá 5 lần. Yêu cầu đã bị hủy, vui lòng lấy lại mã.');
    }

    if (mockPhoneOtp.otp !== otp.trim()) {
      mockPhoneOtp.attempts++;
      throw new Error(`Mã OTP không chính xác. Bạn còn ${5 - mockPhoneOtp.attempts} lần thử.`);
    }

    const user = MOCK_USER_PROFILES[0];
    user.phone = trimmed;
    mockPhoneOtp = null;

    return {
      message: 'Đổi số điện thoại thành công.',
      phone: trimmed,
    };
  },

  async requestEmailOtp(newEmail: string): Promise<OtpRequestResponse> {
    await simulateLatency(300, 500);
    const trimmed = newEmail.trim().toLowerCase();

    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(trimmed)) {
      throw new Error('Định dạng địa chỉ email không hợp lệ');
    }

    const isTaken = MOCK_USER_PROFILES.some(
      u => u.email?.toLowerCase() === trimmed && u.id !== 'mock_user_trung'
    );
    if (isTaken) {
      throw new Error('Địa chỉ email này đã được liên kết với tài khoản khác');
    }

    const now = Date.now();
    if (now > mockEmailRateLimit.resetTime) {
      mockEmailRateLimit = { count: 1, resetTime: now + 5 * 60 * 1000 };
    } else {
      if (mockEmailRateLimit.count >= 3) {
        throw new Error('Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 5 phút.');
      }
      mockEmailRateLimit.count++;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockEmailOtp = {
      otp,
      targetValue: trimmed,
      expiresAt: now + 3 * 60 * 1000,
      attempts: 0,
    };

    return {
      message: 'Mã xác thực OTP đã được gửi vào hòm thư điện tử.',
      expiresIn: 180,
      devOtp: otp,
    };
  },

  async verifyEmailOtp(newEmail: string, otp: string): Promise<OtpVerifyEmailResponse> {
    await simulateLatency(300, 500);
    const trimmed = newEmail.trim().toLowerCase();

    if (!mockEmailOtp || mockEmailOtp.targetValue !== trimmed) {
      throw new Error('Không tìm thấy yêu cầu liên kết email hoặc email không khớp.');
    }

    const now = Date.now();
    if (now > mockEmailOtp.expiresAt) {
      mockEmailOtp = null;
      throw new Error('Mã xác nhận đã hết hạn (sau 3 phút). Vui lòng yêu cầu lại mã.');
    }

    if (mockEmailOtp.attempts >= 5) {
      mockEmailOtp = null;
      throw new Error('Bạn đã nhập sai mã xác nhận quá 5 lần. Vui lòng lấy lại mã mới.');
    }

    if (mockEmailOtp.otp !== otp.trim()) {
      mockEmailOtp.attempts++;
      throw new Error(`Mã xác nhận không chính xác. Bạn còn ${5 - mockEmailOtp.attempts} lần thử.`);
    }

    const user = MOCK_USER_PROFILES[0];
    user.email = trimmed;
    mockEmailOtp = null;

    return {
      message: 'Liên kết email thành công.',
      email: trimmed,
    };
  },

  /**
   * PURE READ-ONLY: getDevices chỉ đọc và sắp xếp danh sách, KHÔNG tự động tạo thêm device
   */
  async getDevices(): Promise<UserDevice[]> {
    await simulateLatency(200, 400);
    const currentDeviceId = await deviceInfoService.getDeviceId();

    // Nếu danh sách rỗng (lần đầu khởi chạy chưa qua sự kiện login), đăng ký thiết bị hiện tại
    if (MOCK_DEVICES.length === 0) {
      await this.recordDeviceLogin();
    }

    const mapped = MOCK_DEVICES.map(d => ({
      ...d,
      isCurrent: d.deviceId === currentDeviceId,
    }));

    // Sắp xếp: Active lên đầu, sau đó Logged out theo lastLoginAt giảm dần
    const sorted = mapped.sort((a, b) => {
      if (a.isCurrent && a.status === 'ACTIVE') return -1;
      if (b.isCurrent && b.status === 'ACTIVE') return 1;
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
      return new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime();
    });

    return sorted;
  },

  async logoutDevice(deviceId: string): Promise<{ message: string }> {
    await simulateLatency(200, 400);
    const currentDeviceId = await deviceInfoService.getDeviceId();
    const target = MOCK_DEVICES.find(d => d.id === deviceId || d.deviceId === deviceId);
    if (target?.deviceId === currentDeviceId) {
      throw new Error('Không thể đăng xuất thiết bị hiện tại qua danh sách quản lý.');
    }
    if (target) {
      target.status = 'LOGGED_OUT';
      target.loggedOutAt = new Date().toISOString();
      target.isCurrent = false;
    }
    return { message: 'Đăng xuất thiết bị thành công.' };
  },

  async logoutOtherDevices(): Promise<{ message: string }> {
    await simulateLatency(200, 400);
    const currentDeviceId = await deviceInfoService.getDeviceId();
    MOCK_DEVICES.forEach(d => {
      if (d.deviceId !== currentDeviceId && d.status === 'ACTIVE') {
        d.status = 'LOGGED_OUT';
        d.loggedOutAt = new Date().toISOString();
        d.isCurrent = false;
      }
    });
    return { message: 'Đã đăng xuất khỏi tất cả các thiết bị khác.' };
  },

  async getAddresses(userId: string): Promise<Address[]> {
    await simulateLatency(200, 400);
    return [...MOCK_ADDRESSES];
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    await simulateLatency(300, 500);
    const newAddr: Address = {
      ...address,
      id: 'addr_' + Date.now(),
    };
    if (newAddr.isDefault) {
      MOCK_ADDRESSES.forEach(a => (a.isDefault = false));
    }
    MOCK_ADDRESSES.push(newAddr);
    return newAddr;
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await simulateLatency(200, 400);
    const idx = MOCK_ADDRESSES.findIndex(a => a.id === addressId);
    if (idx !== -1) {
      MOCK_ADDRESSES.splice(idx, 1);
    }
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await simulateLatency(200, 400);
    MOCK_ADDRESSES.forEach(a => {
      a.isDefault = a.id === addressId;
    });
  },
};

export default mockUserService;
