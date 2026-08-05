import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
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
