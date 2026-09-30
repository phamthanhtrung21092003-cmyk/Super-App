import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VideoService } from './video.service';
import { CreateVideoDto, FeedQueryDto, CreateCommentDto } from './dto';

@ApiTags('Videos')
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file video và ảnh thumbnail lên máy chủ' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['video'],
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'File video (MP4, MOV, WEBM, tối đa 100MB)',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh bìa đại diện (JPG, PNG, WEBP, tối đa 10MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tải lên video thành công' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadSubdir =
              file.fieldname === 'video'
                ? 'videos'
                : file.fieldname === 'thumbnail'
                ? 'thumbnails'
                : '';
            const targetDir = path.join(process.cwd(), 'uploads', uploadSubdir);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            cb(null, targetDir);
          },
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            let ext = extname(file.originalname).toLowerCase();
            if (!ext || ext === '.') {
              if (file.mimetype === 'video/mp4') ext = '.mp4';
              else if (file.mimetype === 'video/quicktime') ext = '.mov';
              else if (file.mimetype === 'video/webm') ext = '.webm';
              else if (file.mimetype?.includes('png')) ext = '.png';
              else if (file.mimetype?.includes('webp')) ext = '.webp';
              else if (file.mimetype?.includes('jpeg') || file.mimetype?.includes('jpg')) ext = '.jpg';
              else ext = file.fieldname === 'video' ? '.mp4' : '.jpg';
            }
            cb(null, `${randomName}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'video') {
            const isVideoMime = file.mimetype.match(/^video\/(mp4|quicktime|x-matroska|webm)$/);
            const isVideoExt = file.originalname.match(/\.(mp4|mov|webm)$/i);
            if (!isVideoMime && !isVideoExt) {
              return cb(
                new BadRequestException('Định dạng video không được hỗ trợ. Chỉ chấp nhận MP4, MOV, WEBM!'),
                false,
              );
            }
          } else if (file.fieldname === 'thumbnail') {
            const isImgMime = file.mimetype.match(/^image\/(jpeg|jpg|png|webp|gif)$/);
            const isImgExt = file.originalname.match(/\.(jpeg|jpg|png|webp)$/i);
            if (!isImgMime && !isImgExt) {
              return cb(
                new BadRequestException('Định dạng thumbnail không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP!'),
                false,
              );
            }
          }
          cb(null, true);
        },
        limits: {
          fileSize: 100 * 1024 * 1024, // 100MB
        },
      },
    ),
  )
  async uploadVideo(
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    if (!files?.video || files.video.length === 0) {
      throw new BadRequestException('Vui lòng chọn file video để tải lên');
    }

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail?.[0];

    if (thumbnailFile && thumbnailFile.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Dung lượng ảnh bìa thumbnail không được vượt quá 10MB');
    }

    const videoUrl = `/uploads/videos/${videoFile.filename}`;
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null;

    return {
      success: true,
      message: 'Tải file lên máy chủ thành công',
      data: {
        videoUrl,
        thumbnailUrl,
        sizeBytes: videoFile.size,
        mimeType: videoFile.mimetype,
        originalname: videoFile.originalname,
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài đăng video mới (Metadata, caption, hashtag, liên kết)' })
  @ApiResponse({ status: 201, description: 'Tạo bài đăng video thành công' })
  async createVideo(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateVideoDto,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }

    const video = await this.videoService.createVideo(userId, dto);
    return {
      success: true,
      message: 'Đăng video thành công',
      data: video,
    };
  }

  @Get('feed')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách video feed (TikTok-like Cursor Pagination)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách video feed thành công' })
  async getFeed(
    @CurrentUser() user: any,
    @Query() query: FeedQueryDto,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub || null;
    const feed = await this.videoService.getFeed(userId, query);
    return {
      success: true,
      data: feed,
    };
  }

  @Get(':id/processing')
  @ApiOperation({ summary: 'Lấy trạng thái xử lý video' })
  async getVideoProcessing(@Param('id') id: string) {
    const status = await this.videoService.getVideoProcessing(id);
    return {
      success: true,
      data: status,
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thả tim (Like) video' })
  async likeVideo(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.likeVideo(userId, id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bỏ thả tim (Unlike) video' })
  async unlikeVideo(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.unlikeVideo(userId, id);
  }

  @Get(':id/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách bình luận của video' })
  async getComments(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub || null;
    const comments = await this.videoService.getComments(id, userId);
    return {
      success: true,
      data: comments,
    };
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bình luận về video (hoặc trả lời bình luận)' })
  async createComment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    const comment = await this.videoService.createComment(userId, id, dto);
    return {
      success: true,
      message: 'Bình luận thành công',
      data: comment,
    };
  }

  @Post(':id/comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thích (Like) bình luận' })
  async likeComment(
    @CurrentUser() user: any,
    @Param('id') videoId: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.likeComment(userId, videoId, commentId);
  }

  @Delete(':id/comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bỏ thích (Unlike) bình luận' })
  async unlikeComment(
    @CurrentUser() user: any,
    @Param('id') videoId: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.unlikeComment(userId, videoId, commentId);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bình luận của chính mình' })
  async deleteComment(
    @CurrentUser() user: any,
    @Param('id') videoId: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.deleteComment(userId, videoId, commentId);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lưu / Bỏ lưu video vào danh sách yêu thích' })
  async saveVideo(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = user?.id || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Không thể xác thực danh tính người dùng');
    }
    return this.videoService.saveVideo(userId, id);
  }

  @Post(':id/view')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Ghi nhận lượt xem video' })
  async recordView(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('watchDuration') watchDuration?: number,
    @Req() req?: any,
  ) {
    const userId = user?.id || req?.user?.id || req?.user?.sub || null;
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    return this.videoService.recordView(userId, id, ipAddress, watchDuration);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một video' })
  async getVideoById(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const userId = user?.id || req?.user?.id || req?.user?.sub || null;
    const video = await this.videoService.getVideoById(id, userId);
    return {
      success: true,
      data: video,
    };
  }
}
