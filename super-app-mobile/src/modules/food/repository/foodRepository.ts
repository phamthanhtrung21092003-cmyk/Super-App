import { foodService } from '../services';
import { IFoodRepository } from '../types';
import { Restaurant } from '../services/mock/mockData/restaurants';
import { FoodItem } from '../services/mock/mockData/foods';

// Có thể mở rộng để cache danh sách nhà hàng nhằm tăng tốc độ tải
let cachedRestaurants: Restaurant[] | null = null;

export const foodRepository: IFoodRepository = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      // Nếu đã cache và ở chế độ offline, có thể trả về ngay
      if (cachedRestaurants) {
        return cachedRestaurants;
      }
      const data = await foodService.getRestaurants();
      cachedRestaurants = data;
      return data;
    } catch (error) {
      console.error('[FoodRepository] Failed to get restaurants:', error);
      throw error;
    }
  },

  async getRestaurantDetail(id: string): Promise<Restaurant | undefined> {
    try {
      if (cachedRestaurants) {
        const found = cachedRestaurants.find(res => res.id === id);
        if (found) return found;
      }
      return await foodService.getRestaurantDetail(id);
    } catch (error) {
      console.error(`[FoodRepository] Failed to get restaurant ${id}:`, error);
      throw error;
    }
  },

  async getMenu(restaurantId: string): Promise<FoodItem[]> {
    try {
      return await foodService.getMenu(restaurantId);
    } catch (error) {
      console.error(`[FoodRepository] Failed to get menu for restaurant ${restaurantId}:`, error);
      throw error;
    }
  },

  async placeFoodOrder(restaurantId: string, items: { foodId: string; quantity: number }[], note?: string): Promise<{ success: boolean; orderId: string; message: string }> {
    try {
      return await foodService.placeFoodOrder(restaurantId, items, note);
    } catch (error) {
      console.error('[FoodRepository] Failed to place food order:', error);
      return {
        success: false,
        orderId: '',
        message: 'Không thể đặt đơn hàng. Vui lòng kết nối mạng thử lại.'
      };
    }
  }
};
export default foodRepository;
