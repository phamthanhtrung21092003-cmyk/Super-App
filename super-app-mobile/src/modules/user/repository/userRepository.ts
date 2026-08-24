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
      const storedAvatar = await AsyncStorage.getItem('avatarUrl');

      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (storedAvatar && (!parsed.avatarUrl || parsed.avatarUrl.includes('ui-avatars.com'))) {
          parsed.avatarUrl = storedAvatar;
        }
        return parsed;
      }
      const profile = await userService.getUserProfile(userId);
      if (storedAvatar && (!profile.avatarUrl || profile.avatarUrl.includes('ui-avatars.com'))) {
        profile.avatarUrl = storedAvatar;
      }
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('[UserRepository] Failed to get user profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      const existing = stored ? JSON.parse(stored) : {};
      const currentStoredAvatar = await AsyncStorage.getItem('avatarUrl');
      const customAvatar = (existing.avatarUrl && !existing.avatarUrl.includes('ui-avatars.com') && !existing.avatarUrl.startsWith('blob:')) ? existing.avatarUrl : currentStoredAvatar;

      const updated = await userService.updateProfile(userId, data);
      const merged = { ...existing, ...updated, ...data };

      if (!data.avatarUrl && customAvatar && !customAvatar.includes('ui-avatars.com') && !customAvatar.startsWith('blob:')) {
        merged.avatarUrl = customAvatar;
      }

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
      if (merged.fullName) {
        await AsyncStorage.setItem('userName', merged.fullName);
      }
      if (merged.avatarUrl) {
        await AsyncStorage.setItem('avatarUrl', merged.avatarUrl);
      }
      if (merged.bio) {
        await AsyncStorage.setItem('bio', merged.bio);
      }
      return merged;
    } catch (error) {
      console.error('[UserRepository] Failed to update profile:', error);
      throw error;
    }
  },

  async checkUsername(username: string) {
    return await userService.checkUsername(username);
  },

  async requestPhoneOtp(newPhone: string, password: string) {
    return await userService.requestPhoneOtp(newPhone, password);
  },

  async verifyPhoneOtp(newPhone: string, otp: string) {
    const result = await userService.verifyPhoneOtp(newPhone, otp);
    // Cập nhật số điện thoại trong cache profile
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.phone = result.phone;
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(parsed));
    }
    return result;
  },

  async requestEmailOtp(newEmail: string) {
    return await userService.requestEmailOtp(newEmail);
  },

  async verifyEmailOtp(newEmail: string, otp: string) {
    const result = await userService.verifyEmailOtp(newEmail, otp);
    // Cập nhật email trong cache profile
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.email = result.email;
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(parsed));
    }
    return result;
  },

  async getDevices() {
    return await userService.getDevices();
  },

  async logoutDevice(deviceId: string) {
    return await userService.logoutDevice(deviceId);
  },

  async logoutOtherDevices() {
    return await userService.logoutOtherDevices();
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
