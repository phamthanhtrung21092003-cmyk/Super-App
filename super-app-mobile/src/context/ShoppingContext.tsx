import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string; // Unique ID for cart entry
  productId: string;
  shopId: string;
  shopName: string;
  isMall: boolean;
  name: string;
  price: number;
  originalPrice: number;
  variant: string; // e.g. "Đen, Size M"
  image: string;
  quantity: number;
  checked: boolean;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Chờ xác nhận' | 'Đang giao' | 'Đã giao';
  items: CartItem[];
}

interface ShoppingContextType {
  cart: CartItem[];
  orders: Order[];
  coins: number;
  addToCart: (item: Omit<CartItem, 'id' | 'checked'>) => void;
  toggleCheckItem: (id: string) => void;
  toggleCheckShop: (shopId: string, isChecked: boolean) => void;
  toggleCheckAll: (isChecked: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  checkout: (usedCoins: number) => void;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'c_item_1',
      productId: 'p_hub11',
      shopId: 's_sido',
      shopName: 'Sidotech VN',
      isMall: true,
      name: 'Hub type c usb 3.0 SIDOTECH 2 đầu mở rộng 11 trong 1 cao cấp',
      price: 587000,
      originalPrice: 850000,
      variant: 'HUB TYPE C 11 PORT',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
      quantity: 1,
      checked: false,
    },
    {
      id: 'c_item_2',
      productId: 'p_hub8',
      shopId: 's_top1',
      shopName: 'Top 1_Năng Lượng Mặt Trời',
      isMall: false,
      name: 'Hub Type C 8 Trong 1 USB 3.1 Sang HDMI / SD Card / TF',
      price: 175000,
      originalPrice: 250000,
      variant: 'Hub 8 in 1',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
      quantity: 1,
      checked: false,
    },
    {
      id: 'c_item_3',
      productId: 'p_router',
      shopId: 's_minhphuong',
      shopName: 'MINH PHƯƠNG PC',
      isMall: false,
      name: 'Bộ Phát Router WiFi 6 TP-Link Archer AX12 Băng Tần Kép',
      price: 680000,
      originalPrice: 950000,
      variant: 'Archer AX12',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
      quantity: 2,
      checked: false,
    },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coins, setCoins] = useState(5000); // Start with 5000 coins

  const addToCart = (item: Omit<CartItem, 'id' | 'checked'>) => {
    // Check if same product & variant exists
    const existingIdx = cart.findIndex(c => c.productId === item.productId && c.variant === item.variant);
    if (existingIdx >= 0) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += item.quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, id: Math.random().toString(), checked: true }]);
    }
  };

  const toggleCheckItem = (id: string) => {
    setCart(cart.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const toggleCheckShop = (shopId: string, isChecked: boolean) => {
    setCart(cart.map(c => c.shopId === shopId ? { ...c, checked: isChecked } : c));
  };

  const toggleCheckAll = (isChecked: boolean) => {
    setCart(cart.map(c => ({ ...c, checked: isChecked })));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQ = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQ };
      }
      return c;
    }));
  };

  const checkout = (usedCoins: number) => {
    const checkedItems = cart.filter(c => c.checked);
    if (checkedItems.length === 0) return;

    const total = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - usedCoins;

    const newOrder: Order = {
      id: 'ORD' + Math.floor(Math.random() * 1000000),
      date: new Date().toISOString(),
      total: Math.max(0, total),
      status: 'Chờ xác nhận',
      items: checkedItems,
    };

    setOrders([newOrder, ...orders]);
    setCoins(Math.max(0, coins - usedCoins));
    setCart(cart.filter(c => !c.checked)); // Remove checked items from cart
  };

  return (
    <ShoppingContext.Provider value={{ cart, orders, coins, addToCart, toggleCheckItem, toggleCheckShop, toggleCheckAll, updateQuantity, checkout }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error('useShopping must be used within ShoppingProvider');
  return context;
}
