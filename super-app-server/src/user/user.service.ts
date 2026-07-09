import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private changePasswordAttempts = new Map<string, { count: number; resetTime: number }>();

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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // 1. Rate Limit: tối đa 5 lần / phút
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 5;

    let attempts = this.changePasswordAttempts.get(userId);
    if (!attempts || now > attempts.resetTime) {
      attempts = { count: 1, resetTime: now + windowMs };
      this.changePasswordAttempts.set(userId, attempts);
    } else {
      if (attempts.count >= maxRequests) {
        throw new HttpException(
          'Quá nhiều yêu cầu đổi mật khẩu. Vui lòng thử lại sau 1 phút.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      attempts.count++;
    }

    // 2. Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không trùng khớp');
    }

    // 3. Kiểm tra mật khẩu mới khác mật khẩu cũ
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    // 4. Tìm người dùng
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Change password failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    // 5. So sánh mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Change password failed: Incorrect current password for user: ${user.phone}`);
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    // 6. Mã hóa mật khẩu mới và đặt hashedRefreshToken thành null
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        hashedRefreshToken: null,
      },
    });

    // 7. Ghi log bảo mật (chỉ log số điện thoại, tuyệt đối không log mật khẩu)
    this.logger.log(`User changed password: ${user.phone}`);

    // 8. Trả về thông báo thành công
    return {
      message: 'Password changed successfully',
    };
  }
}
