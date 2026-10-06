import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreatePaymentOrderDto {
  @ApiPropertyOptional({ description: 'ID của đơn đặt dịch vụ Travel (Booking ID)' })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'ID của đơn đặt vé xem phim (MovieOrder ID)' })
  @IsString()
  @IsOptional()
  movieOrderId?: string;

  @ApiPropertyOptional({
    description: 'Nhà cung cấp thanh toán',
    enum: PaymentProvider,
    default: PaymentProvider.VIETQR,
  })
  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;

  @ApiPropertyOptional({ description: 'Khóa chống trùng lặp (Idempotency Key)' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}