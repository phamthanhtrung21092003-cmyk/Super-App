import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView,
  StatusBar, ScrollView, Image, TextInput, Dimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

type BookingTab = 'flight' | 'hotel' | 'homestay' | 'tour' | 'car';

const TABS: { key: BookingTab; icon: string; label: string }[] = [
  { key: 'flight', icon: '✈️', label: 'Vé máy bay' },
  { key: 'hotel', icon: '🏨', label: 'Khách sạn' },
  { key: 'homestay', icon: '🏠', label: 'Homestay' },
  { key: 'tour', icon: '🗺️', label: 'Tour' },
  { key: 'car', icon: '🚗', label: 'Thuê xe' },
];

const FLIGHTS = [
  { id: 'f1', airline: 'Vietnam Airlines', logo: '🇻🇳', from: 'HAN', to: 'PQC', dep: '06:00', arr: '07:35', duration: '1h35', price: 890000, class: 'Phổ thông', seats: 12, sale: true },
  { id: 'f2', airline: 'Bamboo Airways', logo: '🎋', from: 'HAN', to: 'PQC', dep: '09:15', arr: '10:55', duration: '1h40', price: 720000, class: 'Phổ thông', seats: 5, sale: false },
  { id: 'f3', airline: 'VietJet Air', logo: '🔴', from: 'HAN', to: 'PQC', dep: '13:30', arr: '15:05', duration: '1h35', price: 580000, class: 'Phổ thông', seats: 23, sale: true },
  { id: 'f4', airline: 'Vietnam Airlines', logo: '🇻🇳', from: 'HAN', to: 'PQC', dep: '18:45', arr: '20:20', duration: '1h35', price: 1250000, class: 'Thương gia', seats: 3, sale: false },
];

const HOTELS = [
  { id: 'h1', name: 'InterContinental Phú Quốc', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', rating: 5.0, reviews: 1240, price: 4200000, amenities: ['WiFi', 'Hồ bơi', 'Spa', 'Gym'], location: 'Bãi Kem, An Thới' },
  { id: 'h2', name: 'Vinpearl Resort & Spa', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', rating: 4.8, reviews: 892, price: 2800000, amenities: ['WiFi', 'Hồ bơi', 'Nhà hàng'], location: 'Bãi Dài, Gành Dầu' },
  { id: 'h3', name: 'Premier Village Phu Quoc', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', rating: 4.9, reviews: 560, price: 6800000, amenities: ['Pool Villa', 'Bãi biển riêng', 'Butler'], location: 'Mũi Ông Đội' },
];

const TOURS = [
  { id: 't1', name: 'Tour Phú Quốc 4N3Đ - Trọn gói', image: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=400', rating: 4.9, reviews: 320, price: 6500000, included: ['Vé máy bay', 'Khách sạn 4*', 'Ăn 3 bữa', 'Hướng dẫn viên'], seats: 8, depart: '15/11/2024' },
  { id: 't2', name: 'Khám phá Bắc Đảo - 1 ngày', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', rating: 4.7, reviews: 180, price: 850000, included: ['Xe đưa đón', 'Hướng dẫn viên', 'Ăn trưa'], seats: 15, depart: 'Mỗi ngày' },
  { id: 't3', name: 'Lặn ngắm san hô Nam Đảo', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.8, reviews: 241, price: 1200000, included: ['Thuyền', 'Thiết bị lặn', 'Hướng dẫn lặn', 'Ăn trưa'], seats: 6, depart: '06:30 hàng ngày' },
];

export default function BookingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [activeTab, setActiveTab] = useState<BookingTab>('flight');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip');
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'rating'>('price');

  const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#0F172A', '#1E3A5F']} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Đặt dịch vụ</Text>
          <TouchableOpacity style={S.headerRight}>
            <Ionicons name="receipt-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* TAB BAR */}
        <View style={S.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
            {TABS.map(t => (
              <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={[S.tab, activeTab === t.key && S.tabActive]}>
                <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                <Text style={[S.tabLabel, activeTab === t.key && S.tabLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

          {/* FLIGHT TAB */}
          {activeTab === 'flight' && (
            <>
              {/* Search Form */}
              <LinearGradient colors={['#0C4A6E', '#0F172A']} style={S.searchForm}>
                <View style={S.tripTypeRow}>
                  {(['oneway', 'roundtrip'] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setTripType(t)} style={[S.tripType, tripType === t && S.tripTypeActive]}>
                      <Text style={[S.tripTypeTxt, tripType === t && S.tripTypeTxtActive]}>{t === 'oneway' ? 'Một chiều' : 'Khứ hồi'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={S.routeRow}>
                  <View style={S.routeBox}>
                    <Text style={S.routeLabel}>Từ</Text>
                    <Text style={S.routeCity}>Hà Nội</Text>
                    <Text style={S.routeCode}>HAN - Nội Bài</Text>
                  </View>
                  <TouchableOpacity style={S.swapBtn}>
                    <Ionicons name="swap-horizontal" size={24} color="#0EA5E9" />
                  </TouchableOpacity>
                  <View style={[S.routeBox, { alignItems: 'flex-end' }]}>
                    <Text style={S.routeLabel}>Đến</Text>
                    <Text style={S.routeCity}>Phú Quốc</Text>
                    <Text style={S.routeCode}>PQC - Phú Quốc</Text>
                  </View>
                </View>
                <View style={S.datePassRow}>
                  <View style={S.datePill}>
                    <Ionicons name="calendar-outline" size={16} color="#0EA5E9" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={S.datePillLabel}>Ngày đi</Text>
                      <Text style={S.datePillValue}>15 Thg 11, T6</Text>
                    </View>
                  </View>
                  {tripType === 'roundtrip' && (
                    <View style={S.datePill}>
                      <Ionicons name="calendar-outline" size={16} color="#14B8A6" />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={S.datePillLabel}>Ngày về</Text>
                        <Text style={S.datePillValue}>17 Thg 11, CN</Text>
                      </View>
                    </View>
                  )}
                  <View style={S.datePill}>
                    <Ionicons name="people-outline" size={16} color="#F97316" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={S.datePillLabel}>Hành khách</Text>
                      <Text style={S.datePillValue}>1 người lớn</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={S.searchBtn} onPress={() => Alert.alert('Tìm chuyến', 'Đang tìm kiếm chuyến bay...')}>
                  <LinearGradient colors={['#0EA5E9', '#0369A1']} style={S.searchBtnGrad}>
                    <Ionicons name="search" size={18} color="#FFF" />
                    <Text style={S.searchBtnTxt}>Tìm chuyến bay</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>

              {/* Sort */}
              <View style={S.sortRow}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>Sắp xếp:</Text>
                {(['price', 'time', 'rating'] as const).map(s => (
                  <TouchableOpacity key={s} onPress={() => setSortBy(s)} style={[S.sortChip, sortBy === s && S.sortChipActive]}>
                    <Text style={[S.sortChipTxt, sortBy === s && S.sortChipTxtActive]}>
                      {s === 'price' ? 'Giá thấp' : s === 'time' ? 'Sớm nhất' : 'Đánh giá'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Flight List */}
              <View style={{ paddingHorizontal: 16, gap: 12 }}>
                {FLIGHTS.map(fl => (
                  <View key={fl.id} style={S.flightCard}>
                    {fl.sale && (
                      <View style={S.saleBadge}>
                        <Text style={S.saleBadgeTxt}>HOT DEAL</Text>
                      </View>
                    )}
                    <View style={S.flightTop}>
                      <View style={S.airlineInfo}>
                        <Text style={{ fontSize: 24 }}>{fl.logo}</Text>
                        <View style={{ marginLeft: 8 }}>
                          <Text style={S.airlineName}>{fl.airline}</Text>
                          <Text style={S.flightClass}>{fl.class}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={S.flightPrice}>{fmt(fl.price)}</Text>
                        <Text style={S.flightSeats}>{fl.seats} chỗ</Text>
                      </View>
                    </View>
                    <View style={S.flightRoute}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={S.flightTime}>{fl.dep}</Text>
                        <Text style={S.flightCode}>{fl.from}</Text>
                      </View>
                      <View style={S.flightMiddle}>
                        <Text style={S.flightDuration}>{fl.duration}</Text>
                        <View style={S.flightLine}>
                          <View style={S.flightDot} />
                          <View style={S.flightDash} />
                          <Ionicons name="airplane" size={14} color="#0EA5E9" style={{ transform: [{ rotate: '90deg' }] }} />
                          <View style={S.flightDash} />
                          <View style={S.flightDot} />
                        </View>
                        <Text style={S.flightDirect}>Bay thẳng</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={S.flightTime}>{fl.arr}</Text>
                        <Text style={S.flightCode}>{fl.to}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={S.bookFlightBtn} onPress={() => Alert.alert('Đặt vé', `Đang chuyển đến thanh toán vé ${fl.airline}...`)}>
                      <Text style={S.bookFlightBtnTxt}>Chọn vé</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* HOTEL TAB */}
          {activeTab === 'hotel' && (
            <>
              <LinearGradient colors={['#0C4A6E', '#0F172A']} style={S.searchForm}>
                <View style={S.routeBox}>
                  <Text style={S.routeLabel}>Điểm đến</Text>
                  <Text style={S.routeCity}>Phú Quốc</Text>
                </View>
                <View style={S.datePassRow}>
                  <View style={S.datePill}>
                    <Ionicons name="calendar-outline" size={16} color="#0EA5E9" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={S.datePillLabel}>Nhận phòng</Text>
                      <Text style={S.datePillValue}>15 Thg 11</Text>
                    </View>
                  </View>
                  <View style={S.datePill}>
                    <Ionicons name="calendar-outline" size={16} color="#14B8A6" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={S.datePillLabel}>Trả phòng</Text>
                      <Text style={S.datePillValue}>17 Thg 11</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={S.searchBtn}>
                  <LinearGradient colors={['#0EA5E9', '#0369A1']} style={S.searchBtnGrad}>
                    <Ionicons name="search" size={18} color="#FFF" />
                    <Text style={S.searchBtnTxt}>Tìm khách sạn</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
              <View style={{ paddingHorizontal: 16, gap: 16, paddingTop: 16 }}>
                {HOTELS.map(h => (
                  <TouchableOpacity key={h.id} style={S.hotelCard} onPress={() => Alert.alert('Đặt phòng', `${h.name}`)}>
                    <Image source={{ uri: h.image }} style={S.hotelImg} />
                    <View style={S.hotelStars}>
                      {Array(Math.floor(h.rating)).fill(0).map((_, i) => <Text key={i} style={{ fontSize: 10 }}>⭐</Text>)}
                    </View>
                    <View style={S.hotelInfo}>
                      <Text style={S.hotelName} numberOfLines={1}>{h.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="location-outline" size={12} color="#64748B" />
                        <Text style={S.hotelLocation}>{h.location}</Text>
                      </View>
                      <View style={S.hotelAmenities}>
                        {h.amenities.slice(0, 3).map(a => (
                          <View key={a} style={S.amenityChip}><Text style={S.amenityTxt}>{a}</Text></View>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <View>
                          <Text style={{ color: '#64748B', fontSize: 10 }}>Giá/đêm từ</Text>
                          <Text style={S.hotelPrice}>{fmt(h.price)}</Text>
                        </View>
                        <View style={[S.ratingPill]}>
                          <Ionicons name="star" size={12} color="#FADB14" />
                          <Text style={S.ratingPillTxt}>{h.rating}</Text>
                          <Text style={{ color: '#64748B', fontSize: 10, marginLeft: 2 }}>({h.reviews})</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={S.bookHotelBtn} onPress={() => Alert.alert('Đặt phòng', `Đang xử lý đặt phòng ${h.name}...`)}>
                      <LinearGradient colors={['#0EA5E9', '#0369A1']} style={S.bookHotelGrad}>
                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Đặt phòng</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* TOUR TAB */}
          {activeTab === 'tour' && (
            <View style={{ padding: 16, gap: 16 }}>
              {TOURS.map(t => (
                <View key={t.id} style={S.tourCard}>
                  <Image source={{ uri: t.image }} style={S.tourImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={S.tourImgGrad}>
                    <View style={S.tourDepart}>
                      <Ionicons name="time-outline" size={12} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 11, marginLeft: 4 }}>Khởi hành: {t.depart}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={12} color="#FADB14" />
                      <Text style={{ color: '#FADB14', fontSize: 12, fontWeight: '700', marginLeft: 2 }}>{t.rating}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 10, marginLeft: 4 }}>({t.reviews} đánh giá)</Text>
                    </View>
                  </LinearGradient>
                  {t.seats <= 8 && (
                    <View style={S.hotBadge}>
                      <Text style={S.hotBadgeTxt}>Còn {t.seats} chỗ</Text>
                    </View>
                  )}
                  <View style={S.tourBody}>
                    <Text style={S.tourName} numberOfLines={2}>{t.name}</Text>
                    <View style={S.tourIncludes}>
                      {t.included.map(inc => (
                        <View key={inc} style={S.includeChip}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={S.includeTxt}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                      <View>
                        <Text style={{ color: '#64748B', fontSize: 10 }}>Giá từ</Text>
                        <Text style={S.tourPrice}>{fmt(t.price)}/người</Text>
                      </View>
                      <TouchableOpacity onPress={() => Alert.alert('Đặt tour', t.name)}>
                        <LinearGradient colors={['#F97316', '#DC2626']} style={S.bookTourBtn}>
                          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Đặt ngay</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* OTHER TABS */}
          {(activeTab === 'homestay' || activeTab === 'car') && (
            <View style={S.comingSoon}>
              <Text style={{ fontSize: 60 }}>{activeTab === 'homestay' ? '🏠' : '🚗'}</Text>
              <Text style={S.comingTitle}>Sắp ra mắt!</Text>
              <Text style={S.comingDesc}>Dịch vụ {activeTab === 'homestay' ? 'Homestay' : 'Thuê xe'} đang được hoàn thiện và sẽ sớm có mặt.</Text>
              <TouchableOpacity style={S.notifyBtn} onPress={() => Alert.alert('Đăng ký', 'Đã đăng ký nhận thông báo!')}>
                <Text style={S.notifyBtnTxt}>Nhận thông báo</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safe: { flex: 1, backgroundColor: '#0F172A', width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000', borderRadius: 44, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12, paddingBottom: 14 },
  backBtn: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  headerRight: { padding: 6 },
  tabBar: { backgroundColor: '#1E293B', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  tab: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A' },
  tabActive: { backgroundColor: '#0C4A6E', borderWidth: 1, borderColor: '#0EA5E9' },
  tabLabel: { color: '#64748B', fontSize: 11, marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: '#0EA5E9' },

  searchForm: { margin: 16, borderRadius: 16, padding: 16, gap: 12 },
  tripTypeRow: { flexDirection: 'row', gap: 10 },
  tripType: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  tripTypeActive: { backgroundColor: '#0EA5E9' },
  tripTypeTxt: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  tripTypeTxtActive: { color: '#FFF' },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeBox: { flex: 1 },
  routeLabel: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  routeCity: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  routeCode: { color: '#94A3B8', fontSize: 11 },
  swapBtn: { padding: 10, backgroundColor: 'rgba(14,165,233,0.15)', borderRadius: 25, marginHorizontal: 12 },
  datePassRow: { flexDirection: 'row', gap: 8 },
  datePill: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10 },
  datePillLabel: { color: '#64748B', fontSize: 10 },
  datePillValue: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  searchBtn: { borderRadius: 30, overflow: 'hidden' },
  searchBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  searchBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  sortChipActive: { backgroundColor: '#0C4A6E', borderColor: '#0EA5E9' },
  sortChipTxt: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  sortChipTxtActive: { color: '#0EA5E9' },

  flightCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  saleBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  saleBadgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  flightTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  airlineInfo: { flexDirection: 'row', alignItems: 'center' },
  airlineName: { color: '#E2E8F0', fontWeight: '700', fontSize: 13 },
  flightClass: { color: '#64748B', fontSize: 11, marginTop: 2 },
  flightPrice: { color: '#F97316', fontWeight: '800', fontSize: 16 },
  flightSeats: { color: '#64748B', fontSize: 11, marginTop: 2 },
  flightRoute: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  flightTime: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  flightCode: { color: '#64748B', fontSize: 12, marginTop: 2 },
  flightMiddle: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  flightDuration: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  flightLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  flightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#334155' },
  flightDash: { flex: 1, height: 1, backgroundColor: '#334155' },
  flightDirect: { color: '#10B981', fontSize: 10, marginTop: 4 },
  bookFlightBtn: { backgroundColor: '#0C4A6E', paddingVertical: 10, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#0EA5E9' },
  bookFlightBtnTxt: { color: '#0EA5E9', fontWeight: '700' },

  hotelCard: { backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  hotelImg: { width: '100%', height: 160, resizeMode: 'cover' },
  hotelStars: { flexDirection: 'row', position: 'absolute', top: 12, left: 12, gap: 2 },
  hotelInfo: { padding: 14 },
  hotelName: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  hotelLocation: { color: '#64748B', fontSize: 12, marginLeft: 4 },
  hotelAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  amenityChip: { backgroundColor: 'rgba(14,165,233,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  amenityTxt: { color: '#0EA5E9', fontSize: 11 },
  hotelPrice: { color: '#F97316', fontWeight: '800', fontSize: 16 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(250,219,20,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingPillTxt: { color: '#FADB14', fontWeight: '700', fontSize: 14, marginLeft: 4 },
  bookHotelBtn: { margin: 14, marginTop: 0, borderRadius: 25, overflow: 'hidden' },
  bookHotelGrad: { paddingVertical: 12, alignItems: 'center' },

  tourCard: { backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  tourImg: { width: '100%', height: 180, resizeMode: 'cover' },
  tourImgGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, justifyContent: 'flex-end', padding: 12 },
  tourDepart: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hotBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  hotBadgeTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  tourBody: { padding: 14 },
  tourName: { color: '#FFF', fontSize: 15, fontWeight: '800', lineHeight: 22 },
  tourIncludes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  includeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  includeTxt: { color: '#10B981', fontSize: 11, marginLeft: 4 },
  tourPrice: { color: '#F97316', fontWeight: '800', fontSize: 16 },
  bookTourBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },

  comingSoon: { alignItems: 'center', padding: 40, marginTop: 30 },
  comingTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 16 },
  comingDesc: { color: '#64748B', textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  notifyBtn: { backgroundColor: '#0EA5E9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  notifyBtnTxt: { color: '#FFF', fontWeight: '700' },
});

