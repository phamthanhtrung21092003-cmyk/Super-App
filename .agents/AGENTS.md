# User Preferences and Rules

## Communication and Permissions
- Always communicate, ask questions, explain options, write implementation plans, and interact with the user entirely in Vietnamese (tiếng Việt).
- Always ask for the user's explicit permission before installing new tools, dependencies, deleting files, or making significant architectural/code changes. State the reasons clearly and propose options before acting.
- **CRITICAL DATA SAFETY / TUYỆT ĐỐI BẢO VỆ DỮ LIỆU**:
  - KHÔNG BAO GIỜ tự ý chạy bất kỳ lệnh xóa (`del`, `rm`, `Remove-Item`, `git clean -fd`, v.v.) đối với file mã nguồn, thư mục dự án, hoặc ổ cứng.
  - Kể cả khi người dùng yêu cầu "xóa bớt", "dọn dẹp", AI BẮT BUỘC phải: (1) Liệt kê cụ thể từng file/thư mục được đề xuất dọn, (2) Nêu rõ lý do và dung lượng, (3) Hỏi xin xác nhận rõ ràng từ người dùng và CHỈ ĐƯỢC xóa đúng các file đó khi người dùng đồng ý.
  - Tuyệt đối không bao giờ dùng các lệnh xóa đệ quy/xóa hàng loạt lên thư mục cha hoặc ổ đĩa. Luôn đặt an toàn dữ liệu lên hàng đầu.
- **STORAGE LOCATION / VỊ TRÍ LƯU TRỮ VÀ TẢI VỀ**:
  - Mọi công cụ, gói cài đặt, công cụ phụ trợ (ADB, Node.js, JDK, file zip,...) BẮT BUỘC chỉ được tải về và đặt bên trong ổ F: tại thư mục dự án (`F:\duan\Project\...`). Tuyệt đối không tải hay cài đặt vào ổ C.

## Project Execution (Expo)
- The user prefers to test the Expo mobile application directly on their phone's web browser (Chrome) over the local network, rather than using the Expo Go app or tunneling (like ngrok).
- When starting the Expo development server, always use local LAN mode with web support (e.g., `npx expo start --lan --web`).
- Always provide the local IP link in the format `http://<LAN_IP>:8081` when asking the user to test the app on their phone.

## Repository Updates
- If the user asks to "get the project" (lấy dự án về), automatically pull the latest changes from the GitHub repository without asking for clarification.

## Fast Update Shortcut
- If the user types "cập nhật" (or "cập nhật dự án", "cập nhật chỉnh sửa"), automatically:
  1. Pull latest changes if needed (`git fetch` / `git pull`).
  2. Build the latest incremental Release APK with Gradle (`.\gradlew.bat assembleRelease`).
  3. Install/overwrite the APK directly onto the connected phone via ADB (`adb install -r ...`).
  4. Auto-dismiss any Google Play Protect prompt and launch the updated app on the phone immediately.

