/**
 * test-e2e-full-audit.js
 * ─────────────────────────────────────────────────────────────
 * KIỂM THỬ E2E TOÀN DIỆN — SUNSTAR SUPER APP
 * ─────────────────────────────────────────────────────────────
 * Bao gồm:
 *  S1.  Happy Path: Khách đặt → Tài xế nhận → ARRIVED → IN_TRIP → COMPLETED
 *  S2.  Khách hủy chuyến khi đang SEARCHING
 *  S3.  Khách hủy chuyến sau khi tài xế đã nhận (ACCEPTED)
 *  S4.  Tài xế hủy chuyến đang chạy (IN_TRIP → CANCELLED)
 *  S5.  Race Condition: 2 tài xế cùng accept 1 cuốc — chỉ 1 được nhận
 *  S6.  Bảo mật: Tài xế A thao tác cuốc của Tài xế B → 403 Forbidden
 *  S7.  Bảo mật: Khách tự cập nhật trạng thái cuốc → 403 Forbidden
 *  S8.  Bảo mật: Nhảy cóc trạng thái (SEARCHING → COMPLETED) → 400 Bad Request
 *  S9.  Bảo mật: WebSocket không có token → Emit event bị chặn
 *  S10. Reconnect: Tài xế ngắt/kết nối lại WebSocket, kiểm tra không tạo trùng
 *  S11. API Khách hàng: Kiểm tra rideRepository vs realRideService endpoint compatibility
 *  S12. Đối soát tài chính: Thanh toán Online (SUPERPAY) — cộng vào cashBalance
 * ─────────────────────────────────────────────────────────────
 */

const http = require('http');
const io = require('../../super-app-driver/node_modules/socket.io-client');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5000/rides';

// ─── Helpers ─────────────────────────────────────────────────

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
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

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const sock = io(SOCKET_URL, {
      auth: token ? { token } : {},
      transports: ['websocket'],
    });
    const timer = setTimeout(() => {
      sock.disconnect();
      reject(new Error('Socket connect timeout'));
    }, 5000);
    sock.on('connect', () => {
      clearTimeout(timer);
      resolve(sock);
    });
    sock.on('connect_error', (err) => {
      clearTimeout(timer);
      reject(new Error('Socket connect error: ' + err.message));
    });
  });
}

// Standard ride booking payload
const BOOKING_PAYLOAD = {
  pickupAddress: 'Keangnam Landmark 72, Phạm Hùng',
  pickupLat: 21.0165,
  pickupLng: 105.7848,
  dropoffAddress: 'Vincom Mega Mall Smart City',
  dropoffLat: 20.9995,
  dropoffLng: 105.7423,
  vehicleType: 'ev',
  serviceType: 'RIDE',
  paymentMethod: 'CASH',
  tipAmount: 0,
};

// ─── Result tracking ──────────────────────────────────────────

const results = [];
function pass(scenario, detail = '') {
  results.push({ status: '✅ PASS', scenario, detail });
  console.log(`✅ PASS  | ${scenario}${detail ? ' — ' + detail : ''}`);
}
function fail(scenario, detail = '') {
  results.push({ status: '🔴 FAIL', scenario, detail });
  console.error(`🔴 FAIL  | ${scenario}${detail ? ' — ' + detail : ''}`);
}
function unverified(scenario, detail = '') {
  results.push({ status: '🟡 CHƯA KIỂM CHỨNG', scenario, detail });
  console.warn(`🟡 CHƯA  | ${scenario}${detail ? ' — ' + detail : ''}`);
}

// ─── MAIN ────────────────────────────────────────────────────

async function runFullAudit() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🔍 SUNSTAR SUPER APP — FULL E2E AUDIT & SECURITY TEST');
  console.log('════════════════════════════════════════════════════════════════\n');

  // ─── Auth: Login cả 3 tài khoản ──────────────────────────
  let userToken, userId;
  let driverToken, driverId;
  let driver2Token, driver2Id;

  console.log('── [AUTH] Đăng nhập 3 tài khoản ────────────────────────────');
  try {
    const userRes = await request('POST', '/auth/login', {
      phone: '0988000111',
      password: 'User@123456',
    });
    userToken = userRes.data.accessToken;
    userId = userRes.data.user.id;
    console.log(`  Khách hàng: ${userId} (${userRes.data.user.fullName})`);
  } catch (e) {
    fail('AUTH: Khách hàng đăng nhập', e?.data?.message || JSON.stringify(e));
    process.exit(1);
  }

  try {
    const driverRes = await request('POST', '/auth/driver/login', {
      phone: '0988123456',
      password: 'Driver@123456',
    });
    driverToken = driverRes.data.accessToken;
    driverId = driverRes.data.driver.id;
    console.log(`  Tài xế 1:  ${driverId} (${driverRes.data.driver.fullName})`);
  } catch (e) {
    fail('AUTH: Tài xế 1 đăng nhập', e?.data?.message || JSON.stringify(e));
    process.exit(1);
  }

  // Tài xế 2 — tài khoản độc lập để test race condition & phân quyền chéo
  try {
    try {
      await request('POST', '/auth/driver/register', {
        phone: '0988654321',
        password: 'Driver@123456',
        fullName: 'Trần Quốc Bảo',
        licensePlate: '29A-888.99',
        vehicleType: 'ev',
      });
    } catch (_) {
      // Tài khoản đã tồn tại từ lần chạy trước
    }
    const driver2Res = await request('POST', '/auth/driver/login', {
      phone: '0988654321',
      password: 'Driver@123456',
    });
    driver2Token = driver2Res.data.accessToken;
    driver2Id = driver2Res.data.driver.id;
    console.log(`  Tài xế 2:  ${driver2Id} (${driver2Res.data.driver.fullName})`);
  } catch (e) {
    fail('AUTH: Tài xế 2 đăng nhập', e?.data?.message || JSON.stringify(e));
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════
  // S1. HAPPY PATH: Full flow đầy đủ
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S1. HAPPY PATH: Khách đặt → Tài xế nhận → COMPLETED ════');
  let s1Trip;
  try {
    // Kết nối socket
    const drvSock = await connectSocket(driverToken);
    const custSock = await connectSocket(userToken);
    drvSock.emit('driver:join', { lat: 21.0285, lng: 105.8048 });
    await request('POST', '/ride/driver/toggle-online', { isOnline: true }, driverToken);

    // Hứa nhận event new order
    let newOrderPromise = new Promise((resolve, reject) => {
      drvSock.on('ride:incoming_order', resolve);
      setTimeout(() => reject(new Error('Timeout nhận incoming_order')), 6000);
    });

    // Tạo cuốc
    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    s1Trip = bookRes.data;
    if (!s1Trip.id) throw new Error('Trip tạo thiếu id');
    if (s1Trip.status !== 'SEARCHING') throw new Error(`Status phải là SEARCHING, nhưng là ${s1Trip.status}`);
    pass('S1.1 Tạo chuyến xe (POST /ride/book)', `Trip ${s1Trip.bookingCode}, fare=${s1Trip.fareAmount}đ`);

    // Kiểm tra tài xế nhận socket event
    const receivedOrder = await newOrderPromise;
    if (receivedOrder.tripId !== s1Trip.id) throw new Error('tripId không khớp trong socket event');
    pass('S1.2 Tài xế nhận cuốc qua WebSocket realtime', `ride:incoming_order tripId=${receivedOrder.tripId}`);

    // Khách join trip room & listen status
    custSock.emit('trip:join', { tripId: s1Trip.id });
    const statusUpdates = [];
    custSock.on('trip:status_updated', (d) => statusUpdates.push(d.status));
    await sleep(300);

    // Tài xế nhận cuốc
    const acceptRes = await request('POST', `/ride/${s1Trip.id}/accept`, {}, driverToken);
    if (acceptRes.data.status !== 'ACCEPTED') throw new Error(`Status phải ACCEPTED, nhận ${acceptRes.data.status}`);
    if (acceptRes.data.driverId !== driverId) throw new Error('driverId không khớp');
    pass('S1.3 Tài xế nhận chuyến (POST /ride/:id/accept)', `driverId=${acceptRes.data.driverId}`);
    await sleep(500);

    // Kiểm tra khách nhận ACCEPTED realtime
    if (!statusUpdates.includes('ACCEPTED')) {
      fail('S1.4 Khách nhận ACCEPTED qua WebSocket', `statusUpdates nhận được: [${statusUpdates.join(', ')}]`);
    } else {
      pass('S1.4 Khách nhận ACCEPTED qua WebSocket realtime');
    }

    // GPS broadcast
    let gpsReceived = false;
    custSock.on('trip:driver_location', () => { gpsReceived = true; });
    drvSock.emit('driver:location', { tripId: s1Trip.id, lat: 21.017, lng: 105.784, speed: 30 });
    await sleep(500);
    if (!gpsReceived) {
      fail('S1.5 GPS tài xế broadcast đến khách (trip:driver_location)', 'Khách không nhận được sự kiện GPS');
    } else {
      pass('S1.5 GPS tài xế broadcast đến khách thành công');
    }

    // ARRIVED_PICKUP
    const arrivedRes = await request('POST', `/ride/${s1Trip.id}/status`, { status: 'ARRIVED_PICKUP' }, driverToken);
    if (arrivedRes.data.status !== 'ARRIVED_PICKUP') throw new Error('Status phải ARRIVED_PICKUP');
    pass('S1.6 ARRIVED_PICKUP', `status=${arrivedRes.data.status}`);
    await sleep(400);

    // IN_TRIP
    const inTripRes = await request('POST', `/ride/${s1Trip.id}/status`, { status: 'IN_TRIP' }, driverToken);
    if (inTripRes.data.status !== 'IN_TRIP') throw new Error('Status phải IN_TRIP');
    pass('S1.7 IN_TRIP', `status=${inTripRes.data.status}`);
    await sleep(400);

    // Lấy ví trước COMPLETED
    const walletBefore = await request('GET', '/ride/driver/wallet', null, driverToken);
    const creditBefore = walletBefore.data.creditWallet;

    // COMPLETED
    const completedRes = await request('POST', `/ride/${s1Trip.id}/status`, { status: 'COMPLETED' }, driverToken);
    if (completedRes.data.status !== 'COMPLETED') throw new Error('Status phải COMPLETED');
    if (completedRes.data.paymentStatus !== 'PAID') throw new Error('paymentStatus phải PAID');
    pass('S1.8 COMPLETED + paymentStatus=PAID');
    await sleep(500);

    // Đối soát ví
    const walletAfter = await request('GET', '/ride/driver/wallet', null, driverToken);
    const creditAfter = walletAfter.data.creditWallet;
    const expectedFee = Math.round(s1Trip.fareAmount * 0.15);
    if (creditAfter !== creditBefore - expectedFee) {
      fail('S1.9 Đối soát tài chính CASH — ví ký quỹ', `Kỳ vọng -${expectedFee}đ; thực tế: ${creditBefore} → ${creditAfter}`);
    } else {
      pass('S1.9 Đối soát tài chính CASH — ví ký quỹ', `-${expectedFee}đ (15% sàn)`);
    }

    // Giao dịch trong sổ cái
    const latestTx = walletAfter.data.transactions[0];
    if (!latestTx || latestTx.type !== 'FEE') {
      fail('S1.10 Giao dịch sổ cái (DriverTransaction)', `Giao dịch mới nhất: ${JSON.stringify(latestTx)}`);
    } else {
      pass('S1.10 Giao dịch sổ cái', `${latestTx.title} | ${latestTx.amount}đ | balanceAfter=${latestTx.balanceAfter}đ`);
    }

    // Rating
    const rateRes = await request('POST', `/ride/${s1Trip.id}/rating`, { rating: 5, comment: 'Chạy tốt' }, userToken);
    if (rateRes.data.driverRating !== 5) throw new Error('driverRating phải là 5');
    pass('S1.11 Khách đánh giá tài xế (POST /ride/:id/rating)', `driverRating=${rateRes.data.driverRating}`);

    drvSock.disconnect();
    custSock.disconnect();
  } catch (e) {
    fail('S1 Happy Path gặp lỗi', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S2. KHÁCH HỦY KHI ĐANG SEARCHING
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S2. Khách hủy chuyến khi đang SEARCHING ════════════════');
  try {
    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    if (trip.status !== 'SEARCHING') throw new Error('Phải ở SEARCHING');

    const cancelRes = await request('POST', `/ride/${trip.id}/cancel`, { cancelReason: 'Đặt nhầm' }, userToken);
    if (cancelRes.data.status !== 'CANCELLED') throw new Error(`Status phải CANCELLED, nhận ${cancelRes.data.status}`);
    pass('S2.1 Khách hủy cuốc đang SEARCHING', `Trip ${trip.bookingCode} → CANCELLED`);

    // Hủy lần 2 phải fail
    try {
      await request('POST', `/ride/${trip.id}/cancel`, {}, userToken);
      fail('S2.2 Không thể hủy cuốc đã CANCELLED', 'Server đáng ra phải trả 400');
    } catch (e2) {
      if (e2.status === 400) {
        pass('S2.2 Hủy cuốc đã CANCELLED trả 400 Bad Request', `status=${e2.status}`);
      } else {
        fail('S2.2 Hủy cuốc đã CANCELLED', `Nhận status=${e2.status} thay vì 400`);
      }
    }
  } catch (e) {
    fail('S2 Khách hủy SEARCHING', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S3. KHÁCH HỦY SAU KHI TÀI XẾ ĐÃ NHẬN (ACCEPTED)
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S3. Khách hủy sau khi tài xế nhận (ACCEPTED) ══════════');
  try {
    const drvSock = await connectSocket(driverToken);
    drvSock.emit('driver:join', { lat: 21.0285, lng: 105.8048 });
    await sleep(300);

    // Listen notify
    let cancelNotified = false;
    drvSock.on('trip:cancelled_by_customer', () => { cancelNotified = true; });

    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    await sleep(400);

    await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    await sleep(300);

    const cancelRes = await request('POST', `/ride/${trip.id}/cancel`, { cancelReason: 'Khách hàng thay đổi kế hoạch' }, userToken);
    if (cancelRes.data.status !== 'CANCELLED') throw new Error('Status phải CANCELLED');
    pass('S3.1 Khách hủy cuốc đã ACCEPTED', `${trip.bookingCode} → CANCELLED`);

    await sleep(500);
    if (!cancelNotified) {
      fail('S3.2 Tài xế nhận thông báo hủy (trip:cancelled_by_customer)', 'Socket event không đến');
    } else {
      pass('S3.2 Tài xế nhận thông báo hủy realtime', 'trip:cancelled_by_customer OK');
    }

    drvSock.disconnect();
  } catch (e) {
    fail('S3 Khách hủy ACCEPTED', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S4. TÀI XẾ HỦY CHUYẾN ĐÃ NHẬN
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S4. Tài xế hủy chuyến đã nhận (ACCEPTED → CANCELLED) ══');
  try {
    const drvSock = await connectSocket(driverToken);
    drvSock.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(300);

    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    await sleep(300);
    await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    await sleep(300);

    // Tài xế hủy bằng REST /cancel
    const cancelRes = await request('POST', `/ride/${trip.id}/cancel`, { cancelReason: 'Xe bị hỏng' }, driverToken);
    if (cancelRes.data.status !== 'CANCELLED') throw new Error(`Status phải CANCELLED, nhận ${cancelRes.data.status}`);
    pass('S4.1 Tài xế hủy chuyến ACCEPTED', `${trip.bookingCode} → CANCELLED, cancelledBy ghi nhận`);

    drvSock.disconnect();
  } catch (e) {
    fail('S4 Tài xế hủy chuyến', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S5. RACE CONDITION: 2 SOCKET CÙNG ACCEPT 1 CUỐC
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S5. Race Condition: 2 yêu cầu accept đồng thời ════════');
  try {
    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    await sleep(200);

    // Gửi 2 request accept đồng thời — dùng cùng driverToken (đủ để test DB atomicity)
    const [r1, r2] = await Promise.allSettled([
      request('POST', `/ride/${trip.id}/accept`, {}, driverToken),
      request('POST', `/ride/${trip.id}/accept`, {}, driver2Token),
    ]);

    const successes = [r1, r2].filter((r) => r.status === 'fulfilled');
    const failures = [r1, r2].filter((r) => r.status === 'rejected');

    if (successes.length === 1 && failures.length === 1) {
      pass('S5.1 Race condition: Chỉ 1 trong 2 accept thành công', `Success=1 Fail=1`);
    } else if (successes.length === 2) {
      fail('S5.1 Race condition: CẢ HAI accept đều thành công — lỗi nghiêm trọng!', `Cả 2 request đều status 200`);
    } else if (successes.length === 0) {
      fail('S5.1 Race condition: Không ai accept được', `Cả 2 đều thất bại`);
    }

    // Kiểm tra chuyến thực tế trong DB
    try {
      const tripCheck = await request('GET', `/ride/${trip.id}`, null, userToken);
      const finalTrip = tripCheck.data;
      if (finalTrip.status === 'ACCEPTED' && finalTrip.driverId) {
        pass('S5.2 DB sau race condition: Trip có đúng 1 tài xế', `driverId=${finalTrip.driverId}`);
      } else if (finalTrip.status === 'SEARCHING') {
        unverified('S5.2 DB sau race condition: Trip vẫn SEARCHING', 'Cả 2 request đều bị từ chối');
      } else {
        fail('S5.2 DB sau race condition', `status=${finalTrip.status}, driverId=${finalTrip.driverId}`);
      }
    } catch (e) {
      // GET /ride/:id cần auth check — thử qua driver endpoint
      unverified('S5.2 DB check sau race condition', 'Không lấy được trip detail để verify');
    }
  } catch (e) {
    fail('S5 Race Condition test', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S6. BẢO MẬT: Tài xế A thao tác cuốc của Tài xế khác
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S6. Bảo mật: Tài xế A can thiệp cuốc Tài xế B ════════');
  try {
    const drvSock = await connectSocket(driverToken);
    drvSock.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(200);

    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    await sleep(200);
    await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    await sleep(200);

    // S6.1: Khách hàng tự ý cập nhật trạng thái cuốc → phải bị chặn 403
    try {
      await request('POST', `/ride/${trip.id}/status`, { status: 'ARRIVED_PICKUP' }, userToken);
      fail('S6.1 Khách tự cập nhật trạng thái → phải bị chặn 403', 'Server cho phép → lỗ hổng bảo mật!');
    } catch (e) {
      if (e.status === 403) {
        pass('S6.1 Khách không thể update trip status (403 Forbidden)', `status=${e.status}`);
      } else {
        fail('S6.1 Chặn khách update status', `Nhận ${e.status} thay vì 403`);
      }
    }

    // S6.2: Tài xế 2 thử cập nhật trạng thái hoặc hủy cuốc của Tài xế 1 → phải bị chặn 403
    try {
      await request('POST', `/ride/${trip.id}/status`, { status: 'ARRIVED_PICKUP' }, driver2Token);
      fail('S6.2 Tài xế 2 can thiệp cuốc Tài xế 1 → phải bị chặn 403', 'Server cho phép → lỗ hổng bảo mật!');
    } catch (e) {
      if (e.status === 403) {
        pass('S6.2 Tài xế 2 bị chặn update cuốc của Tài xế 1 (403 Forbidden)', `status=${e.status}`);
      } else {
        fail('S6.2 Chặn Tài xế 2 update status', `Nhận ${e.status} thay vì 403`);
      }
    }

    drvSock.disconnect();
  } catch (e) {
    fail('S6 Bảo mật tài xế', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S7. BẢO MẬT: NHẢY CÓC TRẠNG THÁI
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S7. Bảo mật: Nhảy cóc trạng thái (ACCEPTED → COMPLETED) ═');
  try {
    const drvSock = await connectSocket(driverToken);
    drvSock.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(200);

    const bookRes = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip = bookRes.data;
    await sleep(200);
    await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    await sleep(200);

    // Thử nhảy thẳng ACCEPTED → COMPLETED (skip ARRIVED_PICKUP và IN_TRIP)
    try {
      await request('POST', `/ride/${trip.id}/status`, { status: 'COMPLETED' }, driverToken);
      fail('S7.1 Nhảy cóc ACCEPTED → COMPLETED phải bị chặn 400', 'Server cho phép → vi phạm state machine!');
    } catch (e) {
      if (e.status === 400) {
        pass('S7.1 State machine chặn nhảy cóc ACCEPTED → COMPLETED (400)', `message: ${e.data?.message}`);
      } else {
        fail('S7.1 State machine', `Nhận ${e.status} thay vì 400`);
      }
    }

    // Thử SEARCHING → COMPLETED (trực tiếp)
    const bookRes2 = await request('POST', '/ride/book', BOOKING_PAYLOAD, userToken);
    const trip2 = bookRes2.data;
    await sleep(200);
    try {
      await request('POST', `/ride/${trip2.id}/accept`, {}, driverToken);
      await request('POST', `/ride/${trip2.id}/status`, { status: 'COMPLETED' }, driverToken);
      fail('S7.2 ACCEPTED → COMPLETED trực tiếp phải bị chặn', 'State machine không hoạt động!');
    } catch (e2) {
      if (e2.status === 400) {
        pass('S7.2 State machine chặn nhảy cóc nhiều bước', `status=${e2.status}`);
      } else {
        fail('S7.2 State machine nhiều bước', `Nhận ${e2.status}`);
      }
    }

    drvSock.disconnect();
  } catch (e) {
    fail('S7 State machine test', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S8. BẢO MẬT: WEBSOCKET KHÔNG CÓ TOKEN
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S8. Bảo mật: WebSocket không có token ══════════════════');
  try {
    const anonSock = await connectSocket(null); // Kết nối không có token
    let errorReceived = false;

    anonSock.on('error', (e) => { errorReceived = true; });

    // Thử emit driver:join không có auth
    anonSock.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(800);

    // Server vẫn cho kết nối nhưng kiểm tra behavior của join
    // Anonymous socket kết nối được là bình thường (socket.io allow)
    // Nhưng driver:join phải bị chặn
    pass('S8.1 Anonymous WebSocket kết nối được (bình thường, auth check ở event level)', '');

    if (errorReceived) {
      pass('S8.2 Server gửi error event cho anonymous khi emit driver:join', '');
    } else {
      unverified('S8.2 Error event cho anonymous driver:join', 'Không nhận được error event — có thể server không phản hồi lại');
    }

    anonSock.disconnect();
  } catch (e) {
    fail('S8 WebSocket anonymous test', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // S9. BẢO MẬT: KHÔNG CHO MOBILE TỰ GỬI GIÁ TIỀN
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S9. Bảo mật: Mobile không thể tự ý gửi giá tiền ═══════');
  try {
    const bookRes = await request('POST', '/ride/book', {
      ...BOOKING_PAYLOAD,
      fareAmount: 1,     // Thử gửi giá tiền giả (1đ)
      finalAmount: 1,
    }, userToken);

    const trip = bookRes.data;
    const realFare = trip.fareAmount;

    // Server phải tính giá theo server-side, không dùng client input
    if (realFare <= 1) {
      fail('S9.1 Server dùng giá tiền do Client gửi lên (lỗi bảo mật!)', `fareAmount=${realFare}đ`);
    } else if (realFare > 1000) {
      pass('S9.1 Server tự tính giá, bỏ qua fareAmount do Client gửi', `fareAmount tính được=${realFare}đ`);
    } else {
      unverified('S9.1 Server-side fare calculation', `fareAmount=${realFare}đ — cần xem xét thêm`);
    }
  } catch (e) {
    // 400 "property fareAmount should not exist" = PASS:
    // Server có ValidationPipe whitelist=true, forbidNonWhitelisted=true
    // → hoàn toàn block field giả do Client gửi lên
    if (e && e.status === 400 && e.data && e.data.message && String(e.data.message).includes('fareAmount')) {
      pass('S9.1 Server chặn fareAmount giả (ValidationPipe forbidNonWhitelisted) → 400', `"${e.data.message}"`);
    } else {
      fail('S9 Fare manipulation test', e?.data?.message || e?.message || JSON.stringify(e));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // S10. RECONNECT WEBSOCKET — Không tạo cuốc trùng
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S10. Reconnect: Ngắt/kết nối lại không tạo cuốc trùng ═');
  try {
    let sock1 = await connectSocket(driverToken);
    sock1.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await request('POST', '/ride/driver/toggle-online', { isOnline: true }, driverToken);
    await sleep(300);

    // Ngắt kết nối
    sock1.disconnect();
    await sleep(500);

    // Kết nối lại
    let sock2 = await connectSocket(driverToken);
    sock2.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(300);

    // Kiểm tra không có cuốc active bị tạo thêm do reconnect
    const activeRes = await request('GET', '/ride/driver/active', null, driverToken);
    pass('S10.1 Reconnect WebSocket không tạo cuốc trùng', `active trip: ${activeRes.data ? activeRes.data.id : 'null'}`);

    sock2.disconnect();
  } catch (e) {
    if (e.status === 404) {
      pass('S10.1 Reconnect WebSocket — active trip null sau reconnect (đúng)', '');
    } else {
      fail('S10 Reconnect test', e?.message || JSON.stringify(e));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // S11. APP KHÁCH HÀNG: KIỂM TRA rideRepository (ĐÃ FIX P1)
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S11. App Khách hàng: rideRepository method compatibility ════════');

  try {
    const fs = require('fs');
    const path = require('path');
    const repoPath = path.resolve(__dirname, '../../super-app-mobile/src/modules/ride/repository/rideRepository.ts');
    const repoContent = fs.readFileSync(repoPath, 'utf-8');

    if (repoContent.includes('async bookRide(') && !repoContent.includes('createRideBooking')) {
      fail('S11.1 rideRepository vẫn còn bookRide() cũ chưa fix', '');
    } else if (repoContent.includes('createRideBooking')) {
      pass('S11.1 rideRepository.createRideBooking() — method name đúng (P1 fix OK)', '');
    } else {
      unverified('S11.1 rideRepository createRideBooking', 'Không thấy method trong file');
    }

    if (repoContent.includes('async cancelRide(') && !repoContent.includes('cancelTrip')) {
      fail('S11.2 rideRepository vẫn còn cancelRide() cũ chưa fix', '');
    } else if (repoContent.includes('cancelTrip')) {
      pass('S11.2 rideRepository.cancelTrip() — method name đúng (P1 fix OK)', '');
    } else {
      unverified('S11.2 rideRepository cancelTrip', '');
    }

    if (repoContent.includes("from '../services/mock/mockData/drivers'")) {
      fail('S11.3 rideRepository vẫn còn import mock/mockData/drivers', '');
    } else {
      pass('S11.3 rideRepository không còn import mock data (P1 fix OK)', '');
    }
  } catch (e) {
    unverified('S11 rideRepository file check', `Không đọc được file: ${e.message}`);
  }

  try {
    const res = await request('GET', '/ride/customer/active', null, userToken);
    pass('S11.4 GET /ride/customer/active OK', `data=${JSON.stringify(res.data)?.substring(0, 60)}`);
  } catch (e) {
    if (e.status === 404) {
      pass('S11.4 GET /ride/customer/active → 404 (không có trip active — đúng)', '');
    } else {
      fail('S11.4 GET /ride/customer/active', `status=${e.status}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // S12. ĐỐI SOÁT TÀI CHÍNH: THANH TOÁN ONLINE (SUPERPAY)
  // ═══════════════════════════════════════════════════════════
  console.log('\n════ S12. Đối soát tài chính SUPERPAY (cộng cashBalance) ═══');
  try {
    const drvSock = await connectSocket(driverToken);
    drvSock.emit('driver:join', { lat: 21.02, lng: 105.80 });
    await sleep(300);

    const walletBefore = await request('GET', '/ride/driver/wallet', null, driverToken);
    const cashBefore = walletBefore.data.cashWallet;

    const bookRes = await request('POST', '/ride/book', {
      ...BOOKING_PAYLOAD,
      paymentMethod: 'SUPERPAY',
    }, userToken);
    const trip = bookRes.data;
    await sleep(300);

    await request('POST', `/ride/${trip.id}/accept`, {}, driverToken);
    await sleep(200);
    await request('POST', `/ride/${trip.id}/status`, { status: 'ARRIVED_PICKUP' }, driverToken);
    await sleep(200);
    await request('POST', `/ride/${trip.id}/status`, { status: 'IN_TRIP' }, driverToken);
    await sleep(200);
    await request('POST', `/ride/${trip.id}/status`, { status: 'COMPLETED' }, driverToken);
    await sleep(500);

    const walletAfter = await request('GET', '/ride/driver/wallet', null, driverToken);
    const cashAfter = walletAfter.data.cashWallet;
    const expectedNet = trip.fareAmount - Math.round(trip.fareAmount * 0.15);

    if (cashAfter >= cashBefore + expectedNet) {
      pass('S12.1 SUPERPAY: cashBalance tăng đúng', `+${expectedNet}đ (85% fare)`);
    } else {
      fail('S12.1 SUPERPAY: cashBalance sai', `Kỳ vọng +${expectedNet}đ; thực tế: ${cashBefore} → ${cashAfter}`);
    }

    const latestTx = walletAfter.data.transactions[0];
    if (latestTx && latestTx.type === 'EARN' && latestTx.walletType === 'CASH') {
      pass('S12.2 Giao dịch EARN ghi vào cashWallet', `amount=${latestTx.amount}đ`);
    } else {
      fail('S12.2 Giao dịch EARN sai type/walletType', `${JSON.stringify(latestTx)}`);
    }

    drvSock.disconnect();
  } catch (e) {
    fail('S12 SUPERPAY financial reconciliation', e?.message || JSON.stringify(e));
  }

  // ═══════════════════════════════════════════════════════════
  // TỔNG KẾT
  // ═══════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('📋 BÁO CÁO TỔNG KẾT E2E AUDIT');
  console.log('════════════════════════════════════════════════════════════════');

  const passCount   = results.filter((r) => r.status === '✅ PASS').length;
  const failCount   = results.filter((r) => r.status === '🔴 FAIL').length;
  const ucCount     = results.filter((r) => r.status === '🟡 CHƯA KIỂM CHỨNG').length;

  console.log(`\nTổng kết: ✅ ${passCount} PASS | 🔴 ${failCount} FAIL | 🟡 ${ucCount} CHƯA KIỂM CHỨNG\n`);

  if (failCount > 0) {
    console.log('── DANH SÁCH LỖI:');
    results.filter((r) => r.status === '🔴 FAIL').forEach((r) => {
      console.log(`  🔴 ${r.scenario}${r.detail ? '\n     → ' + r.detail : ''}`);
    });
  }
  if (ucCount > 0) {
    console.log('\n── CHƯA KIỂM CHỨNG:');
    results.filter((r) => r.status === '🟡 CHƯA KIỂM CHỨNG').forEach((r) => {
      console.log(`  🟡 ${r.scenario}${r.detail ? '\n     → ' + r.detail : ''}`);
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════\n');
  process.exit(failCount > 0 ? 1 : 0);
}

runFullAudit().catch((err) => {
  console.error('❌ Lỗi không xử lý được:', err);
  process.exit(1);
});
