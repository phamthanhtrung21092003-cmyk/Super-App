import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from './fcm.service';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from './dto/device-token.dto';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. DEVICE PUSH TOKEN MANAGEMENT (MULTI-DEVICE & LIFECYCLE)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Đăng ký hoặc làm mới FCM Device Token
   */
  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    const platform = dto.platform || 'android';
    const appRole = dto.appRole || 'CUSTOMER';

    try {
      // 1. Nếu token này từng được liên kết ở chỗ khác -> cập nhật lại cho user & device hiện tại
      const existingByToken = await this.prisma.devicePushToken.findUnique({
        where: { token: dto.token },
      });

      if (existingByToken) {
        const updated = await this.prisma.devicePushToken.update({
          where: { token: dto.token },
          data: {
            userId,
            deviceId: dto.deviceId,
            platform,
            appRole,
            isActive: true,
            lastSeenAt: new Date(),
          },
        });
        this.logger.log(`Updated FCM token for user ${userId} [${appRole}] on device ${dto.deviceId}`);
        return updated;
      }

      // 2. Upsert theo cặp định danh (userId, deviceId, appRole)
      const tokenRecord = await this.prisma.devicePushToken.upsert({
        where: {
          userId_deviceId_appRole: {
            userId,
            deviceId: dto.deviceId,
            appRole,
          },
        },
        update: {
          token: dto.token,
          platform,
          isActive: true,
          lastSeenAt: new Date(),
        },
        create: {
          userId,
          deviceId: dto.deviceId,
          token: dto.token,
          platform,
          appRole,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });

      this.logger.log(`Registered FCM token for user ${userId} [${appRole}] on device ${dto.deviceId}`);
      return tokenRecord;
    } catch (error: any) {
      this.logger.error(`Lỗi đăng ký Device Push Token cho user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hủy kích hoạt Push Token khi người dùng logout
   */
  async unregisterDeviceToken(userId: string, dto: UnregisterDeviceTokenDto) {
    try {
      if (dto.token) {
        await this.prisma.devicePushToken.updateMany({
          where: { token: dto.token, userId },
          data: { isActive: false },
        });
      } else if (dto.deviceId) {
        await this.prisma.devicePushToken.updateMany({
          where: {
            userId,
            deviceId: dto.deviceId,
            ...(dto.appRole ? { appRole: dto.appRole } : {}),
          },
          data: { isActive: false },
        });
      } else {
        // Hủy toàn bộ token active của user trên role đó (hoặc tất cả)
        await this.prisma.devicePushToken.updateMany({
          where: {
            userId,
            ...(dto.appRole ? { appRole: dto.appRole } : {}),
          },
          data: { isActive: false },
        });
      }

      this.logger.log(`Deactivated push tokens for user ${userId}`);
      return { success: true, message: 'Đã hủy kích hoạt token thành công' };
    } catch (error: any) {
      this.logger.error(`Lỗi hủy Device Push Token cho user ${userId}: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Lấy danh sách token active của một người dùng
   */
  async getUserActiveTokens(userId: string, appRole?: string): Promise<string[]> {
    const records = await this.prisma.devicePushToken.findMany({
      where: {
        userId,
        isActive: true,
        ...(appRole ? { appRole } : {}),
      },
      select: { token: true },
    });

    return records.map((r) => r.token);
  }

  /**
   * Vô hiệu hóa các token hỏng/hết hạn
   */
  async deactivateTokens(tokens: string[]): Promise<void> {
    if (!tokens || tokens.length === 0) return;
    try {
      await this.prisma.devicePushToken.updateMany({
        where: { token: { in: tokens } },
        data: { isActive: false },
      });
      this.logger.log(`Deactivated ${tokens.length} invalid/expired FCM tokens.`);
    } catch (error: any) {
      this.logger.warn(`Không thể deactivate invalid tokens: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. CENTRAL NOTIFICATION CENTER & IDEMPOTENT CREATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Khởi tạo và Lưu Thông báo vào Database (Tự động chống trùng Idempotency)
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
        this.logger.log(`Notification eventKey "${dto.eventKey}" already sent to ${dto.recipientId}. Skipping duplicate.`);
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

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. HIGH-LEVEL PUSH DISPATCH FOR V-LIFE FOOD
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Gửi Push Notification tới 1 User cụ thể kèm lưu Notification Center
   */
  async sendPushToUser(
    userId: string,
    appRole: 'CUSTOMER' | 'MERCHANT' | 'DRIVER',
    notification: CreateNotificationDto,
  ) {
    try {
      // 1. Lưu vào Database (Notification Center) - có chống trùng
      const savedNotif = await this.createNotification(notification);

      // 2. Tìm các token active của user trên vai trò appRole
      const tokens = await this.getUserActiveTokens(userId, appRole);

      if (tokens.length > 0) {
        // 3. Bắn Push qua FCM
        const result = await this.fcmService.sendMulticast(tokens, {
          title: notification.title,
          body: notification.body,
          data: {
            ...(notification.data || {}),
            notificationId: savedNotif.id,
            appRole,
          },
        });

        // 4. Nếu có token hỏng/hết hạn -> cập nhật isActive = false
        if (result.invalidTokens && result.invalidTokens.length > 0) {
          await this.deactivateTokens(result.invalidTokens);
        }
      }

      return savedNotif;
    } catch (error: any) {
      this.logger.warn(`Lỗi khi gửi Push tới User ${userId} [${appRole}] (Silent catch): ${error.message}`);
      return null;
    }
  }

  /**
   * Gửi Push Notification tới danh sách tài xế (Food Driver Pool)
   */
  async sendPushToDriverPool(
    driverUserIds: string[],
    notification: { title: string; body: string; data?: Record<string, any>; eventKey?: string },
  ) {
    try {
      if (!driverUserIds || driverUserIds.length === 0) return;

      // 1. Lấy tất cả token active của các tài xế
      const tokensRecords = await this.prisma.devicePushToken.findMany({
        where: {
          userId: { in: driverUserIds },
          appRole: 'DRIVER',
          isActive: true,
        },
        select: { token: true, userId: true },
      });

      const tokens = tokensRecords.map((r) => r.token);

      // 2. Gửi FCM Multicast
      if (tokens.length > 0) {
        const result = await this.fcmService.sendMulticast(tokens, {
          title: notification.title,
          body: notification.body,
          data: {
            ...(notification.data || {}),
            appRole: 'DRIVER',
          },
        });

        if (result.invalidTokens && result.invalidTokens.length > 0) {
          await this.deactivateTokens(result.invalidTokens);
        }
      }
    } catch (error: any) {
      this.logger.warn(`Lỗi gửi Push tới Driver Pool (Silent catch): ${error.message}`);
    }
  }

  /**
   * Gửi Food Push Notification tích hợp chuẩn vòng đời đơn hàng
   * Không bao giờ leak thông tin tài chính nhạy cảm.
   * Chống trùng lặp tuyệt đối.
   */
  async sendFoodOrderPush(order: any, eventType: string, extra?: { reason?: string; cancelledBy?: string }) {
    try {
      const orderId = order.id;
      const orderCode = order.orderCode || orderId.substring(0, 8);
      const restaurantName = order.restaurant?.name || 'Nhà hàng';

      // ─────────────────────────────────────────────────────────────
      // A. EVENT: ĐƠN HÀNG MỚI (TẠO ĐƠN) -> GỬI PUSH CHO QUÁN
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_CREATED') {
        const merchantOwnerId = order.restaurant?.ownerId;
        if (merchantOwnerId) {
          const eventKey = `food_${orderId}_ORDER_CREATED_MERCHANT`;
          await this.sendPushToUser(merchantOwnerId, 'MERCHANT', {
            recipientId: merchantOwnerId,
            recipientType: 'PARTNER',
            title: `🔔 Đơn hàng mới #${orderCode}`,
            body: `Bạn vừa nhận được đơn mới (${order.items?.length || 1} món). Vui lòng xác nhận ngay!`,
            data: {
              orderId,
              orderCode,
              status: order.status,
              role: 'MERCHANT',
              deepLink: `/(merchant)/orders/${orderId}`,
              eventKey,
            },
            eventKey,
          });
        }
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // B. EVENT: QUÁN XÁC NHẬN (CONFIRMED) -> GỬI KHÁCH
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_CONFIRMED' || (eventType === 'STATUS_CHANGED' && order.status === 'CONFIRMED')) {
        const eventKey = `food_${orderId}_CONFIRMED_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Quán đã nhận đơn #${orderCode}`,
          body: `${restaurantName} đã xác nhận đơn hàng của bạn.`,
          data: {
            orderId,
            orderCode,
            status: 'CONFIRMED',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey,
          },
          eventKey,
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // C. EVENT: QUÁN ĐANG NẤU (PREPARING) -> GỬI KHÁCH
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_PREPARING' || (eventType === 'STATUS_CHANGED' && order.status === 'PREPARING')) {
        const eventKey = `food_${orderId}_PREPARING_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Đang chuẩn bị món #${orderCode}`,
          body: `${restaurantName} đang chế biến món ăn ngon cho bạn.`,
          data: {
            orderId,
            orderCode,
            status: 'PREPARING',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey,
          },
          eventKey,
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // D. EVENT: TÌM TÀI XẾ (FINDING_DRIVER) -> GỬI KHÁCH & GỬI POOL TÀI XẾ
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_FINDING_DRIVER' || (eventType === 'STATUS_CHANGED' && order.status === 'FINDING_DRIVER')) {
        // 1. Báo khách: Món đã xong, đang kết nối tài xế
        const custEventKey = `food_${orderId}_FINDING_DRIVER_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Đang tìm tài xế giao đơn #${orderCode}`,
          body: `Món ăn đã chuẩn bị xong! Hệ thống đang điều phối tài xế gần bạn nhất.`,
          data: {
            orderId,
            orderCode,
            status: 'FINDING_DRIVER',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey: custEventKey,
          },
          eventKey: custEventKey,
        });

        // 2. Tìm tài xế ONLINE trong hệ thống để bắn push
        const onlineDrivers = await this.prisma.driver.findMany({
          where: { isOnline: true },
          select: { id: true },
          take: 20,
        });

        if (onlineDrivers.length > 0) {
          const driverIds = onlineDrivers.map((d) => d.id);
          const driverEventKey = `food_${orderId}_FINDING_DRIVER_POOL`;
          await this.sendPushToDriverPool(driverIds, {
            title: `🚗 Có đơn giao Food mới!`,
            body: `Đơn #${orderCode} từ ${restaurantName}. Chạm để nhận đơn ngay!`,
            data: {
              orderId,
              orderCode,
              status: 'FINDING_DRIVER',
              role: 'DRIVER',
              deepLink: `/(driver)/orders/${orderId}`,
              eventKey: driverEventKey,
            },
            eventKey: driverEventKey,
          });
        }
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // E. EVENT: TÀI XẾ ĐÃ NHẬN (DRIVER_ACCEPTED) -> GỬI KHÁCH & QUÁN
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_DRIVER_ACCEPTED' || (eventType === 'STATUS_CHANGED' && order.status === 'DRIVER_ACCEPTED')) {
        const driverName = order.driver?.fullName || 'Tài xế V-Life';

        // 1. Gửi Khách
        const custEventKey = `food_${orderId}_DRIVER_ACCEPTED_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Tài xế đã nhận đơn #${orderCode}`,
          body: `${driverName} đang di chuyển đến nhà hàng để nhận món.`,
          data: {
            orderId,
            orderCode,
            status: 'DRIVER_ACCEPTED',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey: custEventKey,
          },
          eventKey: custEventKey,
        });

        // 2. Gửi Quán
        const merchantOwnerId = order.restaurant?.ownerId;
        if (merchantOwnerId) {
          const merchEventKey = `food_${orderId}_DRIVER_ACCEPTED_MERCHANT`;
          await this.sendPushToUser(merchantOwnerId, 'MERCHANT', {
            recipientId: merchantOwnerId,
            recipientType: 'PARTNER',
            title: `Tài xế đã nhận cuốc #${orderCode}`,
            body: `${driverName} đang đến quán để lấy món.`,
            data: {
              orderId,
              orderCode,
              status: 'DRIVER_ACCEPTED',
              role: 'MERCHANT',
              deepLink: `/(merchant)/orders/${orderId}`,
              eventKey: merchEventKey,
            },
            eventKey: merchEventKey,
          });
        }
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // F. EVENT: ĐÃ LẤY MÓN (PICKED_UP) -> GỬI KHÁCH
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_PICKED_UP' || (eventType === 'STATUS_CHANGED' && order.status === 'PICKED_UP')) {
        const driverName = order.driver?.fullName || 'Tài xế';
        const custEventKey = `food_${orderId}_PICKED_UP_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Tài xế đang giao đơn #${orderCode}`,
          body: `${driverName} đã lấy món và đang trên đường giao tới bạn. Hãy để ý điện thoại nhé!`,
          data: {
            orderId,
            orderCode,
            status: 'PICKED_UP',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey: custEventKey,
          },
          eventKey: custEventKey,
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // G. EVENT: HOÀN TẤT (COMPLETED) -> GỬI KHÁCH & QUÁN
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_COMPLETED' || (eventType === 'STATUS_CHANGED' && order.status === 'COMPLETED')) {
        // 1. Gửi Khách
        const custEventKey = `food_${orderId}_COMPLETED_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Đơn hàng #${orderCode} đã giao thành công! 🎉`,
          body: `Cảm ơn bạn đã đặt món tại V-Life Food. Chúc bạn có một bữa ăn ngon miệng!`,
          data: {
            orderId,
            orderCode,
            status: 'COMPLETED',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey: custEventKey,
          },
          eventKey: custEventKey,
        });

        // 2. Gửi Quán
        const merchantOwnerId = order.restaurant?.ownerId;
        if (merchantOwnerId) {
          const merchEventKey = `food_${orderId}_COMPLETED_MERCHANT`;
          await this.sendPushToUser(merchantOwnerId, 'MERCHANT', {
            recipientId: merchantOwnerId,
            recipientType: 'PARTNER',
            title: `Đơn hàng #${orderCode} đã hoàn tất`,
            body: `Đơn hàng đã giao thành công tới khách hàng. Doanh thu đã được hạch toán.`,
            data: {
              orderId,
              orderCode,
              status: 'COMPLETED',
              role: 'MERCHANT',
              deepLink: `/(merchant)/orders/${orderId}`,
              eventKey: merchEventKey,
            },
            eventKey: merchEventKey,
          });
        }
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // H. EVENT: HỦY ĐƠN (CANCELLED) -> GỬI CÁC BÊN
      // ─────────────────────────────────────────────────────────────
      if (eventType === 'ORDER_CANCELLED' || (eventType === 'STATUS_CHANGED' && order.status === 'CANCELLED')) {
        const cancelReason = extra?.reason || order.cancellationReason || order.rejectedReason || 'Theo yêu cầu';

        // 1. Gửi Khách
        const custEventKey = `food_${orderId}_CANCELLED_CUSTOMER`;
        await this.sendPushToUser(order.userId, 'CUSTOMER', {
          recipientId: order.userId,
          recipientType: 'USER',
          title: `Đơn hàng #${orderCode} đã bị hủy`,
          body: `Lý do hủy: ${cancelReason}`,
          data: {
            orderId,
            orderCode,
            status: 'CANCELLED',
            role: 'CUSTOMER',
            deepLink: `/food/orders/${orderId}`,
            eventKey: custEventKey,
          },
          eventKey: custEventKey,
        });

        // 2. Gửi Quán (nếu không phải quán hủy)
        const merchantOwnerId = order.restaurant?.ownerId;
        if (merchantOwnerId && extra?.cancelledBy !== 'MERCHANT') {
          const merchEventKey = `food_${orderId}_CANCELLED_MERCHANT`;
          await this.sendPushToUser(merchantOwnerId, 'MERCHANT', {
            recipientId: merchantOwnerId,
            recipientType: 'PARTNER',
            title: `Đơn hàng #${orderCode} đã bị hủy`,
            body: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`,
            data: {
              orderId,
              orderCode,
              status: 'CANCELLED',
              role: 'MERCHANT',
              deepLink: `/(merchant)/orders/${orderId}`,
              eventKey: merchEventKey,
            },
            eventKey: merchEventKey,
          });
        }

        // 3. Gửi Tài xế (nếu đã có tài xế nhận trước khi hủy)
        if (order.driver?.id && extra?.cancelledBy !== 'DRIVER') {
          const driverEventKey = `food_${orderId}_CANCELLED_DRIVER`;
          await this.sendPushToUser(order.driver.id, 'DRIVER', {
            recipientId: order.driver.id,
            recipientType: 'PARTNER',
            title: `Đơn giao #${orderCode} đã bị hủy`,
            body: `Đơn giao đồ ăn đã bị hủy. Lý do: ${cancelReason}`,
            data: {
              orderId,
              orderCode,
              status: 'CANCELLED',
              role: 'DRIVER',
              deepLink: `/(driver)/orders/${orderId}`,
              eventKey: driverEventKey,
            },
            eventKey: driverEventKey,
          });
        }
        return;
      }
    } catch (error: any) {
      // TUYỆT ĐỐI KHÔNG CRASH FOOD CORE HOẶC ROLLBACK TRANSACTION
      this.logger.warn(`Lỗi khi kích hoạt sendFoodOrderPush cho đơn ${order?.id} (Silent catch): ${error.message}`);
    }
  }
}
