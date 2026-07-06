import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DriverRegisterDto {
  @ApiProperty({ example: '0987654321', description: 'Số điện thoại tài xế' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' })
  phone: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn Tài', description: 'Họ và tên tài xế' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @Length(2, 50, { message: 'Họ và tên phải từ 2 đến 50 ký tự' })
  fullName: string;

  @ApiProperty({ example: '29A-12345', description: 'Biển số xe' })
  @IsNotEmpty({ message: 'Biển số xe không được để trống' })
  @IsString({ message: 'Biển số xe phải là chuỗi' })
  @Length(3, 15, { message: 'Biển số xe phải từ 3 đến 15 ký tự' })
  licensePlate: string;

  @ApiProperty({ example: 'BIKE', description: 'Loại phương tiện' })
  @IsNotEmpty({ message: 'Loại phương tiện không được để trống' })
  @IsString({ message: 'Loại phương tiện phải là chuỗi' })
  vehicleType: string;
}
