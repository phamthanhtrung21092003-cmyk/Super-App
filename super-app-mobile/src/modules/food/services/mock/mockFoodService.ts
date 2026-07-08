import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IFoodService } from '../../types';
import { MOCK_RESTAURANTS, Restaurant } from './mockData/restaurants';
import { MOCK_FOOD_ITEMS, FoodItem } from './mockData/foods';

export const mockFoodService: IFoodService = {
  async getRestaurants(): Promise<Restaurant[]> {
    await simulateLatency(400, 1000);
    simulateNetworkError(0.01);
    return MOCK_RESTAURANTS;
  },

  async getRestaurantDetail(id: string): Promise<Restaurant | undefined> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    return MOCK_RESTAURANTS.find(res => res.id === id);
  },

  async getMenu(restaurantId: string): Promise<FoodItem[]> {
    await simulateLatency(400, 1200);
    simulateNetworkError(0.01);
    return MOCK_FOOD_ITEMS.filter(item => item.restaurantId === restaurantId);
  },

  async placeFoodOrder(restaurantId: string, items: { foodId: string; quantity: number }[], note?: string): Promise<{ success: boolean; orderId: string; message: string }> {
    await simulateLatency(800, 1800);
    simulateNetworkError(0.02);
    return {
      success: true,
      orderId: 'fod_ord_' + Math.floor(Math.random() * 90000 + 10000),
      message: 'Đặt đơn hàng đồ ăn thành công!'
    };
  }
};
export default mockFoodService;
