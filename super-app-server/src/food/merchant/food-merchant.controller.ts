import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  VERSION_NEUTRAL 
} from '@nestjs/common';
import { FoodMerchantService } from './food-merchant.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RejectOrderDto } from './dto/reject-order.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ToggleOpenDto } from './dto/toggle-open.dto';
import {
  CreateOptionGroupStandaloneDto,
  UpdateOptionGroupDto,
  CreateOptionStandaloneDto,
  UpdateOptionDto,
} from './dto/manage-option.dto';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from './dto/manage-category.dto';
import { MerchantOrderHistoryQueryDto } from '../dto/order-history-query.dto';
import { FoodOrderStatus } from '@prisma/client';

@ApiTags('Food Merchant API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'food/merchant', version: ['1', VERSION_NEUTRAL] })
export class FoodMerchantController {
  constructor(private readonly merchantService: FoodMerchantService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ quán và cấu hình ngân hàng' })
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.merchantService.getRestaurantProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ quán, giờ mở cửa, tài khoản ngân hàng' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateRestaurantProfileDto,
  ) {
    return this.merchantService.updateRestaurantProfile(user.id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng thuộc quán ăn của Merchant đăng nhập' })
  @ApiQuery({ name: 'status', enum: FoodOrderStatus, required: false })
  async getOrders(
    @CurrentUser() user: { id: string },
    @Query('status') status?: FoodOrderStatus,
  ) {
    return this.merchantService.getOrders(user.id, status);
  }

  @Get('orders/history')
  @ApiOperation({ summary: 'Lịch sử đơn hàng của nhà hàng (Lọc theo thời gian & trạng thái, phân trang)' })
  async getOrderHistory(
    @CurrentUser() user: { id: string },
    @Query() query: MerchantOrderHistoryQueryDto,
  ) {
    return this.merchantService.getOrderHistory(user.id, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng cho Merchant' })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.getOrderById(user.id, id);
  }

  @Patch('orders/:id/confirm')
  @ApiOperation({ summary: 'Xác nhận tiếp nhận đơn hàng (PENDING -> CONFIRMED)' })
  async confirmOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.confirmOrder(user.id, id);
  }

  @Patch('orders/:id/reject')
  @ApiOperation({ summary: 'Từ chối đơn hàng với lý do bắt buộc (PENDING/CONFIRMED -> CANCELLED)' })
  async rejectOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RejectOrderDto,
  ) {
    return this.merchantService.rejectOrder(user.id, id, dto.reason);
  }

  @Patch('orders/:id/preparing')
  @ApiOperation({ summary: 'Quán bắt đầu chuẩn bị món (CONFIRMED -> PREPARING)' })
  async startPreparing(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.startPreparingOrder(user.id, id);
  }

  @Patch('orders/:id/ready')
  @ApiOperation({ summary: 'Báo đã làm xong món, sẵn sàng tìm tài xế giao (PREPARING -> FINDING_DRIVER)' })
  async markReady(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.markOrderReady(user.id, id);
  }

  @Get('menu')
  @ApiOperation({ summary: 'Lấy thực đơn và danh mục món ăn của quán' })
  async getMenu(@CurrentUser() user: { id: string }) {
    return this.merchantService.getMenu(user.id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Tạo danh mục món ăn mới cho quán' })
  async createCategory(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.merchantService.createCategory(user.id, dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Cập nhật danh mục món ăn' })
  async updateCategory(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.merchantService.updateCategory(user.id, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Xóa danh mục món ăn (các món ăn chuyển về chưa phân loại)' })
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.deleteCategory(user.id, id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Thêm món ăn mới vào thực đơn quán' })
  async createItem(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.merchantService.createItem(user.id, dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin món ăn trong thực đơn' })
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.merchantService.updateItem(user.id, id, dto);
  }

  @Patch('items/:id/toggle-stock')
  @ApiOperation({ summary: 'Bật/tắt trạng thái còn hàng/hết hàng của món ăn' })
  async toggleStock(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.toggleItemStock(user.id, id);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Xóa món ăn khỏi thực đơn' })
  async deleteItem(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.deleteMenuItem(user.id, id);
  }

  @Post('items/:itemId/option-groups')
  @ApiOperation({ summary: 'Tạo nhóm tùy chọn cho món ăn' })
  async createOptionGroup(
    @Param('itemId') itemId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOptionGroupStandaloneDto,
  ) {
    return this.merchantService.createOptionGroup(user.id, itemId, dto);
  }

  @Put('option-groups/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhóm tùy chọn' })
  async updateOptionGroup(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateOptionGroupDto,
  ) {
    return this.merchantService.updateOptionGroup(user.id, id, dto);
  }

  @Delete('option-groups/:id')
  @ApiOperation({ summary: 'Xóa nhóm tùy chọn' })
  async deleteOptionGroup(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.deleteOptionGroup(user.id, id);
  }

  @Post('option-groups/:groupId/options')
  @ApiOperation({ summary: 'Thêm tùy chọn vào nhóm tùy chọn' })
  async createOption(
    @Param('groupId') groupId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOptionStandaloneDto,
  ) {
    return this.merchantService.createOption(user.id, groupId, dto);
  }

  @Put('options/:id')
  @ApiOperation({ summary: 'Cập nhật tùy chọn' })
  async updateOption(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateOptionDto,
  ) {
    return this.merchantService.updateOption(user.id, id, dto);
  }

  @Delete('options/:id')
  @ApiOperation({ summary: 'Xóa tùy chọn' })
  async deleteOption(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.merchantService.deleteOption(user.id, id);
  }

  @Patch('toggle-open')
  @ApiOperation({ summary: 'Đóng/mở cửa nhà hàng và cấu hình tự động nhận đơn' })
  async toggleOpen(
    @CurrentUser() user: { id: string },
    @Body() dto: ToggleOpenDto,
  ) {
    return this.merchantService.toggleRestaurantOpen(user.id, dto.isOpen, dto.autoAcceptOrder);
  }

  @Get('financials')
  @ApiOperation({ summary: 'Thống kê báo cáo doanh thu tài chính từ snapshot đơn hàng hoàn tất' })
  async getFinancials(@CurrentUser() user: { id: string }) {
    return this.merchantService.getFinancials(user.id);
  }
}
