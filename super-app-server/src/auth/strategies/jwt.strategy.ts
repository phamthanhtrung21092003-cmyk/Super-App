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
    // Real Session Invalidation:
    // If deviceId is provided in token payload, verify that the device session is ACTIVE in DB
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

    return {
      id: payload.sub,
      phone: payload.phone,
      role: payload.role,
      deviceId: payload.deviceId,
    };
  }
}
