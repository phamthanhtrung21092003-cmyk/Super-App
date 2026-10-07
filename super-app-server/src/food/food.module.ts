import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { FoodMerchantController } from './merchant/food-merchant.controller';
import { FoodMerchantService } from './merchant/food-merchant.service';
import { FoodDriverController } from './driver/food-driver.controller';
import { FoodDriverService } from './driver/food-driver.service';
import { FoodReviewController } from './food-review.controller';
import { FoodReviewService } from './food-review.service';
import { FoodVoucherController } from './food-voucher.controller';
import { FoodVoucherService } from './food-voucher.service';
import { FoodSearchController } from './food-search.controller';
import { FoodSearchService } from './food-search.service';
import { FoodGateway } from './food.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [
    FoodController,
    FoodMerchantController,
    FoodDriverController,
    FoodReviewController,
    FoodVoucherController,
    FoodSearchController,
  ],
  providers: [
    FoodService,
    FoodMerchantService,
    FoodDriverService,
    FoodGateway,
    FoodReviewService,
    FoodVoucherService,
    FoodSearchService,
  ],
  exports: [
    FoodService,
    FoodMerchantService,
    FoodDriverService,
    FoodGateway,
    FoodReviewService,
    FoodVoucherService,
    FoodSearchService,
  ],
})
export class FoodModule {}
