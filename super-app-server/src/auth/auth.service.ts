import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Logger } from 'nestjs-pino';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(dto: UserRegisterDto): Promise<void> {
    const { phone, password, fullName } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Phone already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone,
          password: hashedPassword,
          fullName,
          role: 'USER',
          avatarUrl: null,
          hashedRefreshToken: null,
        },
      });

      // Sinh mã ví duy nhất
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const walletNumber = `VL${randomDigits}`;

      await tx.wallet.create({
        data: {
          userId: user.id,
          walletNumber,
          balance: 0,
          pendingBalance: 0,
          rewardPoints: 0,
          currency: 'VND',
          status: 'ACTIVE',
        },
      });
    });

    this.logger.log(`User registered and wallet created: ${phone}`);
  }

  // Helper: Chuyển đổi định dạng thời gian sang giây (VD: 15m -> 900s)
  private parseTimeToSeconds(timeStr: string): number {
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) {
      const parsed = parseInt(timeStr, 10);
      return isNaN(parsed) ? 900 : parsed;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  // Helper 1: Generate Access Token and Refresh Token dynamically
  async generateTokens(
    userId: string,
    phone: string,
    role: string,
    deviceId?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      phone,
      role,
      deviceId,
      jti: crypto.randomUUID(),
    };

    const accessTokenExpires =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m';
    const refreshTokenExpires =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES') || '7d';

    const accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'super-app-secret-jwt-key-2026';
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-app-refresh-secret-jwt-key-2026';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpires as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpires as any,
    });

    return { accessToken, refreshToken };
  }

  // Helper 2: Hash and Update Refresh Token in DB for User/Driver
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    role: 'USER' | 'DRIVER',
  ): Promise<void> {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      const sha256Hash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      hashedRefreshToken = await bcrypt.hash(sha256Hash, 12);
    }

    if (role === 'USER') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken },
        select: { id: true },
      });
    } else if (role === 'DRIVER') {
      await this.prisma.driver.update({
        where: { id: userId },
        data: { hashedRefreshToken },
        select: { id: true },
      });
    }
  }

  // Login business logic with Device History & 1 Mobile Active enforcement
  async loginUser(dto: UserLoginDto, ipAddress?: string) {
    const { phone, password, deviceInfo } = dto;

    // Find User
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      this.logger.warn(`Login failed: ${phone}`);
      throw new UnauthorizedException('Invalid phone or password');
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: ${phone}`);
      throw new UnauthorizedException('Invalid phone or password');
    }

    // Device Identification details
    const deviceId = deviceInfo?.deviceId || `dev_web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const deviceName = deviceInfo?.deviceName || 'Web Browser';
    const manufacturer = deviceInfo?.manufacturer || null;
    const modelName = deviceInfo?.modelName || null;
    const platform = deviceInfo?.platform || 'Web';
    const osVersion = deviceInfo?.osVersion || null;

    const isMobile = platform.toLowerCase().includes('ios') ||
                     platform.toLowerCase().includes('android') ||
                     platform.toLowerCase().includes('mobile');

    // ════════════════════════════════════════════════════════════════════════════
    // 1 MOBILE ACTIVE ENFORCEMENT:
    // If logging in on a mobile device, revoke all other active mobile device sessions for this user.
    // ════════════════════════════════════════════════════════════════════════════
    if (isMobile) {
      const revokedDevices = await this.prisma.userDevice.updateMany({
        where: {
          userId: user.id,
          deviceId: { not: deviceId },
          status: 'ACTIVE',
        },
        data: {
          status: 'LOGGED_OUT',
          loggedOutAt: new Date(),
          refreshTokenHash: null,
        },
      });

      if (revokedDevices.count > 0) {
        this.logger.log(
          `[1 Mobile Rule] Revoked ${revokedDevices.count} previous active mobile session(s) for user: ${phone}`,
        );
      }
    }

    // Generate tokens dynamically with deviceId
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.phone,
      user.role,
      deviceId,
    );

    // Compute hashed refresh token for device and user
    const sha256Hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const hashedRefreshToken = await bcrypt.hash(sha256Hash, 12);

    // Upsert UserDevice record (Preserves Device History)
    await this.prisma.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId,
        },
      },
      create: {
        userId: user.id,
        deviceId,
        deviceName,
        manufacturer,
        modelName,
        platform,
        osVersion,
        ipAddress: ipAddress || null,
        status: 'ACTIVE',
        refreshTokenHash: hashedRefreshToken,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        loggedOutAt: null,
      },
      update: {
        deviceName,
        manufacturer,
        modelName,
        platform,
        osVersion,
        ipAddress: ipAddress || null,
        status: 'ACTIVE',
        refreshTokenHash: hashedRefreshToken,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        loggedOutAt: null,
      },
    });

    // Save hashed refresh token in User for backward compatibility
    await this.updateRefreshToken(user.id, refreshToken, 'USER');

    this.logger.log(`User login on device [${deviceName}]: ${phone}`);

    const accessTokenExpires =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m';
    const expiresIn = this.parseTimeToSeconds(accessTokenExpires);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      deviceId,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  // Refresh Token Rotation logic with Device Status check
  async refreshToken(dto: RefreshTokenDto, ipAddress?: string) {
    const { refreshToken } = dto;
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-app-refresh-secret-jwt-key-2026';

    let payload: any;
    let userPhone = 'unknown';

    try {
      const decoded = this.jwtService.decode(refreshToken);
      if (decoded && decoded.phone) {
        userPhone = decoded.phone;
      }
    } catch (e) {}

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshTokenSecret,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        this.logger.warn(`Refresh token expired: ${userPhone}`);
      } else {
        this.logger.warn(
          `Invalid refresh token verification failed: ${userPhone}`,
        );
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find User
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`Refresh failed: User not found for ID ${payload.sub}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const sha256Hash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Per-device verification if deviceId is present in token payload
    if (payload.deviceId) {
      const device = await this.prisma.userDevice.findUnique({
        where: {
          userId_deviceId: {
            userId: user.id,
            deviceId: payload.deviceId,
          },
        },
      });

      if (!device || device.status !== 'ACTIVE') {
        this.logger.warn(
          `Refresh token rejected: Device ${payload.deviceId} for user ${user.phone} is LOGGED_OUT`,
        );
        throw new UnauthorizedException('Phiên đăng nhập trên thiết bị này đã bị hủy.');
      }

      if (device.refreshTokenHash) {
        const isDeviceTokenMatching = await bcrypt.compare(
          sha256Hash,
          device.refreshTokenHash,
        );
        if (!isDeviceTokenMatching) {
          this.logger.warn(`Invalid refresh token on device: ${user.phone} (hash mismatch)`);
          throw new UnauthorizedException('Invalid refresh token');
        }
      }
    } else {
      // Fallback check against user.hashedRefreshToken
      if (!user.hashedRefreshToken) {
        this.logger.warn(`Invalid refresh token: ${user.phone} (token revoked)`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isTokenMatching = await bcrypt.compare(
        sha256Hash,
        user.hashedRefreshToken,
      );
      if (!isTokenMatching) {
        this.logger.warn(`Invalid refresh token: ${user.phone} (hash mismatch)`);
        throw new UnauthorizedException('Invalid refresh token');
      }
    }

    // Generate new rotated tokens
    const tokens = await this.generateTokens(
      user.id,
      user.phone,
      user.role,
      payload.deviceId,
    );

    const newSha256Hash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    const newHashedRefreshToken = await bcrypt.hash(newSha256Hash, 12);

    if (payload.deviceId) {
      await this.prisma.userDevice.updateMany({
        where: {
          userId: user.id,
          deviceId: payload.deviceId,
        },
        data: {
          refreshTokenHash: newHashedRefreshToken,
          lastActiveAt: new Date(),
          ipAddress: ipAddress || undefined,
        },
      });
    }

    // Save hashed refresh token (Rotation)
    await this.updateRefreshToken(user.id, tokens.refreshToken, 'USER');

    this.logger.log(`Refresh token rotated for user: ${user.phone} on device ${payload.deviceId || 'default'}`);

    const accessTokenExpires =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m';
    const expiresIn = this.parseTimeToSeconds(accessTokenExpires);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn,
    };
  }

  // Logout maintaining Device History (Sets status to LOGGED_OUT, does NOT delete)
  async logout(userId: string, deviceId?: string): Promise<{ message: string }> {
    try {
      if (deviceId) {
        await this.prisma.userDevice.updateMany({
          where: { userId, deviceId },
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

      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken: null },
        select: { id: true, phone: true },
      });

      this.logger.log(`User logout device [${deviceId || 'all'}]: ${userId}`);
    } catch (error) {
      this.logger.warn(`User logout warning for ID ${userId}: ${error}`);
    }
    return { message: 'Logout successfully' };
  }
}
