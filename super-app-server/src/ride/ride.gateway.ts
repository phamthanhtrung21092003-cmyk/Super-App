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

  constructor(private readonly rideService: RideService) {}

  handleConnection(client: Socket) {
    console.log(`[RideGateway] Client connected: ${client.id}`);
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

  // ─────────────────────────────────────────
  // DRIVER EVENTS
  // ─────────────────────────────────────────

  /** Tài xế kết nối & tham gia drivers_pool để nhận đơn */
  @SubscribeMessage('driver:join')
  handleDriverJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: string; lat?: number; lng?: number },
  ) {
    client.join(`driver_${data.driverId}`);
    client.join('drivers_pool');
    this.driverSockets.set(data.driverId, client.id);

    // Cập nhật vị trí nếu có
    if (data.lat && data.lng) {
      this.rideService
        .updateDriverLocation({ driverId: data.driverId, lat: data.lat, lng: data.lng })
        .catch(() => {});
    }

    console.log(`[RideGateway] Driver ${data.driverId} joined pool`);

    return { event: 'driver:joined', data: { status: 'ONLINE', driverId: data.driverId } };
  }

  /** Tài xế gửi cập nhật vị trí GPS liên tục */
  @SubscribeMessage('driver:location')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      driverId: string;
      tripId?: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    },
  ) {
    await this.rideService.updateDriverLocation({
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading,
      speed: data.speed,
    });

    // Nếu đang có active trip → broadcast vị trí tới phòng trip (khách hàng nhận được)
    if (data.tripId) {
      this.server.to(`trip_${data.tripId}`).emit('trip:driver_location', {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // ─────────────────────────────────────────
  // USER EVENTS
  // ─────────────────────────────────────────

  /** Khách hàng tham gia phòng theo dõi một trip cụ thể */
  @SubscribeMessage('trip:join')
  handleTripJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string; userId?: string },
  ) {
    client.join(`trip_${data.tripId}`);

    if (data.userId) {
      this.userSockets.set(data.userId, client.id);
    }

    console.log(`[RideGateway] Client joined trip room: trip_${data.tripId}`);

    return { event: 'trip:joined', data: { tripId: data.tripId } };
  }

  /** Khách hoặc tài xế thay đổi trạng thái trip qua socket (backup nếu không dùng REST) */
  @SubscribeMessage('trip:status_change')
  handleStatusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string; status: string; extra?: any },
  ) {
    this.broadcastTripStatus(data.tripId, data.status, data.extra);
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
