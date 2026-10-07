import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFoodVoucherDto,
  UpdateFoodVoucherDto,
  ValidateVoucherDto,
  FoodVouchersQueryDto,
  FoodVoucherTypeDto,
} from './dto/food-voucher.dto';
import { FoodVoucherType } from '@prisma/client';

@Injectable()
export class FoodVoucherService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xác thực và tính toán giá trị giảm giá của Voucher (Server là nguồn quyết định cuối cùng)
   */
  async validateVoucher(
    userId: string,
    dto: ValidateVoucherDto,
    prismaTx?: any,
  ): Promise<{
    isValid: boolean;
    voucher: any;
    discountAmount: number;
    finalTotal: number;
    subtotal: number;
    shippingFee: number;
    message: string;
  }> {
    const tx = prismaTx || this.prisma;
    const cleanCode = (dto.code || '').trim().toUpperCase();

    if (!cleanCode) {
      throw new BadRequestException('Vui lòng nhập mã khuyến mãi');
    }

    const voucher = await tx.foodVoucher.findUnique({
      where: { code: cleanCode },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Mã giảm giá "${cleanCode}" không tồn tại hoặc đã bị xóa`);
    }

    if (!voucher.isActive) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" hiện đang tạm khóa`);
    }

    const now = new Date();
    if (voucher.startAt && now < voucher.startAt) {
      throw new BadRequestException(
        `Chương trình khuyến mãi "${voucher.name}" chưa bắt đầu (hiệu lực từ ${voucher.startAt.toLocaleDateString('vi-VN')})`,
      );
    }

    if (now > voucher.endAt) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết hạn sử dụng`);
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết lượt sử dụng trên toàn hệ thống`);
    }

    // Kiểm tra phạm vi nhà hàng
    if (voucher.restaurantId && voucher.restaurantId !== dto.restaurantId) {
      throw new BadRequestException(
        `Mã khuyến mãi "${cleanCode}" chỉ áp dụng cho nhà hàng "${voucher.restaurant?.name || 'chỉ định'}"`,
      );
    }

    // Kiểm tra giá trị đơn hàng tối thiểu (subtotal)
    const subtotal = Number(dto.subtotal) || 0;
    if (subtotal < voucher.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      );
    }

    // Kiểm tra giới hạn số lần sử dụng của khách hàng
    const userUsedCount = await tx.foodVoucherUsage.count({
      where: {
        voucherId: voucher.id,
        userId,
      },
    });

    if (userUsedCount >= voucher.maxUsagePerUser) {
      throw new BadRequestException(
        `Bạn đã sử dụng hết số lượt cho phép (${voucher.maxUsagePerUser} lần) của mã "${cleanCode}"`,
      );
    }

    // Tính toán số tiền giảm giá chính xác
    const shippingFee = Number(dto.shippingFee) || 0;
    let discountAmount = 0;

    if (voucher.type === FoodVoucherType.PERCENT) {
      const rawDiscount = Math.round((subtotal * voucher.value) / 100);
      discountAmount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
      discountAmount = Math.min(discountAmount, subtotal); // Không giảm vượt quá giá trị món
    } else if (voucher.type === FoodVoucherType.FIXED) {
      discountAmount = Math.min(voucher.value, subtotal);
    } else if (voucher.type === FoodVoucherType.FREESHIP) {
      discountAmount = Math.min(voucher.value, shippingFee);
    }

    const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

    return {
      isValid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        minOrderValue: voucher.minOrderValue,
        maxUsage: voucher.maxUsage,
        maxUsagePerUser: voucher.maxUsagePerUser,
        endAt: voucher.endAt,
        restaurantId: voucher.restaurantId,
        restaurantName: voucher.restaurant?.name,
      },
      discountAmount,
      finalTotal,
      subtotal,
      shippingFee,
      message: `Áp dụng thành công mã "${voucher.code}" - Giảm ${discountAmount.toLocaleString('vi-VN')}đ`,
    };
  }

  /**
   * Lấy danh sách Voucher khả dụng cho User (Toàn sàn + Quán đang xem)
   */
  async getAvailableVouchers(userId: string, restaurantId?: string) {
    const now = new Date();

    const vouchers = await this.prisma.foodVoucher.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
        OR: [
          { restaurantId: null }, // Voucher toàn sàn
          ...(restaurantId ? [{ restaurantId }] : []), // Voucher của quán
        ],
      },
      include: {
        restaurant: {
          select: { id: true, name: true, avatar: true },
        },
        usages: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vouchers
      .filter((v) => v.usedCount < v.maxUsage)
      .map((v) => {
        const userUsageCount = v.usages.length;
        const isUsable = userUsageCount < v.maxUsagePerUser;
        const remainingUserUsage = Math.max(0, v.maxUsagePerUser - userUsageCount);

        return {
          id: v.id,
          code: v.code,
          name: v.name,
          description: v.description,
          type: v.type,
          value: v.value,
          maxDiscount: v.maxDiscount,
          minOrderValue: v.minOrderValue,
          maxUsage: v.maxUsage,
          usedCount: v.usedCount,
          maxUsagePerUser: v.maxUsagePerUser,
          userUsageCount,
          remainingUserUsage,
          isUsable,
          startAt: v.startAt,
          endAt: v.endAt,
          isSystem: !v.restaurantId,
          restaurantId: v.restaurantId,
          restaurantName: v.restaurant?.name || 'Toàn sàn V-Life',
          restaurantLogo: v.restaurant?.avatar,
        };
      });
  }

  /**
   * Lấy danh sách voucher do Merchant quản lý
   */
  async getMerchantVouchers(merchantUserId: string, query: FoodVouchersQueryDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn chưa đăng ký nhà hàng hoặc không có quyền truy cập');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.foodVoucher.findMany({
        where: { restaurantId: restaurant.id },
        include: {
          usages: {
            select: {
              id: true,
              discountAmount: true,
              createdAt: true,
              user: {
                select: { id: true, fullName: true, phone: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.foodVoucher.count({
        where: { restaurantId: restaurant.id },
      }),
    ]);

    const formattedItems = items.map((v) => {
      const totalDiscountGiven = v.usages.reduce((sum, u) => sum + u.discountAmount, 0);
      const isExpired = new Date() > v.endAt;

      return {
        id: v.id,
        code: v.code,
        name: v.name,
        description: v.description,
        type: v.type,
        value: v.value,
        maxDiscount: v.maxDiscount,
        minOrderValue: v.minOrderValue,
        maxUsage: v.maxUsage,
        usedCount: v.usedCount,
        maxUsagePerUser: v.maxUsagePerUser,
        startAt: v.startAt,
        endAt: v.endAt,
        isActive: v.isActive,
        isExpired,
        totalDiscountGiven,
        usagesCount: v.usages.length,
        createdAt: v.createdAt,
      };
    });

    return {
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chủ quán tạo voucher khuyến mãi mới
   */
  async createMerchantVoucher(merchantUserId: string, dto: CreateFoodVoucherDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn chưa sở hữu nhà hàng để tạo khuyến mãi');
    }

    const cleanCode = dto.code.trim().toUpperCase();

    // Kiểm tra trùng mã
    const existing = await this.prisma.foodVoucher.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      throw new BadRequestException(`Mã khuyến mãi "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác!`);
    }

    const endAt = new Date(dto.endAt);
    const startAt = dto.startAt ? new Date(dto.startAt) : new Date();

    if (endAt <= startAt) {
      throw new BadRequestException('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    }

    const voucher = await this.prisma.foodVoucher.create({
      data: {
        code: cleanCode,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        type: dto.type as FoodVoucherType,
        value: Number(dto.value),
        maxDiscount: dto.maxDiscount ? Number(dto.maxDiscount) : null,
        minOrderValue: Number(dto.minOrderValue) || 0,
        maxUsage: Number(dto.maxUsage) || 100,
        maxUsagePerUser: Number(dto.maxUsagePerUser) || 1,
        startAt,
        endAt,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        restaurantId: restaurant.id,
      },
    });

    return voucher;
  }

  /**
   * Cập nhật thông tin voucher
   */
  async updateMerchantVoucher(merchantUserId: string, voucherId: string, dto: UpdateFoodVoucherDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn không có quyền quản lý nhà hàng này');
    }

    const voucher = await this.prisma.foodVoucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher || voucher.restaurantId !== restaurant.id) {
      throw new NotFoundException('Không tìm thấy mã khuyến mãi hoặc bạn không sở hữu mã này');
    }

    const dataToUpdate: any = {};
    if (dto.name !== undefined) dataToUpdate.name = dto.name.trim();
    if (dto.description !== undefined) dataToUpdate.description = dto.description.trim();
    if (dto.value !== undefined) dataToUpdate.value = Number(dto.value);
    if (dto.maxDiscount !== undefined) dataToUpdate.maxDiscount = Number(dto.maxDiscount);
    if (dto.minOrderValue !== undefined) dataToUpdate.minOrderValue = Number(dto.minOrderValue);
    if (dto.maxUsage !== undefined) dataToUpdate.maxUsage = Number(dto.maxUsage);
    if (dto.maxUsagePerUser !== undefined) dataToUpdate.maxUsagePerUser = Number(dto.maxUsagePerUser);
    if (dto.endAt !== undefined) dataToUpdate.endAt = new Date(dto.endAt);
    if (dto.isActive !== undefined) dataToUpdate.isActive = dto.isActive;

    return this.prisma.foodVoucher.update({
      where: { id: voucherId },
      data: dataToUpdate,
    });
  }

  /**
   * Bật / Tắt trạng thái kích hoạt của voucher
   */
  async toggleMerchantVoucher(merchantUserId: string, voucherId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn không có quyền quản lý nhà hàng này');
    }

    const voucher = await this.prisma.foodVoucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher || voucher.restaurantId !== restaurant.id) {
      throw new NotFoundException('Không tìm thấy mã khuyến mãi');
    }

    return this.prisma.foodVoucher.update({
      where: { id: voucherId },
      data: { isActive: !voucher.isActive },
    });
  }

  /**
   * Xóa voucher (Nếu đã có người dùng thì chuyển isActive=false để bảo toàn lịch sử kế toán)
   */
  async deleteMerchantVoucher(merchantUserId: string, voucherId: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: merchantUserId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Bạn không có quyền quản lý nhà hàng này');
    }

    const voucher = await this.prisma.foodVoucher.findUnique({
      where: { id: voucherId },
      include: { usages: true },
    });

    if (!voucher || voucher.restaurantId !== restaurant.id) {
      throw new NotFoundException('Không tìm thấy mã khuyến mãi');
    }

    if (voucher.usages.length > 0) {
      // Đã có lịch sử sử dụng -> không xóa cứng, chuyển sang vô hiệu hóa
      await this.prisma.foodVoucher.update({
        where: { id: voucherId },
        data: { isActive: false },
      });
      return {
        message: 'Mã khuyến mãi đã có lượt sử dụng trong lịch sử nên đã được tự động chuyển sang trạng thái Vô hiệu hóa',
        archived: true,
      };
    }

    await this.prisma.foodVoucher.delete({
      where: { id: voucherId },
    });

    return {
      message: 'Đã xóa mã khuyến mãi thành công',
      deleted: true,
    };
  }
}
