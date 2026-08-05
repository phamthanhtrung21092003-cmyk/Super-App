import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID của dịch vụ (Homestay, Hotel, Car, Food...)' })
  @IsString()
  @IsNotEmpty({ message: 'serviceId không được để trống' })
  serviceId: string;

  @ApiProperty({ description: 'Ngày bắt đầu / Check-in (ISO Date string)' })
  @IsDateString({}, { message: 'startDate phải là định dạng ISO Date string' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc / Check-out (ISO Date string)' })
  @IsDateString({}, { message: 'endDate phải là định dạng ISO Date string' })
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'Tên người đặt' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại người đặt' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Ghi chú thêm' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Metadata bổ sung (loại phòng, số người...)' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
