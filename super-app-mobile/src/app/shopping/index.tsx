import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, useWindowDimensions, TextInput, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolateColor } from 'react-native-reanimated';
import { useShopping } from '../../context/ShoppingContext';
import { useUser } from '../../context/UserContext';

const T = {
  black: '#111827',
  white: '#FFFFFF',
  bg: '#F3F4F6',
  sub: '#6B7280',
  border: '#E5E7EB',
  green: '#00B14F',      // Vibrant Green primary (Shopee Green / Grab Green)
  greenDark: '#00883C',  // Darker green for top status bar
  greenLight: '#E6F4EA', // Soft green background tint
  red: '#EE4D2D',        // Discount badge red
  gold: '#F59E0B',
  orange: '#00B14F',     // Map legacy orange references to vibrant Green
  orangeLight: '#E6F4EA',
};

export const MOCK_PRODUCTS = [
  { id: 'p1', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'iPhone 15 Pro Max', price: 29990000, originalPrice: 34990000, sold: '15.2k', rating: 4.9, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', variants: ['Titan Tự Nhiên', 'Titan Đen'] },
  { id: 'p2', shopId: 's2', shopName: 'Minimalist Studio', isMall: true, name: 'Essential Cotton Tee', price: 450000, originalPrice: 600000, sold: '5.1k', rating: 4.8, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', variants: ['Onyx Black', 'Pure White'] },
  { id: 'p3', shopId: 's3', shopName: 'Aura Skincare', isMall: true, name: 'Hydrating Serum', price: 850000, originalPrice: 1200000, sold: '2.4k', rating: 4.9, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', variants: ['50ml', '100ml'] },
  { id: 'p4', shopId: 's4', shopName: 'Urban Kicks', isMall: false, name: 'Classic White Sneakers', price: 1250000, originalPrice: 1500000, sold: '1.2k', rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', variants: ['Size 39', 'Size 40', 'Size 41'] },
  { id: 'p5', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'AirPods Pro Gen 2', price: 5490000, originalPrice: 6100000, sold: '8.5k', rating: 4.9, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', variants: ['Tiêu Chuẩn'] },
  { id: 'p6', shopId: 's2', shopName: 'Minimalist Studio', isMall: true, name: 'Lounge Shorts', price: 350000, originalPrice: 450000, sold: '3.3k', rating: 4.8, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', variants: ['Black', 'Grey'] },
  { id: 'p7', shopId: 's5', shopName: 'Sony Audio', isMall: true, name: 'Sony WH-1000XM5 Headphones', price: 6500000, originalPrice: 8490000, sold: '6.5k', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', variants: ['Black', 'Silver'] },
  { id: 'p8', shopId: 's6', shopName: 'Keychron VN', isMall: true, name: 'Bàn phím cơ Keychron K2 V2', price: 2150000, originalPrice: 2500000, sold: '4.1k', rating: 4.8, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', variants: ['Red Switch', 'Brown Switch', 'Blue Switch'] },
  { id: 'p9', shopId: 's7', shopName: 'Lusso Leather', isMall: false, name: 'Túi da đeo chéo nam/nữ', price: 1850000, originalPrice: 2200000, sold: '980', rating: 4.6, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', variants: ['Nâu Bò', 'Đen Tuyển'] },
  { id: 'p10', shopId: 's8', shopName: 'Luxe Scents', isMall: true, name: 'Nước hoa Dior Sauvage EDP 100ml', price: 3250000, originalPrice: 3800000, sold: '2.8k', rating: 4.9, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', variants: ['100ml'] },
  { id: 'p11', shopId: 's9', shopName: 'Samsung Mall', isMall: true, name: 'Samsung Galaxy S24 Ultra 5G', price: 26990000, originalPrice: 31990000, sold: '9.2k', rating: 4.8, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', variants: ['Xám Titan', 'Đen Titan'] },
  { id: 'p12', shopId: 's2', shopName: 'Minimalist Studio', isMall: true, name: 'Áo khoác Denim Oversized', price: 650000, originalPrice: 850000, sold: '1.5k', rating: 4.7, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', variants: ['Light Blue', 'Dark Blue'] },
  { id: 'p13', shopId: 's10', shopName: 'Anker Authorized', isMall: true, name: 'Sạc dự phòng Anker PowerCore 20000', price: 950000, originalPrice: 1300000, sold: '8.4k', rating: 4.8, image: 'https://images.unsplash.com/photo-1609592424109-dd77bf94901f?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Trắng'] },
  { id: 'p14', shopId: 's11', shopName: 'Nike Official Store', isMall: true, name: "Giày Thể Thao Nike Air Force 1 '07", price: 2900000, originalPrice: 3500000, sold: '12.5k', rating: 4.9, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', variants: ['Size 40', 'Size 41', 'Size 42'] },
  { id: 'p15', shopId: 's12', shopName: 'Nordic Light', isMall: false, name: 'Đèn để bàn học và làm việc', price: 450000, originalPrice: 600000, sold: '1.1k', rating: 4.7, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', variants: ['Trắng Thân Gỗ', 'Đen Kim Loại'] },
  { id: 'p16', shopId: 's13', shopName: 'Uji Tea House', isMall: false, name: 'Bột Trà Xanh Matcha Uji Nhật Bản 100g', price: 250000, originalPrice: 320000, sold: '5.2k', rating: 4.9, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', variants: ['Gói 100g'] },
  // [NEW] Cập nhật chi tiết sản phẩm theo hãng/dòng theo yêu cầu
  { id: 'p17', shopId: 's9', shopName: 'Samsung Mall', isMall: true, name: 'Samsung Galaxy A55 5G 128GB', price: 9290000, originalPrice: 9990000, sold: '2.5k', rating: 4.7, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', variants: ['Xanh Dương', 'Đen'] },
  { id: 'p18', shopId: 's9', shopName: 'Samsung Mall', isMall: true, name: 'Samsung Galaxy Note 20 Ultra 5G', price: 12500000, originalPrice: 14500000, sold: '5.8k', rating: 4.8, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', variants: ['Đồng Ánh Kim', 'Đen'] },
  { id: 'p19', shopId: 's10', shopName: 'Xiaomi Store', isMall: true, name: 'Xiaomi Redmi Note 13 Pro 4G', price: 5990000, originalPrice: 7290000, sold: '10.2k', rating: 4.8, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Xanh Lá'] },
  { id: 'p20', shopId: 's10', shopName: 'Xiaomi Store', isMall: true, name: 'Xiaomi 14 Ultra 5G 512GB', price: 29990000, originalPrice: 32990000, sold: '650', rating: 4.9, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Trắng'] },
  { id: 'p21', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'iPhone 14 Pro 128GB', price: 22490000, originalPrice: 24990000, sold: '14.5k', rating: 4.8, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', variants: ['Tím Đậm', 'Vàng'] },
  { id: 'p22', shopId: 's14', shopName: 'OPPO Authorized', isMall: true, name: 'OPPO Reno11 Pro 5G 512GB', price: 14990000, originalPrice: 16990000, sold: '3.1k', rating: 4.7, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', variants: ['Xám', 'Trắng'] },
  { id: 'p23', shopId: 's1', shopName: 'Apple Premium', isMall: true, name: 'iPhone 13 128GB Chính Hãng VN/A', price: 13490000, originalPrice: 16990000, sold: '25.8k', rating: 4.8, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Trắng', 'Xanh Dương'] },
  { id: 'p24', shopId: 's10', shopName: 'Xiaomi Store', isMall: true, name: 'Xiaomi Redmi A3 (4GB/128GB)', price: 2490000, originalPrice: 2990000, sold: '8.1k', rating: 4.6, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Xanh Dương'] },
  { id: 'p25', shopId: 's14', shopName: 'OPPO Authorized', isMall: true, name: 'OPPO Find N3 Flip 5G', price: 19990000, originalPrice: 22990000, sold: '420', rating: 4.9, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', variants: ['Vàng', 'Đen'] },
  { id: 'p26', shopId: 's14', shopName: 'OPPO Authorized', isMall: true, name: 'OPPO A58 128GB', price: 4290000, originalPrice: 4990000, sold: '6.3k', rating: 4.7, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', variants: ['Đen', 'Xanh Lá'] },
  { id: 'p27', shopId: 's15', shopName: 'ASUS Official Store', isMall: true, name: 'ASUS ROG Zephyrus G14 OLED', price: 42990000, originalPrice: 47990000, sold: '180', rating: 4.9, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', variants: ['Xám', 'Trắng'] },
  { id: 'p28', shopId: 's16', shopName: 'Dell Authorised Store', isMall: true, name: 'Dell XPS 13 Plus 9320', price: 38990000, originalPrice: 41990000, sold: '320', rating: 4.8, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', variants: ['Bạc', 'Đen'] },
  { id: 'p29', shopId: 's8', shopName: 'Luxe Scents & Beauty', isMall: true, name: 'Son Lì MAC Matte Lipstick', price: 650000, originalPrice: 800000, sold: '12.4k', rating: 4.9, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', variants: ['Velvet Teddy', 'Ruby Woo'] },
  { id: 'p30', shopId: 's17', shopName: 'Wilson Sports', isMall: true, name: 'Vợt Tennis Wilson Pro Staff v14', price: 5490000, originalPrice: 6200000, sold: '650', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', variants: ['315g', '290g'] },
  // [NEW] Sản phẩm của các Shop khác nhau để tăng tính đa dạng nhà bán hàng
  { id: 'p31', shopId: 's18', shopName: 'CellphoneS Store', isMall: true, name: 'Samsung Galaxy S24 Ultra 5G (Cty)', price: 25990000, originalPrice: 31990000, sold: '3.1k', rating: 4.8, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', variants: ['Xám', 'Đen'] },
  { id: 'p32', shopId: 's19', shopName: 'Di Động Việt', isMall: false, name: 'Samsung Galaxy S24 Ultra 256GB', price: 25490000, originalPrice: 31990000, sold: '1.5k', rating: 4.7, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', variants: ['Xám', 'Đen'] },
  { id: 'p33', shopId: 's20', shopName: 'Hoàng Hà Mobile', isMall: false, name: 'iPhone 15 Pro Max 256GB VNA', price: 28990000, originalPrice: 34990000, sold: '12.1k', rating: 4.8, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', variants: ['Titan'] },
  { id: 'p34', shopId: 's21', shopName: 'ShopDunk Authorized', isMall: true, name: 'iPhone 15 Pro Max 256GB', price: 29490000, originalPrice: 34990000, sold: '4.8k', rating: 4.9, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', variants: ['Titan'] },
  { id: 'p35', shopId: 's20', shopName: 'Hoàng Hà Mobile', isMall: false, name: 'Xiaomi 14 Ultra 5G 16GB/512GB', price: 28490000, originalPrice: 32990000, sold: '850', rating: 4.8, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', variants: ['Đen'] },
  { id: 'p36', shopId: 's22', shopName: 'Thế Giới Di Động', isMall: true, name: 'OPPO Reno11 Pro 5G Chính Hãng', price: 14590000, originalPrice: 16990000, sold: '4.2k', rating: 4.8, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', variants: ['Trắng'] }
];

const CATEGORY_TREE: Record<string, {
  name: string;
  subcategories: {
    name: string;
    series: {
      name: string;
      products: string[];
    }[];
  }[];
}> = {
  'c1': {
    name: 'Thời trang',
    subcategories: [
      {
        name: 'Quần áo',
        series: [
          { name: 'Áo thun Form Rộng', products: ['p2', 'p12'] },
          { name: 'Quần Shorts', products: ['p6'] },
        ]
      },
      {
        name: 'Giày dép & Túi xách',
        series: [
          { name: 'Giày Classic White', products: ['p4'] },
          { name: 'Giày Nike Air Force 1', products: ['p14'] },
          { name: 'Túi da nam/nữ', products: ['p9'] },
        ]
      }
    ]
  },
  'c2': {
    name: 'Điện thoại',
    subcategories: [
      {
        name: 'Apple (iPhone)',
        series: [
          { name: 'iPhone 15 Series', products: ['p1', 'p33', 'p34'] },
          { name: 'iPhone 14 Series', products: ['p21'] },
          { name: 'iPhone 13 Series', products: ['p23'] },
          { name: 'Phụ kiện AirPods', products: ['p5'] },
        ]
      },
      {
        name: 'Samsung',
        series: [
          { name: 'Galaxy S Series', products: ['p11', 'p31', 'p32'] },
          { name: 'Galaxy A Series', products: ['p17'] },
          { name: 'Galaxy Note Series', products: ['p18'] },
        ]
      },
      {
        name: 'Xiaomi',
        series: [
          { name: 'Xiaomi Flagship', products: ['p20', 'p35'] },
          { name: 'Redmi Note Series', products: ['p19'] },
          { name: 'Redmi A Series', products: ['p24'] },
        ]
      },
      {
        name: 'OPPO',
        series: [
          { name: 'OPPO Find Series', products: ['p25'] },
          { name: 'OPPO Reno Series', products: ['p22', 'p36'] },
          { name: 'OPPO A Series', products: ['p26'] },
        ]
      }
    ]
  },
  'c3': {
    name: 'Laptop',
    subcategories: [
      {
        name: 'Apple MacBook',
        series: [
          { name: 'MacBook Air Series', products: ['p11'] },
        ]
      },
      {
        name: 'ASUS ROG / TUF',
        series: [
          { name: 'ROG Gaming', products: ['p27'] },
        ]
      },
      {
        name: 'Dell XPS',
        series: [
          { name: 'Dell XPS 13', products: ['p28'] },
        ]
      }
    ]
  },
  'c4': {
    name: 'Làm đẹp',
    subcategories: [
      {
        name: 'Chăm sóc da',
        series: [
          { name: 'Serum & Tinh chất', products: ['p3'] },
        ]
      },
      {
        name: 'Nước hoa',
        series: [
          { name: 'Nước hoa Dior', products: ['p10'] },
        ]
      },
      {
        name: 'Trang điểm',
        series: [
          { name: 'Son môi Mac', products: ['p29'] },
        ]
      }
    ]
  },
  'c5': {
    name: 'Gia dụng',
    subcategories: [
      {
        name: 'Thiết bị gia đình',
        series: [
          { name: 'Đèn để bàn Nordic', products: ['p15'] },
          { name: 'Đồ uống Matcha Uji', products: ['p16'] },
        ]
      },
      {
        name: 'Thiết bị âm thanh',
        series: [
          { name: 'Tai nghe Bluetooth Sony', products: ['p7'] },
        ]
      },
      {
        name: 'Phụ kiện công nghệ',
        series: [
          { name: 'Bàn phím cơ Keychron', products: ['p8'] },
          { name: 'Sạc dự phòng Anker', products: ['p13'] },
        ]
      }
    ]
  },
  'c6': {
    name: 'Thể thao',
    subcategories: [
      {
        name: 'Trang phục thể thao',
        series: [
          { name: 'Áo thun thể thao nam/nữ', products: ['p2'] },
        ]
      },
      {
        name: 'Dụng cụ thể thao',
        series: [
          { name: 'Vợt Tennis', products: ['p30'] },
        ]
      }
    ]
  }
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function PremiumHome() {
  const router = useRouter();
  const { cart } = useShopping();
  const { accentHex, accentRgb } = useUser();
  const scrollY = useSharedValue(0);
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 768 && !isMobileUA;

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchHistory, setSearchHistory] = useState(['iPhone 15', 'Giày trắng', 'Serum cấp ẩm']);
  const [pinnedKeywords, setPinnedKeywords] = useState<string[]>(['Serum cấp ẩm']);
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);
  const [flashSaleSecs, setFlashSaleSecs] = useState(5040); // 1h 24m
  
  // Grid Tab Filter State
  const [activeGridTab, setActiveGridTab] = useState<'forYou' | 'hot' | 'mall'>('forYou');

  // Advanced Filters & Sort States
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterMall, setFilterMall] = useState(false);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState<'rel' | 'sold' | 'new' | 'priceAsc' | 'priceDesc'>('rel');

  // Category Browser States
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubcatIndex, setSelectedSubcatIndex] = useState(0);

  // Modals for AI Search utils
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // AI Assistant Chat States
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<any[]>([
    { id: '1', sender: 'ai', text: 'Xin chào Phạm Thành Trung! Tôi là Trợ lý Mua Sắm AI. Bạn cần tìm kiếm hay tư vấn sản phẩm gì hôm nay?' }
  ]);

  const handleSendAIChat = () => {
    if (!aiQuery.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: aiQuery };
    setAiMessages(prev => [...prev, userMsg]);
    
    // Simulate AI response based on query keywords
    const textLower = aiQuery.toLowerCase();
    let reply = 'Tôi hiểu rồi. Bạn có thể xem danh sách sản phẩm gợi ý đặc sắc ở đây:';
    let matchedProducts = MOCK_PRODUCTS.slice(0, 2);

    if (textLower.includes('iphone') || textLower.includes('thoại')) {
      reply = 'Dựa trên phân tích AI, iPhone 15 Pro Max là sản phẩm tốt nhất với camera 5x và viền Titan siêu nhẹ. Bạn xem thử nhé:';
      matchedProducts = MOCK_PRODUCTS.filter(p => p.id === 'p1');
    } else if (textLower.includes('giày') || textLower.includes('sneaker')) {
      reply = 'Đây là sản phẩm Giày Sneakers Thể Thao cực nhẹ và êm chân phù hợp với xu hướng năng động của bạn:';
      matchedProducts = MOCK_PRODUCTS.filter(p => p.id === 'p2');
    } else if (textLower.includes('áo') || textLower.includes('thời trang')) {
      reply = 'Mẫu Áo thun nam/nữ form rộng Unisex chất cotton thoáng mát đang rất bán chạy tại shop:';
      matchedProducts = MOCK_PRODUCTS.filter(p => p.id === 'p3');
    }

    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        products: matchedProducts
      }]);
    }, 800);

    setAiQuery('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleSecs(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleClaimVoucher = (code: string) => {
    if (claimedVouchers.includes(code)) return;
    setClaimedVouchers([...claimedVouchers, code]);
    Alert.alert('Thành công', `Đã lưu mã giảm giá ${code}!`);
  };

  const handleSearchSubmit = (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;
    setSearchQuery(cleanQuery);
    
    setSearchHistory(prev => {
      const filtered = prev.filter(x => x !== cleanQuery);
      return [cleanQuery, ...filtered].slice(0, 100);
    });

    // 🤖 AI NLP intent recognition simulation
    const lower = cleanQuery.toLowerCase();
    if (lower.includes('dưới 10 triệu')) {
      setMaxPrice('10000000');
      setMinPrice('');
    } else if (lower.includes('dưới 2 triệu')) {
      setMaxPrice('2000000');
      setMinPrice('');
    } else if (lower.includes('dưới 500k') || lower.includes('dưới 500.000')) {
      setMaxPrice('500000');
      setMinPrice('');
    } else if (lower.includes('trên 5 triệu')) {
      setMinPrice('5000000');
      setMaxPrice('');
    }

    if (lower.includes('mall') || lower.includes('chính hãng')) {
      setFilterMall(true);
    }
  };

  const togglePinKeyword = (kw: string) => {
    if (pinnedKeywords.includes(kw)) {
      setPinnedKeywords(prev => prev.filter(x => x !== kw));
    } else {
      setPinnedKeywords(prev => [...prev, kw]);
    }
  };

  const deleteHistoryItem = (kw: string) => {
    setSearchHistory(prev => prev.filter(x => x !== kw));
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = {
    backgroundColor: T.orange,
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="#00883C" translucent={false} />
      
      {/* 🟢 GREEN TOP HEADER (Shopee Green Theme) */}
      <View style={S.headerGreen}>
        <SafeAreaView style={{ backgroundColor: '#00B14F' }}>
          <View style={S.headerGreenRow}>
            {/* Back to main app */}
            <TouchableOpacity onPress={() => router.replace('/utilities')} style={{ paddingRight: 6 }}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            {/* Search Input Box */}
            <TouchableOpacity style={S.greenSearchBox} onPress={() => setShowSearchOverlay(true)} activeOpacity={0.9}>
              <Ionicons name="search-outline" size={18} color="#00B14F" style={{ marginRight: 6 }} />
              <Text style={S.greenSearchTxt} numberOfLines={1}>{searchQuery || 'USB To 3.5'}</Text>
              <Ionicons name="camera-outline" size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Right Icons: Cart (99+) & Chat (33) */}
            <View style={S.headerIconsRight}>
              <TouchableOpacity onPress={() => router.push('/shopping/cart')} style={S.headerIconBadgeWrap}>
                <Ionicons name="cart-outline" size={24} color="#FFF" />
                <View style={S.topBadge}><Text style={S.topBadgeTxt}>99+</Text></View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Tin nhắn', 'Mở danh sách trò chuyện')} style={S.headerIconBadgeWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={23} color="#FFF" />
                <View style={S.topBadge}><Text style={S.topBadgeTxt}>33</Text></View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 💳 FLOATING TOP WIDGET STRIP (Overlapping Card: ShopeePay, Điểm danh, SPayLater, Xu) */}
        <View style={S.widgetStripCard}>
          <TouchableOpacity style={S.widgetStripItem} onPress={() => Alert.alert('ShopeePay', 'Mở ví ShopeePay')}>
            <View style={[S.widgetIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="card" size={16} color="#00B14F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.widgetTitle} numberOfLines={1}>ShopeePay</Text>
              <Text style={S.widgetSub} numberOfLines={1}>Giảm đến 40.000Đ mua sắm mỗi ng...</Text>
            </View>
          </TouchableOpacity>

          <View style={S.widgetDivider} />

          <TouchableOpacity style={S.widgetStripItem} onPress={() => Alert.alert('Điểm danh', 'Đã nhận +500 Xu thưởng!')}>
            <View style={[S.widgetIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="gift" size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.widgetTitle} numberOfLines={1}>Điểm danh</Text>
              <Text style={S.widgetSub} numberOfLines={1}>Để nhận Xu!</Text>
            </View>
          </TouchableOpacity>

          <View style={S.widgetDivider} />

          <TouchableOpacity style={S.widgetStripItem} onPress={() => Alert.alert('SPayLater', 'Đã mở ví SPayLater')}>
            <View style={[S.widgetIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="flash" size={16} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.widgetTitle} numberOfLines={1}>SPayLater</Text>
              <Text style={S.widgetSub} numberOfLines={1}>Kích hoạt nhận voucher 150.000Đ</Text>
            </View>
          </TouchableOpacity>

          <View style={S.widgetDivider} />

          <TouchableOpacity style={S.widgetCoinBtn} onPress={() => Alert.alert('Thưởng Xu', 'Tích xu thưởng mua sắm')}>
            <View style={S.coinCircle}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#D97706' }}>S</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🛍️ CATEGORY ICON GRID (Horizontal Scrollable Grid with Pill Indicator) */}
        <View style={S.catGridSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 12 }}>
            {[
              { id: 'app1', name: 'ShopeeFood\nFlash Sale 50%', icon: '🍔', bg: '#FEE2E2' },
              { id: 'app2', name: 'Shopee Mart', icon: '🛒', bg: '#E0F2FE' },
              { id: 'app3', name: 'ShopeeVIP', icon: '👑', bg: '#FEF3C7' },
              { id: 'app4', name: 'Deal Từ 1.000Đ', icon: '🏷️', bg: '#DCFCE7' },
              { id: 'app5', name: 'Shopee Siêu Rẻ', icon: '⚡', bg: '#F3E8FF' },
              { id: 'app6', name: 'Mã Giảm Giá', icon: '🎟️', bg: '#FFEDD5' },
              { id: 'app7', name: 'Nạp Thẻ & Dịch Vụ', icon: '📱', bg: '#E0E7FF' },
              { id: 'app8', name: 'Hàng Bán Chạy', icon: '🔥', bg: '#FEE2E2' },
            ].map(app => (
              <TouchableOpacity key={app.id} style={S.catAppItem} onPress={() => setShowCategoryBrowser(true)}>
                <View style={[S.catAppIconWrap, { backgroundColor: app.bg }]}>
                  <Text style={{ fontSize: 22 }}>{app.icon}</Text>
                </View>
                <Text style={S.catAppText}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Scroll progress bar indicator */}
          <View style={S.catIndicatorTrack}>
            <View style={S.catIndicatorPill} />
          </View>
        </View>

        {/* 🎥 LIVE & VIDEO DUAL CARDS SECTION (Side-by-side) */}
        <View style={S.liveVideoSection}>
          {/* SHOPEE LIVE */}
          <View style={S.mediaCol}>
            <TouchableOpacity style={S.mediaHeaderRow} onPress={() => router.push('/shopping/live')}>
              <Text style={S.mediaSecTitle}>SHOPEE LIVE</Text>
              <Ionicons name="chevron-forward" size={14} color="#00B14F" />
            </TouchableOpacity>
            <View style={S.mediaThumbRow}>
              <TouchableOpacity style={S.mediaThumbCard} onPress={() => router.push('/shopping/live')}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=300' }} style={S.mediaThumbImg} />
                <View style={S.liveBadgeSmall}>
                  <View style={S.redDotPulse} />
                  <Text style={S.liveBadgeTxtSmall}>LIVE</Text>
                </View>
                <Text style={S.mediaThumbTxt} numberOfLines={1}>salevbvbnbbbnv vjv</Text>
              </TouchableOpacity>

              <TouchableOpacity style={S.mediaThumbCard} onPress={() => router.push('/shopping/live')}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300' }} style={S.mediaThumbImg} />
                <View style={S.liveBadgeSmall}>
                  <View style={S.redDotPulse} />
                  <Text style={S.liveBadgeTxtSmall}>LIVE</Text>
                </View>
                <Text style={S.mediaThumbTxt} numberOfLines={1}>Sale quần áo cầu lông</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SHOPEE VIDEO */}
          <View style={S.mediaCol}>
            <TouchableOpacity style={S.mediaHeaderRow} onPress={() => router.push('/shopping/shorts')}>
              <Text style={S.mediaSecTitle}>SHOPEE VIDEO</Text>
              <Ionicons name="chevron-forward" size={14} color="#00B14F" />
            </TouchableOpacity>
            <View style={S.mediaThumbRow}>
              <TouchableOpacity style={S.mediaThumbCard} onPress={() => router.push('/shopping/shorts')}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }} style={S.mediaThumbImg} />
                <View style={S.videoViewsBadge}>
                  <Ionicons name="play" size={8} color="#FFF" style={{ marginRight: 2 }} />
                  <Text style={S.videoViewsTxt}>140,7k</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={S.mediaThumbCard} onPress={() => router.push('/shopping/shorts')}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' }} style={S.mediaThumbImg} />
                <View style={S.videoViewsBadge}>
                  <Ionicons name="play" size={8} color="#FFF" style={{ marginRight: 2 }} />
                  <Text style={S.videoViewsTxt}>38k</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 🎁 BIG PROMO BANNER & FEATURED PRODUCT FEED (Shopee Grid Layout) */}
        <View style={S.mainFeedRow}>
          {/* Big Vertical Promo Card */}
          <TouchableOpacity style={S.bigPromoCard} onPress={() => Alert.alert('Độc Quyền', 'Tặng bạn đơn 0Đ khi mua hàng hôm nay!')}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500' }} style={StyleSheet.absoluteFillObject} />
            <View style={S.bigPromoOverlay}>
              <View style={S.bigPromoTag}>
                <Text style={S.bigPromoTagTxt}>ĐỘC QUYỀN TRỞ LẠI</Text>
              </View>
              <Text style={S.bigPromoTitle}>SHOPEE TẶNG{'\n'}RIÊNG BẠN ĐƠN</Text>
              <Text style={S.bigPromoPrice0}>0Đ</Text>
              <View style={S.carouselDotsRow}>
                <View style={[S.cDot, S.cDotActive]} />
                <View style={S.cDot} />
                <View style={S.cDot} />
                <View style={S.cDot} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Featured Product Card */}
          <TouchableOpacity style={S.featuredProductCard} onPress={() => router.push('/shopping/product?id=p11')} activeOpacity={0.9}>
            <View style={S.featuredImgWrap}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' }} style={S.featuredImg} />
              <View style={S.discountCornerBadge}>
                <Text style={S.discountCornerTxt}>-19%</Text>
              </View>
              <View style={S.xtraBadgeOverlay}>
                <Text style={S.xtraBadgeTxt}>8.8 VOUCHER XTRA</Text>
              </View>
            </View>

            <View style={S.featuredDetails}>
              <View style={S.favBadgeRow}>
                <View style={S.favBadge}><Text style={S.favBadgeTxt}>Yêu thích</Text></View>
                <Text style={S.featuredProdTitle} numberOfLines={1}>Điện thoại Galaxy S23 Ultra</Text>
              </View>

              <View style={S.ratingRow}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={S.ratingTxt}>4.9</Text>
              </View>

              <View style={S.priceRowShopee}>
                <Text style={S.shopeePrice}>15.690.000đ</Text>
                <Text style={S.soldTxt}>...bán 451</Text>
              </View>

              <View style={S.shipMetaRow}>
                <Ionicons name="car-outline" size={11} color="#00B14F" />
                <Text style={S.shipMetaTxt}>&lt; 2 Ngày</Text>
                <Text style={S.locationMetaTxt}>| Thành phố Hà Nội</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🏢 SELLER & ADMIN BANNERS */}
        <View style={{ paddingHorizontal: 15, gap: 10, marginTop: 15 }}>
          <TouchableOpacity style={[S.mgmtBanner, { backgroundColor: '#DCFCE7', borderColor: '#00B14F' }]} onPress={() => router.push('/shopping/seller')}>
            <Ionicons name="business" size={22} color="#00B14F" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[S.mgmtBannerTitle, { color: '#0F172A' }]}>Kênh Người Bán (Seller Center)</Text>
              <Text style={S.mgmtBannerDesc}>Quản lý sản phẩm, đơn hàng và xem doanh số</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={[S.mgmtBanner, { backgroundColor: 'rgba(15,23,42,0.05)', borderColor: '#64748B' }]} onPress={() => router.push('/shopping/admin')}>
            <Ionicons name="settings" size={24} color="#64748B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[S.mgmtBannerTitle, { color: '#0F172A' }]}>Hệ Thống Admin (Sàn GD)</Text>
              <Text style={S.mgmtBannerDesc}>Kiểm duyệt, phán quyết tranh chấp và phân tích sàn</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* 🤖 AI RECOMMENDATIONS (Giai đoạn 2 & 10) */}
        <View style={S.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginBottom: 15, gap: 6 }}>
            <Ionicons name="sparkles" size={18} color={T.orange} style={{ marginRight: 4 }} />
            <Text style={[S.sectionTitle, { marginLeft: 0, marginBottom: 0 }]}>GỢI Ý HÔM NAY</Text>
          </View>

          {/* 🏷️ FILTER TABS (Shopee style tabs selector) */}
          <View style={S.filterTabsContainer}>
            {[
              { key: 'forYou', label: 'Gợi Ý Cho Bạn', sub: 'Cá nhân hoá' },
              { key: 'hot', label: 'Bán Chạy Nhất', sub: 'Xu hướng mua' },
              { key: 'mall', label: 'Siêu Rẻ Mall', sub: 'Thương hiệu tốt' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[S.filterTabItem, activeGridTab === tab.key && S.filterTabItemActive]}
                onPress={() => setActiveGridTab(tab.key as any)}
                activeOpacity={0.8}
              >
                <Text style={[S.filterTabLabel, activeGridTab === tab.key && { color: T.orange, fontWeight: '800' }]}>{tab.label}</Text>
                <Text style={[S.filterTabSub, activeGridTab === tab.key && { color: T.orange }]}>{tab.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={S.grid}>
            {MOCK_PRODUCTS.filter(p => {
              if (activeGridTab === 'mall') return p.isMall;
              if (activeGridTab === 'hot') return parseFloat(p.sold) > 3.0; // AirPods (8.5k), iPhone (15.2k), Cotton Tee (5.1k)
              return true;
            }).map(p => {
              const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
              return (
                <TouchableOpacity key={`grid-${p.id}`} style={S.gridCard} onPress={() => router.push(`/shopping/product?id=${p.id}`)} activeOpacity={0.9}>
                  {/* Image Wrapper for Badges */}
                  <View style={S.gridImgWrap}>
                    <Image source={{ uri: p.image }} style={S.gridImg} />
                    
                    {/* Mall/Yêu thích Badge */}
                    {p.isMall ? (
                      <View style={[S.cardBadgeLeft, { backgroundColor: T.red }]}>
                        <Text style={S.cardBadgeText}>Mall</Text>
                      </View>
                    ) : (
                      <View style={[S.cardBadgeLeft, { backgroundColor: T.orange }]}>
                        <Text style={S.cardBadgeText}>Yêu thích</Text>
                      </View>
                    )}

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <View style={S.cardBadgeRight}>
                        <Text style={S.discountText}>-{discountPercent}%</Text>
                        <Text style={S.discountLabel}>GIẢM</Text>
                      </View>
                    )}

                    {/* Freeship Xtra Overlay */}
                    <View style={S.freeshipBadge}>
                      <Text style={S.freeshipBadgeTxt}>Freeship Xtra</Text>
                    </View>
                  </View>

                  <View style={S.gridInfo}>
                    <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                    
                    {/* Tag list */}
                    <View style={S.tagRow}>
                      <Text style={S.tagOrange}>Rẻ vô địch</Text>
                      <Text style={S.tagGold}>Hoàn xu 10%</Text>
                    </View>

                    {/* Price and discount */}
                    <View style={S.priceRow}>
                      <Text style={S.gridPrice}>{formatMoney(p.price)}</Text>
                    </View>

                    {/* Stats & Location */}
                    <View style={S.cardStatsRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={10} color={T.gold} />
                        <Text style={S.cardRatingTxt}>{p.rating}</Text>
                      </View>
                      <Text style={S.cardSoldTxt}>Đã bán {p.sold}</Text>
                    </View>
                    <Text style={S.cardLocation}>TP. Hồ Chí Minh</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 🔍 SEARCH OVERLAY (Giai đoạn 3 & Bản cập nhật mới) */}
      {showSearchOverlay && (
        <View style={S.searchOverlay}>
          <SafeAreaView style={{ flex: 1, backgroundColor: T.white }}>
            {/* Search Input Header */}
            <View style={S.searchHeader}>
              <TouchableOpacity onPress={() => { setShowSearchOverlay(false); setSearchQuery(''); }} style={{ padding: 8 }}>
                <Ionicons name="arrow-back" size={24} color={T.black} />
              </TouchableOpacity>
              <TextInput
                style={S.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearchSubmit(searchQuery)}
                placeholder="Tìm sản phẩm, thương hiệu..."
                placeholderTextColor={T.sub}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                  <Ionicons name="close-circle" size={20} color={T.sub} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Content Area */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {!searchQuery ? (
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={S.searchSecTitle}>LỊCH SỬ TÌM KIẾM ({searchHistory.length})</Text>
                    {searchHistory.length > 0 && (
                      <TouchableOpacity onPress={clearAllHistory}>
                        <Text style={{ fontSize: 11, color: T.orange, fontWeight: '700' }}>Xóa tất cả</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Interactive Pinned & Normal History tags */}
                  <View style={S.historyTags}>
                    {pinnedKeywords.map(h => (
                      <View key={`pin-${h}`} style={[S.historyTag, { borderColor: '#FFE0B2', backgroundColor: '#FFF8E1' }]}>
                        <TouchableOpacity onPress={() => handleSearchSubmit(h)}>
                          <Text style={[S.historyTagTxt, { color: '#FF9800', fontWeight: '700' }]}>📌 {h}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => togglePinKeyword(h)}>
                          <Ionicons name="pin" size={12} color="#FF9800" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {searchHistory.filter(h => !pinnedKeywords.includes(h)).map(h => (
                      <View key={`hist-${h}`} style={S.historyTag}>
                        <TouchableOpacity onPress={() => handleSearchSubmit(h)}>
                          <Text style={S.historyTagTxt}>{h}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => togglePinKeyword(h)}>
                          <Ionicons name="pin-outline" size={12} color={T.sub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 4 }} onPress={() => deleteHistoryItem(h)}>
                          <Ionicons name="close-outline" size={12} color={T.sub} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <Text style={[S.searchSecTitle, { marginTop: 30 }]}>XU HƯỚNG TÌM KIẾM 🔥</Text>
                  {['iPhone 15 Pro Max', 'Giày Sneakers', 'Áo thun form rộng', 'Serum cấp ẩm'].map((item, idx) => (
                    <TouchableOpacity key={item} style={S.trendRow} onPress={() => handleSearchSubmit(item)}>
                      <Text style={[S.trendRank, idx < 3 && { color: '#EF4444' }]}>{idx + 1}</Text>
                      <Text style={S.trendText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  {/* 📊 SORTING & FILTER BUTTON BAR (Shopee Style) */}
                  <View style={S.searchControlsRow}>
                    <TouchableOpacity style={[S.sortTab, sortBy === 'rel' && S.sortTabActive]} onPress={() => setSortBy('rel')}>
                      <Text style={[S.sortTabTxt, sortBy === 'rel' && { color: T.orange, fontWeight: '700' }]}>Liên quan</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[S.sortTab, sortBy === 'sold' && S.sortTabActive]} onPress={() => setSortBy('sold')}>
                      <Text style={[S.sortTabTxt, sortBy === 'sold' && { color: T.orange, fontWeight: '700' }]}>Bán chạy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[S.sortTab, (sortBy === 'priceAsc' || sortBy === 'priceDesc') && S.sortTabActive]} 
                      onPress={() => setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc')}
                    >
                      <Text style={[S.sortTabTxt, (sortBy === 'priceAsc' || sortBy === 'priceDesc') && { color: T.orange, fontWeight: '700' }]}>Giá</Text>
                      <Ionicons name={sortBy === 'priceAsc' ? "chevron-up" : "chevron-down"} size={10} color={(sortBy === 'priceAsc' || sortBy === 'priceDesc') ? T.orange : T.sub} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={S.filterBtnIcon} onPress={() => setShowFilterDrawer(true)}>
                      <Text style={{ fontSize: 12, color: T.black, fontWeight: '700', marginRight: 4 }}>Bộ lọc</Text>
                      <Ionicons name="funnel-outline" size={14} color={T.black} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: T.black }}>KẾT QUẢ CHO "{searchQuery.toUpperCase()}"</Text>
                  </View>

                  {/* RESULTS GRID CONTAINER */}
                  <View style={[S.grid, { paddingHorizontal: 10, marginTop: 10 }]}>
                    {MOCK_PRODUCTS
                      .filter(p => {
                        const matchKw = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.shopName.toLowerCase().includes(searchQuery.toLowerCase());
                        if (!matchKw) return false;

                        if (minPrice && p.price < parseFloat(minPrice)) return false;
                        if (maxPrice && p.price > parseFloat(maxPrice)) return false;

                        if (filterMall && !p.isMall) return false;
                        if (filterFavorite && p.isMall) return false;

                        if (filterRating && p.rating < filterRating) return false;

                        return true;
                      })
                      .sort((a, b) => {
                        if (sortBy === 'sold') {
                          return parseFloat(b.sold) - parseFloat(a.sold);
                        } else if (sortBy === 'priceAsc') {
                          return a.price - b.price;
                        } else if (sortBy === 'priceDesc') {
                          return b.price - a.price;
                        }
                        return 0; // 'rel' keeps original mock order
                      })
                      .map((p, idx) => {
                        const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
                        const isSponsored = idx === 0; // First item is simulated keyword sponsored ad!
                        
                        return (
                          <TouchableOpacity key={`search-res-${p.id}`} style={S.gridCard} onPress={() => { setShowSearchOverlay(false); router.push(`/shopping/product?id=${p.id}`); }} activeOpacity={0.9}>
                            <View style={S.gridImgWrap}>
                              <Image source={{ uri: p.image }} style={S.gridImg} />
                              
                              {p.isMall ? (
                                <View style={[S.cardBadgeLeft, { backgroundColor: T.red }]}><Text style={S.cardBadgeText}>Mall</Text></View>
                              ) : (
                                <View style={[S.cardBadgeLeft, { backgroundColor: T.orange }]}><Text style={S.cardBadgeText}>Yêu thích</Text></View>
                              )}

                              {discountPercent > 0 && (
                                <View style={S.cardBadgeRight}>
                                  <Text style={S.discountText}>-{discountPercent}%</Text>
                                  <Text style={S.discountLabel}>GIẢM</Text>
                                </View>
                              )}

                              <View style={S.freeshipBadge}><Text style={S.freeshipBadgeTxt}>Freeship Xtra</Text></View>
                            </View>

                            <View style={S.gridInfo}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                {isSponsored && (
                                  <View style={{ backgroundColor: '#ECEFF1', borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1, marginRight: 4 }}>
                                    <Text style={{ fontSize: 7, color: '#546E7A', fontWeight: '800' }}>Tài trợ</Text>
                                  </View>
                                )}
                                <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                              </View>
                              
                              <View style={S.tagRow}>
                                <Text style={S.tagOrange}>Rẻ vô địch</Text>
                                <Text style={S.tagGold}>Hoàn xu 10%</Text>
                              </View>

                              <View style={S.priceRow}>
                                <Text style={S.gridPrice}>{formatMoney(p.price)}</Text>
                              </View>

                              <View style={S.cardStatsRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Ionicons name="star" size={10} color={T.gold} />
                                  <Text style={S.cardRatingTxt}>{p.rating}</Text>
                                </View>
                                <Text style={S.cardSoldTxt}>Đã bán {p.sold}</Text>
                              </View>
                              <Text style={S.cardLocation}>TP. Hồ Chí Minh</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      )}

      {/* 🎤 VOICE SEARCH MODAL (Giai đoạn 3) */}
      <Modal visible={showVoiceSearch} transparent animationType="fade" onRequestClose={() => setShowVoiceSearch(false)}>
        <View style={S.simModalOverlay}>
          <View style={S.simModalCard}>
            <Ionicons name="mic" size={50} color="#4F46E5" style={{ marginBottom: 20 }} />
            <Text style={S.simModalTitle}>Đang nghe...</Text>
            <Text style={S.simModalText}>"Hãy nói tên sản phẩm bạn muốn tìm kiếm"</Text>
            <TouchableOpacity style={S.simModalClose} onPress={() => setShowVoiceSearch(false)}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📷 IMAGE SEARCH MODAL (Giai đoạn 3) */}
      <Modal visible={showImageSearch} transparent animationType="fade" onRequestClose={() => setShowImageSearch(false)}>
        <View style={S.simModalOverlay}>
          <View style={S.simModalCard}>
            <Ionicons name="camera" size={50} color="#00D8FF" style={{ marginBottom: 20 }} />
            <Text style={S.simModalTitle}>Tìm bằng hình ảnh</Text>
            <Text style={S.simModalText}>Mô phỏng: Đang tải hình ảnh lên để AI nhận diện đặc trưng...</Text>
            <TouchableOpacity style={S.simModalClose} onPress={() => setShowImageSearch(false)}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📲 QR SCANNER MODAL (Giai đoạn 3) */}
      <Modal visible={showQRScanner} transparent animationType="fade" onRequestClose={() => setShowQRScanner(false)}>
        <View style={S.simModalOverlay}>
          <View style={S.simModalCard}>
            <Ionicons name="qr-code" size={50} color="#10B981" style={{ marginBottom: 20 }} />
            <Text style={S.simModalTitle}>Quét mã QR Code</Text>
            <Text style={S.simModalText}>Mô phỏng: Căn chỉnh mã vạch/QR của sản phẩm vào khung hình</Text>
            <TouchableOpacity style={S.simModalClose} onPress={() => setShowQRScanner(false)}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📊 ADVANCED FILTER DRAWER MODAL */}
      <Modal visible={showFilterDrawer} transparent animationType="slide" onRequestClose={() => setShowFilterDrawer(false)}>
        <View style={S.drawerOverlay}>
          {/* Dismiss area */}
          <TouchableOpacity style={S.drawerDismissArea} onPress={() => setShowFilterDrawer(false)} />
          
          {/* Drawer Body */}
          <View style={S.drawerBody}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={S.drawerHeader}>
                <Text style={S.drawerTitle}>Bộ lọc tìm kiếm</Text>
                <TouchableOpacity onPress={() => setShowFilterDrawer(false)}>
                  <Ionicons name="close" size={24} color={T.black} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                {/* Price range */}
                <Text style={S.filterSecTitle}>KHOẢNG GIÁ (ĐỒNG)</Text>
                <View style={S.priceInputRow}>
                  <TextInput
                    style={S.priceInput}
                    placeholder="Tối thiểu"
                    placeholderTextColor={T.sub}
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <View style={{ width: 10, height: 1, backgroundColor: T.sub, marginHorizontal: 8 }} />
                  <TextInput
                    style={S.priceInput}
                    placeholder="Tối đa"
                    placeholderTextColor={T.sub}
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>

                {/* Shop Type */}
                <Text style={S.filterSecTitle}>LOẠI CỬA HÀNG</Text>
                <TouchableOpacity style={S.checkboxRow} onPress={() => setFilterMall(!filterMall)}>
                  <Ionicons name={filterMall ? "checkbox" : "square-outline"} size={20} color={filterMall ? T.orange : T.sub} />
                  <Text style={S.checkboxLabel}>Gian hàng chính hãng (Mall)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.checkboxRow} onPress={() => setFilterFavorite(!filterFavorite)}>
                  <Ionicons name={filterFavorite ? "checkbox" : "square-outline"} size={20} color={filterFavorite ? T.orange : T.sub} />
                  <Text style={S.checkboxLabel}>Cửa hàng Yêu thích</Text>
                </TouchableOpacity>

                {/* Star rating */}
                <Text style={S.filterSecTitle}>ĐÁNH GIÁ</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[5, 4, 3].map(stars => (
                    <TouchableOpacity
                      key={`star-filter-${stars}`}
                      style={[S.starFilterBtn, filterRating === stars && S.starFilterBtnActive]}
                      onPress={() => setFilterRating(filterRating === stars ? null : stars)}
                    >
                      <Text style={[S.starFilterTxt, filterRating === stars && { color: '#FFF' }]}>
                        {stars === 5 ? '5 ★' : `${stars} ★ trở lên`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Location */}
                <Text style={S.filterSecTitle}>NƠI BÁN</Text>
                {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].map(loc => (
                  <TouchableOpacity key={loc} style={S.checkboxRow} onPress={() => setFilterLocation(filterLocation === loc ? '' : loc)}>
                    <Ionicons name={filterLocation === loc ? "checkbox" : "square-outline"} size={20} color={filterLocation === loc ? T.orange : T.sub} />
                    <Text style={S.checkboxLabel}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Bottom Actions */}
              <View style={S.drawerFooter}>
                <TouchableOpacity
                  style={[S.drawerFooterBtn, { borderWidth: 1, borderColor: T.border, backgroundColor: '#FFF' }]}
                  onPress={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setFilterMall(false);
                    setFilterFavorite(false);
                    setFilterRating(null);
                    setFilterLocation('');
                  }}
                >
                  <Text style={[S.drawerFooterBtnTxt, { color: T.black }]}>Thiết lập lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.drawerFooterBtn, { backgroundColor: T.orange }]}
                  onPress={() => setShowFilterDrawer(false)}
                >
                  <Text style={[S.drawerFooterBtnTxt, { color: '#FFF' }]}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* 📱 MULTI-TIER CATEGORY BROWSER MODAL (Shopee & TikTok Shop Style) */}
      <Modal 
        visible={showCategoryBrowser} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowCategoryBrowser(false)}
      >
        <View style={S.catBrowserOverlay}>
          <SafeAreaView style={{ flex: 1, backgroundColor: T.white }}>
            {/* Header */}
            <View style={S.catBrowserHeader}>
              <TouchableOpacity onPress={() => setShowCategoryBrowser(false)} style={S.catBrowserBackBtn}>
                <Ionicons name="arrow-back" size={24} color={T.black} />
              </TouchableOpacity>
              <Text style={S.catBrowserTitle}>
                Danh mục: {selectedCatId ? CATEGORY_TREE[selectedCatId]?.name : 'Chi tiết'}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Split View Layout */}
            <View style={{ flex: 1, flexDirection: 'row' }}>
              {/* Left Column: Subcategories / Brands (Apple, Samsung, Xiaomi) */}
              <View style={S.catLeftCol}>
                {selectedCatId && CATEGORY_TREE[selectedCatId]?.subcategories.map((sub: any, idx: number) => (
                  <TouchableOpacity
                    key={`subcat-${idx}`}
                    style={[S.subcatTab, selectedSubcatIndex === idx && S.subcatTabActive]}
                    onPress={() => {
                      setShowCategoryBrowser(false);
                      router.push(`/shopping/brand?name=${sub.name}`);
                    }}
                  >
                    <Text style={[S.subcatTabTxt, selectedSubcatIndex === idx && S.subcatTabTxtActive]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Right Column: Series and Products */}
              <ScrollView style={S.catRightCol} contentContainerStyle={{ padding: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {selectedCatId && CATEGORY_TREE[selectedCatId]?.subcategories[selectedSubcatIndex]?.series.map((ser: any, serIdx: number) => (
                  <View key={`series-${serIdx}`} style={S.seriesBlock}>
                    {/* Series Title */}
                    <View style={S.seriesHeader}>
                      <Text style={S.seriesTitle}>{ser.name}</Text>
                      <Ionicons name="chevron-forward" size={14} color={T.sub} />
                    </View>

                    {/* Series Products list */}
                    <View style={S.seriesProductsGrid}>
                      {ser.products.map((prodId: string) => {
                        const p = MOCK_PRODUCTS.find(x => x.id === prodId);
                        if (!p) return null;
                        const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
                        return (
                          <TouchableOpacity
                            key={`cat-prod-${p.id}`}
                            style={S.catProductCard}
                            onPress={() => {
                              setShowCategoryBrowser(false);
                              router.push(`/shopping/product?id=${p.id}`);
                            }}
                          >
                            <Image source={{ uri: p.image }} style={S.catProductImg} />
                            <View style={S.catProductInfo}>
                              <Text style={S.catProductName} numberOfLines={2}>{p.name}</Text>
                              <Text style={S.catProductPrice}>{formatMoney(p.price)}</Text>
                              {discountPercent > 0 && (
                                <Text style={S.catProductOrigPrice}>{formatMoney(p.originalPrice)}</Text>
                              )}
                              <View style={S.catProductStats}>
                                <Ionicons name="star" size={10} color={T.gold} style={{ marginRight: 2 }} />
                                <Text style={S.catProductRating}>{p.rating}</Text>
                                <Text style={S.catProductSold}> | Bán {p.sold}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* 🤖 FLOATING AI ASSISTANT BUBBLE */}
      <TouchableOpacity style={[S.aiFloatBtn, { backgroundColor: accentHex }]} onPress={() => setShowAIChat(true)}>
        <Ionicons name="sparkles" size={24} color="#000" />
      </TouchableOpacity>

      {/* 🤖 AI CHATBOT MODAL */}
      <Modal visible={showAIChat} transparent animationType="slide">
        <View style={S.aiChatOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAIChat(false)} />
          <View style={S.aiChatCard}>
            <View style={S.aiChatHeader}>
              <Ionicons name="sparkles" size={18} color={T.orange} style={{ marginRight: 8 }} />
              <Text style={S.aiChatTitle}>TRỢ LÝ MUA SẮM AI</Text>
              <TouchableOpacity onPress={() => setShowAIChat(false)} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close" size={20} color={T.black} />
              </TouchableOpacity>
            </View>

            {/* Chat Messages scroll */}
            <ScrollView style={{ flex: 1, padding: 15 }} showsVerticalScrollIndicator={false}>
              {aiMessages.map(msg => (
                <View key={msg.id} style={{ marginBottom: 15 }}>
                  <View style={[S.msgBubble, msg.sender === 'user' ? S.msgUser : S.msgAI]}>
                    <Text style={[S.msgText, msg.sender === 'user' ? { color: '#FFF' } : { color: T.black }]}>{msg.text}</Text>
                  </View>
                  
                  {/* If AI message contains matching product recommendations */}
                  {msg.products && (
                    <View style={S.aiRecRow}>
                      {msg.products.map((p: any) => (
                        <TouchableOpacity key={p.id} style={S.aiRecCard} onPress={() => { setShowAIChat(false); router.push(`/shopping/product?id=${p.id}`); }}>
                          <Image source={{ uri: p.image }} style={S.aiRecImg} />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={S.aiRecName} numberOfLines={1}>{p.name}</Text>
                            <Text style={S.aiRecPrice}>{p.price.toLocaleString('vi-VN')}đ</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={14} color={T.sub} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Input toolbar */}
            <View style={S.aiChatInputRow}>
              <TextInput
                style={S.aiChatInput}
                value={aiQuery}
                onChangeText={setAiQuery}
                placeholder="Mô tả sản phẩm bạn cần..."
                placeholderTextColor={T.sub}
                onSubmitEditing={handleSendAIChat}
              />
              <TouchableOpacity style={S.aiSendBtn} onPress={handleSendAIChat}>
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🧭 SHOPEE GREEN BOTTOM TAB NAVIGATION */}
      <View style={S.bottomTabBar}>
        <TouchableOpacity style={S.tabBarItem} onPress={() => router.push('/shopping')}>
          <Ionicons name="home" size={22} color="#00B14F" />
          <Text style={[S.tabBarLabel, { color: '#00B14F', fontWeight: '700' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.tabBarItem} onPress={() => router.push('/shopping/brand?name=Apple%20(iPhone)')}>
          <Ionicons name="bag-handle-outline" size={22} color="#64748B" />
          <Text style={S.tabBarLabel}>Mall</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.tabBarItem} onPress={() => router.push('/shopping/live')}>
          <Ionicons name="tv-outline" size={22} color="#64748B" />
          <Text style={S.tabBarLabel}>Live & Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.tabBarItem} onPress={() => router.push('/notifications')}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={22} color="#64748B" />
            <View style={S.tabBadge}><Text style={S.tabBadgeTxt}>9</Text></View>
          </View>
          <Text style={S.tabBarLabel}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.tabBarItem} onPress={() => router.push('/account')}>
          <Ionicons name="person-outline" size={22} color="#64748B" />
          <Text style={S.tabBarLabel}>Tôi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mobileFullWrapper: {
    alignItems: 'stretch',
    justifyContent: 'stretch',
  },
  desktopFrame: {
    width: 414,
    maxWidth: 414,
    maxHeight: 896,
    height: '100%',
    borderWidth: 10,
    borderColor: '#0F172A',
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && { marginVertical: 20 }),
  },
  root: { flex: 1, backgroundColor: T.bg, position: 'relative' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'ios' ? 10 : 35, paddingBottom: 12 },
  headerSearchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 6, paddingHorizontal: 12, height: 38, marginHorizontal: 8 },
  headerSearchText: { color: '#888', fontSize: 12, flex: 1 },
  brandTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  
  cartBadge: { position: 'absolute', top: -5, right: -8, backgroundColor: T.black, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.white },

  // Green Header Styles
  headerGreen: { backgroundColor: '#00B14F' },
  headerGreenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  greenSearchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 4, paddingHorizontal: 10, height: 36, marginHorizontal: 8 },
  greenSearchTxt: { flex: 1, fontSize: 13, color: '#334155' },
  headerIconsRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBadgeWrap: { position: 'relative', padding: 2 },
  topBadge: { position: 'absolute', top: -4, right: -8, backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 4, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFF' },
  topBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Floating Widget Strip Styles
  widgetStripCard: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 10, marginTop: -4, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  widgetStripItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  widgetIconBox: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  widgetTitle: { fontSize: 11, fontWeight: '800', color: '#1E293B' },
  widgetSub: { fontSize: 8, color: '#64748B', marginTop: 1 },
  widgetDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 2 },
  widgetCoinBtn: { paddingLeft: 4 },
  coinCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEF3C7', borderWidth: 1.5, borderColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },

  // Category App Grid Styles
  catGridSection: { backgroundColor: '#FFF', marginTop: 10, paddingTop: 12, paddingBottom: 8 },
  catAppItem: { width: 72, alignItems: 'center' },
  catAppIconWrap: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catAppText: { fontSize: 10, color: '#1E293B', textAlign: 'center', lineHeight: 12, fontWeight: '500' },
  catIndicatorTrack: { width: 30, height: 3, backgroundColor: '#E2E8F0', borderRadius: 1.5, alignSelf: 'center', marginTop: 10, overflow: 'hidden' },
  catIndicatorPill: { width: 12, height: '100%', backgroundColor: '#00B14F', borderRadius: 1.5 },

  // Live & Video Dual Section Styles
  liveVideoSection: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, gap: 10 },
  mediaCol: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, padding: 8 },
  mediaHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  mediaSecTitle: { fontSize: 12, fontWeight: '900', color: '#EE4D2D', letterSpacing: 0.5 },
  mediaThumbRow: { flexDirection: 'row', gap: 6 },
  mediaThumbCard: { flex: 1, height: 100, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  mediaThumbImg: { width: '100%', height: '100%' },
  liveBadgeSmall: { position: 'absolute', top: 4, left: 4, backgroundColor: '#EF4444', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, flexDirection: 'row', alignItems: 'center' },
  redDotPulse: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', marginRight: 3 },
  liveBadgeTxtSmall: { color: '#FFF', fontSize: 7, fontWeight: '900' },
  mediaThumbTxt: { position: 'absolute', bottom: 4, left: 4, right: 4, color: '#FFF', fontSize: 9, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  videoViewsBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, flexDirection: 'row', alignItems: 'center' },
  videoViewsTxt: { color: '#FFF', fontSize: 8, fontWeight: '700' },

  // Big Promo & Featured Product Grid Styles
  mainFeedRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, gap: 10 },
  bigPromoCard: { width: '45%', height: 210, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  bigPromoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(238,77,45,0.75)', padding: 10, justifyContent: 'space-between' },
  bigPromoTag: { backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, alignSelf: 'flex-start' },
  bigPromoTagTxt: { color: '#EE4D2D', fontSize: 8, fontWeight: '900' },
  bigPromoTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  bigPromoPrice0: { color: '#FFDA24', fontSize: 32, fontWeight: '900' },
  carouselDotsRow: { flexDirection: 'row', gap: 4, alignSelf: 'center' },
  cDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.5)' },
  cDotActive: { backgroundColor: '#FFF', width: 10 },

  featuredProductCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden' },
  featuredImgWrap: { position: 'relative', width: '100%', height: 130 },
  featuredImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountCornerBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FEE2E2', paddingHorizontal: 4, paddingVertical: 2 },
  discountCornerTxt: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  xtraBadgeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00B14F', paddingVertical: 2, alignItems: 'center' },
  xtraBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },

  featuredDetails: { padding: 8 },
  favBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favBadge: { backgroundColor: '#EE4D2D', borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1 },
  favBadgeTxt: { color: '#FFF', fontSize: 7, fontWeight: '900' },
  featuredProdTitle: { fontSize: 11, color: '#1E293B', fontWeight: '500', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingTxt: { fontSize: 9, color: '#1E293B', fontWeight: '700', marginLeft: 2 },
  priceRowShopee: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 },
  shopeePrice: { fontSize: 13, color: '#EE4D2D', fontWeight: '800' },
  soldTxt: { fontSize: 8, color: '#64748B' },
  shipMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  shipMetaTxt: { fontSize: 8, color: '#00B14F', fontWeight: '700', marginLeft: 2 },
  locationMetaTxt: { fontSize: 8, color: '#94A3B8', marginLeft: 2 },

  // Bottom Navigation Bar Styles
  bottomTabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabBarItem: { alignItems: 'center', justifyContent: 'center' },
  tabBarLabel: { fontSize: 10, color: '#64748B', marginTop: 2 },
  tabBadge: { position: 'absolute', top: -3, right: -8, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 14, height: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  tabBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  cartBadgeTxt: { color: T.white, fontSize: 9, fontWeight: '700' },
  
  heroWrapper: { width: '100%', height: 600, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 30, paddingBottom: 60 },
  heroSubtitle: { color: T.white, fontSize: 12, letterSpacing: 3, marginBottom: 10, opacity: 0.9 },
  heroTitle: { color: T.white, fontSize: 42, fontWeight: '800', letterSpacing: 2, lineHeight: 48 },
  heroBtn: { backgroundColor: T.white, alignSelf: 'flex-start', paddingHorizontal: 25, paddingVertical: 12, marginTop: 25, borderRadius: 30 },
  heroBtnTxt: { color: T.black, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  
  section: { marginTop: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: 2, color: T.black, marginLeft: 20, marginBottom: 20 },
  
  // Search Bar Container
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 15, height: 46 },
  searchPlaceholder: { color: T.sub, fontSize: 13 },
  searchIconBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  // Categories
  categoryCard: { alignItems: 'center', width: 70 },
  categoryIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, color: T.black, fontWeight: '500' },

  // Flash Sale
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  countdownBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 },
  countdownText: { color: T.white, fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  flashCard: { width: 140, position: 'relative', backgroundColor: T.white, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  flashImg: { width: '100%', height: 140 },
  flashSaleTag: { position: 'absolute', top: 6, left: 6, backgroundColor: '#F25220', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  flashSaleTagTxt: { color: T.white, fontSize: 10, fontWeight: '800' },
  flashInfo: { padding: 10 },
  flashPrice: { fontSize: 14, fontWeight: '700', color: '#F25220' },
  flashOrigPrice: { fontSize: 11, color: T.sub, textDecorationLine: 'line-through', marginTop: 2 },
  progressBar: { height: 14, backgroundColor: '#FFEEE8', borderRadius: 7, marginTop: 8, overflow: 'hidden', justifyContent: 'center' },
  progressFill: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  progressText: { fontSize: 8, fontWeight: '800', color: T.white, textAlign: 'center', zIndex: 1 },

  // Voucher Center
  voucherCard: { width: 260, height: 90, flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: T.border, backgroundColor: T.white, overflow: 'hidden' },
  voucherLeft: { width: 80, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  voucherVal: { color: T.white, fontSize: 20, fontWeight: '800' },
  voucherLabelText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '600', marginTop: 2, uppercase: true } as any,
  voucherRight: { flex: 1, padding: 10, justifyContent: 'space-between' },
  voucherCode: { fontSize: 12, fontWeight: '700', color: T.black },
  voucherDesc: { fontSize: 11, color: T.sub },
  voucherBtn: { backgroundColor: '#4F46E5', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  voucherBtnTxt: { color: T.white, fontSize: 10, fontWeight: '700' },

  // Interactive Media
  mediaRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  mediaCard: { flex: 1, height: 180, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  mediaImg: { width: '100%', height: '100%' },
  liveBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.white, marginRight: 6 },
  liveBadgeTxt: { color: T.white, fontSize: 9, fontWeight: '800' },
  mediaTitle: { position: 'absolute', bottom: 10, left: 10, right: 10, color: T.white, fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },

  // Management Banners
  mgmtBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  mgmtBannerTitle: { fontSize: 13, fontWeight: '700' },
  mgmtBannerDesc: { fontSize: 10, color: T.sub, marginTop: 2 },

  // Search Overlay
  searchOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: T.border, paddingHorizontal: 15, paddingVertical: 10 },
  searchInput: { flex: 1, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 15, fontSize: 14, color: T.black, marginHorizontal: 8 },
  searchSecTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: T.sub, marginBottom: 15 },
  historyTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historyTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  historyTagTxt: { fontSize: 12, color: T.black },
  trendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  trendRank: { fontSize: 14, fontWeight: '800', width: 30, color: T.sub },
  trendText: { fontSize: 14, color: T.black },

  // Simulation Modals
  simModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  simModalCard: { width: '80%', backgroundColor: T.white, borderRadius: 20, padding: 30, alignItems: 'center' },
  simModalTitle: { fontSize: 18, fontWeight: '700', color: T.black, marginBottom: 10 },
  simModalText: { fontSize: 13, color: T.sub, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  simModalClose: { backgroundColor: T.black, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between', gap: 8 },
  gridCard: { width: '48%', marginBottom: 12, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  gridImgWrap: { position: 'relative', width: '100%', aspectRatio: 1, backgroundColor: '#FFF' },
  gridImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridInfo: { padding: 8 },
  gridName: { fontSize: 12, color: '#222', lineHeight: 18, height: 36, fontWeight: '500' },
  gridPrice: { fontSize: 14, color: T.red, fontWeight: '700', marginTop: 4 },

  cardBadgeLeft: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  cardBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  
  cardBadgeRight: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FFDA24', paddingHorizontal: 4, paddingVertical: 2, alignItems: 'center' },
  discountText: { color: T.red, fontSize: 9, fontWeight: '800' },
  discountLabel: { color: '#FFF', fontSize: 6, fontWeight: '800' },

  freeshipBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00BFA5', paddingVertical: 2, alignItems: 'center' },
  freeshipBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '800' },

  tagRow: { flexDirection: 'row', gap: 4, marginVertical: 4 },
  tagOrange: { borderColor: T.orange, borderWidth: 0.5, borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, color: T.orange, fontSize: 8, fontWeight: '700' },
  tagGold: { borderColor: '#F5A623', borderWidth: 0.5, borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, color: '#F5A623', fontSize: 8, fontWeight: '700' },

  cardStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardRatingTxt: { fontSize: 9, color: '#222', marginLeft: 2, fontWeight: '600' },
  cardSoldTxt: { fontSize: 9, color: '#777' },
  cardLocation: { fontSize: 8, color: '#999', marginTop: 4, textAlign: 'right' },

  // AI Chatbot Styles
  aiFloatBtn: {
    position: 'absolute', bottom: 30, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10,
    elevation: 5, zIndex: 90
  },
  aiChatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  aiChatCard: { width: '100%', height: '80%', backgroundColor: T.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
  aiChatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  aiChatTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1, color: T.black },
  msgBubble: { padding: 12, borderRadius: 16, maxWidth: '80%', marginBottom: 4 },
  msgUser: { backgroundColor: T.orange, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  msgAI: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 13, lineHeight: 18 },
  aiRecRow: { marginTop: 10, gap: 8, paddingLeft: 10 },
  aiRecCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: T.border },
  aiRecImg: { width: 40, height: 50, borderRadius: 4 },
  aiRecName: { fontSize: 12, fontWeight: '700', color: T.black },
  aiRecPrice: { fontSize: 11, color: '#EF4444', fontWeight: '700', marginTop: 2 },
  aiChatInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.border },
  aiChatInput: { flex: 1, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 15, fontSize: 13, color: T.black, marginRight: 10 },
  aiSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.orange, justifyContent: 'center', alignItems: 'center' },

  // Carousel Styles
  carouselContainer: { marginHorizontal: 20, marginTop: 15, position: 'relative' },
  carouselScroll: { borderRadius: 12 },
  carouselOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, justifyContent: 'flex-end' },
  carouselTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  carouselDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 4 },
  carouselIndicatorRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  carouselDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  carouselDotActive: { backgroundColor: T.orange, width: 14 },

  // Filter Tabs Styles
  filterTabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8', marginBottom: 15 },
  filterTabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabItemActive: { borderBottomColor: T.orange },
  filterTabLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterTabSub: { fontSize: 8, color: '#94A3B8', marginTop: 2 },

  // Search Results Controls
  searchControlsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: T.border, paddingVertical: 8, paddingHorizontal: 15 },
  sortTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  sortTabActive: { borderBottomColor: T.orange },
  sortTabTxt: { fontSize: 12, color: '#64748B' },
  filterBtnIcon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: T.border, paddingLeft: 12 },

  // Advanced Filter Drawer Styles
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerDismissArea: { width: '25%', height: '100%' },
  drawerBody: { width: '75%', height: '100%', backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  drawerTitle: { fontSize: 15, fontWeight: '800', color: T.black },
  filterSecTitle: { fontSize: 10, fontWeight: '800', color: T.black, marginTop: 18, marginBottom: 8, letterSpacing: 0.5 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  priceInput: { flex: 1, height: 38, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 12, fontSize: 12, color: T.black, backgroundColor: '#F8FAFC' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkboxLabel: { fontSize: 12, color: T.black, marginLeft: 8 },
  starFilterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: T.border, backgroundColor: '#FFF' },
  starFilterBtnActive: { backgroundColor: T.orange, borderColor: T.orange },
  starFilterTxt: { fontSize: 11, color: T.black },
  drawerFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: '#FFF' },
  drawerFooterBtn: { flex: 1, height: 40, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  drawerFooterBtnTxt: { fontSize: 12, fontWeight: '700' },

  // Category Browser Styles
  catBrowserOverlay: { flex: 1, backgroundColor: T.white },
  catBrowserHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  catBrowserTitle: { fontSize: 15, fontWeight: '800', color: T.black },
  catLeftCol: { width: '28%', backgroundColor: '#F8FAFC', borderRightWidth: 1, borderRightColor: T.border },
  subcatTab: { paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: T.border, borderLeftWidth: 3, borderLeftColor: 'transparent', backgroundColor: '#F8FAFC' },
  subcatTabActive: { backgroundColor: '#FFF', borderLeftColor: T.orange },
  subcatTabTxt: { fontSize: 11, color: '#475569', fontWeight: '500', textAlign: 'center' },
  subcatTabTxtActive: { color: T.orange, fontWeight: '700' },
  catRightCol: { flex: 1, backgroundColor: '#FFF' },
  seriesBlock: { marginBottom: 20 },
  seriesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
  seriesTitle: { fontSize: 13, fontWeight: '800', color: T.black },
  seriesProductsGrid: { gap: 10 },
  catProductCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  catProductImg: { width: 64, height: 64, borderRadius: 6, resizeMode: 'cover' },
  catProductInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  catProductName: { fontSize: 12, color: T.black, fontWeight: '600', lineHeight: 16 },
  catProductPrice: { fontSize: 11, color: T.red, fontWeight: '700', marginTop: 2 },
  catProductOrigPrice: { fontSize: 9, color: T.sub, textDecorationLine: 'line-through' },
  catProductStats: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  catProductRating: { fontSize: 9, color: T.black, fontWeight: '600' },
  catProductSold: { fontSize: 9, color: T.sub },
  catBrowserBackBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});
