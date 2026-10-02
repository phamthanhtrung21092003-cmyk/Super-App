---
name: driver-hardware-ux
description: Tối ưu trải nghiệm phần cứng cho tài xế bao gồm âm thanh chuông to, rung Haptics, giữ sáng màn hình và deep-link Google Maps chỉ đường.
---

# Driver Hardware UX Skill

## 1. Âm thanh chuông báo to & Rung khi có đơn mới
- Khi có sự kiện cuốc mới, lập tức kích hoạt:
  + Âm thanh chuông nổ đơn to lặp lại liên tục.
  + Rung Haptics đa nhịp độ (`Haptics.notificationAsync` hoặc `Vibration.vibrate([0, 500, 200, 500])`).
  + Chỉ tắt chuông và rung khi tài xế bấm "Nhận chuyến" hoặc "Từ chối" hoặc hết 20 giây đếm ngược.

## 2. Nút Deep-Link mở Google Maps ngoài 1 chạm
- Khi cần dẫn đường tới điểm đón hoặc điểm trả:
  + URL Deep-link Android/iOS: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  + Dự phòng schema `geo:${lat},${lng}?q=${lat},${lng}`
  + Giúp tài xế nghe giọng nói dẫn đường tiếng Việt quen thuộc mà không cần gõ lại địa chỉ.

## 3. Giữ sáng màn hình (Keep Awake)
- Trong lúc đang trực tuyến hoặc đang thực hiện cuốc xe, kích hoạt `expo-keep-awake` để màn hình điện thoại không tự động tắt khi tài xế đang lái xe.
