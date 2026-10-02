/**
 * realRideService.ts
 * ──────────────────────────────────────────────────────
 * Service giao tiếp THỰC với Backend API (NestJS /api/v1/ride)
 * Thay thế mockRideService trong môi trường production.
 *
 * Mọi lỗi network sẽ được bắt và throw ra ngoài để UI xử lý.
 * ──────────────────────────────────────────────────────
 */

import apiClient from '../../../services/apiClient';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface CreateRidePayload {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType?: string; // 'bike' | 'ev' | 'car7' | 'suv'
  serviceType?: string; // 'RIDE' | 'DELIVERY'
  fareAmount?: number;
  distanceKm?: number;
  tipAmount?: number;
  paymentMethod?: string; // 'CASH' | 'SUPERPAY' | 'CARD' | 'QR'
  customerName?: string;
  customerPhone?: string;
}

export interface TripData {
  id: string;
  bookingCode: string;
  userId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  licensePlate?: string;
  avatarUrl?: string;
  driverRating?: number;
  serviceType: string;
  vehicleType: string;
  status: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  fareAmount: number;
  tipAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = 'SEARCHING' | 'ACCEPTED' | 'ARRIVED_PICKUP' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';

// ─────────────────────────────────────────
// CUSTOMER API calls
// ─────────────────────────────────────────

/** Tạo yêu cầu chuyến xe mới — trả về trip với id để track */
export async function createRideBooking(payload: CreateRidePayload, userId?: string): Promise<TripData> {
  const response = await apiClient.post('/ride/book', payload, {
    params: userId ? { userId } : undefined,
  });
  return response.data;
}

/** Lấy trip đang active của khách (SEARCHING/ACCEPTED/ARRIVED_PICKUP/IN_TRIP) */
export async function getCustomerActiveTrip(userId?: string): Promise<TripData | null> {
  try {
    const response = await apiClient.get('/ride/customer/active', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

/** Lấy chi tiết trip theo ID */
export async function getTripById(tripId: string): Promise<TripData> {
  const response = await apiClient.get(`/ride/${tripId}`);
  return response.data;
}

/** Hủy chuyến xe */
export async function cancelTrip(
  tripId: string,
  reason?: string,
  cancelledBy?: string,
): Promise<TripData> {
  const response = await apiClient.post(`/ride/${tripId}/cancel`, {
    cancelReason: reason,
    cancelledBy: cancelledBy || 'customer',
  });
  return response.data;
}

/** Khách đánh giá tài xế sau chuyến */
export async function rateDriver(
  tripId: string,
  rating: number,
  comment?: string,
  tags?: string[],
  tip?: number,
): Promise<TripData> {
  const response = await apiClient.post(`/ride/${tripId}/rating`, {
    rating,
    comment,
    tags,
    tip,
  });
  return response.data;
}

// ─────────────────────────────────────────
// DRIVER API calls
// ─────────────────────────────────────────

/** Tài xế lấy danh sách cuốc đang chờ (fallback khi socket chưa kết nối) */
export async function getPendingTrips(lat?: number, lng?: number): Promise<TripData[]> {
  const response = await apiClient.get('/ride/driver/pending', {
    params: { lat, lng },
  });
  return response.data;
}

/** Tài xế nhận cuốc xe */
export async function acceptRide(
  tripId: string,
  driverInfo: {
    driverId?: string;
    driverName?: string;
    vehicleName?: string;
    licensePlate?: string;
    avatarUrl?: string;
    rating?: number;
  },
): Promise<TripData> {
  const response = await apiClient.post(`/ride/${tripId}/accept`, driverInfo);
  return response.data;
}

/** Tài xế cập nhật trạng thái chuyến */
export async function updateTripStatus(
  tripId: string,
  status: TripStatus,
  extra?: {
    cancelReason?: string;
    driverRating?: number;
    driverReview?: string;
  },
): Promise<TripData> {
  const response = await apiClient.post(`/ride/${tripId}/status`, { status, ...extra });
  return response.data;
}

/** Tài xế cập nhật vị trí GPS (REST fallback) */
export async function updateDriverLocationRest(
  driverId: string,
  lat: number,
  lng: number,
  heading?: number,
): Promise<void> {
  await apiClient.post('/ride/driver/location', { driverId, lat, lng, heading });
}

/** Toggle tài xế online/offline */
export async function toggleDriverOnline(
  driverId: string,
  isOnline: boolean,
): Promise<{ driverId: string; isOnline: boolean }> {
  const response = await apiClient.post('/ride/driver/toggle-online', { driverId, isOnline });
  return response.data;
}

/** Lấy trip đang active của tài xế */
export async function getDriverActiveTrip(driverId?: string): Promise<TripData | null> {
  try {
    const response = await apiClient.get('/ride/driver/active', {
      params: driverId ? { driverId } : undefined,
    });
    return response.data;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    return null;
  }
}

/** Lấy ví tài xế */
export async function getDriverWallet(driverId?: string) {
  const response = await apiClient.get('/ride/driver/wallet', {
    params: driverId ? { driverId } : undefined,
  });
  return response.data;
}

/** Lịch sử chuyến của tài xế */
export async function getDriverHistory(driverId?: string): Promise<TripData[]> {
  const response = await apiClient.get('/ride/driver/history', {
    params: driverId ? { driverId } : undefined,
  });
  return response.data;
}

/** Nạp ví tài xế */
export async function topupDriverWallet(amount: number, driverId?: string) {
  const response = await apiClient.post('/ride/driver/wallet/topup', { amount, driverId });
  return response.data;
}

const realRideApiService = {
  // Customer
  createRideBooking,
  getCustomerActiveTrip,
  getTripById,
  cancelTrip,
  rateDriver,
  // Driver
  getPendingTrips,
  acceptRide,
  updateTripStatus,
  updateDriverLocationRest,
  toggleDriverOnline,
  getDriverActiveTrip,
  getDriverWallet,
  getDriverHistory,
  topupDriverWallet,
};

export default realRideApiService;
