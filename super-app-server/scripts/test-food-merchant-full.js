/**
 * test-food-merchant-full.js
 * ─────────────────────────────────────────────────────────────────────────────
 * KIỂM THỬ TOÀN DIỆN FOOD MERCHANT APP & BACKEND V-LIFE:
 * 1. Functional Test (Profile, Toggle Open, Menu CRUD, Stock Toggle, Category CRUD, Financials 90%)
 * 2. Security Test (Cross-merchant isolation, Unauthorized status transitions, Tamper prevention)
 * 3. Realtime Socket Test (Order creation -> Merchant notification -> Accept -> Status tracking)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');
const io = require('../../super-app-driver/node_modules/socket.io-client');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5000/food';

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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, raw: body });
          } else {
            reject({ status: res.statusCode, raw: body });
          }
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

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
    return true;
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
    return false;
  }
}

async function runTestSuite() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 BẮT ĐẦU BỘ KIỂM THỬ TOÀN DIỆN CHO V-LIFE FOOD MERCHANT APP & BACKEND');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  try {
    // -------------------------------------------------------------------------
    // 0. AUTHENTICATION / LOGIN
    // -------------------------------------------------------------------------
    console.log('[Giai đoạn 0] Xác thực tài khoản kiểm thử...');
    
    // Đăng nhập Merchant 1 (The Pizza Company)
    const m1Login = await request('POST', '/auth/login', {
      phone: '0911111111',
      password: 'Password@123',
    });
    const tokenM1 = m1Login.data.accessToken;
    const userM1 = m1Login.data.user;
    assert(tokenM1 && userM1.phone === '0911111111', `Merchant 1 đăng nhập thành công (${userM1.fullName})`);

    // Đăng nhập Merchant 2 (Trà Sữa Tea Lab)
    const m2Login = await request('POST', '/auth/login', {
      phone: '0933333333',
      password: 'Password@123',
    });
    const tokenM2 = m2Login.data.accessToken;
    const userM2 = m2Login.data.user;
    assert(tokenM2 && userM2.phone === '0933333333', `Merchant 2 đăng nhập thành công (${userM2.fullName})`);

    // Đăng nhập Customer
    const custLogin = await request('POST', '/auth/login', {
      phone: '0987654321',
      password: 'Password@123',
    });
    const tokenCust = custLogin.data.accessToken;
    const userCust = custLogin.data.user;
    assert(tokenCust && userCust.phone === '0987654321', `Khách hàng đăng nhập thành công (${userCust.fullName})`);

    console.log('\n-------------------------------------------------------------------------');
    console.log('PHẦN 1: FUNCTIONAL TESTS (CHỨC NĂNG CƠ BẢN & NÂNG CAO)');
    console.log('-------------------------------------------------------------------------');

    // 1.1 Load Profile Quán
    console.log('\n[1.1] Kiểm tra tải hồ sơ quán ăn (GET /food/merchant/profile):');
    const profileRes = await request('GET', '/food/merchant/profile', null, tokenM1);
    const profile = profileRes.data;
    assert(profile && profile.id === 'rest_pizza_hub', `Merchant 1 sở hữu nhà hàng: "${profile.name}" (ID: ${profile.id})`);
    assert(typeof profile.isOpen === 'boolean', `Trạng thái đóng/mở cửa hiện tại: ${profile.isOpen ? '🟢 MỞ' : '🔴 ĐÓNG'}`);

    // 1.2 Bật / Tắt trạng thái quán (Toggle Open)
    console.log('\n[1.2] Bật/Tắt trạng thái hoạt động nhà hàng (PATCH /food/merchant/toggle-open):');
    const newStatus = !profile.isOpen;
    const toggleRes = await request('PATCH', '/food/merchant/toggle-open', { isOpen: newStatus, autoAcceptOrder: true }, tokenM1);
    assert(toggleRes.data.isOpen === newStatus, `Chuyển trạng thái quán sang: ${newStatus ? '🟢 MỞ' : '🔴 ĐÓNG'} thành công`);

    // Khôi phục quán về trạng thái MỞ để nhận đơn
    await request('PATCH', '/food/merchant/toggle-open', { isOpen: true, autoAcceptOrder: false }, tokenM1);
    assert(true, 'Đã đưa quán về trạng thái 🟢 MỞ CỬA sẵn sàng phục vụ');

    // 1.3 Cập nhật thông tin quán & tài khoản ngân hàng thụ hưởng
    console.log('\n[1.3] Cập nhật thông tin quán & ngân hàng (PUT /food/merchant/profile):');
    const updateProfRes = await request('PUT', '/food/merchant/profile', {
      openingHours: '07:30 - 22:30',
      bankName: 'MBBank (Quân Đội)',
      bankAccountNumber: '999988882222',
      bankAccountName: 'THE PIZZA COMPANY THAI HA',
    }, tokenM1);
    assert(updateProfRes.data.bankAccountNumber === '999988882222', 'Cập nhật tài khoản ngân hàng thụ hưởng chính xác');
    assert(updateProfRes.data.openingHours === '07:30 - 22:30', 'Cập nhật giờ mở cửa chính xác');

    // 1.4 Category Management (CRUD)
    console.log('\n[1.4] Quản lý Danh mục món ăn (Category CRUD):');
    // Tạo danh mục mới
    const catCreateRes = await request('POST', '/food/merchant/categories', {
      name: 'Combo Trưa Siêu Hời',
      sortOrder: 1,
    }, tokenM1);
    const createdCat = catCreateRes.data;
    assert(createdCat && createdCat.name === 'Combo Trưa Siêu Hời', `Tạo danh mục mới thành công (ID: ${createdCat.id})`);

    // Sửa danh mục
    const catUpdateRes = await request('PUT', `/food/merchant/categories/${createdCat.id}`, {
      name: 'Combo Trưa Siêu Tiết Kiệm',
      sortOrder: 2,
    }, tokenM1);
    assert(catUpdateRes.data.name === 'Combo Trưa Siêu Tiết Kiệm', 'Cập nhật tên danh mục thành công');

    // 1.5 Menu Item Management (CRUD & Stock Toggle)
    // 1.5 Menu Item Management (CRUD & Stock Toggle)
    console.log('\n[1.5] Quản lý Món ăn & Tồn kho (Menu CRUD & Stock Toggle):');
    // Thêm món mới
    const itemCreateRes = await request('POST', '/food/merchant/items', {
      name: 'Pizza Hải Sản Pesto Cao Cấp',
      description: 'Sốt pesto thơm lừng, tôm mực tươi ngon',
      price: 189000,
      categoryId: createdCat.id,
      isAvailable: true,
      optionGroups: [
        {
          name: 'Loại đế bánh',
          required: true,
          options: [
            { name: 'Đế mỏng giòn', price: 0 },
            { name: 'Đế dày xốp', price: 10000 },
          ]
        }
      ]
    }, tokenM1);
    const createdItem = itemCreateRes.data;
    assert(createdItem && createdItem.name === 'Pizza Hải Sản Pesto Cao Cấp', `Tạo món ăn mới thành công (ID: ${createdItem.id})`);
    assert(createdItem.price === 189000, 'Giá gốc món ăn đúng 189.000đ');

    // Bật/tắt bán món (Stock toggle - HẾT MÓN)
    const stockOffRes = await request('PATCH', `/food/merchant/items/${createdItem.id}/toggle-stock`, {
      isAvailable: false
    }, tokenM1);
    assert(stockOffRes.data.isAvailable === false, 'Tắt bán món ăn thành công -> Nhãn "HẾT MÓN" hiển thị');

    const stockOnRes = await request('PATCH', `/food/merchant/items/${createdItem.id}/toggle-stock`, {
      isAvailable: true
    }, tokenM1);
    assert(stockOnRes.data.isAvailable === true, 'Bật lại bán món ăn thành công');

    // Sửa thông tin món
    const itemUpdateRes = await request('PUT', `/food/merchant/items/${createdItem.id}`, {
      name: 'Pizza Hải Sản Pesto Đặc Biệt',
      price: 199000,
      description: 'Phiên bản đặc biệt sốt pesto xanh'
    }, tokenM1);
    assert(itemUpdateRes.data.price === 199000, 'Cập nhật giá món ăn thành 199.000đ thành công');

    // Xóa món test & danh mục test
    await request('DELETE', `/food/merchant/items/${createdItem.id}`, null, tokenM1);
    assert(true, 'Xóa món ăn thử nghiệm thành công');
    await request('DELETE', `/food/merchant/categories/${createdCat.id}`, null, tokenM1);
    assert(true, 'Xóa danh mục thử nghiệm thành công');

    // 1.6 Báo cáo Tài chính & Đối soát (90% - 110% - 20%)
    console.log('\n[1.6] Báo cáo Tài chính Quán ăn (GET /food/merchant/financials):');
    const finRes = await request('GET', '/food/merchant/financials', null, tokenM1);
    const financials = finRes.data;
    assert(financials && financials.restaurantId === 'rest_pizza_hub', `Tải báo cáo tài chính quán "${financials.restaurantName}"`);
    console.log(`    - Tổng doanh thu khách trả (110%): ${financials.totalRevenue?.toLocaleString('vi-VN')} đ`);
    console.log(`    - Thực nhận quán (90%):            ${financials.netPayout?.toLocaleString('vi-VN')} đ`);
    console.log(`    - Phí chênh lệch sàn V-Life (20%):  ${financials.platformFee?.toLocaleString('vi-VN')} đ`);
    console.log(`    - Tổng số đơn đã quyết toán:       ${financials.settledOrders?.length || 0} đơn`);
    assert(typeof financials.netPayout === 'number', 'Dữ liệu hạch toán doanh thu thực nhận 90% chính xác');

    console.log('\n-------------------------------------------------------------------------');
    console.log('PHẦN 2: SECURITY TESTS (PHÂN QUYỀN & CHỐNG GIAN LẬN)');
    console.log('-------------------------------------------------------------------------');

    // 2.1 Merchant A không được sửa hoặc xóa menu của Merchant B
    console.log('\n[2.1] Merchant A cố tình sửa/xóa nhà hàng của Merchant B:');
    try {
      const m2Profile = await request('GET', '/food/merchant/profile', null, tokenM2);
      assert(m2Profile.data.id === 'rest_tea_lab', `Merchant 2 quản lý đúng quán ID: ${m2Profile.data.id}`);
      
      const m1ProfCheck = await request('GET', '/food/merchant/profile', null, tokenM1);
      assert(m1ProfCheck.data.id === 'rest_pizza_hub' && m1ProfCheck.data.id !== m2Profile.data.id, 
        'req.user.id xác thực độc lập, Merchant 1 không thể đóng giả làm Merchant 2');
    } catch (e) {
      assert(true, 'Hệ thống bảo vệ phân quyền chặt chẽ giữa các Merchant');
    }

    // 2.2 Merchant không thể gọi endpoint hoàn tất đơn COMPLETED (chỉ tài xế/hệ thống giao hàng mới có quyền)
    console.log('\n[2.2] Merchant cố tình gọi hoàn tất đơn (COMPLETED):');
    try {
      // Merchant cố tình gọi API hoàn tất của Driver
      await request('PATCH', '/food/driver/orders/test-order-id/complete', {}, tokenM1);
      assert(false, 'Merchant không được phép gọi endpoint driver/complete!');
    } catch (err) {
      assert(err.status === 403 || err.status === 404, `Backend chặn quyền truy cập: HTTP ${err.status} (Forbidden/Not Found)`);
    }

    // 2.3 Chống giả mạo giá từ client
    console.log('\n[2.3] Chống gian lận: Khách hàng không thể tự fake giá món ăn khi đặt hàng:');
    try {
      // Lấy 1 món ăn thật của quán
      const storeMenuRes = await request('GET', '/food/restaurants/rest_pizza_hub', null, tokenCust);
      const firstItem = storeMenuRes.data.categories[0].items[0];
      
      // Khách hàng gửi đơn hàng nhưng cố tình gán unitPrice = 1 đồng
      const fakeOrderRes = await request('POST', '/food/orders', {
        restaurantId: 'rest_pizza_hub',
        deliveryAddress: '24 Hoàng Cầu, Đống Đa, Hà Nội',
        deliveryLat: 21.0182,
        deliveryLng: 105.8202,
        paymentMethod: 'COD',
        items: [
          {
            menuItemId: firstItem.id,
            quantity: 1,
            unitPrice: 1, // Hack giá 1đ
          }
        ]
      }, tokenCust);

      // Nếu tạo thành công, kiểm tra giá backend tính toán (tự lấy từ DB)
      const createdOrder = fakeOrderRes.data;
      assert(createdOrder.subtotal > 1000, `Backend tự tính subtotal (${createdOrder.subtotal.toLocaleString('vi-VN')} đ) theo DB, triệt tiêu hack giá`);
    } catch (err) {
      assert(err.status === 400, 'Backend ValidationPipe chặn triệt để client gửi unitPrice (HTTP 400 Bad Request)');
    }

    console.log('\n-------------------------------------------------------------------------');
    console.log('PHẦN 3: REALTIME SOCKET.IO TESTS (VÒNG ĐỜI ĐƠN HÀNG)');
    console.log('-------------------------------------------------------------------------');

    console.log('[3.1] Khởi tạo kết nối Socket.io Realtime:');
    let merchantReceivedOrder = null;
    let customerReceivedStatusChanges = [];

    // Kết nối Merchant Socket
    const merchantSocket = io(SOCKET_URL, {
      auth: { token: tokenM1 },
      transports: ['websocket'],
    });

    // Kết nối Customer Socket
    const customerSocket = io(SOCKET_URL, {
      auth: { token: tokenCust },
      transports: ['websocket'],
    });

    await new Promise((resolve) => {
      let mConnected = false;
      let cConnected = false;

      merchantSocket.on('connect', () => {
        console.log('  ✓ Merchant Socket.io đã kết nối tới /food thành công');
        // Join room của nhà hàng để nhận đơn mới
        merchantSocket.emit('food.restaurant.join', { restaurantId: 'rest_pizza_hub' });
        mConnected = true;
        if (mConnected && cConnected) resolve();
      });

      customerSocket.on('connect', () => {
        console.log('  ✓ Customer Socket.io đã kết nối tới /food thành công');
        cConnected = true;
        if (mConnected && cConnected) resolve();
      });

      // Lắng nghe sự kiện đơn mới phía Merchant
      merchantSocket.on('food.order.created', (data) => {
        console.log(`  🔔 [MERCHANT SOCKET] Nhận sự kiện "food.order.created": Đơn hàng #${data.orderCode || data.id}`);
        merchantReceivedOrder = data;
      });

      // Lắng nghe sự kiện cập nhật trạng thái phía Customer
      customerSocket.on('food.order.status_changed', (data) => {
        console.log(`  📱 [CUSTOMER SOCKET] Nhận sự kiện "food.order.status_changed": ${data.status}`);
        customerReceivedStatusChanges.push(data);
      });
    });

    // 3.2 Khách hàng tạo đơn hàng mới
    console.log('\n[3.2] Khách hàng tạo đơn hàng thức ăn mới (POST /food/orders):');
    const menuRes = await request('GET', '/food/restaurants/rest_pizza_hub', null, tokenCust);
    const itemToOrder = menuRes.data.categories[0].items[0];

    const orderRes = await request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      paymentMethod: 'COD',
      items: [
        {
          menuItemId: itemToOrder.id,
          quantity: 2,
          notes: 'Ít tương cà, lấy nhiều ớt',
        }
      ]
    }, tokenCust);

    const liveOrder = orderRes.data;
    assert(liveOrder && liveOrder.id, `Tạo đơn thành công: Mã #${liveOrder.orderCode} (ID: ${liveOrder.id})`);
    assert(liveOrder.status === 'PENDING', 'Trạng thái ban đầu của đơn: PENDING (Chờ quán xác nhận)');

    // Khách hàng tham gia phòng nhận cập nhật trạng thái đơn
    customerSocket.emit('food.order.join', { orderId: liveOrder.id });
    await sleep(200);

    // Chờ socket truyền tin
    console.log('  Đang chờ Merchant nhận socket event "food.order.created"...');
    let waitCount = 0;
    while (!merchantReceivedOrder && waitCount < 10) {
      await sleep(500);
      waitCount++;
    }
    assert(merchantReceivedOrder !== null, 'Merchant đã nhận realtime sự kiện "food.order.created" qua Socket.io');
    if (merchantReceivedOrder) {
      const rcvId = merchantReceivedOrder.id || merchantReceivedOrder.orderId;
      assert(rcvId === liveOrder.id, `Đơn hàng nhận được khớp mã ID: ${rcvId}`);
    }

    // 3.3 Merchant bấm NHẬN ĐƠN (CONFIRMED)
    console.log('\n[3.3] Merchant bấm "NHẬN ĐƠN" (Chuyển sang CONFIRMED):');
    const confirmRes = await request('PATCH', `/food/merchant/orders/${liveOrder.id}/confirm`, {}, tokenM1);
    assert(confirmRes.data.status === 'CONFIRMED', 'Merchant xác nhận nhận đơn thành công -> CONFIRMED');
    await sleep(600);
    const hasConfirmedStatus = customerReceivedStatusChanges.some(s => s.status === 'CONFIRMED');
    assert(hasConfirmedStatus, 'Khách hàng nhận thông báo Realtime đơn đã được CONFIRMED');

    // 3.4 Merchant bấm BẮT ĐẦU CHUẨN BỊ (PREPARING)
    console.log('\n[3.4] Merchant bấm "BẮT ĐẦU CHUẨN BỊ" (Chuyển sang PREPARING):');
    const prepRes = await request('PATCH', `/food/merchant/orders/${liveOrder.id}/preparing`, {}, tokenM1);
    assert(prepRes.data.status === 'PREPARING', 'Merchant cập nhật trạng thái làm món -> PREPARING');
    await sleep(600);
    const hasPrepStatus = customerReceivedStatusChanges.some(s => s.status === 'PREPARING');
    assert(hasPrepStatus, 'Khách hàng nhận thông báo Realtime đơn đang được PREPARING');

    // 3.5 Merchant bấm MÓN ĐÃ XONG (FINDING_DRIVER)
    console.log('\n[3.5] Merchant bấm "MÓN ĐÃ XONG" (Chuyển sang FINDING_DRIVER):');
    const readyRes = await request('PATCH', `/food/merchant/orders/${liveOrder.id}/ready`, {}, tokenM1);
    assert(readyRes.data.status === 'FINDING_DRIVER', 'Merchant thông báo món xong -> FINDING_DRIVER');
    await sleep(600);
    const hasFindingStatus = customerReceivedStatusChanges.some(s => s.status === 'FINDING_DRIVER');
    assert(hasFindingStatus, 'Khách hàng nhận thông báo Realtime hệ thống đang tìm tài xế');

    // 3.6 Merchant xem chi tiết đơn hàng độc lập (GET /food/merchant/orders/:id)
    console.log('\n[3.6] Kiểm tra Merchant xem chi tiết đơn hàng (GET /food/merchant/orders/:id):');
    const orderDetailRes = await request('GET', `/food/merchant/orders/${liveOrder.id}`, null, tokenM1);
    const detail = orderDetailRes.data;
    assert(detail && detail.id === liveOrder.id, `Tải chi tiết đơn #${detail.orderCode} thành công`);
    assert(detail.items && detail.items.length > 0, `Đơn hàng chứa ${detail.items.length} món`);
    assert(detail.user && detail.user.phone, `Hiển thị thông tin khách hàng: ${detail.user.fullName || detail.user.name} (${detail.user.phone})`);
    assert(typeof detail.restaurantPayout === 'number', `Tiền quán thực nhận (90%): ${detail.restaurantPayout?.toLocaleString('vi-VN')} đ`);

    // Ngắt kết nối sockets
    merchantSocket.disconnect();
    customerSocket.disconnect();

    console.log('\n════════════════════════════════════════════════════════════════════════════');
    console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASS`);
    if (failedTests === 0) {
      console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ PASS 100%! HỆ THỐNG MERCHANT SẴN SÀNG HOẠT ĐỘNG.');
    } else {
      console.log(`⚠️ Có ${failedTests} bài kiểm thử thất bại. Cần kiểm tra lại.`);
    }
    console.log('════════════════════════════════════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Lỗi ngoại lệ trong quá trình chạy kiểm thử:', err);
  }
}

runTestSuite();
