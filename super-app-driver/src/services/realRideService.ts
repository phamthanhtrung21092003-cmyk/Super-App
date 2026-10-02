/**
 * realRideService.ts (super-app-driver)
 * ─────────────────────────────────────────────────────────
 * REST API client for Driver operations.
 * Calls NestJS /api/v1/ride endpoints.
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

export async function toggleDriverOnline(driverId: string, isOnline: boolean) {
  const response = await apiClient.post('/ride/driver/toggle-online', { driverId, isOnline });
  return response.data;
}

export async function cancelTrip(tripId: string, reason?: string, cancelledBy?: string) {
  const response = await apiClient.post(`/ride/${tripId}/cancel`, {
    cancelReason: reason,
    cancelledBy: cancelledBy || 'driver',
  });
  return response.data;
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
  acceptRide,
  updateTripStatus,
  getDriverActiveTrip,
  toggleDriverOnline,
  cancelTrip,
  getDriverWallet,
  getDriverHistory,
};

export default realRideService;
