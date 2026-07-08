import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ảnh đại diện người dùng (JPG, PNG, WEBP, tối đa 5MB)',
  })
  avatar: any;
}
