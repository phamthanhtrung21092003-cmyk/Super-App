import apiClient from '../../../services/apiClient';
import { IAddressService, Address } from '../types';

export const realAddressService: IAddressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/addresses');
    return response.data;
  },

  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const response = await apiClient.post('/addresses', address);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.patch(`/addresses/${id}/default`);
    return response.data;
  },
};
