import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image, ScrollView,
  SafeAreaView, Platform, Alert, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#222222',
  white: '#FFFFFF',
  bg: '#F5F5F5',
  sub: '#888888',
  border: '#E8E8E8',
  orange: '#00B14F',   // Shopee Green
  green: '#00B14F',
  red: '#00B14F',      // Green Theme
  gold: '#F5A623',
};

const MOCK_SHOPS: Record<string, any> = {
  s1: {
    id: 's1',
    name: 'Apple Premium Store',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    cover: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
    joined: '2 năm trước',
    responseRate: '99%',
    responseTime: 'Trong vài phút',
    followers: '150k',
    rating: '4.9 ★',
    cancelRate: '0.1%',
    productsCount: 45,
    description: 'Chào mừng quý khách đến với Apple Premium Store. Chúng tôi chuyên phân phối các dòng sản phẩm iPhone, iPad, Mac, phụ kiện Apple chính hãng 100%. Giờ hỗ trợ khách hàng trực tuyến: 8:00 - 22:00 hàng ngày (kể cả ngày lễ).',
    address: 'Quận 1, TP. Hồ Chí Minh',
    contact: '028 1234 5678',
    mst: '0316492348',
    license: 'GPKD số 104/GP-BCT cấp ngày 15/08/2023',
    warrantyPolicy: 'Bảo hành chính hãng 12 tháng tại các trung tâm ủy quyền toàn quốc.',
    returnPolicy: 'Lỗi 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi phần cứng từ nhà sản xuất.',
    badge: 'Mall',
    vouchers: [
      { id: 'v_s1_1', code: 'APPL100', discount: '100k', minSpend: '2M' },
      { id: 'v_s1_2', code: 'APPL500', discount: '500k', minSpend: '10M' },
    ]
  },
  s2: {
    id: 's2',
    name: 'Minimalist Studio',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    joined: '1 năm trước',
    responseRate: '95%',
    responseTime: 'Trong vài giờ',
    followers: '12.5k',
    rating: '4.8 ★',
    cancelRate: '0.2%',
    productsCount: 120,
    description: 'Minimalist Studio mang đến cho quý khách các thiết kế thời trang tối giản thanh lịch, chất liệu vải cao cấp chọn lọc kỹ lưỡng, đường may sắc nét tinh tế. Giờ hỗ trợ khách hàng trực tuyến: 9:00 - 21:00 hàng ngày.',
    address: 'Quận Hai Bà Trưng, Hà Nội',
    contact: '098 7654 321',
    mst: '0109586734',
    license: 'Hộ kinh doanh cá thể Minimalist đăng ký lần đầu ngày 02/02/2024',
    warrantyPolicy: 'Hỗ trợ sửa đổi, may đo miễn phí trong vòng 3 tháng kể từ ngày nhận hàng.',
    returnPolicy: 'Đổi trả miễn phí trong 7 ngày nếu không vừa size (yêu cầu giữ nguyên tem mác).',
    badge: 'Yêu thích',
    vouchers: [
      { id: 'v_s2_1', code: 'MINI20', discount: '20k', minSpend: '300k' },
      { id: 'v_s2_2', code: 'MINI50', discount: '50k', minSpend: '800k' },
    ]
  }
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function ShopDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const shopId = (id as string) || 's1';
  const shop = MOCK_SHOPS[shopId] || MOCK_SHOPS['s1'];

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Local state
  const [isFollowing, setIsFollowing] = useState(false);
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'products'>('home');
  const [showIntro, setShowIntro] = useState(false);

  const shopProducts = MOCK_PRODUCTS.filter(p => p.shopId === shopId);

  const toggleClaim = (voucherId: string) => {
    if (claimedVouchers.includes(voucherId)) return;
    setClaimedVouchers([...claimedVouchers, voucherId]);
    Alert.alert('Thành công', 'Voucher đã được lưu vào ví của bạn!');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/shopping');
    }
  };

  return (
    <SafeAreaView style={S.container}>
      {/* 🟢 TOP FIXED NAVIGATION HEADER */}
      <View style={S.fixedHeader}>
        <TouchableOpacity style={S.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={T.white} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{shop.name}</Text>
        <TouchableOpacity style={S.cartBtn} onPress={() => router.push('/shopping/cart')}>
          <Ionicons name="cart-outline" size={24} color={T.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* 🎨 COVER & SHOP HEADER CARD */}
        <View style={S.shopHeaderCard}>
          <Image source={{ uri: shop.cover }} style={StyleSheet.absoluteFillObject} />
          <View style={S.coverOverlay} />

          <View style={S.shopHeaderMain}>
            <Image source={{ uri: shop.logo }} style={S.shopLogo} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={S.shopName} numberOfLines={1}>{shop.name}</Text>
                <View style={[S.badge, { backgroundColor: shop.badge === 'Mall' ? T.red : T.orange }]}>
                  <Text style={S.badgeTxt}>{shop.badge}</Text>
                </View>
              </View>
              <Text style={S.joinedText}>Đã tham gia: {shop.joined}</Text>
            </View>

            <View style={S.shopActionCol}>
              <TouchableOpacity
                style={[S.followBtn, isFollowing && { backgroundColor: 'rgba(255,255,255,0.3)' }]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={S.followBtnTxt}>{isFollowing ? 'Đang Theo dõi' : '+ Theo dõi'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.chatBtnOutline} onPress={() => Alert.alert('Chat', `Bắt đầu chat với ${shop.name}`)}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={T.white} style={{ marginRight: 4 }} />
                <Text style={S.chatBtnTxt}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 📊 SHOP STATS GRID BAR (Bản cập nhật mới) */}
        <View style={S.statsBar}>
          <View style={S.statItem}>
            <Text style={S.statVal}>{shop.rating}</Text>
            <Text style={S.statLabel}>Đánh giá</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statVal}>{shop.followers}</Text>
            <Text style={S.statLabel}>Followers</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statVal}>{shop.responseRate}</Text>
            <Text style={S.statLabel}>Phản hồi Chat</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statVal}>{shop.cancelRate}</Text>
            <Text style={S.statLabel}>Tỉ lệ huỷ đơn</Text>
          </View>
        </View>

        {/* 📖 COLLAPSIBLE SHOP INTRODUCTION (Bản cập nhật mới) */}
        <View style={S.introCard}>
          <TouchableOpacity style={S.introHeader} onPress={() => setShowIntro(!showIntro)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="information-circle-outline" size={16} color={T.orange} style={{ marginRight: 6 }} />
              <Text style={S.introTitle}>GIỚI THIỆU CỬA HÀNG</Text>
            </View>
            <Ionicons name={showIntro ? "chevron-up" : "chevron-down"} size={16} color={T.sub} />
          </TouchableOpacity>
          {showIntro && (
            <Text style={S.introDescText}>{shop.description}</Text>
          )}
        </View>

        {/* ⚡ SHOP LIVE / REPLAY CAMPAIGNS (Bản cập nhật mới) */}
        <View style={S.campaignsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            <View style={[S.campBadge, { backgroundColor: '#FF2A54' }]}>
              <Text style={S.campBadgeTxt}>🔴 LIVE BÁN HÀNG 20h HÀNG NGÀY</Text>
            </View>
            <View style={[S.campBadge, { backgroundColor: T.orange }]}>
              <Text style={S.campBadgeTxt}>🚚 FREESHIP XTRA ĐƠN TỪ 0Đ</Text>
            </View>
            <View style={[S.campBadge, { backgroundColor: T.gold }]}>
              <Text style={S.campBadgeTxt}>🪙 HOÀN XU 15% TỐI ĐA 100K</Text>
            </View>
          </ScrollView>
        </View>

        {/* 🎟️ SHOP VOUCHERS CAROUSEL */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>MÃ GIẢM GIÁ CỦA SHOP</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {shop.vouchers.map((v: any) => {
              const isClaimed = claimedVouchers.includes(v.id);
              return (
                <View key={v.id} style={S.voucherCard}>
                  {/* Left punch card hole style */}
                  <View style={S.voucherLeft}>
                    <Text style={S.voucherDiscount}>{v.discount}</Text>
                    <Text style={S.voucherMinSpend}>Đơn tối thiểu {v.minSpend}</Text>
                  </View>
                  <View style={S.voucherSeparator} />
                  {/* Right claim button */}
                  <TouchableOpacity
                    style={[S.voucherRight, isClaimed && { backgroundColor: '#E2E8F0' }]}
                    onPress={() => toggleClaim(v.id)}
                    disabled={isClaimed}
                  >
                    <Text style={[S.voucherBtnTxt, isClaimed && { color: T.sub }]}>
                      {isClaimed ? 'Đã lưu' : 'Lưu mã'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 🏷️ SHOP TABS SELECTOR */}
        <View style={S.tabsContainer}>
          <TouchableOpacity
            style={[S.tabItem, activeTab === 'home' && S.tabItemActive]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[S.tabLabel, activeTab === 'home' && { color: T.orange, fontWeight: '800' }]}>TRANG CHỦ SHOP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.tabItem, activeTab === 'products' && S.tabItemActive]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[S.tabLabel, activeTab === 'products' && { color: T.orange, fontWeight: '800' }]}>SẢN PHẨM ({shopProducts.length})</Text>
          </TouchableOpacity>
        </View>

        {/* 🎁 PRODUCTS CONTAINER */}
        {activeTab === 'home' ? (
          <View style={S.section}>
            {/* Show Featured Product Banner */}
            {shopProducts.length > 0 && (
              <TouchableOpacity
                style={S.featuredBannerCard}
                onPress={() => router.push(`/shopping/product?id=${shopProducts[0].id}`)}
              >
                <Image source={{ uri: shopProducts[0].image }} style={S.featuredBannerImg} />
                <View style={S.featuredOverlay}>
                  <View style={S.featuredBadge}><Text style={S.featuredBadgeTxt}>SẢN PHẨM NỔI BẬT</Text></View>
                  <Text style={S.featuredName} numberOfLines={1}>{shopProducts[0].name}</Text>
                  <Text style={S.featuredPrice}>{formatMoney(shopProducts[0].price)}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Popular Items Row */}
            <Text style={[S.sectionSubTitle, { marginTop: 25 }]}>MỚI LÊN KỆ</Text>
            <View style={S.grid}>
              {shopProducts.slice(0, 4).map(p => {
                const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
                return (
                  <TouchableOpacity key={`shop-home-${p.id}`} style={S.gridCard} onPress={() => router.push(`/shopping/product?id=${p.id}`)}>
                    <View style={S.gridImgWrap}>
                      <Image source={{ uri: p.image }} style={S.gridImg} />
                      {discountPercent > 0 && (
                        <View style={S.cardBadgeRight}>
                          <Text style={S.discountText}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </View>
                    <View style={S.gridInfo}>
                      <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                      <Text style={S.gridPrice}>{formatMoney(p.price)}</Text>
                      <Text style={S.cardSoldTxt}>Đã bán {p.sold}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={S.section}>
            {/* All Products Grid */}
            <View style={S.grid}>
              {shopProducts.map(p => {
                const discountPercent = Math.round((1 - p.price / p.originalPrice) * 100);
                return (
                  <TouchableOpacity key={`shop-all-${p.id}`} style={S.gridCard} onPress={() => router.push(`/shopping/product?id=${p.id}`)}>
                    <View style={S.gridImgWrap}>
                      <Image source={{ uri: p.image }} style={S.gridImg} />
                      {discountPercent > 0 && (
                        <View style={S.cardBadgeRight}>
                          <Text style={S.discountText}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </View>
                    <View style={S.gridInfo}>
                      <Text style={S.gridName} numberOfLines={2}>{p.name}</Text>
                      <Text style={S.gridPrice}>{formatMoney(p.price)}</Text>
                      <Text style={S.cardSoldTxt}>Đã bán {p.sold}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 📜 BUSINESS INFO & POLICIES */}
        <View style={[S.section, { borderTopWidth: 8, borderTopColor: '#F1F5F9', paddingTop: 20 }]}>
          <Text style={S.policyTitle}>THÔNG TIN PHÁP LÝ & CHÍNH SÁCH</Text>
          
          <View style={S.policyRow}>
            <Ionicons name="document-text-outline" size={18} color={T.sub} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.policyLabel}>Mã số thuế & GPKD</Text>
              <Text style={S.policyDesc}>MST: {shop.mst} | {shop.license}</Text>
            </View>
          </View>

          <View style={S.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={T.sub} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.policyLabel}>Chính sách bảo hành</Text>
              <Text style={S.policyDesc}>{shop.warrantyPolicy}</Text>
            </View>
          </View>

          <View style={S.policyRow}>
            <Ionicons name="refresh-outline" size={18} color={T.sub} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.policyLabel}>Chính sách đổi trả</Text>
              <Text style={S.policyDesc}>{shop.returnPolicy}</Text>
            </View>
          </View>

          <View style={S.policyRow}>
            <Ionicons name="location-outline" size={18} color={T.sub} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.policyLabel}>Địa chỉ cửa hàng</Text>
              <Text style={S.policyDesc}>{shop.address} | Hotline: {shop.contact}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  fixedHeader: {
    height: 56, backgroundColor: T.orange, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between',
    zIndex: 99, elevation: 4
  },
  backBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: T.white, fontSize: 16, fontWeight: '800', flex: 1, marginLeft: 15 },
  cartBtn: { padding: 4 },

  shopHeaderCard: { height: 140, position: 'relative', padding: 20, justifyContent: 'flex-end' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  shopHeaderMain: { flexDirection: 'row', alignItems: 'center' },
  shopLogo: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: '#FFF' },
  shopName: { color: T.white, fontSize: 16, fontWeight: '800', maxWidth: '70%' },
  badge: { borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, marginLeft: 6 },
  badgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  joinedText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },

  shopActionCol: { marginLeft: 'auto', gap: 6 },
  followBtn: { backgroundColor: T.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  followBtnTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  chatBtnOutline: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, justifyContent: 'center' },
  chatBtnTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  statsBar: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '800', color: T.black },
  statLabel: { fontSize: 10, color: T.sub, marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: T.border, alignSelf: 'center' },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: T.black, marginLeft: 20, marginBottom: 12 },
  sectionSubTitle: { fontSize: 12, fontWeight: '800', color: T.black, marginLeft: 20, marginBottom: 12 },

  voucherCard: { flexDirection: 'row', backgroundColor: '#EBF3FF', borderRadius: 8, borderWidth: 1, borderColor: '#D0E2FF', width: 180, height: 60, overflow: 'hidden' },
  voucherLeft: { flex: 1, padding: 8, justifyContent: 'center' },
  voucherDiscount: { fontSize: 12, fontWeight: '800', color: T.orange },
  voucherMinSpend: { fontSize: 8, color: T.sub, marginTop: 2 },
  voucherSeparator: { width: 1, height: '80%', borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#0066F5', alignSelf: 'center' },
  voucherRight: { width: 50, backgroundColor: T.orange, justifyContent: 'center', alignItems: 'center' },
  voucherBtnTxt: { color: '#FFF', fontSize: 10, fontWeight: '800', textAlign: 'center' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, marginTop: 20 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: T.orange },
  tabLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  featuredBannerCard: { marginHorizontal: 20, height: 160, borderRadius: 12, overflow: 'hidden', position: 'relative', marginTop: 10 },
  featuredBannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', padding: 16, justifyContent: 'flex-end' },
  featuredBadge: { backgroundColor: '#FFD700', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, marginBottom: 6 },
  featuredBadgeTxt: { color: '#000', fontSize: 8, fontWeight: '900' },
  featuredName: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  featuredPrice: { color: '#FFF', fontSize: 13, fontWeight: '700', marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between', marginTop: 10 },
  gridCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: T.border, marginBottom: 12 },
  gridImgWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
  gridImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardBadgeRight: { position: 'absolute', top: 6, right: 6, backgroundColor: '#FFDA24', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2 },
  discountText: { color: T.red, fontSize: 9, fontWeight: '800' },
  gridInfo: { padding: 8 },
  gridName: { fontSize: 11, color: T.black, height: 32, lineHeight: 16, fontWeight: '500' },
  gridPrice: { fontSize: 12, color: T.red, fontWeight: '800', marginTop: 4 },
  cardSoldTxt: { fontSize: 9, color: T.sub, marginTop: 4 },

  policyTitle: { fontSize: 11, fontWeight: '800', color: T.black, marginLeft: 20, marginBottom: 15 },
  policyRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, alignItems: 'flex-start' },
  policyLabel: { fontSize: 11, fontWeight: '700', color: T.black },
  policyDesc: { fontSize: 9, color: T.sub, marginTop: 2, lineHeight: 14 },

  // Intro card styles
  introCard: { marginHorizontal: 20, marginTop: 15, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: T.border },
  introHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  introTitle: { fontSize: 11, fontWeight: '800', color: T.black },
  introDescText: { fontSize: 11, color: T.sub, marginTop: 8, lineHeight: 16 },

  // Campaigns styles
  campaignsSection: { marginTop: 15 },
  campBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  campBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },
});
