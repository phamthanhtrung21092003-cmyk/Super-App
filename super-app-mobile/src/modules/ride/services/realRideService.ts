import apiClient from '../../../services/apiClient';
import { IRideService } from '../types';
import { Driver } from './mock/mockData/drivers';

export const realRideService: IRideService = {
  async getDrivers(lat: number, lng: number): Promise<Driver[]> {
    const response = await apiClient.get('/ride/drivers', {
      params: { lat, lng }
    });
    return response.data;
  },

  async bookRide(pickup: string, dropoff: string, vehicleType: 'bike' | 'car'): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }> {
    const response = await apiClient.post('/ride/bookings', {
      pickup,
      dropoff,
      vehicleType
    });
    return response.data;
  },

  async cancelRide(bookingId: string): Promise<void> {
    await apiClient.post(`/ride/bookings/${bookingId}/cancel`);
  }
};
