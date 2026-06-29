import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Account = {
  phone: string;
  password: string;
  fullName: string;
  createdAt: string;
};

type AuthContextType = {
  accounts: Account[];
  registerAccount: (phone: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  validateLogin: (phone: string, password: string) => { success: boolean; account?: Account; error?: string; errorField?: 'phone' | 'password' };
  isLoggedIn: boolean;
  currentUser: Account | null;
  login: (account: Account) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tài khoản demo mặc định có sẵn
const DEFAULT_ACCOUNTS: Account[] = [
  { phone: '0912345678', password: '123456', fullName: 'Demo User', createdAt: '2026-01-01' },
  { phone: '0987654321', password: 'Password1', fullName: 'Test User', createdAt: '2026-01-01' },
];

const STORAGE_KEY = 'registered_accounts';
const CURRENT_USER_KEY = 'current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Account | null>(null);

  // Load accounts từ storage khi khởi động
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedAccounts: Account[] = JSON.parse(stored);
          // Merge với default accounts (tránh trùng)
          const merged = [...DEFAULT_ACCOUNTS];
          storedAccounts.forEach(acc => {
            if (!merged.find(a => a.phone === acc.phone)) {
              merged.push(acc);
            }
          });
          setAccounts(merged);
        }

        const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.log('Failed to load auth data');
      }
    };
    loadAccounts();
  }, []);

  // Đăng ký tài khoản mới
  const registerAccount = async (phone: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    // Kiểm tra số điện thoại đã tồn tại chưa
    const exists = accounts.find(acc => acc.phone === phone);
    if (exists) {
      return { success: false, error: 'Số điện thoại này đã được đăng ký' };
    }

    const newAccount: Account = {
      phone,
      password,
      fullName,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newList = [...accounts, newAccount];
    setAccounts(newList);

    // Lưu vào AsyncStorage (chỉ lưu các tài khoản người dùng tự đăng ký)
    const userAccounts = newList.filter(a => !DEFAULT_ACCOUNTS.find(d => d.phone === a.phone));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userAccounts));

    return { success: true };
  };

  // Kiểm tra thông tin đăng nhập
  const validateLogin = (phone: string, password: string): { success: boolean; account?: Account; error?: string; errorField?: 'phone' | 'password' } => {
    const phoneExists = accounts.find(acc => acc.phone === phone);
    if (!phoneExists) {
      return { success: false, error: 'Số điện thoại chưa được đăng ký', errorField: 'phone' };
    }

    const matched = accounts.find(acc => acc.phone === phone && acc.password === password);
    if (!matched) {
      return { success: false, error: 'Mật khẩu không chính xác', errorField: 'password' };
    }

    return { success: true, account: matched };
  };

  // Đăng nhập
  const login = async (account: Account) => {
    setCurrentUser(account);
    setIsLoggedIn(true);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account));
  };

  // Đăng xuất
  const logout = async () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{
      accounts,
      registerAccount,
      validateLogin,
      isLoggedIn,
      currentUser,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
