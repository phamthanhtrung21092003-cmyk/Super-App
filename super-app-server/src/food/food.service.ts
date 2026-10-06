import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodOrderDto, CancelFoodOrderDto, UpdateFoodOrderStatusDto } from './dto/create-food-order.dto';
import { UserOrderQueryDto, OrderTabFilter } from './dto/order-history-query.dto';
import { FoodOrderStatus } from '@prisma/client';
import { FoodGateway } from './food.gateway';
import { NotificationService } from '../notification/notification.service';

/**
 * MA TRẬN CHUYỂN TRẠNG THÁI ĐƠN HÀNG HỢP LỆ (STATE MACHINE)
 */
const VALID_TRANSITIONS: Record<FoodOrderStatus, FoodOrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'CANCELLED'],
  FINDING_DRIVER: ['DRIVER_ACCEPTED', 'CANCELLED'],
  DRIVER_ACCEPTED: ['PICKED_UP', 'FINDING_DRIVER', 'CANCELLED'],
  PICKED_UP: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Trạng thái kết thúc - bất biến
  CANCELLED: [], // Trạng thái kết thúc - bất biến
};

@Injectable()
export class FoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodGateway: FoodGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Làm tròn khoảng cách theo quy tắc bước nhảy 0.5km của Founder:
   * - [0.7, 1.2] -> 1.0 km
   * - [1.3, 1.6] -> 1.5 km
   * - [1.7, 2.2] -> 2.0 km
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
   * Kiểm tra thời gian hiện tại có nằm trong openingHours ("HH:mm - HH:mm") của quán hay không (Theo giờ Việt Nam UTC+7)
   */
  isWithinOpeningHours(openingHours?: string | null): boolean {
    if (!openingHours || !openingHours.trim()) return true;

    const match = openingHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return true;

    const [, startH, startM, endH, endM] = match;
    const startMinutes = parseInt(startH, 10) * 60 + parseInt(startM, 10);
    const endMinutes = parseInt(endH, 10) * 60 + parseInt(endM, 10);

    const now = new Date();
    // Giờ VN = UTC + 7
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const vnMinutes = ((utcHours + 7) % 24) * 60 + utcMinutes;

    if (startMinutes <= endMinutes) {
      return vnMinutes >= startMinutes && vnMinutes <= endMinutes;
    } else {
      // Vắt qua nửa đêm (ví dụ 18:00 - 02:00)
      return vnMinutes >= startMinutes || vnMinutes <= endMinutes;
    }
  }

  /**
   * Tính toán cước phí và hạch toán tài chính theo quy định của Founder:
   * 1. Phí ship: 15.000đ cho 3km đầu; >3km số chẵn +5.000đ/km, số lẻ .5km cộng thêm 3.000đ.
   * 2. Freeship: <=3km đơn >=200k freeship; mỗi 1km tiếp theo +100k ngưỡng đơn.
   * 3. Hạch toán: Quán nhận 90%, App hiển thị +10% (Khách trả 110%), App lãi gộp 20%, Freeship trừ vào lãi App.
   */
  calculateShippingFee(subtotal: number, distanceKm: number) {
    const d = this.roundDistanceKm(distanceKm);
    
    // Tính phí vận chuyển gốc
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

    // Hạch toán tài chính 3 bên
    const baseStorePrice = Math.round(subtotal / 1.1); // Giá gốc niêm yết tại quán (100%)
    const merchantEarning = Math.round(baseStorePrice * 0.9); // Quán nhận 90%
    const appGrossProfit = Math.round(baseStorePrice * 0.2); // Lãi gộp App 20%
    const appNetProfit = appGrossProfit - discountAmount; // Lãi ròng sau khi tài trợ Freeship

    return {
      distanceKm: d,
      originalShippingFee: baseFee,
      discountAmount,
      finalShippingFee,
      isFreeship,
      remainingForFreeship,
      freeshipThreshold,
      baseStorePrice,
      merchantEarning,
      appGrossProfit,
      appNetProfit,
      driverShippingFee: baseFee,
    };
  }

  /**
   * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (Haversine Formula)
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  /**
   * Lấy danh sách quán ăn kèm khoảng cách và phí ship theo GPS
   */
  async getRestaurants(userLat?: number, userLng?: number) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              take: 5,
            },
          },
        },
      },
    });

    return restaurants.map((res) => {
      let distanceKm = 1.5;
      if (userLat !== undefined && userLng !== undefined) {
        distanceKm = this.calculateDistanceKm(userLat, userLng, res.latitude, res.longitude);
      }
      const feeInfo = this.calculateShippingFee(0, distanceKm);
      const estMinutes = Math.max(15, Math.round(distanceKm * 4 + 15));

      return {
        ...res,
        distanceKm: feeInfo.distanceKm,
        estimatedTime: `${estMinutes} phút`,
        shippingFee: feeInfo.finalShippingFee,
      };
    });
  }

  /**
   * Lấy chi tiết quán ăn, danh mục, menu, size và topping từ Database
   */
  async getRestaurantDetail(id: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        categories: {
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
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Quán ăn không tồn tại hoặc đã ngừng hoạt động');
    }

    if (!restaurant.isActive) {
      throw new BadRequestException('Quán ăn hiện đang đóng cửa');
    }

    return restaurant;
  }

  /**
   * TẠO ĐƠN HÀNG - DATABASE TRANSACTION TOÀN PHẦN, CHỐNG SỬA GIÁ VÀ IDEMPOTENCY
   */
  async createOrder(userId: string, dto: CreateFoodOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Giỏ hàng không có món ăn nào');
    }

    if (!dto.deliveryAddress || !dto.deliveryAddress.trim()) {
      throw new BadRequestException('Địa chỉ giao hàng không hợp lệ');
    }

    // 1. KIỂM TRA IDEMPOTENCY (CHỐNG ĐẶT TRÙNG)
    if (dto.idempotencyKey) {
      const existingOrderByKey = await this.prisma.foodOrder.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { items: true, restaurant: true },
      });
      if (existingOrderByKey) {
        return {
          ...existingOrderByKey,
          isDuplicateRequest: true,
          message: 'Đơn hàng đã được tạo trước đó (Idempotency Handled)',
        };
      }
    }

    // 2. CHỐNG DOUBLE-CLICK (Spam tạo đơn khi không có idempotencyKey trong vòng 5 giây)
    if (!dto.idempotencyKey) {
      const recentDuplicate = await this.prisma.foodOrder.findFirst({
        where: {
          userId,
          restaurantId: dto.restaurantId,
          status: 'PENDING',
          createdAt: { gte: new Date(Date.now() - 5000) },
        },
        include: { items: true, restaurant: true },
      });

      if (recentDuplicate && recentDuplicate.items.length === dto.items.length) {
        return {
          ...recentDuplicate,
          isDuplicateRequest: true,
          message: 'Đơn hàng tương tự vừa được tạo cách đây vài giây',
        };
      }
    }

    // 3. THỰC HIỆN DATABASE TRANSACTION TOÀN PHẦN
    let createdResult: any;
    try {
      createdResult = await this.prisma.$transaction(async (tx) => {
      // 3.1. Xác thực User
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('Tài khoản người dùng không tồn tại');
      }

      // 3.2. Kiểm tra Quán ăn trong Database
      const restaurant = await tx.restaurant.findUnique({
        where: { id: dto.restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException('Quán ăn không tồn tại hoặc đã ngừng kinh doanh');
      }
      if (!restaurant.isActive) {
        throw new BadRequestException('Quán ăn hiện đang tạm ngừng hoạt động');
      }
      if (!restaurant.isOpen) {
        throw new BadRequestException('Quán ăn hiện đang đóng cửa (chủ quán tắt nhận đơn)');
      }
      if (!this.isWithinOpeningHours(restaurant.openingHours)) {
        throw new BadRequestException(
          `Quán ăn hiện đang ngoài khung giờ mở cửa (${restaurant.openingHours}). Vui lòng quay lại sau!`,
        );
      }

      // 3.3. Tính khoảng cách GPS thật từ tọa độ khách đến tọa độ quán
      const distanceKm = this.calculateDistanceKm(
        dto.deliveryLat,
        dto.deliveryLng,
        restaurant.latitude,
        restaurant.longitude,
      );
      if (distanceKm > 30) {
        throw new BadRequestException(`Khoảng cách giao hàng (${distanceKm}km) vượt quá bán kính tối đa (30km)`);
      }

      // 3.4. Lấy dữ liệu tất cả món ăn trong DB để kiểm tra tính toàn vẹn (KHÔNG TIN GIÁ TỪ CLIENT)
      const menuItemIds = dto.items.map((i) => i.menuItemId);
      const dbItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        include: {
          optionGroups: {
            include: { options: true },
          },
        },
      });

      const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));
      let serverSubtotal = 0;
      const verifiedOrderItems: {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        totalPrice: number;
        notes?: string;
        optionsJson: any;
      }[] = [];

      for (const clientItem of dto.items) {
        const dbItem = dbItemMap.get(clientItem.menuItemId);

        if (!dbItem) {
          throw new NotFoundException(`Món ăn "${clientItem.menuItemId}" không tồn tại trong thực đơn quán`);
        }

        if (dbItem.restaurantId !== restaurant.id) {
          throw new BadRequestException(`Món "${dbItem.name}" không thuộc quán ăn "${restaurant.name}"`);
        }

        if (!dbItem.isAvailable) {
          throw new BadRequestException(`Món "${dbItem.name}" hiện đã tạm hết hàng`);
        }

        if (clientItem.quantity <= 0) {
          throw new BadRequestException(`Số lượng món "${dbItem.name}" phải lớn hơn 0`);
        }

        // Lấy giá cơ sở chuẩn từ Database (Giá niêm yết tại thời điểm tạo đơn)
        let verifiedUnitPrice = dbItem.price;

        // Xác thực phụ thu Size và Topping từ optionsJson đối chiếu với DB
        const optionsJson = clientItem.optionsJson || {};
        const verifiedSize = optionsJson.size;
        const verifiedToppings = optionsJson.toppings || [];

        // Kiểm tra Size từ DB
        if (verifiedSize && verifiedSize.name) {
          const sizeGroup = dbItem.optionGroups.find((g) =>
            g.name.toLowerCase().includes('size') || g.name.toLowerCase().includes('kích cỡ'),
          );
          if (sizeGroup) {
            const matchedOpt = sizeGroup.options.find((o) => o.name === verifiedSize.name);
            if (matchedOpt) {
              verifiedUnitPrice += matchedOpt.price;
            }
          }
        }

        // Kiểm tra Toppings từ DB
        if (Array.isArray(verifiedToppings) && verifiedToppings.length > 0) {
          const allDbOptions = dbItem.optionGroups.flatMap((g) => g.options);
          for (const top of verifiedToppings) {
            const matchedOpt = allDbOptions.find((o) => o.name === top.name);
            if (matchedOpt) {
              verifiedUnitPrice += matchedOpt.price;
            }
          }
        }

        const itemTotal = verifiedUnitPrice * clientItem.quantity;
        serverSubtotal += itemTotal;

        verifiedOrderItems.push({
          menuItemId: dbItem.id,
          name: dbItem.name,
          price: verifiedUnitPrice, // Snapshot giá 1 phần
          quantity: clientItem.quantity,
          totalPrice: itemTotal, // Snapshot tổng tiền dòng món
          notes: clientItem.notes || '',
          optionsJson: clientItem.optionsJson || {},
        });
      }

      // 3.5. Tính toán Cước phí & Freeship từ Server
      const feeCalc = this.calculateShippingFee(serverSubtotal, distanceKm);
      const finalTotal = serverSubtotal + feeCalc.finalShippingFee;
      const orderCode = `#FD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Xử lý thanh toán ví điện tử V-Life nếu chọn phương thức WALLET
      let paymentStatus = 'UNPAID';
      if (dto.paymentMethod === 'WALLET') {
        const userWallet = await tx.wallet.findUnique({ where: { userId } });
        if (!userWallet) {
          throw new BadRequestException('Tài khoản của bạn chưa có ví điện tử V-Life');
        }
        if (Number(userWallet.balance) < finalTotal) {
          throw new BadRequestException(
            `Số dư ví (${Number(userWallet.balance).toLocaleString('vi-VN')}đ) không đủ để thanh toán đơn hàng (${finalTotal.toLocaleString('vi-VN')}đ)`,
          );
        }
        const balanceBefore = Number(userWallet.balance);
        const balanceAfter = balanceBefore - finalTotal;
        await tx.wallet.update({
          where: { id: userWallet.id },
          data: { balance: balanceAfter },
        });
        await tx.transaction.create({
          data: {
            walletId: userWallet.id,
            amount: finalTotal,
            balanceBefore,
            balanceAfter,
            type: 'FOOD_PAYMENT',
            direction: 'DEBIT',
            status: 'SUCCESS',
            referenceId: orderCode,
            referenceType: 'FOOD_ORDER',
            idempotencyKey: `pay_food_${orderCode}`,
            description: `Thanh toán đơn hàng đồ ăn ${orderCode}`,
          },
        });
        paymentStatus = 'PAID';
      } else if (dto.paymentMethod === 'VIETQR') {
        paymentStatus = 'PENDING_PAYMENT';
      } else {
        paymentStatus = 'UNPAID';
      }

      // 3.6. Ghi nhận đơn hàng vào cơ sở dữ liệu PostgreSQL
      const initialStatus: FoodOrderStatus = restaurant.autoAcceptOrder ? 'CONFIRMED' : 'PENDING';
      const confirmedAt = restaurant.autoAcceptOrder ? new Date() : null;

      const order = await tx.foodOrder.create({
        data: {
          orderCode,
          idempotencyKey: dto.idempotencyKey || null,
          userId,
          restaurantId: restaurant.id,
          status: initialStatus,
          confirmedAt,
          paymentMethod: dto.paymentMethod || 'COD',
          paymentStatus,
          deliveryAddress: dto.deliveryAddress.trim(),
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          distanceKm: feeCalc.distanceKm,
          subtotal: serverSubtotal,
          shippingFee: feeCalc.finalShippingFee,
          discountAmount: feeCalc.discountAmount,
          totalAmount: finalTotal,

          // Hạch toán tài chính 3 bên V-Life Food
          baseStorePrice: feeCalc.baseStorePrice,
          merchantEarning: feeCalc.merchantEarning,
          appGrossProfit: feeCalc.appGrossProfit,
          appNetProfit: feeCalc.appNetProfit,

          noteForMerchant: dto.noteForMerchant,
          noteForDriver: dto.noteForDriver,
          items: {
            create: verifiedOrderItems.map((it) => ({
              menuItemId: it.menuItemId,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              totalPrice: it.totalPrice,
              notes: it.notes,
              optionsJson: it.optionsJson,
            })),
          },
        },
        include: {
          items: true,
          restaurant: true,
        },
      });

      if (restaurant.autoAcceptOrder) {
        await tx.foodAuditLog.create({
          data: {
            restaurantId: restaurant.id,
            userId,
            action: 'AUTO_CONFIRM_ORDER',
            targetType: 'ORDER',
            targetId: order.id,
            metadata: { note: 'Đơn hàng tự động xác nhận theo cấu hình autoAcceptOrder của nhà hàng' },
          },
        });
      }

      return {
        ...order,
        financials: {
          baseStorePrice: feeCalc.baseStorePrice,
          merchantEarning: feeCalc.merchantEarning,
          appGrossProfit: feeCalc.appGrossProfit,
          appNetProfit: feeCalc.appNetProfit,
          driverShippingFee: feeCalc.driverShippingFee,
        },
      };
    });
    } catch (err: any) {
      if (dto.idempotencyKey && (err.code === 'P2002' || err.message?.includes('idempotencyKey'))) {
        const existingOrderByKey = await this.prisma.foodOrder.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
          include: { items: true, restaurant: true },
        });
        if (existingOrderByKey) {
          return {
            ...existingOrderByKey,
            isDuplicateRequest: true,
            message: 'Đơn hàng đã được tạo trước đó (Idempotency Handled)',
          };
        }
      }
      throw err;
    }

    // Phát thông báo Realtime Socket.io cho Merchant & System
    try {
      this.foodGateway.notifyOrderCreated(createdResult);
      if (createdResult.status === 'CONFIRMED') {
        this.foodGateway.notifyOrderStatusChanged(createdResult, 'PENDING');
      }
    } catch (socketErr) {
      console.error('[FoodService] Lỗi phát socket notification khi tạo đơn:', socketErr);
    }

    // Phát Push Notification tới Quán (FCM / Background)
    try {
      this.notificationService.sendFoodOrderPush(createdResult, 'ORDER_CREATED').catch(() => {});
      if (createdResult.status === 'CONFIRMED') {
        this.notificationService.sendFoodOrderPush(createdResult, 'ORDER_CONFIRMED').catch(() => {});
      }
    } catch (pushErr) {
      console.error('[FoodService] Lỗi trigger push notification khi tạo đơn:', pushErr);
    }

    return createdResult;
  }

  /**
   * HỦY ĐƠN HÀNG - XỬ LÝ THEO VAI TRÒ VÀ BẢO ĐẢM QUY TẮC NGHIỆP VỤ
   */
  async cancelOrder(orderId: string, userId: string, reason: string, userRole: string = 'USER') {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('Vui lòng cung cấp lý do hủy đơn');
    }

    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: {
          OR: [{ id: orderId }, { orderCode: orderId }],
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng cần hủy');
      }

      if (order.status === 'CANCELLED') {
        throw new BadRequestException('Đơn hàng này đã bị hủy trước đó');
      }

      if (order.status === 'COMPLETED') {
        throw new BadRequestException('Đơn hàng đã hoàn thành, không thể hủy');
      }

      // KIỂM TRA PHÂN QUYỀN HỦY ĐƠN THEO VAI TRÒ:
      if (userRole === 'USER') {
        if (order.userId !== userId) {
          throw new ForbiddenException('Bạn không có quyền hủy đơn hàng của người khác');
        }
        // Khách hàng CHỈ ĐƯỢC HỦY khi đơn đang ở trạng thái PENDING (chưa được quán xác nhận)
        if (order.status !== 'PENDING') {
          throw new BadRequestException(
            'Quán ăn đã xác nhận và đang chế biến món ăn, không thể tự hủy đơn. Vui lòng liên hệ quán hoặc tổng đài CSKH 1900 6868.',
          );
        }
      } else if (userRole === 'MERCHANT' || userRole === 'SELLER') {
        // Quán chỉ được hủy khi đơn ở PENDING, CONFIRMED hoặc PREPARING nếu gặp sự cố đột xuất
        if (order.status === 'PICKED_UP' || order.status === 'DRIVER_ACCEPTED') {
          throw new BadRequestException('Tài xế đã nhận hoặc đang giao đồ ăn, quán không thể tự ý hủy đơn');
        }
      } else if (userRole === 'DRIVER') {
        // Tài xế không có quyền hủy toàn bộ đơn của quán, chỉ có quyền từ chối nhận cuốc
        throw new BadRequestException('Tài xế không có quyền hủy đơn hàng đồ ăn. Vui lòng chọn từ chối nhận đơn.');
      }

      // KIỂM TRA VÀ THỰC HIỆN HOÀN TIỀN NGUYÊN TỬ NẾU ĐÃ THANH TOÁN (WALLET / ONLINE)
      let newPaymentStatus = order.paymentStatus;
      if (order.paymentStatus === 'PAID') {
        if (order.paymentMethod === 'WALLET') {
          const idempotencyKey = `refund_cancel_${order.id}_${Date.now()}`;
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
                description: `Hoàn tiền đơn hàng đồ ăn #${order.orderCode || order.id} do hủy đơn (${userRole}): ${reason.trim()}`,
              },
            });
            newPaymentStatus = 'REFUNDED';
          }
        } else if (order.paymentMethod === 'VIETQR') {
          // Với VietQR, ghi nhận REFUND_PENDING để bộ phận đối soát kế toán hoàn tiền
          newPaymentStatus = 'REFUND_PENDING';
        }
      }

      // ATOMIC UPDATE CHỐNG RACE CONDITION GIỮA KHÁCH HÀNG VÀ QUÁN ĂN
      const updateFilter: any = { id: order.id };
      if (userRole === 'USER') {
        updateFilter.status = 'PENDING';
      }

      const updateResult = await tx.foodOrder.updateMany({
        where: updateFilter,
        data: {
          status: 'CANCELLED',
          cancelledBy: userRole,
          cancellationReason: reason.trim(),
          rejectedReason: userRole === 'MERCHANT' || userRole === 'SELLER' ? reason.trim() : null,
          cancelledAt: new Date(),
          paymentStatus: newPaymentStatus,
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException(
          'Đơn hàng đã được xử lý bởi thao tác khác hoặc không còn ở trạng thái cho phép hủy',
        );
      }

      return tx.foodOrder.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          restaurant: true,
        },
      });
    });

    // Phát thông báo Realtime Socket.io khi hủy đơn
    try {
      this.foodGateway.notifyOrderStatusChanged(cancelledOrder, 'PENDING', {
        reason: reason.trim(),
        cancelledBy: userRole,
      });
    } catch (socketErr) {
      console.error('[FoodService] Lỗi phát socket notification khi hủy đơn:', socketErr);
    }

    // Phát Push Notification tới các bên (FCM / Background)
    try {
      this.notificationService.sendFoodOrderPush(cancelledOrder, 'ORDER_CANCELLED', {
        reason: reason.trim(),
        cancelledBy: userRole,
      }).catch(() => {});
    } catch (pushErr) {
      console.error('[FoodService] Lỗi trigger push notification khi hủy đơn:', pushErr);
    }

    return cancelledOrder;
  }

  /**
   * CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG - STATE MACHINE GUARD VÀ CHỐNG RACE CONDITION
   */
  async updateOrderStatus(
    orderId: string, 
    nextStatus: FoodOrderStatus, 
    userId: string, 
    userRole: string = 'MERCHANT',
    note?: string,
    driverId?: string
  ) {
    let previousStatus = '';
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.foodOrder.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy thông tin đơn hàng');
      }

      previousStatus = order.status;

      // 1. Kiểm tra phân quyền theo vai trò (Role Guard):
      if (userRole !== 'DRIVER') {
        throw new ForbiddenException(
          'API cập nhật trạng thái đơn hàng này dành riêng cho Tài xế. Quán ăn và Khách hàng vui lòng sử dụng API nghiệp vụ tương ứng.',
        );
      }

      // Tài xế chỉ được chuyển: DRIVER_ACCEPTED, PICKED_UP, COMPLETED
      const driverAllowedStatuses: FoodOrderStatus[] = ['DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'];
      if (!driverAllowedStatuses.includes(nextStatus)) {
        throw new ForbiddenException(
          `Tài xế chỉ được phép cập nhật các trạng thái giao hàng (${driverAllowedStatuses.join(', ')}). Trạng thái yêu cầu: ${nextStatus}`,
        );
      }

      // 2. Kiểm tra tính hợp lệ của bước chuyển trạng thái (State Machine)
      const allowedNextStatuses = VALID_TRANSITIONS[order.status] || [];
      if (!allowedNextStatuses.includes(nextStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ "${order.status}" sang "${nextStatus}". Thứ tự luồng: PENDING -> CONFIRMED -> PREPARING -> FINDING_DRIVER -> DRIVER_ACCEPTED -> PICKED_UP -> COMPLETED.`,
        );
      }

      // 3. Khóa chống Concurrency khi Tài xế nhận đơn (FINDING_DRIVER -> DRIVER_ACCEPTED)
      if (nextStatus === 'DRIVER_ACCEPTED') {
        // Optimistic concurrency check: Chỉ gán tài xế nếu driverId hiện tại là null
        const updateResult = await tx.foodOrder.updateMany({
          where: {
            id: order.id,
            status: { in: ['PREPARING', 'FINDING_DRIVER'] },
            driverId: null,
          },
          data: {
            status: 'DRIVER_ACCEPTED',
            driverId: userId,
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictException('Đơn hàng đã được tài xế khác tiếp nhận hoặc đã thay đổi trạng thái');
        }

        return tx.foodOrder.findUnique({
          where: { id: order.id },
          include: { items: true, restaurant: true, driver: true },
        });
      }

      // 4. Đối với các trạng thái PICKED_UP: Bắt buộc tài xế phải là người được assign cho đơn
      if (order.driverId !== userId) {
        throw new ForbiddenException('Bạn không phải tài xế được chỉ định giao đơn hàng này');
      }

      if (nextStatus === 'COMPLETED') {
        throw new BadRequestException(
          'Để hoàn tất đơn hàng và hạch toán ví tài xế chính xác, vui lòng sử dụng API chuyên biệt: PATCH /food/driver/orders/:id/complete',
        );
      }

      const now = new Date();
      const statusTimestamps: any = {};
      if (nextStatus === 'PICKED_UP') statusTimestamps.pickedUpAt = now;

      // Cập nhật các trạng thái giao hàng của tài xế
      return tx.foodOrder.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          ...statusTimestamps,
        },
        include: {
          items: true,
          restaurant: true,
          driver: true,
        },
      });
    });

    // Phát thông báo Realtime Socket.io khi tài xế cập nhật trạng thái đơn
    try {
      this.foodGateway.notifyOrderStatusChanged(updatedOrder, previousStatus);
    } catch (socketErr) {
      console.error('[FoodService] Lỗi phát socket notification khi update order status:', socketErr);
    }

    // Phát Push Notification tương ứng trạng thái mới
    try {
      this.notificationService.sendFoodOrderPush(updatedOrder, 'STATUS_CHANGED').catch(() => {});
    } catch (pushErr) {
      console.error('[FoodService] Lỗi trigger push notification khi update order status:', pushErr);
    }

    return updatedOrder;
  }

  /**
   * Lấy chi tiết đơn hàng (Bảo mật: User xem đơn mình, Driver xem đơn được assign, Merchant xem đơn quán mình)
   */
  async getOrderById(idOrCode: string, requesterId: string, requesterRole?: string) {
    const order = await this.prisma.foodOrder.findFirst({
      where: {
        OR: [{ id: idOrCode }, { orderCode: idOrCode }],
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                image: true,
                description: true,
              },
            },
          },
        },
        restaurant: true,
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            licensePlate: true,
            vehicleType: true,
            rating: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng');
    }

    const isCustomer = order.userId === requesterId;
    const isAssignedDriver = order.driverId === requesterId;
    const isAvailableDriver = requesterRole === 'DRIVER' && order.status === 'FINDING_DRIVER';
    const isRestaurantOwner = order.restaurant?.ownerId === requesterId;
    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';

    if (!isCustomer && !isAssignedDriver && !isAvailableDriver && !isRestaurantOwner && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin chi tiết của đơn hàng này.');
    }

    // Bảo mật: Nếu không phải chủ quán hoặc Admin, ẩn thông tin doanh thu quán và sàn
    const sanitizedOrder: any = { ...order };
    if (!isRestaurantOwner && !isAdmin) {
      delete sanitizedOrder.baseStorePrice;
      delete sanitizedOrder.merchantEarning;
      delete sanitizedOrder.appGrossProfit;
      delete sanitizedOrder.appNetProfit;
    }

    // Gắn thêm ảnh món cho items
    sanitizedOrder.items = order.items.map((it) => ({
      ...it,
      image: it.menuItem?.image || null,
    }));

    return sanitizedOrder;
  }

  /**
   * Lấy lịch sử đơn hàng của người dùng có phân trang và lọc theo tab
   */
  async getUserOrders(userId: string, query?: UserOrderQueryDto) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query?.status) {
      where.status = query.status as FoodOrderStatus;
    } else if (query?.tab) {
      switch (query.tab) {
        case OrderTabFilter.PROCESSING:
          where.status = {
            in: [
              'PENDING',
              'CONFIRMED',
              'PREPARING',
              'FINDING_DRIVER',
              'DRIVER_ACCEPTED',
              'PICKED_UP',
            ],
          };
          break;
        case OrderTabFilter.COMPLETED:
          where.status = 'COMPLETED';
          break;
        case OrderTabFilter.CANCELLED:
          where.status = 'CANCELLED';
          break;
        case OrderTabFilter.ALL:
        default:
          break;
      }
    }

    const [total, rawOrders] = await Promise.all([
      this.prisma.foodOrder.count({ where }),
      this.prisma.foodOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              avatar: true,
              address: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  image: true,
                },
              },
            },
          },
          driver: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
              licensePlate: true,
              vehicleType: true,
              rating: true,
            },
          },
        },
      }),
    ]);

    // Format dữ liệu an toàn cho User
    const orders = rawOrders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      confirmedAt: o.confirmedAt,
      preparingAt: o.preparingAt,
      readyAt: o.readyAt,
      pickedUpAt: o.pickedUpAt,
      completedAt: o.completedAt,
      cancelledAt: o.cancelledAt,
      cancelledBy: o.cancelledBy,
      cancellationReason: o.cancellationReason,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discountAmount: o.discountAmount,
      totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress,
      restaurant: o.restaurant,
      driver: o.driver,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      items: o.items.map((it) => ({
        id: it.id,
        menuItemId: it.menuItemId,
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
   * Lấy lịch sử đơn hàng (giữ backward compatibility)
   */
  async getMyOrders(userId: string) {
    const res = await this.getUserOrders(userId, { page: 1, limit: 30, tab: OrderTabFilter.ALL });
    return res.orders;
  }

  /**
   * Kiểm tra khả năng đặt lại đơn hàng (ĐẶT LẠI - REORDER)
   */
  async checkReorder(orderId: string, userId: string) {
    const order = await this.prisma.foodOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { orderCode: orderId }],
        userId,
      },
      include: {
        items: true,
        restaurant: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng hoặc bạn không sở hữu đơn này.');
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: order.restaurantId },
    });

    if (!restaurant || !restaurant.isActive || !restaurant.isOpen) {
      const unavailableReason = !restaurant || !restaurant.isActive
        ? 'Nhà hàng không còn hoạt động trên hệ thống.'
        : 'Nhà hàng hiện đang đóng cửa.';
      return {
        canReorder: false,
        isRestaurantAvailable: false,
        unavailableReason,
        restaurant: restaurant
          ? {
              id: restaurant.id,
              name: restaurant.name,
              avatar: restaurant.avatar,
              address: restaurant.address,
              isOpen: restaurant.isOpen,
              isActive: restaurant.isActive,
              openingHours: restaurant.openingHours,
            }
          : null,
        validItems: [],
        unavailableItems: order.items.map((it) => ({
          id: it.menuItemId,
          menuItemId: it.menuItemId,
          name: it.name,
          reason: unavailableReason,
        })),
        message: unavailableReason,
      };
    }

    const menuItemIds = order.items.map((i) => i.menuItemId);
    const currentMenuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: restaurant.id,
      },
      include: {
        optionGroups: {
          include: { options: true },
        },
      },
    });

    const currentMap = new Map(currentMenuItems.map((m) => [m.id, m]));
    const validItems: any[] = [];
    const unavailableItems: any[] = [];

    for (const orderItem of order.items) {
      const liveItem = currentMap.get(orderItem.menuItemId);
      if (!liveItem) {
        unavailableItems.push({
          menuItemId: orderItem.menuItemId,
          name: orderItem.name,
          reason: 'Món ăn đã bị xóa khỏi thực đơn quán',
        });
      } else if (!liveItem.isAvailable) {
        unavailableItems.push({
          menuItemId: orderItem.menuItemId,
          name: liveItem.name,
          reason: 'Món ăn tạm hết hàng',
        });
      } else {
        // Món hợp lệ: lấy giá hiện tại từ DB
        validItems.push({
          menuItemId: liveItem.id,
          name: liveItem.name,
          image: liveItem.image,
          price: liveItem.price, // GIÁ MỚI NHẤT TỪ DATABASE
          basePrice: liveItem.price,
          originalPrice: liveItem.originalPrice,
          quantity: orderItem.quantity,
          optionsJson: orderItem.optionsJson,
          notes: orderItem.notes,
        });
      }
    }

    return {
      canReorder: validItems.length > 0,
      isRestaurantAvailable: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        avatar: restaurant.avatar,
        address: restaurant.address,
        isOpen: restaurant.isOpen,
        isActive: restaurant.isActive,
        openingHours: restaurant.openingHours,
      },
      validItems,
      unavailableItems,
      message: unavailableItems.length > 0
        ? `Có ${unavailableItems.length} món đã hết hoặc không còn phục vụ.`
        : 'Tất cả món ăn đều có sẵn để đặt lại!',
    };
  }
}

