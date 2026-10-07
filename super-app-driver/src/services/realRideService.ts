/**
 * realRideService.ts (super-app-driver)
 * ─────────────────────────────────────────────────────────
 * REST API client for Unified Driver Operations (Ride + Delivery + Food).
 * ─────────────────────────────────────────────────────────
 */

import apiClient from './apiClient';

export interface DriverAcceptDto {
  driverId: string;
  driverName?: string;
  vehicleName?: string;
  licensePlate?: string;
  avatarUrl?: string;
  rating?: number;
}

// ─────────────────────────────────────────
// 1. RIDE & GENERAL DELIVERY OPERATIONS
// ─────────────────────────────────────────

export async function acceptRide(tripId: string, driverInfo: DriverAcceptDto) {
  const response = await apiClient.post(`/ride/${tripId}/accept`, driverInfo);
  return response.data;
}

export async function updateTripStatus(
  tripId: string,
  status: 'ACCEPTED' | 'ARRIVED_PICKUP' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED',
  extra?: { cancelReason?: string; driverRating?: number; driverReview?: string }
) {
  const response = await apiClient.post(`/ride/${tripId}/status`, { status, ...extra });
  return response.data;
}

export async function getDriverActiveTrip(driverId: string = 'driver-demo-1') {
  try {
    const response = await apiClient.get('/ride/driver/active', {
      params: { driverId },
    });
    return response.data;
  } catch (e: any) {
    return null;
  }
}

export async function cancelTrip(tripId: string, reason?: string, cancelledBy?: string) {
  const response = await apiClient.post(`/ride/${tripId}/cancel`, {
    cancelReason: reason,
    cancelledBy: cancelledBy || 'driver',
  });
  return response.data;
}

export async function getPendingTrips(lat?: number, lng?: number) {
  const response = await apiClient.get('/ride/driver/pending', {
    params: { lat, lng },
  });
  return response.data;
}

export async function getTripById(tripId: string) {
  const response = await apiClient.get(`/ride/${tripId}`);
  return response.data;
}

// ─────────────────────────────────────────
// 2. FOOD DELIVERY OPERATIONS
// ─────────────────────────────────────────

export async function acceptFoodOrder(orderId: string) {
  const response = await apiClient.post(`/food/driver/orders/${orderId}/accept`);
  return response.data;
}

export async function pickupFoodOrder(orderId: string) {
  const response = await apiClient.patch(`/food/driver/orders/${orderId}/pickup`);
  return response.data;
}

export async function completeFoodOrder(orderId: string) {
  const response = await apiClient.patch(`/food/driver/orders/${orderId}/complete`);
  return response.data;
}

export async function cancelFoodOrder(orderId: string, reason?: string) {
  const response = await apiClient.post(`/food/driver/orders/${orderId}/cancel`, {
    reason: reason || 'Tài xế hủy nhận đơn',
  });
  return response.data;
}

export async function getActiveFoodOrder() {
  try {
    const response = await apiClient.get('/food/driver/active-order');
    return response.data;
  } catch (e: any) {
    return null;
  }
}

// ─────────────────────────────────────────
// 3. UNIFIED DRIVER OPERATIONS (HỢP NHẤT)
// ─────────────────────────────────────────

export async function getDriverActiveJob() {
  try {
    // 1. Thử gọi API hợp nhất mới
    const response = await apiClient.get('/driver/active-job');
    if (response.data && response.data.hasActiveJob) {
      return response.data;
    }
  } catch (e) {
    // Fallback nếu API chưa sẵn sàng
  }

  // 2. Fallback kiểm tra Ride
  const ride = await getDriverActiveTrip();
  if (ride && ride.id) {
    return {
      hasActiveJob: true,
      jobType: ride.serviceType?.toUpperCase() === 'DELIVERY' ? 'DELIVERY' : 'RIDE',
      jobId: ride.id,
      code: ride.bookingCode,
      status: ride.status,
      raw: ride,
    };
  }

  // 3. Fallback kiểm tra Food
  const food = await getActiveFoodOrder();
  if (food && food.id) {
    return {
      hasActiveJob: true,
      jobType: 'FOOD',
      jobId: food.id,
      code: food.orderCode,
      status: food.status,
      raw: food,
    };
  }

  return { hasActiveJob: false };
}

export async function getAvailableJobs(lat?: number, lng?: number) {
  try {
    const response = await apiClient.get('/driver/available-jobs', {
      params: { lat, lng },
    });
    return Array.isArray(response.data) ? response.data : (response.data?.jobs || []);
  } catch (e) {
    return [];
  }
}

export async function toggleDriverOnline(driverId: string, isOnline: boolean) {
  // Gọi đồng bộ endpoint hợp nhất hoặc ride endpoint
  try {
    const res = await apiClient.post('/driver/toggle-online', { isOnline });
    return res.data;
  } catch (e) {
    const response = await apiClient.post('/ride/driver/toggle-online', { driverId, isOnline });
    return response.data;
  }
}

export async function getDriverWallet(driverId: string = 'driver-demo-1') {
  const response = await apiClient.get('/ride/driver/wallet', {
    params: { driverId },
  });
  return response.data;
}

export async function getDriverHistory(driverId: string = 'driver-demo-1') {
  const response = await apiClient.get('/ride/driver/history', {
    params: { driverId },
  });
  return response.data;
}

const realRideService = {
  // Ride
  acceptRide,
  updateTripStatus,
  getDriverActiveTrip,
  cancelTrip,
  getPendingTrips,
  getTripById,

  // Food
  acceptFoodOrder,
  pickupFoodOrder,
  completeFoodOrder,
  cancelFoodOrder,
  getActiveFoodOrder,

  // Unified
  getDriverActiveJob,
  getAvailableJobs,
  toggleDriverOnline,
  getDriverWallet,
  getDriverHistory,
};

export default realRideService;
