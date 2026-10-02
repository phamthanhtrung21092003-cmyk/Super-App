import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRideDto {
  @ApiProperty({ example: '123 Cầu Giấy, Hà Nội', description: 'Địa chỉ đón khách' })
  @IsNotEmpty({ message: 'Địa chỉ đón không được để trống' })
  @IsString({ message: 'Địa chỉ đón phải là chuỗi ký tự' })
  pickupAddress: string;

  @ApiProperty({ example: 21.0285, description: 'Vĩ độ điểm đón' })
  @IsNotEmpty({ message: 'Vĩ độ điểm đón không được để trống' })
  @IsNumber({}, { message: 'Vĩ độ điểm đón phải là số' })
  pickupLat: number;

  @ApiProperty({ example: 105.7801, description: 'Kinh độ điểm đón' })
  @IsNotEmpty({ message: 'Kinh độ điểm đón không được để trống' })
  @IsNumber({}, { message: 'Kinh độ điểm đón phải là số' })
  pickupLng: number;

  @ApiProperty({ example: 'Bến xe Mỹ Đình, Hà Nội', description: 'Địa chỉ trả khách' })
  @IsNotEmpty({ message: 'Địa chỉ trả không được để trống' })
  @IsString({ message: 'Địa chỉ trả phải là chuỗi ký tự' })
  dropoffAddress: string;

  @ApiProperty({ example: 21.0285, description: 'Vĩ độ điểm trả' })
  @IsNotEmpty({ message: 'Vĩ độ điểm trả không được để trống' })
  @IsNumber({}, { message: 'Vĩ độ điểm trả phải là số' })
  dropoffLat: number;

  @ApiProperty({ example: 105.7725, description: 'Kinh độ điểm trả' })
  @IsNotEmpty({ message: 'Kinh độ điểm trả không được để trống' })
  @IsNumber({}, { message: 'Kinh độ điểm trả phải là số' })
  dropoffLng: number;

  @ApiPropertyOptional({ example: 'ev', description: 'Loại phương tiện: ev | bike | car7 | suv' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'RIDE', description: 'Loại dịch vụ: RIDE | EXPRESS | FOOD' })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiPropertyOptional({ example: 10000, description: 'Tiền tip thêm cho tài xế (VND)' })
  @IsOptional()
  @IsNumber({}, { message: 'Tiền tip phải là số' })
  @Min(0, { message: 'Tiền tip không thể âm' })
  tipAmount?: number;

  @ApiPropertyOptional({ example: 'CASH', description: 'Phương thức thanh toán: CASH | SUPERPAY' })
  @IsOptional()
  @IsIn(['CASH', 'SUPERPAY', 'VIETQR', 'MOMO', 'ZALOPAY'], {
    message: 'Phương thức thanh toán không hợp lệ',
  })
  paymentMethod?: string;
}

export class UpdateTripStatusDto {
  @ApiProperty({
    example: 'ACCEPTED',
    enum: ['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP', 'COMPLETED', 'CANCELLED'],
    description: 'Trạng thái mới của chuyến',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP', 'COMPLETED', 'CANCELLED'], {
    message: 'Trạng thái không hợp lệ',
  })
  status: 'ACCEPTED' | 'ARRIVED_PICKUP' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';

  @ApiPropertyOptional({ example: 'Khách không bắt máy', description: 'Lý do hủy chuyến (nếu có)' })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiPropertyOptional({ example: 5, description: 'Đánh giá số sao (1-5)' })
  @IsOptional()
  @IsNumber({}, { message: 'Rating phải là số' })
  @Min(1, { message: 'Đánh giá tối thiểu 1 sao' })
  @Max(5, { message: 'Đánh giá tối đa 5 sao' })
  driverRating?: number;

  @ApiPropertyOptional({ example: 'Lái xe rất an toàn', description: 'Nhận xét' })
  @IsOptional()
  @IsString()
  driverReview?: string;
}

export class DriverLocationDto {
  @ApiPropertyOptional({ description: 'ID tài xế (mặc định lấy từ Token)' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiProperty({ example: 21.0285, description: 'Vĩ độ hiện tại' })
  @IsNotEmpty({ message: 'Vĩ độ không được để trống' })
  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  lat: number;

  @ApiProperty({ example: 105.7801, description: 'Kinh độ hiện tại' })
  @IsNotEmpty({ message: 'Kinh độ không được để trống' })
  @IsNumber({}, { message: 'Kinh độ phải là số' })
  lng: number;

  @ApiPropertyOptional({ example: 90, description: 'Hướng di chuyển (độ)' })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @ApiPropertyOptional({ example: 35, description: 'Tốc độ hiện tại (km/h)' })
  @IsOptional()
  @IsNumber()
  speed?: number;
}
