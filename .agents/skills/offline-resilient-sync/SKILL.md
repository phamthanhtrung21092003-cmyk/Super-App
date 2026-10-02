---
name: offline-resilient-sync
description: Cơ chế chống mất sóng 4G/GPS khi chui vào hầm hoặc khu vực sóng yếu, tự khôi phục trạng thái cuốc xe cho tài xế.
---

# Offline Resilient Sync Skill

## 1. Lưu trữ cục bộ liên tục (Persistent Trip State)
- Khóa lưu trữ: `@vlife_driver_active_trip`
- Bất kỳ thay đổi trạng thái nào của cuốc xe (`ACCEPTED`, `ARRIVED`, `IN_TRIP`, v.v.) phải lập tức được ghi vào `AsyncStorage`.
- Khi mở lại ứng dụng hoặc mất mạng đột ngột rồi có lại:
  + Tự động đọc lại `@vlife_driver_active_trip`.
  + Nếu có cuốc đang dang dở, lập tức hiển thị lại màn hình hành trình thay vì trang chủ.
  + Gửi yêu cầu đồng bộ `sync_state` lên Server để xác nhận tính toàn vẹn.

## 2. Hàng đợi hành động ngoại tuyến (Offline Action Queue)
- Nếu tài xế bấm nút "Đã đến nơi" hoặc "Bắt đầu chuyến" trong lúc mất sóng 4G:
  + Cập nhật UI ngay lập tức để tài xế không bị khựng lại.
  + Đưa sự kiện vào hàng đợi ngoại tuyến `offline_actions_queue`.
  + Khi phát hiện mạng kết nối trở lại (`NetInfo` isConnected = true), tự động gửi toàn bộ sự kiện trong hàng đợi lên server.
