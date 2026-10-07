/**
 * rideSocketService.ts (super-app-driver)
 * ─────────────────────────────────────────────────────────
 * Unified WebSocket client for V-Life Driver App.
 * Kết nối đồng thời:
 * 1. Namespace /rides: Nhận cuốc Chở người (Ride) & Giao hàng (Delivery)
 * 2. Namespace /food:  Nhận đơn Giao đồ ăn (Food Delivery)
 *
 * MỘT TÀI KHOẢN TÀI XẾ & MỘT APP TÀI XẾ DUY NHẤT.
 * KHÔNG BAO GIỜ TỰ TẠO CUỐC ẢO. DỮ LIỆU TỪ BACKEND THẬT.
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

export interface IncomingFoodOrderPayload {
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
  dispatchedAt: string;
}

export interface UnifiedJobPayload {
  id: string; // tripId hoặc orderId
  jobType: 'RIDE' | 'DELIVERY' | 'FOOD';
  code: string;
  title: string;
  pickup: string;
  pickupName?: string;
  pickupPhone?: string;
  pickupLat: number;
  pickupLng: number;
  dropoff: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  earnings: number;
  finalAmount: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  restaurantName?: string;
  itemCount?: number;
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
  private foodSocket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 30;
  private lastJoinData: { driverId: string; lat?: number; lng?: number } | null = null;
  private currentTripId: string | null = null;
  private currentFoodOrderId: string | null = null;

  private getSocketUrl(): string {
    const apiUrl = getBaseURL();
    return apiUrl.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');
  }

  async connect(forcedToken?: string) {
    let token: string | null = forcedToken || (await AsyncStorage.getItem('accessToken'));
    if (!token) {
      token = await ensureDriverAuth();
    }

    const socketUrl = this.getSocketUrl();

    // 1. KẾT NỐI NAMESPACE /rides (Ride + Delivery)
    if (!this.socket?.connected) {
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
        console.log(`[DriverSocket:Rides] Connected. Socket ID: ${this.socket?.id}`);
        this.reconnectAttempts = 0;
        this.emit('_connected', { connected: true });

        if (this.lastJoinData) {
          this.socket?.emit('driver:join', this.lastJoinData);
        }
        if (this.currentTripId) {
          this.socket?.emit('trip:join', { tripId: this.currentTripId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`[DriverSocket:Rides] Disconnected: ${reason}`);
        this.emit('_disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        this.reconnectAttempts++;
        console.log(`[DriverSocket:Rides] Connect error (${this.reconnectAttempts}):`, error.message);
      });
    }

    // 2. KẾT NỐI NAMESPACE /food (Food Delivery)
    if (!this.foodSocket?.connected) {
      this.foodSocket = io(`${socketUrl}/food`, {
        auth: { token: token || undefined },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      this.foodSocket.on('connect', () => {
        console.log(`[DriverSocket:Food] Connected. Socket ID: ${this.foodSocket?.id}`);
        if (this.lastJoinData) {
          this.foodSocket?.emit('food.driver.join', {
            lat: this.lastJoinData.lat,
            lng: this.lastJoinData.lng,
          });
        }
        if (this.currentFoodOrderId) {
          this.foodSocket?.emit('food.order.join', { orderId: this.currentFoodOrderId });
        }
      });

      this.foodSocket.on('disconnect', (reason) => {
        console.log(`[DriverSocket:Food] Disconnected: ${reason}`);
      });

      this.foodSocket.on('connect_error', (error) => {
        console.log(`[DriverSocket:Food] Connect error:`, error.message);
      });
    }

    return this.socket;
  }

  disconnect() {
    this.lastJoinData = null;
    this.currentTripId = null;
    this.currentFoodOrderId = null;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.foodSocket) {
      this.foodSocket.emit('food.driver.leave');
      this.foodSocket.disconnect();
      this.foodSocket = null;
    }
  }

  get isConnected(): boolean {
    return (this.socket?.connected || this.foodSocket?.connected) ?? false;
  }

  async joinAsDriver(driverId: string, lat?: number, lng?: number) {
    this.lastJoinData = { driverId, lat, lng };
    if (!this.socket?.connected || !this.foodSocket?.connected) {
      await this.connect();
    }
    this.socket?.emit('driver:join', { driverId, lat, lng });
    this.foodSocket?.emit('food.driver.join', { lat, lng });
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

  joinFoodOrderRoom(orderId: string) {
    this.currentFoodOrderId = orderId;
    if (this.foodSocket?.connected) {
      this.foodSocket.emit('food.order.join', { orderId });
    }
  }

  leaveFoodOrderRoom(orderId: string) {
    this.currentFoodOrderId = null;
    if (this.foodSocket?.connected) {
      this.foodSocket.emit('food.order.leave', { orderId });
    }
  }

  sendDriverLocation(
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speed?: number,
    jobId?: string,
    jobType?: 'RIDE' | 'DELIVERY' | 'FOOD'
  ) {
    if (this.socket?.connected) {
      this.socket.emit('driver:location', {
        driverId,
        lat,
        lng,
        heading,
        speed,
        tripId: jobType !== 'FOOD' ? jobId : undefined,
      });
    }
    if (this.foodSocket?.connected) {
      this.foodSocket.emit('food.driver.location', {
        orderId: jobType === 'FOOD' ? jobId : undefined,
        lat,
        lng,
        heading,
        speed,
      });
    }
  }

  // ─────────────────────────────────────────
  // NHẬN CUỐC RIDE & DELIVERY (TƯƠNG THÍCH NGƯỢC)
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // NHẬN ĐƠN FOOD DELIVERY
  // ─────────────────────────────────────────
  onIncomingFoodOrder(callback: (order: IncomingFoodOrderPayload) => void) {
    if (!this.foodSocket || !this.foodSocket.connected) {
      this.connect().catch(() => {});
    }
    const handler = (data: IncomingFoodOrderPayload) => {
      if (data && data.orderId) {
        callback(data);
      }
    };
    this.foodSocket?.on('food.driver.order_available', handler);
    return () => this.foodSocket?.off('food.driver.order_available', handler);
  }

  // ─────────────────────────────────────────
  // NHẬN VIỆC HỢP NHẤT: RIDE + DELIVERY + FOOD
  // ─────────────────────────────────────────
  onIncomingJob(callback: (job: UnifiedJobPayload) => void) {
    // 1. Lắng nghe từ namespace /rides
    const unsubRide = this.onIncomingOrder((order) => {
      const isDelivery = order.serviceType?.toUpperCase() === 'DELIVERY';
      callback({
        id: order.tripId,
        jobType: isDelivery ? 'DELIVERY' : 'RIDE',
        code: order.bookingCode || `#VR-${order.tripId.slice(-4)}`,
        title: isDelivery ? 'Giao hàng Siêu Tốc V-Express' : 'Chở khách V-Ride',
        pickup: order.pickup,
        pickupLat: order.pickupLat,
        pickupLng: order.pickupLng,
        dropoff: order.dropoff,
        dropoffLat: order.dropoffLat,
        dropoffLng: order.dropoffLng,
        distanceKm: order.distanceKm,
        durationMin: order.durationMin,
        earnings: order.fareAmount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        dispatchedAt: order.dispatchedAt,
      });
    });

    // 2. Lắng nghe từ namespace /food
    const unsubFood = this.onIncomingFoodOrder((order) => {
      callback({
        id: order.orderId,
        jobType: 'FOOD',
        code: order.orderCode || `##FD-${order.orderId.slice(-4)}`,
        title: 'Giao đồ ăn V-Food',
        pickup: `${order.restaurantName} - ${order.restaurantAddress}`,
        pickupName: order.restaurantName,
        pickupLat: order.restaurantLat,
        pickupLng: order.restaurantLng,
        dropoff: order.deliveryAddress,
        dropoffLat: order.deliveryLat,
        dropoffLng: order.deliveryLng,
        distanceKm: order.distanceKm,
        durationMin: 20,
        earnings: order.shippingFee,
        finalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        customerName: order.deliveryAddress,
        customerPhone: '',
        restaurantName: order.restaurantName,
        itemCount: order.itemCount,
        dispatchedAt: order.dispatchedAt,
      });
    });

    return () => {
      unsubRide();
      unsubFood();
    };
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
    this.foodSocket?.on('connect', onConnect);
    this.foodSocket?.on('disconnect', onDisconnect);
    return () => {
      this.socket?.off('connect', onConnect);
      this.socket?.off('disconnect', onDisconnect);
      this.foodSocket?.off('connect', onConnect);
      this.foodSocket?.off('disconnect', onDisconnect);
    };
  }

  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach((h) => h(data));
  }
}

export const rideSocketService = new RideSocketService();
export default rideSocketService;
