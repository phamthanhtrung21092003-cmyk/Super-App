import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services';
import { IUserRepository, UserProfile, Address } from '../types';

const PROFILE_KEY = 'user_profile';
const ADDRESSES_KEY = 'user_addresses';

export const userRepository: IUserRepository = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Thử đọc cache
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const profile = await userService.getUserProfile(userId);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('[UserRepository] Failed to get user profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updated = await userService.updateProfile(userId, data);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      await AsyncStorage.setItem('userName', updated.fullName); // Đồng bộ với tên hiển thị cũ
      return updated;
    } catch (error) {
      console.error('[UserRepository] Failed to update profile:', error);
      throw error;
    }
  },

  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const addresses = await userService.getAddresses(userId);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
      return addresses;
    } catch (error) {
      console.error('[UserRepository] Failed to get addresses:', error);
      throw error;
    }
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const newAddr = await userService.addAddress(userId, address);
      const currentList = await this.getAddresses(userId);
      
      let updatedList = [...currentList];
      if (newAddr.isDefault) {
        updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
      }
      updatedList.push(newAddr);
      
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedList));
      return newAddr;
    } catch (error) {
      console.error('[UserRepository] Failed to add address:', error);
      throw error;
    }
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      await userService.deleteAddress(userId, addressId);
      const currentList = await this.getAddresses(userId);
      const updatedList = currentList.filter(a => a.id !== addressId);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedList));
    } catch (error) {
      console.error('[UserRepository] Failed to delete address:', error);
      throw error;
    }
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      await userService.setDefaultAddress(userId, addressId);
      const currentList = await this.getAddresses(userId);
      const updatedList = currentList.map(a => ({
        ...a,
        isDefault: a.id === addressId
      }));
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedList));
    } catch (error) {
      console.error('[UserRepository] Failed to set default address:', error);
      throw error;
    }
  }
};
export default userRepository;
