import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';

export const multerOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (
      req: any,
      file: { originalname: string },
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = randomUUID();
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (
    req: any,
    file: { mimetype: string },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only JPG, JPEG, PNG, and WEBP image files are allowed',
        ),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công',
    schema: {
      example: {
        id: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae',
        phone: '0394562659',
        fullName: 'Phạm Thành Trung',
        role: 'USER',
        avatarUrl: null,
        createdAt: '2026-07-07T10:00:00Z',
        updatedAt: '2026-07-07T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.userService.getMyProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật hồ sơ người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật hồ sơ thành công',
    schema: {
      example: {
        id: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae',
        phone: '0394562659',
        fullName: 'Phạm Thành Trung Updated',
        role: 'USER',
        avatarUrl: null,
        createdAt: '2026-07-07T10:00:00Z',
        updatedAt: '2026-07-07T10:15:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ / Dữ liệu không hợp lệ',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMyProfile(user.id, dto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadAvatarDto,
  })
  @ApiOperation({ summary: 'Cập nhật ảnh đại diện người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật ảnh đại diện thành công',
    schema: {
      example: {
        id: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae',
        phone: '0394562659',
        fullName: 'Phạm Thành Trung',
        role: 'USER',
        avatarUrl: '/uploads/avatars/4dbef3d5-acde-49cf-a8d1-a91cf0e7ab51.jpg',
        createdAt: '2026-07-07T10:00:00Z',
        updatedAt: '2026-07-07T10:15:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Yêu cầu không hợp lệ / Định dạng tệp hoặc kích thước không đúng',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async uploadAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile()
    file: { filename: string; path: string; mimetype: string; size: number },
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    return this.userService.updateAvatar(user.id, file);
  }
}
