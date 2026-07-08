import { Restaurant } from './services/mock/mockData/restaurants';
import { FoodItem } from './services/mock/mockData/foods';

export interface IFoodService {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantDetail(id: string): Promise<Restaurant | undefined>;
  getMenu(restaurantId: string): Promise<FoodItem[]>;
  placeFoodOrder(restaurantId: string, items: { foodId: string; quantity: number }[], note?: string): Promise<{ success: boolean; orderId: string; message: string }>;
}

export interface IFoodRepository {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantDetail(id: string): Promise<Restaurant | undefined>;
  getMenu(restaurantId: string): Promise<FoodItem[]>;
  placeFoodOrder(restaurantId: string, items: { foodId: string; quantity: number }[], note?: string): Promise<{ success: boolean; orderId: string; message: string }>;
}
