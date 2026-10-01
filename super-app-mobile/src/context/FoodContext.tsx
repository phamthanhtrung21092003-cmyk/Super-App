import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SelectedOption {
  name: string;
  price: number;
}

export interface FoodCartItem {
  cartItemId: string; // Unique hash based on item + options
  menuItemId: string;
  name: string;
  basePrice: number;
  image?: string;
  quantity: number;
  size?: SelectedOption;
  toppings: SelectedOption[];
  notes?: string;
  itemUnitPrice: number; // basePrice + size.price + sum(toppings.price)
  totalPrice: number;    // itemUnitPrice * quantity
}

export interface FoodRestaurant {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
}

export interface FoodActiveOrder {
  id: string;
  orderCode: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  deliveryAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'FINDING_DRIVER' | 'DRIVER_ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'COD' | 'WALLET' | 'VIETQR';
  items: FoodCartItem[];
  createdAt: string;
}

interface ShippingFeeCalculation {
  distanceKm: number;
  originalShippingFee: number;
  discountAmount: number;
  finalShippingFee: number;
  isFreeship: boolean;
  remainingForFreeship: number;
  freeshipThreshold: number;
  baseStorePrice?: number;
  merchantEarning?: number;
  appGrossProfit?: number;
  appNetProfit?: number;
}

interface FoodContextType {
  cart: FoodCartItem[];
  restaurant: FoodRestaurant | null;
  conflictModalVisible: boolean;
  pendingItem: { item: Omit<FoodCartItem, 'cartItemId' | 'itemUnitPrice' | 'totalPrice'>; restaurant: FoodRestaurant } | null;
  activeOrder: FoodActiveOrder | null;
  subtotal: number;
  shippingFeeInfo: ShippingFeeCalculation;
  addToCart: (item: Omit<FoodCartItem, 'cartItemId' | 'itemUnitPrice' | 'totalPrice'>, rest: FoodRestaurant) => void;
  confirmReplaceRestaurantCart: () => void;
  cancelReplaceRestaurantCart: () => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  placeOrder: (deliveryAddress: string, paymentMethod: 'COD' | 'WALLET' | 'VIETQR', noteForMerchant?: string, noteForDriver?: string) => Promise<FoodActiveOrder>;
  setActiveOrder: (order: FoodActiveOrder | null) => void;
  updateOrderStatus: (status: FoodActiveOrder['status']) => void;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

/**
 * Hàm làm tròn khoảng cách theo chuẩn của Founder:
 * - 0.7, 0.8, 0.9, 1, 1.1, 1.2 -> 1.0 km
 * - 1.3, 1.4, 1.5, 1.6 -> 1.5 km
 * - 1.7, 1.8, 1.9, 2, 2.1, 2.2 -> 2.0 km
 */
export function roundDistanceKm(rawDistance: number): number {
  const d = Math.max(0.1, rawDistance);
  const n = Math.floor(d);
  const r = Number((d - n).toFixed(2));
  if (r >= 0.7) {
    return n + 1; // 0.7 - 0.9 -> (n + 1).0
  } else if (r >= 0.3) {
    return n + 0.5; // 0.3 - 0.6 -> n.5
  } else {
    return n === 0 ? 0.5 : n; // 0.0 - 0.2 -> n.0
  }
}

export function FoodProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<FoodCartItem[]>([]);
  const [restaurant, setRestaurant] = useState<FoodRestaurant | null>(null);
  const [activeOrder, setActiveOrder] = useState<FoodActiveOrder | null>(null);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    item: Omit<FoodCartItem, 'cartItemId' | 'itemUnitPrice' | 'totalPrice'>;
    restaurant: FoodRestaurant;
  } | null>(null);

  // Khôi phục giỏ hàng và đơn đang hoạt động từ bộ nhớ
  useEffect(() => {
    (async () => {
      try {
        const savedCart = await AsyncStorage.getItem('@food_cart');
        const savedRest = await AsyncStorage.getItem('@food_restaurant');
        const savedOrder = await AsyncStorage.getItem('@food_active_order');
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedRest) setRestaurant(JSON.parse(savedRest));
        if (savedOrder) setActiveOrder(JSON.parse(savedOrder));
      } catch (e) {}
    })();
  }, []);

  // Lưu giỏ hàng khi có biến động
  useEffect(() => {
    AsyncStorage.setItem('@food_cart', JSON.stringify(cart)).catch(() => {});
    AsyncStorage.setItem('@food_restaurant', JSON.stringify(restaurant)).catch(() => {});
  }, [cart, restaurant]);

  useEffect(() => {
    if (activeOrder) {
      AsyncStorage.setItem('@food_active_order', JSON.stringify(activeOrder)).catch(() => {});
    } else {
      AsyncStorage.removeItem('@food_active_order').catch(() => {});
    }
  }, [activeOrder]);

  // Tính tổng tiền các món (giá khách trả trên app)
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  /**
   * Tính toán phí ship chuẩn theo quy định của Founder:
   * - Khoảng cách <= 3km: 15.000đ
   * - Số chẵn (4km, 5km...): 15k + (N - 3) * 5k (4km: 20k, 5km: 25k)
   * - Số lẻ (3.5km, 4.5km, 5.5km...): cộng thêm 3k so với số chẵn (3.5km: 18k, 4.5km: 23k, 5.5km: 28k)
   * - Freeship:
   *   + Dưới 3km: đơn từ 200k
   *   + 4km: đơn từ 300k
   *   + Cứ mỗi 1km cộng thêm 100k (3.5km là 250k, 4.5km là 350k)
   * - Hạch toán: Tiền freeship trừ vào tiền lãi của App (20% giá gốc niêm yết)
   */
  const calculateFee = (sub: number, distance = 3.5): ShippingFeeCalculation => {
    const d = roundDistanceKm(distance);

    let base = 15000;
    if (d > 3) {
      const n = Math.floor(d);
      const baseForN = 15000 + (n - 3) * 5000;
      if (d === n) {
        base = baseForN;
      } else {
        base = baseForN + 3000; // Số lẻ .5 cộng thêm 3k
      }
    }

    // Ngưỡng Freeship theo km
    let freeshipThreshold = 200000;
    if (d > 3) {
      freeshipThreshold = 200000 + Math.round((d - 3) * 100000);
    }

    const isFreeship = sub >= freeshipThreshold;
    const discount = isFreeship ? base : 0;
    const finalShippingFee = isFreeship ? 0 : base;
    const remainingForFreeship = Math.max(0, freeshipThreshold - sub);

    // Hạch toán tài chính 3 bên:
    const baseStorePrice = Math.round(sub / 1.1); // Giá niêm yết tại quán = 100%
    const merchantEarning = Math.round(baseStorePrice * 0.9); // Quán nhận 90% (chịu chiết khấu 10%)
    const appGrossProfit = Math.round(baseStorePrice * 0.2); // Lãi gộp App 20% (110% - 90%)
    const appNetProfit = appGrossProfit - discount; // Lãi ròng App sau khi trừ phí ship tài trợ

    return {
      distanceKm: d,
      originalShippingFee: base,
      discountAmount: discount,
      finalShippingFee,
      isFreeship,
      remainingForFreeship,
      freeshipThreshold,
      baseStorePrice,
      merchantEarning,
      appGrossProfit,
      appNetProfit,
    };
  };

  const currentDistance = restaurant ? 1.8 : 3.5;
  const shippingFeeInfo = calculateFee(subtotal, currentDistance);

  // Helper tạo ID duy nhất cho món kèm option
  const generateCartItemId = (
    menuItemId: string,
    size?: SelectedOption,
    toppings?: SelectedOption[],
  ) => {
    const sizeStr = size ? size.name : 'default';
    const topStr = toppings && toppings.length > 0 ? toppings.map((t) => t.name).sort().join(',') : 'none';
    return `${menuItemId}_${sizeStr}_${topStr}`;
  };

  const internalAddToCart = (
    itemData: Omit<FoodCartItem, 'cartItemId' | 'itemUnitPrice' | 'totalPrice'>,
    targetRestaurant: FoodRestaurant,
  ) => {
    const toppingSum = itemData.toppings.reduce((s, t) => s + t.price, 0);
    const sizePrice = itemData.size ? itemData.size.price : 0;
    const unitPrice = itemData.basePrice + sizePrice + toppingSum;
    const cartItemId = generateCartItemId(itemData.menuItemId, itemData.size, itemData.toppings);

    setRestaurant(targetRestaurant);
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const next = [...prevCart];
        const newQty = next[existingIdx].quantity + itemData.quantity;
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return next;
      } else {
        const newItem: FoodCartItem = {
          ...itemData,
          cartItemId,
          itemUnitPrice: unitPrice,
          totalPrice: unitPrice * itemData.quantity,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const addToCart = (
    item: Omit<FoodCartItem, 'cartItemId' | 'itemUnitPrice' | 'totalPrice'>,
    targetRestaurant: FoodRestaurant,
  ) => {
    // Nếu trong giỏ đã có món từ quán khác -> Hiển thị popup xung đột quán
    if (restaurant && restaurant.id !== targetRestaurant.id && cart.length > 0) {
      setPendingItem({ item, restaurant: targetRestaurant });
      setConflictModalVisible(true);
      return;
    }

    internalAddToCart(item, targetRestaurant);
  };

  const confirmReplaceRestaurantCart = () => {
    if (pendingItem) {
      setCart([]);
      internalAddToCart(pendingItem.item, pendingItem.restaurant);
      setPendingItem(null);
      setConflictModalVisible(false);
    }
  };

  const cancelReplaceRestaurantCart = () => {
    setPendingItem(null);
    setConflictModalVisible(false);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (idx === -1) return prev;
      const current = prev[idx];
      const newQty = current.quantity + delta;
      if (newQty <= 0) {
        const updated = prev.filter((i) => i.cartItemId !== cartItemId);
        if (updated.length === 0) setRestaurant(null);
        return updated;
      }
      const updated = [...prev];
      updated[idx] = {
        ...current,
        quantity: newQty,
        totalPrice: current.itemUnitPrice * newQty,
      };
      return updated;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.cartItemId !== cartItemId);
      if (updated.length === 0) setRestaurant(null);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setRestaurant(null);
  };

  const placeOrder = async (
    deliveryAddress: string,
    paymentMethod: 'COD' | 'WALLET' | 'VIETQR',
    noteForMerchant?: string,
    noteForDriver?: string,
  ): Promise<FoodActiveOrder> => {
    const orderCode = `#FD-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAmount = subtotal + shippingFeeInfo.finalShippingFee;

    const newOrder: FoodActiveOrder = {
      id: `ord_${Date.now()}`,
      orderCode,
      restaurantId: restaurant?.id || 'rest_demo',
      restaurantName: restaurant?.name || 'Nhà hàng Super App',
      restaurantAddress: restaurant?.address,
      deliveryAddress,
      subtotal,
      shippingFee: shippingFeeInfo.finalShippingFee,
      discountAmount: shippingFeeInfo.discountAmount,
      totalAmount: finalAmount,
      status: 'PENDING',
      paymentMethod,
      items: [...cart],
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (status: FoodActiveOrder['status']) => {
    if (activeOrder) {
      setActiveOrder({ ...activeOrder, status });
    }
  };

  return (
    <FoodContext.Provider
      value={{
        cart,
        restaurant,
        conflictModalVisible,
        pendingItem,
        activeOrder,
        subtotal,
        shippingFeeInfo,
        addToCart,
        confirmReplaceRestaurantCart,
        cancelReplaceRestaurantCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        setActiveOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
}
