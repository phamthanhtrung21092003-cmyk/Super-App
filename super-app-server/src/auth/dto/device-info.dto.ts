import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceInfoDto {
  @ApiProperty({
    example: 'dev_install_98f12c-49a8-b3d1',
    description: 'Định danh duy nhất của ứng dụng cài đặt trên thiết bị',
  })
  @IsNotEmpty({ message: 'deviceId không được để trống' })
  @IsString({ message: 'deviceId phải là chuỗi' })
  deviceId: string;

  @ApiProperty({
    example: 'Samsung Galaxy S24 Ultra',
    description: 'Tên thiết bị thực tế',
  })
  @IsNotEmpty({ message: 'deviceName không được để trống' })
  @IsString({ message: 'deviceName phải là chuỗi' })
  deviceName: string;

  @ApiPropertyOptional({
    example: 'Samsung',
    description: 'Hãng sản xuất thiết bị',
  })
  @IsOptional()
  @IsString({ message: 'manufacturer phải là chuỗi' })
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'SM-S928B',
    description: 'Mã Model thiết bị',
  })
  @IsOptional()
  @IsString({ message: 'modelName phải là chuỗi' })
  modelName?: string;

  @ApiPropertyOptional({
    example: 'Android',
    description: 'Nền tảng hệ điều hành (iOS, Android, Web)',
  })
  @IsOptional()
  @IsString({ message: 'platform phải là chuỗi' })
  platform?: string;

  @ApiPropertyOptional({
    example: '15',
    description: 'Phiên bản hệ điều hành',
  })
  @IsOptional()
  @IsString({ message: 'osVersion phải là chuỗi' })
  osVersion?: string;
}
