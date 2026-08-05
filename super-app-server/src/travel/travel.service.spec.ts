import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from './travel.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, ServiceType } from '@prisma/client';

describe('TravelService & Booking Core Tests', () => {
  let service: TravelService;
  let prisma: any;

  const mockUser1 = 'user-uuid-1111';
  const mockUser2 = 'user-uuid-2222';

  const mockPartner = {
    id: 'partner-uuid-1',
    businessName: 'VN Travel Partner',
    phone: '0988888888',
    bankName: 'MB BANK',
    bankCode: 'MB',
    bankAccountNo: '0912345678',
    bankAccountHolder: 'SUPER APP TRAVEL V-LIFE',
    commissionRate: 0.1,
    isActive: true,
  };

  const mockService = {
    id: 'service-uuid-1',
    partnerId: mockPartner.id,
    type: ServiceType.HOMESTAY_BOOKING,
    title: 'Phú Quốc Luxury Homestay',
    basePrice: 2000000,
    isAvailable: true,
    partner: mockPartner,
  };

  const mockPrismaService = {
    service: {
      findUnique: jest.fn(),
    },
    systemConfig: {
      findUnique: jest.fn().mockResolvedValue({ value: '10' }),
    },
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockNotificationService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<TravelService>(TravelService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('1. Nên tạo Booking thành công & Server tự tính tổng tiền và hoa hồng 10%', async () => {
    mockPrismaService.service.findUnique.mockResolvedValue(mockService);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const mockCreatedBooking = {
      id: 'booking-1',
      bookingCode: 'VL202608031000',
      userId: mockUser1,
      partnerId: mockPartner.id,
      serviceId: mockService.id,
      status: BookingStatus.PENDING_PAYMENT,
      grossAmount: 4000000, // 2000000 * 2 days = 4000000
      commissionRate: 0.1,
      commissionAmount: 400000, // 10% of 4000000 = 400000
      partnerAmount: 3600000, // 4000000 - 400000 = 3600000
      startDate: tomorrow,
      endDate: dayAfterTomorrow,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: now,
      service: mockService,
      partner: mockPartner,
    };

    mockPrismaService.booking.create.mockResolvedValue(mockCreatedBooking);

    const result = await service.createBooking(mockUser1, {
      serviceId: mockService.id,
      startDate: tomorrow.toISOString(),
      endDate: dayAfterTomorrow.toISOString(),
    });

    expect(result.booking.grossAmount).toBe(4000000);
    expect(result.booking.status).toBe(BookingStatus.PENDING_PAYMENT);
    expect(mockPrismaService.booking.create).toHaveBeenCalled();
  });

  it('2. Nên ném lỗi NotFoundException nếu Dịch vụ không tồn tại', async () => {
    mockPrismaService.service.findUnique.mockResolvedValue(null);

    await expect(
      service.createBooking(mockUser1, {
        serviceId: 'non-existent-id',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('3. Nên chặn User xem Booking của User khác (ForbiddenException)', async () => {
    const mockBookingOwnerUser1 = {
      id: 'booking-1',
      bookingCode: 'VL202608031000',
      userId: mockUser1, // Thuộc về User 1
      status: BookingStatus.PENDING_PAYMENT,
      grossAmount: 2000000,
      service: mockService,
      partner: mockPartner,
      payments: [],
    };

    mockPrismaService.booking.findFirst.mockResolvedValue(mockBookingOwnerUser1);

    // User 2 cố tình xem đơn của User 1
    await expect(
      service.getBookingById(mockUser2, 'booking-1'),
    ).rejects.toThrow(ForbiddenException);
  });
});
