import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Partner Finance & Payout Engine')
@Controller()
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get('partner/finance')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy báo cáo doanh thu, hoa hồng & ví đối tác (Partner Finance)' })
  @ApiResponse({ status: 200, description: 'Lấy báo cáo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin đối tác' })
  async getPartnerFinance(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.payoutService.getPartnerFinance(userId);
  }

  @Post('partner/payouts/:id/retry')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thử lại giao dịch Payout thất bại (Retry Payout)' })
  @ApiResponse({ status: 200, description: 'Thử lại Payout thành công' })
  @ApiResponse({ status: 400, description: 'Payout đã thành công trước đó' })
  @ApiResponse({ status: 403, description: 'Không có quyền thử lại Payout của đối tác khác' })
  async retryPayout(@Req() req: any, @Param('id') payoutId: string) {
    const userId = req.user.sub || req.user.id;
    return this.payoutService.retryPayout(userId, payoutId);
  }

  @Post('payouts/process/:bookingId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kích hoạt Payout thủ công / Trigger cho Booking đã PAID' })
  @ApiResponse({ status: 200, description: 'Xử lý Payout thành công' })
  async processPayout(@Param('bookingId') bookingId: string) {
    return this.payoutService.processPayoutForBooking(bookingId);
  }
}
