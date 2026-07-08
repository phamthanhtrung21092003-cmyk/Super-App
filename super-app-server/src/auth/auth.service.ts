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

    await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        fullName,
        role: 'USER',
        avatarUrl: null,
        hashedRefreshToken: null,
      },
      select: {
        id: true,
      },
    });

    this.logger.log(`User registered: ${phone}`);
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      phone,
      role,
      jti: crypto.randomUUID(), // Đảm bảo tính duy nhất cho mỗi token được sinh ra
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
      // Hash với SHA-256 trước để tránh giới hạn 72 ký tự của bcrypt, sau đó băm bằng bcrypt
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

  // Login business logic
  async loginUser(dto: UserLoginDto) {
    const { phone, password } = dto;

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

    // Generate tokens dynamically
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.phone,
      user.role,
    );

    // Save hashed refresh token
    await this.updateRefreshToken(user.id, refreshToken, 'USER');

    this.logger.log(`User login: ${phone}`);

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
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  // Refresh Token Rotation logic
  async refreshToken(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-app-refresh-secret-jwt-key-2026';

    let payload: any;
    let userPhone = 'unknown';

    // Decode unverified token to extract phone for logging if verification fails
    try {
      const decoded = this.jwtService.decode(refreshToken);
      if (decoded && decoded.phone) {
        userPhone = decoded.phone;
      }
    } catch (e) {
      // ignore decoding error
    }

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

    // Check if hashedRefreshToken exists in DB
    if (!user.hashedRefreshToken) {
      this.logger.warn(`Invalid refresh token: ${user.phone} (token revoked)`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token matching the hashed one in DB
    const sha256Hash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const isTokenMatching = await bcrypt.compare(
      sha256Hash,
      user.hashedRefreshToken,
    );
    if (!isTokenMatching) {
      this.logger.warn(`Invalid refresh token: ${user.phone} (hash mismatch)`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.phone, user.role);

    // Save hashed refresh token (Rotation)
    await this.updateRefreshToken(user.id, tokens.refreshToken, 'USER');

    this.logger.log(`Refresh token rotated: ${user.phone}`);

    const accessTokenExpires =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m';
    const expiresIn = this.parseTimeToSeconds(accessTokenExpires);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn,
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken: null },
        select: { id: true, phone: true },
      });
      this.logger.log(`User logout: ${user.phone}`);
    } catch (error) {
      this.logger.warn(
        `User logout warning: User record not found or already logged out for ID ${userId}`,
      );
    }
    return { message: 'Logout successfully' };
  }
}
