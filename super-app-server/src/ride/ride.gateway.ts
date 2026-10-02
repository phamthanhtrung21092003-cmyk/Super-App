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
import { RideService } from './ride.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/rides',
  transports: ['websocket', 'polling'],
})
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track which socket belongs to which driver/user
  private driverSockets: Map<string, string> = new Map(); // driverId -> socketId
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly rideService: RideService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization
          ? String(client.handshake.headers.authorization).replace(/^Bearer\s+/i, '')
          : null);

      if (token) {
        const secret =
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'super-app-secret-jwt-key-2026';
        const payload: any = this.jwtService.verify(token, { secret });
        client.data.user = {
          id: payload.sub,
          phone: payload.phone,
          role: payload.role,
        };
        console.log(`[RideGateway] Authenticated socket ${client.id} as ${payload.role}:${payload.sub}`);
      } else {
        client.data.user = null;
        console.log(`[RideGateway] Anonymous client connected: ${client.id}`);
      }
    } catch (err: any) {
      client.data.user = null;
      console.warn(`[RideGateway] Socket auth failed for ${client.id}:`, err.message);
    }
  }

  handleDisconnect(client: Socket) {
    // Remove from maps on disconnect
    for (const [driverId, socketId] of this.driverSockets.entries()) {
      if (socketId === client.id) {
        this.driverSockets.delete(driverId);
        this.rideService.toggleDriverOnline(driverId, false).catch(() => {});
        console.log(`[RideGateway] Driver ${driverId} went offline`);
        break;
      }
    }
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
    console.log(`[RideGateway] Client disconnected: ${client.id}`);
  }

  /** Helper kiểm tra xác thực quyền trên socket */
  private getAuthenticatedUser(client: Socket, requiredRole?: string) {
    const user = client.data?.user;
    if (!user) {
      client.emit('error', { message: 'Chưa xác thực (Unauthorized)' });
      return null;
    }
    if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
      client.emit('error', { message: `Quyền truy cập bị từ chối. Yêu cầu quyền ${requiredRole}` });
      return null;
    }
    return user;
  }

  // ─────────────────────────────────────────
  // DRIVER EVENTS
  // ─────────────────────────────────────────

  /** Tài xế kết nối & tham gia drivers_pool để nhận đơn (BẢO MẬT: Bắt buộc Role DRIVER) */
  @SubscribeMessage('driver:join')
  handleDriverJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat?: number; lng?: number },
  ) {
    const user = this.getAuthenticatedUser(client, 'DRIVER');
    if (!user) return { error: 'Unauthorized' };

    const driverId = user.id; // STRICT: enforce authenticated driverId, NOT client input
    client.join(`driver_${driverId}`);
    client.join('drivers_pool');
    this.driverSockets.set(driverId, client.id);

    // Cập nhật vị trí nếu có
    if (data && data.lat && data.lng) {
      this.rideService
        .updateDriverLocation({ driverId, lat: data.lat, lng: data.lng })
        .catch(() => {});
    }

    console.log(`[RideGateway] Driver ${driverId} joined pool`);

    return { event: 'driver:joined', data: { status: 'ONLINE', driverId } };
  }

  /** Tài xế gửi cập nhật vị trí GPS liên tục (BẢO MẬT: Chỉ đúng tài xế được gửi vị trí của mình) */
  @SubscribeMessage('driver:location')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      tripId?: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    },
  ) {
    const user = this.getAuthenticatedUser(client, 'DRIVER');
    if (!user) return;

    const driverId = user.id;
    await this.rideService.updateDriverLocation({
      driverId,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading,
      speed: data.speed,
    });

    // Nếu đang có active trip → broadcast vị trí tới phòng trip (khách hàng nhận được)
    if (data.tripId) {
      try {
        const trip = await this.rideService.getTripById(data.tripId);
        if (trip.driverId === driverId) {
          this.server.to(`trip_${data.tripId}`).emit('trip:driver_location', {
            lat: data.lat,
            lng: data.lng,
            heading: data.heading,
            speed: data.speed,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {}
    }
  }

  // ─────────────────────────────────────────
  // USER EVENTS
  // ─────────────────────────────────────────

  /** Khách hàng hoặc tài xế tham gia phòng theo dõi một trip cụ thể */
  @SubscribeMessage('trip:join')
  async handleTripJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return { error: 'Unauthorized' };

    try {
      const trip = await this.rideService.getTripById(data.tripId);
      // Chỉ cho phép khách hàng của chuyến, tài xế của chuyến, hoặc ADMIN
      if (
        user.role !== 'ADMIN' &&
        trip.userId !== user.id &&
        trip.driverId !== user.id &&
        trip.status !== 'SEARCHING'
      ) {
        client.emit('error', { message: 'Không có quyền truy cập vào chuyến xe này' });
        return { error: 'Forbidden' };
      }

      client.join(`trip_${data.tripId}`);
      if (user.role === 'USER') {
        this.userSockets.set(user.id, client.id);
      }

      console.log(`[RideGateway] User ${user.id} joined trip room: trip_${data.tripId}`);
      return { event: 'trip:joined', data: { tripId: data.tripId } };
    } catch (e) {
      return { error: 'Trip not found' };
    }
  }

  /** Cập nhật trạng thái trip qua socket (BẢO MẬT: Kiểm tra quyền và State Machine) */
  @SubscribeMessage('trip:status_change')
  async handleStatusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string; status: string; extra?: any },
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;

    try {
      const trip = await this.rideService.getTripById(data.tripId);
      if (data.status === 'CANCELLED') {
        if (trip.userId !== user.id && trip.driverId !== user.id && user.role !== 'ADMIN') {
          client.emit('error', { message: 'Bạn không có quyền hủy chuyến đi này.' });
          return;
        }
        await this.rideService.cancelTrip(
          data.tripId,
          data.extra?.cancelReason,
          user.role === 'DRIVER' ? 'driver' : 'customer',
          user.id,
        );
        this.broadcastTripStatus(data.tripId, 'CANCELLED', data.extra);
      } else {
        if (user.role !== 'DRIVER' || trip.driverId !== user.id) {
          client.emit('error', { message: 'Chỉ tài xế được chỉ định mới có thể cập nhật trạng thái.' });
          return;
        }
        const updatedTrip = await this.rideService.updateTripStatus(data.tripId, user.id, {
          status: data.status as any,
          ...data.extra,
        });
        this.broadcastTripStatus(data.tripId, updatedTrip.status, data.extra);
      }
    } catch (err: any) {
      client.emit('error', { message: err.message || 'Cập nhật trạng thái thất bại.' });
    }
  }

  // ─────────────────────────────────────────
  // SERVER-SIDE EMIT METHODS (called by Controller)
  // ─────────────────────────────────────────

  /** Phát đơn mới tới TẤT CẢ tài xế đang online trong drivers_pool */
  dispatchNewOrder(orderData: any) {
    if (this.server) {
      this.server.to('drivers_pool').emit('ride:incoming_order', {
        ...orderData,
        dispatchedAt: new Date().toISOString(),
      });
      console.log(`[RideGateway] Dispatched new order ${orderData.tripId} to drivers_pool`);
    }
  }

  /** Broadcast cập nhật trạng thái trip tới TOÀN BỘ phòng (driver + user) */
  broadcastTripStatus(tripId: string, status: string, extra: any = {}) {
    if (this.server) {
      this.server.to(`trip_${tripId}`).emit('trip:status_updated', {
        tripId,
        status,
        updatedAt: new Date().toISOString(),
        ...extra,
      });
      console.log(`[RideGateway] Trip ${tripId} status → ${status}`);
    }
  }

  /** Thông báo riêng cho tài xế khi khách hủy */
  notifyTripCancelled(tripId: string, driverId: string, reason?: string) {
    if (this.server) {
      this.server.to(`driver_${driverId}`).emit('trip:cancelled_by_customer', {
        tripId,
        reason: reason || 'Khách hàng đã hủy chuyến',
        cancelledAt: new Date().toISOString(),
      });
    }
  }

  /** Thông báo khi tài xế online */
  notifyDriverOnline(driverId: string) {
    // Có thể mở rộng: gửi các cuốc đang SEARCHING cho tài xế khi họ online
    if (this.server && driverId) {
      this.server.to(`driver_${driverId}`).emit('driver:status', {
        driverId,
        isOnline: true,
        message: 'Bạn đang trực tuyến. Sẵn sàng nhận cuốc!',
      });
    }
  }

  /** Thông báo khi tài xế offline */
  notifyDriverOffline(driverId: string) {
    if (this.server && driverId) {
      this.server.to(`driver_${driverId}`).emit('driver:status', {
        driverId,
        isOnline: false,
        message: 'Bạn đã ngắt kết nối.',
      });
    }
  }
}
