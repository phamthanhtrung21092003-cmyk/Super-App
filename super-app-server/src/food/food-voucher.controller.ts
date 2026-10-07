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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoodVoucherService } from './food-voucher.service';
import {
  CreateFoodVoucherDto,
  UpdateFoodVoucherDto,
  ValidateVoucherDto,
  FoodVouchersQueryDto,
} from './dto/food-voucher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Food Vouchers & Promotions')
@Controller('food')
export class FoodVoucherController {
  constructor(private readonly foodVoucherService: FoodVoucherService) {}

  /**
   * 1. API Khách hàng: Xác thực mã giảm giá trước khi đặt đơn
   */
  @Post('vouchers/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kiểm tra và tính toán giá trị giảm giá của Voucher' })
  async validateVoucher(
    @CurrentUser() user: { id: string },
    @Body() dto: ValidateVoucherDto,
  ) {
    return this.foodVoucherService.validateVoucher(user.id, dto);
  }

  /**
   * 2. API Khách hàng: Lấy danh sách voucher khả dụng (Toàn sàn + theo Quán)
   */
  @Get('vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách voucher khả dụng của người dùng' })
  async getAvailableVouchers(
    @CurrentUser() user: { id: string },
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.foodVoucherService.getAvailableVouchers(user.id, restaurantId);
  }

  /**
   * 3. API Chủ quán: Lấy danh sách voucher của quán mình
   */
  @Get('merchant/vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chủ quán lấy danh sách voucher khuyến mãi của quán' })
  async getMerchantVouchers(
    @CurrentUser() user: { id: string },
    @Query() query: FoodVouchersQueryDto,
  ) {
    return this.foodVoucherService.getMerchantVouchers(user.id, query);
  }

  /**
   * 4. API Chủ quán: Tạo voucher khuyến mãi mới cho quán
   */
  @Post('merchant/vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chủ quán tạo voucher khuyến mãi mới' })
  async createMerchantVoucher(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFoodVoucherDto,
  ) {
    return this.foodVoucherService.createMerchantVoucher(user.id, dto);
  }

  /**
   * 5. API Chủ quán: Chỉnh sửa voucher
   */
  @Put('merchant/vouchers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chủ quán cập nhật thông tin voucher' })
  async updateMerchantVoucher(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateFoodVoucherDto,
  ) {
    return this.foodVoucherService.updateMerchantVoucher(user.id, id, dto);
  }

  /**
   * 6. API Chủ quán: Bật / Tắt kích hoạt voucher
   */
  @Patch('merchant/vouchers/:id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bật / Tắt trạng thái kích hoạt voucher' })
  async toggleMerchantVoucher(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.foodVoucherService.toggleMerchantVoucher(user.id, id);
  }

  /**
   * 7. API Chủ quán: Xóa voucher
   */
  @Delete('merchant/vouchers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa voucher khuyến mãi' })
  async deleteMerchantVoucher(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.foodVoucherService.deleteMerchantVoucher(user.id, id);
  }
}
