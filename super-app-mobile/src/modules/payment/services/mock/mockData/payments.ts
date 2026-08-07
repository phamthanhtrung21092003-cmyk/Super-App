export interface Transaction {
  id: string;
  title: string;
  desc?: string;
  amount: string;
  type: 'in' | 'out';
  date: string;
  icon: string;
  bg: string;
  color: string;
}

export interface LinkedBank {
  id: string;
  name: string;
  account: string;
  color: string;
  icon: string;
}

export const MOCK_LINKED_BANKS: LinkedBank[] = [
  { id: 'bank_vcb', name: 'Vietcombank', account: '**** 1234', color: '#10B981', icon: 'leaf' },
  { id: 'bank_tcb', name: 'Techcombank', account: '**** 5678', color: '#EF4444', icon: 'star' },
  { id: 'bank_acb', name: 'ACB Bank', account: '**** 9012', color: '#3B82F6', icon: 'diamond' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', title: 'Highlands Coffee', desc: 'Thanh toán cà phê phin sữa đá', amount: '-39.000đ', type: 'out', date: 'Hôm nay, 08:30', icon: 'cafe-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_2', title: 'Chuyển tiền ăn trưa', desc: 'Nguyễn Văn A chuyển tiền ăn trưa', amount: '+250.000đ', type: 'in', date: 'Hôm qua, 12:15', icon: 'person-outline', bg: '#D1FAE5', color: '#10B981' },
  { id: 'tx_3', title: 'Thanh toán cuốc xe V-Bike', desc: 'Mã chuyến xe #VBK-9831', amount: '-22.000đ', type: 'out', date: '06 Tháng 7, 18:45', icon: 'bicycle-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_4', title: 'Nạp tiền vào ví S-life', desc: 'Từ thẻ Vietcombank **** 1234', amount: '+500.000đ', type: 'in', date: '05 Tháng 7, 10:00', icon: 'card-outline', bg: '#D1FAE5', color: '#10B981' },
  { id: 'tx_5', title: 'Phúc Long Hàm Nghi', desc: 'Thanh toán 2 ly trà sữa truyền thống', amount: '-110.000đ', type: 'out', date: '04 Tháng 7, 15:30', icon: 'cafe-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_6', title: 'Hoàn tiền đặt đồ ăn', desc: 'Hoàn tiền đơn hàng #FOD-8213 bị hủy', amount: '+65.000đ', type: 'in', date: '03 Tháng 7, 11:20', icon: 'refresh-outline', bg: '#D1FAE5', color: '#10B981' },
  { id: 'tx_7', title: 'Thanh toán hóa đơn điện', desc: 'Mã khách hàng PE1300098762', amount: '-485.000đ', type: 'out', date: '01 Tháng 7, 09:15', icon: 'flash-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_8', title: 'Rút tiền về tài khoản ngân hàng', desc: 'Về Techcombank **** 5678', amount: '-1.000.000đ', type: 'out', date: '28 Tháng 6, 17:00', icon: 'arrow-forward-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_9', title: 'Nạp thẻ điện thoại Viettel', desc: 'Nạp số điện thoại 0987654321', amount: '-100.000đ', type: 'out', date: '25 Tháng 6, 20:00', icon: 'phone-portrait-outline', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'tx_10', title: 'S-life khuyến mãi', desc: 'Quà tặng chào mừng siêu ứng dụng', amount: '+50.000đ', type: 'in', date: '20 Tháng 6, 08:00', icon: 'gift-outline', bg: '#D1FAE5', color: '#10B981' }
];

// Tạo tự động 50 giao dịch ngẫu nhiên để bộ dữ liệu phong phú hơn
const generateTransactionsList = (): Transaction[] => {
  const list = [...MOCK_TRANSACTIONS];
  const merchants = [
    { title: 'CGV Cinemas', desc: 'Thanh toán 2 vé xem phim', icon: 'film-outline' },
    { title: 'Circle K', desc: 'Thanh toán hóa đơn mua sắm tiện lợi', icon: 'cart-outline' },
    { title: 'GrabFood Partner', desc: 'Đặt cơm gà xối mỡ', icon: 'fast-food-outline' },
    { title: 'Tiki.vn', desc: 'Mua sách Nhập môn Lập trình', icon: 'book-outline' },
    { title: 'Xăng dầu Petrolimex', desc: 'Thanh toán tiền xăng xe máy', icon: 'funnel-outline' }
  ];
  
  const senders = [
    { title: 'Nguyễn Thị B', desc: 'Chuyển tiền trả nợ trà sữa' },
    { title: 'Lê Văn C', desc: 'Chuyển tiền mua quà sinh nhật chung' },
    { title: 'Công ty S-life', desc: 'Thưởng chiến dịch S-life AI Star' }
  ];

  for (let i = 11; i <= 50; i++) {
    const isOut = Math.random() > 0.4;
    const amountVal = Math.floor(Math.random() * 95 + 5) * 5000; // từ 25k tới 500k
    
    if (isOut) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      list.push({
        id: `tx_${i}`,
        title: merchant.title,
        desc: merchant.desc + ` (Mã giao dịch #${1000 + i})`,
        amount: `-${amountVal.toLocaleString('vi-VN')}đ`,
        type: 'out',
        date: `${Math.floor(Math.random() * 28) + 1} Tháng 6, ${Math.floor(Math.random() * 12) + 8}:00`,
        icon: merchant.icon,
        bg: '#FEE2E2',
        color: '#EF4444'
      });
    } else {
      const sender = senders[Math.floor(Math.random() * senders.length)];
      list.push({
        id: `tx_${i}`,
        title: sender.title,
        desc: sender.desc + ` (Mã giao dịch #${1000 + i})`,
        amount: `+${amountVal.toLocaleString('vi-VN')}đ`,
        type: 'in',
        date: `${Math.floor(Math.random() * 28) + 1} Tháng 6, ${Math.floor(Math.random() * 12) + 8}:00`,
        icon: 'person-outline',
        bg: '#D1FAE5',
        color: '#10B981'
      });
    }
  }

  return list;
};

export const MOCK_TRANSACTIONS_LIST = generateTransactionsList();
export const MOCK_WALLET_BALANCE = 1000000000; // 1 tỷ VND mặc định cho tài khoản Mock để test
