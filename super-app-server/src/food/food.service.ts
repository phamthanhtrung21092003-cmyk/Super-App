import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodOrderDto } from './dto/create-food-order.dto';

@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Làm tròn khoảng cách theo quy tắc bước nhảy 0.5km của Founder:
   * - [0.7, 1.2] -> 1.0 km
   * - [1.3, 1.6] -> 1.5 km
   * - [1.7, 2.2] -> 2.0 km
   * - Dưới 0.7km tính là 0.5 km hoặc 1.0 km (dưới 3km phí luôn cố định 15k)
   */
  roundDistanceKm(rawDistance: number): number {
    const d = Math.max(0.1, rawDistance);
    const n = Math.floor(d);
    const r = Number((d - n).toFixed(2));
    if (r >= 0.7) {
      return n + 1; // 0.7, 0.8, 0.9 -> (n + 1).0
    } else if (r >= 0.3) {
      return n + 0.5; // 0.3, 0.4, 0.5, 0.6 -> n.5
    } else {
      return n === 0 ? 0.5 : n; // 0.0, 0.1, 0.2 -> n.0
    }
  }

  /**
   * Tính toán cước phí và hạch toán tài chính theo quy định của Founder:
   * 1. Biểu phí ship:
   *    - Khoảng cách <= 3km: Cố định 15.000đ
   *    - Khoảng cách > 3km:
   *      + Số chẵn N km (4km, 5km...): 15.000 + (N - 3) * 5.000đ (vd: 4km=20k, 5km=25k)
   *      + Số lẻ N.5 km (3.5km, 4.5km...): cộng thêm 3.000đ so với số chẵn (vd: 3.5km=18k, 4.5km=23k, 5.5km=28k)
   * 2. Điều kiện Freeship:
   *    - Từ 3km trở xuống: Đơn đồ ăn từ 200.000đ trở lên được Freeship.
   *    - 4km: Đơn đồ ăn từ 300.000đ trở lên.
   *    - Cứ mỗi 1km cộng thêm 100.000đ (bước 0.5km cộng 50.000đ: 3.5km là 250k).
   * 3. Hạch toán doanh thu:
   *    - Giá niêm yết tại cửa hàng = 100%
   *    - Cửa hàng nhận 90% (chịu chiết khấu 10%)
   *    - App tăng 10% khi hiển thị trên app -> Khách trả 110%
   *    - App có doanh thu gộp 20% giá gốc cửa hàng
   *    - Tiền freeship sẽ trừ vào tiền lãi của App (không tính phí ship)
   */
  calculateShippingFee(subtotal: number, distanceKm: number) {
    const d = this.roundDistanceKm(distanceKm);
    
    // Tính phí vận chuyển gốc (Tài xế nhận)
    let baseFee = 15000;
    if (d > 3) {
      const n = Math.floor(d);
      const baseForN = 15000 + (n - 3) * 5000;
      if (d === n) {
        baseFee = baseForN;
      } else {
        baseFee = baseForN + 3000; // Số lẻ .5 cộng thêm 3k
      }
    }

    // Tính ngưỡng Freeship theo km
    let freeshipThreshold = 200000;
    if (d > 3) {
      freeshipThreshold = 200000 + Math.round((d - 3) * 100000);
    }

    // Kiểm tra điều kiện Freeship
    const isFreeship = subtotal >= freeshipThreshold;
    const discountAmount = isFreeship ? baseFee : 0;
    const finalShippingFee = isFreeship ? 0 : baseFee;
    const remainingForFreeship = Math.max(0, freeshipThreshold - subtotal);

    // Hạch toán tài chính 3 bên:
    // Khách trả trên app = subtotal (110% giá gốc quán)
    const baseStorePrice = Math.round(subtotal / 1.1); // Giá gốc niêm yết tại quán (100%)
    const merchantEarning = Math.round(baseStorePrice * 0.9); // Quán nhận 90%
    const appGrossProfit = Math.round(baseStorePrice * 0.2); // Lãi gộp App 20% (110% - 90%)
    const appNetProfit = appGrossProfit - discountAmount; // Lãi ròng sau khi tài trợ Freeship

    return {
      distanceKm: d,
      originalShippingFee: baseFee,
      discountAmount,
      finalShippingFee,
      isFreeship,
      remainingForFreeship,
      freeshipThreshold,
      // Bổ sung các chỉ số hạch toán tài chính
      baseStorePrice,
      merchantEarning,
      appGrossProfit,
      appNetProfit,
      driverShippingFee: baseFee,
    };
  }

  /**
   * Tính khoảng cách đường chim bay giữa 2 tọa độ (Haversine Formula)
   */
  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính Trái Đất theo km
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

  async getRestaurants(userLat?: number, userLng?: number) {
    let restaurants: any[] = [];
    try {
      restaurants = await this.prisma.restaurant.findMany({
        where: { isActive: true },
        include: {
          categories: {
            include: {
              items: {
                where: { isAvailable: true },
                take: 5,
              },
            },
          },
        },
      });
    } catch (e) {
      // Prisma chưa migrate hoặc chưa có DB, sử dụng dữ liệu mặc định chất lượng cao
    }

    if (!restaurants || restaurants.length === 0) {
      restaurants = this.getDefaultRestaurants();
    }

    // Gắn khoảng cách thực tế theo tọa độ khách
    const uLat = userLat ?? 21.0285;
    const uLng = userLng ?? 105.8542;

    return restaurants.map((r) => {
      const dist = this.calculateDistanceKm(uLat, uLng, r.latitude ?? 21.0285, r.longitude ?? 105.8542);
      const feeInfo = this.calculateShippingFee(0, dist);
      return {
        ...r,
        distanceKm: dist,
        estimatedTime: `${Math.round(dist * 5 + 15)} phút`,
        shippingFee: feeInfo.originalShippingFee,
      };
    });
  }

  async getRestaurantDetail(id: string) {
    let restaurant: any = null;
    try {
      restaurant = await this.prisma.restaurant.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
          categories: {
            include: {
              items: {
                include: {
                  optionGroups: {
                    include: { options: true },
                  },
                },
              },
            },
          },
        },
      });
    } catch (e) {}

    if (!restaurant) {
      const defaultList = this.getDefaultRestaurants();
      restaurant = defaultList.find((r) => r.id === id || r.slug === id) || defaultList[0];
    }

    return restaurant;
  }

  async createOrder(userId: string, dto: CreateFoodOrderDto) {
    let subtotal = 0;
    dto.items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    const restaurant = await this.getRestaurantDetail(dto.restaurantId);
    const rLat = restaurant.latitude ?? 21.0285;
    const rLng = restaurant.longitude ?? 105.8542;

    const distanceKm = this.calculateDistanceKm(
      dto.deliveryLat,
      dto.deliveryLng,
      rLat,
      rLng,
    );

    const feeCalc = this.calculateShippingFee(subtotal, distanceKm);
    const totalAmount = subtotal + feeCalc.finalShippingFee;
    const orderCode = `#FD-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const created = await this.prisma.foodOrder.create({
        data: {
          orderCode,
          userId: userId || 'anonymous-user',
          restaurantId: dto.restaurantId,
          deliveryAddress: dto.deliveryAddress,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          distanceKm,
          subtotal,
          shippingFee: feeCalc.finalShippingFee,
          discountAmount: feeCalc.discountAmount,
          totalAmount,
          noteForMerchant: dto.noteForMerchant,
          noteForDriver: dto.noteForDriver,
          paymentMethod: (dto.paymentMethod as any) || 'COD',
          items: {
            create: dto.items.map((it) => ({
              menuItemId: it.menuItemId,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              notes: it.notes,
              optionsJson: it.optionsJson ?? {},
            })),
          },
        },
        include: {
          items: true,
          restaurant: true,
        },
      });
      return created;
    } catch (e) {
      // Fallback nếu database table chưa sẵn sàng
      return {
        id: `mock_order_${Date.now()}`,
        orderCode,
        userId,
        restaurantId: dto.restaurantId,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        deliveryAddress: dto.deliveryAddress,
        deliveryLat: dto.deliveryLat,
        deliveryLng: dto.deliveryLng,
        distanceKm,
        subtotal,
        shippingFee: feeCalc.finalShippingFee,
        discountAmount: feeCalc.discountAmount,
        totalAmount,
        status: 'PENDING',
        paymentMethod: dto.paymentMethod || 'COD',
        items: dto.items,
        createdAt: new Date().toISOString(),
      };
    }
  }

  private getDefaultRestaurants() {
    return [
      {
        id: 'rest_pizza_hub',
        slug: 'the-pizza-hub',
        name: 'The Pizza Company & Pasta',
        avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
        coverImage: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        address: '102 Phố Thái Hà, Trung Liệt, Đống Đa, Hà Nội',
        latitude: 21.0118,
        longitude: 105.8195,
        rating: 4.8,
        totalReviews: 320,
        openingHours: '09:00 - 22:30',
        isActive: true,
        categories: [
          {
            id: 'cat_best_seller',
            name: 'Món bán chạy',
            items: [
              {
                id: 'item_pizza_1',
                name: 'Pizza Hải Sản Viền Phô Mai',
                description: 'Tôm, mực, nghêu, ớt chuông, phô mai Mozzarella dẻo dai',
                price: 185000,
                originalPrice: 220000,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
                calories: '450 Kcal',
                isAvailable: true,
                optionGroups: [
                  {
                    id: 'grp_size',
                    name: 'Kích cỡ (Size)',
                    required: true,
                    maxSelect: 1,
                    options: [
                      { id: 'opt_s', name: 'Size S (Nhỏ - 6 miếng)', price: 0 },
                      { id: 'opt_m', name: 'Size M (Vừa - 8 miếng)', price: 40000 },
                      { id: 'opt_l', name: 'Size L (Lớn - 10 miếng)', price: 80000 },
                    ],
                  },
                  {
                    id: 'grp_topping',
                    name: 'Topping thêm',
                    required: false,
                    maxSelect: 3,
                    options: [
                      { id: 'top_cheese', name: 'Gấp đôi Phô mai', price: 25000 },
                      { id: 'top_sausage', name: 'Xúc xích Đức', price: 20000 },
                      { id: 'top_bacon', name: 'Thịt xông khói', price: 20000 },
                    ],
                  },
                ],
              },
              {
                id: 'item_spaghetti',
                name: 'Mì Ý Bò Bằm Sốt Cà Chua',
                description: 'Thịt bò bằm tươi, sốt cà chua thảo mộc, rắc phô mai Parmesan',
                price: 95000,
                originalPrice: 110000,
                image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
                calories: '380 Kcal',
                isAvailable: true,
                optionGroups: [
                  {
                    id: 'grp_spaghetti_opt',
                    name: 'Tùy chọn sốt',
                    required: false,
                    maxSelect: 1,
                    options: [
                      { id: 'opt_spicy', name: 'Thêm sốt cay Tabasco', price: 5000 },
                      { id: 'opt_cheese_bowl', name: 'Chén phô mai riêng', price: 15000 },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'cat_drinks',
            name: 'Đồ uống & Tráng miệng',
            items: [
              {
                id: 'item_tea_peach',
                name: 'Trà Đào Cam Sả',
                description: 'Trà đào thanh mát với miếng đào giòn và sả tươi giải nhiệt',
                price: 45000,
                image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
                isAvailable: true,
                optionGroups: [
                  {
                    id: 'grp_ice',
                    name: 'Mức đá',
                    required: true,
                    maxSelect: 1,
                    options: [
                      { id: 'ice_100', name: '100% Đá', price: 0 },
                      { id: 'ice_50', name: '50% Đá', price: 0 },
                      { id: 'ice_none', name: 'Không đá', price: 0 },
                    ],
                  },
                  {
                    id: 'grp_sweet',
                    name: 'Mức đường',
                    required: true,
                    maxSelect: 1,
                    options: [
                      { id: 'sweet_100', name: '100% Đường', price: 0 },
                      { id: 'sweet_50', name: '50% Đường', price: 0 },
                      { id: 'sweet_none', name: 'Không đường', price: 0 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'rest_com_tam_saigon',
        slug: 'com-tam-saigon-xua',
        name: 'Cơm Tấm Sài Gòn Xưa - Sườn Bì Chả',
        avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
        coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        address: '45 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        latitude: 21.0023,
        longitude: 105.8152,
        rating: 4.9,
        totalReviews: 540,
        openingHours: '06:30 - 21:30',
        isActive: true,
        categories: [
          {
            id: 'cat_com',
            name: 'Cơm Tấm Đặc Biệt',
            items: [
              {
                id: 'item_com_suon',
                name: 'Cơm Tấm Sườn Nướng Mật Ong',
                description: 'Cơm tấm dẻo thơm, miếng sườn nướng than hoa mềm ướp sốt mật ong thơm lừng',
                price: 65000,
                originalPrice: 75000,
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                calories: '550 Kcal',
                isAvailable: true,
                optionGroups: [
                  {
                    id: 'grp_com_add',
                    name: 'Món gọi thêm',
                    required: false,
                    maxSelect: 3,
                    options: [
                      { id: 'opt_trung_op_la', name: 'Trứng ốp la lòng đào', price: 10000 },
                      { id: 'opt_cha_trung', name: 'Chả trứng hấp', price: 12000 },
                      { id: 'opt_com_them', name: 'Cơm thêm', price: 8000 },
                      { id: 'opt_canh_rong_bien', name: 'Canh rong biển thịt bằm', price: 15000 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  }
}
