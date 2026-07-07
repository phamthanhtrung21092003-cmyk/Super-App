import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';


export type SavingsBook = {
  id: string;
  type: 'standard' | 'annuity';
  amount: number;
  rate: number;
  months: number;
  startDate: string;
  endDate: string;
};

export type Account = {
  phone: string;
  password: string;
  fullName: string;
};

export type Address = {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  note?: string;
  isDefault: boolean;
};

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  // Theme Properties
  accentHex: string;
  accentRgb: string;
  setThemeColor: (hex: string, rgb: string) => void;
  bgUrl: string;
  setBgUrl: (url: string) => void;
  // Wallet Properties
  walletBalance: number;
  transactions: any[];
  addTransaction: (amount: number, type: 'in' | 'out', title: string, desc?: string, icon?: string, bg?: string, color?: string) => void;
  // Bank Properties
  linkedBanks: any[];
  addLinkedBank: (name: string, account: string, color?: string, icon?: string) => void;
  // Savings Properties
  savingsBooks: SavingsBook[];
  openSavingsBook: (book: SavingsBook) => void;
  topUpSavingsBook: (id: string, amount: number) => void;
  // Auth
  registerAccount: (phone: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  loginCheck: (phone: string, password: string) => Promise<{ success: boolean; fullName?: string; message: string }>;
  isLoggedIn: boolean;
  currentUser: any;

  // Marketplace Additions
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  coins: number;
  setCoins: (coins: number) => void;
  rewardPoints: number;
  setRewardPoints: (points: number) => void;
  vipTier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserNameState] = useState('Phạm Thành Trung ✨');

  // Ảnh mặc định sẽ là chữ cái đầu của tên (PT) với màu nền cố định để không bị đổi màu liên tục
  const [avatarUrl, setAvatarUrlState] = useState('https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512');
  const [bio, setBioState] = useState('Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨');
  
  // Theme State
  const [accentHex, setAccentHexState] = useState('#00D8FF');
  const [accentRgb, setAccentRgbState] = useState('0, 216, 255');
  const [bgUrl, setBgUrlState] = useState('https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80');

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(1000000000); // 1 tỷ VND để test
  const [transactions, setTransactions] = useState<any[]>([
    { id: '1', title: 'Highlands Coffee', amount: '-45.000đ', type: 'out', date: 'Hôm nay, 08:30', icon: 'cafe-outline', bg: '#FEE2E2', color: '#EF4444' },
    { id: '2', title: 'Nguyễn Văn A', desc: 'Chuyển tiền ăn trưa', amount: '+250.000đ', type: 'in', date: 'Hôm qua, 15:45', icon: 'person-outline', bg: '#D1FAE5', color: '#10B981' },
  ]);
  const [linkedBanks, setLinkedBanks] = useState<any[]>([
    { id: 'vcb', name: 'Vietcombank', account: '**** 1234', color: '#10B981', icon: 'leaf' }
  ]);
  const [savingsBooks, setSavingsBooks] = useState<SavingsBook[]>([]);

  // Marketplace Additions
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr_1',
      receiverName: 'Phạm Thành Trung',
      receiverPhone: '0987654321',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      detailAddress: '45 Lê Lợi',
      note: 'Giao giờ hành chính',
      isDefault: true
    }
  ]);
  const [coins, setCoins] = useState(15000); 
  const [rewardPoints, setRewardPoints] = useState(1850); 
  const [vipTier, setVipTier] = useState<'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương'>('Vàng');

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: 'addr_' + Date.now()
    };
    if (newAddr.isDefault) {
      setAddresses(addresses.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses([...addresses, newAddr]);
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(a => a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
  };

  // Auth helpers
  const getAccounts = async (): Promise<Account[]> => {
    try {
      const stored = await AsyncStorage.getItem('accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const registerAccount = async (phone: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> => {
    try {
      await authService.register(phone, password, fullName);
      return { success: true, message: 'Đăng ký thành công!' };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 409) {
          return { success: false, message: 'Số điện thoại đã tồn tại.' };
        }
        if (status === 400 && data && data.message) {
          return { success: false, message: data.message };
        }
      }
      if (error.request) {
        return { success: false, message: 'Không thể kết nối máy chủ.' };
      }
      return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại.' };
    }
  };


  const loginCheck = async (phone: string, password: string): Promise<{ success: boolean; fullName?: string; message: string }> => {
    try {
      const result = await authService.login(phone, password);
      
      const tokenExpiresAt = Date.now() + result.expiresIn * 1000;

      // Save tokens and user to AsyncStorage
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('refreshToken', result.refreshToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(result.user));
      await AsyncStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());
      
      // Update local state
      setCurrentUser(result.user);
      setIsLoggedIn(true);

      // Update userName state in context & AsyncStorage to display correct name in UI
      setUserNameState(result.user.fullName);
      await AsyncStorage.setItem('userName', result.user.fullName);

      return { success: true, fullName: result.user.fullName, message: 'Đăng nhập thành công!' };

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          return { success: false, message: 'Số điện thoại hoặc mật khẩu không đúng.' };
        }
      }
      if (error.request) {
        return { success: false, message: 'Không thể kết nối máy chủ.' };
      }
      return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại.' };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedAvatar = await AsyncStorage.getItem('avatarUrl');
        const storedBio = await AsyncStorage.getItem('bio');
        const storedAccentHex = await AsyncStorage.getItem('accentHex');
        const storedAccentRgb = await AsyncStorage.getItem('accentRgb');
        const storedBgUrl = await AsyncStorage.getItem('bgUrl');
        const storedBalance = await AsyncStorage.getItem('walletBalance');
        const storedTx = await AsyncStorage.getItem('transactions');
        const storedBanks = await AsyncStorage.getItem('linkedBanks');
        const storedSavings = await AsyncStorage.getItem('savingsBooks');

        if (storedUserName) setUserNameState(storedUserName);
        if (storedAvatar) setAvatarUrlState(storedAvatar);
        if (storedBio) setBioState(storedBio);
        if (storedAccentHex) setAccentHexState(storedAccentHex);
        if (storedAccentRgb) setAccentRgbState(storedAccentRgb);
        if (storedBgUrl) setBgUrlState(storedBgUrl);
        // FORCE 1 BILLION FOR TESTING: Bỏ qua storedBalance
        setWalletBalance(1000000000);
        await AsyncStorage.setItem('walletBalance', '1000000000');
        
        if (storedTx) setTransactions(JSON.parse(storedTx));
        if (storedBanks) setLinkedBanks(JSON.parse(storedBanks));
        if (storedSavings) setSavingsBooks(JSON.parse(storedSavings));

        // Restore auth session
        const token = await AsyncStorage.getItem('accessToken');
        const rToken = await AsyncStorage.getItem('refreshToken');
        const userStr = await AsyncStorage.getItem('currentUser');
        if (token && rToken && userStr) {
          setCurrentUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        }
      } catch (e) {

        console.log('Failed to load user data');
      }
    };
    loadData();
  }, []);

  const setAvatarUrl = async (url: string) => {
    setAvatarUrlState(url);
    await AsyncStorage.setItem('avatarUrl', url);
  };

  const setBio = async (newBio: string) => {
    setBioState(newBio);
    await AsyncStorage.setItem('bio', newBio);
  };

  const setThemeColor = async (hex: string, rgb: string) => {
    setAccentHexState(hex);
    setAccentRgbState(rgb);
    await AsyncStorage.setItem('accentHex', hex);
    await AsyncStorage.setItem('accentRgb', rgb);
  };

  const setBgUrl = async (url: string) => {
    setBgUrlState(url);
    await AsyncStorage.setItem('bgUrl', url);
  };

  // Wallet Actions
  const addTransaction = async (amount: number, type: 'in' | 'out', title: string, desc?: string, icon?: string, bg?: string, color?: string) => {
    const newTx = {
      id: Date.now().toString(),
      title,
      desc,
      amount: `${type === 'in' ? '+' : '-'}${amount.toLocaleString('vi-VN')}đ`,
      type,
      date: 'Vừa xong',
      icon: icon || (type === 'in' ? 'arrow-down-outline' : 'arrow-up-outline'),
      bg: bg || (type === 'in' ? '#D1FAE5' : '#FEE2E2'),
      color: color || (type === 'in' ? '#10B981' : '#EF4444'),
    };
    
    const newBalance = type === 'in' ? walletBalance + amount : walletBalance - amount;
    
    setWalletBalance(newBalance);
    const newTxList = [newTx, ...transactions];
    setTransactions(newTxList);
    
    await AsyncStorage.setItem('walletBalance', newBalance.toString());
    await AsyncStorage.setItem('transactions', JSON.stringify(newTxList));
  };

  const addLinkedBank = async (name: string, account: string, color?: string, icon?: string) => {
    const colors = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];
    const icons = ['leaf', 'diamond', 'star', 'flash', 'business'];
    const randomColor = color || colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icon || icons[Math.floor(Math.random() * icons.length)];
    const newBank = {
      id: Date.now().toString(),
      name,
      account: `**** ${account.slice(-4)}`,
      color: randomColor,
      icon: randomIcon
    };
    const newBankList = [...linkedBanks, newBank];
    setLinkedBanks(newBankList);
    await AsyncStorage.setItem('linkedBanks', JSON.stringify(newBankList));
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    await AsyncStorage.setItem('userName', name);
  };

  const openSavingsBook = async (book: SavingsBook) => {
    const newBooks = [book, ...savingsBooks];
    setSavingsBooks(newBooks);
    await AsyncStorage.setItem('savingsBooks', JSON.stringify(newBooks));
  };

  const topUpSavingsBook = async (id: string, amount: number) => {
    const newBooks = savingsBooks.map(b => {
      if (b.id === id) {
        return { ...b, amount: b.amount + amount };
      }
      return b;
    });
    setSavingsBooks(newBooks);
    await AsyncStorage.setItem('savingsBooks', JSON.stringify(newBooks));
  };

  return (
    <UserContext.Provider value={{ 
      userName, setUserName, 
      avatarUrl, setAvatarUrl, 
      bio, setBio,
      accentHex, accentRgb, setThemeColor,
      bgUrl, setBgUrl,
      walletBalance, transactions, addTransaction,
      linkedBanks, addLinkedBank,
      savingsBooks, openSavingsBook, topUpSavingsBook,
      registerAccount, loginCheck,
      isLoggedIn, currentUser,
      addresses, addAddress, deleteAddress, setDefaultAddress,
      coins, setCoins, rewardPoints, setRewardPoints, vipTier,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
