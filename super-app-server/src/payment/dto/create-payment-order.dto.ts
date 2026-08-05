import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreatePaymentOrderDto {
  @ApiProperty({ description: 'ID của đơn đặt chỗ (Booking ID)' })
  @IsString()
  @IsNotEmpty({ message: 'bookingId không được để trống' })
  bookingId: string;

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
