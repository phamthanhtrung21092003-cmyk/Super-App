import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderTabFilter {
  ALL = 'ALL',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UserOrderQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Số trang hiện tại (bắt đầu từ 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Số lượng đơn trên mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: OrderTabFilter, default: OrderTabFilter.ALL, description: 'Tab lọc đơn hàng' })
  @IsOptional()
  @IsEnum(OrderTabFilter)
  tab?: OrderTabFilter = OrderTabFilter.ALL;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái cụ thể' })
  @IsOptional()
  @IsString()
  status?: string;
}

export enum TimePeriodFilter {
  TODAY = 'TODAY',
  SEVEN_DAYS = '7DAYS',
  THIRTY_DAYS = '30DAYS',
  ALL = 'ALL',
}

export class MerchantOrderHistoryQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 15, description: 'Số lượng đơn trên một trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 15;

  @ApiPropertyOptional({ enum: TimePeriodFilter, default: TimePeriodFilter.ALL, description: 'Khoảng thời gian' })
  @IsOptional()
  @IsEnum(TimePeriodFilter)
  period?: TimePeriodFilter = TimePeriodFilter.ALL;

  @ApiPropertyOptional({ description: 'Lọc trạng thái COMPLETED, CANCELLED hoặc ALL' })
  @IsOptional()
  @IsString()
  status?: string = 'ALL';
}

export class DriverFoodHistoryQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 15, description: 'Số lượng đơn trên một trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 15;

  @ApiPropertyOptional({ enum: TimePeriodFilter, default: TimePeriodFilter.ALL, description: 'Khoảng thời gian' })
  @IsOptional()
  @IsEnum(TimePeriodFilter)
  period?: TimePeriodFilter = TimePeriodFilter.ALL;

  @ApiPropertyOptional({ description: 'Lọc trạng thái: ALL, COMPLETED, CANCELLED' })
  @IsOptional()
  @IsString()
  status?: string = 'ALL';
}
