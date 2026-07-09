import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus, TransactionDirection, Currency } from '@prisma/client';

export class TransactionEntity {
  @ApiProperty({ example: '85ab-b66f97d854ae', description: 'ID của giao dịch' })
  id!: string;

  @ApiProperty({ example: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae', description: 'ID của ví' })
  walletId!: string;

  @ApiProperty({ example: '100000.00', description: 'Số tiền giao dịch' })
  amount!: string;

  @ApiProperty({ example: '500000.00', description: 'Số dư ví trước giao dịch' })
  balanceBefore!: string;

  @ApiProperty({ example: '600000.00', description: 'Số dư ví sau giao dịch' })
  balanceAfter!: string;

  @ApiProperty({ example: 'TOP_UP', enum: TransactionType, description: 'Loại giao dịch' })
  type!: TransactionType;

  @ApiProperty({ example: 'CREDIT', enum: TransactionDirection, description: 'Chiều dòng tiền' })
  direction!: TransactionDirection;

  @ApiProperty({ example: 'SUCCESS', enum: TransactionStatus, description: 'Trạng thái giao dịch' })
  status!: TransactionStatus;

  @ApiProperty({ example: 'VND', enum: Currency, description: 'Đơn vị tiền tệ' })
  currency!: Currency;

  @ApiProperty({ example: 'Nạp tiền vào ví qua ngân hàng', description: 'Nội dung giao dịch', required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'topup_171999999', description: 'Mã tham chiếu của dịch vụ liên quan', required: false, nullable: true })
  referenceId!: string | null;

  @ApiProperty({ example: 'TOPUP', description: 'Loại dịch vụ tham chiếu (RIDE, FOOD, SHOP, TOPUP...)', required: false, nullable: true })
  referenceType!: string | null;

  @ApiProperty({ example: 'idem_key_8472948', description: 'Mã chống trùng lặp', required: false, nullable: true })
  idempotencyKey!: string | null;

  @ApiProperty({ example: null, description: 'Dữ liệu metadata phụ dưới dạng JSON', required: false, nullable: true })
  metadata!: any | null;

  @ApiProperty({ example: '2026-07-09T10:00:00Z', description: 'Ngày tạo giao dịch' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-09T10:15:00Z', description: 'Ngày cập nhật giao dịch' })
  updatedAt!: Date;
}
