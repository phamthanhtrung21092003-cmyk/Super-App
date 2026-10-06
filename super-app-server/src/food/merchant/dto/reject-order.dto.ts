import { IsString, IsNotEmpty } from 'class-validator';

export class RejectOrderDto {
  @IsString({ message: 'Lý do từ chối phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do từ chối đơn hàng là bắt buộc' })
  reason: string;
}
