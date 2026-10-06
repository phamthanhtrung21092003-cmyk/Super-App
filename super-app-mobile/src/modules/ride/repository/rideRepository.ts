/**
 * rideRepository.ts
 * ──────────────────────────────────────────────────────
 * Repository layer cho App Khách hàng — Proxy qua realRideService thật.
 * Đã loại bỏ toàn bộ logic mock (getDrivers, bookRide cũ, cancelRide cũ).
 * ──────────────────────────────────────────────────────
 */

import realRideApiService, {
  CreateRidePayload,
  TripData,
} from '../services/realRideService';

export const rideRepository = {
  /** Tạo yêu cầu chuyến xe mới */
  async createRideBooking(payload: CreateRidePayload): Promise<TripData> {
    try {
      return await realRideApiService.createRideBooking(payload);
    } catch (error) {
      console.error('[RideRepository] Failed to create ride booking:', error);
      throw error;
    }
  },

  /** Lấy trip đang active của khách hàng */
  async getCustomerActiveTrip(): Promise<TripData | null> {
    try {
      return await realRideApiService.getCustomerActiveTrip();
    } catch (error) {
      console.error('[RideRepository] Failed to get active trip:', error);
      throw error;
    }
  },

  /** Lấy chi tiết trip theo ID */
  async getTripById(tripId: string): Promise<TripData> {
    try {
      return await realRideApiService.getTripById(tripId);
    } catch (error) {
      console.error(`[RideRepository] Failed to get trip ${tripId}:`, error);
      throw error;
    }
  },

  /** Hủy chuyến xe */
  async cancelTrip(tripId: string, reason?: string): Promise<TripData> {
    try {
      return await realRideApiService.cancelTrip(tripId, reason, 'customer');
    } catch (error) {
      console.error(`[RideRepository] Failed to cancel trip ${tripId}:`, error);
      throw error;
    }
  },

  /** Đánh giá tài xế sau chuyến */
  async rateDriver(
    tripId: string,
    rating: number,
    comment?: string,
    tags?: string[],
  ): Promise<TripData> {
    try {
      return await realRideApiService.rateDriver(tripId, rating, comment, tags);
    } catch (error) {
      console.error(`[RideRepository] Failed to rate driver for trip ${tripId}:`, error);
      throw error;
    }
  },
};

export default rideRepository;
