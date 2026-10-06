/**
 * foodSocketService.ts
 * ─────────────────────────────────────────────────────────
 * WebSocket client for V-Life Food realtime order tracking & notifications.
 * Kết nối Socket.io tới namespace /food trên server.
 *
 * - Xác thực JWT an toàn
 * - Tham gia/rời room theo orderId hoặc restaurantId
 * - Tự động reconnect và rejoin room
 * - Chống duplicate events với cache eventId
 * - Đồng bộ với Database là Single Source of Truth
 * ─────────────────────────────────────────────────────────
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from './apiClient';

export interface FoodOrderStatusChangedPayload {
  eventId: string;
  orderId: string;
  orderCode: string;
  status: string;
  previousStatus: string;
  timestamp: string;
  paymentStatus?: string;
  driverId?: string | null;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    licensePlate: string;
    vehicleType: string;
  } | null;
  reason?: string | null;
  cancelledBy?: string | null;
}

export interface FoodOrderCreatedPayload {
  eventId: string;
  orderId: string;
  orderCode: string;
  restaurantId: string;
  status: string;
  items: any[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  createdAt: string;
}

export interface FoodDriverOrderAvailablePayload {
  eventId: string;
  orderId: string;
  orderCode: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLat: number;
  restaurantLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  distanceKm: number;
  shippingFee: number;
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface FoodDriverLocationPayload {
  orderId: string;
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

class FoodSocketService {
  private socket: Socket | null = null;
  private activeOrderRooms: Set<string> = new Set();
  private activeRestaurantRooms: Set<string> = new Set();
  private seenEventIds: Set<string> = new Set();
  private statusListeners: Set<(payload: FoodOrderStatusChangedPayload) => void> = new Set();
  private createdListeners: Set<(payload: FoodOrderCreatedPayload) => void> = new Set();
  private driverAvailableListeners: Set<(payload: FoodDriverOrderAvailablePayload) => void> = new Set();
  private driverAcceptedListeners: Set<(payload: any) => void> = new Set();
  private driverLocationListeners: Set<(payload: FoodDriverLocationPayload) => void> = new Set();
  private errorListeners: Set<(error: any) => void> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private reconnectSyncCallbacks: Set<() => void> = new Set();
  private isDriverInPool: boolean = false;

  private getSocketUrl(): string {
    const apiUrl = getBaseURL();
    return apiUrl.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');
  }

  /**
   * Kiểm tra socket hiện có đang kết nối hay không
   */
  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  /**
   * Kết nối Socket với JWT Token
   */
  async connect(forcedToken?: string): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = forcedToken || (await AsyncStorage.getItem('accessToken'));
    const socketUrl = this.getSocketUrl();

    this.socket = io(`${socketUrl}/food`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log(`[FoodSocket] Đã kết nối Socket.io Food. ID: ${this.socket?.id}`);
      this.connectionListeners.forEach((cb) => cb(true));
      // Tự động rejoin lại các room đang theo dõi sau khi connect/reconnect
      this.rejoinRooms();
      // Kích hoạt đồng bộ lại trạng thái từ REST API (Single Source of Truth)
      this.reconnectSyncCallbacks.forEach((cb) => {
        try { cb(); } catch (e) { console.error('[FoodSocket] Lỗi sync callback:', e); }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`[FoodSocket] Mất kết nối: ${reason}`);
      this.connectionListeners.forEach((cb) => cb(false));
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[FoodSocket] Lỗi kết nối Socket:', err.message);
      this.connectionListeners.forEach((cb) => cb(false));
      this.errorListeners.forEach((cb) => cb(err));
    });

    this.socket.on('food.error', (err) => {
      console.warn('[FoodSocket] Server báo lỗi nghiệp vụ:', err);
      this.errorListeners.forEach((cb) => cb(err));
    });

    // Lắng nghe sự kiện trạng thái đơn hàng thay đổi
    this.socket.on('food.order.status_changed', (data: FoodOrderStatusChangedPayload) => {
      if (data?.eventId && this.seenEventIds.has(data.eventId)) {
        console.log(`[FoodSocket] Bỏ qua duplicate eventId: ${data.eventId}`);
        return;
      }
      if (data?.eventId) {
        this.addSeenEventId(data.eventId);
      }
      console.log(`[FoodSocket] Nhận trạng thái mới: #${data.orderCode} -> ${data.status}`);
      this.statusListeners.forEach((cb) => cb(data));
    });

    // Lắng nghe sự kiện đơn hàng mới (dành cho Merchant)
    this.socket.on('food.order.created', (data: FoodOrderCreatedPayload) => {
      if (data?.eventId && this.seenEventIds.has(data.eventId)) {
        return;
      }
      if (data?.eventId) {
        this.addSeenEventId(data.eventId);
      }
      console.log(`[FoodSocket] Nhận đơn hàng mới: #${data.orderCode}`);
      this.createdListeners.forEach((cb) => cb(data));
    });

    // Lắng nghe sự kiện đơn hàng đồ ăn mới sẵn sàng giao (dành cho Driver)
    this.socket.on('food.driver.order_available', (data: FoodDriverOrderAvailablePayload) => {
      if (data?.eventId && this.seenEventIds.has(data.eventId)) {
        return;
      }
      if (data?.eventId) {
        this.addSeenEventId(data.eventId);
      }
      console.log(`[FoodSocket] Nhận thông báo đơn đồ ăn cần giao: #${data.orderCode}`);
      this.driverAvailableListeners.forEach((cb) => cb(data));
    });

    // Lắng nghe sự kiện đơn hàng đã có tài xế nhận (dành cho Driver để ẩn pop-up)
    this.socket.on('food.driver.order_accepted', (data: any) => {
      this.driverAcceptedListeners.forEach((cb) => cb(data));
    });

    // Lắng nghe sự kiện cập nhật vị trí GPS tài xế
    this.socket.on('food.driver.location_updated', (data: FoodDriverLocationPayload) => {
      this.driverLocationListeners.forEach((cb) => cb(data));
    });

    return this.socket;
  }

  private addSeenEventId(eventId: string) {
    this.seenEventIds.add(eventId);
    if (this.seenEventIds.size > 200) {
      const first = Array.from(this.seenEventIds)[0];
      this.seenEventIds.delete(first);
    }
  }

  private rejoinRooms() {
    if (!this.socket?.connected) return;
    this.activeOrderRooms.forEach((orderId) => {
      this.socket?.emit('food.order.join', { orderId }, (res: any) => {
        console.log(`[FoodSocket] Rejoined order room: ${orderId}`, res);
      });
    });
    this.activeRestaurantRooms.forEach((restaurantId) => {
      this.socket?.emit('food.restaurant.join', { restaurantId }, (res: any) => {
        console.log(`[FoodSocket] Rejoined restaurant room: ${restaurantId}`, res);
      });
    });
  }

  /**
   * Tham gia theo dõi một đơn hàng
   */
  async joinOrderRoom(orderId: string): Promise<any> {
    this.activeOrderRooms.add(orderId);
    if (!this.socket?.connected) {
      await this.connect();
    }
    return new Promise((resolve) => {
      this.socket?.emit('food.order.join', { orderId }, (res: any) => {
        resolve(res);
      });
    });
  }

  /**
   * Rời khỏi phòng theo dõi đơn hàng
   */
  leaveOrderRoom(orderId: string) {
    this.activeOrderRooms.delete(orderId);
    if (this.socket?.connected) {
      this.socket.emit('food.order.leave', { orderId });
    }
  }

  /**
   * Merchant tham gia phòng nhận đơn của nhà hàng
   */
  async joinRestaurantRoom(restaurantId: string): Promise<any> {
    this.activeRestaurantRooms.add(restaurantId);
    if (!this.socket?.connected) {
      await this.connect();
    }
    return new Promise((resolve) => {
      this.socket?.emit('food.restaurant.join', { restaurantId }, (res: any) => {
        resolve(res);
      });
    });
  }

  /**
   * Merchant rời phòng nhận đơn
   */
  leaveRestaurantRoom(restaurantId: string) {
    this.activeRestaurantRooms.delete(restaurantId);
    if (this.socket?.connected) {
      this.socket.emit('food.restaurant.leave', { restaurantId });
    }
  }

  /**
   * Tài xế tham gia danh sách điều phối đơn đồ ăn (drivers_pool)
   */
  async joinDriversPool(lat?: number, lng?: number): Promise<any> {
    this.isDriverInPool = true;
    if (!this.socket?.connected) {
      await this.connect();
    }
    return new Promise((resolve) => {
      this.socket?.emit('food.driver.join', { lat, lng }, (res: any) => {
        resolve(res);
      });
    });
  }

  /**
   * Tài xế rời danh sách điều phối
   */
  leaveDriversPool() {
    this.isDriverInPool = false;
    if (this.socket?.connected) {
      this.socket.emit('food.driver.leave');
    }
  }

  /**
   * Tài xế gửi vị trí GPS liên tục
   */
  sendDriverLocation(data: { orderId?: string; lat: number; lng: number; heading?: number; speed?: number }) {
    if (this.socket?.connected) {
      this.socket.emit('food.driver.location', data);
    }
  }

  /**
   * Đăng ký callback khi có đơn đồ ăn mới cần giao (dành cho Driver)
   */
  onDriverOrderAvailable(callback: (payload: FoodDriverOrderAvailablePayload) => void) {
    this.driverAvailableListeners.add(callback);
    return () => {
      this.driverAvailableListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback khi đơn đã có tài xế khác nhận (để ẩn thông báo)
   */
  onDriverOrderAccepted(callback: (payload: any) => void) {
    this.driverAcceptedListeners.add(callback);
    return () => {
      this.driverAcceptedListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback khi nhận được tọa độ GPS mới của tài xế đang giao
   */
  onDriverLocationUpdated(callback: (payload: FoodDriverLocationPayload) => void) {
    this.driverLocationListeners.add(callback);
    return () => {
      this.driverLocationListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback khi trạng thái đơn thay đổi
   */
  onOrderStatusChanged(callback: (payload: FoodOrderStatusChangedPayload) => void) {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback khi có đơn mới tạo
   */
  onOrderCreated(callback: (payload: FoodOrderCreatedPayload) => void) {
    this.createdListeners.add(callback);
    return () => {
      this.createdListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback khi reconnect để sync lại với REST API
   */
  onReconnectSync(callback: () => void) {
    this.reconnectSyncCallbacks.add(callback);
    return () => {
      this.reconnectSyncCallbacks.delete(callback);
    };
  }

  /**
   * Đăng ký callback xử lý lỗi
   */
  onError(callback: (err: any) => void) {
    this.errorListeners.add(callback);
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  /**
   * Đăng ký callback theo dõi trạng thái kết nối Online / Offline
   */
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback);
    // Gọi ngay callback với trạng thái hiện tại
    callback(this.isConnected());
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  /**
   * Ngắt kết nối socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeOrderRooms.clear();
    this.activeRestaurantRooms.clear();
  }
}

export const foodSocketService = new FoodSocketService();
