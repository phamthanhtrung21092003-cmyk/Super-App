import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IRideService } from '../../types';
import { MOCK_DRIVERS, Driver } from './mockData/drivers';

export const mockRideService: IRideService = {
  async getDrivers(lat: number, lng: number): Promise<Driver[]> {
    await simulateLatency(400, 1000);
    simulateNetworkError(0.01);
    
    // Trả về danh sách tài xế available
    return MOCK_DRIVERS.filter(d => d.status === 'available');
  },

  async bookRide(pickup: string, dropoff: string, vehicleType: 'bike' | 'car'): Promise<{ success: boolean; bookingId: string; driver: Driver; price: number }> {
    await simulateLatency(1000, 2200); // Đợi tìm tài xế lâu hơn chút
    simulateNetworkError(0.02);

    const availableDrivers = MOCK_DRIVERS.filter(d => d.vehicleType === vehicleType && d.status === 'available');
    
    if (availableDrivers.length === 0) {
      throw new Error('Không tìm thấy tài xế khả dụng quanh khu vực của bạn.');
    }

    // Chọn ngẫu nhiên 1 tài xế khả dụng
    const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    const price = vehicleType === 'bike' ? 22000 : 75000; // Giá tượng trưng

    return {
      success: true,
      bookingId: 'bk_ord_' + Math.floor(Math.random() * 90000 + 10000),
      driver,
      price
    };
  },

  async cancelRide(bookingId: string): Promise<void> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    console.log('[MockRide] Cancelled booking:', bookingId);
    return Promise.resolve();
  }
};
export default mockRideService;
