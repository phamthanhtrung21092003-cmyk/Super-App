---
name: driver-settings-management
description: Chuẩn hóa toàn bộ kiến trúc và các mục cấu hình trong Trung tâm Cài đặt Tài xế gồm Tự động nhận cuốc, Bán kính điều phối, Âm thanh chuông báo to, Giữ sáng màn hình, Bản đồ chỉ đường mặc định, Kho câu chat nhanh 1 chạm và Quản lý an toàn SOS.
---

# Driver Settings Management Skill

Quy chuẩn thiết kế và vận hành Trung tâm Cài đặt (Settings Hub) chuyên nghiệp cho App Tài xế Sunstar Driver.

## 1. Cấu hình Cuốc xe & Điều phối (Dispatch & Trip Settings)
- **Tự động nhận cuốc (Auto-Accept)**:
  - Công tắc Bật/Tắt: Khi bật, tự động chấp nhận chuyến đi phù hợp mà không cần tài xế phải chạm tay vào màn hình khi đang lưu thông trên đường.
- **Bán kính nhận cuốc tối đa (Max Dispatch Radius)**:
  - Thanh trượt tùy chỉnh: `1km — 2km — 3km — 5km — 10km`. Giúp tài xế tránh nhận các đơn quá xa vào giờ kẹt xe.
- **Cuốc xe tiện đường về nhà (Favorite Destination)**:
  - Cho phép tài xế lưu địa chỉ nhà. Khi bật chế độ này vào cuối ca, hệ thống ưu tiên phát các cuốc xe có điểm trả cùng hướng về nhà.
- **Bộ lọc loại dịch vụ**:
  - Tùy chỉnh bật/tắt từng dịch vụ riêng lẻ: Chở khách (Ride/EV Taxi), Giao hàng siêu tốc (Express), Giao đồ ăn (Food).

## 2. Âm thanh, Báo rung & Hiển thị (Audio & Alert Settings)
- **Âm lượng chuông nổ đơn tối đa**:
  - Tự động phát chuông to nhất khi có cuốc mới ngay cả khi điện thoại đang để chế độ âm lượng nhỏ.
  - Chọn kiểu âm thanh: Chuông nổ đơn cổ điển, Chuông công nghệ sôi động, Giọng nói thông báo *"Có cuốc xe mới"*.
- **Rung Haptics đa tầng**:
  - Rung cường độ cao khi có đơn mới hoặc khi khách gửi tin nhắn.
- **Giữ sáng màn hình (Keep Awake)**:
  - Tùy chọn: `Luôn giữ sáng khi Trực tuyến` / `Chỉ giữ sáng khi đang có chuyến` / `Theo cài đặt mặc định của máy`.
- **Chế độ Ban đêm (Dark Mode)**:
  - Tự động kích hoạt sau 18h tối để chống lóa mắt tài xế và tiết kiệm pin OLED.

## 3. Bản đồ & Điều hướng dẫn đường (Navigation Settings)
- **Ứng dụng bản đồ mặc định**:
  - Lựa chọn: Google Maps, Apple Maps, hoặc Bản đồ tích hợp.
- **Tự động mở Google Maps khi nhận cuốc**:
  - Vừa bấm nhận chuyến thành công, ứng dụng tự động mở ngay Google Maps ngoài máy để chỉ đường rảnh tay.
- **Tránh trạm thu phí BOT / Đường cao tốc**:
  - Cấu hình chỉ đường né BOT hoặc cao tốc, rất cần thiết cho tài xế xe máy 2 bánh.

## 4. Kho câu Chat mẫu gửi nhanh 1 chạm (Quick Chat Presets)
- Cài đặt danh sách các câu nhắn thông dụng:
  + *"Tôi đang đến điểm đón, quý khách vui lòng đợi 3-5 phút nhé!"*
  + *"Tôi đã đến nơi, quý khách ra xe nhé ạ!"*
  + *"Khu vực này khó dừng đỗ, quý khách có thể đứng ở đầu ngõ giúp tôi được không?"*
  + *"Đường đang ùn ứ một chút, tôi sẽ đến ngay ạ."*
- Cho phép tài xế tự do thêm mới, chỉnh sửa câu chat riêng của mình.

## 5. An toàn SOS & Bảo trì Hệ thống
- **Cài đặt số điện thoại khẩn cấp SOS**: Lưu 1-2 số người thân để gửi vị trí khi bấm giữ nút SOS 3 giây.
- **Kiểm tra đường truyền mạng & GPS**: Đo độ trễ ping tới server điều phối và độ sai lệch GPS.
- **Xóa bộ nhớ đệm (Clear Cache)**: Xóa file rác, giải phóng RAM và bộ nhớ điện thoại.
- **Thông tin phiên bản**: Hiển thị số build, kiểm tra cập nhật mới nhất.
