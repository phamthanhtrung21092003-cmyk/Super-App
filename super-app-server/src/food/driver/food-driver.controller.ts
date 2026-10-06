import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { FoodDriverService } from './food-driver.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UpdateLocationDto, ToggleOnlineDto, CancelOrderDto } from './dto/driver-food.dto';
import { DriverFoodHistoryQueryDto } from '../dto/order-history-query.dto';

@ApiTags('Food Driver API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'food/driver', version: ['1', VERSION_NEUTRAL] })
export class FoodDriverController {
  constructor(private readonly driverService: FoodDriverService) {}

  @Patch('toggle-online')
  @ApiOperation({ summary: 'Tài xế bật/tắt trạng thái trực tuyến nhận cuốc' })
  async toggleOnline(
    @CurrentUser() user: { id: string },
    @Body() dto: ToggleOnlineDto,
  ) {
    return this.driverService.toggleOnline(user.id, dto.isOnline);
  }

  @Post('location')
  @ApiOperation({ summary: 'Tài xế gửi cập nhật vị trí GPS liên tục' })
  async updateLocation(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateLocationDto,
  ) {
    return this.driverService.updateLocation(
      user.id,
      dto.lat,
      dto.lng,
      dto.heading,
      dto.speed,
      dto.orderId,
    );
  }

  @Get('available-orders')
  @ApiOperation({ summary: 'Lấy danh sách các đơn đồ ăn đang chờ tài xế (FINDING_DRIVER)' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  async getAvailableOrders(
    @CurrentUser() user: { id: string },
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.driverService.getAvailableOrders(
      user.id,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
    );
  }

  @Get('active-order')
  @ApiOperation({ summary: 'Lấy đơn hàng đồ ăn hiện tại tài xế đang thực hiện' })
  async getActiveOrder(@CurrentUser() user: { id: string }) {
    return this.driverService.getActiveOrder(user.id);
  }

  @Get('order-history')
  @ApiOperation({ summary: 'Lịch sử giao hàng đồ ăn của tài xế (Alias)' })
  async getOrderHistory(
    @CurrentUser() user: { id: string },
    @Query() query: DriverFoodHistoryQueryDto,
  ) {
    return this.driverService.getOrderHistory(user.id, query);
  }

  @Get('orders/history')
  @ApiOperation({ summary: 'Lịch sử giao hàng đồ ăn của tài xế (Phân trang & Lọc)' })
  async getOrdersHistory(
    @CurrentUser() user: { id: string },
    @Query() query: DriverFoodHistoryQueryDto,
  ) {
    return this.driverService.getOrderHistory(user.id, query);
  }

  @Post('orders/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tài xế bấm tiếp nhận đơn đồ ăn (FINDING_DRIVER -> DRIVER_ACCEPTED)' })
  async acceptOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.driverService.acceptOrder(user.id, id);
  }

  @Patch('orders/:id/pickup')
  @ApiOperation({ summary: 'Tài xế đã đến quán và lấy món (DRIVER_ACCEPTED -> PICKED_UP)' })
  async pickupOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.driverService.pickupOrder(user.id, id);
  }

  @Patch('orders/:id/complete')
  @ApiOperation({ summary: 'Tài xế giao hàng thành công tới khách (PICKED_UP -> COMPLETED)' })
  async completeOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.driverService.completeOrder(user.id, id);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tài xế hủy đơn đã nhận khi chưa lấy món (DRIVER_ACCEPTED -> FINDING_DRIVER)' })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CancelOrderDto,
  ) {
    return this.driverService.cancelOrder(user.id, id, dto?.reason);
  }
}
