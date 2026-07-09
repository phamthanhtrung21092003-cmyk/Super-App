import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Trung219nt@1',
    description: 'Mật khẩu hiện tại',
  })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  @Length(8, 100, { message: 'Mật khẩu hiện tại phải từ 8 đến 100 ký tự' })
  currentPassword!: string;

  @ApiProperty({
    example: 'Trung219nt@2',
    description: 'Mật khẩu mới',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,100}$/, {
    message:
      'Mật khẩu mới phải từ 8 đến 100 ký tự và chứa ít nhất 1 chữ cái thường, 1 chữ cái viết hoa, 1 số, và 1 ký tự đặc biệt (@$!%*?&)',
  })
  newPassword!: string;

  @ApiProperty({
    example: 'Trung219nt@2',
    description: 'Xác nhận mật khẩu mới',
  })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
  @IsString({ message: 'Xác nhận mật khẩu mới phải là chuỗi' })
  @Length(8, 100, { message: 'Xác nhận mật khẩu mới phải từ 8 đến 100 ký tự' })
  confirmPassword!: string;
}
