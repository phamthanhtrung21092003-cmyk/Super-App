import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nhà riêng', description: 'Nhãn địa chỉ (Nhà riêng, Văn phòng, Trường học...)' })
  @IsNotEmpty({ message: 'Nhãn địa chỉ không được để trống' })
  @IsString({ message: 'Nhãn địa chỉ phải là chuỗi' })
  @Length(2, 50, { message: 'Nhãn địa chỉ phải từ 2 đến 50 ký tự' })
  label!: string;

  @ApiProperty({ example: 'Phạm Thành Trung', description: 'Tên người nhận hàng' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @Length(2, 100, { message: 'Tên người nhận phải từ 2 đến 100 ký tự' })
  receiverName!: string;

  @ApiProperty({ example: '0394562659', description: 'Số điện thoại người nhận hàng' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^(03|05|07|08|09)\d{8}$/, {
    message: 'Số điện thoại di động Việt Nam không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08, hoặc 09)',
  })
  receiverPhone!: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Tỉnh/Thành phố' })
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
  province!: string;

  @ApiProperty({ example: 'Cầu Giấy', description: 'Quận/Huyện' })
  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  @IsString({ message: 'Quận/Huyện phải là chuỗi' })
  district!: string;

  @ApiProperty({ example: 'Dịch Vọng', description: 'Phường/Xã' })
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  @IsString({ message: 'Phường/Xã phải là chuỗi' })
  ward!: string;

  @ApiProperty({ example: '123 Đường ABC', description: 'Địa chỉ chi tiết (Số nhà, ngõ ngách, tên đường)' })
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  @IsString({ message: 'Địa chỉ chi tiết phải là chuỗi' })
  detailAddress!: string;

  @ApiProperty({ example: 'Gọi trước khi giao', description: 'Ghi chú thêm', required: false })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @ApiProperty({ example: 21.0285, description: 'Vĩ độ vị trí trên bản đồ', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số thực' })
  latitude?: number;

  @ApiProperty({ example: 105.8542, description: 'Kinh độ vị trí trên bản đồ', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số thực' })
  longitude?: number;

  @ApiProperty({ example: false, description: 'Có đặt làm địa chỉ mặc định không', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isDefault phải là giá trị boolean' })
  isDefault?: boolean;
}
