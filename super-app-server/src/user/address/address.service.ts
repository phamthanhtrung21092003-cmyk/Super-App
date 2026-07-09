import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async createAddress(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    const isFirstAddress = existingCount === 0;
    const shouldBeDefault = dto.isDefault || isFirstAddress;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        // Gỡ bỏ mặc định của tất cả địa chỉ cũ
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const newAddress = await tx.address.create({
        data: {
          userId,
          label: dto.label,
          receiverName: dto.receiverName,
          receiverPhone: dto.receiverPhone,
          province: dto.province,
          district: dto.district,
          ward: dto.ward,
          detailAddress: dto.detailAddress,
          note: dto.note || null,
          latitude: dto.latitude || null,
          longitude: dto.longitude || null,
          isDefault: shouldBeDefault,
        },
      });

      this.logger.log(`Address created: ID ${newAddress.id} for user ${userId}`);
      return newAddress;
    });
  }

  async getMyAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }

    return this.prisma.$transaction(async (tx) => {
      // Gỡ bỏ mặc định của các địa chỉ khác
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Thiết lập mặc định cho địa chỉ này
      const updated = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      this.logger.log(`Address ID ${addressId} set as default for user ${userId}`);
      return updated;
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }

    return this.prisma.$transaction(async (tx) => {
      // Nếu địa chỉ bị xóa là địa chỉ mặc định, chuyển mặc định sang địa chỉ khác
      if (address.isDefault) {
        const otherAddresses = await tx.address.findMany({
          where: {
            userId,
            id: { not: addressId },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        if (otherAddresses.length > 0) {
          await tx.address.update({
            where: { id: otherAddresses[0].id },
            data: { isDefault: true },
          });
          this.logger.log(
            `Transferred default status to Address ID ${otherAddresses[0].id} for user ${userId}`,
          );
        }
      }

      await tx.address.delete({
        where: { id: addressId },
      });

      this.logger.log(`Address ID ${addressId} deleted for user ${userId}`);
      return { success: true, message: 'Address deleted successfully' };
    });
  }
}
