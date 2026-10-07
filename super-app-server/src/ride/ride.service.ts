import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRideDto,
  UpdateTripStatusDto,
  DriverLocationDto,
  UpdateDriverSettingsDto,
  DriverTopupDto,
  DriverWithdrawDto,
} from './dto/create-ride.dto';
import * as bcrypt from 'bcryptjs';

export interface ActiveTrip {
  id: string;
  bookingCode: string;
  userId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  licensePlate?: string;
  avatarUrl?: string;
  driverRating?: number;
  driverReview?: string;
  serviceType: string;
  vehicleType: string;
  status: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMin: number;
  fareAmount: number;
  tipAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class RideService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /** Khởi tạo dữ liệu seed cho Driver mặc định trong database thật nếu chưa có */
  async onModuleInit() {
    try {
      await this.ensureDemoDriverAndSeedData();
    } catch (error) {
      console.warn('Seed database warning:', error.message);
    }
  }

  // ─────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  calculateFare(distanceKm: number, vehicleType: string = 'ev') {
    let base = 25000;
    let perKm = 12500;
    if (vehicleType === 'bike') {
      base = 15000;
      perKm = 7500;
    } else if (vehicleType === 'car7' || vehicleType === 'suv') {
      base = 35000;
      perKm = 16000;
    }
    const fare = base + Math.max(0, distanceKm - 2) * perKm;
    return Math.round(fare / 1000) * 1000;
  }

  private mapDbToActiveTrip(dbTrip: any, driver?: any): ActiveTrip {
    const d = driver || dbTrip.driver;
    return {
      id: dbTrip.id,
      bookingCode: dbTrip.bookingCode,
      userId: dbTrip.userId,
      driverId: dbTrip.driverId || undefined,
      driverName: d?.fullName,
      driverPhone: d?.phone,
      vehicleName: d?.vehicleType,
      licensePlate: d?.licensePlate,
      avatarUrl: d?.avatarUrl || 'https://i.pravatar.cc/150?img=60',
      driverRating: d?.rating || 5.0,
      serviceType: dbTrip.serviceType,
      vehicleType: dbTrip.vehicleType,
      status: dbTrip.status,
      pickupAddress: dbTrip.pickupAddress,
      pickupLat: dbTrip.pickupLat,
      pickupLng: dbTrip.pickupLng,
      dropoffAddress: dbTrip.dropoffAddress,
      dropoffLat: dbTrip.dropoffLat,
      dropoffLng: dbTrip.dropoffLng,
      distanceKm: dbTrip.distanceKm,
      durationMin: dbTrip.durationMin,
      fareAmount: dbTrip.fareAmount,
      tipAmount: dbTrip.tipAmount || 0,
      discountAmount: dbTrip.discountAmount || 0,
      finalAmount: dbTrip.finalAmount,
      paymentMethod: dbTrip.paymentMethod,
      paymentStatus: dbTrip.paymentStatus,
      customerName: dbTrip.customerName,
      customerPhone: dbTrip.customerPhone,
      driverReview: dbTrip.driverReview || undefined,
      cancelReason: dbTrip.cancelReason || undefined,
      createdAt: dbTrip.createdAt.toISOString(),
      updatedAt: dbTrip.updatedAt.toISOString(),
    };
  }

  // ─────────────────────────────────────────
  // CUSTOMER OPERATIONS
  // ─────────────────────────────────────────

  async createRide(userId: string, dto: CreateRideDto): Promise<ActiveTrip> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, phone: true },
    });

    const customerName = user?.fullName || 'Khách hàng V-Life';
    const customerPhone = user?.phone || '0988000000';

    const distanceKm = this.calculateDistance(
      dto.pickupLat,
      dto.pickupLng,
      dto.dropoffLat,
      dto.dropoffLng,
    );
    const fareAmount = this.calculateFare(distanceKm, dto.vehicleType || 'ev');
    const tipAmount = dto.tipAmount && dto.tipAmount > 0 ? dto.tipAmount : 0;
    const discountAmount = 15000;
    const finalAmount = Math.max(0, fareAmount + tipAmount - discountAmount);
    const bookingCode = `#VR-${Math.floor(1000 + Math.random() * 9000)}`;

    const dbTrip = await this.prisma.rideBooking.create({
      data: {
        bookingCode,
        userId: userId || 'anonymous-user',
        serviceType: dto.serviceType || 'RIDE',
        vehicleType: dto.vehicleType || 'ev',
        status: 'SEARCHING',
        pickupAddress: dto.pickupAddress,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        dropoffAddress: dto.dropoffAddress,
        dropoffLat: dto.dropoffLat,
        dropoffLng: dto.dropoffLng,
        distanceKm,
        durationMin: Math.round(distanceKm * 3.5 + 4),
        fareAmount,
        tipAmount,
        discountAmount,
        finalAmount,
        paymentMethod: dto.paymentMethod || 'CASH',
        paymentStatus: dto.paymentMethod === 'SUPERPAY' ? 'PAID' : 'UNPAID',
        customerName,
        customerPhone,
      },
    });

    return this.mapDbToActiveTrip(dbTrip);
  }

  async getTripById(tripId: string): Promise<ActiveTrip> {
    const dbTrip = await this.prisma.rideBooking.findUnique({
      where: { id: tripId },
      include: { driver: true },
    });

    if (!dbTrip) {
      throw new NotFoundException(`Không tìm thấy chuyến xe ${tripId}`);
    }

    return this.mapDbToActiveTrip(dbTrip);
  }

  async getCustomerActiveTrip(userId: string): Promise<ActiveTrip | null> {
    const ACTIVE_STATUSES = ['SEARCHING', 'ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'];
    const dbTrip = await this.prisma.rideBooking.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
      },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!dbTrip) return null;
    return this.mapDbToActiveTrip(dbTrip);
  }

  async cancelTrip(
    tripId: string,
    reason?: string,
    cancelledBy?: string,
    requestingUserId?: string,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    if (
      requestingUserId &&
      requestingUserId !== trip.userId &&
      requestingUserId !== trip.driverId
    ) {
      throw new ForbiddenException('Bạn không có quyền hủy chuyến đi này.');
    }

    if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
      throw new BadRequestException(`Chuyến ${tripId} đã kết thúc, không thể hủy.`);
    }

    const updated = await this.prisma.rideBooking.update({
      where: { id: tripId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Người dùng hủy chuyến',
      },
      include: { driver: true },
    });

    return this.mapDbToActiveTrip(updated);
  }

  async rateDriver(
    tripId: string,
    customerId: string,
    rating: number,
    comment?: string,
    tags?: string[],
    tip?: number,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    if (trip.userId !== customerId) {
      throw new ForbiddenException('Bạn chỉ có thể đánh giá chuyến đi của chính mình.');
    }

    if (trip.status !== 'COMPLETED') {
      throw new BadRequestException('Chuyến đi chưa hoàn thành, chưa thể đánh giá.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.rideBooking.update({
        where: { id: tripId },
        data: {
          driverRating: rating,
          driverReview: comment,
          tipAmount: tip && tip > 0 ? (trip.tipAmount || 0) + tip : trip.tipAmount,
          finalAmount:
            tip && tip > 0
              ? trip.fareAmount + (trip.tipAmount || 0) + tip - trip.discountAmount
              : trip.finalAmount,
        },
        include: { driver: true },
      });

      // Cập nhật rating trung bình cho tài xế
      if (trip.driverId) {
        const stats = await tx.rideBooking.aggregate({
          where: { driverId: trip.driverId, driverRating: { not: null } },
          _avg: { driverRating: true },
        });
        if (stats._avg.driverRating) {
          await tx.driver.update({
            where: { id: trip.driverId },
            data: { rating: Number(stats._avg.driverRating.toFixed(2)) },
          });
        }
      }

      return updatedTrip;
    });

    return this.mapDbToActiveTrip(updated);
  }

  // ─────────────────────────────────────────
  // DRIVER OPERATIONS (DATABASE THẬT)
  // ─────────────────────────────────────────

  async getPendingTrips(
    lat?: number,
    lng?: number,
  ): Promise<Array<ActiveTrip & { profitScore: number; distanceToPickup: number }>> {
    const pendingDbTrips = await this.prisma.rideBooking.findMany({
      where: { status: 'SEARCHING' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const pending = pendingDbTrips.map((dbTrip) => {
      const trip = this.mapDbToActiveTrip(dbTrip);
      const distanceToPickup =
        lat && lng ? this.calculateDistance(lat, lng, trip.pickupLat, trip.pickupLng) : 1.5;
      const profitScore = Math.min(98, Math.round(60 + trip.finalAmount / 1500));
      return { ...trip, profitScore, distanceToPickup };
    });

    return pending.sort((a, b) => b.profitScore - a.profitScore);
  }

  async acceptRide(tripId: string, driverId: string): Promise<ActiveTrip> {
    // Kiểm tra tài xế tồn tại TRƯỚC để tránh nhận trip xong mới phát hiện không có tài xế
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy thông tin tài xế trong hệ thống.');
    }

    if (!driver.isOnline) {
      throw new BadRequestException('Bạn đang ở chế độ NGOẠI TUYẾN. Vui lòng bật TRỰC TUYẾN để nhận cuốc.');
    }

    // Kiểm tra tài xế có đang bận với chuyến Ride/Delivery khác chưa hoàn tất không
    const ongoingRide = await this.prisma.rideBooking.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'] },
      },
    });

    if (ongoingRide) {
      throw new BadRequestException(
        `Bạn đang có chuyến ${ongoingRide.serviceType === 'DELIVERY' ? 'giao hàng' : 'chở khách'} #${ongoingRide.bookingCode} chưa hoàn tất. Vui lòng hoàn thành chuyến trước khi nhận cuốc mới.`,
      );
    }

    // Kiểm tra tài xế có đang bận với đơn Food nào chưa hoàn tất không
    const ongoingFood = await this.prisma.foodOrder.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['DRIVER_ACCEPTED', 'PICKED_UP'] },
      },
    });

    if (ongoingFood) {
      throw new BadRequestException(
        `Bạn đang có đơn giao đồ ăn #${ongoingFood.orderCode} chưa hoàn tất. Vui lòng giao xong trước khi nhận chuyến mới.`,
      );
    }

    // ─── ATOMIC ACCEPT ─────────────────────────────────────────────────────────
    // Dùng updateMany với điều kiện WHERE id=tripId AND status='SEARCHING'.
    // Nếu count=0: trip đã được tài xế khác nhận trước (race condition).
    // Nếu count=1: update thành công, chỉ 1 tài xế được chấp nhận.
    // ─────────────────────────────────────────────────────────────────────────
    const result = await this.prisma.rideBooking.updateMany({
      where: {
        id: tripId,
        status: 'SEARCHING', // Điều kiện atomic: chỉ update nếu còn SEARCHING
      },
      data: {
        status: 'ACCEPTED',
        driverId: driver.id,
      },
    });

    if (result.count === 0) {
      // Trip đã được tài xế khác nhận trước hoặc không còn tồn tại
      const existingTrip = await this.getTripById(tripId);
      throw new BadRequestException(
        `Chuyến ${tripId} không còn ở trạng thái chờ tài xế (hiện tại: ${existingTrip.status}). Tài xế khác đã nhận trước.`,
      );
    }

    // Lấy lại trip đã update kèm thông tin tài xế
    const updatedTrip = await this.prisma.rideBooking.findUnique({
      where: { id: tripId },
      include: { driver: true },
    });

    return this.mapDbToActiveTrip(updatedTrip!, driver);
  }

  async updateTripStatus(
    tripId: string,
    driverId: string,
    dto: UpdateTripStatusDto,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Bạn không phải là tài xế được chỉ định cho chuyến đi này.');
    }

    if (trip.status === 'COMPLETED' && dto.status === 'COMPLETED') {
      const updated = await this.prisma.rideBooking.update({
        where: { id: tripId },
        data: {
          driverRating: dto.driverRating !== undefined ? dto.driverRating : trip.driverRating,
          driverReview: dto.driverReview !== undefined ? dto.driverReview : trip.driverReview,
        },
        include: { driver: true },
      });
      return this.mapDbToActiveTrip(updated);
    }

    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      ACCEPTED: ['ARRIVED_PICKUP', 'CANCELLED'],
      ARRIVED_PICKUP: ['IN_TRIP', 'CANCELLED'],
      IN_TRIP: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = ALLOWED_TRANSITIONS[trip.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển đổi trạng thái chuyến từ ${trip.status} sang ${dto.status}.`,
      );
    }

    // XỬ LÝ HẠCH TOÁN ĐỐI SOÁT TÀI CHÍNH KHI HOÀN THÀNH CUỐC XE
    if (dto.status === 'COMPLETED') {
      const updated = await this.prisma.$transaction(async (tx) => {
        const driver = await tx.driver.findUnique({
          where: { id: driverId },
        });

        if (!driver) {
          throw new NotFoundException('Không tìm thấy tài xế');
        }

        const fareAmount = trip.fareAmount;
        const commissionFee = Math.round(fareAmount * 0.15); // 15% phí sàn
        const tipAmount = trip.tipAmount || 0;
        const driverNetEarning = fareAmount - commissionFee + tipAmount;

        let newCredit = Number(driver.creditBalance);
        let newCash = Number(driver.cashBalance);

        if (trip.paymentMethod === 'CASH') {
          // Khách trả tiền mặt: trừ phí sàn từ Ví Ký Quỹ
          newCredit = Math.max(0, newCredit - commissionFee);

          await tx.driver.update({
            where: { id: driver.id },
            data: {
              creditBalance: newCredit,
              dailyEarnings: { increment: driverNetEarning },
              totalTrips: { increment: 1 },
            },
          });

          // Ghi nhận lịch sử giao dịch sổ cái
          await tx.driverTransaction.create({
            data: {
              driverId: driver.id,
              tripId: trip.id,
              tripCode: trip.bookingCode,
              title: `Khấu trừ phí sàn cuốc ${trip.bookingCode}`,
              amount: -commissionFee,
              balanceAfter: newCredit,
              type: 'FEE',
              walletType: 'CREDIT',
              note: `Khách trả ${fareAmount.toLocaleString('vi-VN')}đ tiền mặt`,
              customerName: trip.customerName,
              pickup: trip.pickupAddress,
              dropoff: trip.dropoffAddress,
              distanceKm: trip.distanceKm,
              paymentMethod: 'CASH',
            },
          });
        } else {
          // Khách trả Online: cộng cước thực nhận vào Ví Thu Nhập (Khả dụng)
          newCash += driverNetEarning;

          await tx.driver.update({
            where: { id: driver.id },
            data: {
              cashBalance: newCash,
              dailyEarnings: { increment: driverNetEarning },
              totalTrips: { increment: 1 },
            },
          });

          await tx.driverTransaction.create({
            data: {
              driverId: driver.id,
              tripId: trip.id,
              tripCode: trip.bookingCode,
              title: `Cộng cước cuốc ${trip.bookingCode}`,
              amount: driverNetEarning,
              balanceAfter: newCash,
              type: 'EARN',
              walletType: 'CASH',
              note: `Khách thanh toán trực tuyến (${trip.paymentMethod})`,
              customerName: trip.customerName,
              pickup: trip.pickupAddress,
              dropoff: trip.dropoffAddress,
              distanceKm: trip.distanceKm,
              paymentMethod: 'ONLINE',
            },
          });
        }

        const compTrip = await tx.rideBooking.update({
          where: { id: tripId },
          data: {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            driverRating: dto.driverRating,
            driverReview: dto.driverReview,
          },
          include: { driver: true },
        });

        return compTrip;
      });

      return this.mapDbToActiveTrip(updated);
    }

    // Các trạng thái khác (ARRIVED_PICKUP, IN_TRIP, CANCELLED)
    const updated = await this.prisma.rideBooking.update({
      where: { id: tripId },
      data: {
        status: dto.status,
        cancelReason: dto.cancelReason,
        driverRating: dto.driverRating,
        driverReview: dto.driverReview,
      },
      include: { driver: true },
    });

    return this.mapDbToActiveTrip(updated);
  }

  async getDriverActiveTrip(driverId: string): Promise<ActiveTrip | null> {
    const ACTIVE_STATUSES = ['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'];
    const dbTrip = await this.prisma.rideBooking.findFirst({
      where: {
        driverId,
        status: { in: ACTIVE_STATUSES },
      },
      include: { driver: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!dbTrip) return null;
    return this.mapDbToActiveTrip(dbTrip);
  }

  async getDriverWallet(driverId: string) {
    let driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!driver) {
      // Tìm bằng id fallback hoặc demo
      driver = await this.prisma.driver.findFirst({
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 30,
          },
        },
      });
    }

    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài khoản tài xế.');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalTripsToday = await this.prisma.rideBooking.count({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
        updatedAt: { gte: startOfDay },
      },
    });

    return {
      driverId: driver.id,
      creditWallet: Number(driver.creditBalance),
      cashWallet: Number(driver.cashBalance),
      balance: Number(driver.cashBalance), // Compatibility
      dailyEarnings: Number(driver.dailyEarnings),
      totalTripsToday,
      totalTrips: driver.totalTrips,
      rating: driver.rating,
      transactions: driver.transactions.map((tx) => ({
        id: tx.id,
        tripCode: tx.tripCode || '',
        title: tx.title,
        amount: Number(tx.amount),
        balanceAfter: Number(tx.balanceAfter),
        type: tx.type,
        walletType: tx.walletType,
        note: tx.note || '',
        customerName: tx.customerName || '',
        pickup: tx.pickup || '',
        dropoff: tx.dropoff || '',
        distanceKm: tx.distanceKm || 0,
        paymentMethod: tx.paymentMethod || 'CASH',
        time: tx.createdAt.toISOString(),
      })),
      qrInfo: {
        bankName: 'MB BANK',
        bankCode: 'MB',
        accountNo: '0988123456',
        accountHolder: driver.fullName.toUpperCase(),
        transferContent: `SUNSTAR NAP ${driver.phone}`,
      },
    };
  }

  async topupDriverWallet(driverId: string, amount: number) {
    if (!amount || amount < 10000) {
      throw new BadRequestException('Số tiền nạp tối thiểu là 10,000 VND.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const driver = await tx.driver.findUnique({ where: { id: driverId } });
      if (!driver) throw new NotFoundException('Không tìm thấy tài xế.');

      const newCredit = Number(driver.creditBalance) + amount;

      await tx.driver.update({
        where: { id: driverId },
        data: { creditBalance: newCredit },
      });

      const txRecord = await tx.driverTransaction.create({
        data: {
          driverId,
          title: 'Nạp tiền ví ký quỹ qua VietQR NAPAS 24/7',
          amount,
          balanceAfter: newCredit,
          type: 'TOPUP',
          walletType: 'CREDIT',
          note: 'Chuyển khoản liên ngân hàng 24/7 thành công',
        },
      });

      return { newCredit, transaction: txRecord };
    });

    return { success: true, newCreditBalance: result.newCredit };
  }

  async withdrawDriverWallet(driverId: string, dto: DriverWithdrawDto) {
    const { amount, bankName, accountNo, accountHolder } = dto;
    if (!amount || amount < 50000) {
      throw new BadRequestException('Số tiền rút tối thiểu là 50,000 VND.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const driver = await tx.driver.findUnique({ where: { id: driverId } });
      if (!driver) throw new NotFoundException('Không tìm thấy tài xế.');

      const currentCash = Number(driver.cashBalance);
      if (currentCash < amount) {
        throw new BadRequestException(
          `Số dư Ví Thu Nhập không đủ (hiện có ${currentCash.toLocaleString('vi-VN')} VND).`,
        );
      }

      const newCash = currentCash - amount;

      await tx.driver.update({
        where: { id: driverId },
        data: { cashBalance: newCash },
      });

      const txRecord = await tx.driverTransaction.create({
        data: {
          driverId,
          title: `Rút tiền về ${bankName || 'Ngân hàng'} (${accountNo || '***'})`,
          amount: -amount,
          balanceAfter: newCash,
          type: 'WITHDRAW',
          walletType: 'CASH',
          note: `Chuyển khoản đến ${accountHolder || driver.fullName} (${accountNo || '***'})`,
        },
      });

      return { newCash, transaction: txRecord };
    });

    return { success: true, newCashBalance: result.newCash };
  }

  async updateDriverLocation(dto: DriverLocationDto) {
    if (!dto.driverId) {
      throw new BadRequestException('driverId là bắt buộc');
    }

    await this.prisma.driver.updateMany({
      where: { id: dto.driverId },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
        heading: dto.heading || 0,
        speed: dto.speed || 0,
        isOnline: true,
      },
    });

    return { success: true };
  }

  async toggleDriverOnline(driverId: string, isOnline: boolean) {
    await this.prisma.driver.updateMany({
      where: { id: driverId },
      data: { isOnline },
    });

    return { driverId, isOnline };
  }

  async getDriverHistory(driverId: string): Promise<ActiveTrip[]> {
    const dbTrips = await this.prisma.rideBooking.findMany({
      where: {
        driverId,
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return dbTrips.map((trip) => this.mapDbToActiveTrip(trip));
  }

  async getDriverSettings(driverId: string) {
    let settings = await this.prisma.driverSettings.findUnique({
      where: { driverId },
    });

    if (!settings) {
      settings = await this.prisma.driverSettings.create({
        data: {
          driverId,
          autoAccept: false,
          dispatchRadius: 5,
          enableRide: true,
          enableDelivery: true,
          enableFood: true,
          homeAddress: 'Số 68 Cầu Giấy, Hà Nội',
          homeLat: 21.0335,
          homeLng: 105.7942,
          highVolumeAlert: true,
          hapticFeedback: true,
          voiceGuidance: true,
          defaultMapApp: 'GOOGLE_MAPS',
          autoOpenMap: false,
          avoidTolls: false,
          keepAwakeMode: 'ONLINE_ONLY',
          themeMode: 'SYSTEM',
          sosPhone1: '113',
          sosPhone2: '0988123456',
        },
      });
    }

    return settings;
  }

  async updateDriverSettings(driverId: string, dto: UpdateDriverSettingsDto) {
    const settings = await this.prisma.driverSettings.upsert({
      where: { driverId },
      update: {
        ...dto,
      },
      create: {
        driverId,
        autoAccept: dto.autoAccept ?? false,
        dispatchRadius: dto.dispatchRadius ?? 5,
        enableRide: dto.enableRide ?? true,
        enableDelivery: dto.enableDelivery ?? true,
        enableFood: dto.enableFood ?? true,
        homeAddress: dto.homeAddress,
        homeLat: dto.homeLat,
        homeLng: dto.homeLng,
        highVolumeAlert: dto.highVolumeAlert ?? true,
        hapticFeedback: dto.hapticFeedback ?? true,
        voiceGuidance: dto.voiceGuidance ?? true,
        defaultMapApp: dto.defaultMapApp ?? 'GOOGLE_MAPS',
        autoOpenMap: dto.autoOpenMap ?? false,
        avoidTolls: dto.avoidTolls ?? false,
        keepAwakeMode: dto.keepAwakeMode ?? 'ONLINE_ONLY',
        themeMode: dto.themeMode ?? 'SYSTEM',
        sosPhone1: dto.sosPhone1,
        sosPhone2: dto.sosPhone2,
      },
    });

    return settings;
  }

  // ─────────────────────────────────────────
  // SEED TÀI KHOẢN MẪU VÀ DỮ LIỆU BAN ĐẦU
  // ─────────────────────────────────────────
  private async ensureDemoDriverAndSeedData() {
    const existingDriver = await this.prisma.driver.findFirst({
      where: { phone: '0988123456' },
    });

    let driver = existingDriver;
    if (!driver) {
      const hashedPassword = await bcrypt.hash('Driver@123456', 10);
      driver = await this.prisma.driver.create({
        data: {
          phone: '0988123456',
          password: hashedPassword,
          fullName: 'Nguyễn Văn Hùng',
          licensePlate: '29E1-888.99',
          vehicleType: 'VinFast Feliz S (EV)',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          creditBalance: 250000,
          cashBalance: 1485000,
          dailyEarnings: 450000,
          rating: 4.95,
          totalTrips: 128,
          isOnline: true,
          currentLat: 21.0285,
          currentLng: 105.7801,
        },
      });

      // Tạo cấu hình cài đặt mẫu
      await this.prisma.driverSettings.create({
        data: {
          driverId: driver.id,
          autoAccept: false,
          dispatchRadius: 5,
          enableRide: true,
          enableDelivery: true,
          enableFood: true,
          homeAddress: 'Số 68 Cầu Giấy, Hà Nội',
          homeLat: 21.0335,
          homeLng: 105.7942,
        },
      });

      // Tạo 3 giao dịch thật mẫu trong database
      await this.prisma.driverTransaction.createMany({
        data: [
          {
            driverId: driver.id,
            tripCode: 'VR-8899',
            title: 'Khấu trừ phí sàn cuốc #VR-8899',
            amount: -12000,
            balanceAfter: 250000,
            type: 'FEE',
            walletType: 'CREDIT',
            note: 'Khách trả 120.000đ tiền mặt',
            customerName: 'Nguyễn Văn Hùng',
            pickup: 'Bến xe Mỹ Đình, Từ Liêm',
            dropoff: '68 Cầu Giấy, Hà Nội',
            distanceKm: 5.2,
            paymentMethod: 'CASH',
          },
          {
            driverId: driver.id,
            tripCode: 'VR-8898',
            title: 'Cộng cước cuốc #VR-8898 (VNPay)',
            amount: 108000,
            balanceAfter: 1485000,
            type: 'EARN',
            walletType: 'CASH',
            note: 'Khách thanh toán trực tuyến qua thẻ',
            customerName: 'Trần Thu Thảo',
            pickup: 'Keangnam Landmark 72',
            dropoff: 'Vincom Trần Duy Hưng',
            distanceKm: 3.8,
            paymentMethod: 'ONLINE',
          },
          {
            driverId: driver.id,
            title: 'Nạp tiền ví ký quỹ qua VietQR NAPAS 24/7',
            amount: 200000,
            balanceAfter: 262000,
            type: 'TOPUP',
            walletType: 'CREDIT',
            note: 'Chuyển khoản liên ngân hàng MB Bank 24/7',
          },
        ],
      });
    }

    // Đảm bảo có ít nhất 1 cuốc xe hoàn thành và 1 cuốc đang SEARCHING để test
    const user = await this.prisma.user.findFirst();
    let userId = user?.id;
    if (!userId) {
      const defaultUser = await this.prisma.user.create({
        data: {
          phone: '0988000111',
          password: await bcrypt.hash('User@123456', 10),
          fullName: 'Khách hàng Sunstar',
        },
      });
      userId = defaultUser.id;
    }

    const completedTrip = await this.prisma.rideBooking.findFirst({
      where: { driverId: driver.id, status: 'COMPLETED' },
    });

    if (!completedTrip) {
      await this.prisma.rideBooking.create({
        data: {
          bookingCode: '#VR-8899',
          userId,
          driverId: driver.id,
          serviceType: 'RIDE',
          vehicleType: 'ev',
          status: 'COMPLETED',
          pickupAddress: 'Bến xe Mỹ Đình, Từ Liêm, Hà Nội',
          pickupLat: 21.0285,
          pickupLng: 105.7725,
          dropoffAddress: 'Số 68 Cầu Giấy, Hà Nội',
          dropoffLat: 21.0335,
          dropoffLng: 105.7942,
          distanceKm: 5.2,
          durationMin: 18,
          fareAmount: 85000,
          tipAmount: 10000,
          discountAmount: 15000,
          finalAmount: 80000,
          paymentMethod: 'CASH',
          paymentStatus: 'PAID',
          customerName: 'Nguyễn Văn Hùng',
          customerPhone: '0912345678',
          driverRating: 5,
          driverReview: 'Lái xe cẩn thận, xe rất sạch sẽ',
        },
      });
    }

    const searchingTrip = await this.prisma.rideBooking.findFirst({
      where: { status: 'SEARCHING' },
    });

    if (!searchingTrip) {
      await this.prisma.rideBooking.create({
        data: {
          bookingCode: '#VR-9921',
          userId,
          serviceType: 'RIDE',
          vehicleType: 'ev',
          status: 'SEARCHING',
          pickupAddress: 'Vincom Mega Mall Smart City',
          pickupLat: 20.9995,
          pickupLng: 105.7423,
          dropoffAddress: 'Hồ Gươm Plaza, Hà Đông',
          dropoffLat: 20.9789,
          dropoffLng: 105.7821,
          distanceKm: 4.8,
          durationMin: 15,
          fareAmount: 72000,
          tipAmount: 5000,
          discountAmount: 10000,
          finalAmount: 67000,
          paymentMethod: 'CASH',
          paymentStatus: 'UNPAID',
          customerName: 'Lê Hoàng Nam',
          customerPhone: '0977889900',
        },
      });
    }
  }
}
