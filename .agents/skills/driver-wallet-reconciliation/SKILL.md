---
name: driver-wallet-reconciliation
description: Hạch toán ví tài xế, tạo mã nạp VietQR tự động, phân định rõ ràng giữa thu tiền mặt COD và thanh toán online ví để triệt tiêu tranh chấp.
---

# Driver Wallet Reconciliation Skill

## 1. Phân định hình thức thanh toán trực quan
- **TIỀN MẶT (COD)**:
  - Banner cảnh báo ĐỎ RỰC rực rỡ với icon tiền mặt.
  - Chữ in hoa cực lớn: `THU TIỀN MẶT TỪ KHÁCH: [Số tiền]đ`.
  - Phụ đề nhắc nhở: `(Tài xế giữ toàn bộ tiền mặt, hệ thống sẽ tự động trừ phí hoa hồng sàn vào ví tài xế)`.
- **VÍ ĐIỆN TỬ / VIETQR (ONLINE)**:
  - Banner cảnh báo XANH LÁ CÂY với icon thẻ/ví an toàn.
  - Chữ in hoa cực lớn: `KHÁCH ĐÃ THANH TOÁN ONLINE (0đ) - TUYỆT ĐỐI KHÔNG THU TIỀN KHÁCH`.
  - Phụ đề nhắc nhở: `(Tiền cước đã được cộng trực tiếp vào ví tài xế)`.

## 2. Quản lý ví tài xế (Driver Wallet)
- Số dư khả dụng (Hạn mức nhận cuốc): Nếu số dư ví âm quá hạn mức cho phép (ví dụ: <-50.000đ do thu nhiều cuốc tiền mặt), tạm khóa nhận cuốc COD và nhắc tài xế nạp tiền.
- Nạp tiền VietQR động: Bấm "Nạp ví" hiển thị mã VietQR kèm số tài khoản và cú pháp chuyển khoản tự động xử lý qua hệ thống ngân hàng 24/7.
- Lịch sử đối soát chi tiết từng cuốc xe (Thời gian, Mã cuốc, Tiền cước gốc, Hoa hồng sàn, Thực nhận).
