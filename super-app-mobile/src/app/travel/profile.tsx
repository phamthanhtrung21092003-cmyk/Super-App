import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { TravelBottomNav } from '../../components/travel/TravelBottomNav';

export default function TravelProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { userName, avatarUrl, bio, hometown } = useUser();
  const { width } = Dimensions.get('window');
  const isDesktop = Platform.OS === 'web' && width > 768;

  const headerTopPadding = Platform.OS === 'android'
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, insets.top + 6, 40)
    : Math.max(insets.top, 12);

  const STATS = [
    { label: 'Chuyến đi', value: '12', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Địa điểm', value: '28', color: '#10B981', bg: '#DCFCE7' },
    { label: 'Bài viết', value: '15', color: '#F97316', bg: '#FFEDD5' },
    { label: 'Km đã đi', value: '8.4k', color: '#8B5CF6', bg: '#F3E8FF' },
  ];

  const MENU_BOOKINGS = [
    { title: 'Địa điểm yêu thích (Wishlist)', icon: 'heart-outline', count: '96', route: '/travel/wishlist' },
    { title: 'Lịch sử đặt chỗ & Tour', icon: 'ticket-outline', count: '3', route: '/travel/booking-history' },
    { title: 'Khách sạn đã đặt', icon: 'bed-outline', count: '2', route: '/travel/hotel' },
    { title: 'Xe đã thuê', icon: 'car-outline', count: '1', route: '/travel/car' },
    { title: 'Đơn ẩm thực & Đặt bàn', icon: 'restaurant-outline', count: '4', route: '/travel/food' },
    { title: 'Camping & Glamping', icon: 'bonfire-outline', count: '1', route: '/travel/camping' },
  ];

  const MENU_WALLET = [
    { title: 'Phương thức thanh toán', icon: 'card-outline', desc: 'VietQR, MoMo, Visa' },
    { title: 'Ví điện tử V-Life', icon: 'wallet-outline', desc: 'Ưu đãi hoàn tiền' },
    { title: 'Kho ưu đãi & Voucher', icon: 'gift-outline', desc: '5 mã khả dụng' },
  ];

  const MENU_SUPPORT = [
    { title: 'Trung tâm trợ giúp du lịch', icon: 'help-circle-outline' },
    { title: 'Hỗ trợ 24/7 (Hotline 1900 6868)', icon: 'headset-outline' },
    { title: 'Bảo mật & Quyền riêng tư', icon: 'shield-checkmark-outline' },
  ];

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <View>
            <Text style={styles.headerTitle}>Hồ sơ du lịch</Text>
            <Text style={styles.headerSubtitle}>Tài khoản thành viên V-Life</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/account')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ── USER PROFILE HERO CARD ── */}
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Image
                source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' }}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.profileName}>{userName || 'Phạm Thành Trung'}</Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeText}>VIP</Text>
                  </View>
                </View>
                <Text style={styles.profileBio}>{bio || 'Kẻ lữ hành tìm kiếm những chân trời mới. 🌍✨'}</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location-sharp" size={11} color="#64748B" />
                  <Text style={styles.locText}>{hometown || 'Hà Nội, Việt Nam'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/account')}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={15} color="#0284C7" />
              <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ cá nhân</Text>
            </TouchableOpacity>
          </View>

          {/* ── STATS GRID ── */}
          <View style={styles.statsGrid}>
            {STATS.map((s, idx) => (
              <View key={idx} style={[styles.statBox, { backgroundColor: s.bg }]}>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── MENU: QUẢN LÝ DỊCH VỤ ── */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionHeader}>Dịch vụ của tôi</Text>
            <View style={styles.menuCard}>
              {MENU_BOOKINGS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, index > 0 && styles.menuItemBorder]}
                  onPress={() => item.route && router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon as any} size={18} color="#0284C7" />
                    </View>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.count && <View style={styles.badge}><Text style={styles.badgeTxt}>{item.count}</Text></View>}
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── MENU: VÍ & THANH TOÁN ── */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionHeader}>Ví & Thanh toán</Text>
            <View style={styles.menuCard}>
              {MENU_WALLET.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, index > 0 && styles.menuItemBorder]}
                  onPress={() => router.push('/wallet' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name={item.icon as any} size={18} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {item.desc && <Text style={styles.menuItemDesc}>{item.desc}</Text>}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── MENU: HỖ TRỢ & BẢO MẬT ── */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionHeader}>Hỗ trợ & Cài đặt</Text>
            <View style={styles.menuCard}>
              {MENU_SUPPORT.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, index > 0 && styles.menuItemBorder]}
                  onPress={() => router.push('/privacy' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name={item.icon as any} size={18} color="#7C3AED" />
                    </View>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <TravelBottomNav activeTab="profile" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,
    maxHeight: 844,
    aspectRatio: 390 / 844,
    borderWidth: 10,
    borderColor: '#1E293B',
    borderRadius: 44,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  vipBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileBio: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 16,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locText: {
    fontSize: 11,
    color: '#64748B',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 8,
    marginTop: 14,
    gap: 5,
  },
  editBtnText: {
    fontSize: 12.5,
    color: '#0284C7',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuSectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
