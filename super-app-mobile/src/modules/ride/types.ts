/**
 * types.ts
 * ──────────────────────────────────────────────────────
 * Types cho module ride của App Khách hàng.
 * IRideService giữ lại cho mockRideService (không dùng production).
 * IRideRepository đã được cập nhật theo realRideService thật.
 * ──────────────────────────────────────────────────────
 */

import { Driver } from './services/mock/mockData/drivers';

// Re-export types từ realRideService để dùng chung
export type { TripData, CreateRidePayload, TripStatus } from './services/realRideService';

// ─── Legacy interface — chỉ dùng bởi mockRideService (mock mode đã tắt) ───
/** @deprecated Chỉ dùng trong mockRideService. Production dùng realRideService trực tiếp. */
export interface IRideService {
  getDrivers(lat: number, lng: number): Promise<Driver[]>;
  bookRide(
    pickup: string,
    dropoff: string,
    vehicleType: 'bike' | 'car',
  ): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }>;
  cancelRide(bookingId: string): Promise<void>;
}
