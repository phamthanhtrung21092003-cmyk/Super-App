import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FoodOrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  optionsJson?: any;
}

export class CreateFoodOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsNumber()
  deliveryLat: number;

  @IsNumber()
  deliveryLng: number;

  @IsOptional()
  @IsString()
  noteForMerchant?: string;

  @IsOptional()
  @IsString()
  noteForDriver?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: 'COD' | 'WALLET' | 'VIETQR';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodOrderItemDto)
  items: FoodOrderItemDto[];
}
