import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType, TransactionDirection } from '@prisma/client';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Số tiền giao dịch không được để trống' })
  @IsNumber({}, { message: 'Số tiền giao dịch phải là số' })
  amount!: number;

  @IsNotEmpty({ message: 'Loại giao dịch không được để trống' })
  @IsEnum(TransactionType, { message: 'Loại giao dịch không hợp lệ' })
  type!: TransactionType;

  @IsNotEmpty({ message: 'Chiều dòng tiền không được để trống' })
  @IsEnum(TransactionDirection, { message: 'Chiều dòng tiền không hợp lệ' })
  direction!: TransactionDirection;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Mã tham chiếu phải là chuỗi' })
  referenceId?: string;

  @IsOptional()
  @IsString({ message: 'Loại tham chiếu phải là chuỗi' })
  referenceType?: string;

  @IsOptional()
  @IsString({ message: 'Idempotency key phải là chuỗi' })
  idempotencyKey?: string;

  @IsOptional()
  metadata?: any;
}
