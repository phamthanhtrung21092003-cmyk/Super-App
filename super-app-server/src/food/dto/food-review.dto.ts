import { IsInt, IsOptional, IsString, Max, Min, ValidateNested, IsArray, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuItemReviewItemDto {
  @ApiProperty({ description: 'ID của món ăn đã đặt trong đơn hàng' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ description: 'Số sao đánh giá món ăn (1 - 5)', minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Nhận xét chi tiết cho món ăn (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class CreateFoodReviewDto {
  @ApiPropertyOptional({ description: 'Số sao đánh giá Nhà hàng (1 - 5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  restaurantRating?: number;

  @ApiPropertyOptional({ description: 'Nhận xét về chất lượng phục vụ của Quán ăn (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  restaurantComment?: string;

  @ApiPropertyOptional({ description: 'Số sao đánh giá Tài xế giao hàng (1 - 5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  driverRating?: number;

  @ApiPropertyOptional({ description: 'Nhận xét về thái độ / tốc độ giao hàng của Tài xế (tối đa 500 ký tự)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  driverComment?: string;

  @ApiPropertyOptional({ description: 'Danh sách đánh giá từng món ăn trong đơn hàng', type: [MenuItemReviewItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemReviewItemDto)
  itemReviews?: MenuItemReviewItemDto[];
}

export class RestaurantReviewsQueryDto {
  @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng review mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Lọc theo số sao cụ thể (1 - 5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Sắp xếp: latest, highest, lowest', enum: ['latest', 'highest', 'lowest'], default: 'latest' })
  @IsOptional()
  @IsIn(['latest', 'highest', 'lowest'])
  sort?: 'latest' | 'highest' | 'lowest' = 'latest';
}

export class ItemReviewsQueryDto {
  @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng review mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class DriverReviewsQueryDto {
  @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng review mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
