import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class ToggleOnlineDto {
  @IsBoolean()
  isOnline: boolean;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
