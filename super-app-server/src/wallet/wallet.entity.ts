import { ApiProperty } from '@nestjs/swagger';
import { Currency, WalletStatus } from '@prisma/client';

export class WalletEntity {
  @ApiProperty({ example: '85ab-b66f97d854ae', description: 'ID của ví' })
  id!: string;

  @ApiProperty({ example: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae', description: 'ID người dùng' })
  userId!: string;

  @ApiProperty({ example: 'VL171999999', description: 'Mã số ví duy nhất' })
  walletNumber!: string;

  @ApiProperty({ example: '0.00', description: 'Số dư ví' })
  balance!: string;

  @ApiProperty({ example: '0.00', description: 'Số dư tạm giữ' })
  pendingBalance!: string;

  @ApiProperty({ example: 0, description: 'Điểm thưởng tích lũy' })
  rewardPoints!: number;

  @ApiProperty({ example: 'VND', enum: Currency, description: 'Đơn vị tiền tệ' })
  currency!: Currency;

  @ApiProperty({ example: 'ACTIVE', enum: WalletStatus, description: 'Trạng thái ví' })
  status!: WalletStatus;

  @ApiProperty({ example: '2026-07-09T10:00:00Z', description: 'Ngày tạo ví' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-09T10:15:00Z', description: 'Ngày cập nhật ví' })
  updatedAt!: Date;
}
