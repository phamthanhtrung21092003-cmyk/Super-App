import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum FoodSearchSort {
  RELEVANCE = 'relevance',
  RATING = 'rating',
  DISTANCE = 'distance',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  REVIEW_COUNT = 'review_count',
}

export class FoodSearchQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên món ăn, quán ăn, danh mục...)', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Từ khóa tìm kiếm không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q?: string;

  @ApiPropertyOptional({ description: 'ID danh mục món ăn' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Lọc món ăn theo nhà hàng chỉ định' })
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu (VNĐ)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa (VNĐ)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Đánh giá tối thiểu (ví dụ: 4.0, 4.5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Bán kính khoảng cách tối đa theo km (ví dụ: 1, 3, 5, 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  maxDistance?: number;

  @ApiPropertyOptional({ description: 'Chỉ tìm các quán đang mở cửa' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1' || value === 1)
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ tìm các quán có mã giảm giá / khuyến mãi' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1' || value === 1)
  @IsBoolean()
  hasVoucher?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ tìm các quán có chính sách Freeship' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1' || value === 1)
  @IsBoolean()
  hasFreeShip?: boolean;

  @ApiPropertyOptional({ enum: FoodSearchSort, description: 'Tiêu chí sắp xếp kết quả' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(FoodSearchSort, { message: 'Tiêu chí sắp xếp không hợp lệ (relevance, rating, distance, price_asc, price_desc, review_count)' })
  sort?: FoodSearchSort = FoodSearchSort.RELEVANCE;

  @ApiPropertyOptional({ description: 'Trang hiện tại (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số kết quả mỗi trang (tối đa 50)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Vĩ độ GPS của người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ GPS của người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}

export class FoodDiscoveryQueryDto {
  @ApiPropertyOptional({ description: 'Vĩ độ GPS của người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ GPS của người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Số lượng kết quả cho mỗi khối (mặc định 6, tối đa 20)', default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 6;
}
