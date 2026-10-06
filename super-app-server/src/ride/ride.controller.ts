import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Put,
} from '@nestjs/common';
import { RideService } from './ride.service';
import {
  CreateRideDto,
  UpdateTripStatusDto,
  DriverLocationDto,
  UpdateDriverSettingsDto,
  DriverTopupDto,
  DriverWithdrawDto,
} from './dto/create-ride.dto';
import { RideGateway } from './ride.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Ride & Transport')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ride')
export class RideController {
  constructor(
    private readonly rideService: RideService,
    private readonly rideGateway: RideGateway,
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────
  // CUSTOMER ENDPOINTS (Yêu cầu Role USER)
  // ─────────────────────────────────────────

  /** Khách đặt chuyến mới - Tính giá độc quyền từ Server */
  @Post('book')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khách hàng đặt chuyến mới (Bảo vệ: Role USER)' })
  async bookRide(@Body() dto: CreateRideDto, @CurrentUser() user: any) {
    const trip = await this.rideService.createRide(user.id, dto);

    // Broadcast cho các tài xế online
    this.rideGateway.dispatchNewOrder({
      tripId: trip.id,
      bookingCode: trip.bookingCode,
      serviceType: trip.serviceType,
      vehicleType: trip.vehicleType,
      pickup: trip.pickupAddress,
      pickupLat: trip.pickupLat,
      pickupLng: trip.pickupLng,
      dropoff: trip.dropoffAddress,
      dropoffLat: trip.dropoffLat,
      dropoffLng: trip.dropoffLng,
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      fareAmount: trip.fareAmount,
      finalAmount: trip.finalAmount,
      paymentMethod: trip.paymentMethod,
      customerName: trip.customerName,
      customerPhone: trip.customerPhone,
      profitScore: Math.min(98, Math.round(60 + trip.finalAmount / 1500)),
    });

    return trip;
  }

  /** Khách xem trip đang active của mình */
  @Get('customer/active')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Xem chuyến đi đang hoạt động của khách' })
  async getCustomerActiveTrip(@CurrentUser() user: any) {
    return this.rideService.getCustomerActiveTrip(user.id);
  }

  /** Lấy chi tiết một chuyến theo tripId */
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết chuyến xe theo ID' })
  async getTripById(@Param('id') id: string, @CurrentUser() user: any) {
    const trip = await this.rideService.getTripById(id);
    // Chỉ cho phép khách hàng của chuyến, tài xế của chuyến, hoặc tài xế đang tìm cuốc (SEARCHING), hoặc ADMIN
    if (
      user.role !== Role.ADMIN &&
      trip.userId !== user.id &&
      trip.driverId !== user.id &&
      trip.status !== 'SEARCHING'
    ) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin chuyến đi này.');
    }
    return trip;
  }

  /** Khách huỷ chuyến (hoặc tài xế huỷ chuyến của mình) */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy chuyến xe (Chỉ chủ cuốc hoặc tài xế nhận cuốc)' })
  async cancelTrip(
    @Param('id') id: string,
    @Body('cancelReason') cancelReason?: string,
    @CurrentUser() user?: any,
  ) {
    const cancelledBy = user.role === Role.DRIVER ? 'driver' : 'customer';
    const trip = await this.rideService.cancelTrip(id, cancelReason, cancelledBy, user.id);

    // Thông báo cho tài xế biết khách đã hủy (nếu đang có tài xế)
    if (trip.driverId) {
      this.rideGateway.notifyTripCancelled(trip.id, trip.driverId, cancelReason);
    }

    // Thông báo phòng trip (để khách xem tracking cũng biết)
    this.rideGateway.broadcastTripStatus(trip.id, 'CANCELLED', { cancelReason, cancelledBy });

    return trip;
  }

  /** Khách đánh giá tài xế sau chuyến */
  @Post(':id/rating')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh giá tài xế (Chỉ khách của chuyến đi)' })
  async rateDriver(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
    @Body('tags') tags?: string[],
    @Body('tip') tip?: number,
    @CurrentUser() user?: any,
  ) {
    return this.rideService.rateDriver(id, user.id, rating, comment, tags, tip);
  }

  // ─────────────────────────────────────────
  // DRIVER ENDPOINTS (Yêu cầu Role DRIVER)
  // ─────────────────────────────────────────

  /** Tài xế lấy danh sách cuốc đang SEARCHING */
  @Get('driver/pending')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Danh sách cuốc xe chờ tài xế (Bảo vệ: Role DRIVER)' })
  async getPendingTrips(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.rideService.getPendingTrips(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  /** Tài xế xem cuốc đang active của mình */
  @Get('driver/active')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Xem chuyến đang chạy của tài xế đăng nhập' })
  async getDriverActiveTrip(@CurrentUser() user: any) {
    return this.rideService.getDriverActiveTrip(user.id);
  }

  /** Tài xế nhận cuốc - Định danh lấy từ Token, không nhận từ Client */
  @Post(':id/accept')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tài xế nhận chuyến (Thông tin lấy từ Token + DB)' })
  async acceptRide(@Param('id') id: string, @CurrentUser() user: any) {
    const trip = await this.rideService.acceptRide(id, user.id);

    // Thông báo cho khách hàng biết tài xế đã nhận cuốc
    this.rideGateway.broadcastTripStatus(trip.id, 'ACCEPTED', {
      driverId: trip.driverId,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      vehicleName: trip.vehicleName,
      licensePlate: trip.licensePlate,
      avatarUrl: trip.avatarUrl,
      driverRating: trip.driverRating,
      etaMinutes: trip.durationMin,
    });

    return trip;
  }

  /** Tài xế cập nhật trạng thái chuyến (ARRIVED_PICKUP, IN_TRIP, COMPLETED...) */
  @Post(':id/status')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật trạng thái chuyến (Bảo vệ: Đúng tài xế & State Machine)' })
  async updateTripStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTripStatusDto,
    @CurrentUser() user: any,
  ) {
    const trip = await this.rideService.updateTripStatus(id, user.id, dto);

    // Broadcast cập nhật trạng thái tới cả 2 bên
    this.rideGateway.broadcastTripStatus(trip.id, trip.status, {
      fareAmount: trip.fareAmount,
      finalAmount: trip.finalAmount,
      paymentMethod: trip.paymentMethod,
      driverRating: dto.driverRating,
      cancelReason: dto.cancelReason,
    });

    return trip;
  }

  /** Toggle tài xế online/offline */
  @Post('driver/toggle-online')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bật/Tắt trạng thái trực tuyến của tài xế' })
  async toggleOnline(
    @Body('isOnline') isOnline: boolean,
    @CurrentUser() user: any,
  ) {
    const result = await this.rideService.toggleDriverOnline(user.id, isOnline);

    if (isOnline) {
      this.rideGateway.notifyDriverOnline(user.id);
    } else {
      this.rideGateway.notifyDriverOffline(user.id);
    }

    return result;
  }

  /** Tài xế cập nhật vị trí GPS */
  @Post('driver/location')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật vị trí GPS tài xế' })
  async updateLocation(@Body() dto: DriverLocationDto, @CurrentUser() user: any) {
    dto.driverId = user.id;
    return this.rideService.updateDriverLocation(dto);
  }

  /** Thông tin hồ sơ tài xế hiện tại */
  @Get('driver/me')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Lấy thông tin tài xế đang đăng nhập' })
  async getDriverInfo(@CurrentUser() user: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: user.id },
    });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy thông tin tài xế');
    }

    return {
      id: driver.id,
      fullName: driver.fullName,
      phone: driver.phone,
      avatarUrl: driver.avatarUrl || 'https://i.pravatar.cc/150?img=60',
      licensePlate: driver.licensePlate,
      vehicleName: driver.vehicleType,
      rating: driver.rating,
      tier: 'KIM CƯƠNG',
      totalTrips: driver.totalTrips,
      isOnline: driver.isOnline,
      walletBalance: Number(driver.cashBalance),
      creditBalance: Number(driver.creditBalance),
      cashBalance: Number(driver.cashBalance),
      dailyEarnings: Number(driver.dailyEarnings),
    };
  }

  /** Lịch sử chuyến của tài xế */
  @Get('driver/history')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Xem lịch sử chuyến xe hoàn thành của tài xế' })
  async getDriverHistory(@CurrentUser() user: any) {
    return this.rideService.getDriverHistory(user.id);
  }

  /** Xem ví tài xế (Đọc Database thật: Ví Ký Quỹ & Ví Thu Nhập & Lịch sử) */
  @Get('driver/wallet')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Xem số dư 2 ví và lịch sử giao dịch thật của tài xế' })
  async getDriverWallet(@CurrentUser() user: any) {
    return this.rideService.getDriverWallet(user.id);
  }

  /** Tài xế nạp tiền ví ký quỹ qua VietQR NAPAS 24/7 */
  @Post('driver/wallet/topup-vietqr')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tài xế nạp tiền vào Ví Ký Quỹ qua VietQR 24/7' })
  async driverTopup(@Body() dto: DriverTopupDto, @CurrentUser() user: any) {
    return this.rideService.topupDriverWallet(user.id, dto.amount);
  }

  /** Tài xế gửi yêu cầu rút tiền từ Ví Thu Nhập về ngân hàng */
  @Post('driver/wallet/withdraw')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tài xế rút tiền từ Ví Khả Dụng về tài khoản ngân hàng' })
  async driverWithdraw(@Body() dto: DriverWithdrawDto, @CurrentUser() user: any) {
    return this.rideService.withdrawDriverWallet(user.id, dto);
  }

  /** Lấy thông tin cài đặt buồng lái tài xế */
  @Get('driver/settings')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Lấy cấu hình cài đặt buồng lái của tài xế' })
  async getDriverSettings(@CurrentUser() user: any) {
    return this.rideService.getDriverSettings(user.id);
  }

  /** Cập nhật cài đặt buồng lái tài xế */
  @Put('driver/settings')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật cấu hình cài đặt buồng lái của tài xế' })
  async updateDriverSettings(
    @Body() dto: UpdateDriverSettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.rideService.updateDriverSettings(user.id, dto);
  }

  /** Nạp ví tài xế (BẢO MẬT: Chỉ ADMIN mới được cấp quyền nạp số dư trực tiếp) */
  @Post('driver/wallet/topup')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nạp ví tài xế (BẢO MẬT: Chỉ ADMIN có quyền điều chỉnh số dư trực tiếp)' })
  async topupWallet(
    @Body('amount') amount: number,
    @Body('driverId') driverId: string,
  ) {
    return this.rideService.topupDriverWallet(driverId, amount);
  }
}
