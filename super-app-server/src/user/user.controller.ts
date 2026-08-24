import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPhoneOtpDto, VerifyPhoneOtpDto } from './dto/phone-change.dto';
import { RequestEmailOtpDto, VerifyEmailOtpDto } from './dto/email-change.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check-username')
  @ApiOperation({ summary: 'Kiểm tra tính khả dụng của username' })
  async checkUsername(@Query('username') username: string) {
    return this.userService.checkUsername(username);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  async getMyProfile(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.userService.getMyProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân của người dùng' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.id || req.user.sub;
    return this.userService.updateProfile(userId, dto);
  }

  @Post('me/phone/request-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yêu cầu mã OTP để đổi số điện thoại' })
  async requestPhoneOtp(@Req() req: any, @Body() dto: RequestPhoneOtpDto) {
    const userId = req.user.id || req.user.sub;
    return this.userService.requestPhoneOtp(userId, dto);
  }

  @Post('me/phone/verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xác thực mã OTP và cập nhật số điện thoại mới' })
  async verifyPhoneOtp(@Req() req: any, @Body() dto: VerifyPhoneOtpDto) {
    const userId = req.user.id || req.user.sub;
    return this.userService.verifyPhoneOtp(userId, dto);
  }

  @Post('me/email/request-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yêu cầu mã xác thực để liên kết / đổi email' })
  async requestEmailOtp(@Req() req: any, @Body() dto: RequestEmailOtpDto) {
    const userId = req.user.id || req.user.sub;
    return this.userService.requestEmailOtp(userId, dto);
  }

  @Post('me/email/verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xác thực OTP và cập nhật email' })
  async verifyEmailOtp(@Req() req: any, @Body() dto: VerifyEmailOtpDto) {
    const userId = req.user.id || req.user.sub;
    return this.userService.verifyEmailOtp(userId, dto);
  }

  @Patch('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu tài khoản' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.id || req.user.sub;
    const currentDeviceId = req.user.deviceId;
    return this.userService.changePassword(userId, dto, currentDeviceId);
  }

  @Get('me/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách thiết bị và lịch sử đăng nhập' })
  async getDevices(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    const currentDeviceId = req.user.deviceId;
    return this.userService.getUserDevices(userId, currentDeviceId);
  }

  @Delete('me/devices/others')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất khỏi tất cả các thiết bị khác' })
  async logoutOtherDevices(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    const currentDeviceId = req.user.deviceId;
    return this.userService.logoutOtherDevices(userId, currentDeviceId);
  }

  @Delete('me/devices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất một thiết bị cụ thể' })
  async logoutDevice(@Req() req: any, @Param('id') deviceId: string) {
    const userId = req.user.id || req.user.sub;
    const currentDeviceId = req.user.deviceId;
    return this.userService.logoutDevice(userId, deviceId, currentDeviceId);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tải lên avatar người dùng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const userId = req.user.id || req.user.sub;
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.userService.updateAvatar(userId, avatarUrl);
  }
}
