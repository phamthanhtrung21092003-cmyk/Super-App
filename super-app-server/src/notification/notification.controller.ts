import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from './dto/device-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Central Notification Center (V-Life Shared)')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('device-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng ký hoặc cập nhật FCM Push Token cho thiết bị hiện tại' })
  @ApiResponse({ status: 200, description: 'Đăng ký token thành công' })
  async registerDeviceToken(@Req() req: any, @Body() dto: RegisterDeviceTokenDto) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.registerDeviceToken(userId, dto);
  }

  @Delete('device-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy kích hoạt FCM Push Token khi đăng xuất' })
  @ApiResponse({ status: 200, description: 'Hủy kích hoạt token thành công' })
  async unregisterDeviceToken(@Req() req: any, @Body() dto: UnregisterDeviceTokenDto) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.unregisterDeviceToken(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng / đối tác hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getNotifications(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo là đã đọc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa thông báo người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.id;
    return this.notificationService.markAsRead(userId, id);
  }
}
