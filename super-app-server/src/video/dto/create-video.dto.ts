import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @ApiProperty({ description: 'Đường dẫn tĩnh tương đối của video (/uploads/videos/...)' })
  @IsString()
  @IsNotEmpty({ message: 'videoUrl không được để trống' })
  videoUrl: string;

  @ApiPropertyOptional({ description: 'Đường dẫn thumbnail cover ảnh bìa (/uploads/thumbnails/...)' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Mô tả/Caption của video' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ description: 'Tên bài hát/âm thanh nền', default: 'Âm thanh gốc' })
  @IsString()
  @IsOptional()
  musicTitle?: string;

  @ApiPropertyOptional({ description: 'Địa điểm quay hoặc gắn thẻ' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'ID dịch vụ V-Life liên kết (tour, phòng, món ăn)' })
  @IsUUID('4', { message: 'serviceId phải là định dạng UUID' })
  @IsOptional()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Thời lượng video tính bằng giây' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: 'Chiều rộng khung hình (pixels)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ description: 'Chiều cao khung hình (pixels)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({ description: 'Dung lượng file tính bằng bytes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sizeBytes?: number;

  @ApiPropertyOptional({ description: 'MIME type của video', default: 'video/mp4' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Danh sách hashtag', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];
}
