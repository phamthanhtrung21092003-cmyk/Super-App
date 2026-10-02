import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'super-app-secret-jwt-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.role === 'DRIVER') {
      const driver = await this.prisma.driver.findUnique({
        where: { id: payload.sub },
        select: { id: true, phone: true, role: true, isOnline: true },
      });

      if (!driver) {
        throw new UnauthorizedException('Tài khoản tài xế không tồn tại hoặc đã bị khóa.');
      }

      return {
        id: driver.id,
        phone: driver.phone,
        role: driver.role,
        deviceId: payload.deviceId,
      };
    }

    // Đối với USER / ADMIN / SELLER
    if (payload.deviceId) {
      const device = await this.prisma.userDevice.findUnique({
        where: {
          userId_deviceId: {
            userId: payload.sub,
            deviceId: payload.deviceId,
          },
        },
        select: { status: true },
      });

      if (!device || device.status !== 'ACTIVE') {
        throw new UnauthorizedException('Phiên đăng nhập trên thiết bị này đã bị hủy hoặc đăng xuất.');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phone: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản người dùng không tồn tại.');
    }

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      deviceId: payload.deviceId,
    };
  }
}
