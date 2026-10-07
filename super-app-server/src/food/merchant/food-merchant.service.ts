import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FoodOrderStatus } from '@prisma/client';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import {
  CreateOptionGroupStandaloneDto,
  UpdateOptionGroupDto,
  CreateOptionStandaloneDto,
  UpdateOptionDto,
} from './dto/manage-option.dto';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from './dto/manage-category.dto';
import { MerchantOrderHistoryQueryDto, TimePeriodFilter } from '../dto/order-history-query.dto';
import { FoodGateway } from '../food.gateway';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class FoodMerchantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodGateway: FoodGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Helper: Lấy nhà hàng mà user hiện tại đang làm chủ (ownerId = req.user.id).
   * Không cho phép dùng bất kỳ restaurantId nào do client gửi lên để bypass authorization.
   */
  async getMerchantRestaurant(userId: string, tx?: any) {
    const client = tx || this.prisma;
    const restaurant = await client.restaurant.findFirst({
      where: { ownerId: userId },
      include: { categories: true },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn không sở hữu nhà hàng nào hoặc không có quyền Merchant.');
    }

    return restaurant;
  }

  /**
   * Helper ghi nhận Audit Log cho mọi hành động quản lý của Merchant
   */
  async logAudit(
    restaurantId: string,
    userId: string,
    action: string,
    targetType: string,
    targetId?: string,
    metadata?: any,
    tx?: any,
  ) {
    const client = tx || this.prisma;
    try {
      return await client.foodAuditLog.create({
        data: {
          restaurantId,
          userId,
          action,
          targetType,
          targetId: targetId || null,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
    } catch (err) {
      console.error('Lỗi khi ghi nhận FoodAuditLog:', err);
    }
  }

  /**
   * Lấy thông tin hồ sơ nhà hàng và cấu hình
   */
  async getRestaurantProfile(userId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      avatar: restaurant.avatar,
      coverImage: restaurant.coverImage,
      address: restaurant.address,
      phoneNumber: restaurant.phoneNumber,
      openingHours: restaurant.openingHours,
      isActive: restaurant.isActive,
      isOpen: restaurant.isOpen,
      autoAcceptOrder: restaurant.autoAcceptOrder,
      rating: restaurant.rating,
      totalReviews: restaurant.totalReviews,
      phone: restaurant.phoneNumber,
      bankName: restaurant.bankName,
      bankCode: restaurant.bankCode,
      bankAccountNo: restaurant.bankAccountNo,
      bankAccountNumber: restaurant.bankAccountNo,
      bankAccountName: restaurant.bankAccountHolder || restaurant.name,
      bankAccountHolder: restaurant.bankAccountHolder || restaurant.name,
      bankInfo: restaurant.bankAccountNo
        ? {
            bankName: restaurant.bankName,
            bankCode: restaurant.bankCode,
            bankAccountNo: restaurant.bankAccountNo,
            bankAccountHolder: restaurant.bankAccountHolder || restaurant.name,
          }
        : null,
    };
  }

  /**
   * GET /api/food/merchant/orders?status=...
   * Chỉ trả về danh sách đơn hàng thuộc nhà hàng của chính Merchant đăng nhập.
   */
  async getOrders(userId: string, status?: FoodOrderStatus) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const whereCondition: any = {
      restaurantId: restaurant.id,
    };
    if (status) {
      whereCondition.status = status;
    }

    const orders = await this.prisma.foodOrder.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, image: true, price: true },
            },
          },
        },
        user: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        driver: {
          select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true },
        },
      },
    });

    return orders.map((o) => ({
      ...o,
      restaurantPayout: o.merchantEarning,
      originalFoodAmount: o.baseStorePrice,
      platformFoodMargin: o.appGrossProfit,
    }));
  }

  /**
   * GET /api/food/merchant/orders/history
   * Lịch sử đơn hàng của nhà hàng (Phân trang, lọc theo period & status, tính tổng doanh thu quán)
   */
  async getOrderHistory(userId: string, query?: MerchantOrderHistoryQueryDto) {
    const restaurant = await this.getMerchantRestaurant(userId);
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {
      restaurantId: restaurant.id,
    };

    // Lọc theo trạng thái
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as FoodOrderStatus;
    } else {
      where.status = { in: ['COMPLETED', 'CANCELLED'] };
    }

    // Lọc theo khoảng thời gian
    if (query?.period && query.period !== TimePeriodFilter.ALL) {
      const now = new Date();
      let fromDate: Date | null = null;
      switch (query.period) {
        case TimePeriodFilter.TODAY:
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          break;
        case TimePeriodFilter.SEVEN_DAYS:
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriodFilter.THIRTY_DAYS:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      if (fromDate) {
        where.createdAt = { gte: fromDate };
      }
    }

    const [total, rawOrders, aggregateRevenue] = await Promise.all([
      this.prisma.foodOrder.count({ where }),
      this.prisma.foodOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              menuItem: {
                select: { id: true, name: true, image: true, price: true },
              },
            },
          },
          user: {
            select: { id: true, fullName: true, phone: true, avatarUrl: true },
          },
          driver: {
            select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true },
          },
        },
      }),
      this.prisma.foodOrder.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        _sum: {
          merchantEarning: true,
          totalAmount: true,
        },
      }),
    ]);

    const orders = rawOrders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      completedAt: o.completedAt,
      cancelledAt: o.cancelledAt,
      cancelledBy: o.cancelledBy,
      rejectedReason: o.rejectedReason,
      cancellationReason: o.cancellationReason,
      totalAmount: o.totalAmount,
      subtotal: o.subtotal,
      merchantEarning: o.merchantEarning, // DOANH THU QUÁN NHẬN (90%)
      platformFoodMargin: o.appGrossProfit,
      user: o.user,
      driver: o.driver,
      itemCount: o.items.reduce((s, it) => s + it.quantity, 0),
      items: o.items.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
        notes: it.notes,
        optionsJson: it.optionsJson,
        image: it.menuItem?.image || null,
      })),
    }));

    return {
      orders,
      summary: {
        totalOrders: total,
        totalMerchantEarning: aggregateRevenue._sum.merchantEarning || 0,
        totalRevenue: aggregateRevenue._sum.totalAmount || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasMore: page < (Math.ceil(total / limit) || 1),
      },
    };
  }

  /**
   * PUT /api/food/merchant/profile
   * Cập nhật thông tin quán, giờ mở cửa, tài khoản ngân hàng
   */
  async updateRestaurantProfile(userId: string, dto: UpdateRestaurantProfileDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
        ...(dto.phoneNumber !== undefined || dto.phone !== undefined ? { phoneNumber: (dto.phoneNumber || dto.phone)?.trim() } : {}),
        ...(dto.openingHours !== undefined ? { openingHours: dto.openingHours.trim() } : {}),
        ...(dto.avatar !== undefined ? { avatar: dto.avatar } : {}),
        ...(dto.coverImage !== undefined ? { coverImage: dto.coverImage } : {}),
        ...(dto.isOpen !== undefined ? { isOpen: dto.isOpen } : {}),
        ...(dto.autoAcceptOrder !== undefined ? { autoAcceptOrder: dto.autoAcceptOrder } : {}),
        ...(dto.bankName !== undefined ? { bankName: dto.bankName } : {}),
        ...(dto.bankCode !== undefined ? { bankCode: dto.bankCode } : {}),
        ...(dto.bankAccountNo !== undefined || dto.bankAccountNumber !== undefined ? { bankAccountNo: dto.bankAccountNo || dto.bankAccountNumber } : {}),
        ...(dto.bankAccountHolder !== undefined || dto.bankAccountName !== undefined ? { bankAccountHolder: dto.bankAccountHolder || dto.bankAccountName } : {}),
      },
    });

    await this.logAudit(
      restaurant.id,
      userId,
      'UPDATE_PROFILE',
      'RESTAURANT',
      restaurant.id,
      { changes: dto },
    );

    return this.getRestaurantProfile(userId);
  }

  /**
   * GET /api/food/merchant/orders/:id
   * Lấy chi tiết đơn hàng cho Merchant
   */
  async getOrderById(userId: string, orderId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const order = await this.prisma.foodOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { orderCode: orderId }],
        restaurantId: restaurant.id,
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, image: true, price: true },
            },
          },
        },
        user: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        driver: {
          select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}" trong quán của bạn`);
    }

    return {
      ...order,
      restaurantPayout: order.merchantEarning,
      originalFoodAmount: order.baseStorePrice,
      platformFoodMargin: order.appGrossProfit,
    };
  }

  /**
   * PATCH /api/food/merchant/orders/:id/confirm
   * Xác nhận đơn hàng (Chuyển PENDING -> CONFIRMED)
   */
  async confirmOrder(userId: string, orderId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      // Merchant Authorization: Đơn hàng bắt buộc phải thuộc quán của user
      if (order.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền quản lý đơn hàng của nhà hàng khác.');
      }

      // State Machine Guard: Chỉ được xác nhận khi đang PENDING
      if (order.status !== 'PENDING') {
        throw new BadRequestException(
          `Đơn hàng không ở trạng thái chờ xác nhận (PENDING). Trạng thái hiện tại: ${order.status}`,
        );
      }

      const now = new Date();
      const updateResult = await tx.foodOrder.updateMany({
        where: { id: order.id, status: 'PENDING' },
        data: {
          status: 'CONFIRMED',
          confirmedAt: now,
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException('Đơn hàng đã được xử lý bởi thao tác khác hoặc không còn ở trạng thái PENDING');
      }

      const updatedOrder = await tx.foodOrder.findUnique({
        where: { id: order.id },
        include: { items: true, user: true },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'CONFIRM_ORDER',
        'ORDER',
        order.id,
        { previousStatus: order.status, newStatus: 'CONFIRMED' },
        tx,
      );

      return updatedOrder;
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'PENDING');
    } catch (socketErr) {
      console.error('[FoodMerchantService] Lỗi phát socket khi confirm order:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_CONFIRMED').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodMerchantService] Lỗi trigger push notification khi confirm order:', pushErr);
    }

    return result;
  }

  /**
   * PATCH /api/food/merchant/orders/:id/reject
   * Từ chối đơn hàng (Bắt buộc phải có lý do).
   * Chuyển trạng thái sang CANCELLED, ghi nhận cancelledBy = 'MERCHANT' và rejectedReason.
   */
  async rejectOrder(userId: string, orderId: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('Lý do từ chối đơn hàng là bắt buộc');
    }

    const restaurant = await this.getMerchantRestaurant(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      // Merchant Authorization
      if (order.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền quản lý đơn hàng của nhà hàng khác.');
      }

      // State Machine Guard: Quán chỉ được từ chối tiếp nhận khi đơn đang ở PENDING
      if (order.status !== 'PENDING') {
        throw new BadRequestException(
          `Chỉ có thể từ chối đơn hàng khi đang ở trạng thái PENDING. Trạng thái hiện tại: ${order.status}`,
        );
      }

      // Xử lý hoàn tiền (Refund) tự động nếu đơn đã thanh toán trước (paymentStatus === 'PAID')
      let newPaymentStatus = order.paymentStatus;
      if (order.paymentStatus === 'PAID') {
        if (order.paymentMethod === 'WALLET') {
          const idempotencyKey = `refund_food_${order.id}`;
          const existingRefundTx = await tx.transaction.findUnique({
            where: { idempotencyKey },
          });

          if (!existingRefundTx) {
            const userWallet = await tx.wallet.findUnique({
              where: { userId: order.userId },
            });
            if (userWallet) {
              const balanceBefore = Number(userWallet.balance);
              const refundAmount = order.totalAmount;
              const balanceAfter = balanceBefore + refundAmount;

              await tx.wallet.update({
                where: { id: userWallet.id },
                data: { balance: balanceAfter },
              });

              await tx.transaction.create({
                data: {
                  walletId: userWallet.id,
                  amount: refundAmount,
                  balanceBefore,
                  balanceAfter,
                  type: 'REFUND',
                  direction: 'CREDIT',
                  status: 'SUCCESS',
                  referenceId: order.orderCode || order.id,
                  referenceType: 'FOOD_ORDER',
                  idempotencyKey,
                  description: `Hoàn tiền đơn hàng đồ ăn #${order.orderCode || order.id} do quán từ chối: ${reason.trim()}`,
                },
              });
              newPaymentStatus = 'REFUNDED';
            }
          } else {
            newPaymentStatus = 'REFUNDED';
          }
        } else if (order.paymentMethod === 'VIETQR') {
          // Với VietQR (chuyển khoản qua Napas/VietQR), hệ thống đánh dấu REFUND_PENDING để kế toán/cổng đối soát
          newPaymentStatus = 'REFUND_PENDING';
        }
      }

      const now = new Date();
      const updateResult = await tx.foodOrder.updateMany({
        where: { id: order.id, status: 'PENDING' },
        data: {
          status: 'CANCELLED',
          cancelledBy: 'MERCHANT',
          cancellationReason: reason.trim(),
          rejectedReason: reason.trim(),
          cancelledAt: now,
          paymentStatus: newPaymentStatus,
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException('Đơn hàng đã được xử lý bởi thao tác khác hoặc không còn ở trạng thái PENDING');
      }

      // Nếu đơn có sử dụng voucher, hoàn trả lại lượt dùng cho voucher và xóa usage của user
      if (order.voucherId) {
        await tx.foodVoucher.updateMany({
          where: { id: order.voucherId },
          data: { usedCount: { decrement: 1 } },
        });
        await tx.foodVoucherUsage.deleteMany({
          where: { orderId: order.id },
        });
      }

      const updatedOrder = await tx.foodOrder.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'REJECT_ORDER',
        'ORDER',
        order.id,
        { reason: reason.trim(), previousStatus: order.status, refundStatus: newPaymentStatus },
        tx,
      );

      return updatedOrder;
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'PENDING', {
        reason: reason.trim(),
        cancelledBy: 'MERCHANT',
      });
    } catch (socketErr) {
      console.error('[FoodMerchantService] Lỗi phát socket khi reject order:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_CANCELLED', {
        reason: reason.trim(),
        cancelledBy: 'MERCHANT',
      }).catch(() => {});
    } catch (pushErr) {
      console.error('[FoodMerchantService] Lỗi trigger push notification khi reject order:', pushErr);
    }

    return result;
  }

  /**
   * PATCH /api/food/merchant/orders/:id/preparing
   * Quán bắt đầu làm món (Chuyển CONFIRMED -> PREPARING)
   */
  async startPreparingOrder(userId: string, orderId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      // Merchant Authorization
      if (order.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền quản lý đơn hàng của nhà hàng khác.');
      }

      // State Machine Guard: Chỉ được bắt đầu chuẩn bị khi đơn đã xác nhận (CONFIRMED)
      if (order.status !== 'CONFIRMED') {
        throw new BadRequestException(
          `Chỉ có thể chuyển sang chuẩn bị món khi đơn đang ở trạng thái CONFIRMED. Trạng thái hiện tại: ${order.status}`,
        );
      }

      const now = new Date();
      const updateResult = await tx.foodOrder.updateMany({
        where: { id: order.id, status: 'CONFIRMED' },
        data: {
          status: 'PREPARING',
          preparingAt: now,
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException('Đơn hàng đã được xử lý bởi thao tác khác hoặc không còn ở trạng thái CONFIRMED');
      }

      const updatedOrder = await tx.foodOrder.findUnique({
        where: { id: order.id },
        include: { items: true, user: true },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'START_PREPARING',
        'ORDER',
        order.id,
        { previousStatus: order.status, newStatus: 'PREPARING' },
        tx,
      );

      return updatedOrder;
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'CONFIRMED');
    } catch (socketErr) {
      console.error('[FoodMerchantService] Lỗi phát socket khi start preparing order:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_PREPARING').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodMerchantService] Lỗi trigger push notification khi start preparing order:', pushErr);
    }

    return result;
  }

  /**
   * PATCH /api/food/merchant/orders/:id/ready
   * Báo món đã nấu xong và sẵn sàng chuyển sang tìm tài xế giao hàng (FINDING_DRIVER).
   * YÊU CẦU: Bắt buộc đơn phải ở trạng thái PREPARING (không được nhảy cóc từ CONFIRMED).
   */
  async markOrderReady(userId: string, orderId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      // Merchant Authorization
      if (order.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền quản lý đơn hàng của nhà hàng khác.');
      }

      // State Machine Guard: Không cho phép bỏ qua PREPARING
      if (order.status === 'CONFIRMED') {
        throw new BadRequestException(
          'Đơn hàng chưa bắt đầu làm món (PREPARING). Vui lòng chuyển sang PREPARING trước khi báo sẵn sàng giao.',
        );
      }

      if (order.status !== 'PREPARING') {
        throw new BadRequestException(
          `Chỉ có thể chuyển sang sẵn sàng giao hàng khi đơn đang ở trạng thái PREPARING. Trạng thái hiện tại: ${order.status}`,
        );
      }

      const now = new Date();
      const updatedOrder = await tx.foodOrder.update({
        where: { id: order.id },
        data: {
          status: 'FINDING_DRIVER',
          readyAt: now,
        },
        include: { items: true, user: true, restaurant: true },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'MARK_READY',
        'ORDER',
        order.id,
        { previousStatus: order.status, newStatus: 'FINDING_DRIVER' },
        tx,
      );

      return updatedOrder;
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'PREPARING');
      this.foodGateway.notifyDriverOrderAvailable(result);
    } catch (socketErr) {
      console.error('[FoodMerchantService] Lỗi phát socket khi mark ready order:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_FINDING_DRIVER').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodMerchantService] Lỗi trigger push notification khi mark ready order:', pushErr);
    }

    return result;
  }

  /**
   * GET /api/food/merchant/menu
   * Lấy toàn bộ thực đơn gồm danh mục và món ăn của nhà hàng
   */
  async getMenu(userId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const categories = await this.prisma.menuCategory.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          include: {
            optionGroups: {
              include: { options: true },
            },
          },
        },
      },
    });

    const uncategorizedItems = await this.prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        categoryId: null,
      },
      include: {
        optionGroups: {
          include: { options: true },
        },
      },
    });

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      categories,
      uncategorizedItems,
    };
  }

  /**
   * POST /api/food/merchant/categories
   * Tạo danh mục món ăn mới
   */
  async createCategory(userId: string, dto: CreateMenuCategoryDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const category = await this.prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { items: true },
    });

    await this.logAudit(
      restaurant.id,
      userId,
      'CREATE_CATEGORY',
      'CATEGORY',
      category.id,
      { name: category.name },
    );

    return category;
  }

  /**
   * PUT /api/food/merchant/categories/:id
   * Cập nhật danh mục món ăn
   */
  async updateCategory(userId: string, categoryId: string, dto: UpdateMenuCategoryDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const category = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurantId: restaurant.id },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục "${categoryId}"`);
    }

    const updated = await this.prisma.menuCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: { items: true },
    });

    await this.logAudit(
      restaurant.id,
      userId,
      'UPDATE_CATEGORY',
      'CATEGORY',
      category.id,
      { changes: dto },
    );

    return updated;
  }

  /**
   * DELETE /api/food/merchant/categories/:id
   * Xóa danh mục món ăn (các món ăn thuộc danh mục này được chuyển categoryId = null)
   */
  async deleteCategory(userId: string, categoryId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const category = await this.prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurantId: restaurant.id },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục "${categoryId}"`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Chuyển các món ăn về chưa phân loại
      await tx.menuItem.updateMany({
        where: { categoryId: category.id },
        data: { categoryId: null },
      });

      // Xóa danh mục
      await tx.menuCategory.delete({
        where: { id: category.id },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'DELETE_CATEGORY',
        'CATEGORY',
        category.id,
        { name: category.name },
        tx,
      );
    });

    return {
      success: true,
      message: 'Đã xóa danh mục thành công',
    };
  }

  /**
   * POST /api/food/merchant/items
   * Tạo món ăn mới cho nhà hàng
   */
  async createItem(userId: string, dto: CreateMenuItemDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    if (dto.price < 0) {
      throw new BadRequestException('Giá món ăn không được nhỏ hơn 0');
    }

    if (dto.categoryId) {
      const category = await this.prisma.menuCategory.findFirst({
        where: { id: dto.categoryId, restaurantId: restaurant.id },
      });
      if (!category) {
        throw new BadRequestException('Danh mục được chọn không thuộc nhà hàng của bạn');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          name: dto.name.trim(),
          description: dto.description?.trim(),
          price: dto.price,
          originalPrice: dto.originalPrice,
          image: dto.image,
          calories: dto.calories,
          categoryId: dto.categoryId || null,
          isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
          ...(dto.optionGroups && dto.optionGroups.length > 0
            ? {
                optionGroups: {
                  create: dto.optionGroups.map((grp) => ({
                    name: grp.name.trim(),
                    required: grp.required || false,
                    maxSelect: grp.maxSelect || 1,
                    options: {
                      create: grp.options.map((opt) => ({
                        name: opt.name.trim(),
                        price: opt.price,
                      })),
                    },
                  })),
                },
              }
            : {}),
        },
        include: {
          optionGroups: { include: { options: true } },
          category: true,
        },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'CREATE_ITEM',
        'MENU_ITEM',
        item.id,
        { name: item.name, price: item.price },
        tx,
      );

      return item;
    });
  }

  /**
   * PUT /api/food/merchant/items/:id
   * Cập nhật thông tin món ăn (Chỉ cho phép sửa món thuộc nhà hàng của mình)
   */
  async updateItem(userId: string, itemId: string, dto: UpdateMenuItemDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.menuItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Không tìm thấy món ăn "${itemId}"`);
      }

      if (item.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa món ăn của nhà hàng khác.');
      }

      if (dto.price !== undefined && dto.price < 0) {
        throw new BadRequestException('Giá món ăn không được nhỏ hơn 0');
      }

      if (dto.categoryId) {
        const category = await tx.menuCategory.findFirst({
          where: { id: dto.categoryId, restaurantId: restaurant.id },
        });
        if (!category) {
          throw new BadRequestException('Danh mục được chọn không thuộc nhà hàng của bạn');
        }
      }

      const updated = await tx.menuItem.update({
        where: { id: item.id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
          ...(dto.originalPrice !== undefined ? { originalPrice: dto.originalPrice } : {}),
          ...(dto.image !== undefined ? { image: dto.image } : {}),
          ...(dto.calories !== undefined ? { calories: dto.calories } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
          ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
        },
        include: {
          category: true,
          optionGroups: { include: { options: true } },
        },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'UPDATE_ITEM',
        'MENU_ITEM',
        updated.id,
        { changes: dto },
        tx,
      );

      return updated;
    });
  }

  /**
   * PATCH /api/food/merchant/items/:id/toggle-stock
   * Bật/tắt trạng thái còn hàng / hết hàng của món ăn
   */
  async toggleItemStock(userId: string, itemId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.menuItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Không tìm thấy món ăn "${itemId}"`);
      }

      if (item.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa món ăn của nhà hàng khác.');
      }

      const nextStatus = !item.isAvailable;
      const updated = await tx.menuItem.update({
        where: { id: item.id },
        data: { isAvailable: nextStatus },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'TOGGLE_STOCK',
        'MENU_ITEM',
        item.id,
        { previousStatus: item.isAvailable, newStatus: nextStatus },
        tx,
      );

      return {
        id: updated.id,
        name: updated.name,
        isAvailable: updated.isAvailable,
        message: updated.isAvailable ? 'Món ăn đã được bật còn hàng' : 'Món ăn đã được đánh dấu hết hàng',
      };
    });
  }

  /**
   * DELETE /api/food/merchant/items/:id
   * Xóa món ăn khỏi thực đơn hoặc ẩn nếu đã có lịch sử đơn hàng
   */
  async deleteMenuItem(userId: string, itemId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { orderItems: { take: 1 } },
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy món ăn "${itemId}"`);
    }

    if (item.restaurantId !== restaurant.id) {
      throw new ForbiddenException('Bạn không có quyền xóa món của nhà hàng khác.');
    }

    // Nếu món đã từng có trong đơn hàng, ẩn đi để bảo toàn dữ liệu lịch sử
    if (item.orderItems && item.orderItems.length > 0) {
      await this.prisma.menuItem.update({
        where: { id: itemId },
        data: { isAvailable: false },
      });
      return { success: true, message: 'Món ăn đã được ẩn do đã phát sinh đơn hàng lịch sử.' };
    }

    // Nếu chưa từng có trong đơn hàng, xóa hẳn món và các optionGroups đi kèm
    await this.prisma.itemOptionGroup.deleteMany({
      where: { menuItemId: itemId },
    });
    await this.prisma.menuItem.delete({
      where: { id: itemId },
    });

    await this.logAudit(
      restaurant.id,
      userId,
      'DELETE_MENU_ITEM',
      'MENU_ITEM',
      itemId,
      { name: item.name },
    );

    return { success: true, message: 'Đã xóa món ăn thành công.' };
  }

  /**
   * PATCH /api/food/merchant/toggle-open
   * Đóng/mở cửa nhà hàng và cấu hình tự động nhận đơn
   */
  async toggleRestaurantOpen(userId: string, isOpen?: boolean, autoAcceptOrder?: boolean) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const nextIsOpen = isOpen !== undefined ? isOpen : !restaurant.isOpen;
    const nextAutoAccept = autoAcceptOrder !== undefined ? autoAcceptOrder : restaurant.autoAcceptOrder;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.restaurant.update({
        where: { id: restaurant.id },
        data: {
          isOpen: nextIsOpen,
          autoAcceptOrder: nextAutoAccept,
        },
      });

      // Audit Log
      await this.logAudit(
        restaurant.id,
        userId,
        'TOGGLE_OPEN',
        'RESTAURANT',
        restaurant.id,
        { isOpen: nextIsOpen, autoAcceptOrder: nextAutoAccept },
        tx,
      );

      return {
        restaurantId: updated.id,
        name: updated.name,
        isOpen: updated.isOpen,
        autoAcceptOrder: updated.autoAcceptOrder,
        message: updated.isOpen ? 'Nhà hàng đã mở cửa đón khách' : 'Nhà hàng đã đóng cửa ngưng nhận đơn',
      };
    });
  }

  /**
   * GET /api/food/merchant/financials
   * Thống kê tài chính từ snapshot đơn hàng hoàn tất (COMPLETED).
   * Giữ đúng mô hình: Quán nhận 90%, Khách trả 110%, App gộp 20%, Freeship trừ vào lãi App.
   */
  async getFinancials(userId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    const completedOrders = await this.prisma.foodOrder.findMany({
      where: {
        restaurantId: restaurant.id,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    const completedOrdersCount = completedOrders.length;
    let totalFoodRevenue = 0; // Tổng tiền món khách trả (subtotal)
    let totalBaseStorePrice = 0; // Giá gốc niêm yết tại quán (100%)
    let totalMerchantEarning = 0; // Quán nhận 90%
    let totalAppGrossProfit = 0; // App gộp 20%
    let totalAppNetProfit = 0; // Lãi ròng V-Life
    let totalFreeshipSponsored = 0; // Tiền freeship V-Life bù

    for (const order of completedOrders) {
      totalFoodRevenue += order.subtotal;
      totalBaseStorePrice += order.baseStorePrice;
      totalMerchantEarning += order.merchantEarning;
      totalAppGrossProfit += order.appGrossProfit;
      totalAppNetProfit += order.appNetProfit;
      totalFreeshipSponsored += (order.appGrossProfit - order.appNetProfit);
    }

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      totalRevenue: Math.round(totalFoodRevenue),
      netPayout: Math.round(totalMerchantEarning),
      platformFee: Math.round(totalAppGrossProfit),
      totalOrders: completedOrdersCount,
      settledOrders: completedOrders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        completedAt: o.completedAt || o.updatedAt,
        total: o.totalAmount,
        originalFoodAmount: o.baseStorePrice,
        restaurantPayout: o.merchantEarning,
        platformFoodMargin: o.appGrossProfit,
      })),
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        phoneNumber: restaurant.phoneNumber,
        bankInfo: restaurant.bankAccountNo
          ? {
              bankName: restaurant.bankName,
              bankCode: restaurant.bankCode,
              bankAccountNo: restaurant.bankAccountNo,
              bankAccountHolder: restaurant.bankAccountHolder || restaurant.name,
            }
          : null,
      },
      financialSummary: {
        completedOrdersCount,
        totalFoodRevenue: Math.round(totalFoodRevenue),
        totalBaseStorePrice: Math.round(totalBaseStorePrice),
        totalMerchantEarning: Math.round(totalMerchantEarning), // 90% quán nhận
        totalAppGrossProfit: Math.round(totalAppGrossProfit),   // 20% lãi gộp App
        totalFreeshipSponsored: Math.round(totalFreeshipSponsored),
        totalAppNetProfit: Math.round(totalAppNetProfit),
      },
      recentCompletedOrders: completedOrders.slice(0, 10).map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        createdAt: o.createdAt,
        completedAt: o.completedAt || o.updatedAt,
        subtotal: o.subtotal,
        baseStorePrice: o.baseStorePrice,
        merchantEarning: o.merchantEarning,
        paymentMethod: o.paymentMethod,
      })),
    };
  }

  /**
   * POST /api/food/merchant/items/:itemId/option-groups
   * Tạo nhóm tùy chọn (Topping/Size/Đá/Đường) cho món ăn
   */
  async createOptionGroup(userId: string, itemId: string, dto: CreateOptionGroupStandaloneDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const menuItem = await tx.menuItem.findUnique({
        where: { id: itemId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Không tìm thấy món ăn "${itemId}"`);
      }

      if (menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa món ăn của nhà hàng khác.');
      }

      const group = await tx.itemOptionGroup.create({
        data: {
          menuItemId: menuItem.id,
          name: dto.name.trim(),
          required: dto.required ?? false,
          maxSelect: dto.maxSelect ?? 1,
        },
        include: { options: true },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'CREATE_OPTION_GROUP',
        'OPTION_GROUP',
        group.id,
        { menuItemId: menuItem.id, name: group.name },
        tx,
      );

      return group;
    });
  }

  /**
   * PUT /api/food/merchant/option-groups/:id
   * Cập nhật thông tin nhóm tùy chọn
   */
  async updateOptionGroup(userId: string, groupId: string, dto: UpdateOptionGroupDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const group = await tx.itemOptionGroup.findUnique({
        where: { id: groupId },
        include: { menuItem: true, options: true },
      });

      if (!group) {
        throw new NotFoundException(`Không tìm thấy nhóm tùy chọn "${groupId}"`);
      }

      if (group.menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa nhóm tùy chọn của nhà hàng khác.');
      }

      const updated = await tx.itemOptionGroup.update({
        where: { id: group.id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.required !== undefined ? { required: dto.required } : {}),
          ...(dto.maxSelect !== undefined ? { maxSelect: dto.maxSelect } : {}),
        },
        include: { options: true },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'UPDATE_OPTION_GROUP',
        'OPTION_GROUP',
        group.id,
        { changes: dto },
        tx,
      );

      return updated;
    });
  }

  /**
   * DELETE /api/food/merchant/option-groups/:id
   * Xóa nhóm tùy chọn (Cascade xóa options bên trong, không ảnh hưởng đơn cũ vì dùng snapshot optionsJson)
   */
  async deleteOptionGroup(userId: string, groupId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const group = await tx.itemOptionGroup.findUnique({
        where: { id: groupId },
        include: { menuItem: true },
      });

      if (!group) {
        throw new NotFoundException(`Không tìm thấy nhóm tùy chọn "${groupId}"`);
      }

      if (group.menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền xóa nhóm tùy chọn của nhà hàng khác.');
      }

      await tx.itemOptionGroup.delete({
        where: { id: group.id },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'DELETE_OPTION_GROUP',
        'OPTION_GROUP',
        group.id,
        { name: group.name, menuItemId: group.menuItemId },
        tx,
      );

      return {
        success: true,
        message: 'Đã xóa nhóm tùy chọn thành công',
      };
    });
  }

  /**
   * POST /api/food/merchant/option-groups/:groupId/options
   * Thêm tùy chọn (item con) vào nhóm tùy chọn
   */
  async createOption(userId: string, groupId: string, dto: CreateOptionStandaloneDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const group = await tx.itemOptionGroup.findUnique({
        where: { id: groupId },
        include: { menuItem: true },
      });

      if (!group) {
        throw new NotFoundException(`Không tìm thấy nhóm tùy chọn "${groupId}"`);
      }

      if (group.menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền thêm tùy chọn cho nhà hàng khác.');
      }

      const option = await tx.itemOption.create({
        data: {
          groupId: group.id,
          name: dto.name.trim(),
          price: dto.price,
        },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'CREATE_OPTION',
        'OPTION',
        option.id,
        { groupId: group.id, name: option.name, price: option.price },
        tx,
      );

      return option;
    });
  }

  /**
   * PUT /api/food/merchant/options/:id
   * Cập nhật tùy chọn (tên, giá)
   */
  async updateOption(userId: string, optionId: string, dto: UpdateOptionDto) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const option = await tx.itemOption.findUnique({
        where: { id: optionId },
        include: {
          group: {
            include: { menuItem: true },
          },
        },
      });

      if (!option) {
        throw new NotFoundException(`Không tìm thấy tùy chọn "${optionId}"`);
      }

      if (option.group.menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa tùy chọn của nhà hàng khác.');
      }

      const updated = await tx.itemOption.update({
        where: { id: option.id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
        },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'UPDATE_OPTION',
        'OPTION',
        option.id,
        { changes: dto },
        tx,
      );

      return updated;
    });
  }

  /**
   * DELETE /api/food/merchant/options/:id
   * Xóa tùy chọn (không ảnh hưởng snapshot đơn cũ)
   */
  async deleteOption(userId: string, optionId: string) {
    const restaurant = await this.getMerchantRestaurant(userId);

    return this.prisma.$transaction(async (tx) => {
      const option = await tx.itemOption.findUnique({
        where: { id: optionId },
        include: {
          group: {
            include: { menuItem: true },
          },
        },
      });

      if (!option) {
        throw new NotFoundException(`Không tìm thấy tùy chọn "${optionId}"`);
      }

      if (option.group.menuItem.restaurantId !== restaurant.id) {
        throw new ForbiddenException('Bạn không có quyền xóa tùy chọn của nhà hàng khác.');
      }

      await tx.itemOption.delete({
        where: { id: option.id },
      });

      await this.logAudit(
        restaurant.id,
        userId,
        'DELETE_OPTION',
        'OPTION',
        option.id,
        { name: option.name, groupId: option.groupId },
        tx,
      );

      return {
        success: true,
        message: 'Đã xóa tùy chọn thành công',
      };
    });
  }
}
