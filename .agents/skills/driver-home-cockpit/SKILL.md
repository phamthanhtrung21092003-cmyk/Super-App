---
name: driver-home-cockpit
description: Chuẩn hóa toàn bộ kiến trúc buồng lái số cho Trang chủ Tài xế gồm Widget Doanh thu nhanh, Thanh tiến độ thưởng ngày, Nút trượt trực tuyến chống chạm nhầm, Bản đồ nhiệt nhu cầu cao Heatmap, Bottom Sheet kéo trượt 3 nấc và Phím tắt khẩn cấp SOS.
---

# Driver Home Cockpit Skill

Hướng dẫn quy chuẩn thiết kế và vận hành "Buồng lái số" (Driver Cockpit) chuyên nghiệp cho Trang chủ của App Tài xế.

## 1. Widget Doanh thu nhanh & Mục tiêu ngày (Today Earnings Bar)
- **Vị trí**: Đặt nổi ngay dưới StatusBar, chiếm trọn chiều ngang, bo góc 16px, đổ bóng nhẹ.
- **Thành phần**:
  - **Thu nhập hôm nay**: Số tiền thực nhận sau chiết khấu (định dạng `xxx.000 đ`). Có nút con mắt 👁️ để ẩn/hiện số tiền nhằm bảo mật nơi đông người.
  - **Số cuốc hoàn thành**: Đếm số chuyến thành công trong ngày và tỷ lệ nhận/hoàn thành cuốc.
  - **Thanh tiến độ thưởng ngày (Quest/Target Tracker)**: Vạch tiến độ trực quan: *"Chạy thêm 2 cuốc nữa để nhận thưởng mốc 60.000đ"*.
  - **Cảnh báo số dư ví**: Viền vàng hoặc đỏ nếu số dư ký quỹ dưới hạn mức nhận cuốc COD.

## 2. Nút trượt Trực tuyến thông minh (Slide to Go Online)
- Thay thế nút switch nhỏ bằng thanh trượt trượt ngang dài (Slide to Action) để triệt tiêu việc chạm nhầm khi để trong túi quần.
- Trượt sang phải: Kích hoạt `ONLINE` -> Kết nối WebSocket, gửi tọa độ GPS định kỳ, bật giữ sáng màn hình `KeepAwake`.
- Trượt sang trái: Chuyển về `OFFLINE` -> Tắt kết nối WebSocket, giải phóng GPS, dừng nhận cuốc.
- **Đèn tín hiệu mạng & GPS**:
  - 🟢 Xanh lục: GPS chính xác cao (<10m) & WebSocket kết nối ổn định.
  - 🟡 Vàng: Tín hiệu yếu hoặc đang thử kết nối lại.
  - 🔴 Đỏ: Mất sóng hoặc mất quyền truy cập vị trí.

## 3. Bản đồ nhiệt (Heatmap) & Khu vực tăng giá cước (Surge Pricing)
- Thể hiện các vùng nhu cầu cao bằng các vòng tròn gradient (Vàng -> Cam -> Đỏ) ở các bến xe, trung tâm thương mại, khu văn phòng.
- Huy hiệu nhân giá cước nổi bật: `x1.2`, `x1.4`, `+15.000đ` theo từng khu vực để tài xế chủ động di chuyển đón khách.
- Nút bấm định vị lại xe (Recenter Button) đưa tâm bản đồ về vị trí hiện tại của tài xế kèm góc xoay xe mượt mà (Heading).

## 4. Bảng điều khiển Bottom Sheet kéo trượt 3 nấc (Sliding Control Sheet)
- **Nấc 1 (Thu gọn - Collapsed)**: Chỉ hiển thị thanh gạt Online và tổng kết nhanh.
- **Nấc 2 (Vừa - Half-expanded)**: Hiển thị bộ lọc dịch vụ (Chở khách, Giao hàng, Giao thức ăn), nút bật "Tự động nhận cuốc" và phím tắt "Cuốc xe tiện đường về nhà".
- **Nấc 3 (Mở rộng - Fully-expanded)**: Chi tiết lịch sử chuyến gần nhất, biểu đồ hoạt động trong ngày và mẹo lái xe an toàn.

## 5. Trung tâm An toàn SOS & Phím tắt nổi (Floating Actions)
- **Nút SOS Khẩn cấp hình khiên 🛡️**: Đặt bên sườn phải bản đồ. Bấm giữ 3 giây sẽ tự động gọi hotline khẩn cấp và gửi SMS tọa độ GPS hiện tại cho người thân đã cài đặt.
- **Nút Hotline hỗ trợ 24/7**: 1 chạm kết nối trực tiếp với đội ngũ điều hành Sunstar.
