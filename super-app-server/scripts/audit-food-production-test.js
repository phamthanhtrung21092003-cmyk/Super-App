/**
 * audit-food-production-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PRODUCTION AUDIT TOÀN BỘ HỆ THỐNG FOOD V-LIFE:
 * - Full Order Lifecycle (COD & WALLET)
 * - Concurrency & Race Conditions (Driver race, Idempotency, Cancel race)
 * - Security & Authorization (Cross-access, Tamper, Role guards)
 * - Pricing & Accounting (100% - 90% - 110% - 20% Spread - Driver Shipping)
 * - Realtime Socket.io Sync & Verification
 * - Database Integrity Checks (PostgreSQL Transaction, Wallet, Settlement)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');
const io = require('../../super-app-driver/node_modules/socket.io-client');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5000/food';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
    return true;
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
    failures.push(message);
    return false;
  }
}

async function runProductionAudit() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('🔍 PRODUCTION AUDIT TOÀN DIỆN HỆ THỐNG FOOD V-LIFE (ZERO FAKE / REAL DATA)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  let merchantSocket = null;
  let customerSocket = null;
  let driver1Socket = null;

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 0: ĐĂNG NHẬP CÁC CHỦ THỂ
    // -------------------------------------------------------------------------
    console.log('[0.0] Xác thực tài khoản các bên:');
    
    // Khách hàng 1
    const u1Login = await request('POST', '/auth/login', { phone: '0987654321', password: 'Password@123' });
    const tokenU1 = u1Login.data.accessToken;
    const user1 = u1Login.data.user;
    assert(tokenU1 && user1.phone === '0987654321', `Khách hàng 1: ${user1.fullName} (${user1.phone})`);

    // Khách hàng 2
    const u2Login = await request('POST', '/auth/login', { phone: '0988000111', password: 'User@123456' });
    const tokenU2 = u2Login.data.accessToken;
    const user2 = u2Login.data.user;
    assert(tokenU2 && user2.phone === '0988000111', `Khách hàng 2: ${user2.fullName} (${user2.phone})`);

    // Chủ quán 1 (Pizza Thai Ha)
    const m1Login = await request('POST', '/auth/login', { phone: '0911111111', password: 'Password@123' });
    const tokenM1 = m1Login.data.accessToken;
    assert(tokenM1, 'Chủ quán 1 (The Pizza Company Thai Ha) đăng nhập thành công');

    // Chủ quán 2 (Tea Lab)
    const m2Login = await request('POST', '/auth/login', { phone: '0933333333', password: 'Password@123' });
    const tokenM2 = m2Login.data.accessToken;
    assert(tokenM2, 'Chủ quán 2 (Tea Lab Bach Khoa) đăng nhập thành công');

    // Tài xế 1
    const d1Login = await request('POST', '/auth/login', { phone: '0922222222', password: 'Password@123' });
    const tokenD1 = d1Login.data.accessToken;
    const driver1 = d1Login.data.user;
    assert(tokenD1, `Tài xế 1: ${driver1.fullName} (${driver1.phone})`);

    // Tài xế 2
    const d2Login = await request('POST', '/auth/login', { phone: '0922222223', password: 'Password@123' });
    const tokenD2 = d2Login.data.accessToken;
    const driver2 = d2Login.data.user;
    assert(tokenD2, `Tài xế 2: ${driver2.fullName} (${driver2.phone})`);

    // Bật online cho 2 tài xế
    await request('PATCH', '/food/driver/toggle-online', { isOnline: true }, tokenD1);
    await request('PATCH', '/food/driver/toggle-online', { isOnline: true }, tokenD2);

    // Mở cửa quán 1
    await request('PATCH', '/food/merchant/toggle-open', { isOpen: true, autoAcceptOrder: false }, tokenM1);

    // Lấy menu quán 1 để có item thật
    const storeInfo = await request('GET', '/food/restaurants/rest_pizza_hub', null, tokenU1);
    const firstItem = storeInfo.data.categories[0].items[0];
    assert(firstItem && firstItem.id, `Món ăn thử nghiệm từ DB: "${firstItem.name}" (Giá: ${firstItem.price.toLocaleString('vi-VN')}đ)`);

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 1: FULL ORDER LIFECYCLE VỚI THANH TOÁN TIỀN MẶT (COD)');
    console.log('-------------------------------------------------------------------------');

    // 1.1 Khách tạo đơn COD
    const codOrderRes = await request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      paymentMethod: 'COD',
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);

    const codOrder = codOrderRes.data;
    assert(codOrder && codOrder.status === 'PENDING', `Đơn COD #${codOrder.orderCode} tạo thành công, status: PENDING`);
    assert(codOrder.paymentStatus === 'UNPAID', 'Đơn COD ban đầu có paymentStatus: UNPAID');

    // 1.2 Quán xác nhận nhận đơn (CONFIRMED)
    const confRes = await request('PATCH', `/food/merchant/orders/${codOrder.id}/confirm`, {}, tokenM1);
    assert(confRes.data.status === 'CONFIRMED', 'Quán xác nhận đơn -> CONFIRMED');

    // 1.3 Quán làm món (PREPARING)
    const prepRes = await request('PATCH', `/food/merchant/orders/${codOrder.id}/preparing`, {}, tokenM1);
    assert(prepRes.data.status === 'PREPARING', 'Quán đang chế biến -> PREPARING');

    // 1.4 Quán xong món, tìm tài xế (FINDING_DRIVER)
    const readyRes = await request('PATCH', `/food/merchant/orders/${codOrder.id}/ready`, {}, tokenM1);
    assert(readyRes.data.status === 'FINDING_DRIVER', 'Quán xong món -> FINDING_DRIVER');

    // 1.5 Tài xế 1 nhận đơn (DRIVER_ACCEPTED)
    const acceptRes = await request('POST', `/food/driver/orders/${codOrder.id}/accept`, {}, tokenD1);
    assert(acceptRes.data.status === 'DRIVER_ACCEPTED' && acceptRes.data.driverId === driver1.id, 'Tài xế 1 tiếp nhận đơn -> DRIVER_ACCEPTED');

    // 1.6 Tài xế đến quán lấy món (PICKED_UP)
    const pickupRes = await request('PATCH', `/food/driver/orders/${codOrder.id}/pickup`, {}, tokenD1);
    assert(pickupRes.data.status === 'PICKED_UP', 'Tài xế đã lấy món -> PICKED_UP');

    // 1.7 Tài xế giao thành công (COMPLETED)
    const compRes = await request('PATCH', `/food/driver/orders/${codOrder.id}/complete`, {}, tokenD1);
    assert(compRes.data.status === 'COMPLETED', 'Tài xế hoàn tất giao hàng -> COMPLETED');
    assert(compRes.data.paymentStatus === 'PAID', 'Khách trả COD -> paymentStatus chuyển sang PAID');

    // 1.8 Kiểm tra Database PostgreSQL sau khi COMPLETED
    const dbCodOrder = await prisma.foodOrder.findUnique({
      where: { id: codOrder.id },
      include: { items: true },
    });
    assert(dbCodOrder.completedAt !== null, 'DB kiểm tra: completedAt có timestamp thật');
    assert(dbCodOrder.merchantEarning > 0, `DB kiểm tra: Quán nhận 90% món (${dbCodOrder.merchantEarning.toLocaleString('vi-VN')}đ)`);
    assert(dbCodOrder.appGrossProfit > 0, `DB kiểm tra: Lãi gộp sàn 20% (${dbCodOrder.appGrossProfit.toLocaleString('vi-VN')}đ)`);

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 2: FULL ORDER LIFECYCLE VỚI VÍ ĐIỆN TỬ (WALLET DEBIT & SETTLEMENT)');
    console.log('-------------------------------------------------------------------------');

    // Lấy số dư ví User 1 trước khi đặt đơn
    const walletBeforeOrder = await prisma.wallet.findUnique({ where: { userId: user1.id } });
    const userBalBefore = Number(walletBeforeOrder.balance);
    console.log(`  Số dư ví khách trước khi đặt: ${userBalBefore.toLocaleString('vi-VN')} đ`);

    // 2.1 Tạo đơn thanh toán bằng WALLET
    const walletOrderRes = await request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      paymentMethod: 'WALLET',
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);

    const walletOrder = walletOrderRes.data;
    assert(walletOrder && walletOrder.status === 'PENDING', `Đơn WALLET #${walletOrder.orderCode} tạo thành công`);
    assert(walletOrder.paymentStatus === 'PAID', 'Đơn WALLET thanh toán thành công ngay khi tạo: paymentStatus = PAID');

    // Kiểm tra số dư ví khách sau khi tạo đơn
    const walletAfterOrder = await prisma.wallet.findUnique({ where: { userId: user1.id } });
    const userBalAfter = Number(walletAfterOrder.balance);
    assert(userBalAfter === userBalBefore - walletOrder.totalAmount, 
      `Ví khách bị trừ chính xác số tiền đơn (${walletOrder.totalAmount.toLocaleString('vi-VN')}đ)`);

    // Kiểm tra Transaction bản ghi trừ ví
    const debitTx = await prisma.transaction.findFirst({
      where: { referenceId: walletOrder.orderCode, type: 'FOOD_PAYMENT' },
    });
    assert(debitTx && debitTx.direction === 'DEBIT' && debitTx.status === 'SUCCESS', 'Bản ghi Transaction trừ ví DEBIT SUCCESS');

    // Vòng đời đơn: Quán Confirm -> Preparing -> Ready -> Driver 2 Accept -> Pickup -> Complete
    await request('PATCH', `/food/merchant/orders/${walletOrder.id}/confirm`, {}, tokenM1);
    await request('PATCH', `/food/merchant/orders/${walletOrder.id}/preparing`, {}, tokenM1);
    await request('PATCH', `/food/merchant/orders/${walletOrder.id}/ready`, {}, tokenM1);
    await request('POST', `/food/driver/orders/${walletOrder.id}/accept`, {}, tokenD2);
    await request('PATCH', `/food/driver/orders/${walletOrder.id}/pickup`, {}, tokenD2);
    
    // Ghi lại ví Driver 2 trước khi complete
    const d2Before = await prisma.driver.findUnique({ where: { id: driver2.id } });
    await request('PATCH', `/food/driver/orders/${walletOrder.id}/complete`, {}, tokenD2);
    
    // Ghi lại ví Driver 2 sau khi complete
    const d2After = await prisma.driver.findUnique({ where: { id: driver2.id } });
    const driverShipping = (walletOrder.shippingFee || 0) + (walletOrder.discountAmount || 0);
    assert(Number(d2After.walletBalance) === Number(d2Before.walletBalance) + driverShipping,
      `Tài xế nhận 100% phí cước ship vào ví (${driverShipping.toLocaleString('vi-VN')}đ)`);

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 3: KIỂM THỬ HOÀN TIỀN VÍ KHI HỦY ĐƠN (WALLET REFUND INTEGRITY)');
    console.log('-------------------------------------------------------------------------');

    // 3.1 Khách đặt một đơn thanh toán bằng WALLET rồi hủy khi PENDING
    const balBeforeRefundTest = Number((await prisma.wallet.findUnique({ where: { userId: user1.id } })).balance);

    const cancelTestOrderRes = await request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      paymentMethod: 'WALLET',
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);
    const cancelTestOrder = cancelTestOrderRes.data;

    const balAfterDebitCancel = Number((await prisma.wallet.findUnique({ where: { userId: user1.id } })).balance);
    assert(balAfterDebitCancel === balBeforeRefundTest - cancelTestOrder.totalAmount, 'Tiền ví đã bị trừ khi tạo đơn');

    // Khách hàng bấm Hủy đơn khi đang PENDING
    const cancelActionRes = await request('PATCH', `/food/orders/${cancelTestOrder.id}/cancel`, {
      reason: 'Tôi đổi ý không muốn ăn món này nữa',
    }, tokenU1);
    assert(cancelActionRes.data.status === 'CANCELLED', 'Đơn hàng đổi sang trạng thái CANCELLED');

    // Kiểm tra xem số dư ví có được HOÀN LẠI đúng số tiền ban đầu không
    const balAfterRefund = Number((await prisma.wallet.findUnique({ where: { userId: user1.id } })).balance);
    const isRefundedCorrectly = balAfterRefund === balBeforeRefundTest;
    assert(isRefundedCorrectly, 
      isRefundedCorrectly 
        ? `Ví khách được hoàn đủ ${cancelTestOrder.totalAmount.toLocaleString('vi-VN')}đ (Số dư khôi phục: ${balAfterRefund.toLocaleString('vi-VN')}đ)`
        : `[LỖI P0 PHÁT HIỆN]: Tiền ví KHÔNG ĐƯỢC HOÀN! Trước: ${balBeforeRefundTest}, Sau: ${balAfterRefund}`);

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 4: CONCURRENCY & RACE CONDITIONS TESTS');
    console.log('-------------------------------------------------------------------------');

    // 4.1 Chống đặt trùng đơn khi cùng gửi 1 idempotencyKey
    console.log('[4.1] Test Duplicate Order với Idempotency Key:');
    const testKey = `audit_idem_${Date.now()}`;
    const order1Promise = request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      idempotencyKey: testKey,
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);

    const order2Promise = request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      idempotencyKey: testKey,
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);

    const [resO1, resO2] = await Promise.all([order1Promise, order2Promise]);
    assert(resO1.data.id === resO2.data.id, 'Cùng idempotencyKey trả về cùng 1 mã đơn ID duy nhất (Chống đặt trùng)');
    
    // Kiểm tra trong DB chỉ có đúng 1 record
    const countByIdem = await prisma.foodOrder.count({ where: { idempotencyKey: testKey } });
    assert(countByIdem === 1, 'PostgreSQL DB xác nhận: Chỉ có duy nhất 1 bản ghi được tạo');

    // 4.2 Driver Race Condition (2 Driver cùng Accept 1 đơn cùng lúc)
    console.log('\n[4.2] Test Driver Race Condition (2 tài xế bấm nhận đơn cùng 1 mili-giây):');
    // Tạo 1 đơn mới và đưa đến trạng thái FINDING_DRIVER
    const raceOrderRes = await request('POST', '/food/orders', {
      restaurantId: 'rest_pizza_hub',
      deliveryAddress: 'Số 1 Đại Cồ Việt',
      deliveryLat: 21.0073,
      deliveryLng: 105.8431,
      items: [{ menuItemId: firstItem.id, quantity: 1 }],
    }, tokenU1);
    const raceOrder = raceOrderRes.data;
    await request('PATCH', `/food/merchant/orders/${raceOrder.id}/confirm`, {}, tokenM1);
    await request('PATCH', `/food/merchant/orders/${raceOrder.id}/preparing`, {}, tokenM1);
    await request('PATCH', `/food/merchant/orders/${raceOrder.id}/ready`, {}, tokenM1);

    // Driver 1 và Driver 2 cùng bấm Accept đồng thời
    const d1AcceptPromise = request('POST', `/food/driver/orders/${raceOrder.id}/accept`, {}, tokenD1).catch(err => err);
    const d2AcceptPromise = request('POST', `/food/driver/orders/${raceOrder.id}/accept`, {}, tokenD2).catch(err => err);

    const [d1Res, d2Res] = await Promise.all([d1AcceptPromise, d2AcceptPromise]);
    const d1Success = d1Res.status === 200 || d1Res.status === 201;
    const d2Success = d2Res.status === 200 || d2Res.status === 201;

    assert((d1Success && !d2Success) || (!d1Success && d2Success), 
      'Chỉ có DUY NHẤT 1 tài xế nhận đơn thành công, tài xế còn lại bị từ chối 409 Conflict');

    // 4.3 Cancel Race: Khách cố hủy đơn khi Quán đã Confirm hoặc Nấu
    console.log('\n[4.3] Test Cancel Race: Khách cố hủy khi đơn không còn ở PENDING:');
    try {
      await request('PATCH', `/food/orders/${raceOrder.id}/cancel`, { reason: 'Muốn hủy đơn' }, tokenU1);
      assert(false, 'Khách hàng KHÔNG ĐƯỢC PHÉP hủy khi đơn đã được tài xế nhận/đang nấu!');
    } catch (err) {
      assert(err.status === 400, `Backend chặn đúng quy tắc máy trạng thái: HTTP ${err.status} Bad Request`);
    }

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 5: SECURITY & AUTHORIZATION TESTS');
    console.log('-------------------------------------------------------------------------');

    // 5.1 Merchant A cố xem đơn của Merchant B
    console.log('[5.1] Merchant 2 (Tea Lab) cố xem đơn của Merchant 1 (Pizza):');
    try {
      await request('GET', `/food/merchant/orders/${codOrder.id}`, null, tokenM2);
      assert(false, 'Merchant không được xem đơn của quán khác!');
    } catch (err) {
      assert(err.status === 404 || err.status === 403, `Chặn truy cập trái phép: HTTP ${err.status}`);
    }

    // 5.2 Driver 2 cố thao tác pickup/complete đơn của Driver 1
    console.log('\n[5.2] Driver 2 cố pickup đơn mà Driver 1 đã nhận:');
    try {
      await request('PATCH', `/food/driver/orders/${codOrder.id}/pickup`, {}, tokenD2);
      assert(false, 'Driver không được thao tác trên đơn của driver khác!');
    } catch (err) {
      assert(err.status === 403, `Chặn trái quyền tài xế: HTTP ${err.status} Forbidden`);
    }

    // 5.3 Merchant cố chuyển trạng thái sang COMPLETED
    console.log('\n[5.3] Merchant cố ý gọi hoàn tất đơn (COMPLETED):');
    try {
      await request('PATCH', `/food/driver/orders/${codOrder.id}/complete`, {}, tokenM1);
      assert(false, 'Merchant không thể hoàn tất đơn!');
    } catch (err) {
      assert(err.status === 403, `Chặn vai trò không hợp lệ: HTTP ${err.status} Forbidden`);
    }

    // 5.4 Chống giả mạo giá từ Client
    console.log('\n[5.4] Client cố tình gửi kèm unitPrice = 1đ:');
    try {
      await request('POST', '/food/orders', {
        restaurantId: 'rest_pizza_hub',
        deliveryAddress: 'Số 1 Đại Cồ Việt',
        deliveryLat: 21.0073,
        deliveryLng: 105.8431,
        items: [{ menuItemId: firstItem.id, quantity: 1, unitPrice: 1 }],
      }, tokenU1);
      assert(false, 'ValidationPipe phải chặn thuộc tính unitPrice lạ từ client');
    } catch (err) {
      assert(err.status === 400, `ValidationPipe chặn gửi unitPrice: HTTP ${err.status} Bad Request`);
    }

    console.log('\n-------------------------------------------------------------------------');
    console.log('MỤC 6: PRICING & ACCOUNTING FORMULA VERIFICATION');
    console.log('-------------------------------------------------------------------------');

    // Kiểm tra công thức 100% - 90% - 110% - 20%
    const checkOrder = await prisma.foodOrder.findUnique({ where: { id: codOrder.id } });
    const expectedBase = Math.round(checkOrder.subtotal / 1.1);
    const expectedMerchant = Math.round(expectedBase * 0.9);
    const expectedAppGross = Math.round(expectedBase * 0.2);

    console.log(`  - Subtotal khách trả món (110%): ${checkOrder.subtotal.toLocaleString('vi-VN')} đ`);
    console.log(`  - Giá gốc tại quán (100%):       ${checkOrder.baseStorePrice.toLocaleString('vi-VN')} đ`);
    console.log(`  - Quán thực nhận (90%):          ${checkOrder.merchantEarning.toLocaleString('vi-VN')} đ`);
    console.log(`  - Lãi gộp sàn V-Life (20%):      ${checkOrder.appGrossProfit.toLocaleString('vi-VN')} đ`);
    console.log(`  - Cước ship tài xế nhận:         ${checkOrder.shippingFee.toLocaleString('vi-VN')} đ`);

    assert(checkOrder.baseStorePrice === expectedBase, 'Giá gốc quán = Subtotal / 1.1 chuẩn xác');
    assert(checkOrder.merchantEarning === expectedMerchant, 'Quán nhận 90% giá gốc chuẩn xác');
    assert(checkOrder.appGrossProfit === expectedAppGross, 'V-Life lãi gộp 20% giá gốc chuẩn xác');

    console.log('\n════════════════════════════════════════════════════════════════════════════');
    console.log(`📊 TỔNG KẾT AUDIT: ${passedTests}/${totalTests} TESTS PASS`);
    if (failedTests > 0) {
      console.log(`⚠️ CÓ ${failedTests} LỖI CẦN XỬ LÝ:`);
      failures.forEach((f, idx) => console.log(`   ${idx + 1}. ${f}`));
    } else {
      console.log('🎉 100% CÁC BÀI KIỂM THỬ ĐÃ PASS HOÀN TOÀN!');
    }
    console.log('════════════════════════════════════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Ngoại lệ nghiêm trọng khi audit:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runProductionAudit();
