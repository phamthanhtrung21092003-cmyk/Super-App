import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, isMockMode } from '../services';
import { IAuthRepository } from '../types';

export const authRepository: IAuthRepository = {
  async register(phone: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> {
    try {
      await authService.register(phone, password, fullName);
      return { success: true, message: 'Đăng ký thành công!' };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 409) {
          return { success: false, message: 'Số điện thoại này đã tồn tại.' };
        }
        if (status === 400 && data && data.message) {
          return { success: false, message: data.message };
        }
      }
      return { success: false, message: 'Không thể kết nối máy chủ.' };
    }
  },

  async login(phone: string, password: string): Promise<{ success: boolean; fullName?: string; message: string; user?: any }> {
    try {
      const result = await authService.login(phone, password);
      
      const tokenExpiresAt = Date.now() + result.expiresIn * 1000;

      // Lưu trữ thông tin đăng nhập vào AsyncStorage
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('refreshToken', result.refreshToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(result.user));
      await AsyncStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());
      await AsyncStorage.setItem('userName', result.user.fullName);

      return { 
        success: true, 
        fullName: result.user.fullName, 
        message: 'Đăng nhập thành công!',
        user: result.user
      };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          return { success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác.' };
        }
      }
      return { success: false, message: 'Không thể kết nối máy chủ.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('API logout failed, clearing session anyway:', error);
    } finally {
      // Xóa tất cả các khóa lưu trữ thông tin cá nhân khỏi AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('tokenExpiresAt');
      await AsyncStorage.removeItem('userName');
    }
  },

  async restoreSession(): Promise<{ success: boolean; user?: any }> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const rToken = await AsyncStorage.getItem('refreshToken');
      const userStr = await AsyncStorage.getItem('currentUser');
      const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');

      // Trong chế độ mock, nếu chưa đăng nhập trước đó, tự động giả lập đăng nhập để vào thẳng trang chủ
      if (isMockMode && (!token || !rToken || !userStr || !expiresAtStr)) {
        console.log('[AuthRepository] Auto mock session login...');
        const mockUser = {
          id: 'mock_user_trung',
          fullName: 'Phạm Thành Trung ✨',
          phone: '0987654321',
          avatarUrl: 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512',
          bio: 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨',
          coins: 15000,
          rewardPoints: 1850,
          vipTier: 'Vàng'
        };

        const tokenExpiresAt = Date.now() + 3600 * 1000;
        await AsyncStorage.setItem('accessToken', 'mock_access_token');
        await AsyncStorage.setItem('refreshToken', 'mock_refresh_token');
        await AsyncStorage.setItem('currentUser', JSON.stringify(mockUser));
        await AsyncStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());
        await AsyncStorage.setItem('userName', mockUser.fullName);

        return { success: true, user: mockUser };
      }

      if (!token || !rToken || !userStr || !expiresAtStr) {
        return { success: false };
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();

      // Kiểm tra hạn Access Token
      if (expiresAt > now + 5000) {
        const user = JSON.parse(userStr);
        return { success: true, user };
      } else {
        console.log('[AuthRepository] Token expired. Refreshing...');
        try {
          const result = await authService.refreshToken(rToken);
          const newTokenExpiresAt = Date.now() + result.expiresIn * 1000;

          await AsyncStorage.setItem('accessToken', result.accessToken);
          await AsyncStorage.setItem('refreshToken', result.refreshToken);
          await AsyncStorage.setItem('tokenExpiresAt', newTokenExpiresAt.toString());

          const user = JSON.parse(userStr);
          return { success: true, user };
        } catch (refreshError) {
          console.warn('[AuthRepository] Refresh token expired, clearing session.');
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('currentUser');
          await AsyncStorage.removeItem('tokenExpiresAt');
          return { success: false };
        }
      }
    } catch (e) {
      console.error('[AuthRepository] Failed to restore session:', e);
      return { success: false };
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if ((status === 400 || status === 429) && data && data.message) {
          const msg = Array.isArray(data.message) ? data.message[0] : data.message;
          return { success: false, message: msg };
        }
        if (status === 401) {
          return { success: false, message: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
        }
      }
      return { success: false, message: 'Không thể kết nối máy chủ.' };
    }
  }
};
export default authRepository;
