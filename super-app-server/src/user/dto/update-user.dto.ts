import { IsOptional, IsString, Length, Matches, IsInt, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Phạm Thành Trung',
    description: 'Họ và tên người dùng',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @Length(2, 100, { message: 'Họ và tên phải từ 2 đến 100 ký tự' })
  fullName?: string;

  @ApiProperty({
    example: 'phm_thnh_trung_',
    description: 'Username / V-life ID (3-30 ký tự, chữ, số, dấu gạch dưới)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as string | undefined),
  )
  @Length(3, 30, { message: 'Username phải từ 3 đến 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_)',
  })
  username?: string;

  @ApiProperty({
    example: 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨',
    description: 'Tiểu sử cá nhân (tối đa 100 ký tự)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @Length(0, 100, { message: 'Tiểu sử không được vượt quá 100 ký tự' })
  bio?: string;

  @ApiProperty({
    example: 2003,
    description: 'Năm sinh (1900 - 2026)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm sinh phải là số nguyên' })
  @Min(1900, { message: 'Năm sinh không hợp lệ (phải từ năm 1900 trở đi)' })
  @Max(2026, { message: 'Năm sinh không hợp lệ (không vượt quá năm 2026)' })
  birthYear?: number;

  @ApiProperty({
    example: 'Nam',
    description: 'Giới tính (Nam, Nữ, Khác)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Giới tính phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @IsIn(['Nam', 'Nữ', 'Khác'], { message: 'Giới tính phải là Nam, Nữ hoặc Khác' })
  gender?: string;

  @ApiProperty({
    example: 'Hà Nội, Việt Nam',
    description: 'Quê quán (tối đa 100 ký tự)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Quê quán phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @Length(0, 100, { message: 'Quê quán không được vượt quá 100 ký tự' })
  hometown?: string;
}

