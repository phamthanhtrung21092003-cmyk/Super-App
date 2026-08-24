import apiClient from '../../../services/apiClient';
import {
  IUserService,
  UserProfile,
  Address,
  CheckUsernameResponse,
  OtpRequestResponse,
  OtpVerifyPhoneResponse,
  OtpVerifyEmailResponse,
  UserDevice,
} from '../types';

export const realUserService: IUserService = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    const response = await apiClient.get('/users/check-username', {
      params: { username },
    });
    return response.data;
  },

  async requestPhoneOtp(newPhone: string, password: string): Promise<OtpRequestResponse> {
    const response = await apiClient.post('/users/me/phone/request-otp', {
      newPhone,
      password,
    });
    return response.data;
  },

  async verifyPhoneOtp(newPhone: string, otp: string): Promise<OtpVerifyPhoneResponse> {
    const response = await apiClient.post('/users/me/phone/verify-otp', {
      newPhone,
      otp,
    });
    return response.data;
  },

  async requestEmailOtp(newEmail: string): Promise<OtpRequestResponse> {
    const response = await apiClient.post('/users/me/email/request-otp', {
      newEmail,
    });
    return response.data;
  },

  async verifyEmailOtp(newEmail: string, otp: string): Promise<OtpVerifyEmailResponse> {
    const response = await apiClient.post('/users/me/email/verify-otp', {
      newEmail,
      otp,
    });
    return response.data;
  },

  async getDevices(): Promise<UserDevice[]> {
    const response = await apiClient.get('/users/me/devices');
    return response.data;
  },

  async logoutDevice(deviceId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/me/devices/${deviceId}`);
    return response.data;
  },

  async logoutOtherDevices(): Promise<{ message: string }> {
    const response = await apiClient.delete('/users/me/devices/others');
    return response.data;
  },

  async getAddresses(userId: string): Promise<Address[]> {
    const response = await apiClient.get(`/users/${userId}/addresses`);
    return response.data;
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const response = await apiClient.post(`/users/${userId}/addresses`, address);
    return response.data;
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/addresses/${addressId}`);
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/addresses/${addressId}/default`);
  },
};

