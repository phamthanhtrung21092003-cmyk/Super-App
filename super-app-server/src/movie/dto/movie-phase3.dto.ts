import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HoldSeatsDto {
  @ApiProperty({ description: 'ID của suất chiếu (Showtime ID)' })
  @IsString()
  @IsNotEmpty({ message: 'showtimeId không được để trống' })
  showtimeId: string;

  @ApiProperty({ description: 'Danh sách ID ghế (Seat IDs hoặc ShowtimeSeat IDs)', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 ghế để giữ chỗ' })
  @IsString({ each: true })
  seatIds: string[];

  @ApiPropertyOptional({ description: 'Khóa chống trùng lặp (Idempotency Key)' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class ReleaseSeatsDto {
  @ApiProperty({ description: 'ID của suất chiếu (Showtime ID)' })
  @IsString()
  @IsNotEmpty({ message: 'showtimeId không được để trống' })
  showtimeId: string;

  @ApiPropertyOptional({ description: 'Danh sách ID ghế cần giải phóng', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seatIds?: string[];

  @ApiPropertyOptional({ description: 'Danh sách ID bản ghi SeatHold cần giải phóng', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  holdIds?: string[];
}

export class ComboSelectionItemDto {
  @ApiProperty({ description: 'ID của Combo bắp nước' })
  @IsString()
  @IsNotEmpty()
  comboId: string;

  @ApiProperty({ description: 'Số lượng combo', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateMovieOrderDto {
  @ApiProperty({ description: 'ID của suất chiếu (Showtime ID)' })
  @IsString()
  @IsNotEmpty({ message: 'showtimeId không được để trống' })
  showtimeId: string;

  @ApiProperty({ description: 'Danh sách ID ghế đã giữ chỗ (Seat IDs)', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn đặt vé phải có ít nhất 1 ghế' })
  @IsString({ each: true })
  seatIds: string[];

  @ApiPropertyOptional({
    description: 'Danh sách ID combo (nếu mỗi combo lấy số lượng = 1)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  comboIds?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách combo kèm số lượng cụ thể',
    type: [ComboSelectionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboSelectionItemDto)
  @IsOptional()
  combos?: ComboSelectionItemDto[];

  @ApiPropertyOptional({ description: 'Mã giảm giá / Voucher' })
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiPropertyOptional({ description: 'Họ tên người nhận vé' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại người nhận vé' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Email người nhận vé' })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Khóa chống trùng lặp (Idempotency Key)' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
export class ValidateMovieVoucherDto {
  @ApiProperty({ description: 'Mã giảm giá / Voucher cần kiểm tra' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã giảm giá' })
  voucherCode: string;

  @ApiPropertyOptional({ description: 'ID suất chiếu (Showtime ID)' })
  @IsString()
  @IsOptional()
  showtimeId?: string;

  @ApiPropertyOptional({ description: 'Danh sách ID ghế đang chọn', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seatIds?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách combo kèm số lượng cụ thể',
    type: [ComboSelectionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboSelectionItemDto)
  @IsOptional()
  combos?: ComboSelectionItemDto[];

  @ApiPropertyOptional({ description: 'Tạm tính (nếu chưa truyền seatIds)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  subtotal?: number;
}