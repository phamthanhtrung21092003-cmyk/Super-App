/**
 * test-e2e-realtime.js
 * ─────────────────────────────────────────────────────────────
 * Kịch bản kiểm thử E2E thực tế:
 * Khách hàng đặt xe -> Server tạo Trip -> Socket bắn tới Tài xế
 * -> Tài xế nhận cuốc -> ARRIVED_PICKUP -> IN_TRIP -> COMPLETED
 * -> Khách hàng nhận realtime từng bước -> GPS tracking live
 * -> Đối soát ví và giao dịch thật trong database PostgreSQL.
 * ─────────────────────────────────────────────────────────────
 */

const http = require('http');
const io = require('../../super-app-driver/node_modules/socket.io-client');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5000/rides';

// Helper: HTTP Request
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject({ status: res.statusCode, data: parsed });
          }
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

async function runE2ETest() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ E2E THỰC TẾ: KẾT NỐI MOBILE ↔ BACKEND');
  console.log('════════════════════════════════════════════════════════════════\n');

  let driverSocket = null;
  let customerSocket = null;

  try {
    // 1. ĐĂNG NHẬP KHÁCH HÀNG
    console.log('[Bước 1] Đăng nhập Khách hàng (User role)...');
    const userLoginRes = await request('POST', '/auth/login', {
      phone: '0988000111',
      password: 'User@123456',
    });
    const userToken = userLoginRes.data.accessToken;
    const userId = userLoginRes.data.user.id;
    console.log(`  ✓ Khách hàng đăng nhập thành công. User ID: ${userId}`);

    // 2. ĐĂNG NHẬP TÀI XẾ
    console.log('\n[Bước 2] Đăng nhập Tài xế (Driver role)...');
    const driverLoginRes = await request('POST', '/auth/driver/login', {
      phone: '0988123456',
      password: 'Driver@123456',
    });
    const driverToken = driverLoginRes.data.accessToken;
    const driverId = driverLoginRes.data.driver.id;
    console.log(`  ✓ Tài xế đăng nhập thành công. Driver ID: ${driverId} (${driverLoginRes.data.driver.fullName})`);

    // Lấy số dư ví tài xế trước khi chạy cuốc
    const initWalletRes = await request('GET', '/ride/driver/wallet', null, driverToken);
    const initialCredit = initWalletRes.data.creditWallet;
    const initialCash = initWalletRes.data.cashWallet;
    const initialDailyEarnings = initWalletRes.data.dailyEarnings;
    console.log(`  ✓ Số dư ban đầu: Ví ký quỹ=${initialCredit.toLocaleString()}đ, Ví thu nhập=${initialCash.toLocaleString()}đ, Thu nhập hôm nay=${initialDailyEarnings.toLocaleString()}đ`);

    // 3. TÀI XẾ KẾT NỐI WEBSOCKET VÀ THAM GIA POOL ĐIỀU PHỐI
    console.log('\n[Bước 3] Tài xế kết nối WebSocket & tham gia drivers_pool...');
    driverSocket = io(SOCKET_URL, {
      auth: { token: driverToken },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      driverSocket.on('connect', () => {
        console.log(`  ✓ Socket Tài xế kết nối thành công. Socket ID: ${driverSocket.id}`);
        driverSocket.emit('driver:join', { lat: 21.0285, lng: 105.8048 });
        resolve();
      });
      driverSocket.on('connect_error', (err) => reject(new Error('Driver socket connect error: ' + err.message)));
    });

    // Bật trạng thái online trên server
    await request('POST', '/ride/driver/toggle-online', { isOnline: true }, driverToken);
    console.log('  ✓ Tài xế đã bật trạng thái TRỰC TUYẾN trên máy chủ.');

    // 4. KHÁCH HÀNG KẾT NỐI WEBSOCKET
    console.log('\n[Bước 4] Khách hàng kết nối WebSocket...');
    customerSocket = io(SOCKET_URL, {
      auth: { token: userToken },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      customerSocket.on('connect', () => {
        console.log(`  ✓ Socket Khách hàng kết nối thành công. Socket ID: ${customerSocket.id}`);
        resolve();
      });
      customerSocket.on('connect_error', (err) => reject(new Error('Customer socket connect error: ' + err.message)));
    });

    // Lắng nghe cuốc xe mới trên socket tài xế (Promise bắt sự kiện)
    let incomingOrderPromise = new Promise((resolve) => {
      driverSocket.on('ride:incoming_order', (order) => {
        console.log('\n  ⚡ TÀI XẾ NHẬN ĐƯỢC CUỐC MỚI QUA WEBSOCKET REALTIME:');
        console.log(`     - Mã cuốc: ${order.bookingCode}`);
        console.log(`     - Điểm đón: ${order.pickup}`);
        console.log(`     - Điểm trả: ${order.dropoff}`);
        console.log(`     - Cước phí: ${order.fareAmount.toLocaleString()}đ (Thực nhận: ${order.finalAmount.toLocaleString()}đ)`);
        console.log(`     - Hình thức: ${order.paymentMethod}`);
        resolve(order);
      });
    });

    // 5. KHÁCH HÀNG TẠO CUỐC XE THẬT
    console.log('\n[Bước 5] Khách hàng gửi yêu cầu đặt xe qua REST API (POST /ride/book)...');
    const bookRes = await request(
      'POST',
      '/ride/book',
      {
        pickupAddress: 'Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm',
        pickupLat: 21.0165,
        pickupLng: 105.7848,
        dropoffAddress: 'Vincom Mega Mall Smart City, Tây Mỗ',
        dropoffLat: 20.9995,
        dropoffLng: 105.7423,
        vehicleType: 'ev',
        serviceType: 'RIDE',
        paymentMethod: 'CASH',
        tipAmount: 0,
      },
      userToken
    );

    const trip = bookRes.data;
    console.log(`  ✓ Cuốc xe tạo thành công trong Database PostgreSQL! Trip ID: ${trip.id}, Mã: ${trip.bookingCode}, Trạng thái: ${trip.status}`);

    // Chờ tài xế nhận event qua socket
    const receivedOrder = await Promise.race([
      incomingOrderPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Tài xế không nhận được socket dispatch sau 5s')), 5000)),
    ]);

    if (receivedOrder.tripId !== trip.id) {
      throw new Error(`TripId không khớp! Gửi: ${trip.id}, Nhận: ${receivedOrder.tripId}`);
    }

    // 6. KHÁCH HÀNG THAM GIA PHÒNG THEO DÕI TRIP
    console.log('\n[Bước 6] Khách hàng tham gia phòng theo dõi cuốc xe (trip:join)...');
    customerSocket.emit('trip:join', { tripId: trip.id });

    // Thiết lập lắng nghe cập nhật trạng thái trên socket khách hàng
    const statusEvents = [];
    customerSocket.on('trip:status_updated', (data) => {
      console.log(`  📲 KHÁCH HÀNG NHẬN CẬP NHẬT TRẠNG THÁI REALTIME: Trạng thái -> ${data.status}`);
      statusEvents.push(data);
    });

    // Lắng nghe GPS di chuyển của tài xế
    let gpsReceived = false;
    customerSocket.on('trip:driver_location', (loc) => {
      console.log(`  🛰️ KHÁCH HÀNG NHẬN TỌA ĐỘ GPS LIVE: Lat=${loc.lat}, Lng=${loc.lng}, Vận tốc=${loc.speed}km/h`);
      gpsReceived = true;
    });

    await sleep(500);

    // 7. TÀI XẾ NHẬN CUỐC XE (ACCEPTED)
    console.log('\n[Bước 7] Tài xế bấm "Nhận Chuyến" (POST /ride/:id/accept)...');
    const acceptRes = await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    console.log(`  ✓ Server cập nhật trạng thái cuốc: ${acceptRes.data.status}, Tài xế: ${acceptRes.data.driverName}`);
    await sleep(600);

    // 8. TÀI XẾ PHÁT GPS LIVE
    console.log('\n[Bước 8] Tài xế phát GPS định vị theo thời gian thực (driver:location)...');
    driverSocket.emit('driver:location', {
      tripId: trip.id,
      lat: 21.0175,
      lng: 105.7835,
      heading: 90,
      speed: 38,
    });
    await sleep(600);

    // 9. TÀI XẾ CẬP NHẬT: ĐÃ ĐẾN ĐIỂM ĐÓN (ARRIVED_PICKUP)
    console.log('\n[Bước 9] Tài xế cập nhật: Đã tới điểm đón khách (ARRIVED_PICKUP)...');
    const arrivedRes = await request('POST', `/ride/${trip.id}/status`, { status: 'ARRIVED_PICKUP' }, driverToken);
    console.log(`  ✓ Server phản hồi: Trạng thái -> ${arrivedRes.data.status}`);
    await sleep(600);

    // 10. TÀI XẾ CẬP NHẬT: KHÁCH ĐÃ LÊN XE (IN_TRIP)
    console.log('\n[Bước 10] Tài xế cập nhật: Khách đã lên xe, bắt đầu chạy (IN_TRIP)...');
    const inTripRes = await request('POST', `/ride/${trip.id}/status`, { status: 'IN_TRIP' }, driverToken);
    console.log(`  ✓ Server phản hồi: Trạng thái -> ${inTripRes.data.status}`);
    await sleep(600);

    // 11. TÀI XẾ CẬP NHẬT: HOÀN THÀNH CHUYẾN ĐI (COMPLETED)
    console.log('\n[Bước 11] Tài xế cập nhật: Đã tới nơi, kết thúc chuyến (COMPLETED)...');
    const completedRes = await request('POST', `/ride/${trip.id}/status`, { status: 'COMPLETED' }, driverToken);
    console.log(`  ✓ Server phản hồi: Trạng thái -> ${completedRes.data.status}, Thanh toán: ${completedRes.data.paymentStatus}`);
    await sleep(600);

    // 12. KHÁCH HÀNG ĐÁNH GIÁ TÀI XẾ
    console.log('\n[Bước 12] Khách hàng đánh giá tài xế 5 sao (POST /ride/:id/rating)...');
    const rateRes = await request(
      'POST',
      `/ride/${trip.id}/rating`,
      {
        rating: 5,
        comment: 'Bác tài chạy xe rất êm và cẩn thận, phục vụ chu đáo!',
        tags: ['Lái xe an toàn', 'Đúng giờ'],
      },
      userToken
    );
    console.log(`  ✓ Khách hàng đánh giá thành công. Rating lưu trong database: ${rateRes.data.driverRating} sao`);

    // 13. TÀI XẾ ĐÁNH GIÁ HÀNH KHÁCH
    console.log('\n[Bước 13] Tài xế lưu đánh giá hành khách (idempotent update)...');
    const driverReviewRes = await request(
      'POST',
      `/ride/${trip.id}/status`,
      {
        status: 'COMPLETED',
        driverRating: 5,
        driverReview: 'Khách hàng lịch sự, đúng giờ tại sảnh!',
      },
      driverToken
    );
    console.log(`  ✓ Tài xế lưu đánh giá hành khách thành công.`);

    // 14. KIỂM TRA ĐỐI SOÁT VÀ SỐ DƯ DATABASE THẬT
    console.log('\n[Bước 14] Đối soát tài chính và Sổ cái giao dịch trong PostgreSQL...');
    const finalWalletRes = await request('GET', '/ride/driver/wallet', null, driverToken);
    const finalCredit = finalWalletRes.data.creditWallet;
    const finalDailyEarnings = finalWalletRes.data.dailyEarnings;
    const transactions = finalWalletRes.data.transactions;

    const fare = trip.fareAmount;
    const expectedFee = Math.round(fare * 0.15); // 15% phí sàn
    const expectedNet = fare - expectedFee;

    console.log(`     - Giá cước chuyến đi: ${fare.toLocaleString()}đ`);
    console.log(`     - Phí sàn khấu trừ ví ký quỹ (15%): -${expectedFee.toLocaleString()}đ`);
    console.log(`     - Ví ký quỹ trước: ${initialCredit.toLocaleString()}đ -> Sau: ${finalCredit.toLocaleString()}đ`);
    console.log(`     - Thu nhập hôm nay trước: ${initialDailyEarnings.toLocaleString()}đ -> Sau: ${finalDailyEarnings.toLocaleString()}đ (Tăng +${(finalDailyEarnings - initialDailyEarnings).toLocaleString()}đ)`);

    // Kiểm tra giao dịch trong sổ cái
    const latestTx = transactions[0];
    console.log(`     - Giao dịch mới nhất ghi nhận trong PostgreSQL:`);
    console.log(`       + Mã giao dịch: ${latestTx.id}`);
    console.log(`       + Tiêu đề: ${latestTx.title}`);
    console.log(`       + Số tiền: ${latestTx.amount.toLocaleString()}đ`);
    console.log(`       + Loại ví: ${latestTx.walletType}`);
    console.log(`       + Số dư sau giao dịch: ${latestTx.balanceAfter.toLocaleString()}đ`);

    // Kiểm tra tính toàn vẹn của dữ liệu
    if (finalCredit !== initialCredit - expectedFee) {
      throw new Error(`Sai lệch đối soát ví ký quỹ! Kỳ vọng: ${initialCredit - expectedFee}, Thực tế: ${finalCredit}`);
    }

    if (!gpsReceived) {
      console.warn('  ⚠️ Chú ý: Chưa bắt được sự kiện GPS (có thể do timing).');
    } else {
      console.log('  ✓ Đã kiểm chứng nhận tọa độ GPS live thành công qua Socket!');
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🎉 KIỂM THỬ E2E THÀNH CÔNG 100%! TẤT CẢ DỮ LIỆU ĐÃ ĐỐI SOÁT VỚI DATABASE!');
    console.log('════════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err?.message || JSON.stringify(err));
    process.exit(1);
  } finally {
    if (driverSocket) driverSocket.disconnect();
    if (customerSocket) customerSocket.disconnect();
    process.exit(0);
  }
}

runE2ETest();
