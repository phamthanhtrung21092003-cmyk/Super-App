import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UnifiedJobSummary {
  hasActiveJob: boolean;
  jobType?: 'RIDE' | 'DELIVERY' | 'FOOD';
  jobId?: string;
  code?: string;
  status?: string;
  step?: number;
  pickupAddress?: string;
  pickupName?: string;
  pickupPhone?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  distanceKm?: number;
  durationMin?: number;
  earnings?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  itemCount?: number;
  items?: any[];
  raw?: any;
}

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. LẤY CÔNG VIỆC ĐANG HOẠT ĐỘNG (ACTIVE JOB)
   * Kiểm tra cả 3 dịch vụ: Ride, Delivery, Food.
   * PostgreSQL là Source of Truth duy nhất.
   */
  async getActiveJob(driverId: string): Promise<UnifiedJobSummary> {
    // 1.1 Kiểm tra chuyến Ride hoặc General Delivery
    const activeRide = await this.prisma.rideBooking.findFirst({
      where: {
        driverId,
        status: { in: ['ACCEPTED', 'ARRIVED_PICKUP', 'IN_TRIP'] },
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (activeRide) {
      const isDelivery = activeRide.serviceType?.toUpperCase() === 'DELIVERY';
      let step = 1;
      if (activeRide.status === 'ACCEPTED') step = 1;
      else if (activeRide.status === 'ARRIVED_PICKUP') step = 2;
      else if (activeRide.status === 'IN_TRIP') step = 3;

      return {
        hasActiveJob: true,
        jobType: isDelivery ? 'DELIVERY' : 'RIDE',
        jobId: activeRide.id,
        code: activeRide.bookingCode,
        status: activeRide.status,
        step,
        pickupAddress: activeRide.pickupAddress,
        pickupLat: activeRide.pickupLat,
        pickupLng: activeRide.pickupLng,
        dropoffAddress: activeRide.dropoffAddress,
        dropoffLat: activeRide.dropoffLat,
        dropoffLng: activeRide.dropoffLng,
        distanceKm: activeRide.distanceKm,
        durationMin: activeRide.durationMin,
        earnings: activeRide.fareAmount,
        totalAmount: activeRide.finalAmount,
        paymentMethod: activeRide.paymentMethod,
        paymentStatus: activeRide.paymentStatus,
        customerName: activeRide.customerName || activeRide.user?.fullName || 'Khách hàng',
        customerPhone: activeRide.customerPhone || activeRide.user?.phone || '',
        raw: activeRide,
      };
    }

    // 1.2 Kiểm tra đơn Food Delivery
    const activeFood = await this.prisma.foodOrder.findFirst({
      where: {
        driverId,
        status: { in: ['DRIVER_ACCEPTED', 'PICKED_UP'] },
      },
      include: {
        restaurant: true,
        user: { select: { id: true, fullName: true, phone: true } },
        items: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (activeFood) {
      const step = activeFood.status === 'DRIVER_ACCEPTED' ? 1 : 2;
      const driverEarnings = (activeFood.shippingFee || 0) + (activeFood.discountAmount || 0);

      return {
        hasActiveJob: true,
        jobType: 'FOOD',
        jobId: activeFood.id,
        code: activeFood.orderCode,
        status: activeFood.status,
        step,
        pickupAddress: activeFood.restaurant?.address || '',
        pickupName: activeFood.restaurant?.name || 'Quán ăn',
        pickupPhone: activeFood.restaurant?.phoneNumber || '',
        pickupLat: activeFood.restaurant?.latitude,
        pickupLng: activeFood.restaurant?.longitude,
        dropoffAddress: activeFood.deliveryAddress,
        dropoffLat: activeFood.deliveryLat,
        dropoffLng: activeFood.deliveryLng,
        distanceKm: activeFood.distanceKm,
        durationMin: 20,
        earnings: driverEarnings,
        totalAmount: activeFood.totalAmount,
        paymentMethod: activeFood.paymentMethod,
        paymentStatus: activeFood.paymentStatus,
        customerName: activeFood.user?.fullName || 'Khách hàng',
        customerPhone: activeFood.user?.phone || '',
        restaurantName: activeFood.restaurant?.name,
        restaurantAddress: activeFood.restaurant?.address || '',
        restaurantPhone: activeFood.restaurant?.phoneNumber || '',
        itemCount: activeFood.items?.length || 0,
        items: activeFood.items,
        raw: activeFood,
      };
    }

    return {
      hasActiveJob: false,
    };
  }

  /**
   * 2. LẤY DANH SÁCH CÔNG VIỆC KHẢ DỤNG (AVAILABLE JOBS)
   * Tổng hợp các cuốc Ride, Delivery và Food đang chờ tài xế
   * Tôn trọng cài đặt bật/tắt dịch vụ (enableRide, enableDelivery, enableFood).
   */
  async getAvailableJobs(driverId: string, lat?: number, lng?: number) {
    // Lấy cấu hình của tài xế
    let settings = await this.prisma.driverSettings.findUnique({
      where: { driverId },
    });

    if (!settings) {
      settings = await this.prisma.driverSettings.create({
        data: {
          driverId,
          enableRide: true,
          enableDelivery: true,
          enableFood: true,
          dispatchRadius: 10,
        },
      });
    }

    const results: any[] = [];

    // 2.1 Quét Ride & General Delivery (status = SEARCHING)
    if (settings.enableRide || settings.enableDelivery) {
      const allowedServiceTypes: string[] = [];
      if (settings.enableRide) allowedServiceTypes.push('RIDE');
      if (settings.enableDelivery) allowedServiceTypes.push('DELIVERY');

      const searchingRides = await this.prisma.rideBooking.findMany({
        where: {
          status: 'SEARCHING',
          serviceType: { in: allowedServiceTypes },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      });

      for (const r of searchingRides) {
        const isDelivery = r.serviceType?.toUpperCase() === 'DELIVERY';
        results.push({
          id: r.id,
          jobType: isDelivery ? 'DELIVERY' : 'RIDE',
          code: r.bookingCode,
          title: isDelivery ? 'Giao hàng Siêu Tốc V-Express' : 'Chở khách V-Ride',
          pickupAddress: r.pickupAddress,
          pickupLat: r.pickupLat,
          pickupLng: r.pickupLng,
          dropoffAddress: r.dropoffAddress,
          dropoffLat: r.dropoffLat,
          dropoffLng: r.dropoffLng,
          distanceKm: r.distanceKm,
          durationMin: r.durationMin,
          earnings: r.fareAmount,
          finalAmount: r.finalAmount,
          paymentMethod: r.paymentMethod,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          createdAt: r.createdAt,
        });
      }
    }

    // 2.2 Quét Food Orders (status = FINDING_DRIVER, driverId = null)
    if (settings.enableFood) {
      const findingFoodOrders = await this.prisma.foodOrder.findMany({
        where: {
          status: 'FINDING_DRIVER',
          driverId: null,
        },
        include: {
          restaurant: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      });

      for (const f of findingFoodOrders) {
        const driverEarnings = (f.shippingFee || 0) + (f.discountAmount || 0);
        results.push({
          id: f.id,
          jobType: 'FOOD',
          code: f.orderCode,
          title: 'Giao đồ ăn V-Food',
          restaurantName: f.restaurant?.name || 'Nhà hàng',
          pickupAddress: `${f.restaurant?.name || 'Nhà hàng'} - ${f.restaurant?.address || ''}`,
          pickupLat: f.restaurant?.latitude,
          pickupLng: f.restaurant?.longitude,
          dropoffAddress: f.deliveryAddress,
          dropoffLat: f.deliveryLat,
          dropoffLng: f.deliveryLng,
          distanceKm: f.distanceKm,
          durationMin: 20,
          earnings: driverEarnings,
          totalAmount: f.totalAmount,
          itemCount: f.items?.length || 0,
          paymentMethod: f.paymentMethod,
          customerName: f.deliveryAddress, // Tên/địa chỉ giao
          createdAt: f.createdAt,
        });
      }
    }

    // Sắp xếp theo thời gian tạo mới nhất
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 3. BẬT/TẮT TRỰC TUYẾN DUY NHẤT 1 LẦN
   * Đồng bộ trạng thái isOnline cho toàn bộ hệ thống (Ride, Delivery, Food).
   */
  async toggleOnline(driverId: string, isOnline: boolean) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài xế.');
    }

    const updated = await this.prisma.driver.update({
      where: { id: driverId },
      data: { isOnline },
      select: {
        id: true,
        fullName: true,
        phone: true,
        isOnline: true,
        currentLat: true,
        currentLng: true,
        walletBalance: true,
        dailyEarnings: true,
      },
    });

    return {
      success: true,
      driverId: updated.id,
      isOnline: updated.isOnline,
      message: updated.isOnline
        ? 'Bạn đang trực tuyến. Sẵn sàng nhận cuốc chở người, giao hàng và đồ ăn!'
        : 'Bạn đã chuyển sang chế độ ngoại tuyến.',
      driver: updated,
    };
  }

  /**
   * 4. CẬP NHẬT TỌA ĐỘ GPS DUY NHẤT 1 LẦN
   */
  async updateLocation(
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speed?: number,
  ) {
    const updated = await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLat: lat,
        currentLng: lng,
        heading: heading || 0,
        speed: speed || 0,
        isOnline: true,
      },
      select: {
        id: true,
        currentLat: true,
        currentLng: true,
        heading: true,
        isOnline: true,
      },
    });

    return {
      success: true,
      location: {
        lat: updated.currentLat,
        lng: updated.currentLng,
        heading: updated.heading,
      },
    };
  }

  /**
   * 5. LẤY HỒ SƠ VÀ CÀI ĐẶT DỊCH VỤ CỦA TÀI XẾ
   */
  async getDriverSettings(driverId: string) {
    let settings = await this.prisma.driverSettings.findUnique({
      where: { driverId },
    });

    if (!settings) {
      settings = await this.prisma.driverSettings.create({
        data: {
          driverId,
          enableRide: true,
          enableDelivery: true,
          enableFood: true,
          dispatchRadius: 5,
        },
      });
    }

    return settings;
  }

  /**
   * 6. CẬP NHẬT CÀI ĐẶT DỊCH VỤ CỦA TÀI XẾ
   */
  async updateDriverSettings(driverId: string, data: Partial<{
    enableRide: boolean;
    enableDelivery: boolean;
    enableFood: boolean;
    dispatchRadius: number;
    autoAccept: boolean;
  }>) {
    const settings = await this.prisma.driverSettings.upsert({
      where: { driverId },
      create: {
        driverId,
        enableRide: data.enableRide ?? true,
        enableDelivery: data.enableDelivery ?? true,
        enableFood: data.enableFood ?? true,
        dispatchRadius: data.dispatchRadius ?? 5,
        autoAccept: data.autoAccept ?? false,
      },
      update: data,
    });

    return {
      success: true,
      settings,
    };
  }
}
