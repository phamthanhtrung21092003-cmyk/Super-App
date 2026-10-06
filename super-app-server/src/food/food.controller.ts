import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodOrderDto, CancelFoodOrderDto, UpdateFoodOrderStatusDto } from './dto/create-food-order.dto';
import { UserOrderQueryDto } from './dto/order-history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Food Delivery')
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('restaurants')
  @ApiOperation({ summary: 'Lấy danh sách quán ăn kèm tính cước phí theo GPS người dùng' })
  async getRestaurants(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    return this.foodService.getRestaurants(userLat, userLng);
  }

  @Get('restaurants/:id')
  @ApiOperation({ summary: 'Lấy chi tiết quán ăn, danh mục, menu món, size và topping từ Database' })
  async getRestaurantDetail(@Param('id') id: string) {
    return this.foodService.getRestaurantDetail(id);
  }

  @Post('calculate-fee')
  @ApiOperation({ summary: 'Tính toán phí ship và điều kiện Freeship chuẩn xác' })
  async calculateShippingFee(
    @Body('subtotal') subtotal: number,
    @Body('distanceKm') distanceKm: number,
  ) {
    return this.foodService.calculateShippingFee(subtotal || 0, distanceKm || 0);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo đơn đặt đồ ăn mới (Transaction toàn phần, chống sửa giá, Idempotency)' })
  async createOrder(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFoodOrderDto,
  ) {
    return this.foodService.createOrder(user.id, dto);
  }

  @Patch('orders/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hủy đơn hàng (Áp dụng phân quyền chặt chẽ giữa User, Quán và Tài xế)' })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role?: string },
    @Body() dto: CancelFoodOrderDto,
  ) {
    return this.foodService.cancelOrder(id, user.id, dto.reason, user.role || 'USER');
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (State Machine Guard & Concurrency Lock)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role?: string },
    @Body() dto: UpdateFoodOrderStatusDto,
  ) {
    return this.foodService.updateOrderStatus(
      id,
      dto.status,
      user.id,
      user.role || 'MERCHANT',
      dto.note,
      dto.driverId,
    );
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng đồ ăn của người dùng (Phân trang & Lọc theo Tab)' })
  async getUserOrders(
    @CurrentUser() user: { id: string },
    @Query() query: UserOrderQueryDto,
  ) {
    return this.foodService.getUserOrders(user.id, query);
  }

  @Get('orders/my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng đồ ăn của người dùng (Alias)' })
  async getMyOrders(
    @CurrentUser() user: { id: string },
    @Query() query: UserOrderQueryDto,
  ) {
    return this.foodService.getUserOrders(user.id, query);
  }

  @Post('orders/:id/reorder-check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kiểm tra khả năng đặt lại đơn hàng cũ (Lấy giá & món mới nhất từ Database)' })
  async checkReorder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.foodService.checkReorder(id, user.id);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng (Yêu cầu xác thực & kiểm tra quyền sở hữu/phụ trách)' })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    return this.foodService.getOrderById(id, user.id, user.role);
  }
}

