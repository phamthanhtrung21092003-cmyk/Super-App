import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavingsBook = {
  id: string;
  type: 'standard' | 'annuity';
  amount: number;
  rate: number;
  months: number;
  startDate: string;
  endDate: string;
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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
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
      savingsBooks, openSavingsBook, topUpSavingsBook
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
