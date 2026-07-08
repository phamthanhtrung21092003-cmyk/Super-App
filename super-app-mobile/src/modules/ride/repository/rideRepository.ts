import { rideService } from '../services';
import { IRideRepository } from '../types';
import { Driver } from '../services/mock/mockData/drivers';

export const rideRepository: IRideRepository = {
  async getDrivers(lat: number, lng: number): Promise<Driver[]> {
    try {
      return await rideService.getDrivers(lat, lng);
    } catch (error) {
      console.error('[RideRepository] Failed to fetch drivers:', error);
      throw error;
    }
  },

  async bookRide(pickup: string, dropoff: string, vehicleType: 'bike' | 'car'): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }> {
    try {
      return await rideService.bookRide(pickup, dropoff, vehicleType);
    } catch (error: any) {
      console.error('[RideRepository] Failed to book ride:', error);
      throw error;
    }
  },

  async cancelRide(bookingId: string): Promise<void> {
    try {
      await rideService.cancelRide(bookingId);
    } catch (error) {
      console.error(`[RideRepository] Failed to cancel ride ${bookingId}:`, error);
      throw error;
    }
  }
};
export default rideRepository;
