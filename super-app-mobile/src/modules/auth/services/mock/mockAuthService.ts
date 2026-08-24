import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IAuthService, LoginResponse } from '../../types';
import { findMockUserByPhone } from './mockData/users';
import { mockUserService } from '../../../user/services/mock/mockUserService';
import { deviceInfoService } from '../../../../services/deviceInfoService';

export const mockAuthService: IAuthService = {
  async register(phone: string, password: string, fullName: string): Promise<void> {
    await simulateLatency(400, 1200);
    simulateNetworkError(0.02);
    console.log('[MockAuth] Registered user:', phone, fullName);
    return Promise.resolve();
  },

  async login(phone: string, password: string): Promise<LoginResponse> {
    await simulateLatency(500, 1500);
    simulateNetworkError(0.02);

    const matchedUser = findMockUserByPhone(phone);
    
    const user = matchedUser ? {
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      phone: matchedUser.phone,
      avatarUrl: matchedUser.avatarUrl,
      bio: matchedUser.bio,
      coins: matchedUser.coins,
      rewardPoints: matchedUser.rewardPoints,
      vipTier: matchedUser.vipTier
    } : {
      id: 'mock_user_' + Date.now(),
      fullName: 'Phạm Thành Trung ✨',
      phone: phone,
      avatarUrl: 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512',
      bio: 'Tài khoản V-life.',
      coins: 10000,
      rewardPoints: 100,
      vipTier: 'Đồng' as const
    };

    // Ghi nhận sự kiện Login trên thiết bị thực tế
    const deviceInfo = await deviceInfoService.getDeviceInfo();
    await mockUserService.recordDeviceLogin(deviceInfo);

    return {
      user,
      deviceId: deviceInfo.deviceId,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    await simulateLatency(300, 800);
    return {
      accessToken: 'mock_new_access_token_' + Date.now(),
      refreshToken: 'mock_new_refresh_token_' + Date.now(),
      expiresIn: 3600
    };
  },

  async logout(): Promise<void> {
    await simulateLatency(200, 600);
    await mockUserService.recordDeviceLogout();
    return Promise.resolve();
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await simulateLatency(400, 1000);
    return Promise.resolve();
  },
};
