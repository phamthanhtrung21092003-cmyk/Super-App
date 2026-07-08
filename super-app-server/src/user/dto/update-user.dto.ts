import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
}
