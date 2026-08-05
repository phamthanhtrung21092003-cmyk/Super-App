import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('NotificationService - Step 9 Centralized Notification System Tests', () => {
  let service: NotificationService;
  let prisma: any;

  const mockNotif = {
    id: 'notif-1',
    recipientId: 'user-1',
    recipientType: 'USER',
    title: 'Đã tạo đơn đặt dịch vụ #VL202608031001',
    body: 'Đơn của bạn đang chờ thanh toán',
    data: { eventKey: 'BOOKING_CREATED_VL202608031001' },
    isRead: false,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    notification: {
      create: jest.fn().mockResolvedValue(mockNotif),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([mockNotif]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('1. Tạo Thông Báo: Lưu chuẩn vào DB cho User/Partner/Admin', async () => {
    mockPrismaService.notification.findFirst.mockResolvedValue(null);

    const res = await service.createNotification({
      recipientId: 'user-1',
      recipientType: 'USER',
      title: 'Đã tạo đơn đặt dịch vụ #VL202608031001',
      body: 'Đơn của bạn đang chờ thanh toán',
      eventKey: 'BOOKING_CREATED_VL202608031001',
    });

    expect(res.recipientId).toBe('user-1');
    expect(mockPrismaService.notification.create).toHaveBeenCalled();
  });

  it('2. Chống Thông Báo Trùng (Deduplication): Nếu eventKey đã gửi thì không tạo lại', async () => {
    mockPrismaService.notification.findFirst.mockResolvedValue(mockNotif);

    const res = await service.createNotification({
      recipientId: 'user-1',
      recipientType: 'USER',
      title: 'Đã tạo đơn đặt dịch vụ #VL202608031001',
      body: 'Đơn của bạn đang chờ thanh toán',
      eventKey: 'BOOKING_CREATED_VL202608031001',
    });

    expect(res.id).toBe('notif-1');
    expect(mockPrismaService.notification.create).not.toHaveBeenCalled();
  });

  it('3. Lấy Danh Sách & Đếm Số Lượng Chưa Đọc: Phân quyền theo JWT RecipientId', async () => {
    const list = await service.getUserNotifications('user-1');
    const unread = await service.getUnreadCount('user-1');

    expect(list.length).toBe(1);
    expect(unread.unreadCount).toBe(1);
    expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { recipientId: 'user-1' } }),
    );
  });

  it('4. Đánh Dấu Đã Đọc: Cho phép sửa thông báo của chính mình, chặn sửa người khác', async () => {
    mockPrismaService.notification.findUnique.mockResolvedValue(mockNotif);
    mockPrismaService.notification.update.mockResolvedValue({ ...mockNotif, isRead: true });

    // Đọc hợp lệ
    await service.markAsRead('user-1', 'notif-1');
    expect(mockPrismaService.notification.update).toHaveBeenCalled();

    // Truy cập trái phép người khác -> ForbiddenException
    await expect(service.markAsRead('user-99', 'notif-1')).rejects.toThrow(ForbiddenException);
  });

  it('5. Read All: Đánh dấu tất cả thông báo của user thành đã đọc', async () => {
    const res = await service.markAllAsRead('user-1');

    expect(res.message).toBeDefined();
    expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
      where: { recipientId: 'user-1', isRead: false },
      data: { isRead: true },
    });
  });
});
