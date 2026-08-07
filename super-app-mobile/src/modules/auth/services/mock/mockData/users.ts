export interface MockUser {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  coins: number;
  rewardPoints: number;
  vipTier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';
  walletBalance: number;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'mock_user_trung',
    fullName: 'Phạm Thành Trung ✨',
    phone: '0987654321',
    avatarUrl: 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512',
    bio: 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨',
    coins: 15000,
    rewardPoints: 1850,
    vipTier: 'Vàng',
    walletBalance: 1000000000 // 1 tỷ
  },
  {
    id: 'mock_user_demo',
    fullName: 'Nguyễn Văn Demo 🚀',
    phone: '0912345678',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=00c6ff&color=fff&size=512',
    bio: 'Tôi yêu S-life và thiết kế giao diện di động đẹp!',
    coins: 5000,
    rewardPoints: 200,
    vipTier: 'Đồng',
    walletBalance: 500000
  },
  {
    id: 'mock_user_admin',
    fullName: 'Lê Văn Admin 🛡️',
    phone: '0900000000',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=EF4444&color=fff&size=512',
    bio: 'Người quản trị hệ thống siêu ứng dụng S-life.',
    coins: 999999,
    rewardPoints: 99999,
    vipTier: 'Kim cương',
    walletBalance: 9999999999
  }
];

export const findMockUserByPhone = (phone: string): MockUser | undefined => {
  return MOCK_USERS.find(user => user.phone === phone);
};
