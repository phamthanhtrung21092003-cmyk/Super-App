import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateFoodReviewDto,
  RestaurantReviewsQueryDto,
  ItemReviewsQueryDto,
  DriverReviewsQueryDto,
} from './dto/food-review.dto';

@Injectable()
export class FoodReviewService {
  private readonly logger = new Logger(FoodReviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Khử thẻ HTML và giới hạn độ dài chống Spam / XSS
   */
  private sanitizeComment(text?: string): string | null {
    if (!text || !text.trim()) return null;
    const clean = text.replace(/<[^>]*>?/gm, '').trim();
    return clean.length > 500 ? clean.substring(0, 500) : clean;
  }

  /**
   * Che giấu thông tin danh tính người dùng (Privacy Masking)
   */
  private maskUserName(name?: string | null): string {
    if (!name || !name.trim()) return 'Khách hàng V-Life';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      const w = words[0];
      return w.length <= 2 ? `${w}***` : `${w.substring(0, 2)}***`;
    }
    const first = words[0];
    const last = words[words.length - 1];
    return `${first} *** ${last}`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. TẠO ĐÁNH GIÁ ĐƠN HÀNG (ONE ORDER -> ONE REVIEW SET, TRANSACTION & ANTI-SPAM)
  // ══════════════════════════════════════════════════════════════════════════════

  async createOrderReviews(userId: string, orderId: string, dto: CreateFoodReviewDto) {
    // 1. Tìm đơn hàng
    const order = await this.prisma.foodOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        restaurantReview: true,
        driverReview: true,
        itemReviews: true,
        restaurant: { select: { id: true, name: true, ownerId: true } },
        driver: { select: { id: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // 2. Kiểm tra quyền sở hữu đơn hàng (User A không được review đơn của User B)
    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đánh giá đơn hàng này');
    }

    // 3. Kiểm tra trạng thái đơn hàng (Chỉ COMPLETED mới được review)
    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('Chỉ đơn hàng đã hoàn thành (COMPLETED) mới được phép đánh giá');
    }

    // 4. Kiểm tra có nội dung đánh giá
    const hasRestaurantReview = dto.restaurantRating !== undefined && dto.restaurantRating !== null;
    const hasDriverReview = dto.driverRating !== undefined && dto.driverRating !== null;
    const hasItemReviews = Array.isArray(dto.itemReviews) && dto.itemReviews.length > 0;

    if (!hasRestaurantReview && !hasDriverReview && !hasItemReviews) {
      throw new BadRequestException('Vui lòng chọn ít nhất một mục để gửi đánh giá');
    }

    // 5. Kiểm tra tính hợp lệ & chống duplicate
    if (hasRestaurantReview) {
      if (order.restaurantReview) {
        throw new ConflictException('Đơn hàng này đã được đánh giá nhà hàng trước đó');
      }
      if (dto.restaurantRating! < 1 || dto.restaurantRating! > 5) {
        throw new BadRequestException('Số sao đánh giá nhà hàng phải từ 1 đến 5');
      }
    }

    if (hasDriverReview) {
      if (!order.driverId) {
        throw new BadRequestException('Đơn hàng này không có tài xế phụ trách');
      }
      if (order.driverReview) {
        throw new ConflictException('Đơn hàng này đã được đánh giá tài xế trước đó');
      }
      if (dto.driverRating! < 1 || dto.driverRating! > 5) {
        throw new BadRequestException('Số sao đánh giá tài xế phải từ 1 đến 5');
      }
    }

    if (hasItemReviews) {
      const orderItemIds = new Set(order.items.map((i) => i.menuItemId));
      const seenItems = new Set<string>();

      for (const ir of dto.itemReviews!) {
        if (!orderItemIds.has(ir.menuItemId)) {
          throw new BadRequestException(`Món ăn [${ir.menuItemId}] không nằm trong đơn hàng này`);
        }
        if (seenItems.has(ir.menuItemId)) {
          throw new BadRequestException('Không được gửi đánh giá trùng lặp cho cùng một món ăn');
        }
        seenItems.add(ir.menuItemId);

        if (ir.rating < 1 || ir.rating > 5) {
          throw new BadRequestException('Số sao đánh giá món ăn phải từ 1 đến 5');
        }

        const alreadyReviewed = order.itemReviews.some((x) => x.menuItemId === ir.menuItemId);
        if (alreadyReviewed) {
          throw new ConflictException(`Món ăn [${ir.menuItemId}] đã được đánh giá trước đó`);
        }
      }
    }

    // 6. Thực hiện Transaction toàn phần
    const result = await this.prisma.$transaction(async (tx) => {
      let createdRestaurantReview: any = null;
      let createdDriverReview: any = null;
      const createdItemReviews: any[] = [];

      // A. Tạo RestaurantReview
      if (hasRestaurantReview) {
        createdRestaurantReview = await tx.restaurantReview.create({
          data: {
            orderId: order.id,
            userId,
            restaurantId: order.restaurantId,
            rating: dto.restaurantRating!,
            comment: this.sanitizeComment(dto.restaurantComment),
          },
        });

        // Tính lại điểm trung bình Nhà hàng
        const restAgg = await tx.restaurantReview.aggregate({
          where: { restaurantId: order.restaurantId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        const newAvg = Number((restAgg._avg.rating || 5.0).toFixed(1));
        const newTotal = restAgg._count.rating || 0;

        await tx.restaurant.update({
          where: { id: order.restaurantId },
          data: {
            rating: newAvg,
            totalReviews: newTotal,
          },
        });
      }

      // B. Tạo DriverReview
      if (hasDriverReview && order.driverId) {
        createdDriverReview = await tx.driverReview.create({
          data: {
            orderId: order.id,
            userId,
            driverId: order.driverId,
            rating: dto.driverRating!,
            comment: this.sanitizeComment(dto.driverComment),
          },
        });

        // Tính lại điểm trung bình Tài xế
        const driverAgg = await tx.driverReview.aggregate({
          where: { driverId: order.driverId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        const newDriverAvg = Number((driverAgg._avg.rating || 5.0).toFixed(1));
        const newDriverTotal = driverAgg._count.rating || 0;

        await tx.driver.update({
          where: { id: order.driverId },
          data: {
            rating: newDriverAvg,
            totalTrips: newDriverTotal > 0 ? undefined : undefined, // Giữ nguyên totalTrips
          },
        });
      }

      // C. Tạo ItemReviews
      if (hasItemReviews) {
        for (const ir of dto.itemReviews!) {
          const itemReview = await tx.itemReview.create({
            data: {
              orderId: order.id,
              userId,
              menuItemId: ir.menuItemId,
              rating: ir.rating,
              comment: this.sanitizeComment(ir.comment),
            },
          });
          createdItemReviews.push(itemReview);

          // Tính lại điểm trung bình Món ăn
          const itemAgg = await tx.itemReview.aggregate({
            where: { menuItemId: ir.menuItemId },
            _avg: { rating: true },
            _count: { rating: true },
          });

          const newItemAvg = Number((itemAgg._avg.rating || 5.0).toFixed(1));
          const newItemTotal = itemAgg._count.rating || 0;

          await tx.menuItem.update({
            where: { id: ir.menuItemId },
            data: {
              rating: newItemAvg,
              totalReviews: newItemTotal,
            },
          });
        }
      }

      return {
        restaurantReview: createdRestaurantReview,
        driverReview: createdDriverReview,
        itemReviews: createdItemReviews,
      };
    });

    // 7. Gửi thông báo (Notification Center + FCM)
    try {
      if (result.restaurantReview && order.restaurant.ownerId) {
        await this.notificationService.createNotification({
          recipientId: order.restaurant.ownerId,
          recipientType: 'PARTNER',
          title: `Đánh giá mới cho đơn #${order.orderCode}`,
          body: `Khách hàng đã đánh giá ${result.restaurantReview.rating}⭐ cho nhà hàng của bạn.`,
          data: {
            type: 'FOOD_REVIEW_RECEIVED',
            orderId: order.id,
            rating: result.restaurantReview.rating,
            deepLink: `/food-merchant/reviews`,
          },
          eventKey: `review_restaurant_${order.id}`,
        });
      }

      if (result.driverReview && order.driverId) {
        await this.notificationService.createNotification({
          recipientId: order.driverId,
          recipientType: 'USER',
          title: `Đánh giá chuyến giao #${order.orderCode}`,
          body: `Bạn vừa nhận được đánh giá ${result.driverReview.rating}⭐ từ khách hàng.`,
          data: {
            type: 'DRIVER_REVIEW_RECEIVED',
            orderId: order.id,
            rating: result.driverReview.rating,
          },
          eventKey: `review_driver_${order.id}`,
        });
      }
    } catch (notifErr: any) {
      this.logger.warn(`Không thể gửi thông báo đánh giá đơn ${order.id}: ${notifErr.message}`);
    }

    return {
      success: true,
      message: 'Gửi đánh giá đơn hàng thành công',
      orderId: order.id,
      reviews: result,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. LẤY ĐÁNH GIÁ THEO ĐƠN HÀNG (GET ORDER REVIEWS)
  // ══════════════════════════════════════════════════════════════════════════════

  async getOrderReviews(userId: string, orderId: string) {
    const order = await this.prisma.foodOrder.findUnique({
      where: { id: orderId },
      include: {
        restaurantReview: true,
        driverReview: true,
        itemReviews: {
          include: {
            menuItem: { select: { id: true, name: true, image: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đánh giá của đơn hàng này');
    }

    const isReviewed = !!(
      order.restaurantReview ||
      order.driverReview ||
      (order.itemReviews && order.itemReviews.length > 0)
    );

    return {
      orderId: order.id,
      isReviewed,
      status: order.status,
      restaurantReview: order.restaurantReview,
      driverReview: order.driverReview,
      itemReviews: order.itemReviews,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. DANH SÁCH ĐÁNH GIÁ NHÀ HÀNG (PUBLIC & PRIVACY MASKING)
  // ══════════════════════════════════════════════════════════════════════════════

  async getRestaurantReviews(restaurantId: string, query: RestaurantReviewsQueryDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, rating: true, totalReviews: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereCondition: any = { restaurantId };
    if (query.rating) {
      whereCondition.rating = Number(query.rating);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (query.sort === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    // Query song song: danh sách review + phân bố sao
    const [reviews, totalCount, fiveStar, fourStar, threeStar, twoStar, oneStar] = await Promise.all([
      this.prisma.restaurantReview.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.restaurantReview.count({ where: whereCondition }),
      this.prisma.restaurantReview.count({ where: { restaurantId, rating: 5 } }),
      this.prisma.restaurantReview.count({ where: { restaurantId, rating: 4 } }),
      this.prisma.restaurantReview.count({ where: { restaurantId, rating: 3 } }),
      this.prisma.restaurantReview.count({ where: { restaurantId, rating: 2 } }),
      this.prisma.restaurantReview.count({ where: { restaurantId, rating: 1 } }),
    ]);

    const totalAllReviews = fiveStar + fourStar + threeStar + twoStar + oneStar;

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      ratingSummary: {
        averageRating: restaurant.rating,
        totalReviews: totalAllReviews,
        starBreakdown: {
          5: fiveStar,
          4: fourStar,
          3: threeStar,
          2: twoStar,
          1: oneStar,
        },
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          fullName: this.maskUserName(r.user.fullName),
          avatarUrl: r.user.avatarUrl,
        },
      })),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. DANH SÁCH ĐÁNH GIÁ MÓN ĂN (MENU ITEM REVIEWS)
  // ══════════════════════════════════════════════════════════════════════════════

  async getItemReviews(menuItemId: string, query: ItemReviewsQueryDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: { id: true, name: true, rating: true, totalReviews: true },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.prisma.itemReview.findMany({
        where: { menuItemId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.itemReview.count({ where: { menuItemId } }),
    ]);

    return {
      menuItemId: item.id,
      menuItemName: item.name,
      ratingSummary: {
        averageRating: item.rating,
        totalReviews: item.totalReviews,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          fullName: this.maskUserName(r.user.fullName),
          avatarUrl: r.user.avatarUrl,
        },
      })),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. MERCHANT XEM ĐÁNH GIÁ CỦA QUÁN MÌNH
  // ══════════════════════════════════════════════════════════════════════════════

  async getMerchantReviews(merchantUserId: string, query: RestaurantReviewsQueryDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new NotFoundException('Bạn chưa được liên kết với nhà hàng nào');
    }

    return this.getRestaurantReviews(restaurant.id, query);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. DRIVER XEM ĐÁNH GIÁ CỦA MÌNH
  // ══════════════════════════════════════════════════════════════════════════════

  async getDriverReviews(driverId: string, query: DriverReviewsQueryDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, fullName: true, rating: true },
    });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài xế');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.prisma.driverReview.findMany({
        where: { driverId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.driverReview.count({ where: { driverId } }),
    ]);

    return {
      driverId: driver.id,
      driverName: driver.fullName,
      ratingSummary: {
        averageRating: driver.rating,
        totalReviews: totalCount,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          fullName: this.maskUserName(r.user.fullName),
          avatarUrl: r.user.avatarUrl,
        },
      })),
    };
  }
}
