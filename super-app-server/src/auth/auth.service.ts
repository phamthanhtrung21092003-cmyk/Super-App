import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import * as bcrypt from 'bcryptjs';
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

  // Helper 1: Generate Access Token and Refresh Token dynamically
  async generateTokens(userId: string, phone: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, phone, role };
    
    const accessTokenExpires = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES') || '15m';
    const refreshTokenExpires = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES') || '7d';

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpires as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpires as any,
    });

    return { accessToken, refreshToken };
  }

  // Helper 2: Hash and Update Refresh Token in DB for User/Driver
  async updateRefreshToken(userId: string, refreshToken: string | null, role: 'USER' | 'DRIVER'): Promise<void> {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
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
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phone, user.role);

    // Save hashed refresh token
    await this.updateRefreshToken(user.id, refreshToken, 'USER');

    this.logger.log(`User login: ${phone}`);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15m = 900 seconds
    };
  }
}
