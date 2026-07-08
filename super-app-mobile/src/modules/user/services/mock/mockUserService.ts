import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IUserService, UserProfile, Address } from '../../types';
import { MOCK_USER_PROFILES, MOCK_ADDRESSES } from './mockData/users';

export const mockUserService: IUserService = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    const profile = MOCK_USER_PROFILES.find(u => u.id === userId) || MOCK_USER_PROFILES[0];
    return { ...profile };
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await simulateLatency(500, 1200);
    simulateNetworkError(0.01);
    const profileIdx = MOCK_USER_PROFILES.findIndex(u => u.id === userId);
    const profile = profileIdx !== -1 ? MOCK_USER_PROFILES[profileIdx] : MOCK_USER_PROFILES[0];

    const updated = {
      ...profile,
      ...data
    };

    if (profileIdx !== -1) {
      MOCK_USER_PROFILES[profileIdx] = updated;
    }
    return updated;
  },

  async getAddresses(userId: string): Promise<Address[]> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    return [...MOCK_ADDRESSES];
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    await simulateLatency(500, 1000);
    simulateNetworkError(0.01);

    const newAddr: Address = {
      ...address,
      id: 'addr_' + Date.now()
    };

    if (newAddr.isDefault) {
      MOCK_ADDRESSES.forEach(a => a.isDefault = false);
    }
    MOCK_ADDRESSES.push(newAddr);
    return newAddr;
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await simulateLatency(300, 800);
    simulateNetworkError(0.01);
    const idx = MOCK_ADDRESSES.findIndex(a => a.id === addressId);
    if (idx !== -1) {
      MOCK_ADDRESSES.splice(idx, 1);
    }
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await simulateLatency(300, 800);
    simulateNetworkError(0.01);
    MOCK_ADDRESSES.forEach(a => {
      a.isDefault = a.id === addressId;
    });
  }
};
export default mockUserService;
