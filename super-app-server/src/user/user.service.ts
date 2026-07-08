import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Get profile failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User profile requested: ${user.phone}`);

    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateUserDto) {
    // 1. Kiểm tra dữ liệu rỗng
    if (!dto || Object.keys(dto).length === 0 || dto.fullName === undefined) {
      throw new BadRequestException('No data to update');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(
        `Update profile failed: User not found for ID ${userId}`,
      );
      throw new NotFoundException('User not found');
    }

    // 2. Tránh ghi DB nếu giá trị không đổi
    if (dto.fullName === user.fullName) {
      this.logger.log(`User profile update skipped (no change): ${user.phone}`);
      return {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
      },
    });

    this.logger.log(`User profile updated: ${user.phone}`);

    return {
      id: updatedUser.id,
      phone: updatedUser.phone,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updateAvatar(
    userId: string,
    file: { filename: string; path: string; mimetype: string; size: number },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Update avatar failed: User not found for ID ${userId}`);
      // Xóa file vừa upload vì user không tồn tại
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new NotFoundException('User not found');
    }

    const oldAvatarUrl = user.avatarUrl;
    const newAvatarUrl = `/uploads/avatars/${file.filename}`;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      // Xóa file ảnh cũ nếu có
      if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/avatars/')) {
        const relativePath = oldAvatarUrl.startsWith('/')
          ? oldAvatarUrl.substring(1)
          : oldAvatarUrl;
        const oldFilePath = path.join(process.cwd(), relativePath);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            this.logger.log(`Deleted old avatar file: ${oldFilePath}`);
          }
        } catch (unlinkError) {
          this.logger.warn(
            `Failed to delete old avatar file ${oldFilePath}: ${unlinkError instanceof Error ? unlinkError.message : String(unlinkError)}`,
          );
        }
      }

      this.logger.log(`User avatar updated: ${user.phone}`);

      return {
        id: updatedUser.id,
        phone: updatedUser.phone,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (dbError) {
      this.logger.error(
        `Update avatar DB failed for user ID ${userId}: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
      );
      // Rollback: Xóa file vừa upload do DB lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw dbError;
    }
  }
}
