import axios from 'axios';
import authStorage from './authStorage';

export const devApiUrl = process.env.EXPO_PUBLIC_DEV_API || 'http://192.168.12.103:5000/api/v1';
export const prodApiUrl = process.env.EXPO_PUBLIC_PROD_API || 'https://api.vlife.vn/api/v1';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'dev';

export function getBaseURL(): string {
  if (appEnv === 'production') {
    return prodApiUrl;
  }
  return devApiUrl;
}

export let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: any) => void }> = [];

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

// Request Interceptor: Tự động gắn Authorization Header từ authStorage
apiClient.interceptors.request.use(
  async (config: any) => {
    const accessToken = await authStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Tự động làm mới phiên khi Access Token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Không thử refresh nếu là chính API login/refresh hoặc request đã thử lại rồi
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/driver/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshRes = await axios.post(`${getBaseURL()}/auth/refresh`, {
          refreshToken,
        });

        if (refreshRes.data?.accessToken) {
          const newAccessToken = refreshRes.data.accessToken;
          const newRefreshToken = refreshRes.data.refreshToken || refreshToken;
          await authStorage.saveSession(
            newAccessToken,
            newRefreshToken,
            refreshRes.data.driver
          );

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response missing accessToken');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await authStorage.clearSession();
        if (onSessionExpired) {
          onSessionExpired();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
