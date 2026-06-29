import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, useWindowDimensions,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#222222',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#888888',
  border: '#E8E8E8',
  orange: '#0066F5',   // Premium Sapphire Blue primary
  orangeLight: '#EBF3FF', // Soft Sapphire Blue background tint
  red: '#FF2A54',      // Rose Red price tag accent
  gold: '#F5A623',
};

const BRAND_CONFIG: Record<string, {
  name: string;
  logo: string;
  cover: string;
  followers: string;
  rating: string;
  chatResponse: string;
  vouchers: { id: string; code: string; discount: string; minSpend: string }[];
  series: { name: string; key: string; products: string[] }[];
}> = {
  'Samsung': {
    name: 'Samsung Authorized Store',
    logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100',
    cover: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
    followers: '1.2M',
    rating: '4.9 ★',
    chatResponse: '99%',
    vouchers: [
      { id: 'v_br_sam1', code: 'SAMS100', discount: '100k', minSpend: '3M' },
      { id: 'v_br_sam2', code: 'SAMS500', discount: '500k', minSpend: '12M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p11', 'p17', 'p18', 'p31', 'p32'] },
      { name: 'Dòng S', key: 's', products: ['p11', 'p31', 'p32'] },
      { name: 'Dòng Note', key: 'note', products: ['p18'] },
      { name: 'Dòng A', key: 'a', products: ['p17'] },
    ]
  },
  'Apple (iPhone)': {
    name: 'Apple Premium Store',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '2.5M',
    rating: '5.0 ★',
    chatResponse: '98%',
    vouchers: [
      { id: 'v_br_ap1', code: 'APPLE200', discount: '200k', minSpend: '5M' },
      { id: 'v_br_ap2', code: 'APPLE800', discount: '800k', minSpend: '20M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p1', 'p21', 'p23', 'p5', 'p33', 'p34'] },
      { name: 'iPhone 15 Series', key: 'ip15', products: ['p1', 'p33', 'p34'] },
      { name: 'iPhone 14 Series', key: 'ip14', products: ['p21'] },
      { name: 'iPhone 13 Series', key: 'ip13', products: ['p23'] },
      { name: 'Phụ kiện AirPods', key: 'airpods', products: ['p5'] },
    ]
  },
  'Xiaomi': {
    name: 'Xiaomi Authorized Store',
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100',
    cover: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
    followers: '850k',
    rating: '4.8 ★',
    chatResponse: '95%',
    vouchers: [
      { id: 'v_br_xia1', code: 'MI50K', discount: '50k', minSpend: '1.5M' },
      { id: 'v_br_xia2', code: 'MI200K', discount: '200k', minSpend: '5M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p20', 'p19', 'p24', 'p35'] },
      { name: 'Xiaomi Flagship', key: 'flagship', products: ['p20', 'p35'] },
      { name: 'Redmi Note Series', key: 'redmi', products: ['p19'] },
      { name: 'Redmi A Series', key: 'redmi_a', products: ['p24'] },
    ]
  },
  'OPPO': {
    name: 'OPPO Store',
    logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100',
    cover: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    followers: '680k',
    rating: '4.7 ★',
    chatResponse: '94%',
    vouchers: [
      { id: 'v_br_opp1', code: 'OPPO80', discount: '80k', minSpend: '2M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p25', 'p22', 'p26', 'p36'] },
      { name: 'OPPO Find Series', key: 'find', products: ['p25'] },
      { name: 'OPPO Reno Series', key: 'reno', products: ['p22', 'p36'] },
      { name: 'OPPO A Series', key: 'oppo_a', products: ['p26'] },
    ]
  },
  'Quần áo': {
    name: 'Thời trang Quần Áo',
    logo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    followers: '95k',
    rating: '4.8 ★',
    chatResponse: '90%',
    vouchers: [
      { id: 'v_br_cl1', code: 'CLO20', discount: '20k', minSpend: '250k' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p2', 'p12', 'p6'] },
      { name: 'Áo thun', key: 'tee', products: ['p2'] },
      { name: 'Áo khoác Denim', key: 'denim', products: ['p12'] },
      { name: 'Quần đùi', key: 'shorts', products: ['p6'] },
    ]
  },
  'Giày dép & Túi xách': {
    name: 'Giày dép & Túi da thiết kế',
    logo: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    followers: '120k',
    rating: '4.9 ★',
    chatResponse: '93%',
    vouchers: [
      { id: 'v_br_sh1', code: 'LUXE50', discount: '50k', minSpend: '500k' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p4', 'p14', 'p9'] },
      { name: 'Giày thể thao', key: 'shoes', products: ['p4', 'p14'] },
      { name: 'Túi xách da', key: 'bag', products: ['p9'] },
    ]
  },
  'Chăm sóc da': {
    name: 'Aura Skincare Boutique',
    logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100',
    cover: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    followers: '50k',
    rating: '4.9 ★',
    chatResponse: '96%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p3'] },
      { name: 'Tinh chất Serum', key: 'serum', products: ['p3'] },
    ]
  },
  'Nước hoa': {
    name: 'Luxe Perfume Center',
    logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100',
    cover: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    followers: '45k',
    rating: '4.8 ★',
    chatResponse: '92%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p10'] },
    ]
  },
  'Thiết bị gia đình': {
    name: 'Nordic Home Decor',
    logo: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '65k',
    rating: '4.8 ★',
    chatResponse: '91%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p15', 'p16'] },
      { name: 'Đèn bàn học', key: 'lamp', products: ['p15'] },
      { name: 'Matcha Uji', key: 'tea', products: ['p16'] },
    ]
  },
  'Thiết bị âm thanh': {
    name: 'Sony Authorized Store',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '450k',
    rating: '4.9 ★',
    chatResponse: '97%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p7'] },
    ]
  },
  'Phụ kiện công nghệ': {
    name: 'Gear Center VN',
    logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '110k',
    rating: '4.8 ★',
    chatResponse: '94%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p8', 'p13'] },
      { name: 'Bàn phím cơ', key: 'kb', products: ['p8'] },
      { name: 'Sạc dự phòng', key: 'charger', products: ['p13'] },
    ]
  },
  'Apple MacBook': {
    name: 'MacBook Store',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '280k',
    rating: '4.9 ★',
    chatResponse: '98%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p11'] },
    ]
  },
  'Trang phục thể thao': {
    name: 'Nike Sports Center',
    logo: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    followers: '780k',
    rating: '4.9 ★',
    chatResponse: '96%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p2'] },
    ]
  },
  'ASUS ROG / TUF': {
    name: 'ASUS Flagship Store',
    logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '350k',
    rating: '4.9 ★',
    chatResponse: '98%',
    vouchers: [
      { id: 'v_br_asus1', code: 'ASUS1M', discount: '1M', minSpend: '20M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p27'] },
      { name: 'ROG Gaming', key: 'rog', products: ['p27'] },
    ]
  },
  'Dell XPS': {
    name: 'Dell Flagship Store',
    logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '280k',
    rating: '4.8 ★',
    chatResponse: '95%',
    vouchers: [
      { id: 'v_br_dell1', code: 'DELL500', discount: '500k', minSpend: '15M' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p28'] },
      { name: 'Dell XPS 13', key: 'xps', products: ['p28'] },
    ]
  },
  'Trang điểm': {
    name: 'MAC Cosmetics Official',
    logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100',
    cover: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    followers: '980k',
    rating: '4.9 ★',
    chatResponse: '96%',
    vouchers: [
      { id: 'v_br_make1', code: 'MAC50', discount: '50k', minSpend: '500k' },
    ],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p29'] },
      { name: 'Son môi Mac', key: 'lip', products: ['p29'] },
    ]
  },
  'Dụng cụ thể thao': {
    name: 'Wilson Pro Tennis Store',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    followers: '150k',
    rating: '4.9 ★',
    chatResponse: '93%',
    vouchers: [],
    series: [
      { name: 'Tất cả', key: 'all', products: ['p30'] },
      { name: 'Vợt Tennis', key: 'tennis', products: ['p30'] },
    ]
  }
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function BrandDetail() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const brandName = (name as string) || 'Samsung';
  const brand = BRAND_CONFIG[brandName] || BRAND_CONFIG['Samsung'];

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Local state
  const [activeTabKey, setActiveTabKey] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rel' | 'sold' | 'priceAsc' | 'priceDesc'>('rel');
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/shopping');
    }
  };

  const handleClaimVoucher = (vid: string) => {
    if (claimedVouchers.includes(vid)) return;
    setClaimedVouchers([...claimedVouchers, vid]);
    Alert.alert('Thành công', 'Mã giảm giá đã được thêm vào Ví Voucher của bạn!');
  };

  // Get active products based on selected tab key, search within brand, and sorting
  const activeSeries = brand.series.find(s => s.key === activeTabKey) || brand.series[0];
  
  const displayProducts = MOCK_PRODUCTS
    .filter(p => activeSeries.products.includes(p.id))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'sold') {
        return parseFloat(b.sold) - parseFloat(a.sold);
      } else if (sortBy === 'priceAsc') {
        return a.price - b.price;
      } else if (sortBy === 'priceDesc') {
        return b.price - a.price;
      }
      return 0; // Relative / default
    });

  return (
    <View style={S.container}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* 🟢 NAVIGATION HEADER */}
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={T.black} />
          </TouchableOpacity>
          
          {/* Inner Brand Search Box */}
          <View style={S.headerSearchWrap}>
            <Ionicons name="search-outline" size={16} color={T.sub} style={{ marginRight: 6 }} />
            <TextInput
              style={S.headerSearchInput}
              placeholder={`Tìm trong ${brandName}...`}
              placeholderTextColor={T.sub}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={T.sub} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={S.cartBtn} onPress={() => router.push('/shopping/cart')}>
            <Ionicons name="cart-outline" size={24} color={T.black} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          {/* 🎨 BRAND BANNER HEADER */}
          <View style={S.bannerCard}>
            <Image source={{ uri: brand.cover }} style={StyleSheet.absoluteFillObject} />
            <View style={S.coverOverlay} />

            <View style={S.bannerInfo}>
              <Image source={{ uri: brand.logo }} style={S.brandLogo} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.brandNameText} numberOfLines={1}>{brand.name}</Text>
                <View style={S.mallBadge}>
                  <Text style={S.mallBadgeTxt}>Mall chính hãng</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 📊 BRAND STORE STATISTICS */}
          <View style={S.statsRow}>
            <View style={S.statCol}>
              <Text style={S.statVal}>{brand.rating}</Text>
              <Text style={S.statLabel}>Đánh giá shop</Text>
            </View>
            <View style={S.statDivider} />
            <View style={S.statCol}>
              <Text style={S.statVal}>{brand.followers}</Text>
              <Text style={S.statLabel}>Người theo dõi</Text>
            </View>
            <View style={S.statDivider} />
            <View style={S.statCol}>
              <Text style={S.statVal}>{brand.chatResponse}</Text>
              <Text style={S.statLabel}>Phản hồi chat</Text>
            </View>
          </View>

          {/* 🎟️ BRAND VOUCHERS SECTION */}
          {brand.vouchers && brand.vouchers.length > 0 && (
            <View style={S.vouchersBlock}>
              <Text style={S.sectionTitle}>MÃ GIẢM GIÁ ĐỘC QUYỀN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}>
                {brand.vouchers.map(v => {
                  const isClaimed = claimedVouchers.includes(v.id);
                  return (
                    <View key={v.id} style={S.voucherCard}>
                      <View style={S.voucherLeft}>
                        <Text style={S.voucherDiscText}>{v.discount}</Text>
                        <Text style={S.voucherMinText}>Đơn từ {v.minSpend}</Text>
                      </View>
                      <View style={S.voucherSep} />
                      <TouchableOpacity
                        style={[S.voucherRight, isClaimed && { backgroundColor: '#CBD5E1' }]}
                        onPress={() => handleClaimVoucher(v.id)}
                        disabled={isClaimed}
                      >
                        <Text style={S.voucherBtnTxt}>{isClaimed ? 'Đã lưu' : 'Lưu'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 🎟️ TABS SELECTOR (Dòng S, Note, A, ...) */}
          <View style={S.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}>
              {brand.series.map(ser => (
                <TouchableOpacity
                  key={ser.key}
                  style={[S.tabItem, activeTabKey === ser.key && S.tabItemActive]}
                  onPress={() => {
                    setActiveTabKey(ser.key);
                    setSearchQuery(''); // Clear search on tab switch
                  }}
                >
                  <Text style={[S.tabTxt, activeTabKey === ser.key && S.tabTxtActive]}>
                    {ser.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 📊 SORTING BAR */}
          <View style={S.sortBar}>
            <TouchableOpacity style={[S.sortItem, sortBy === 'rel' && S.sortItemActive]} onPress={() => setSortBy('rel')}>
              <Text style={[S.sortTxt, sortBy === 'rel' && S.sortTxtActive]}>Phù hợp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.sortItem, sortBy === 'sold' && S.sortItemActive]} onPress={() => setSortBy('sold')}>
              <Text style={[S.sortTxt, sortBy === 'sold' && S.sortTxtActive]}>Bán chạy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.sortItem, (sortBy === 'priceAsc' || sortBy === 'priceDesc') && S.sortItemActive]}
              onPress={() => setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc')}
            >
              <Text style={[S.sortTxt, (sortBy === 'priceAsc' || sortBy === 'priceDesc') && S.sortTxtActive]}>Giá</Text>
              <Ionicons
                name={sortBy === 'priceAsc' ? 'chevron-up' : 'chevron-down'}
                size={10}
                color={(sortBy === 'priceAsc' || sortBy === 'priceDesc') ? T.orange : T.sub}
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>

          {/* 🛍️ PRODUCTS GRID */}
          <View style={S.grid}>
            {displayProducts.map(p => {
              const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
              return (
                <TouchableOpacity
                  key={`brand-prod-${p.id}`}
                  style={S.gridCard}
                  onPress={() => router.push(`/shopping/product?id=${p.id}`)}
                >
                  <View style={S.gridImgWrap}>
                    <Image source={{ uri: p.image }} style={S.gridImg} />
                    
                    {discountPercent > 0 && (
                      <View style={S.cardBadgeRight}>
                        <Text style={S.discountText}>-{discountPercent}%</Text>
                        <Text style={S.discountLabel}>GIẢM</Text>
                      </View>
                    )}
                    <View style={S.freeshipBadge}><Text style={S.freeshipBadgeTxt}>Freeship Xtra</Text></View>
                  </View>

                  <View style={S.gridInfo}>
                    <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                    
                    <View style={S.shopRow}>
                      <Ionicons name="storefront-outline" size={10} color={T.sub} style={{ marginRight: 3 }} />
                      <Text style={S.shopNameText} numberOfLines={1}>{p.shopName}</Text>
                      {p.isMall && <Text style={S.mallMiniBadge}>Mall</Text>}
                    </View>

                    <View style={S.tagRow}>
                      <Text style={S.tagOrange}>Chính hãng</Text>
                      <Text style={S.tagGold}>Đổi trả 30 ngày</Text>
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
                  </View>
                </TouchableOpacity>
              );
            })}
            {displayProducts.length === 0 && (
              <View style={S.emptyBlock}>
                <Ionicons name="alert-circle-outline" size={40} color={T.sub} />
                <Text style={S.emptyText}>Không tìm thấy sản phẩm phù hợp!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  safe: { flex: 1 },
  desktop: { maxWidth: 414, alignSelf: 'center', borderRadius: 20, overflow: 'hidden' },
  
  header: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: T.border,
    backgroundColor: '#FFF', zIndex: 99, elevation: 4
  },
  backBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerSearchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 12, height: 36, marginHorizontal: 8 },
  headerSearchInput: { flex: 1, fontSize: 13, color: T.black, paddingVertical: 0 },
  cartBtn: { padding: 8 },

  bannerCard: { height: 120, position: 'relative', padding: 15, justifyContent: 'flex-end' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  bannerInfo: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#FFF' },
  brandNameText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  mallBadge: { backgroundColor: T.red, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  mallBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },

  statsRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '800', color: T.black },
  statLabel: { fontSize: 10, color: T.sub, marginTop: 2 },
  statDivider: { width: 1, height: 16, backgroundColor: T.border, alignSelf: 'center' },

  vouchersBlock: { marginTop: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: T.black, marginLeft: 15, marginBottom: 10 },
  voucherCard: { flexDirection: 'row', width: 160, height: 54, borderWidth: 1, borderColor: '#D0E2FF', backgroundColor: '#EBF3FF', borderRadius: 6, overflow: 'hidden' },
  voucherLeft: { flex: 1, paddingLeft: 8, justifyContent: 'center' },
  voucherDiscText: { fontSize: 12, fontWeight: '800', color: T.orange },
  voucherMinText: { fontSize: 8, color: T.sub, marginTop: 1 },
  voucherSep: { width: 1, height: '80%', borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#0066F5', alignSelf: 'center' },
  voucherRight: { width: 44, backgroundColor: T.orange, justifyContent: 'center', alignItems: 'center' },
  voucherBtnTxt: { color: '#FFF', fontSize: 10, fontWeight: '800', textAlign: 'center' },

  tabsContainer: { backgroundColor: '#FFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent' },
  tabItemActive: { backgroundColor: T.orangeLight, borderColor: T.orange },
  tabTxt: { fontSize: 12, color: '#475569', fontWeight: '500' },
  tabTxtActive: { color: T.orange, fontWeight: '700' },

  sortBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: '#FFF' },
  sortItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  sortItemActive: { borderBottomWidth: 2, borderBottomColor: T.orange },
  sortTxt: { fontSize: 12, color: '#64748B' },
  sortTxtActive: { color: T.orange, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between', gap: 8 },
  gridCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: T.border, marginBottom: 12 },
  gridImgWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
  gridImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardBadgeRight: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FFDA24', paddingHorizontal: 4, paddingVertical: 2, alignItems: 'center' },
  discountText: { color: T.red, fontSize: 9, fontWeight: '800' },
  discountLabel: { color: '#FFF', fontSize: 6, fontWeight: '800' },
  freeshipBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00BFA5', paddingVertical: 2, alignItems: 'center' },
  freeshipBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  
  gridInfo: { padding: 8 },
  gridName: { fontSize: 11, color: T.black, height: 32, lineHeight: 16, fontWeight: '500' },
  gridPrice: { fontSize: 12, color: T.red, fontWeight: '800', marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 4, marginVertical: 4 },
  tagOrange: { borderColor: T.orange, borderWidth: 0.5, borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, color: T.orange, fontSize: 8, fontWeight: '700' },
  tagGold: { borderColor: '#F5A623', borderWidth: 0.5, borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, color: '#F5A623', fontSize: 8, fontWeight: '700' },
  cardStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardRatingTxt: { fontSize: 9, color: T.black, marginLeft: 2, fontWeight: '600' },
  cardSoldTxt: { fontSize: 9, color: T.sub },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },

  emptyBlock: { width: '100%', paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, color: T.sub, marginTop: 10 },
  
  shopRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  shopNameText: { fontSize: 9, color: '#475569', maxWidth: '75%', fontWeight: '600' },
  mallMiniBadge: { backgroundColor: T.red, borderRadius: 2, paddingHorizontal: 3, paddingVertical: 0.5, color: '#FFF', fontSize: 6, fontWeight: '900', marginLeft: 4, textTransform: 'uppercase' },
});
