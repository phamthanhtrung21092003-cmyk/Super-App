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

export class UpdateDriverSettingsDto {
  @ApiPropertyOptional({ example: true, description: 'Tự động nhận cuốc' })
  @IsOptional()
  autoAccept?: boolean;

  @ApiPropertyOptional({ example: 5, description: 'Bán kính nhận cuốc (km)' })
  @IsOptional()
  @IsNumber()
  dispatchRadius?: number;

  @ApiPropertyOptional({ example: true, description: 'Nhận cuốc chở khách' })
  @IsOptional()
  enableRide?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Nhận cuốc giao hàng' })
  @IsOptional()
  enableDelivery?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Nhận cuốc giao đồ ăn' })
  @IsOptional()
  enableFood?: boolean;

  @ApiPropertyOptional({ example: '123 Cầu Giấy, Hà Nội', description: 'Địa chỉ nhà' })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiPropertyOptional({ example: 21.0285 })
  @IsOptional()
  @IsNumber()
  homeLat?: number;

  @ApiPropertyOptional({ example: 105.7801 })
  @IsOptional()
  @IsNumber()
  homeLng?: number;

  @ApiPropertyOptional({ example: true, description: 'Chuông báo âm lượng tối đa' })
  @IsOptional()
  highVolumeAlert?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Rung Haptics' })
  @IsOptional()
  hapticFeedback?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Đọc hướng dẫn giọng nói' })
  @IsOptional()
  voiceGuidance?: boolean;

  @ApiPropertyOptional({ example: 'GOOGLE_MAPS', description: 'Bản đồ mặc định' })
  @IsOptional()
  @IsString()
  defaultMapApp?: string;

  @ApiPropertyOptional({ example: false, description: 'Tự mở Google Maps khi nhận cuốc' })
  @IsOptional()
  autoOpenMap?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Tránh trạm thu phí' })
  @IsOptional()
  avoidTolls?: boolean;

  @ApiPropertyOptional({ example: 'ONLINE_ONLY', description: 'Giữ màn hình sáng: ALWAYS | ONLINE_ONLY | SYSTEM_DEFAULT' })
  @IsOptional()
  @IsString()
  keepAwakeMode?: string;

  @ApiPropertyOptional({ example: 'SYSTEM', description: 'Chế độ giao diện: LIGHT | DARK | SYSTEM' })
  @IsOptional()
  @IsString()
  themeMode?: string;

  @ApiPropertyOptional({ example: '113', description: 'Số điện thoại SOS 1' })
  @IsOptional()
  @IsString()
  sosPhone1?: string;

  @ApiPropertyOptional({ example: '0988123456', description: 'Số điện thoại SOS 2' })
  @IsOptional()
  @IsString()
  sosPhone2?: string;
}

export class DriverTopupDto {
  @ApiProperty({ example: 200000, description: 'Số tiền nạp (VND)' })
  @IsNotEmpty({ message: 'Số tiền nạp không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(10000, { message: 'Số tiền nạp tối thiểu là 10,000 VND' })
  amount: number;
}

export class DriverWithdrawDto {
  @ApiProperty({ example: 500000, description: 'Số tiền rút (VND)' })
  @IsNotEmpty({ message: 'Số tiền rút không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(50000, { message: 'Số tiền rút tối thiểu là 50,000 VND' })
  amount: number;

  @ApiPropertyOptional({ example: 'MB Bank', description: 'Tên ngân hàng nhận tiền' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '0988123456', description: 'Số tài khoản nhận tiền' })
  @IsOptional()
  @IsString()
  accountNo?: string;

  @ApiPropertyOptional({ example: 'NGUYEN VAN HUNG', description: 'Tên chủ tài khoản' })
  @IsOptional()
  @IsString()
  accountHolder?: string;
}
