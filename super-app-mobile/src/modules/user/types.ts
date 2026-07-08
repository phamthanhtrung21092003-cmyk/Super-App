export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  coins: number;
  rewardPoints: number;
  vipTier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';
}

export interface Address {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  note?: string;
  isDefault: boolean;
}

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}

export interface IUserRepository {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}
