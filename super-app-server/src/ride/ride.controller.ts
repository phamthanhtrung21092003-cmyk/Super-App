import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RideService } from './ride.service';
import { CreateRideDto, UpdateTripStatusDto, DriverLocationDto } from './dto/create-ride.dto';
import { RideGateway } from './ride.gateway';

@Controller('ride')
export class RideController {
  constructor(
    private readonly rideService: RideService,
    private readonly rideGateway: RideGateway,
  ) {}

  // ─────────────────────────────────────────
  // CUSTOMER ENDPOINTS
  // ─────────────────────────────────────────

  /** Khách đặt chuyến mới */
  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  async bookRide(@Body() dto: CreateRideDto, @Query('userId') userId?: string) {
    const trip = await this.rideService.createRide(userId || 'user-demo', dto);

    // 🔥 BROADCAST ngay lập tức tới tất cả tài xế đang online
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
  async getCustomerActiveTrip(@Query('userId') userId?: string) {
    return this.rideService.getCustomerActiveTrip(userId || 'user-demo');
  }

  /** Lấy chi tiết một chuyến theo tripId */
  @Get(':id')
  async getTripById(@Param('id') id: string) {
    return this.rideService.getTripById(id);
  }

  /** Khách huỷ chuyến */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelTrip(
    @Param('id') id: string,
    @Body('cancelReason') cancelReason?: string,
    @Body('cancelledBy') cancelledBy?: string,
  ) {
    const trip = await this.rideService.cancelTrip(id, cancelReason, cancelledBy);

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
  @HttpCode(HttpStatus.OK)
  async rateDriver(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
    @Body('tags') tags?: string[],
    @Body('tip') tip?: number,
  ) {
    return this.rideService.rateDriver(id, rating, comment, tags, tip);
  }

  // ─────────────────────────────────────────
  // DRIVER ENDPOINTS
  // ─────────────────────────────────────────

  /** Tài xế lấy danh sách cuốc đang SEARCHING (để hiển thị trên home screen nếu chưa kết socket) */
  @Get('driver/pending')
  async getPendingTrips(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.rideService.getPendingTrips(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  /** Tài xế xem cuốc đang active của mình */
  @Get('driver/active')
  async getDriverActiveTrip(@Query('driverId') driverId?: string) {
    return this.rideService.getDriverActiveTrip(driverId || 'driver-demo-1');
  }

  /** Tài xế nhận cuốc */
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRide(
    @Param('id') id: string,
    @Body('driverId') driverId?: string,
    @Body('driverName') driverName?: string,
    @Body('vehicleName') vehicleName?: string,
    @Body('licensePlate') licensePlate?: string,
    @Body('avatarUrl') avatarUrl?: string,
    @Body('rating') rating?: number,
  ) {
    const trip = await this.rideService.acceptRide(id, driverId || 'driver-demo-1', {
      driverName,
      vehicleName,
      licensePlate,
      avatarUrl,
      rating,
    });

    // 🔥 Thông báo cho khách hàng biết tài xế đã nhận cuốc (realtime)
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
  @HttpCode(HttpStatus.OK)
  async updateTripStatus(@Param('id') id: string, @Body() dto: UpdateTripStatusDto) {
    const trip = await this.rideService.updateTripStatus(id, dto);

    // 🔥 Broadcast cập nhật trạng thái tới cả 2 bên
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
  @HttpCode(HttpStatus.OK)
  async toggleOnline(
    @Body('isOnline') isOnline: boolean,
    @Body('driverId') driverId?: string,
  ) {
    const result = await this.rideService.toggleDriverOnline(driverId || 'driver-demo-1', isOnline);

    // Notify gateway về trạng thái online/offline
    if (isOnline) {
      this.rideGateway.notifyDriverOnline(driverId || 'driver-demo-1');
    } else {
      this.rideGateway.notifyDriverOffline(driverId || 'driver-demo-1');
    }

    return result;
  }

  /** Tài xế cập nhật vị trí GPS (REST fallback nếu socket không khả dụng) */
  @Post('driver/location')
  @HttpCode(HttpStatus.OK)
  async updateLocation(@Body() dto: DriverLocationDto) {
    return this.rideService.updateDriverLocation(dto);
  }

  /** Thông tin tài xế demo */
  @Get('driver/me')
  async getDriverInfo(@Query('driverId') driverId?: string) {
    return {
      id: driverId || 'driver-demo-1',
      fullName: 'Nguyễn Văn Hùng',
      phone: '0988123456',
      avatarUrl: 'https://i.pravatar.cc/150?img=60',
      licensePlate: '29A-999.88',
      vehicleName: 'VinFast VF 8 Xanh SM',
      rating: 4.95,
      tier: 'KIM CƯƠNG',
      totalTrips: 1248,
    };
  }

  /** Lịch sử chuyến của tài xế */
  @Get('driver/history')
  async getDriverHistory(@Query('driverId') driverId?: string) {
    return this.rideService.getDriverHistory(driverId || 'driver-demo-1');
  }

  /** Ví tài xế */
  @Get('driver/wallet')
  async getDriverWallet(@Query('driverId') driverId?: string) {
    return this.rideService.getDriverWallet(driverId || 'driver-demo-1');
  }

  /** Nạp ví tài xế */
  @Post('driver/wallet/topup')
  @HttpCode(HttpStatus.OK)
  async topupWallet(
    @Body('amount') amount: number,
    @Body('driverId') driverId?: string,
  ) {
    return this.rideService.topupDriverWallet(driverId || 'driver-demo-1', amount || 100000);
  }
}
