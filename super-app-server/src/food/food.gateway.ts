import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/food',
  transports: ['websocket', 'polling'],
})
export class FoodGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 1. XÁC THỰC SOCKET BẰNG JWT KHI CONNECT
   * Server lấy JWT từ client handshake (auth.token hoặc header hoặc query), verify token.
   * Nếu không hợp lệ -> ngắt kết nối client ngay lập tức.
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization
          ? String(client.handshake.headers.authorization).replace(/^Bearer\s+/i, '')
          : null) ||
        (client.handshake.query?.token as string);

      if (!token) {
        console.warn(`[FoodGateway] Từ chối kết nối không có token: ${client.id}`);
        client.emit('food.error', { message: 'Yêu cầu token xác thực JWT' });
        client.disconnect(true);
        return;
      }

      const secret =
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'super-app-secret-jwt-key-2026';

      const payload: any = this.jwtService.verify(token, { secret });
      client.data.user = {
        id: payload.sub,
        phone: payload.phone,
        role: payload.role,
      };

      console.log(
        `[FoodGateway] Authenticated socket ${client.id} as ${payload.role}:${payload.sub}`,
      );
    } catch (err: any) {
      console.warn(`[FoodGateway] Token không hợp lệ cho ${client.id}:`, err.message);
      client.emit('food.error', { message: 'Token xác thực không hợp lệ hoặc đã hết hạn' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[FoodGateway] Client disconnected: ${client.id}`);
  }

  /**
   * Helper kiểm tra user đã authenticate trên socket
   */
  private getAuthUser(client: Socket) {
    const user = client.data?.user;
    if (!user || !user.id) {
      client.emit('food.error', { message: 'Chưa xác thực (Unauthorized)' });
      return null;
    }
    return user;
  }

  // ─────────────────────────────────────────
  // ROOM JOIN / LEAVE (KIỂM TRA QUYỀN CHẶT CHẼ)
  // ─────────────────────────────────────────

  /**
   * Client tham gia theo dõi đơn hàng: food.order.join
   * Body: { orderId: string }
   */
  @SubscribeMessage('food.order.join')
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const user = this.getAuthUser(client);
    if (!user) return;

    if (!data?.orderId) {
      return { success: false, message: 'Thiếu orderId' };
    }

    const order = await this.prisma.foodOrder.findFirst({
      where: {
        OR: [{ id: data.orderId }, { orderCode: data.orderId }],
      },
      include: {
        restaurant: { select: { ownerId: true } },
      },
    });

    if (!order) {
      client.emit('food.error', { message: `Không tìm thấy đơn hàng "${data.orderId}"` });
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }

    // Phân quyền:
    // 1. Khách đặt đơn
    const isCustomer = order.userId === user.id;
    // 2. Chủ quán ăn sở hữu đơn
    const isRestaurantOwner = order.restaurant?.ownerId === user.id;
    // 3. Tài xế được assign hoặc đang tìm tài xế
    const isAssignedDriver = order.driverId === user.id;
    const isAvailableDriver = user.role === 'DRIVER' && order.status === 'FINDING_DRIVER';
    // 4. Admin
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isRestaurantOwner && !isAssignedDriver && !isAvailableDriver && !isAdmin) {
      client.emit('food.error', { message: 'Bạn không có quyền theo dõi đơn hàng này' });
      return { success: false, message: 'Forbidden' };
    }

    const roomName = `food:order:${order.id}`;
    client.join(roomName);
    console.log(`[FoodGateway] Socket ${client.id} (${user.role}:${user.id}) joined room ${roomName}`);
    return { success: true, room: roomName, orderId: order.id, status: order.status };
  }

  /**
   * Client rời theo dõi đơn hàng: food.order.leave
   */
  @SubscribeMessage('food.order.leave')
  handleLeaveOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (data?.orderId) {
      client.leave(`food:order:${data.orderId}`);
    }
    return { success: true };
  }

  /**
   * Merchant tham gia phòng nhận đơn của quán: food.restaurant.join
   * Body: { restaurantId: string }
   */
  @SubscribeMessage('food.restaurant.join')
  async handleJoinRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    const user = this.getAuthUser(client);
    if (!user) return;

    if (!data?.restaurantId) {
      return { success: false, message: 'Thiếu restaurantId' };
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      select: { id: true, ownerId: true },
    });

    if (!restaurant) {
      client.emit('food.error', { message: `Không tìm thấy quán ăn "${data.restaurantId}"` });
      return { success: false, message: 'Không tìm thấy nhà hàng' };
    }

    // Chỉ chủ quán hoặc Admin mới được join room nhận đơn của quán
    if (restaurant.ownerId !== user.id && user.role !== 'ADMIN') {
      client.emit('food.error', { message: 'Bạn không phải chủ sở hữu nhà hàng này' });
      return { success: false, message: 'Forbidden' };
    }

    const roomName = `food:restaurant:${restaurant.id}`;
    client.join(roomName);
    console.log(`[FoodGateway] Merchant socket ${client.id} joined restaurant room ${roomName}`);
    return { success: true, room: roomName, restaurantId: restaurant.id };
  }

  /**
   * Merchant rời phòng nhận đơn: food.restaurant.leave
   */
  @SubscribeMessage('food.restaurant.leave')
  handleLeaveRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (data?.restaurantId) {
      client.leave(`food:restaurant:${data.restaurantId}`);
    }
    return { success: true };
  }

  // ─────────────────────────────────────────
  // DRIVER REALTIME SOCKET EVENTS
  // ─────────────────────────────────────────

  /**
   * Driver tham gia drivers_pool để nhận đơn đồ ăn: food.driver.join
   * BẮT BUỘC: Role DRIVER từ JWT token
   */
  @SubscribeMessage('food.driver.join')
  async handleDriverJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { lat?: number; lng?: number },
  ) {
    const user = this.getAuthUser(client);
    if (!user) return { success: false, message: 'Unauthorized' };

    if (user.role !== 'DRIVER' && user.role !== 'ADMIN') {
      client.emit('food.error', { message: 'Chỉ tài xế mới có thể tham gia danh sách điều phối đơn' });
      return { success: false, message: 'Forbidden' };
    }

    const driverId = user.id;
    client.join('food:drivers_pool');
    client.join(`food:driver:${driverId}`);

    // Cập nhật trạng thái online và GPS nếu có
    await this.prisma.driver.updateMany({
      where: { id: driverId },
      data: {
        isOnline: true,
        ...(data?.lat ? { currentLat: data.lat } : {}),
        ...(data?.lng ? { currentLng: data.lng } : {}),
      },
    });

    console.log(`[FoodGateway] Driver ${driverId} (Socket ${client.id}) joined food:drivers_pool`);
    return { success: true, status: 'ONLINE', driverId };
  }

  /**
   * Driver rời drivers_pool: food.driver.leave
   */
  @SubscribeMessage('food.driver.leave')
  async handleDriverLeave(@ConnectedSocket() client: Socket) {
    const user = this.getAuthUser(client);
    if (!user) return { success: false };

    client.leave('food:drivers_pool');
    if (user.role === 'DRIVER') {
      client.leave(`food:driver:${user.id}`);
      await this.prisma.driver.updateMany({
        where: { id: user.id },
        data: { isOnline: false },
      });
      console.log(`[FoodGateway] Driver ${user.id} left food:drivers_pool`);
    }

    return { success: true, status: 'OFFLINE' };
  }

  /**
   * Driver gửi tọa độ GPS định vị: food.driver.location
   * Body: { orderId?: string, lat: number, lng: number, heading?: number, speed?: number }
   */
  @SubscribeMessage('food.driver.location')
  async handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId?: string; lat: number; lng: number; heading?: number; speed?: number },
  ) {
    const user = this.getAuthUser(client);
    if (!user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) return;

    if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      return { success: false, message: 'Tọa độ GPS không hợp lệ' };
    }

    const driverId = user.id;

    // Cập nhật vị trí GPS trong Database
    await this.prisma.driver.updateMany({
      where: { id: driverId },
      data: {
        currentLat: data.lat,
        currentLng: data.lng,
        heading: data.heading || 0,
        speed: data.speed || 0,
        isOnline: true,
      },
    });

    // Nếu đang giao một đơn cụ thể -> broadcast GPS tới phòng order
    if (data.orderId) {
      const locationPayload = {
        orderId: data.orderId,
        driverId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading || 0,
        speed: data.speed || 0,
        timestamp: new Date().toISOString(),
      };

      this.server.to(`food:order:${data.orderId}`).emit('food.driver.location_updated', locationPayload);
    }

    return { success: true };
  }

  // ─────────────────────────────────────────
  // SERVER-SIDE BROADCAST METHODS
  // ─────────────────────────────────────────

  /**
   * Phát thông báo có đơn đồ ăn mới cần tài xế giao tới food:drivers_pool
   */
  notifyDriverOrderAvailable(order: any) {
    if (!this.server) return;
    const eventId = `evt_avail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      eventId,
      orderId: order.id,
      orderCode: order.orderCode,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurant?.name || 'Nhà hàng',
      restaurantAddress: order.restaurant?.address || '',
      restaurantLat: order.restaurant?.latitude,
      restaurantLng: order.restaurant?.longitude,
      deliveryAddress: order.deliveryAddress,
      deliveryLat: order.deliveryLat,
      deliveryLng: order.deliveryLng,
      distanceKm: order.distanceKm,
      shippingFee: (order.shippingFee || 0) + (order.discountAmount || 0),
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      dispatchedAt: new Date().toISOString(),
    };

    this.server.to('food:drivers_pool').emit('food.driver.order_available', payload);
    console.log(
      `[FoodGateway] Broadcast "food.driver.order_available" [${eventId}] to food:drivers_pool (Order #${order.orderCode})`,
    );
  }

  /**
   * Phát thông báo đơn đã có tài xế nhận tới food:drivers_pool (để các tài xế khác ẩn pop-up)
   */
  notifyDriverOrderAccepted(orderId: string, orderCode: string, driver: any) {
    if (!this.server) return;

    this.server.to('food:drivers_pool').emit('food.driver.order_accepted', {
      orderId,
      orderCode,
      driverId: driver.id,
      acceptedAt: new Date().toISOString(),
    });

    console.log(`[FoodGateway] Broadcast "food.driver.order_accepted" for #${orderCode} by Driver ${driver.id}`);
  }

  /**
   * Broadcast vị trí tài xế tới phòng đơn hàng
   */
  broadcastDriverLocation(orderId: string, locationData: any) {
    if (!this.server) return;
    this.server.to(`food:order:${orderId}`).emit('food.driver.location_updated', {
      orderId,
      ...locationData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Phát event food.order.created đến room của quán
   */
  notifyOrderCreated(order: any) {
    if (!this.server) return;
    const roomName = `food:restaurant:${order.restaurantId}`;
    const eventId = `evt_create_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      eventId,
      id: order.id,
      orderId: order.id,
      orderCode: order.orderCode,
      restaurantId: order.restaurantId,
      status: order.status,
      items: order.items?.map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem?.name || item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        options: item.optionsJson,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      deliveryLat: order.deliveryLat,
      deliveryLng: order.deliveryLng,
      createdAt: order.createdAt,
    };

    this.server.to(roomName).emit('food.order.created', payload);
    console.log(`[FoodGateway] Broadcast "food.order.created" [${eventId}] to ${roomName} (Order #${order.orderCode})`);
  }

  /**
   * Broadcast food.order.status_changed đến room của order và room của quán
   */
  notifyOrderStatusChanged(
    order: any,
    previousStatus: string,
    extra?: { reason?: string; cancelledBy?: string },
  ) {
    if (!this.server) return;
    const eventId = `evt_status_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderRoom = `food:order:${order.id}`;
    const restaurantRoom = `food:restaurant:${order.restaurantId}`;

    const payload = {
      eventId,
      id: order.id,
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      previousStatus,
      timestamp: new Date().toISOString(),
      paymentStatus: order.paymentStatus,
      driverId: order.driverId || null,
      driver: order.driver
        ? {
            id: order.driver.id,
            fullName: order.driver.fullName,
            phone: order.driver.phone,
            licensePlate: order.driver.licensePlate,
            vehicleType: order.driver.vehicleType,
          }
        : null,
      reason: extra?.reason || order.rejectedReason || order.cancellationReason || null,
      cancelledBy: extra?.cancelledBy || order.cancelledBy || null,
    };

    // Phát đến room của order (khách hàng, tài xế đang theo dõi)
    this.server.to(orderRoom).emit('food.order.status_changed', payload);
    // Đồng thời phát đến room của nhà hàng để màn hình bếp/quán cập nhật
    this.server.to(restaurantRoom).emit('food.order.status_changed', payload);

    console.log(
      `[FoodGateway] Broadcast "food.order.status_changed" [${eventId}] ${previousStatus} -> ${order.status} to ${orderRoom} & ${restaurantRoom}`,
    );
  }
}

