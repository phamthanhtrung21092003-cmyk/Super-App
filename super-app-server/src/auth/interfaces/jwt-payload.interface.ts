import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: Role;
  deviceId?: string;
  jti?: string;
}
