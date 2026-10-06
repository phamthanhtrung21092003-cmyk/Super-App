import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { FoodMerchantController } from './merchant/food-merchant.controller';
import { FoodMerchantService } from './merchant/food-merchant.service';
import { FoodDriverController } from './driver/food-driver.controller';
import { FoodDriverService } from './driver/food-driver.service';
import { FoodGateway } from './food.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [FoodController, FoodMerchantController, FoodDriverController],
  providers: [FoodService, FoodMerchantService, FoodDriverService, FoodGateway],
  exports: [FoodService, FoodMerchantService, FoodDriverService, FoodGateway],
})
export class FoodModule {}
