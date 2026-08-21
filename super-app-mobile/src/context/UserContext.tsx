import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSessionExpiredHandler, getBaseURL } from '../services/apiClient';
import { authRepository } from '../modules/auth/repository/authRepository';
import { paymentRepository } from '../modules/payment/repository/paymentRepository';
import { userRepository } from '../modules/user/repository/userRepository';
import { addressRepository } from '../modules/address/repository/addressRepository';
import { walletRepository } from '../modules/wallet/repository/walletRepository';
import { Wallet } from '../modules/wallet/types';
import { transactionRepository } from '../modules/transaction/repository/transactionRepository';
import { Transaction } from '../modules/transaction/types';
import { authService } from '../services/authService';
import { isMockMode } from '../modules/auth/services';


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
  walletBalance: number;
  paymentTransactions: any[];
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
  updateAvatar: (file: { uri: string; name: string; type: string }) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  isLoggedIn: boolean;
  currentUser: any;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;

  // Marketplace Additions
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
  coins: number;
  setCoins: (coins: number) => void;
  rewardPoints: number;
  setRewardPoints: (points: number) => void;
  vipTier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';

  // Wallet Activation
  hasWallet: boolean;
  setHasWallet: (val: boolean) => void;
  walletProfile: any;
  activateWalletProfile: (profile: any) => void;

  // Wallet Additions
  wallet: Wallet | null;
  walletLoading: boolean;
  walletError: string | null;
  refreshWallet: () => Promise<void>;

  // Transaction Additions
  transactions: Transaction[];
  transactionsLoading: boolean;
  refreshTransactions: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserNameState] = useState('Phạm Thành Trung ✨');

  const getFullAvatarUrl = (url: string | null | undefined): string => {
    if (!url) {
      return 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512';
    }
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:') ||
      url.startsWith('blob:') ||
      url.startsWith('file://') ||
      url.startsWith('content://') ||
      url.startsWith('ph://')
    ) {
      return url;
    }
    const baseUrl = getBaseURL();
    const serverUrl = baseUrl.replace('/api/v1', '');
    return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isDefaultAvatarUrl = (url: string | null | undefined): boolean => {
    if (!url) return true;
    if (url.startsWith('blob:')) return true; // blob: URLs are ephemeral and die when browser/app session ends
    return url.includes('ui-avatars.com') || url.includes('pravatar.cc');
  };

  // Ảnh mặc định sẽ là chữ cái đầu của tên (PT) với màu nền cố định để không bị đổi màu liên tục
  const [avatarUrl, setAvatarUrlState] = useState('https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512');
  const [bio, setBioState] = useState('Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨');
  
  // Theme State
  const [accentHex, setAccentHexState] = useState('#00D8FF');
  const [accentRgb, setAccentRgbState] = useState('0, 216, 255');
  const [bgUrl, setBgUrlState] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(1000000000); // 1 tỷ VND để test
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([
    { id: '1', title: 'Highlands Coffee', amount: '-45.000đ', type: 'out', date: 'Hôm nay, 08:30', icon: 'cafe-outline', bg: '#FEE2E2', color: '#EF4444' },
    { id: '2', title: 'Nguyễn Văn A', desc: 'Chuyển tiền ăn trưa', amount: '+250.000đ', type: 'in', date: 'Hôm qua, 15:45', icon: 'person-outline', bg: '#D1FAE5', color: '#10B981' },
  ]);
  const [linkedBanks, setLinkedBanks] = useState<any[]>([
    { id: 'vcb', name: 'Vietcombank', account: '**** 1234', color: '#10B981', icon: 'leaf' }
  ]);
  const [savingsBooks, setSavingsBooks] = useState<SavingsBook[]>([]);

  // Marketplace Additions
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [coins, setCoins] = useState(15000); 
  const [rewardPoints, setRewardPoints] = useState(1850); 
  const [vipTier, setVipTier] = useState<'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương'>('Vàng');

  // Wallet Activation State (Default false for new users to trigger Activation Wizard v3.4)
  const [hasWallet, setHasWallet] = useState(false);
  const [walletProfile, setWalletProfile] = useState<any>(null);

  const activateWalletProfile = (profile: any) => {
    setWalletProfile(profile);
    setHasWallet(true);
  };

  // Wallet States
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Transaction States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const refreshAddresses = async () => {
    if (!currentUser) return;
    try {
      const list = await addressRepository.getAddresses();
      setAddresses(list);
    } catch (e) {
      console.error('Failed to get addresses:', e);
    }
  };

  const refreshWallet = async () => {
    if (!currentUser) return;
    setWalletLoading(true);
    setWalletError(null);
    try {
      const w = await walletRepository.refreshMyWallet();
      setWallet(w);
      refreshTransactions();
    } catch (e: any) {
      console.error('Failed to refresh wallet:', e);
      setWalletError(e.message || 'Không thể làm mới ví');
    } finally {
      setWalletLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!currentUser) return;
    setTransactionsLoading(true);
    try {
      const list = await transactionRepository.refreshMyTransactions();
      setTransactions(list);
    } catch (e) {
      console.error('Failed to refresh transactions:', e);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const addAddress = async (addr: Omit<Address, 'id'>) => {
    try {
      await addressRepository.createAddress(addr);
      await refreshAddresses();
    } catch (e) {
      console.error('Failed to add address:', e);
      throw e;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressRepository.deleteAddress(id);
      await refreshAddresses();
    } catch (e) {
      console.error('Failed to delete address:', e);
      throw e;
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await addressRepository.setDefaultAddress(id);
      await refreshAddresses();
    } catch (e) {
      console.error('Failed to set default address:', e);
      throw e;
    }
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
    return await authRepository.register(phone, password, fullName);
  };

  const loginCheck = async (phone: string, password: string): Promise<{ success: boolean; fullName?: string; message: string }> => {
    const result = await authRepository.login(phone, password);
    if (result.success) {
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      
      // Load thông tin người dùng từ userRepository
      try {
        const profile = await userRepository.getUserProfile(result.user.id);
        
        setUserNameState(profile.fullName);
        setAvatarUrlState(getFullAvatarUrl(profile.avatarUrl));
        setBioState(profile.bio);
        setCoins(profile.coins);
        setRewardPoints(profile.rewardPoints);
        setVipTier(profile.vipTier);

        // Load địa chỉ qua addressRepository
        const addrs = await addressRepository.getAddresses();
        setAddresses(addrs);
      } catch (profileError) {
        console.warn('Failed to load user profile on login:', profileError);
        setUserNameState(result.fullName || result.user.fullName);
      }

      // Load ví từ repository sau khi đăng nhập thành công
      try {
        const cachedWallet = await walletRepository.getMyWallet();
        setWallet(cachedWallet);
        const cachedTxs = await transactionRepository.getMyTransactions();
        setTransactions(cachedTxs);
      } catch (e) {
        console.warn('Failed to load wallet data from cache on login:', e);
      }
      refreshWallet();
    }
    return result;
  };

  const restoreSession = async () => {
    const result = await authRepository.restoreSession();
    if (result.success) {
      setCurrentUser(result.user);
      setIsLoggedIn(true);

      // Load thông tin người dùng từ userRepository
      try {
        const profile = await userRepository.getUserProfile(result.user.id);
        const storedAvatar = await AsyncStorage.getItem('avatarUrl');
        
        setUserNameState(profile.fullName || result.user.fullName || userName);
        
        let resolvedAvatar = profile.avatarUrl;
        if ((!resolvedAvatar || isDefaultAvatarUrl(resolvedAvatar)) && storedAvatar && !isDefaultAvatarUrl(storedAvatar)) {
          resolvedAvatar = storedAvatar;
          try {
            await userRepository.updateProfile(result.user.id, { avatarUrl: storedAvatar });
          } catch {}
        }

        const finalFullAvatar = getFullAvatarUrl(resolvedAvatar);
        setAvatarUrlState(finalFullAvatar);
        await AsyncStorage.setItem('avatarUrl', finalFullAvatar);

        setBioState(profile.bio || bio);
        setCoins(profile.coins ?? coins);
        setRewardPoints(profile.rewardPoints ?? rewardPoints);
        setVipTier(profile.vipTier || vipTier);

        // Load địa chỉ qua addressRepository
        const addrs = await addressRepository.getAddresses();
        setAddresses(addrs);
      } catch (profileError) {
        console.warn('Failed to load user profile on restore session:', profileError);
        setUserNameState(result.user.fullName || userName);
        const storedAvatar = await AsyncStorage.getItem('avatarUrl');
        if (storedAvatar) {
          setAvatarUrlState(getFullAvatarUrl(storedAvatar));
        }
      }

      // Load ví từ repository sau khi khôi phục phiên
      try {
        const cachedWallet = await walletRepository.getMyWallet();
        setWallet(cachedWallet);
        const cachedTxs = await transactionRepository.getMyTransactions();
        setTransactions(cachedTxs);
      } catch (e) {
        console.warn('Failed to load wallet data from cache on restore session:', e);
      }
      refreshWallet();
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  const logout = async () => {
    try {
      console.log('User logout...');
      await authRepository.logout();
    } catch (error) {
      console.warn('API logout failed, clearing local session anyway:', error);
    } finally {
      // Xóa các khóa lưu trữ của ví điện tử và user profile khỏi AsyncStorage
      await AsyncStorage.removeItem('wallet_balance');
      await AsyncStorage.removeItem('transactions_list');
      await AsyncStorage.removeItem('linked_banks');
      await AsyncStorage.removeItem('user_profile');
      await AsyncStorage.removeItem('user_addresses');
      await AsyncStorage.removeItem('user_wallet');
      await AsyncStorage.removeItem('user_transactions');
      await AsyncStorage.removeItem('avatarUrl');
      await AsyncStorage.removeItem('bio');
      await AsyncStorage.removeItem('savingsBooks');
      await AsyncStorage.removeItem('addresses');
      await AsyncStorage.removeItem('coins');
      await AsyncStorage.removeItem('rewardPoints');
      await AsyncStorage.removeItem('vipTier');

      // Khôi phục các biến state local về giá trị mặc định ban đầu
      setCurrentUser(null);
      setIsLoggedIn(false);
      setUserNameState('Phạm Thành Trung ✨');
      setAvatarUrlState('https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=1E293B&color=fff&size=512');
      setBioState('Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨');
      setWalletBalance(1000000000);
      setTransactions([]);
      setPaymentTransactions([]);
      setLinkedBanks([]);
      setSavingsBooks([]);
      setAddresses([]);
      setCoins(15000);
      setRewardPoints(1850);
      setVipTier('Vàng');
      setWallet(null);
      setWalletError(null);

      console.log('Session and all personal data cleared.');
    }
  };

  useEffect(() => {
    // Thiết lập handler thông báo hết hạn phiên làm việc cho apiClient
    setSessionExpiredHandler(() => {
      setIsLoggedIn(false);
      setCurrentUser(null);
    });

    const loadData = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedAvatar = await AsyncStorage.getItem('avatarUrl');
        const storedBio = await AsyncStorage.getItem('bio');
        const storedAccentHex = await AsyncStorage.getItem('accentHex');
        const storedAccentRgb = await AsyncStorage.getItem('accentRgb');
        const storedBgUrl = await AsyncStorage.getItem('bgUrl');
        const storedSavings = await AsyncStorage.getItem('savingsBooks');

        if (storedUserName) setUserNameState(storedUserName);
        if (storedAvatar) setAvatarUrlState(storedAvatar);
        if (storedBio) setBioState(storedBio);
        if (storedAccentHex) setAccentHexState(storedAccentHex);
        if (storedAccentRgb) setAccentRgbState(storedAccentRgb);
        if (storedBgUrl) setBgUrlState(storedBgUrl);
        
        if (storedSavings) setSavingsBooks(JSON.parse(storedSavings));

        // Khôi phục phiên làm việc và load dữ liệu ví tự động
        await restoreSession();
      } catch (e) {
        console.log('Failed to load user data');
      }
    };
    loadData();
  }, []);

  const setAvatarUrl = async (url: string) => {
    try {
      let finalUrl = url;

      // Nếu là blob: trên Web, chuyển thành Data URL (Base64) để lưu trữ vĩnh viễn
      if (Platform.OS === 'web' && url.startsWith('blob:')) {
        try {
          finalUrl = await new Promise<string>((resolve, reject) => {
            fetch(url)
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              })
              .catch(reject);
          });
        } catch (blobErr) {
          console.warn('[UserContext] Failed to convert blob to data url:', blobErr);
        }
      }

      const isLocalOrTemp = 
        finalUrl.startsWith('file://') ||
        finalUrl.startsWith('content://') ||
        finalUrl.startsWith('ph://') ||
        finalUrl.startsWith('blob:') ||
        finalUrl.startsWith('data:');

      if (isMockMode) {
        const fullUrl = getFullAvatarUrl(finalUrl);
        setAvatarUrlState(fullUrl);
        setCurrentUser((prev: any) => (prev ? { ...prev, avatarUrl: fullUrl } : { id: 'mock_user_trung', fullName: userName, avatarUrl: fullUrl }));
        await AsyncStorage.setItem('avatarUrl', fullUrl);

        try {
          const userId = currentUser?.id || 'mock_user_trung';
          await userRepository.updateProfile(userId, { avatarUrl: fullUrl });

          const storedUser = await AsyncStorage.getItem('currentUser');
          if (storedUser) {
            const u = JSON.parse(storedUser);
            u.avatarUrl = fullUrl;
            await AsyncStorage.setItem('currentUser', JSON.stringify(u));
          }
        } catch (storageErr) {
          console.warn('[UserContext] Failed to persist mock avatar profile:', storageErr);
        }
        return;
      }

      // Backend (Real API)
      if (isLocalOrTemp) {
        const filename = 'avatar_' + Date.now() + '.jpg';
        await updateAvatar({
          uri: url,
          name: filename,
          type: 'image/jpeg',
        });
      } else {
        const fullUrl = getFullAvatarUrl(url);
        setAvatarUrlState(fullUrl);
        await AsyncStorage.setItem('avatarUrl', fullUrl);
        setCurrentUser((prev: any) => (prev ? { ...prev, avatarUrl: url } : prev));
        try {
          const userId = currentUser?.id || 'me';
          await userRepository.updateProfile(userId, { avatarUrl: url });
        } catch {}
      }
    } catch (e) {
      console.error('Failed to update avatar:', e);
      throw e;
    }
  };

  const updateAvatar = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    try {
      if (isMockMode) {
        const fullUrl = getFullAvatarUrl(file.uri);
        setAvatarUrlState(fullUrl);
        setCurrentUser((prev: any) => (prev ? { ...prev, avatarUrl: fullUrl } : { id: 'mock_user_trung', fullName: userName, avatarUrl: fullUrl }));
        await AsyncStorage.setItem('avatarUrl', fullUrl);
        try {
          const userId = currentUser?.id || 'mock_user_trung';
          await userRepository.updateProfile(userId, { avatarUrl: fullUrl });
        } catch {}
        return { avatarUrl: fullUrl };
      }

      const updated = await authService.uploadAvatar(file);
      const fullUrl = getFullAvatarUrl(updated.avatarUrl);
      setAvatarUrlState(fullUrl);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setCurrentUser((prev: any) => (prev ? { ...prev, avatarUrl: updated.avatarUrl } : { avatarUrl: updated.avatarUrl }));
      await AsyncStorage.setItem('avatarUrl', fullUrl);

      try {
        const storedProfileStr = await AsyncStorage.getItem('user_profile');
        let storedProfile = storedProfileStr ? JSON.parse(storedProfileStr) : {};
        storedProfile = { ...storedProfile, ...updated, avatarUrl: updated.avatarUrl };
        await AsyncStorage.setItem('user_profile', JSON.stringify(storedProfile));

        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          u.avatarUrl = updated.avatarUrl;
          await AsyncStorage.setItem('currentUser', JSON.stringify(u));
        }
      } catch (storageErr) {
        console.warn('[UserContext] Failed to persist backend avatar profile:', storageErr);
      }

      return updated;
    } catch (e) {
      console.error('Failed to upload avatar:', e);
      throw e;
    }
  };


  const setBio = async (newBio: string) => {
    if (!currentUser) return;
    try {
      const updated = await userRepository.updateProfile(currentUser.id, { bio: newBio });
      setBioState(updated.bio);
    } catch (e) {
      console.error('Failed to update bio:', e);
    }
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
  const addTransaction = async (amount: number, type: 'in' | 'out', title: string, desc?: string) => {
    try {
      await paymentRepository.addTransaction(amount, type, title, desc);
      const updatedBalance = await paymentRepository.getWalletBalance();
      const updatedTxs = await paymentRepository.getTransactions();
      
      setWalletBalance(updatedBalance);
      setPaymentTransactions(updatedTxs);
    } catch (e) {
      console.error('Failed to add transaction:', e);
    }
  };

  const addLinkedBank = async (name: string, account: string) => {
    try {
      await paymentRepository.addLinkedBank(name, account);
      const updatedBanks = await paymentRepository.getLinkedBanks();
      setLinkedBanks(updatedBanks);
    } catch (e) {
      console.error('Failed to link bank:', e);
    }
  };

  const setUserName = async (name: string) => {
    if (!currentUser) return;
    try {
      const updated = await userRepository.updateProfile(currentUser.id, { fullName: name });
      setUserNameState(updated.fullName);
    } catch (e) {
      console.error('Failed to update userName:', e);
    }
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

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const result = await authRepository.changePassword(currentPassword, newPassword, confirmPassword);
      if (result.success) {
        await logout();
      }
      return result;
    } catch (e) {
      console.error('Failed to change password in context:', e);
      return { success: false, message: 'Đã xảy ra lỗi hệ thống khi đổi mật khẩu.' };
    }
  };

  return (
    <UserContext.Provider value={{ 
      userName, setUserName, 
      avatarUrl, setAvatarUrl, 
      bio, setBio,
      accentHex, accentRgb, setThemeColor,
      bgUrl, setBgUrl,
      walletBalance, paymentTransactions, addTransaction,
      linkedBanks, addLinkedBank,
      savingsBooks, openSavingsBook, topUpSavingsBook,
      registerAccount, loginCheck, updateAvatar, changePassword,
      isLoggedIn, currentUser, restoreSession, logout,
      addresses, addAddress, deleteAddress, setDefaultAddress, refreshAddresses,
      coins, setCoins, rewardPoints, setRewardPoints, vipTier,
      hasWallet, setHasWallet, walletProfile, activateWalletProfile,
      wallet, walletLoading, walletError, refreshWallet,
      transactions, transactionsLoading, refreshTransactions,
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
