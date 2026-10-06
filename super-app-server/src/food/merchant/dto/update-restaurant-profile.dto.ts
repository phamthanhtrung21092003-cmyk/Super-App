import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRestaurantProfileDto {
  @ApiPropertyOptional({ description: 'Tên quán ăn / nhà hàng' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ nhà hàng' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Khung giờ mở cửa, ví dụ: 08:00 - 22:00' })
  @IsOptional()
  @IsString()
  openingHours?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện quán' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'URL ảnh bìa quán' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Trạng thái mở cửa' })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional({ description: 'Tự động xác nhận nhận đơn' })
  @IsOptional()
  @IsBoolean()
  autoAcceptOrder?: boolean;

  @ApiPropertyOptional({ description: 'Tên ngân hàng thụ hưởng' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Mã ngân hàng (ví dụ: MB, TCB, VCB)' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Số tài khoản ngân hàng' })
  @IsOptional()
  @IsString()
  bankAccountNo?: string;

  @ApiPropertyOptional({ description: 'Số tài khoản ngân hàng (alias)' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Tên chủ tài khoản ngân hàng' })
  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @ApiPropertyOptional({ description: 'Tên chủ tài khoản ngân hàng (alias)' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ (alias)' })
  @IsOptional()
  @IsString()
  phone?: string;
}
