import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateOptionGroupDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm tùy chọn không được để rỗng' })
  name?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'maxSelect phải tối thiểu là 1' })
  maxSelect?: number;
}

export class CreateOptionGroupStandaloneDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm tùy chọn không được để trống' })
  name: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelect?: number;
}

export class CreateOptionStandaloneDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên tùy chọn không được để trống' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'Giá tùy chọn không được nhỏ hơn 0' })
  price: number;
}

export class UpdateOptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên tùy chọn không được để rỗng' })
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Giá tùy chọn không được nhỏ hơn 0' })
  price?: number;
}
