import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  recipientId: string;
  recipientType: 'USER' | 'PARTNER' | 'ADMIN';
  title: string;
  body: string;
  data?: Record<string, any>;
  eventKey?: string; // Khóa chống thông báo trùng lặp khi retry
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Khởi tạo và Lưu Thông báo vào Database (Tự động chống trùng)
   */
  async createNotification(dto: CreateNotificationDto) {
    // 1. CHỐNG THÔNG BÁO TRÙNG (IDEMPOTENCY CHECK)
    if (dto.eventKey) {
      const existingNotif = await this.prisma.notification.findFirst({
        where: {
          recipientId: dto.recipientId,
          data: {
            path: ['eventKey'],
            equals: dto.eventKey,
          },
        },
      });

      if (existingNotif) {
        this.logger.log(`Notification eventKey ${dto.eventKey} already sent. Skipping duplicate.`);
        return existingNotif;
      }
    }

    // 2. Tạo bản ghi Notification
    const notif = await this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        recipientType: dto.recipientType,
        title: dto.title,
        body: dto.body,
        data: {
          ...(dto.data || {}),
          eventKey: dto.eventKey || null,
        },
        isRead: false,
      },
    });

    this.logger.log(`Created Notification [${dto.recipientType}] for ${dto.recipientId}: ${dto.title}`);
    return notif;
  }

  /**
   * Danh sách Thông báo của Người dùng / Đối tác (Kiểm tra JWT)
   */
  async getUserNotifications(recipientId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  /**
   * Đếm số lượng thông báo chưa đọc
   */
  async getUnreadCount(recipientId: string) {
    const count = await this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(recipientId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    if (notif.recipientId !== recipientId) {
      throw new ForbiddenException('Bạn không có quyền đánh dấu thông báo của người khác');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(recipientId: string) {
    await this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}
