import apiClient from '../../../services/apiClient';
import { IUserService, UserProfile, Address } from '../types';

export const realUserService: IUserService = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch(`/users/${userId}`, data);
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
  }
};
