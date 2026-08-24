import { IsNotEmpty, IsString, IsEmail, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RequestEmailOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email mới cần liên kết',
  })
  @IsNotEmpty({ message: 'Địa chỉ email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as string | undefined),
  )
  newEmail!: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email mới cần liên kết',
  })
  @IsNotEmpty({ message: 'Địa chỉ email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as string | undefined),
  )
  newEmail!: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã xác nhận 6 chữ số',
  })
  @IsNotEmpty({ message: 'Mã xác nhận không được để trống' })
  @IsString({ message: 'Mã xác nhận phải là chuỗi' })
  @Length(6, 6, { message: 'Mã xác nhận phải gồm đúng 6 chữ số' })
  @Matches(/^[0-9]{6}$/, { message: 'Mã xác nhận chỉ bao gồm các chữ số' })
  otp!: string;
}
