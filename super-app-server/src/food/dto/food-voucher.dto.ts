import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FoodVoucherTypeDto {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
  FREESHIP = 'FREESHIP',
}

export class CreateFoodVoucherDto {
  @ApiProperty({ description: 'Mã khuyến mãi (viết hoa, không dấu, không cách, 3-20 ký tự)', example: 'VLIFE50' })
  @IsString()
  @IsNotEmpty({ message: 'Mã khuyến mãi không được để trống' })
  @MaxLength(20, { message: 'Mã khuyến mãi tối đa 20 ký tự' })
  @Matches(/^[A-Z0-9_-]{3,20}$/, { message: 'Mã khuyến mãi chỉ chứa chữ hoa, số, dấu gạch dưới hoặc gạch ngang (3-20 ký tự)' })
  code: string;

  @ApiProperty({ description: 'Tên chương trình khuyến mãi', example: 'Giảm 20% đơn đầu tiên' })
  @IsString()
  @IsNotEmpty({ message: 'Tên khuyến mãi không được để trống' })
  @MaxLength(100, { message: 'Tên khuyến mãi tối đa 100 ký tự' })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết điều kiện áp dụng', example: 'Áp dụng cho đơn từ 100k, giảm tối đa 40k' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;

  @ApiProperty({ description: 'Loại giảm giá: PERCENT, FIXED, FREESHIP', enum: FoodVoucherTypeDto, default: FoodVoucherTypeDto.PERCENT })
  @IsEnum(FoodVoucherTypeDto, { message: 'Loại voucher phải là PERCENT, FIXED hoặc FREESHIP' })
  type: FoodVoucherTypeDto;

  @ApiProperty({ description: 'Giá trị giảm (Nếu PERCENT là %, nếu FIXED/FREESHIP là số tiền VND)', example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Giá trị giảm phải lớn hơn 0' })
  value: number;

  @ApiPropertyOptional({ description: 'Số tiền giảm tối đa (bắt buộc với PERCENT để khống chế ngân sách)', example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Mức giảm tối đa phải từ 1.000đ trở lên' })
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Giá trị đơn hàng tối thiểu để áp dụng', example: 100000, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderValue?: number = 0;

  @ApiPropertyOptional({ description: 'Tổng số lượt sử dụng tối đa', example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Số lượt sử dụng tối thiểu là 1' })
  maxUsage?: number = 100;

  @ApiPropertyOptional({ description: 'Số lượt sử dụng tối đa cho mỗi khách hàng', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Lượt dùng/khách tối thiểu là 1' })
  maxUsagePerUser?: number = 1;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu áp dụng (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'startAt phải có định dạng ngày tháng hợp lệ' })
  startAt?: string;

  @ApiProperty({ description: 'Thời gian kết thúc áp dụng (ISO 8601)' })
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsDateString({}, { message: 'endAt phải có định dạng ngày tháng hợp lệ' })
  endAt: string;

  @ApiPropertyOptional({ description: 'Trạng thái kích hoạt', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'ID nhà hàng (nếu là voucher riêng của quán, bỏ trống nếu là voucher toàn sàn V-Life)' })
  @IsOptional()
  @IsString()
  restaurantId?: string;
}

export class UpdateFoodVoucherDto {
  @ApiPropertyOptional({ description: 'Tên chương trình khuyến mãi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết điều kiện' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Giá trị giảm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  value?: number;

  @ApiPropertyOptional({ description: 'Số tiền giảm tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Giá trị đơn tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ description: 'Tổng số lượt sử dụng tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUsage?: number;

  @ApiPropertyOptional({ description: 'Lượt dùng tối đa mỗi khách' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUsagePerUser?: number;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ description: 'Trạng thái kích hoạt' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateVoucherDto {
  @ApiProperty({ description: 'Mã khuyến mãi cần kiểm tra', example: 'VLIFE50' })
  @IsString()
  @IsNotEmpty({ message: 'Mã khuyến mãi không được để trống' })
  code: string;

  @ApiProperty({ description: 'ID nhà hàng đang đặt món' })
  @IsString()
  @IsNotEmpty({ message: 'restaurantId không được để trống' })
  restaurantId: string;

  @ApiProperty({ description: 'Tổng tiền các món trong giỏ hàng (subtotal)', example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ description: 'Cước phí giao hàng (shippingFee)', example: 15000, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shippingFee?: number = 0;
}

export class FoodVouchersQueryDto {
  @ApiPropertyOptional({ description: 'Lọc voucher theo nhà hàng' })
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
