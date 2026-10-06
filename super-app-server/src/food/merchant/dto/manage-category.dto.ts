import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({ description: 'Tên danh mục món ăn (ví dụ: Món chính, Đồ uống, Combo)' })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @ApiPropertyOptional({ description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMenuCategoryDto {
  @ApiPropertyOptional({ description: 'Tên danh mục món ăn' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống nếu cung cấp' })
  name?: string;

  @ApiPropertyOptional({ description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
