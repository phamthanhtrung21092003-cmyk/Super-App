import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'some-refresh-token-uuid-or-jwt', description: 'Refresh token dùng để cấp lại Access token' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  @IsString({ message: 'Refresh token phải là chuỗi' })
  refreshToken: string;
}
