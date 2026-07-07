import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng (User)' })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công', schema: { example: { message: 'Register successfully' } } })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào DTO không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Số điện thoại đã tồn tại' })
  async register(@Body() dto: UserRegisterDto) {
    await this.authService.registerUser(dto);
    return { message: 'Register successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập tài khoản người dùng (User)' })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        user: {
          id: 'b320d3ba-4ecc-4901-85ab-b66f97d854ae',
          phone: '0912345678',
          fullName: 'Nguyen Van A',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Số điện thoại hoặc mật khẩu không chính xác' })
  async login(@Body() dto: UserLoginDto) {
    return this.authService.loginUser(dto);
  }
}
