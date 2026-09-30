import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Nội dung bình luận' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @MaxLength(1000, { message: 'Nội dung bình luận không được vượt quá 1000 ký tự' })
  content: string;

  @ApiPropertyOptional({ description: 'ID của bình luận cha nếu là câu trả lời reply' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
