/**
 * rideSocketService.ts
 * ─────────────────────────────────────────────────────────
 * WebSocket client for V-Life ride dispatch system.
 * Sử dụng socket.io-client để kết nối với /rides namespace trên server.
 *
 * DÙNG CHUNG cho cả App Người dùng (customer) VÀ App Tài xế (driver).
 * Mỗi phía join vào phòng khác nhau và nhận sự kiện khác nhau.
 *
 * SERVER: http://<ip>:5000 — namespace /rides
 * ─────────────────────────────────────────────────────────
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from './apiClient';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type TripStatus =
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'ARRIVED_PICKUP'
  | 'IN_TRIP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IncomingOrderPayload {
  tripId: string;
  bookingCode: string;
  serviceType: string;
  vehicleType: string;
  pickup: string;
  pickupLat: number;
  pickupLng: number;
  dropoff: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  fareAmount: number;
  finalAmount: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  profitScore: number;
  dispatchedAt: string;
}

export interface TripStatusUpdatePayload {
  tripId: string;
  status: TripStatus;
  updatedAt: string;
  // Fields populated on ACCEPTED
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  licensePlate?: string;
  avatarUrl?: string;
  driverRating?: number;
  etaMinutes?: number;
  // Fields on COMPLETED
  fareAmount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  // Fields on CANCELLED
  cancelReason?: string;
  cancelledBy?: string;
}

export interface DriverLocationPayload {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt: string;
}

// ─────────────────────────────────────────
// Socket Manager (Singleton)
// ─────────────────────────────────────────

class RideSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  /** Lấy URL WebSocket từ API base URL (chỉ lấy host:port) */
  private getSocketUrl(): string {
    const apiUrl = getBaseURL(); // e.g. http://192.168.12.109:5000/api/v1
    // Bỏ /api/v1 để lấy chỉ host
    return apiUrl.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');
  }

  /** Khởi tạo và kết nối socket */
  async connect(role: 'driver' | 'customer' = 'customer', forcedToken?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = forcedToken || (await AsyncStorage.getItem('accessToken'));
    const socketUrl = this.getSocketUrl();

    this.socket = io(`${socketUrl}/rides`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log(`[RideSocket] Connected as ${role}. ID: ${this.socket?.id}`);
      this.reconnectAttempts = 0;
      this.emit('_connected', { role });
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[RideSocket] Disconnected: ${reason}`);
      this.emit('_disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.log(`[RideSocket] Connection error (attempt ${this.reconnectAttempts}):`, error.message);
      this.emit('_error', { error: error.message, attempts: this.reconnectAttempts });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }

  // ─────────────────────────────────────────
  // DRIVER ACTIONS
  // ─────────────────────────────────────────

  /** Tài xế đăng ký nhận cuốc */
  joinAsDriver(driverId: string, lat?: number, lng?: number) {
    this.ensureConnected('driver');
    this.socket!.emit('driver:join', { driverId, lat, lng });
    this.socket!.on('driver:joined', (data: any) => {
      this.emit('driver:joined', data);
    });
  }

  /** Tài xế gửi vị trí GPS liên tục (gọi từ setInterval) */
  sendDriverLocation(driverId: string, lat: number, lng: number, heading?: number, speed?: number, tripId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('driver:location', { driverId, lat, lng, heading, speed, tripId });
  }

  /** Lắng nghe cuốc mới từ server */
  onIncomingOrder(callback: (order: IncomingOrderPayload) => void) {
    this.ensureConnected('driver');
    const handler = (data: IncomingOrderPayload) => {
      console.log('[RideSocket] Incoming order:', data.bookingCode);
      callback(data);
    };
    this.socket!.on('ride:incoming_order', handler);
    return () => this.socket?.off('ride:incoming_order', handler);
  }

  /** Tài xế nhận thông báo khách hủy */
  onTripCancelledByCustomer(callback: (data: { tripId: string; reason: string }) => void) {
    this.socket?.on('trip:cancelled_by_customer', callback);
    return () => this.socket?.off('trip:cancelled_by_customer', callback);
  }

  // ─────────────────────────────────────────
  // CUSTOMER ACTIONS
  // ─────────────────────────────────────────

  /** Khách hàng tham gia phòng theo dõi trip */
  joinTripRoom(tripId: string, userId?: string) {
    this.ensureConnected('customer');
    this.socket!.emit('trip:join', { tripId, userId });
  }

  /** Khách lắng nghe cập nhật trạng thái trip */
  onTripStatusUpdated(callback: (data: TripStatusUpdatePayload) => void) {
    const handler = (data: TripStatusUpdatePayload) => {
      console.log('[RideSocket] Trip status updated:', data.status);
      callback(data);
    };
    this.socket?.on('trip:status_updated', handler);
    return () => this.socket?.off('trip:status_updated', handler);
  }

  /** Khách lắng nghe vị trí tài xế realtime */
  onDriverLocationUpdate(callback: (data: DriverLocationPayload) => void) {
    this.socket?.on('trip:driver_location', callback);
    return () => this.socket?.off('trip:driver_location', callback);
  }

  // ─────────────────────────────────────────
  // SHARED / INTERNAL
  // ─────────────────────────────────────────

  private ensureConnected(role: 'driver' | 'customer') {
    if (!this.socket || !this.socket.connected) {
      this.connect(role);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach((h) => h(data));
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    const onConnect = () => callback(true);
    const onDisconnect = () => callback(false);
    this.socket?.on('connect', onConnect);
    this.socket?.on('disconnect', onDisconnect);
    return () => {
      this.socket?.off('connect', onConnect);
      this.socket?.off('disconnect', onDisconnect);
    };
  }
}

// Export singleton instance
export const rideSocketService = new RideSocketService();
export default rideSocketService;
