import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Payment Service (V-Life Shared)')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khởi tạo đơn thanh toán (Payment Order & VietQR)' })
  @ApiResponse({ status: 201, description: 'Tạo đơn thanh toán thành công' })
  @ApiResponse({ status: 400, description: 'Đơn đặt không hợp lệ hoặc đã hết hạn giữ chỗ' })
  @ApiResponse({ status: 403, description: 'Không có quyền thanh toán cho đơn của người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt hàng' })
  async createPaymentOrder(@Req() req: any, @Body() dto: CreatePaymentOrderDto) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.createPaymentOrder(userId, dto);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tra cứu trạng thái thanh toán thời gian thực (Polling API)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền tra cứu đơn người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn thanh toán' })
  async getPaymentStatus(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.getPaymentStatus(userId, orderId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook tiếp nhận kết quả thanh toán từ Ngân hàng / Provider' })
  @ApiResponse({ status: 200, description: 'Xác minh và xử lý Webhook thành công' })
  @ApiResponse({ status: 400, description: 'Số tiền không khớp hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chữ ký bảo mật HMAC không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn thanh toán (orderId)' })
  async handlePaymentWebhook(
    @Headers() headers: Record<string, any>,
    @Body() dto: PaymentWebhookDto,
  ) {
    return this.paymentService.processWebhook(headers, dto);
  }
}
