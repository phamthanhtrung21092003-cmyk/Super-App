import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodOrderDto } from './dto/create-food-order.dto';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('restaurants')
  async getRestaurants(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    return this.foodService.getRestaurants(userLat, userLng);
  }

  @Get('restaurants/:id')
  async getRestaurantDetail(@Param('id') id: string) {
    return this.foodService.getRestaurantDetail(id);
  }

  @Post('calculate-fee')
  async calculateShippingFee(
    @Body('subtotal') subtotal: number,
    @Body('distanceKm') distanceKm: number,
  ) {
    return this.foodService.calculateShippingFee(subtotal || 0, distanceKm || 0);
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateFoodOrderDto) {
    return this.foodService.createOrder('user-demo', dto);
  }
}
