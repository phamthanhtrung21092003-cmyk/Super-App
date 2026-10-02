export class CreateRideDto {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType?: string;
  serviceType?: string;
  fareAmount?: number;
  distanceKm?: number;
  tipAmount?: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
}

export class UpdateTripStatusDto {
  status: 'ACCEPTED' | 'ARRIVED_PICKUP' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';
  cancelReason?: string;
  driverRating?: number;
  driverReview?: string;
}

export class DriverLocationDto {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}
