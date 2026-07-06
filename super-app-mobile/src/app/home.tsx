import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { userName, avatarUrl, accentHex, accentRgb, bgUrl } = useUser();
  const { theme } = useTheme();
  
  const [showBalance, setShowBalance] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5); // Thay bằng số lượng thực tế
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const BANNERS = [
    { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80', title: 'Siêu Sale 50%' },
    { id: '2', image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80', title: 'Du lịch trọn gói' },
    { id: '3', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', title: 'Hoàn tiền 20%' },
  ];

  const menuItems = [
    { id: 'wallet', title: 'Ví VN Pay', icon: '💳', route: '/wallet' },
    { id: 'video', title: 'Video', icon: '🎬', route: '/video' },
    { id: 'jobs', title: 'Việc làm', icon: '💼', route: '/jobs' },
    { id: 'shop', title: 'Mua sắm', icon: '🛒', route: '/shopping' },
    { id: 'business', title: 'Doanh nghiệp', icon: '🏢', route: '/business' },
    { id: 'appearance', title: 'Giao diện', icon: '🎨', route: '/settings' },
  ];

  const UTILITY_GROUPS = [
    {
      id: 'transport',
      title: 'Dịch vụ Đa dụng (Siêu App)',
      items: [
        { id: 'transport', title: 'Vận chuyển', icon: '🛵', route: '/transport' },
        { id: 'food', title: 'Đặt đồ ăn', icon: '🍔', route: '/food' },
        { id: 'health', title: 'Sức khỏe', icon: '⚕️', route: '/health' },
        { id: 'cleaning', title: 'Dọn dẹp', icon: '🧹', route: '/cleaning' },
      ]
    },
    {
      id: 'entertainment',
      title: 'Giải trí & Du lịch',
      items: [
        { id: 'travel', title: 'Du lịch', icon: '🏖️', route: '/travel' },
        { id: 'cinema', title: 'Xem phim', icon: '🎬', route: '/cinema' },
        { id: 'flights', title: 'Vé máy bay', icon: '✈️', route: '/flights' },
        { id: 'hotels', title: 'Khách sạn', icon: '🏨', route: '/hotels' },
        { id: 'events', title: 'Sự kiện', icon: '🎟️', route: '/events' },
      ]
    },
    {
      id: 'education',
      title: 'Học tập & Giáo dục',
      items: [
        { id: 'edu_dashboard', title: 'Giáo dục', icon: '🎓', route: '/education' },
      ]
    }
  ];

  const currentBg = theme.backgroundImage || bgUrl;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={{ uri: currentBg }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* ===== HEADER: Avatar & Themes ===== */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.accountSection} onPress={() => router.push('/account')}>
              <Image 
                source={{ uri: avatarUrl }} 
                style={[styles.avatar, { borderColor: accentHex }]} 
                resizeMode="cover"
              />
              <View>
                <Text style={[styles.greeting, { fontFamily: theme.fontFamily, fontSize: 13 * theme.fontSizeScale }]}>Chào buổi sáng,</Text>
                <Text style={[styles.userName, { fontFamily: theme.fontFamily, color: theme.textColor, fontSize: 18 * theme.fontSizeScale }]}>{userName}</Text>
              </View>
            </TouchableOpacity>

          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Thanh tìm kiếm */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { borderColor: `rgba(${accentRgb}, 0.3)` }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput 
                  placeholder="Bạn đang tìm dịch vụ gì?" 
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* ===== PROMO CAROUSEL ===== */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, color: theme.textColor, fontSize: 18 * theme.fontSizeScale }]}>Chương trình nổi bật</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
              {BANNERS.map((banner) => (
                <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.9}>
                  <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                  <View style={styles.bannerOverlay}>
                    <Text style={[styles.bannerTitle, { fontFamily: theme.fontFamily, fontSize: 16 * theme.fontSizeScale }]}>{banner.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ===== GRID MENU ===== */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, color: theme.textColor, fontSize: 18 * theme.fontSizeScale }]}>Khám phá</Text>
            </View>
            <View style={styles.gridContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.gridItemContainer}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route as any);
                    } else {
                      window.alert(`Đang phát triển tính năng: ${item.title}`);
                    }
                  }}
                >
                  <View 
                    style={[styles.gridItem, { borderColor: `rgba(${accentRgb}, 0.2)` }]}
                  >
                    <View style={[styles.gridIconWrapper, { backgroundColor: `rgba(${accentRgb}, 0.1)`, borderColor: `rgba(${accentRgb}, 0.3)` }]}>
                      <Text style={styles.gridIcon}>{item.icon}</Text>
                      {item.id === 'utilities' && notificationCount > 0 && (
                        <View style={[styles.badge, { 
                          backgroundColor: '#EF4444', 
                          top: -6, 
                          right: -6, 
                          width: 20, 
                          height: 20, 
                          borderRadius: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: '#111827'
                        }]}>
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                            {notificationCount > 99 ? '99+' : notificationCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.gridTitle, { fontFamily: theme.fontFamily, color: theme.textColor, fontSize: 13 * theme.fontSizeScale }]}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* ===== UTILITY GROUPS ===== */}
            {UTILITY_GROUPS.map((group) => {
              const filteredItems = group.items.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              if (filteredItems.length === 0) return null;

              return (
                <View key={group.id} style={styles.groupContainer}>
                  <Text style={[styles.groupTitle, { fontFamily: theme.fontFamily }]}>{group.title}</Text>
                  <View style={styles.utilityGridContainer}>
                    {filteredItems.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={[styles.utilityGridItem, { borderColor: `rgba(${accentRgb}, 0.2)` }]}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (item.route) router.push(item.route as any);
                          else window.alert(`Đang mở dịch vụ: ${item.title}`);
                        }}
                      >
                        <View style={[styles.utilityIconWrapper, { backgroundColor: `rgba(${accentRgb}, 0.15)` }]}>
                          <Text style={styles.utilityItemIcon}>{item.icon}</Text>
                        </View>
                        <Text style={[styles.utilityItemTitle, { fontFamily: theme.fontFamily }]}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
            
            <View style={{height: 100}} />
          </ScrollView>

          {/* ===== FLOATING BOTTOM TAB BAR ===== */}
          <View style={[styles.bottomTabBar, { borderColor: `rgba(${accentRgb}, 0.3)` }]}>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabIconActive}>🏠</Text>
              <Text style={[styles.tabTextActive, { color: accentHex, fontFamily: theme.fontFamily, fontSize: 12 * theme.fontSizeScale }]}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/social')}>
              <Text style={styles.tabIcon}>🌐</Text>
              <Text style={[styles.tabText, { fontFamily: theme.fontFamily, fontSize: 12 * theme.fontSizeScale }]}>Mạng xã hội</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/account')}>
              <Text style={styles.tabIcon}>👤</Text>
              <Text style={[styles.tabText, { fontFamily: theme.fontFamily, fontSize: 12 * theme.fontSizeScale }]}>Tài khoản</Text>
            </TouchableOpacity>
          </View>

        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 20 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 390,       
    maxHeight: 844,
    aspectRatio: 390 / 844, 
    borderWidth: 12,     
    borderColor: '#000000',
    borderRadius: 44,    
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    zIndex: 10,
  },
  accountSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00D8FF',
    marginRight: 12,
  },
  greeting: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: '75%',
    maxWidth: 320,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    borderLeftWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  sidebarTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sidebarSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 20,
  },
  sidebarContent: {
    flex: 1,
  },
  notifRowContainer: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notifLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifIcon: {
    fontSize: 20,
  },
  notifAppTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notifBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  iconText: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  walletCard: {
    backgroundColor: 'rgba(20, 25, 35, 0.4)', 
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)', 
    marginBottom: 30,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0, 216, 255, 0.15)',
    }),
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    color: '#00D8FF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  walletLogo: {
    fontSize: 24,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyeIcon: {
    fontSize: 20,
    marginLeft: 12,
    opacity: 0.8,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletActionBtn: {
    backgroundColor: 'rgba(0, 216, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  walletActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  walletActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  carouselContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingRight: 20,
  },
  bannerCard: {
    width: 280,
    height: 140,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  gridItemContainer: {
    width: '31%',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gridItem: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(8px)' }),
  },
  gridIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridIcon: {
    fontSize: 26,
  },
  gridTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    marginBottom: 40,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
      backgroundImage: 'linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,165,0,0.2))',
    }),
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 2,
  },
  premiumDesc: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  premiumBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  premiumBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'rgba(20, 25, 35, 0.85)',
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 10,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(15px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
    }),
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconActive: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 1,
  },
  tabText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 11,
    color: '#00D8FF',
    fontWeight: '700',
  },
  searchContainer: {
    paddingBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    height: '100%',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  groupContainer: {
    marginBottom: 25,
  },
  groupTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  utilityGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  utilityGridItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(5px)' }),
  },
  utilityIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  utilityItemIcon: {
    fontSize: 24,
  },
  utilityItemTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  }
});
