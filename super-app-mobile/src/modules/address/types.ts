export interface Address {
  id: string;
  label: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface IAddressService {
  getAddresses(): Promise<Address[]>;
  createAddress(address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<Address>;
}

export interface IAddressRepository {
  getAddresses(): Promise<Address[]>;
  createAddress(address: Omit<Address, 'id'>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<Address>;
}
