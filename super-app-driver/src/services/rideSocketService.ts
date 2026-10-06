/**
 * rideSocketService.ts (super-app-driver)
 * ─────────────────────────────────────────────────────────
 * WebSocket client for Driver App.
 * Kết nối /rides namespace trên server với JWT Authentication.
 *
 * CHỈ NHẬN CUỐC THẬT ĐƯỢC DISPATCH TỪ SERVER KHI KHÁCH ĐẶT XE.
 * KHÔNG BAO GIỜ TỰ TẠO CUỐC ẢO.
 * ─────────────────────────────────────────────────────────
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL, ensureDriverAuth } from './apiClient';

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
  profitScore?: number;
  dispatchedAt: string;
}

export interface TripStatusUpdatePayload {
  tripId: string;
  status: string;
  updatedAt: string;
  cancelReason?: string;
  cancelledBy?: string;
  fareAmount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  driverRating?: number;
  driverReview?: string;
}

class RideSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 30;
  private lastJoinData: { driverId: string; lat?: number; lng?: number } | null = null;
  private currentTripId: string | null = null;

  private getSocketUrl(): string {
    const apiUrl = getBaseURL();
    return apiUrl.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');
  }

  async connect(forcedToken?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    let token: string | null = forcedToken || (await AsyncStorage.getItem('accessToken'));
    if (!token) {
      token = await ensureDriverAuth();
    }

    const socketUrl = this.getSocketUrl();

    this.socket = io(`${socketUrl}/rides`, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log(`[DriverSocket] Connected successfully with auth token. Socket ID: ${this.socket?.id}`);
      this.reconnectAttempts = 0;
      this.emit('_connected', { connected: true });

      // Tự động re-join pool nếu trước đó đã join
      if (this.lastJoinData) {
        this.socket?.emit('driver:join', this.lastJoinData);
      }
      if (this.currentTripId) {
        this.socket?.emit('trip:join', { tripId: this.currentTripId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[DriverSocket] Disconnected: ${reason}`);
      this.emit('_disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.log(`[DriverSocket] Connect error (${this.reconnectAttempts}):`, error.message);
      this.emit('_error', { error: error.message, attempts: this.reconnectAttempts });
    });

    return this.socket;
  }

  disconnect() {
    this.lastJoinData = null;
    this.currentTripId = null;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  async joinAsDriver(driverId: string, lat?: number, lng?: number) {
    this.lastJoinData = { driverId, lat, lng };
    if (!this.socket || !this.socket.connected) {
      await this.connect();
    }
    this.socket?.emit('driver:join', { driverId, lat, lng });
  }

  joinTripRoom(tripId: string) {
    this.currentTripId = tripId;
    if (this.socket?.connected) {
      this.socket.emit('trip:join', { tripId });
    }
  }

  leaveTripRoom() {
    this.currentTripId = null;
  }

  sendDriverLocation(
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speed?: number,
    tripId?: string
  ) {
    if (!this.socket?.connected) return;
    this.socket.emit('driver:location', { driverId, lat, lng, heading, speed, tripId });
  }

  onIncomingOrder(callback: (order: IncomingOrderPayload) => void) {
    if (!this.socket || !this.socket.connected) {
      this.connect().catch(() => {});
    }
    const handler = (data: IncomingOrderPayload) => {
      if (data && data.tripId) {
        callback(data);
      }
    };
    this.socket?.on('ride:incoming_order', handler);
    return () => this.socket?.off('ride:incoming_order', handler);
  }

  onTripStatusUpdated(callback: (data: TripStatusUpdatePayload) => void) {
    const handler = (data: TripStatusUpdatePayload) => {
      callback(data);
    };
    this.socket?.on('trip:status_updated', handler);
    return () => this.socket?.off('trip:status_updated', handler);
  }

  onTripCancelledByCustomer(callback: (data: { tripId: string; reason: string }) => void) {
    const handler = (data: { tripId: string; reason: string }) => {
      callback(data);
    };
    this.socket?.on('trip:cancelled_by_customer', handler);
    return () => this.socket?.off('trip:cancelled_by_customer', handler);
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

  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach((h) => h(data));
  }
}

export const rideSocketService = new RideSocketService();
export default rideSocketService;
