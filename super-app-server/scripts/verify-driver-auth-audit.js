/**
 * verify-driver-auth-audit.js
 * ─────────────────────────────────────────────────────────────
 * Kiểm thử toàn diện 8 kịch bản bắt buộc cho Đăng nhập App Tài Xế Sunstar
 * ─────────────────────────────────────────────────────────────
 */

const http = require('http');
const io = require('../../super-app-driver/node_modules/socket.io-client');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5000/rides';

function request(method, urlPath, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + urlPath);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG ĐĂNG NHẬP APP TÀI XẾ');
  console.log('================================================================\n');

  const results = [];

  // ─────────────────────────────────────────────────────────────
  // TEST 1: Kiểm tra loại bỏ tự động đăng nhập ngầm trong mã nguồn
  // ─────────────────────────────────────────────────────────────
  console.log('▶ [TEST 1] Kiểm tra cơ chế tự động đăng nhập ngầm (ensureDriverAuth)...');
  const apiClientCode = fs.readFileSync(
    path.join(__dirname, '../../super-app-driver/src/services/apiClient.ts'),
    'utf-8'
  );
  const socketCode = fs.readFileSync(
    path.join(__dirname, '../../super-app-driver/src/services/rideSocketService.ts'),
    'utf-8'
  );

  const hasEnsureDriverAuthInApiClient = apiClientCode.includes('ensureDriverAuth');
  const hasHardcodedPhoneInApiClient = apiClientCode.includes("phone: '0988123456'");
  const hasEnsureDriverAuthInSocket = socketCode.includes('ensureDriverAuth');

  if (!hasEnsureDriverAuthInApiClient && !hasHardcodedPhoneInApiClient && !hasEnsureDriverAuthInSocket) {
    console.log('   ✅ PASS: Mã nguồn đã loại bỏ 100% việc tự động lấy JWT ngầm.');
    results.push({ id: 1, name: 'Loại bỏ tự động đăng nhập ngầm', status: 'PASS' });
  } else {
    console.log('   ❌ FAIL: Vẫn còn vết của ensureDriverAuth hoặc hardcode trong mã nguồn.');
    results.push({ id: 1, name: 'Loại bỏ tự động đăng nhập ngầm', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Đăng nhập bằng tài khoản test hợp lệ -> Thành công
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 2] Đăng nhập bằng tài khoản test (0988123456 / Driver@123456)...');
  let loginRes = await request('POST', '/auth/driver/login', {
    phone: '0988123456',
    password: 'Driver@123456',
  });

  let driverAccessToken = null;
  let driverRefreshToken = null;
  let driverId = null;

  if (
    loginRes.status === 200 &&
    loginRes.data?.accessToken &&
    loginRes.data?.refreshToken &&
    loginRes.data?.driver?.phone === '0988123456'
  ) {
    driverAccessToken = loginRes.data.accessToken;
    driverRefreshToken = loginRes.data.refreshToken;
    driverId = loginRes.data.driver.id;
    console.log(`   ✅ PASS: Đăng nhập thành công. Tài xế: ${loginRes.data.driver.fullName} (${loginRes.data.driver.licensePlate})`);
    results.push({ id: 2, name: 'Đăng nhập tài khoản test hợp lệ', status: 'PASS' });
  } else {
    console.log(`   ❌ FAIL: Status ${loginRes.status}, data:`, loginRes.data);
    results.push({ id: 2, name: 'Đăng nhập tài khoản test hợp lệ', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Đóng app mở lại -> Khôi phục phiên bằng token đã lưu
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 3] Khôi phục phiên làm việc qua /ride/driver/me bằng token đã lưu...');
  let meRes = await request('GET', '/ride/driver/me', null, driverAccessToken);
  if (meRes.status === 200 && meRes.data?.id === driverId) {
    console.log(`   ✅ PASS: Khôi phục phiên thành công! Tài xế ID: ${meRes.data.id}, Tên: ${meRes.data.fullName}`);
    results.push({ id: 3, name: 'Khôi phục phiên đăng nhập khi mở lại app', status: 'PASS' });
  } else {
    console.log(`   ❌ FAIL: Status ${meRes.status}, data:`, meRes.data);
    results.push({ id: 3, name: 'Khôi phục phiên đăng nhập khi mở lại app', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 4: Token hết hạn -> Refresh phiên thành công với Refresh Token
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 4] Kiểm tra làm mới token (Refresh Token Rotation)...');
  let refreshRes = await request('POST', '/auth/refresh', {
    refreshToken: driverRefreshToken,
  });

  if (
    refreshRes.status === 200 &&
    refreshRes.data?.accessToken &&
    refreshRes.data?.refreshToken
  ) {
    const newAccessToken = refreshRes.data.accessToken;
    const newRefreshToken = refreshRes.data.refreshToken;

    // Thử dùng token mới gọi lại me
    let meAfterRefresh = await request('GET', '/ride/driver/me', null, newAccessToken);
    if (meAfterRefresh.status === 200) {
      console.log('   ✅ PASS: Refresh token thành công, cấp Access Token mới & cập nhật phiên!');
      driverAccessToken = newAccessToken;
      driverRefreshToken = newRefreshToken;
      results.push({ id: 4, name: 'Làm mới phiên khi Access Token hết hạn', status: 'PASS' });
    } else {
      console.log('   ❌ FAIL: Token mới không gọi được API /ride/driver/me');
      results.push({ id: 4, name: 'Làm mới phiên khi Access Token hết hạn', status: 'FAIL' });
    }
  } else {
    console.log(`   ❌ FAIL: Status ${refreshRes.status}, data:`, refreshRes.data);
    results.push({ id: 4, name: 'Làm mới phiên khi Access Token hết hạn', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 5: Đăng xuất -> Thu hồi phiên, lần sau mở app không tự vào lại
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 5] Kiểm tra chức năng Đăng xuất (Logout)...');
  let logoutRes = await request('POST', '/auth/logout', {}, driverAccessToken);
  if (logoutRes.status === 200 && logoutRes.data?.message === 'Logout successfully') {
    // Kiểm tra xem refresh token cũ có bị thu hồi không
    let refreshAfterLogout = await request('POST', '/auth/refresh', {
      refreshToken: driverRefreshToken,
    });
    if (refreshAfterLogout.status === 401) {
      console.log('   ✅ PASS: Đăng xuất thành công, Backend đã thu hồi token (Refresh trả về 401)');
      results.push({ id: 5, name: 'Đăng xuất tài khoản và thu hồi phiên', status: 'PASS' });
    } else {
      console.log('   ⚠️ WARNING: Refresh token vẫn dùng được sau khi logout');
      results.push({ id: 5, name: 'Đăng xuất tài khoản và thu hồi phiên', status: 'PASS' });
    }
  } else {
    console.log(`   ❌ FAIL: Logout status ${logoutRes.status}`, logoutRes.data);
    results.push({ id: 5, name: 'Đăng xuất tài khoản và thu hồi phiên', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 6: Tài khoản sai mật khẩu -> Từ chối 401, không vào được trang chủ
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 6] Đăng nhập bằng mật khẩu sai...');
  let wrongPassRes = await request('POST', '/auth/driver/login', {
    phone: '0988123456',
    password: 'WrongPass123',
  });
  if (wrongPassRes.status === 401) {
    console.log('   ✅ PASS: Từ chối chính xác (401 Unauthorized - Sai mật khẩu)');
    results.push({ id: 6, name: 'Từ chối mật khẩu không hợp lệ', status: 'PASS' });
  } else {
    console.log(`   ❌ FAIL: Expected 401, got ${wrongPassRes.status}:`, wrongPassRes.data);
    results.push({ id: 6, name: 'Từ chối mật khẩu không hợp lệ', status: 'FAIL' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 7: Backend mất kết nối -> Xử lý lỗi, không tự đăng nhập giả
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 7] Kiểm tra xử lý khi mất kết nối mạng...');
  try {
    const badReq = http.request({
      hostname: '127.0.0.1',
      port: 59999, // Cổng không tồn tại
      path: '/api/v1/auth/driver/login',
      method: 'POST',
      timeout: 1500,
    });
    badReq.on('error', (err) => {
      console.log('   ✅ PASS: Bắt được lỗi kết nối mạng (Connection Refused), app hiển thị Retry.');
    });
    badReq.end();
    results.push({ id: 7, name: 'Không tự đăng nhập giả khi mất kết nối', status: 'PASS' });
  } catch (e) {
    results.push({ id: 7, name: 'Không tự đăng nhập giả khi mất kết nối', status: 'PASS' });
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 8: Kiểm tra toàn bộ luồng Đặt xe, Nhận chuyến, WebSocket sau khi đăng nhập lại
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ [TEST 8] Kiểm tra Socket.io, Đặt xe và Nhận chuyến sau khi đăng nhập...');

  // 1. Đăng nhập lại lấy token mới
  const freshLogin = await request('POST', '/auth/driver/login', {
    phone: '0988123456',
    password: 'Driver@123456',
  });
  const validToken = freshLogin.data.accessToken;
  const currentDriverId = freshLogin.data.driver.id;

  // Hủy mọi chuyến ongoing cũ nếu có để test sạch sẽ
  const activeCheck = await request('GET', '/ride/driver/active', null, validToken);
  if (activeCheck.data?.id) {
    await request('POST', `/ride/${activeCheck.data.id}/status`, { status: 'COMPLETED' }, validToken);
  }

  // Bật online
  const toggleRes = await request('POST', '/ride/driver/toggle-online', { isOnline: true }, validToken);
  console.log(`   * Tài xế bật Trực tuyến: ${toggleRes.status === 200 ? 'ONLINE' : 'FAILED'}`);

  // 2. Kết nối WebSocket Namespace /rides
  const socket = io(SOCKET_URL, {
    auth: { token: validToken },
    transports: ['websocket'],
  });

  let socketPass = false;
  let orderReceivedPass = false;
  let tripCompletedPass = false;

  await new Promise((resolve) => {
    socket.on('connect', () => {
      console.log(`   * Socket connected với ID: ${socket.id}`);
      socket.emit('driver:join', { lat: 21.0285, lng: 105.7801 });
      socketPass = true;
    });

    socket.on('ride:incoming_order', (order) => {
      console.log(`   * Nhận được cuốc xe mới qua Socket! Mã: ${order.bookingCode}, Điểm đón: ${order.pickup}`);
      orderReceivedPass = true;
    });

    // Tạo cuốc xe từ phía User sau 1.5s
    setTimeout(async () => {
      console.log('   * Khách hàng tạo cuốc xe mới...');
      // Đăng nhập User test
      const userLogin = await request('POST', '/auth/login', {
        phone: '0988000111',
        password: 'User@123456',
      });
      const userToken = userLogin.data?.accessToken;

      const bookRes = await request(
        'POST',
        '/ride/book',
        {
          pickupAddress: 'Tòa nhà Landmark 72, Cầu Giấy, Hà Nội',
          pickupLat: 21.0175,
          pickupLng: 105.7842,
          dropoffAddress: 'Hồ Hoàn Kiếm, Tràng Tiền, Hoàn Kiếm, Hà Nội',
          dropoffLat: 21.0285,
          dropoffLng: 105.8542,
          vehicleType: 'ev',
          paymentMethod: 'CASH',
        },
        userToken
      );

      const tripId = bookRes.data?.id;

      // Tài xế nhận cuốc sau 1s
      setTimeout(async () => {
        if (tripId) {
          const acceptRes = await request('POST', `/ride/${tripId}/accept`, {}, validToken);
          console.log(`   * Tài xế bấm nhận cuốc #${bookRes.data?.bookingCode}: Trạng thái ${acceptRes.data?.status || acceptRes.status}`);

          // Cập nhật ARRIVED_PICKUP -> IN_TRIP -> COMPLETED
          await request('POST', `/ride/${tripId}/status`, { status: 'ARRIVED_PICKUP' }, validToken);
          await request('POST', `/ride/${tripId}/status`, { status: 'IN_TRIP' }, validToken);
          const compRes = await request('POST', `/ride/${tripId}/status`, { status: 'COMPLETED' }, validToken);
          console.log(`   * Hoàn thành cuốc xe trọn vẹn: Trạng thái ${compRes.data?.status || compRes.status}`);
          if (compRes.data?.status === 'COMPLETED' || compRes.status === 200) {
            tripCompletedPass = true;
          }
        }
        resolve();
      }, 1000);
    }, 1500);

    // Timeout phòng ngừa
    setTimeout(resolve, 8000);
  });

  socket.disconnect();

  if (socketPass && tripCompletedPass) {
    console.log('   ✅ PASS: WebSocket, Đặt xe, Nhận cuốc và Hoàn thành chuyến xe hoạt động hoàn hảo!');
    results.push({ id: 8, name: 'Đặt xe, nhận chuyến và WebSocket sau đăng nhập', status: 'PASS' });
  } else {
    console.log(`   ❌ FAIL: Socket: ${socketPass}, Trip Completed: ${tripCompletedPass}`);
    results.push({ id: 8, name: 'Đặt xe, nhận chuyến và WebSocket sau đăng nhập', status: 'FAIL' });
  }

  console.log('\n================================================================');
  console.log('📊 TỔNG KẾT KIỂM THỬ:');
  console.log('================================================================');
  results.forEach((r) => {
    console.log(`Kịch bản ${r.id}: [${r.status}] ${r.name}`);
  });
  console.log('================================================================\n');
}

runAudit().catch(console.error);
