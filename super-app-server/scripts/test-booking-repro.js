const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const r = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function test() {
  console.log('--- 1. Login user ---');
  const login = await req('POST', '/auth/login', { phone: '0988000111', password: 'User@123456' });
  console.log('Login status:', login.status);
  let token = null;
  try {
    const data = JSON.parse(login.body);
    token = data.accessToken;
    console.log('Logged in user:', data.user?.id, data.user?.phone, data.user?.role);
  } catch (e) {
    console.error('Login parse error:', login.body);
  }

  console.log('\n--- 2. Test Mobile App Payload (what booking.tsx sends) ---');
  const mobilePayload = {
    pickupAddress: '72 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    pickupLat: 21.028511,
    pickupLng: 105.804817,
    dropoffAddress: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    dropoffLat: 21.0028,
    dropoffLng: 105.8155,
    vehicleType: 'ev',
    serviceType: 'RIDE',
    fareAmount: 65000,
    distanceKm: 4.8,
    paymentMethod: 'SUPERPAY',
    customerName: 'Khách hàng V-Life',
    customerPhone: '0988000000',
  };
  const res1 = await req('POST', '/ride/book', mobilePayload, token);
  console.log('Response 1 (SUPERPAY):', res1.status, res1.body);

  console.log('\n--- 3. Test Mobile App Payload with CARD ---');
  const cardPayload = { ...mobilePayload, paymentMethod: 'CARD' };
  const res2 = await req('POST', '/ride/book', cardPayload, token);
  console.log('Response 2 (CARD):', res2.status, res2.body);

  console.log('\n--- 4. Test Mobile App Payload when Unauthenticated (No Token) ---');
  const res3 = await req('POST', '/ride/book', mobilePayload, null);
  console.log('Response 3 (No token):', res3.status, res3.body);

  console.log('\n--- 5. Test Minimal DTO Payload (only what DTO currently defines) ---');
  const minimalPayload = {
    pickupAddress: '72 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    pickupLat: 21.028511,
    pickupLng: 105.804817,
    dropoffAddress: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    dropoffLat: 21.0028,
    dropoffLng: 105.8155,
    vehicleType: 'ev',
    serviceType: 'RIDE',
    paymentMethod: 'CASH',
  };
  const res4 = await req('POST', '/ride/book', minimalPayload, token);
  console.log('Response 4 (Minimal DTO):', res4.status, res4.body);
}

test();
