import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { FoodOrderStatus } from '@prisma/client';

export class FoodOrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number; // Backend tự động bỏ qua và lấy giá từ Database

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
  idempotencyKey?: string;

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

export class CancelFoodOrderDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateFoodOrderStatusDto {
  @IsEnum(FoodOrderStatus)
  @IsNotEmpty()
  status: FoodOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  driverId?: string;
}
