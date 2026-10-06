import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FoodGateway } from '../food.gateway';
import { DriverFoodHistoryQueryDto, TimePeriodFilter } from '../dto/order-history-query.dto';
import { FoodOrderStatus } from '@prisma/client';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class FoodDriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodGateway: FoodGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tính khoảng cách Haversine giữa 2 điểm GPS (km)
   */
  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Lấy thông tin tài xế từ ID và kiểm tra quyền
   */
  async getDriverOrThrow(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new ForbiddenException('Không tìm thấy tài khoản tài xế hoặc bạn không có quyền DRIVER.');
    }

    return driver;
  }

  /**
   * Bật/tắt trạng thái nhận cuốc của tài xế
   */
  async toggleOnline(driverId: string, isOnline: boolean) {
    const driver = await this.getDriverOrThrow(driverId);

    const updated = await this.prisma.driver.update({
      where: { id: driver.id },
      data: { isOnline },
    });

    return {
      driverId: updated.id,
      fullName: updated.fullName,
      isOnline: updated.isOnline,
    };
  }

  /**
   * Cập nhật vị trí GPS của tài xế
   */
  async updateLocation(
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speed?: number,
    orderId?: string,
  ) {
    const driver = await this.getDriverOrThrow(driverId);

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        heading: heading || 0,
        speed: speed || 0,
        isOnline: true,
      },
    });

    if (orderId) {
      this.foodGateway.broadcastDriverLocation(orderId, {
        driverId: driver.id,
        lat,
        lng,
        heading: heading || 0,
        speed: speed || 0,
      });
    }

    return { success: true, lat, lng };
  }

  /**
   * Lấy danh sách các đơn đồ ăn đang ở trạng thái FINDING_DRIVER (chưa có tài xế nhận)
   */
  async getAvailableOrders(driverId: string, customLat?: number, customLng?: number) {
    const driver = await this.getDriverOrThrow(driverId);
    const driverLat = customLat ?? driver.currentLat;
    const driverLng = customLng ?? driver.currentLng;

    const orders = await this.prisma.foodOrder.findMany({
      where: {
        status: 'FINDING_DRIVER',
        driverId: null,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            totalPrice: true,
            optionsJson: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Tính khoảng cách từ tài xế đến quán ăn
    return orders.map((o) => {
      let distanceToRestaurantKm = 1.5;
      if (driverLat && driverLng && o.restaurant?.latitude && o.restaurant?.longitude) {
        distanceToRestaurantKm = this.calculateDistanceKm(
          driverLat,
          driverLng,
          o.restaurant.latitude,
          o.restaurant.longitude,
        );
      }

      return {
        ...o,
        distanceToRestaurantKm,
      };
    });
  }

  /**
   * Tài xế tiếp nhận đơn đồ ăn: POST /food/driver/orders/:id/accept
   * BẢO MẬT & CONCURRENCY:
   * - Phải là DRIVER đang ONLINE
   * - Không nhận trùng 2 đơn cùng lúc nếu đang có đơn chưa hoàn tất
   * - PESSIMISTIC / ATOMIC LOCKING: updateMany where: { status: 'FINDING_DRIVER', driverId: null }
   * - Nếu 2 tài xế bấm cùng mili-giây -> chỉ 1 người thành công, người kia nhận 409 Conflict.
   */
  async acceptOrder(driverId: string, orderId: string) {
    const driver = await this.getDriverOrThrow(driverId);

    if (!driver.isOnline) {
      throw new BadRequestException('Bạn đang ở chế độ NGOẠI TUYẾN. Vui lòng bật TRỰC TUYẾN để nhận đơn.');
    }

    // Kiểm tra tài xế có đang bận với đơn Food khác chưa hoàn tất không
    const ongoingOrder = await this.prisma.foodOrder.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['DRIVER_ACCEPTED', 'PICKED_UP'] },
      },
    });

    if (ongoingOrder) {
      throw new BadRequestException(
        `Bạn đang có đơn hàng #${ongoingOrder.orderCode} chưa hoàn tất. Vui lòng giao xong trước khi nhận đơn mới.`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      if (order.status !== 'FINDING_DRIVER' || order.driverId !== null) {
        throw new ConflictException('Đơn hàng đã được tài xế khác tiếp nhận hoặc không còn khả dụng.');
      }

      // Concurrency Lock: updateMany với điều kiện nguyên tử
      const updateResult = await tx.foodOrder.updateMany({
        where: {
          id: order.id,
          status: 'FINDING_DRIVER',
          driverId: null,
        },
        data: {
          status: 'DRIVER_ACCEPTED',
          driverId: driver.id,
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException('Đơn hàng đã được tài xế khác tiếp nhận nhanh hơn.');
      }

      return tx.foodOrder.findUnique({
        where: { id: order.id },
        include: {
          restaurant: true,
          user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          driver: { select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true } },
          items: true,
        },
      });
    });

    if (!result) {
      throw new ConflictException('Không thể lấy thông tin đơn hàng sau khi tiếp nhận.');
    }

    // Sau khi transaction thành công: Phát broadcast tới các bên
    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'FINDING_DRIVER');
      this.foodGateway.notifyDriverOrderAccepted(result.id, result.orderCode, result.driver);
    } catch (socketErr) {
      console.error('[FoodDriverService] Lỗi phát socket acceptOrder:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_DRIVER_ACCEPTED').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodDriverService] Lỗi trigger push notification khi acceptOrder:', pushErr);
    }

    return result;
  }

  /**
   * Tài xế đã lấy món từ quán: PATCH /food/driver/orders/:id/pickup
   * STATE MACHINE: Chỉ từ DRIVER_ACCEPTED -> PICKED_UP
   */
  async pickupOrder(driverId: string, orderId: string) {
    const driver = await this.getDriverOrThrow(driverId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      if (order.driverId !== driver.id) {
        throw new ForbiddenException('Bạn không phải tài xế được chỉ định cho đơn hàng này.');
      }

      if (order.status !== 'DRIVER_ACCEPTED') {
        throw new BadRequestException(
          `Không thể chuyển sang ĐÃ LẤY MÓN. Trạng thái hiện tại: ${order.status}`,
        );
      }

      const now = new Date();
      return tx.foodOrder.update({
        where: { id: order.id },
        data: {
          status: 'PICKED_UP',
          pickedUpAt: now,
        },
        include: {
          restaurant: true,
          user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          driver: { select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true } },
          items: true,
        },
      });
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'DRIVER_ACCEPTED');
    } catch (socketErr) {
      console.error('[FoodDriverService] Lỗi phát socket pickupOrder:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_PICKED_UP').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodDriverService] Lỗi trigger push notification khi pickupOrder:', pushErr);
    }

    return result;
  }

  /**
   * Tài xế giao thành công tới khách hàng: PATCH /food/driver/orders/:id/complete
   * STATE MACHINE: Chỉ từ PICKED_UP -> COMPLETED
   * HẠCH TOÁN DOANH THU & CHỐNG DOUBLE SETTLEMENT:
   * - 100% shippingFee thuộc về Driver
   * - Quán nhận 90% tiền món (đã ghi nhận trong restaurantPayout/merchantEarning)
   * - Sàn V-Life hưởng 20% chênh lệch giá món
   * - Không tính shipping vào 20% lãi V-Life
   */
  async completeOrder(driverId: string, orderId: string) {
    const driver = await this.getDriverOrThrow(driverId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
        include: {
          user: true,
          restaurant: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      if (order.driverId !== driver.id) {
        throw new ForbiddenException('Bạn không phải tài xế được chỉ định cho đơn hàng này.');
      }

      if (order.status !== 'PICKED_UP') {
        throw new BadRequestException(
          `Chỉ có thể hoàn tất đơn khi đang ở trạng thái PICKED_UP (Đang giao). Trạng thái hiện tại: ${order.status}`,
        );
      }

      const now = new Date();
      const settlementKey = `settle_food_${order.id}`;

      // Kiểm tra chống double settlement
      const existingSettlement = await tx.driverTransaction.findFirst({
        where: { note: settlementKey },
      });

      const currentDriver = await tx.driver.findUniqueOrThrow({
        where: { id: driver.id },
      });

      let updatedWalletBalance = Number(currentDriver.walletBalance);
      let updatedCashBalance = Number(currentDriver.cashBalance);
      const driverShippingEarning = (order.shippingFee || 0) + (order.discountAmount || 0);
      const updatedDailyEarnings = Number(currentDriver.dailyEarnings) + driverShippingEarning;
      const updatedTotalTrips = currentDriver.totalTrips + 1;

      let newPaymentStatus = order.paymentStatus;

      if (!existingSettlement) {
        if (order.paymentMethod === 'COD') {
          // Khách trả tiền mặt: Driver thu hộ toàn bộ tiền món + ship (nếu có)
          updatedCashBalance += order.totalAmount;
          newPaymentStatus = 'PAID';

          // Nếu có Freeship sàn tài trợ, sàn bù phần cước này vào ví tài xế
          if (order.discountAmount > 0) {
            updatedWalletBalance += order.discountAmount;
          }
        } else {
          // Thanh toán Online (WALLET / VIETQR): Tiền đã trừ của khách, sàn chuyển 100% phí cước ship vào ví tài xế
          updatedWalletBalance += driverShippingEarning;
          newPaymentStatus = 'PAID';
        }

        // Cập nhật số dư và chỉ số tài xế
        await tx.driver.update({
          where: { id: driver.id },
          data: {
            walletBalance: updatedWalletBalance,
            cashBalance: updatedCashBalance,
            dailyEarnings: updatedDailyEarnings,
            totalTrips: updatedTotalTrips,
          },
        });

        // Tạo bản ghi giao dịch thu nhập cho Driver
        await tx.driverTransaction.create({
          data: {
            driverId: driver.id,
            title: `Tiền cước giao hàng đơn #${order.orderCode}`,
            amount: driverShippingEarning,
            balanceAfter: updatedWalletBalance,
            type: 'FOOD_DELIVERY',
            walletType: order.paymentMethod === 'COD' ? 'CASH' : 'CREDIT',
            note: settlementKey,
            distanceKm: order.distanceKm,
            paymentMethod: order.paymentMethod,
            customerName: order.user?.fullName || 'Khách hàng',
            dropoff: order.deliveryAddress,
          },
        });
      }

      // Cập nhật trạng thái đơn sang COMPLETED
      return tx.foodOrder.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completedAt: now,
          paymentStatus: newPaymentStatus,
        },
        include: {
          restaurant: true,
          user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          driver: { select: { id: true, fullName: true, phone: true, licensePlate: true, vehicleType: true } },
          items: true,
        },
      });
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'PICKED_UP');
    } catch (socketErr) {
      console.error('[FoodDriverService] Lỗi phát socket completeOrder:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_COMPLETED').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodDriverService] Lỗi trigger push notification khi completeOrder:', pushErr);
    }

    return result;
  }

  /**
   * Tài xế hủy nhận đơn (khi đang ở DRIVER_ACCEPTED, chưa lấy món):
   * Trả đơn về FINDING_DRIVER để điều phối tài xế khác.
   */
  async cancelOrder(driverId: string, orderId: string, reason?: string) {
    const driver = await this.getDriverOrThrow(driverId);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
      }

      if (order.driverId !== driver.id) {
        throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này.');
      }

      if (order.status !== 'DRIVER_ACCEPTED') {
        throw new BadRequestException(
          `Chỉ có thể hủy nhận đơn khi chưa lấy món (DRIVER_ACCEPTED). Trạng thái hiện tại: ${order.status}`,
        );
      }

      // Trả đơn về FINDING_DRIVER để tìm tài xế khác
      return tx.foodOrder.update({
        where: { id: order.id },
        data: {
          status: 'FINDING_DRIVER',
          driverId: null,
        },
        include: {
          restaurant: true,
          user: true,
          items: true,
        },
      });
    });

    try {
      this.foodGateway.notifyOrderStatusChanged(result, 'DRIVER_ACCEPTED', {
        reason: reason || 'Tài xế hủy nhận đơn',
        cancelledBy: 'DRIVER',
      });
      // Broadcast lại cho drivers pool tìm tài xế mới
      this.foodGateway.notifyDriverOrderAvailable(result);
    } catch (socketErr) {
      console.error('[FoodDriverService] Lỗi phát socket cancelOrder:', socketErr);
    }

    try {
      this.notificationService.sendFoodOrderPush(result, 'ORDER_FINDING_DRIVER').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodDriverService] Lỗi trigger push notification khi driver cancelOrder:', pushErr);
    }

    return {
      success: true,
      message: 'Đã hủy nhận đơn thành công. Đơn hàng đã được trả về danh sách chờ tài xế khác.',
      order: result,
    };
  }

  /**
   * Lấy đơn hàng đồ ăn mà tài xế đang nhận thực hiện
   */
  async getActiveOrder(driverId: string) {
    const driver = await this.getDriverOrThrow(driverId);

    return this.prisma.foodOrder.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['DRIVER_ACCEPTED', 'PICKED_UP'] },
      },
      include: {
        restaurant: true,
        user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        items: true,
      },
    });
  }

  /**
   * Lấy lịch sử giao hàng đồ ăn của tài xế (Phân trang, lọc theo thời gian & trạng thái)
   * BẢO MẬT: Chỉ hiển thị cước phí ship tài xế nhận, KHÔNG để lộ doanh thu quán/sàn.
   */
  async getOrderHistory(driverId: string, query?: DriverFoodHistoryQueryDto) {
    const driver = await this.getDriverOrThrow(driverId);
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query?.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {
      driverId: driver.id,
    };

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as FoodOrderStatus;
    } else {
      where.status = { in: ['COMPLETED', 'CANCELLED'] };
    }

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

    const [total, rawOrders, aggregateShipping] = await Promise.all([
      this.prisma.foodOrder.count({ where }),
      this.prisma.foodOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: { select: { id: true, name: true, address: true, avatar: true, phoneNumber: true } },
          items: { select: { id: true, name: true, quantity: true } },
          user: { select: { id: true, fullName: true, phone: true } },
        },
      }),
      this.prisma.foodOrder.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        _sum: {
          shippingFee: true,
          discountAmount: true,
        },
      }),
    ]);

    // Format dữ liệu an toàn cho Tài xế
    const orders = rawOrders.map((o) => {
      const shippingEarning = (o.shippingFee || 0) + (o.discountAmount || 0);
      return {
        id: o.id,
        orderCode: o.orderCode,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        pickedUpAt: o.pickedUpAt,
        completedAt: o.completedAt,
        cancelledAt: o.cancelledAt,
        cancellationReason: o.cancellationReason,
        rejectedReason: o.rejectedReason,
        distanceKm: o.distanceKm,
        deliveryAddress: o.deliveryAddress,
        restaurant: o.restaurant,
        customerName: o.user?.fullName || 'Khách hàng',
        customerPhone: o.user?.phone || '',
        itemCount: o.items.reduce((s, it) => s + it.quantity, 0),
        items: o.items,
        shippingEarning, // 100% CƯỚC SHIP TÀI XẾ NHẬN
      };
    });

    const totalShippingEarnings =
      (aggregateShipping._sum.shippingFee || 0) + (aggregateShipping._sum.discountAmount || 0);

    return {
      orders,
      summary: {
        totalOrders: total,
        totalShippingEarnings,
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
}
