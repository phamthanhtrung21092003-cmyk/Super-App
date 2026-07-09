import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class QueryTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn dòng phải là số nguyên' })
  @Min(1, { message: 'Giới hạn dòng tối thiểu là 1' })
  @Max(100, { message: 'Giới hạn dòng tối đa là 100' })
  limit?: number = 20;

  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Trạng thái giao dịch không hợp lệ' })
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'Loại giao dịch không hợp lệ' })
  type?: TransactionType;
}
