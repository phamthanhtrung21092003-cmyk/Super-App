import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPhoneOtpDto, VerifyPhoneOtpDto } from './dto/phone-change.dto';
import { RequestEmailOtpDto, VerifyEmailOtpDto } from './dto/email-change.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

interface PendingOtp {
  hashedOtp: string;
  targetValue: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class UserService {
  private changePasswordAttempts = new Map<string, { count: number; resetTime: number }>();
  private phoneOtpStore = new Map<string, PendingOtp>();
  private emailOtpStore = new Map<string, PendingOtp>();
  private otpRequestRateLimit = new Map<string, { count: number; resetTime: number }>();

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
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      birthYear: user.birthYear,
      gender: user.gender,
      hometown: user.hometown,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async checkUsername(username: string, currentUserId?: string) {
    const trimmed = username?.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 30) {
      return {
        available: false,
        message: 'Username phải từ 3 đến 30 ký tự',
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return {
        available: false,
        message: 'Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_)',
      };
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        username: trimmed,
        ...(currentUserId ? { NOT: { id: currentUserId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      return {
        available: false,
        message: 'Username này đã có người sử dụng. Vui lòng chọn tên khác.',
      };
    }

    return {
      available: true,
      message: 'Username hợp lệ và có thể sử dụng',
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username) {
      const trimmedUsername = dto.username.trim().toLowerCase();
      if (trimmedUsername !== (user.username || '').toLowerCase()) {
        const check = await this.checkUsername(trimmedUsername, userId);
        if (!check.available) {
          throw new ConflictException(check.message);
        }
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.username !== undefined && { username: dto.username.trim().toLowerCase() }),
        ...(dto.bio !== undefined && { bio: dto.bio.trim() }),
        ...(dto.birthYear !== undefined && { birthYear: dto.birthYear }),
        ...(dto.gender !== undefined && { gender: dto.gender.trim() }),
        ...(dto.hometown !== undefined && { hometown: dto.hometown.trim() }),
      },
    });

    this.logger.log(`User profile updated: ${updatedUser.phone}`);

    return {
      id: updatedUser.id,
      phone: updatedUser.phone,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      birthYear: updatedUser.birthYear,
      gender: updatedUser.gender,
      hometown: updatedUser.hometown,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        phone: true,
        fullName: true,
        avatarUrl: true,
      },
    });

    this.logger.log(`Avatar updated for user: ${user.phone}`);
    return user;
  }

  async requestPhoneOtp(userId: string, dto: RequestPhoneOtpDto) {
    const trimmedPhone = dto.newPhone.trim();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu tài khoản không chính xác');
    }

    if (user.phone === trimmedPhone) {
      throw new BadRequestException('Số điện thoại mới phải khác số điện thoại hiện tại');
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        phone: trimmedPhone,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Số điện thoại này đã được đăng ký bởi tài khoản khác');
    }

    const now = Date.now();
    const rateLimitKey = `phone_${userId}`;
    const rate = this.otpRequestRateLimit.get(rateLimitKey);
    if (rate && now < rate.resetTime) {
      if (rate.count >= 3) {
        throw new HttpException(
          'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 5 phút.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      rate.count++;
    } else {
      this.otpRequestRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 5 * 60 * 1000 });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = now + 3 * 60 * 1000;

    this.phoneOtpStore.set(userId, {
      hashedOtp,
      targetValue: trimmedPhone,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`Phone OTP requested for user: ${user.phone} -> ${trimmedPhone} (OTP: ${rawOtp})`);

    return {
      message: 'Mã xác thực OTP đã được gửi đến số điện thoại mới',
      expiresIn: 180,
      devOtp: rawOtp,
    };
  }

  async verifyPhoneOtp(userId: string, dto: VerifyPhoneOtpDto) {
    const pending = this.phoneOtpStore.get(userId);
    if (!pending || pending.targetValue !== dto.newPhone.trim()) {
      throw new BadRequestException('Không tìm thấy yêu cầu đổi số điện thoại hoặc số không khớp');
    }

    const now = Date.now();
    if (now > pending.expiresAt) {
      this.phoneOtpStore.delete(userId);
      throw new BadRequestException('Mã OTP đã hết hạn (sau 3 phút). Vui lòng yêu cầu lại mã mới.');
    }

    if (pending.attempts >= 5) {
      this.phoneOtpStore.delete(userId);
      throw new BadRequestException('Bạn đã nhập sai mã OTP quá 5 lần. Yêu cầu đã bị hủy, vui lòng lấy mã mới.');
    }

    const isMatch = await bcrypt.compare(dto.otp.trim(), pending.hashedOtp);
    if (!isMatch) {
      pending.attempts++;
      throw new BadRequestException(`Mã OTP không chính xác. Bạn còn ${5 - pending.attempts} lần thử.`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: pending.targetValue },
    });

    this.phoneOtpStore.delete(userId);
    this.logger.log(`User phone changed successfully: ${updatedUser.phone}`);

    return {
      message: 'Cập nhật số điện thoại thành công',
      phone: updatedUser.phone,
    };
  }

  async requestEmailOtp(userId: string, dto: RequestEmailOtpDto) {
    const trimmedEmail = dto.newEmail.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email && user.email.toLowerCase() === trimmedEmail) {
      throw new BadRequestException('Email mới phải khác email hiện tại');
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Địa chỉ email này đã được liên kết với một tài khoản khác');
    }

    const now = Date.now();
    const rateLimitKey = `email_${userId}`;
    const rate = this.otpRequestRateLimit.get(rateLimitKey);
    if (rate && now < rate.resetTime) {
      if (rate.count >= 3) {
        throw new HttpException(
          'Bạn đã yêu cầu gửi mã xác nhận quá nhiều lần. Vui lòng thử lại sau 5 phút.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      rate.count++;
    } else {
      this.otpRequestRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 5 * 60 * 1000 });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = now + 3 * 60 * 1000;

    this.emailOtpStore.set(userId, {
      hashedOtp,
      targetValue: trimmedEmail,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`Email OTP requested for user: ${user.phone} -> ${trimmedEmail} (OTP: ${rawOtp})`);

    return {
      message: 'Mã xác thực đã được gửi tới email mới',
      expiresIn: 180,
      devOtp: rawOtp,
    };
  }

  async verifyEmailOtp(userId: string, dto: VerifyEmailOtpDto) {
    const pending = this.emailOtpStore.get(userId);
    if (!pending || pending.targetValue !== dto.newEmail.trim().toLowerCase()) {
      throw new BadRequestException('Không tìm thấy yêu cầu liên kết email hoặc email không khớp');
    }

    const now = Date.now();
    if (now > pending.expiresAt) {
      this.emailOtpStore.delete(userId);
      throw new BadRequestException('Mã xác nhận đã hết hạn (sau 3 phút). Vui lòng yêu cầu lại mã mới.');
    }

    if (pending.attempts >= 5) {
      this.emailOtpStore.delete(userId);
      throw new BadRequestException('Bạn đã nhập sai mã xác nhận quá 5 lần. Yêu cầu đã bị hủy, vui lòng lấy mã mới.');
    }

    const isMatch = await bcrypt.compare(dto.otp.trim(), pending.hashedOtp);
    if (!isMatch) {
      pending.attempts++;
      throw new BadRequestException(`Mã xác nhận không chính xác. Bạn còn ${5 - pending.attempts} lần thử.`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { email: pending.targetValue },
    });

    this.emailOtpStore.delete(userId);
    this.logger.log(`User email updated successfully: ${updatedUser.email}`);

    return {
      message: 'Liên kết email thành công',
      email: updatedUser.email,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, currentDeviceId?: string) {
    const now = Date.now();
    const rate = this.changePasswordAttempts.get(userId);
    if (rate && now < rate.resetTime) {
      if (rate.count >= 5) {
        throw new HttpException(
          'Bạn đã thử đổi mật khẩu quá nhiều lần. Vui lòng thử lại sau 1 phút.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      rate.count++;
    } else {
      this.changePasswordAttempts.set(userId, { count: 1, resetTime: now + 60 * 1000 });
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`Change password failed: User not found for ID ${userId}`);
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Change password failed: Incorrect current password for user: ${user.phone}`);
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        hashedRefreshToken: null,
      },
    });

    // Revoke all other device sessions in database (Device History: set status = LOGGED_OUT, DO NOT DELETE)
    if (currentDeviceId) {
      await this.prisma.userDevice.updateMany({
        where: {
          userId,
          deviceId: { not: currentDeviceId },
          status: 'ACTIVE',
        },
        data: {
          status: 'LOGGED_OUT',
          loggedOutAt: new Date(),
          refreshTokenHash: null,
        },
      });
    } else {
      await this.prisma.userDevice.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: {
          status: 'LOGGED_OUT',
          loggedOutAt: new Date(),
          refreshTokenHash: null,
        },
      });
    }

    this.logger.log(`User changed password and revoked other sessions: ${user.phone}`);

    return {
      message: 'Password changed successfully',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DEVICE & SESSION MANAGEMENT (Real database records + Device History)
  // ════════════════════════════════════════════════════════════════════════════
  async getUserDevices(userId: string, currentDeviceId?: string) {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { lastLoginAt: 'desc' },
    });

    const mapped = devices.map((d) => ({
      id: d.id,
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      manufacturer: d.manufacturer,
      modelName: d.modelName,
      platform: d.platform,
      osVersion: d.osVersion,
      ipAddress: d.ipAddress,
      status: d.status,
      lastLoginAt: d.lastLoginAt,
      lastActiveAt: d.lastActiveAt,
      loggedOutAt: d.loggedOutAt,
      createdAt: d.createdAt,
      isCurrent: currentDeviceId ? d.deviceId === currentDeviceId : false,
    }));

    // Sắp xếp:
    // 1. Thiết bị hiện tại đang active lên đầu
    // 2. Thiết bị ACTIVE khác
    // 3. Thiết bị LOGGED_OUT theo lastLoginAt giảm dần
    mapped.sort((a, b) => {
      if (a.isCurrent && a.status === 'ACTIVE') return -1;
      if (b.isCurrent && b.status === 'ACTIVE') return 1;
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
      return new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime();
    });

    return mapped;
  }

  async logoutDevice(userId: string, targetIdOrDeviceId: string, currentDeviceId?: string) {
    if (currentDeviceId && targetIdOrDeviceId === currentDeviceId) {
      throw new BadRequestException('Không thể đăng xuất thiết bị hiện tại qua danh sách quản lý.');
    }

    const device = await this.prisma.userDevice.findFirst({
      where: {
        userId,
        OR: [
          { id: targetIdOrDeviceId },
          { deviceId: targetIdOrDeviceId },
        ],
      },
    });

    if (!device) {
      throw new NotFoundException('Không tìm thấy thiết bị cần đăng xuất.');
    }

    // Đánh dấu LOGGED_OUT, KHÔNG xóa bản ghi (Giữ Device History)
    await this.prisma.userDevice.update({
      where: { id: device.id },
      data: {
        status: 'LOGGED_OUT',
        loggedOutAt: new Date(),
        refreshTokenHash: null,
      },
    });

    this.logger.log(`User ${userId} logged out device ${device.deviceName} (${device.deviceId})`);
    return {
      message: 'Đăng xuất thiết bị thành công.',
    };
  }

  async logoutOtherDevices(userId: string, currentDeviceId?: string) {
    if (!currentDeviceId) {
      throw new BadRequestException('Không xác định được thiết bị hiện tại.');
    }

    // Đánh dấu LOGGED_OUT tất cả thiết bị khác, KHÔNG xóa bản ghi
    const result = await this.prisma.userDevice.updateMany({
      where: {
        userId,
        deviceId: { not: currentDeviceId },
        status: 'ACTIVE',
      },
      data: {
        status: 'LOGGED_OUT',
        loggedOutAt: new Date(),
        refreshTokenHash: null,
      },
    });

    this.logger.log(`User ${userId} logged out ${result.count} other devices.`);
    return {
      message: 'Đã đăng xuất khỏi tất cả các thiết bị khác.',
    };
  }
}
