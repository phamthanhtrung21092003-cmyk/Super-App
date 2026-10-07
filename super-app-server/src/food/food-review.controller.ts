import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoodReviewService } from './food-review.service';
import {
  CreateFoodReviewDto,
  RestaurantReviewsQueryDto,
  ItemReviewsQueryDto,
  DriverReviewsQueryDto,
} from './dto/food-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Food Rating & Reviews')
@Controller('food')
export class FoodReviewController {
  constructor(private readonly foodReviewService: FoodReviewService) {}

  @Post('orders/:orderId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gửi đánh giá đơn hàng đồ ăn (Nhà hàng, Món ăn, Tài xế)' })
  async createOrderReviews(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFoodReviewDto,
  ) {
    return this.foodReviewService.createOrderReviews(user.id, orderId, dto);
  }

  @Get('orders/:orderId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy trạng thái & nội dung đánh giá của đơn hàng' })
  async getOrderReviews(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.foodReviewService.getOrderReviews(user.id, orderId);
  }

  @Get('restaurants/:restaurantId/reviews')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của quán ăn kèm thống kê sao' })
  async getRestaurantReviews(
    @Param('restaurantId') restaurantId: string,
    @Query() query: RestaurantReviewsQueryDto,
  ) {
    return this.foodReviewService.getRestaurantReviews(restaurantId, query);
  }

  @Get('menu-items/:itemId/reviews')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá món ăn' })
  async getItemReviews(
    @Param('itemId') itemId: string,
    @Query() query: ItemReviewsQueryDto,
  ) {
    return this.foodReviewService.getItemReviews(itemId, query);
  }

  @Get('merchant/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Merchant xem đánh giá của nhà hàng mình sở hữu' })
  async getMerchantReviews(
    @CurrentUser() user: { id: string },
    @Query() query: RestaurantReviewsQueryDto,
  ) {
    return this.foodReviewService.getMerchantReviews(user.id, query);
  }

  @Get('driver/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tài xế xem đánh giá của mình từ khách hàng' })
  async getDriverReviews(
    @CurrentUser() user: { id: string },
    @Query() query: DriverReviewsQueryDto,
  ) {
    return this.foodReviewService.getDriverReviews(user.id, query);
  }
}
