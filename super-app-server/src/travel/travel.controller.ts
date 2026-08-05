import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Travel & Booking')
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khởi tạo đơn đặt dịch vụ (Booking)' })
  @ApiResponse({ status: 201, description: 'Tạo đơn đặt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc dịch vụ tạm ngưng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dịch vụ' })
  async createBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
    const userId = req.user.sub || req.user.id;
    return this.travelService.createBooking(userId, dto);
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy chi tiết đơn đặt dịch vụ (Kiểm tra quyền sở hữu)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem đơn hàng của người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getBookingById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.id;
    return this.travelService.getBookingById(userId, id);
  }
}
