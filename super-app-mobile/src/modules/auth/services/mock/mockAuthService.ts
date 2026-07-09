import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IAuthService, LoginResponse } from '../../types';
import { findMockUserByPhone } from './mockData/users';

export const mockAuthService: IAuthService = {
  async register(phone: string, password: string, fullName: string): Promise<void> {
    await simulateLatency(400, 1200);
    simulateNetworkError(0.02); // 2% chance of network error for testing
    console.log('[MockAuth] Registered user:', phone, fullName);
    return Promise.resolve();
  },

  async login(phone: string, password: string): Promise<LoginResponse> {
    await simulateLatency(500, 1500);
    simulateNetworkError(0.02);

    // Tìm trong danh sách mock users
    const matchedUser = findMockUserByPhone(phone);
    
    // Nếu không tìm thấy, tạo user ảo bằng tên "User Mock" hoặc thông tin tương ứng
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
      fullName: 'Phạm Thành Trung (Mock) ✨',
      phone: phone,
      avatarUrl: 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512',
      bio: 'Tài khoản giả lập để thiết kế giao diện offline.',
      coins: 10000,
      rewardPoints: 100,
      vipTier: 'Đồng' as const
    };

    return {
      user,
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
    return Promise.resolve();
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await simulateLatency(400, 1000);
    return Promise.resolve();
  },
};
