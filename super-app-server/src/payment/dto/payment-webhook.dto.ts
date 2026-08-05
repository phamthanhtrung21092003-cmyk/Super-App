import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Mã đơn hàng V-Life (orderId/bookingCode)' })
  @IsString()
  @IsNotEmpty({ message: 'orderId không được để trống' })
  orderId: string;

  @ApiProperty({ description: 'Mã giao dịch từ Phía Ngân hàng / Provider' })
  @IsString()
  @IsNotEmpty({ message: 'providerTransactionId không được để trống' })
  providerTransactionId: string;

  @ApiProperty({ description: 'Số tiền thực tế chuyển khoản' })
  @IsNumber({}, { message: 'amount phải là số' })
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Loại tiền tệ (VND)' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Mã chữ ký bảo mật HMAC-SHA256' })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiPropertyOptional({ description: 'Tên nhà cung cấp (VIETQR, VNPAY, MOMO...)' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Trạng thái từ Provider (SUCCESS, FAILED)' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Payload gốc từ Provider' })
  @IsObject()
  @IsOptional()
  rawPayload?: Record<string, any>;
}
