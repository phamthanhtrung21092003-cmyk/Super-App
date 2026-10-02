---
name: driver-trip-lifecycle
description: Chuẩn hóa toàn bộ vòng đời cuốc xe và máy trạng thái không lỗi cho App Tài xế và Vận chuyển.
---

# Driver Trip Lifecycle Skill

Quy chuẩn toàn diện về luồng trạng thái cuốc xe cho App Tài xế:

## 1. Máy trạng thái cuốc xe (Finite State Machine)
- `SEARCHING`: Hệ thống đang quét tài xế phù hợp trong bán kính 2km - 5km.
- `DISPATCHED`: Đã phát tín hiệu cuốc xe tới tài xế cụ thể. Hiển thị popup đếm ngược 15-30 giây.
- `ACCEPTED`: Tài xế chấp nhận cuốc. Chuyển sang màn hình điều hướng đón khách.
- `ARRIVED_PICKUP`: Tài xế đã tới điểm đón của hành khách. Bắt đầu đếm thời gian chờ.
- `IN_TRIP`: Hành khách đã lên xe, tài xế bắt đầu chuyến đi đến điểm trả.
- `ARRIVED_DESTINATION`: Đã tới điểm trả khách.
- `PAYMENT_SETTLED`: Hoàn tất thu tiền (Tiền mặt COD hoặc Xác nhận đã thanh toán ví/VietQR).
- `COMPLETED`: Cuốc xe hoàn tất thành công, đánh giá hành khách và cộng/trừ ví.
- `CANCELLED`: Cuốc xe bị hủy (Khách hủy hoặc Tài xế hủy kèm lý do).

## 2. Nguyên tắc an toàn & chống lỗi
- Luôn lưu trạng thái cuốc vào AsyncStorage để tự phục hồi khi app bị tắt ngầm hoặc khởi động lại.
- Phân biệt rõ ràng 100% giữa Tiền mặt COD và Thanh toán Online (SuperPay/VietQR) để triệt tiêu tranh chấp.
- Sau 5 phút chờ tại điểm đón, tài xế được quyền hủy chuyến mà không bị phạt tỷ lệ hoàn thành.
