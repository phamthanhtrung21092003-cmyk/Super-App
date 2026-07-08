import { Driver } from './services/mock/mockData/drivers';

export interface IRideService {
  getDrivers(lat: number, lng: number): Promise<Driver[]>;
  bookRide(pickup: string, dropoff: string, vehicleType: 'bike' | 'car'): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }>;
  cancelRide(bookingId: string): Promise<void>;
}

export interface IRideRepository {
  getDrivers(lat: number, lng: number): Promise<Driver[]>;
  bookRide(pickup: string, dropoff: string, vehicleType: 'bike' | 'car'): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }>;
  cancelRide(bookingId: string): Promise<void>;
}
