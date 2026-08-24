import { UserProfile, Address } from '../../../types';

export const MOCK_USER_PROFILES: UserProfile[] = [
  {
    id: 'mock_user_trung',
    fullName: 'Phạm Thành Trung ✨',
    phone: '0987654321',
    email: 'trungpt@gmail.com',
    username: 'phm_thnh_trung_',
    avatarUrl: 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512',
    bio: 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨',
    birthYear: 2003,
    gender: 'Nam',
    hometown: 'Hà Nội, Việt Nam',
    coins: 15000,
    rewardPoints: 1850,
    vipTier: 'Vàng',
    createdAt: '2023-08-12T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
  },
  {
    id: 'mock_user_demo',
    fullName: 'Nguyễn Văn Demo 🚀',
    phone: '0912345678',
    email: 'demo@vlife.vn',
    username: 'demo_user_vlife',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=00c6ff&color=fff&size=512',
    bio: 'Tôi yêu V-life và thiết kế giao diện di động đẹp!',
    birthYear: 1998,
    gender: 'Nam',
    hometown: 'Đà Nẵng, Việt Nam',
    coins: 5000,
    rewardPoints: 200,
    vipTier: 'Đồng',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
  }
];

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    receiverName: 'Phạm Thành Trung',
    receiverPhone: '0987654321',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    detailAddress: '45 Lê Lợi',
    note: 'Giao giờ hành chính',
    isDefault: true
  },
  {
    id: 'addr_2',
    receiverName: 'Phạm Thành Trung',
    receiverPhone: '0987654321',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Phong',
    detailAddress: 'Đại học Tôn Đức Thắng',
    note: 'Giao ngoài giờ hành chính',
    isDefault: false
  }
];
