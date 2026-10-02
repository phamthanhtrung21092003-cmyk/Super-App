import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto, UpdateTripStatusDto, DriverLocationDto } from './dto/create-ride.dto';

export interface ActiveTrip {
  id: string;
  bookingCode: string;
  userId: string;
  driverId?: string;
  // Driver info (populated after ACCEPTED)
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  licensePlate?: string;
  avatarUrl?: string;
  driverRating?: number;
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
export class RideService {
  // In-memory cache for high performance & resilience when DB is unreachable
  private trips: Map<string, ActiveTrip> = new Map();
  private driverLocations: Map<
    string,
    { lat: number; lng: number; heading: number; speed: number; isOnline: boolean; updatedAt: string }
  > = new Map();
  private driverWallets: Map<string, { balance: number; dailyEarnings: number; transactions: any[] }> =
    new Map();

  constructor(private readonly prisma: PrismaService) {
    // Seed default driver wallet
    this.driverWallets.set('driver-demo-1', {
      balance: 1250000,
      dailyEarnings: 380000,
      transactions: [
        { id: 'TX-101', title: 'Chở khách #VR-8820', amount: 52000, type: 'earn', time: '08:30' },
        { id: 'TX-102', title: 'Giao hàng #DL-901', amount: 35000, type: 'earn', time: '09:45' },
        { id: 'TX-103', title: 'Nạp ví VietQR 24/7', amount: 500000, type: 'topup', time: 'Hôm qua' },
      ],
    });

    // Default driver location (Cầu Giấy, Hà Nội)
    this.driverLocations.set('driver-demo-1', {
      lat: 21.0285,
      lng: 105.7801,
      heading: 0,
      speed: 0,
      isOnline: false,
      updatedAt: new Date().toISOString(),
    });
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

    // SERVER-AUTHORITATIVE: Tính khoảng cách và giá cước độc quyền từ backend (không tin dữ liệu client gửi)
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
    const id = `TRIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const trip: ActiveTrip = {
      id,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.trips.set(id, trip);

    // Persist to DB (non-blocking - don't fail if DB unreachable)
    this.prisma.rideBooking
      .create({
        data: {
          id: trip.id,
          bookingCode: trip.bookingCode,
          userId: trip.userId,
          serviceType: trip.serviceType,
          vehicleType: trip.vehicleType,
          status: trip.status,
          pickupAddress: trip.pickupAddress,
          pickupLat: trip.pickupLat,
          pickupLng: trip.pickupLng,
          dropoffAddress: trip.dropoffAddress,
          dropoffLat: trip.dropoffLat,
          dropoffLng: trip.dropoffLng,
          distanceKm: trip.distanceKm,
          durationMin: trip.durationMin,
          fareAmount: trip.fareAmount,
          tipAmount: trip.tipAmount,
          discountAmount: trip.discountAmount,
          finalAmount: trip.finalAmount,
          paymentMethod: trip.paymentMethod,
          paymentStatus: trip.paymentStatus,
          customerName: trip.customerName,
          customerPhone: trip.customerPhone,
        },
      })
      .catch(() => {});

    return trip;
  }

  async getTripById(tripId: string): Promise<ActiveTrip> {
    const trip = this.trips.get(tripId);
    if (!trip) {
      // Fallback: try DB
      try {
        const dbTrip = await this.prisma.rideBooking.findUnique({ where: { id: tripId } });
        if (dbTrip) {
          const activeTrip: ActiveTrip = {
            id: dbTrip.id,
            bookingCode: dbTrip.bookingCode,
            userId: dbTrip.userId,
            driverId: dbTrip.driverId || undefined,
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
            createdAt: dbTrip.createdAt.toISOString(),
            updatedAt: dbTrip.updatedAt.toISOString(),
          };
          this.trips.set(tripId, activeTrip);
          return activeTrip;
        }
      } catch (e) {}
      throw new NotFoundException(`Không tìm thấy chuyến xe ${tripId}`);
    }
    return trip;
  }

  async getCustomerActiveTrip(userId: string): Promise<ActiveTrip | null> {
    const ACTIVE_STATUSES = ['SEARCHING', 'ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'];
    for (const trip of this.trips.values()) {
      if (trip.userId === userId && ACTIVE_STATUSES.includes(trip.status)) {
        return trip;
      }
    }
    return null;
  }

  async cancelTrip(
    tripId: string,
    reason?: string,
    cancelledBy?: string,
    requestingUserId?: string,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    // Kiểm tra quyền hủy chuyến
    if (
      requestingUserId &&
      requestingUserId !== trip.userId &&
      requestingUserId !== trip.driverId
    ) {
      throw new ForbiddenException('Bạn không có quyền hủy chuyến đi này.');
    }

    // Only allow cancel if not already completed/cancelled
    if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
      throw new BadRequestException(`Chuyến ${tripId} đã kết thúc, không thể hủy.`);
    }

    trip.status = 'CANCELLED';
    trip.cancelReason = reason || 'Người dùng hủy chuyến';
    trip.cancelledBy = cancelledBy || 'customer';
    trip.updatedAt = new Date().toISOString();
    this.trips.set(tripId, trip);

    this.prisma.rideBooking
      .update({ where: { id: tripId }, data: { status: 'CANCELLED', cancelReason: reason } })
      .catch(() => {});

    return trip;
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

    trip.updatedAt = new Date().toISOString();
    if (tip && tip > 0) {
      trip.tipAmount = (trip.tipAmount || 0) + tip;
      trip.finalAmount = trip.fareAmount + trip.tipAmount - trip.discountAmount;
    }
    this.trips.set(tripId, trip);

    this.prisma.rideBooking
      .update({
        where: { id: tripId },
        data: { driverRating: rating, driverReview: comment },
      })
      .catch(() => {});

    return trip;
  }

  // ─────────────────────────────────────────
  // DRIVER OPERATIONS
  // ─────────────────────────────────────────

  async getPendingTrips(
    lat?: number,
    lng?: number,
  ): Promise<Array<ActiveTrip & { profitScore: number; distanceToPickup: number }>> {
    const pending: Array<ActiveTrip & { profitScore: number; distanceToPickup: number }> = [];

    for (const trip of this.trips.values()) {
      if (trip.status === 'SEARCHING') {
        const distanceToPickup =
          lat && lng ? this.calculateDistance(lat, lng, trip.pickupLat, trip.pickupLng) : 1.5;
        const profitScore = Math.min(98, Math.round(60 + trip.finalAmount / 1500));
        pending.push({ ...trip, profitScore, distanceToPickup });
      }
    }

    // Sort by profitScore desc
    return pending.sort((a, b) => b.profitScore - a.profitScore);
  }

  async acceptRide(
    tripId: string,
    driverId: string,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    if (trip.status !== 'SEARCHING') {
      throw new BadRequestException(
        `Chuyến ${tripId} không còn ở trạng thái chờ tài xế (hiện tại: ${trip.status}).`,
      );
    }

    // SERVER-AUTHORITATIVE: Lấy thông tin thật từ DB của Driver, chống Client giả mạo thông số
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy thông tin tài xế trong hệ thống.');
    }

    trip.status = 'ACCEPTED';
    trip.driverId = driver.id;
    trip.driverName = driver.fullName;
    trip.driverPhone = driver.phone;
    trip.vehicleName = driver.vehicleType;
    trip.licensePlate = driver.licensePlate;
    trip.avatarUrl = driver.avatarUrl || 'https://i.pravatar.cc/150?img=60';
    trip.driverRating = driver.rating || 5.0;
    trip.updatedAt = new Date().toISOString();
    this.trips.set(tripId, trip);

    this.prisma.rideBooking
      .update({ where: { id: tripId }, data: { status: 'ACCEPTED', driverId: driver.id } })
      .catch(() => {});

    return trip;
  }

  async updateTripStatus(
    tripId: string,
    driverId: string,
    dto: UpdateTripStatusDto,
  ): Promise<ActiveTrip> {
    const trip = await this.getTripById(tripId);

    // BẢO MẬT: Chỉ đúng tài xế được nhận chuyến mới được phép cập nhật trạng thái
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Bạn không phải là tài xế được chỉ định cho chuyến đi này.');
    }

    // STATE MACHINE VALIDATION: Chống nhảy cóc trạng thái hoặc tạo cuốc ảo
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

    trip.status = dto.status;
    trip.updatedAt = new Date().toISOString();

    // Financial settlement on COMPLETED
    if (dto.status === 'COMPLETED' && trip.driverId) {
      const wallet = this.driverWallets.get(trip.driverId) || {
        balance: 1000000,
        dailyEarnings: 0,
        transactions: [],
      };
      const commissionFee = Math.round(trip.fareAmount * 0.15); // 15% platform fee
      const driverNetEarning = trip.fareAmount - commissionFee + (trip.tipAmount || 0);

      if (trip.paymentMethod === 'CASH') {
        // Tài xế thu tiền mặt → trừ phí sàn từ ví ký quỹ
        wallet.balance -= commissionFee;
        wallet.dailyEarnings += driverNetEarning;
        wallet.transactions.unshift({
          id: `TX-${Date.now()}`,
          title: `Trừ phí sàn cuốc ${trip.bookingCode} (Thu tiền mặt)`,
          amount: -commissionFee,
          type: 'commission_fee',
          time: 'Vừa xong',
          tripId,
        });
      } else {
        // Khách thanh toán online → cộng 85% cước + 100% tip vào ví
        wallet.balance += driverNetEarning;
        wallet.dailyEarnings += driverNetEarning;
        wallet.transactions.unshift({
          id: `TX-${Date.now()}`,
          title: `Cộng cước cuốc online ${trip.bookingCode}`,
          amount: driverNetEarning,
          type: 'earn',
          time: 'Vừa xong',
          tripId,
        });
      }
      this.driverWallets.set(trip.driverId, wallet);

      // Mark payment as settled
      trip.paymentStatus = 'PAID';
    }

    this.trips.set(tripId, trip);

    this.prisma.rideBooking
      .update({
        where: { id: tripId },
        data: {
          status: dto.status,
          driverRating: dto.driverRating,
          driverReview: dto.driverReview,
          cancelReason: dto.cancelReason,
        },
      })
      .catch(() => {});

    return trip;
  }

  async getDriverActiveTrip(driverId: string = 'driver-demo-1'): Promise<ActiveTrip | null> {
    const ACTIVE_STATUSES = ['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'];
    for (const trip of this.trips.values()) {
      if (trip.driverId === driverId && ACTIVE_STATUSES.includes(trip.status)) {
        return trip;
      }
    }
    return null;
  }

  async getDriverWallet(driverId: string = 'driver-demo-1') {
    let wallet = this.driverWallets.get(driverId);
    if (!wallet) {
      wallet = { balance: 1250000, dailyEarnings: 380000, transactions: [] };
      this.driverWallets.set(driverId, wallet);
    }
    return {
      balance: wallet.balance,
      dailyEarnings: wallet.dailyEarnings,
      cashOnHand: 280000,
      totalTripsToday: 6,
      rating: 4.95,
      transactions: wallet.transactions,
      qrInfo: {
        bankName: 'MB BANK',
        accountNo: '0988123456',
        accountHolder: 'NGUYEN VAN HUNG - TAI XE V-LIFE',
      },
    };
  }

  async topupDriverWallet(driverId: string = 'driver-demo-1', amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0.');
    }
    if (amount > 50000000) {
      throw new BadRequestException('Số tiền nạp tối đa là 50,000,000 VND một lần.');
    }

    const wallet = this.driverWallets.get(driverId) || {
      balance: 0,
      dailyEarnings: 0,
      transactions: [],
    };
    wallet.balance += amount;
    wallet.transactions.unshift({
      id: `TX-${Date.now()}`,
      title: 'Nạp ví ký quỹ VietQR 24/7',
      amount,
      type: 'topup',
      time: 'Vừa xong',
    });
    this.driverWallets.set(driverId, wallet);
    return { success: true, newBalance: wallet.balance };
  }

  async updateDriverLocation(dto: DriverLocationDto & { speed?: number }) {
    this.driverLocations.set(dto.driverId, {
      lat: dto.lat,
      lng: dto.lng,
      heading: dto.heading || 0,
      speed: dto.speed || 0,
      isOnline: true,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  async toggleDriverOnline(driverId: string = 'driver-demo-1', isOnline: boolean) {
    const current = this.driverLocations.get(driverId) || {
      lat: 21.0285,
      lng: 105.7801,
      heading: 0,
      speed: 0,
      isOnline: false,
      updatedAt: new Date().toISOString(),
    };
    current.isOnline = isOnline;
    current.updatedAt = new Date().toISOString();
    this.driverLocations.set(driverId, current);

    try {
      await this.prisma.driver.updateMany({
        where: { id: driverId },
        data: { isOnline },
      });
    } catch (e) {}

    return { driverId, isOnline };
  }

  async getDriverHistory(driverId: string = 'driver-demo-1') {
    const history: ActiveTrip[] = [];
    for (const trip of this.trips.values()) {
      if (trip.driverId === driverId && trip.status === 'COMPLETED') {
        history.push(trip);
      }
    }
    return history;
  }
}
