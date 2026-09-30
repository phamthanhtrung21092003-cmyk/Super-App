import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedQueryDto {
  @ApiPropertyOptional({ description: 'ID của video cursor (dùng cho cursor pagination)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Số lượng video lấy mỗi trang (mặc định 10, tối đa 30)', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Tab hiển thị video', enum: ['foryou', 'following'], default: 'foryou' })
  @IsOptional()
  @IsIn(['foryou', 'following'])
  tab?: 'foryou' | 'following' = 'foryou';
}
