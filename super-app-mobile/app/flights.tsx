import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function FlightsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
        
        <LinearGradient colors={['#3B82F6', '#1E3A8A']} style={styles.headerBg}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Vé máy bay</Text>
            <TouchableOpacity>
              <Ionicons name="receipt-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tripTypeRow}>
            <TouchableOpacity style={styles.tripTypeActive}>
              <Text style={[styles.tripTypeTextActive, { fontFamily: theme.fontFamily }]}>Một chiều</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tripTypeInactive}>
              <Text style={[styles.tripTypeText, { fontFamily: theme.fontFamily }]}>Khứ hồi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tripTypeInactive}>
              <Text style={[styles.tripTypeText, { fontFamily: theme.fontFamily }]}>Nhiều chặng</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Booking Form */}
          <View style={styles.bookingForm}>
            <View style={styles.locationRow}>
              <View style={styles.locationItem}>
                <Text style={[styles.locationLabel, { fontFamily: theme.fontFamily }]}>Từ</Text>
                <Text style={[styles.locationCity, { fontFamily: theme.fontFamily }]}>Hà Nội</Text>
                <Text style={[styles.locationCode, { fontFamily: theme.fontFamily }]}>HAN - Nội Bài</Text>
              </View>
              <TouchableOpacity style={styles.swapBtn}>
                <Ionicons name="swap-horizontal" size={24} color="#3B82F6" />
              </TouchableOpacity>
              <View style={[styles.locationItem, { alignItems: 'flex-end' }]}>
                <Text style={[styles.locationLabel, { fontFamily: theme.fontFamily }]}>Đến</Text>
                <Text style={[styles.locationCity, { fontFamily: theme.fontFamily }]}>TP. HCM</Text>
                <Text style={[styles.locationCode, { fontFamily: theme.fontFamily }]}>SGN - Tân Sơn Nhất</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.datePassengerRow}>
              <View style={styles.dateItem}>
                <Text style={[styles.locationLabel, { fontFamily: theme.fontFamily }]}>Ngày đi</Text>
                <Text style={[styles.dateText, { fontFamily: theme.fontFamily }]}>24 Thg 10</Text>
                <Text style={[styles.locationCode, { fontFamily: theme.fontFamily }]}>Thứ Ba</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.passengerItem}>
                <Text style={[styles.locationLabel, { fontFamily: theme.fontFamily }]}>Hành khách</Text>
                <Text style={[styles.dateText, { fontFamily: theme.fontFamily }]}>1 Người lớn</Text>
                <Text style={[styles.locationCode, { fontFamily: theme.fontFamily }]}>Phổ thông</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.accentHex }]}>
              <Text style={[styles.searchBtnText, { fontFamily: theme.fontFamily }]}>Tìm chuyến bay</Text>
            </TouchableOpacity>
          </View>

          {/* Promotions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Ưu đãi độc quyền</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2].map(i => (
                <View key={i} style={styles.promoCard}>
                  <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.promoImage}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 24 }}>SALE 50%</Text>
                  </LinearGradient>
                  <View style={styles.promoInfo}>
                    <Text style={[styles.promoTitle, { fontFamily: theme.fontFamily }]}>Giảm giá nội địa</Text>
                    <Text style={[styles.promoSub, { fontFamily: theme.fontFamily }]}>Nhập mã VMB50</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000000', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  headerBg: { paddingBottom: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  tripTypeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 10 },
  tripTypeActive: { borderBottomWidth: 3, borderBottomColor: '#FFF', paddingBottom: 8 },
  tripTypeInactive: { paddingBottom: 8 },
  tripTypeTextActive: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  tripTypeText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  container: { flex: 1, marginTop: -40 },
  bookingForm: { backgroundColor: '#1F2937', marginHorizontal: 20, borderRadius: 20, padding: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationItem: { flex: 1 },
  locationLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  locationCity: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 2 },
  locationCode: { color: '#94A3B8', fontSize: 12 },
  swapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  datePassengerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dateItem: { flex: 1 },
  passengerItem: { flex: 1, paddingLeft: 16 },
  dividerVertical: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dateText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  searchBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  searchBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  section: { padding: 20, marginTop: 10 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  promoCard: { width: 200, backgroundColor: '#1F2937', borderRadius: 16, marginRight: 16, overflow: 'hidden' },
  promoImage: { height: 100, justifyContent: 'center', alignItems: 'center' },
  promoInfo: { padding: 12 },
  promoTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  promoSub: { color: '#94A3B8', fontSize: 12 }
});
