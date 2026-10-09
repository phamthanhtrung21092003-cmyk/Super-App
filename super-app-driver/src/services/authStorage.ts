import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'sunstar_driver_access_token';
const REFRESH_TOKEN_KEY = 'sunstar_driver_refresh_token';
const DRIVER_INFO_KEY = 'sunstar_driver_info';

export const authStorage = {
  /**
   * Lưu phiên đăng nhập an toàn (Access Token + Refresh Token + Driver Info)
   */
  async saveSession(accessToken: string, refreshToken: string, driverInfo?: any): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      // Giữ key 'accessToken' trên AsyncStorage để tương thích các module socket/api
      await AsyncStorage.setItem('accessToken', accessToken);

      if (driverInfo) {
        const infoStr = JSON.stringify(driverInfo);
        await AsyncStorage.setItem(DRIVER_INFO_KEY, infoStr);
        await AsyncStorage.setItem('driverInfo', infoStr);
      }
    } catch (e) {
      console.warn('[authStorage] Lỗi lưu phiên đăng nhập:', e);
    }
  },

  /**
   * Lấy Access Token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return (await AsyncStorage.getItem(ACCESS_TOKEN_KEY)) || (await AsyncStorage.getItem('accessToken'));
    } catch (e) {
      return null;
    }
  },

  /**
   * Cập nhật riêng Access Token (khi refresh)
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem('accessToken', accessToken);
    } catch (e) {
      console.warn('[authStorage] Lỗi cập nhật accessToken:', e);
    }
  },

  /**
   * Lấy Refresh Token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  /**
   * Lấy thông tin tài xế đã lưu
   */
  async getDriverInfo(): Promise<any | null> {
    try {
      const raw = (await AsyncStorage.getItem(DRIVER_INFO_KEY)) || (await AsyncStorage.getItem('driverInfo'));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Xóa sạch toàn bộ thông tin phiên khi Đăng xuất
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY).catch(() => {});
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {});
      await AsyncStorage.removeItem(DRIVER_INFO_KEY).catch(() => {});
      await AsyncStorage.removeItem('accessToken').catch(() => {});
      await AsyncStorage.removeItem('driverInfo').catch(() => {});
    } catch (e) {
      console.warn('[authStorage] Lỗi xóa phiên:', e);
    }
  },
};

export default authStorage;

