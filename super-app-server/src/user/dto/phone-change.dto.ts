import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RequestPhoneOtpDto {
  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại mới cần đổi',
  })
  @IsNotEmpty({ message: 'Số điện thoại mới không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string | undefined),
  )
  @Matches(/^(0[3|5|7|8|9])[0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (định dạng Việt Nam 10 chữ số: 03x, 05x, 07x, 08x, 09x)',
  })
  newPhone!: string;

  @ApiProperty({
    example: 'Matkhau@123',
    description: 'Mật khẩu tài khoản để xác thực chính chủ',
  })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu tài khoản để xác thực' })
  @IsString()
  password!: string;
}

export class VerifyPhoneOtpDto {
  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại mới cần đổi',
  })
  @IsNotEmpty({ message: 'Số điện thoại mới không được để trống' })
  @IsString()
  newPhone!: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP 6 chữ số',
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi' })
  @Length(6, 6, { message: 'Mã OTP phải gồm đúng 6 chữ số' })
  @Matches(/^[0-9]{6}$/, { message: 'Mã OTP chỉ bao gồm các chữ số' })
  otp!: string;
}
