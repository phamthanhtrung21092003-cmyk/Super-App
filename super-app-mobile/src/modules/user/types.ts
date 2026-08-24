export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  username?: string;
  avatarUrl: string;
  bio: string;
  birthYear?: number;
  gender?: string;
  hometown?: string;
  coins: number;
  rewardPoints: number;
  vipTier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  manufacturer?: string;
  modelName?: string;
  platform: string;
  osVersion?: string;
  ipAddress?: string;
  status: 'ACTIVE' | 'LOGGED_OUT';
  lastLoginAt?: string;
  lastActiveAt?: string;
  loggedOutAt?: string;
  createdAt?: string;
  isCurrent?: boolean;
}

export interface CheckUsernameResponse {
  available: boolean;
  message: string;
}

export interface OtpRequestResponse {
  message: string;
  expiresIn: number;
  devOtp?: string;
}

export interface OtpVerifyPhoneResponse {
  message: string;
  phone: string;
}

export interface OtpVerifyEmailResponse {
  message: string;
  email: string;
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
  checkUsername(username: string): Promise<CheckUsernameResponse>;
  requestPhoneOtp(newPhone: string, password: string): Promise<OtpRequestResponse>;
  verifyPhoneOtp(newPhone: string, otp: string): Promise<OtpVerifyPhoneResponse>;
  requestEmailOtp(newEmail: string): Promise<OtpRequestResponse>;
  verifyEmailOtp(newEmail: string, otp: string): Promise<OtpVerifyEmailResponse>;
  getDevices(): Promise<UserDevice[]>;
  logoutDevice(deviceId: string): Promise<{ message: string }>;
  logoutOtherDevices(): Promise<{ message: string }>;
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}

export interface IUserRepository {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  checkUsername(username: string): Promise<CheckUsernameResponse>;
  requestPhoneOtp(newPhone: string, password: string): Promise<OtpRequestResponse>;
  verifyPhoneOtp(newPhone: string, otp: string): Promise<OtpVerifyPhoneResponse>;
  requestEmailOtp(newEmail: string): Promise<OtpRequestResponse>;
  verifyEmailOtp(newEmail: string, otp: string): Promise<OtpVerifyEmailResponse>;
  getDevices(): Promise<UserDevice[]>;
  logoutDevice(deviceId: string): Promise<{ message: string }>;
  logoutOtherDevices(): Promise<{ message: string }>;
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}
