import { simulateLatency, simulateNetworkError } from '../../../../services/mock/mockUtils';
import { IAddressService, Address } from '../../types';

const MOCK_ADDRESSES_LIST: Address[] = [
  {
    id: 'addr_1',
    label: 'Nhà riêng',
    receiverName: 'Phạm Thành Trung',
    receiverPhone: '0394562659',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    detailAddress: '45 Lê Lợi',
    note: 'Gọi điện trước khi giao',
    isDefault: true,
    latitude: 10.7769,
    longitude: 106.7009,
  },
  {
    id: 'addr_2',
    label: 'Văn phòng',
    receiverName: 'Trung Pham',
    receiverPhone: '0987654321',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    detailAddress: 'Tòa nhà Landmark 72',
    note: 'Giao giờ hành chính',
    isDefault: false,
    latitude: 21.0167,
    longitude: 105.7839,
  }
];

export const mockAddressService: IAddressService = {
  async getAddresses(): Promise<Address[]> {
    await simulateLatency(300, 700);
    simulateNetworkError(0.01);
    return [...MOCK_ADDRESSES_LIST];
  },

  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    await simulateLatency(400, 900);
    simulateNetworkError(0.01);

    const newAddr: Address = {
      ...address,
      id: 'addr_mock_' + Date.now(),
    };

    if (newAddr.isDefault) {
      MOCK_ADDRESSES_LIST.forEach(a => {
        a.isDefault = false;
      });
    }
    MOCK_ADDRESSES_LIST.push(newAddr);
    return newAddr;
  },

  async deleteAddress(id: string): Promise<void> {
    await simulateLatency(200, 600);
    simulateNetworkError(0.01);

    const idx = MOCK_ADDRESSES_LIST.findIndex(a => a.id === id);
    if (idx !== -1) {
      const wasDefault = MOCK_ADDRESSES_LIST[idx].isDefault;
      MOCK_ADDRESSES_LIST.splice(idx, 1);
      
      if (wasDefault && MOCK_ADDRESSES_LIST.length > 0) {
        MOCK_ADDRESSES_LIST[0].isDefault = true;
      }
    }
  },

  async setDefaultAddress(id: string): Promise<Address> {
    await simulateLatency(200, 600);
    simulateNetworkError(0.01);

    let updated: Address | undefined;
    MOCK_ADDRESSES_LIST.forEach(a => {
      a.isDefault = a.id === id;
      if (a.id === id) {
        updated = a;
      }
    });

    if (!updated) {
      throw new Error('Address not found');
    }
    return updated;
  },
};
