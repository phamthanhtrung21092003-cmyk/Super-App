/**
 * FoodMerchantContext.tsx
 * ─────────────────────────────────────────────────────────
 * Quản lý trạng thái Realtime cho Phân hệ Quán ăn (Food Merchant).
 * Kết nối Food Gateway Socket.io (/food) và REST APIs NestJS.
 * - Nhận thông báo đơn mới tức thì kèm chuông báo động to & rung haptics
 * - Tự động đồng bộ và khôi phục khi mất mạng/reconnect
 * - Chuẩn hóa chuyển trạng thái đơn theo State Machine V-Life
 * - Quản lý hồ sơ nhà hàng, tài chính & báo cáo doanh thu minh bạch
 * ─────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  foodMerchantService, 
  MerchantRestaurantProfile, 
  FoodMerchantOrder, 
  MerchantFinancialReport 
} from '../services/foodMerchantService';
import { foodSocketService, FoodOrderCreatedPayload, FoodOrderStatusChangedPayload } from '../services/foodSocketService';
import { soundService } from '../services/soundService';
import apiClient from '../services/apiClient';

interface FoodMerchantContextType {
  restaurant: MerchantRestaurantProfile | null;
  orders: FoodMerchantOrder[];
  financials: MerchantFinancialReport | null;
  loading: boolean;
  refreshing: boolean;
  isAlarming: boolean;
  isOffline: boolean;
  isMerchantAuthorized: boolean;
  newOrdersCount: number;
  inProgressCount: number;
  deliveringCount: number;
  completedCount: number;
  cancelledCount: number;
  todayCompletedCount: number;
  todayRevenue: number;
  weekRevenue: number;
  todayOrdersCount: number;
  refreshProfile: () => Promise<MerchantRestaurantProfile | null>;
  refreshOrders: () => Promise<void>;
  refreshFinancials: () => Promise<void>;
  updateProfile: (dto: Partial<MerchantRestaurantProfile>) => Promise<boolean>;
  toggleOpen: (targetState?: boolean) => Promise<boolean>;
  confirmOrder: (orderId: string) => Promise<boolean>;
  startPreparing: (orderId: string) => Promise<boolean>;
  markReady: (orderId: string) => Promise<boolean>;
  rejectOrder: (orderId: string, reason: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Promise<FoodMerchantOrder | null>;
  stopAlarm: () => void;
  loginMerchant: (phone?: string, password?: string) => Promise<boolean>;
}

const FoodMerchantContext = createContext<FoodMerchantContextType | undefined>(undefined);

export const FoodMerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurant, setRestaurant] = useState<MerchantRestaurantProfile | null>(null);
  const [orders, setOrders] = useState<FoodMerchantOrder[]>([]);
  const [financials, setFinancials] = useState<MerchantFinancialReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isAlarming, setIsAlarming] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isMerchantAuthorized, setIsMerchantAuthorized] = useState<boolean>(true);

  const restaurantRef = useRef<MerchantRestaurantProfile | null>(null);
  restaurantRef.current = restaurant;

  const ordersRef = useRef<FoodMerchantOrder[]>([]);
  ordersRef.current = orders;

  // Tiện ích kiểm tra ngày tháng
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const now = new Date();

  // Đếm số lượng đơn theo các trạng thái
  const newOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING').length;
  const deliveringCount = orders.filter((o) => ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP'].includes(o.status)).length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  // Thống kê hôm nay
  const todayOrders = orders.filter((o) => isSameDay(new Date(o.createdAt), now));
  const todayOrdersCount = todayOrders.length;
  const todayCompletedOrders = orders.filter((o) => o.status === 'COMPLETED' && isSameDay(new Date(o.completedAt || o.createdAt), now));
  const todayCompletedCount = todayCompletedOrders.length;

  // Doanh thu hôm nay (90% giá món niêm yết của quán)
  const todayRevenue = todayCompletedOrders.reduce((sum, o) => {
    return sum + (o.restaurantPayout || Math.round((o.subtotal || 0) * 0.9));
  }, 0) || (financials?.netPayout && todayCompletedCount > 0 ? financials.netPayout : 0);

  // Doanh thu 7 ngày gần nhất
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekCompletedOrders = orders.filter((o) => {
    if (o.status !== 'COMPLETED') return false;
    const d = new Date(o.completedAt || o.createdAt);
    return d >= sevenDaysAgo && d <= now;
  });
  const weekRevenue = weekCompletedOrders.reduce((sum, o) => {
    return sum + (o.restaurantPayout || Math.round((o.subtotal || 0) * 0.9));
  }, 0) || (financials?.netPayout ?? 0);

  /**
   * Tải thông tin hồ sơ quán
   */
  const refreshProfile = useCallback(async () => {
    try {
      const data = await foodMerchantService.getProfile();
      setRestaurant(data);
      setIsMerchantAuthorized(true);
      return data;
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setIsMerchantAuthorized(false);
      }
      console.warn('[FoodMerchantContext] Không thể lấy thông tin quán:', err.message);
      return null;
    }
  }, []);

  /**
   * Tải danh sách đơn hàng từ Backend (Single Source of Truth)
   */
  const refreshOrders = useCallback(async () => {
    try {
      const data = await foodMerchantService.getOrders();
      setOrders(data);

      // Nếu không còn đơn PENDING nào, tắt chuông báo
      const hasPending = data.some((o) => o.status === 'PENDING');
      if (!hasPending && soundService.isAlarming()) {
        soundService.stopAlarm();
        setIsAlarming(false);
      }
    } catch (err: any) {
      console.warn('[FoodMerchantContext] Không thể lấy danh sách đơn:', err.message);
    }
  }, []);

  /**
   * Tải báo cáo tài chính
   */
  const refreshFinancials = useCallback(async () => {
    try {
      const data = await foodMerchantService.getFinancials();
      setFinancials(data);
    } catch (err: any) {
      console.warn('[FoodMerchantContext] Không thể lấy báo cáo tài chính:', err.message);
    }
  }, []);

  /**
   * Cập nhật thông tin quán
   */
  const updateProfile = async (dto: Partial<MerchantRestaurantProfile>): Promise<boolean> => {
    try {
      const updated = await foodMerchantService.updateProfile(dto as any);
      setRestaurant(updated);
      Alert.alert('Thành công', 'Thông tin quán đã được cập nhật thành công');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật thông tin quán';
      Alert.alert('Lỗi', msg);
      return false;
    }
  };

  /**
   * Bật / tắt mở quán
   */
  const toggleOpen = async (targetState?: boolean): Promise<boolean> => {
    try {
      const res = await foodMerchantService.toggleOpen(targetState);
      setRestaurant((prev) => prev ? { ...prev, isOpen: res.isOpen } : null);
      return res.isOpen;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái quán';
      Alert.alert('Thông báo', msg);
      return restaurant?.isOpen ?? false;
    }
  };

  /**
   * Lấy chi tiết đơn hàng
   */
  const getOrderById = async (orderId: string): Promise<FoodMerchantOrder | null> => {
    try {
      return await foodMerchantService.getOrderById(orderId);
    } catch (err: any) {
      // Fallback tìm trong state local
      const found = orders.find((o) => o.id === orderId || o.orderCode === orderId);
      return found || null;
    }
  };

  /**
   * Tắt chuông báo đơn mới
   */
  const stopAlarm = () => {
    soundService.stopAlarm();
    setIsAlarming(false);
  };

  /**
   * Xác nhận tiếp nhận đơn hàng (PENDING -> CONFIRMED)
   */
  const confirmOrder = async (orderId: string): Promise<boolean> => {
    try {
      const updated = await foodMerchantService.confirmOrder(orderId);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));

      // Tắt chuông nếu hết đơn PENDING
      const remainingPending = ordersRef.current.filter((o) => o.id !== orderId && o.status === 'PENDING').length;
      if (remainingPending === 0) {
        stopAlarm();
      }
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi xác nhận đơn hàng';
      Alert.alert('Lỗi', msg);
      return false;
    }
  };

  /**
   * Bắt đầu chế biến món (CONFIRMED -> PREPARING)
   */
  const startPreparing = async (orderId: string): Promise<boolean> => {
    try {
      const updated = await foodMerchantService.startPreparing(orderId);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật nấu món';
      Alert.alert('Lỗi', msg);
      return false;
    }
  };

  /**
   * Báo đã làm xong món, sẵn sàng tìm tài xế giao (PREPARING -> FINDING_DRIVER)
   */
  const markReady = async (orderId: string): Promise<boolean> => {
    try {
      const updated = await foodMerchantService.markReady(orderId);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi chuyển trạng thái sẵn sàng';
      Alert.alert('Lỗi', msg);
      return false;
    }
  };

  /**
   * Từ chối đơn hàng (PENDING/CONFIRMED -> CANCELLED)
   */
  const rejectOrder = async (orderId: string, reason: string): Promise<boolean> => {
    try {
      const updated = await foodMerchantService.rejectOrder(orderId, reason);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));

      // Tắt chuông nếu hết đơn PENDING
      const remainingPending = ordersRef.current.filter((o) => o.id !== orderId && o.status === 'PENDING').length;
      if (remainingPending === 0) {
        stopAlarm();
      }
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi từ chối đơn hàng';
      Alert.alert('Lỗi', msg);
      return false;
    }
  };

  /**
   * Đăng nhập tài khoản Chủ Quán thực tế (VD: 0911111111 / Password@123)
   */
  const loginMerchant = async (phone = '0911111111', password = 'Password@123'): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { phone, password });
      if (res.data?.accessToken) {
        await AsyncStorage.setItem('accessToken', res.data.accessToken);
        if (res.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
        }
        await foodSocketService.disconnect();
        await foodSocketService.connect(res.data.accessToken);
        await refreshProfile();
        await refreshOrders();
        await refreshFinancials();
        setIsMerchantAuthorized(true);
        Alert.alert('Đăng nhập thành công', `Chào mừng ${res.data.user?.fullName || 'Chủ quán'}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập không thành công';
      Alert.alert('Đăng nhập thất bại', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo ban đầu
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      try {
        const prof = await refreshProfile();
        if (prof?.id) {
          await refreshOrders();
          await refreshFinancials();

          // Kết nối Socket.io và tham gia room nhà hàng
          await foodSocketService.connect();
          await foodSocketService.joinRestaurantRoom(prof.id);
          console.log(`[FoodMerchantContext] Đã tham gia room nhà hàng: food:restaurant:${prof.id}`);
        }
      } catch (e) {
        console.error('[FoodMerchantContext] Lỗi khởi tạo:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    // Lắng nghe trạng thái Online / Offline của Socket
    const unsubConnection = foodSocketService.onConnectionChange((connected) => {
      setIsOffline(!connected);
    });

    // 1. Lắng nghe đơn hàng mới tạo (food.order.created)
    const unsubOrderCreated = foodSocketService.onOrderCreated((payload: FoodOrderCreatedPayload) => {
      console.log('[FoodMerchantContext] SỰ KIỆN: Nhận đơn hàng mới realtime:', payload.orderCode);
      
      // Chống trùng lặp trong state
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === payload.orderId);
        if (exists) return prev;

        const newOrder: any = {
          id: payload.orderId,
          orderCode: payload.orderCode,
          restaurantId: payload.restaurantId,
          status: payload.status || 'PENDING',
          items: payload.items || [],
          subtotal: payload.subtotal,
          shippingFee: payload.shippingFee,
          total: payload.total,
          paymentMethod: payload.paymentMethod,
          paymentStatus: 'PENDING',
          deliveryAddress: payload.deliveryAddress,
          deliveryLat: payload.deliveryLat,
          deliveryLng: payload.deliveryLng,
          createdAt: payload.createdAt || new Date().toISOString(),
          updatedAt: payload.createdAt || new Date().toISOString(),
          restaurantPayout: Math.round(payload.subtotal * 0.9), // Tạm tính 90%
        };

        return [newOrder, ...prev];
      });

      // Bật chuông báo động to liên tục và rung Haptics
      soundService.startAlarm();
      setIsAlarming(true);
    });

    // 2. Lắng nghe cập nhật trạng thái đơn (food.order.status_changed)
    const unsubStatusChanged = foodSocketService.onOrderStatusChanged((payload: FoodOrderStatusChangedPayload) => {
      console.log(`[FoodMerchantContext] SỰ KIỆN: Đơn #${payload.orderCode} đổi trạng thái -> ${payload.status}`);

      setOrders((prev) => {
        const updated = prev.map((o) => {
          if (o.id === payload.orderId) {
            return {
              ...o,
              status: payload.status as any,
              driverId: payload.driverId ?? o.driverId,
              driver: payload.driver ?? o.driver,
              cancelledReason: payload.reason ?? o.cancelledReason,
              cancelledBy: payload.cancelledBy ?? o.cancelledBy,
              updatedAt: payload.timestamp || new Date().toISOString(),
            };
          }
          return o;
        });

        // Nếu không còn đơn PENDING nào, tắt chuông
        const hasPending = updated.some((o) => o.status === 'PENDING');
        if (!hasPending && soundService.isAlarming()) {
          soundService.stopAlarm();
          setIsAlarming(false);
        }

        return updated;
      });

      // Nếu đơn chuyển sang COMPLETED, refresh lại báo cáo tài chính
      if (payload.status === 'COMPLETED') {
        refreshFinancials();
      }
    });

    // 3. Tự động đồng bộ lại toàn bộ đơn khi Socket reconnect
    const unsubReconnect = foodSocketService.onReconnectSync(() => {
      console.log('[FoodMerchantContext] Reconnected: Đang đồng bộ lại đơn hàng từ Database...');
      refreshOrders();
      refreshProfile();
      refreshFinancials();
      if (restaurantRef.current?.id) {
        foodSocketService.joinRestaurantRoom(restaurantRef.current.id);
      }
    });

    return () => {
      isMounted = false;
      unsubConnection();
      unsubOrderCreated();
      unsubStatusChanged();
      unsubReconnect();
      soundService.stopAlarm();
      if (restaurantRef.current?.id) {
        foodSocketService.leaveRestaurantRoom(restaurantRef.current.id);
      }
    };
  }, [refreshProfile, refreshOrders, refreshFinancials]);

  return (
    <FoodMerchantContext.Provider
      value={{
        restaurant,
        orders,
        financials,
        loading,
        refreshing,
        isAlarming,
        isOffline,
        isMerchantAuthorized,
        newOrdersCount,
        inProgressCount,
        deliveringCount,
        completedCount,
        cancelledCount,
        todayCompletedCount,
        todayRevenue,
        weekRevenue,
        todayOrdersCount,
        refreshProfile,
        refreshOrders,
        refreshFinancials,
        updateProfile,
        toggleOpen,
        confirmOrder,
        startPreparing,
        markReady,
        rejectOrder,
        getOrderById,
        stopAlarm,
        loginMerchant,
      }}
    >
      {children}
    </FoodMerchantContext.Provider>
  );
};

export const useFoodMerchant = () => {
  const context = useContext(FoodMerchantContext);
  if (!context) {
    throw new Error('useFoodMerchant phải được sử dụng bên trong FoodMerchantProvider');
  }
  return context;
};
