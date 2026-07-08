import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
const devApiUrl = process.env.EXPO_PUBLIC_DEV_API || 'http://192.168.12.109:5000/api/v1';
const prodApiUrl = process.env.EXPO_PUBLIC_PROD_API || 'https://api.vlife.vn/api/v1';

export const getBaseURL = () => {
  if (appEnv === 'production') {
    return prodApiUrl;
  }
  return devApiUrl;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Tự động gắn Authorization Header
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý 401 tự động Refresh Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra lỗi mất kết nối máy chủ
    if (!error.response && error.request) {
      console.log('Network Error: Không thể kết nối máy chủ.');
      return Promise.reject(new Error('Không thể kết nối máy chủ.'));
    }

    // Xử lý lỗi 401 Unauthorized (bỏ qua các route auth cơ bản không cần/không thể refresh)
    const url = originalRequest.url || '';
    const isBypassRoute = url.includes('/auth/login') || 
                          url.includes('/auth/register') || 
                          url.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isBypassRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // Gọi API refresh trực tiếp qua axios thường để tránh đệ quy qua interceptor
        const baseURL = apiClient.defaults.baseURL || getBaseURL();
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = refreshResponse.data;

        // Lưu thông tin đăng nhập mới
        const tokenExpiresAt = Date.now() + expiresIn * 1000;
        await AsyncStorage.setItem('accessToken', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
        await AsyncStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());

        console.log('Access Token refreshed.');

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Nếu là lỗi mất kết nối trong lúc refresh, không xóa phiên
        if (!refreshError.response && refreshError.request) {
          console.log('Network error during refresh token attempt.');
          return Promise.reject(new Error('Không thể kết nối máy chủ.'));
        }

        console.log('Session expired.');

        // Xóa sạch thông tin phiên đăng nhập
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('currentUser');
        await AsyncStorage.removeItem('tokenExpiresAt');

        if (onSessionExpired) {
          onSessionExpired();
        }

        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        );

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
