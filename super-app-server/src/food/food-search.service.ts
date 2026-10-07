import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoodSearchQueryDto, FoodDiscoveryQueryDto, FoodSearchSort } from './dto/food-search.dto';

@Injectable()
export class FoodSearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (Haversine Formula)
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính Trái Đất (km)
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
   * Kiểm tra thời gian hiện tại có nằm trong giờ mở cửa quán hay không
   */
  isWithinOpeningHours(openingHours?: string): boolean {
    if (!openingHours || !openingHours.includes('-')) return true;
    try {
      const [openStr, closeStr] = openingHours.split('-').map((s) => s.trim());
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = openStr.split(':').map(Number);
      const [closeH, closeM] = closeStr.split(':').map(Number);
      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);

      if (closeMinutes >= openMinutes) {
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      } else {
        // Quán mở qua đêm (ví dụ: 18:00 - 02:00)
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }
    } catch {
      return true;
    }
  }

  /**
   * Tính toán phí giao hàng cơ sở theo khoảng cách
   */
  estimateShippingFee(distanceKm: number): number {
    const d = Math.round(distanceKm * 2) / 2;
    let baseFee = 15000;
    if (d > 3) {
      const n = Math.floor(d);
      const baseForN = 15000 + (n - 3) * 5000;
      baseFee = d === n ? baseForN : baseForN + 3000;
    }
    return baseFee;
  }

  /**
   * TÌM KIẾM TỔNG HỢP (Nhà hàng & Món ăn kết hợp)
   */
  async searchCombined(dto: FoodSearchQueryDto) {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(dto.limit) || 20));

    const [restaurantsRes, menuItemsRes] = await Promise.all([
      this.searchRestaurants({ ...dto, page, limit: Math.min(limit, 10) }),
      this.searchMenuItems({ ...dto, page, limit }),
    ]);

    return {
      query: dto.q || '',
      restaurants: restaurantsRes,
      menuItems: menuItemsRes,
      totalResults: restaurantsRes.pagination.total + menuItemsRes.pagination.total,
    };
  }

  /**
   * TÌM KIẾM NHÀ HÀNG (Filters, Sorting, GPS Distance, Pagination)
   */
  async searchRestaurants(dto: FoodSearchQueryDto) {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(dto.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    // 1. Lọc theo từ khóa tìm kiếm (tên quán, địa chỉ, hoặc quán có món/danh mục khớp từ khóa)
    if (dto.q && dto.q.trim()) {
      const cleanQ = dto.q.trim();
      const variants = Array.from(
        new Set([
          cleanQ,
          cleanQ.toLowerCase(),
          cleanQ.toUpperCase(),
          cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1).toLowerCase(),
        ])
      ).filter(Boolean);

      const searchConditions: any[] = [];
      for (const term of variants) {
        searchConditions.push(
          { name: { contains: term, mode: 'insensitive' } },
          { address: { contains: term, mode: 'insensitive' } },
          {
            items: {
              some: {
                name: { contains: term, mode: 'insensitive' },
                isAvailable: true,
              },
            },
          },
          {
            categories: {
              some: {
                name: { contains: term, mode: 'insensitive' },
              },
            },
          }
        );
      }
      where.OR = searchConditions;
    }

    // 2. Lọc theo trạng thái Mở cửa
    if (dto.isOpen !== undefined && dto.isOpen !== null) {
      if (dto.isOpen) {
        where.isOpen = true;
      }
    }

    // 3. Lọc theo đánh giá tối thiểu (Rating)
    if (dto.minRating !== undefined && dto.minRating > 0) {
      where.rating = { gte: Number(dto.minRating) };
    }

    // 4. Lọc theo quán có voucher đang hoạt động
    const now = new Date();
    if (dto.hasVoucher) {
      where.vouchers = {
        some: {
          isActive: true,
          startAt: { lte: now },
          endAt: { gte: now },
        },
      };
    }

    // 5. Lấy toàn bộ danh sách phù hợp để tính khoảng cách và sắp xếp
    const hasGps = typeof dto.latitude === 'number' && typeof dto.longitude === 'number';

    // Xác định orderBy trong Database nếu không sort theo distance
    let dbOrderBy: any = { rating: 'desc' };
    if (dto.sort === FoodSearchSort.RATING) {
      dbOrderBy = { rating: 'desc' };
    } else if (dto.sort === FoodSearchSort.REVIEW_COUNT) {
      dbOrderBy = { totalReviews: 'desc' };
    }

    const rawRestaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: dbOrderBy,
      include: {
        vouchers: {
          where: {
            isActive: true,
            startAt: { lte: now },
            endAt: { gte: now },
          },
          select: { id: true, code: true, name: true, type: true, value: true, maxDiscount: true },
        },
        items: {
          where: { isAvailable: true },
          take: 3,
          select: { id: true, name: true, price: true, image: true },
        },
      },
    });

    // 6. Xử lý logic khoảng cách GPS thật (không dùng GPS giả)
    let processed = rawRestaurants.map((res) => {
      let distanceKm: number | null = null;
      let estimatedDeliveryTime: string | null = null;
      let shippingFee: number | null = null;

      if (hasGps) {
        distanceKm = this.calculateDistanceKm(dto.latitude!, dto.longitude!, res.latitude, res.longitude);
        const estMinutes = Math.max(15, Math.round(distanceKm * 4 + 15));
        estimatedDeliveryTime = `${estMinutes} phút`;
        shippingFee = this.estimateShippingFee(distanceKm);
      }

      const isCurrentlyOpen = res.isOpen && this.isWithinOpeningHours(res.openingHours);
      const activeVouchers = res.vouchers.map((v) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        type: v.type,
        value: v.value,
        maxDiscount: v.maxDiscount,
      }));

      const hasFreeshipVoucher = res.vouchers.some((v) => v.type === 'FREESHIP');
      const hasFreeShip = hasFreeshipVoucher || (distanceKm !== null && distanceKm <= 3);

      return {
        id: res.id,
        name: res.name,
        slug: res.slug,
        avatar: res.avatar,
        coverImage: res.coverImage,
        address: res.address,
        rating: res.rating,
        totalReviews: res.totalReviews,
        openingHours: res.openingHours,
        isOpen: res.isOpen,
        isCurrentlyOpen,
        distanceKm,
        estimatedDeliveryTime,
        shippingFee,
        hasVoucher: activeVouchers.length > 0,
        hasFreeShip,
        vouchers: activeVouchers,
        featuredItems: res.items,
      };
    });

    // 7. Lọc theo maxDistance nếu có GPS
    if (hasGps && dto.maxDistance !== undefined && dto.maxDistance > 0) {
      processed = processed.filter((r) => r.distanceKm !== null && r.distanceKm <= Number(dto.maxDistance));
    }

    // 8. Lọc theo hasFreeShip nếu có yêu cầu
    if (dto.hasFreeShip) {
      processed = processed.filter((r) => r.hasFreeShip);
    }

    // 9. Lọc thêm giờ mở cửa thực tế nếu isOpen=true
    if (dto.isOpen) {
      processed = processed.filter((r) => r.isCurrentlyOpen);
    }

    // 10. Sắp xếp kết quả (Sort)
    if (dto.sort === FoodSearchSort.DISTANCE && hasGps) {
      processed.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (dto.sort === FoodSearchSort.RATING) {
      processed.sort((a, b) => b.rating - a.rating);
    } else if (dto.sort === FoodSearchSort.REVIEW_COUNT) {
      processed.sort((a, b) => b.totalReviews - a.totalReviews);
    } else {
      // Relevance (Mặc định):
      // Ưu tiên trùng tên chính xác > bắt đầu bằng > chứa từ khóa > quán đang mở > rating cao
      const qLower = (dto.q || '').toLowerCase().trim();
      processed.sort((a, b) => {
        if (qLower) {
          const aExact = a.name.toLowerCase() === qLower ? 1 : 0;
          const bExact = b.name.toLowerCase() === qLower ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;

          const aStarts = a.name.toLowerCase().startsWith(qLower) ? 1 : 0;
          const bStarts = b.name.toLowerCase().startsWith(qLower) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;
        }

        // Ưu tiên quán đang mở
        const aOpen = a.isCurrentlyOpen ? 1 : 0;
        const bOpen = b.isCurrentlyOpen ? 1 : 0;
        if (aOpen !== bOpen) return bOpen - aOpen;

        // Ưu tiên rating cao hơn
        return b.rating - a.rating;
      });
    }

    // 11. Áp dụng Pagination server-side
    const total = processed.length;
    const items = processed.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * TÌM KIẾM MÓN ĂN (Menu Items, Giá, Danh mục, Pagination)
   */
  async searchMenuItems(dto: FoodSearchQueryDto) {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(dto.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isAvailable: true,
      restaurant: {
        isActive: true,
      },
    };

    // 1. Lọc theo từ khóa tìm kiếm
    if (dto.q && dto.q.trim()) {
      const cleanQ = dto.q.trim();
      const variants = Array.from(
        new Set([
          cleanQ,
          cleanQ.toLowerCase(),
          cleanQ.toUpperCase(),
          cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1).toLowerCase(),
        ])
      ).filter(Boolean);

      const itemSearchConditions: any[] = [];
      for (const term of variants) {
        itemSearchConditions.push(
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { restaurant: { name: { contains: term, mode: 'insensitive' } } }
        );
      }
      where.OR = itemSearchConditions;
    }

    // 2. Lọc theo danh mục
    if (dto.categoryId && dto.categoryId.trim()) {
      where.categoryId = dto.categoryId.trim();
    }

    // 3. Lọc theo nhà hàng
    if (dto.restaurantId && dto.restaurantId.trim()) {
      where.restaurantId = dto.restaurantId.trim();
    }

    // 4. Lọc theo khoảng giá
    if (dto.minPrice !== undefined && dto.minPrice >= 0) {
      where.price = { ...where.price, gte: Number(dto.minPrice) };
    }
    if (dto.maxPrice !== undefined && dto.maxPrice > 0) {
      where.price = { ...where.price, lte: Number(dto.maxPrice) };
    }

    // 5. Lọc theo rating tối thiểu của món
    if (dto.minRating !== undefined && dto.minRating > 0) {
      where.rating = { gte: Number(dto.minRating) };
    }

    // 6. Lọc nếu yêu cầu quán đang mở
    if (dto.isOpen) {
      where.restaurant = {
        ...where.restaurant,
        isOpen: true,
      };
    }

    // 7. Sắp xếp (Sort)
    let orderBy: any = [{ rating: 'desc' }, { totalReviews: 'desc' }];
    if (dto.sort === FoodSearchSort.PRICE_ASC) {
      orderBy = { price: 'asc' };
    } else if (dto.sort === FoodSearchSort.PRICE_DESC) {
      orderBy = { price: 'desc' };
    } else if (dto.sort === FoodSearchSort.RATING) {
      orderBy = { rating: 'desc' };
    } else if (dto.sort === FoodSearchSort.REVIEW_COUNT) {
      orderBy = { totalReviews: 'desc' };
    }

    const hasGps = typeof dto.latitude === 'number' && typeof dto.longitude === 'number';

    const [total, rawItems] = await Promise.all([
      this.prisma.menuItem.count({ where }),
      this.prisma.menuItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              avatar: true,
              address: true,
              latitude: true,
              longitude: true,
              isOpen: true,
              openingHours: true,
              rating: true,
            },
          },
        },
      }),
    ]);

    const items = rawItems.map((item) => {
      let distanceKm: number | null = null;
      if (hasGps && item.restaurant) {
        distanceKm = this.calculateDistanceKm(
          dto.latitude!,
          dto.longitude!,
          item.restaurant.latitude,
          item.restaurant.longitude,
        );
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        calories: item.calories,
        isAvailable: item.isAvailable,
        rating: item.rating,
        totalReviews: item.totalReviews,
        category: item.category,
        restaurantId: item.restaurant.id,
        restaurantName: item.restaurant.name,
        restaurantAvatar: item.restaurant.avatar,
        restaurantAddress: item.restaurant.address,
        restaurant: {
          id: item.restaurant.id,
          name: item.restaurant.name,
          avatar: item.restaurant.avatar,
          address: item.restaurant.address,
          isOpen: item.restaurant.isOpen,
          rating: item.restaurant.rating,
          distanceKm,
        },
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * KHÁM PHÁ TRANG CHỦ FOOD (DISCOVERY FEEDS)
   * Sử dụng dữ liệu thực từ PostgreSQL, không tạo dữ liệu giả
   */
  async getDiscovery(dto: FoodDiscoveryQueryDto) {
    const limit = Math.min(20, Math.max(1, Number(dto.limit) || 6));
    const now = new Date();
    const hasGps = typeof dto.latitude === 'number' && typeof dto.longitude === 'number';

    const [
      featuredRaw,
      topRatedRaw,
      activeRestaurants,
      popularDishStats,
      categories,
    ] = await Promise.all([
      // 1. Quán ăn nổi bật (Active, đánh giá cao, nhiều review)
      this.prisma.restaurant.findMany({
        where: { isActive: true },
        orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
        take: limit,
        include: {
          vouchers: {
            where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
            select: { id: true, code: true, name: true, type: true, value: true },
          },
        },
      }),

      // 2. Quán có rating >= 4.5
      this.prisma.restaurant.findMany({
        where: { isActive: true, rating: { gte: 4.5 } },
        orderBy: { rating: 'desc' },
        take: limit,
      }),

      // 3. Tất cả quán active để tính khoảng cách & mở cửa
      this.prisma.restaurant.findMany({
        where: { isActive: true },
        take: 30,
        include: {
          vouchers: {
            where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
            select: { id: true, code: true, name: true, type: true, value: true },
          },
        },
      }),

      // 4. Món ăn phổ biến dựa trên lượt đặt thực tế (FoodOrderItem)
      this.prisma.foodOrderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit,
      }),

      // 5. Danh mục món ăn thực tế
      this.prisma.menuCategory.findMany({
        distinct: ['name'],
        take: 12,
        select: { id: true, name: true },
      }),
    ]);

    // Format hàm gắn GPS & Open State
    const formatRestaurant = (res: any) => {
      let distanceKm: number | null = null;
      let estimatedDeliveryTime: string | null = null;
      let shippingFee: number | null = null;

      if (hasGps) {
        distanceKm = this.calculateDistanceKm(dto.latitude!, dto.longitude!, res.latitude, res.longitude);
        const estMinutes = Math.max(15, Math.round(distanceKm * 4 + 15));
        estimatedDeliveryTime = `${estMinutes} phút`;
        shippingFee = this.estimateShippingFee(distanceKm);
      }

      const isCurrentlyOpen = res.isOpen && this.isWithinOpeningHours(res.openingHours);

      return {
        id: res.id,
        name: res.name,
        slug: res.slug,
        avatar: res.avatar,
        coverImage: res.coverImage,
        address: res.address,
        rating: res.rating,
        totalReviews: res.totalReviews,
        isOpen: res.isOpen,
        isCurrentlyOpen,
        distanceKm,
        estimatedDeliveryTime,
        shippingFee,
        hasVoucher: Boolean(res.vouchers && res.vouchers.length > 0),
        vouchers: res.vouchers || [],
      };
    };

    // Quán gần bạn (Sắp xếp theo distance nếu có GPS)
    let nearby = activeRestaurants.map(formatRestaurant);
    if (hasGps) {
      nearby.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      nearby = nearby.slice(0, limit);
    } else {
      nearby = nearby.slice(0, limit);
    }

    // Quán đang mở cửa
    const openNow = activeRestaurants
      .map(formatRestaurant)
      .filter((r) => r.isCurrentlyOpen)
      .slice(0, limit);

    // Quán có khuyến mãi / Voucher
    const withVouchers = activeRestaurants
      .map(formatRestaurant)
      .filter((r) => r.hasVoucher)
      .slice(0, limit);

    // Xử lý món phổ biến thực tế từ Database
    let popularDishes: any[] = [];
    if (popularDishStats.length > 0) {
      const itemIds = popularDishStats.map((s) => s.menuItemId);
      const itemsInDb = await this.prisma.menuItem.findMany({
        where: { id: { in: itemIds }, isAvailable: true },
        include: {
          restaurant: { select: { id: true, name: true, avatar: true, isOpen: true } },
        },
      });

      const itemMap = new Map(itemsInDb.map((it) => [it.id, it]));
      popularDishes = popularDishStats
        .map((stat) => {
          const item = itemMap.get(stat.menuItemId);
          if (!item) return null;
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            image: item.image,
            rating: item.rating,
            totalReviews: item.totalReviews,
            orderCount: stat._sum.quantity || stat._count.id,
            restaurant: item.restaurant,
          };
        })
        .filter(Boolean);
    }

    // Nếu dữ liệu đơn hàng chưa đủ, lấy các món có rating cao nhất từ DB (không dùng mock/fake)
    if (popularDishes.length < limit) {
      const topRatedItems = await this.prisma.menuItem.findMany({
        where: {
          isAvailable: true,
          ...(popularDishes.length > 0 ? { id: { notIn: popularDishes.map((p) => p.id) } } : {}),
        },
        orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
        take: limit - popularDishes.length,
        include: {
          restaurant: { select: { id: true, name: true, avatar: true, isOpen: true } },
        },
      });

      popularDishes = [
        ...popularDishes,
        ...topRatedItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          rating: item.rating,
          totalReviews: item.totalReviews,
          orderCount: item.totalReviews || 0,
          restaurant: item.restaurant,
        })),
      ];
    }

    return {
      featured: featuredRaw.map(formatRestaurant),
      topRated: topRatedRaw.map(formatRestaurant),
      nearby,
      openNow,
      withVouchers,
      popularDishes,
      categories,
    };
  }
}
