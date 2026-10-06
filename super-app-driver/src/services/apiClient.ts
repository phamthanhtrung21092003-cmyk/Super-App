import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const devApiUrl = process.env.EXPO_PUBLIC_DEV_API || 'http://192.168.12.115:5000/api/v1';

export function getBaseURL(): string {
  return devApiUrl;
}

const apiClient = axios.create({
  baseURL: devApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Tự động đảm bảo tài xế luôn có token xác thực hợp lệ.
 * Nếu chưa có token hoặc token hết hạn, gọi API đăng nhập tài xế mẫu.
 */
export async function ensureDriverAuth(): Promise<string | null> {
  try {
    let token = await AsyncStorage.getItem('accessToken');
    if (token) return token;

    const response = await axios.post(`${devApiUrl}/auth/driver/login`, {
      phone: '0988123456',
      password: 'Driver@123456',
    });

    if (response.data?.accessToken) {
      const accessToken: string = response.data.accessToken;
      await AsyncStorage.setItem('accessToken', accessToken);
      if (response.data?.driver) {
        await AsyncStorage.setItem('driverInfo', JSON.stringify(response.data.driver));
      }
      return accessToken;
    }
  } catch (err: any) {
    console.warn('[DriverApiClient] Lỗi tự động đăng nhập tài xế:', err?.message || err);
  }
  return null;
}

apiClient.interceptors.request.use(
  async (config: any) => {
    let accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken && !config.url?.includes('/auth/')) {
      accessToken = await ensureDriverAuth();
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      await AsyncStorage.removeItem('accessToken');
      const newToken = await ensureDriverAuth();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
