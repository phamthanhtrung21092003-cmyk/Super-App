---
name: realtime-ride-dispatch
description: Hướng dẫn kỹ thuật điều phối thời gian thực, bắn cuốc theo bán kính địa lý và đồng bộ GPS qua Socket.io giữa Khách - Server - Tài xế.
---

# Realtime Ride Dispatch Skill

## 1. Kiến trúc luồng Socket.io & WebSocket
- App Khách đặt xe $\rightarrow$ Server `RideGateway` nhận sự kiện `ride:create`.
- Server tính toán bán kính Haversine (2km $\rightarrow$ 3.5km $\rightarrow$ 5km) tìm các tài xế có `isOnline = true` và `status = IDLE`.
- Server bắn sự kiện `ride:incoming_order` tới socket của tài xế kèm thông tin cuốc và thời gian timeout (20s).
- Tài xế phản hồi `ride:accept` hoặc `ride:reject`. Nếu timeout, tự động chuyển sang tài xế tiếp theo.

## 2. Truyền phát GPS & Làm mượt di chuyển (Position Interpolation)
- Tài xế cập nhật GPS mỗi 2-3 giây qua `driver:location_update` { lat, lng, heading, speed }.
- Server broadcast tới phòng `trip_${tripId}` để App Khách cập nhật vị trí xe theo thời gian thực.
- Sử dụng góc xoay `heading` để icon phương tiện xoay theo đúng hướng rẽ của đường đi.
