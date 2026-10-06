import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  Min, 
  IsArray, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemOptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên tùy chọn không được để trống' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'Giá tùy chọn không được nhỏ hơn 0' })
  price: number;
}

export class CreateItemOptionGroupDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemOptionDto)
  options: CreateItemOptionDto[];
}

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên món ăn không được để trống' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Giá món ăn không được nhỏ hơn 0' })
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  calories?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemOptionGroupDto)
  optionGroups?: CreateItemOptionGroupDto[];
}
