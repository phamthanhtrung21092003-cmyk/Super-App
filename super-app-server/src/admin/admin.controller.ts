import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PaymentStatus, BookingStatus, PayoutStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Admin Payment & Reconciliation Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('financial-summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Báo cáo tổng quan doanh thu, hoa hồng V-life & Payout (Admin Dashboard)' })
  @ApiResponse({ status: 200, description: 'Lấy báo cáo thành công' })
  @ApiResponse({ status: 403, description: 'Yêu cầu quyền ADMIN' })
  async getFinancialSummary(@Query('filter') filter?: string) {
    return this.adminService.getFinancialSummary(filter);
  }

  @Get('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách đơn thanh toán (Payment Management)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getPayments(
    @Query('status') status?: PaymentStatus,
    @Query('provider') provider?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getPayments({ status, provider, search });
  }

  @Get('payments/:id/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lịch sử nhật ký Audit / PaymentEvent của đơn thanh toán' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getPaymentEvents(@Param('id') paymentId: string) {
    return this.adminService.getPaymentEvents(paymentId);
  }

  @Get('bookings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách đơn đặt dịch vụ (Booking Management & Search)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getBookings(
    @Query('status') status?: BookingStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getBookings({ status, search });
  }

  @Get('payouts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách giao dịch Payout cho Đối tác' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getPayouts(
    @Query('status') status?: PayoutStatus,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.adminService.getPayouts({ status, partnerId });
  }

  @Post('payouts/:id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thử lại giao dịch Payout bị lỗi (Admin Retry Payout)' })
  @ApiResponse({ status: 200, description: 'Thực thi thử lại Payout thành công' })
  async retryPayout(@Param('id') payoutId: string) {
    return this.adminService.retryPayout(payoutId);
  }

  @Get('reconciliation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dashboard đối soát 3 bên (Provider Webhook ↔ V-life DB ↔ Partner Payout)' })
  @ApiResponse({ status: 200, description: 'Báo cáo đối soát thành công' })
  async getReconciliation() {
    return this.adminService.getReconciliation();
  }

  @Get('partners/:id/finance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết số dư & lịch sử tài chính của 1 Đối tác cụ thể' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getPartnerFinanceDetail(@Param('id') partnerId: string) {
    return this.adminService.getPartnerFinanceDetail(partnerId);
  }
}
