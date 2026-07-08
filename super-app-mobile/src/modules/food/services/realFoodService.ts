import apiClient from '../../../services/apiClient';
import { IFoodService } from '../types';
import { Restaurant } from './mock/mockData/restaurants';
import { FoodItem } from './mock/mockData/foods';

export const realFoodService: IFoodService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await apiClient.get('/food/restaurants');
    return response.data;
  },

  async getRestaurantDetail(id: string): Promise<Restaurant | undefined> {
    const response = await apiClient.get(`/food/restaurants/${id}`);
    return response.data;
  },

  async getMenu(restaurantId: string): Promise<FoodItem[]> {
    const response = await apiClient.get(`/food/restaurants/${restaurantId}/menu`);
    return response.data;
  },

  async placeFoodOrder(restaurantId: string, items: { foodId: string; quantity: number }[], note?: string): Promise<{ success: boolean; orderId: string; message: string }> {
    const response = await apiClient.post('/food/orders', {
      restaurantId,
      items,
      note
    });
    return response.data;
  }
};
