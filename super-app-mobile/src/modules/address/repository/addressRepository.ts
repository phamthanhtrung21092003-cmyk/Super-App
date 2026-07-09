import AsyncStorage from '@react-native-async-storage/async-storage';
import { addressService } from '../services';
import { IAddressRepository, Address } from '../types';

const ADDRESSES_KEY = 'user_addresses';

export const addressRepository: IAddressRepository = {
  async getAddresses(): Promise<Address[]> {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const list = await addressService.getAddresses();
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
      return list;
    } catch (error) {
      console.error('[AddressRepository] Failed to get addresses:', error);
      throw error;
    }
  },

  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const newAddress = await addressService.createAddress(address);
      const currentList = await this.getAddresses();
      
      let updatedList = [...currentList];
      if (newAddress.isDefault) {
        updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
      }
      updatedList.unshift(newAddress);
      
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedList));
      return newAddress;
    } catch (error) {
      console.error('[AddressRepository] Failed to create address:', error);
      throw error;
    }
  },

  async deleteAddress(id: string): Promise<void> {
    try {
      await addressService.deleteAddress(id);
      const list = await addressService.getAddresses();
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('[AddressRepository] Failed to delete address:', error);
      throw error;
    }
  },

  async setDefaultAddress(id: string): Promise<Address> {
    try {
      const updated = await addressService.setDefaultAddress(id);
      const list = await addressService.getAddresses();
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
      return updated;
    } catch (error) {
      console.error('[AddressRepository] Failed to set default address:', error);
      throw error;
    }
  },
};
export default addressRepository;
