import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'ID thiết bị duy nhất', example: 'dev_iphone_15_pro_abc' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'FCM Device Token nhận từ Firebase Cloud Messaging' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ description: 'Hệ điều hành thiết bị', enum: ['android', 'ios', 'web'], default: 'android' })
  @IsString()
  @IsOptional()
  @IsIn(['android', 'ios', 'web'])
  platform?: string;

  @ApiPropertyOptional({ 
    description: 'Vai trò ứng dụng của thiết bị', 
    enum: ['CUSTOMER', 'MERCHANT', 'DRIVER'], 
    default: 'CUSTOMER' 
  })
  @IsString()
  @IsOptional()
  @IsIn(['CUSTOMER', 'MERCHANT', 'DRIVER'])
  appRole?: string;
}

export class UnregisterDeviceTokenDto {
  @ApiPropertyOptional({ description: 'ID thiết bị cần hủy token' })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'FCM Token cần hủy' })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({ description: 'Vai trò ứng dụng', enum: ['CUSTOMER', 'MERCHANT', 'DRIVER'] })
  @IsString()
  @IsOptional()
  @IsIn(['CUSTOMER', 'MERCHANT', 'DRIVER'])
  appRole?: string;
}
