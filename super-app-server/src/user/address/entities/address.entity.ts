import { ApiProperty } from '@nestjs/swagger';

export class AddressEntity {
  @ApiProperty({ example: '85ab-b66f97d854ae', description: 'ID của địa chỉ' })
  id!: string;

  @ApiProperty({ example: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae', description: 'ID người dùng' })
  userId!: string;

  @ApiProperty({ example: 'Nhà riêng', description: 'Nhãn địa chỉ' })
  label!: string;

  @ApiProperty({ example: 'Phạm Thành Trung', description: 'Tên người nhận' })
  receiverName!: string;

  @ApiProperty({ example: '0394562659', description: 'Số điện thoại người nhận' })
  receiverPhone!: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Tỉnh/Thành phố' })
  province!: string;

  @ApiProperty({ example: 'Cầu Giấy', description: 'Quận/Huyện' })
  district!: string;

  @ApiProperty({ example: 'Dịch Vọng', description: 'Phường/Xã' })
  ward!: string;

  @ApiProperty({ example: '123 Đường ABC', description: 'Địa chỉ chi tiết' })
  detailAddress!: string;

  @ApiProperty({ example: 'Gọi trước khi giao', description: 'Ghi chú giao hàng', required: false, nullable: true })
  note!: string | null;

  @ApiProperty({ example: 21.0285, description: 'Vĩ độ', required: false, nullable: true })
  latitude!: number | null;

  @ApiProperty({ example: 105.8542, description: 'Kinh độ', required: false, nullable: true })
  longitude!: number | null;

  @ApiProperty({ example: false, description: 'Có phải là địa chỉ mặc định không' })
  isDefault!: boolean;

  @ApiProperty({ example: '2026-07-09T10:00:00Z', description: 'Ngày tạo' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-09T10:15:00Z', description: 'Ngày cập nhật' })
  updatedAt!: Date;
}
