import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStorage from '../services/authStorage';
import apiClient, { getBaseURL, setSessionExpiredHandler } from '../services/apiClient';
import rideSocketService from '../services/rideSocketService';

export interface DriverUser {
  id: string;
  phone: string;
  fullName: string;
  licensePlate?: string;
  vehicleType?: string;
  avatarUrl?: string;
  rating?: number;
  role: string;
  isOnline?: boolean;
  walletBalance?: number;
  creditBalance?: number;
  tier?: string;
  totalTrips?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  driver: DriverUser | null;
  networkError: string | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  checkSession: () => Promise<void>;
  updateDriverState: (data: Partial<DriverUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [driver, setDriver] = useState<DriverUser | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  /**
   * Kiểm tra phiên đăng nhập đã lưu khi mở app
   */
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setNetworkError(null);

    const performCheck = async () => {
      try {
        const accessToken = await authStorage.getAccessToken();
        const refreshToken = await authStorage.getRefreshToken();

        // Nếu không có token nào -> Người dùng chưa đăng nhập
        if (!accessToken && !refreshToken) {
          setIsAuthenticated(false);
          setDriver(null);
          return;
        }

        // Có token -> Thử gọi API lấy thông tin tài xế hiện tại
        try {
          const meRes = await apiClient.get('/ride/driver/me', {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            timeout: 5000,
          });

          if (meRes.data && meRes.data.id) {
            setDriver(meRes.data);
            setIsAuthenticated(true);
            return;
          }
        } catch (meError: any) {
          // Nếu lỗi 401 (Access token hết hạn) -> Thử refresh bằng refreshToken
          if (meError.response?.status === 401 && refreshToken) {
            try {
              const refreshRes = await axios.post(`${getBaseURL()}/auth/refresh`, {
                refreshToken,
              }, { timeout: 5000 });

              if (refreshRes.data?.accessToken) {
                const newAccessToken = refreshRes.data.accessToken;
                const newRefreshToken = refreshRes.data.refreshToken || refreshToken;
                const driverData = refreshRes.data.driver || (await authStorage.getDriverInfo());

                await authStorage.saveSession(newAccessToken, newRefreshToken, driverData);

                setDriver(driverData);
                setIsAuthenticated(true);
                return;
              }
            } catch (refreshErr) {
              console.warn('[AuthContext] Refresh token không hợp lệ hoặc hết hạn:', refreshErr);
              await authStorage.clearSession();
              setIsAuthenticated(false);
              setDriver(null);
              return;
            }
          }

          // Nếu là lỗi mất mạng hoặc không kết nối được backend -> thông báo lỗi
          if (!meError.response || meError.code === 'ECONNABORTED' || meError.message?.includes('Network')) {
            setNetworkError('Không thể kết nối máy chủ Backend. Vui lòng kiểm tra mạng Wi-Fi và thử lại.');
            return;
          }

          // Lỗi khác từ backend -> xóa phiên và yêu cầu đăng nhập
          await authStorage.clearSession();
          setIsAuthenticated(false);
          setDriver(null);
          return;
        }
      } catch (err: any) {
        console.warn('[AuthContext] Lỗi kiểm tra phiên:', err);
        setIsAuthenticated(false);
        setDriver(null);
      }
    };

    try {
      // Đảm bảo không bao giờ bị treo quá 2 giây ở màn hình khởi động
      await Promise.race([
        performCheck(),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Đăng ký callback khi apiClient phát hiện token hết hạn trong quá trình sử dụng
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setIsAuthenticated(false);
      setDriver(null);
    });
  }, []);

  // Chạy kiểm tra phiên 1 lần khi app khởi động
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Đăng nhập bằng Số điện thoại + Mật khẩu qua Backend thật
   */
  const login = async (phone: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setNetworkError(null);
      const res = await axios.post(`${getBaseURL()}/auth/driver/login`, {
        phone: phone.trim(),
        password: password.trim(),
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (res.data?.accessToken && res.data?.driver) {
        const { accessToken, refreshToken, driver: driverData } = res.data;
        await authStorage.saveSession(accessToken, refreshToken, driverData);
        setDriver(driverData);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: 'Dữ liệu phản hồi từ máy chủ không hợp lệ' };
    } catch (error: any) {
      console.warn('LỖI ĐĂNG NHẬP THỰC TẾ:', error?.message, error?.code, error?.response?.status, error?.response?.data);
      const detail = `[${error?.code || 'ERR'}] ${error?.message || ''} (Target: ${getBaseURL()}/auth/driver/login)`;
      const message =
        error.response?.data?.message ||
        (error.message?.includes('Network')
          ? `Không thể kết nối tới máy chủ.\nChi tiết: ${detail}`
          : `Đăng nhập thất bại: ${detail}`);
      return { success: false, message };
    }
  };

  /**
   * Đăng xuất an toàn: Kiểm tra chuyến đang chạy -> Ngắt kết nối -> Xóa phiên
   */
  const logout = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Kiểm tra an toàn: Tài xế có đang trong chuyến xe nào không?
      const savedTrip = await AsyncStorage.getItem('@sunstar_driver_active_trip');
      if (savedTrip) {
        try {
          const trip = JSON.parse(savedTrip);
          if (trip && trip.tripId) {
            return {
              success: false,
              message: 'Bạn đang có chuyến xe chưa hoàn thành! Vui lòng hoàn thành chuyến trước khi đăng xuất.',
            };
          }
        } catch (e) {}
      }

      // 2. Chuyển tài xế sang ngoại tuyến trên Backend
      try {
        await apiClient.put('/ride/driver/online', { isOnline: false }).catch(() => {});
      } catch (e) {}

      // 3. Gọi API đăng xuất trên Backend để thu hồi phiên
      try {
        await apiClient.post('/auth/logout').catch(() => {});
      } catch (e) {}

      // 4. Ngắt kết nối WebSocket
      rideSocketService.disconnect();

      // 5. Xóa sạch token và phiên đã lưu trên thiết bị
      await authStorage.clearSession();
      await AsyncStorage.removeItem('@sunstar_driver_active_trip').catch(() => {});
      await AsyncStorage.removeItem('@sunstar_driver_trip_step').catch(() => {});

      // 6. Cập nhật state quay về màn hình đăng nhập
      setDriver(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (err: any) {
      console.warn('[AuthContext] Lỗi đăng xuất:', err);
      // Dù có lỗi mạng vẫn đảm bảo xóa sạch dữ liệu cục bộ để thoát an toàn
      await authStorage.clearSession();
      setDriver(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const updateDriverState = (data: Partial<DriverUser>) => {
    setDriver((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        driver,
        networkError,
        login,
        logout,
        checkSession,
        updateDriverState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};

export default AuthContext;
