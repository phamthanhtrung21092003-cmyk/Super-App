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
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

const BACKGROUND = 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80';
const COVER_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/300?img=11';

export default function AccountScreen() {
  const router = useRouter();
  const { userName, avatarUrl, setAvatarUrl, bio, setBio, accentHex, accentRgb, bgUrl } = useUser();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để đổi Avatar!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/crop',
        params: {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
        }
      });
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Bạn có chắc chắn muốn đăng xuất không?');
      if (confirm) router.replace('/');
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => router.replace('/') }
      ]);
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={{ uri: bgUrl }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* ===== COVER & AVATAR ===== */}
            <View style={styles.profileHeader}>
              <Image source={{ uri: COVER_PHOTO }} style={styles.coverPhoto} />
              <TouchableOpacity style={[styles.avatarContainer, { backgroundColor: `rgba(${accentRgb}, 0.3)` }]} onPress={pickImage} activeOpacity={0.8}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
                <View style={[styles.onlineBadge, { borderColor: '#000' }]} />
              </TouchableOpacity>
            </View>

            {/* ===== USER INFO ===== */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={[styles.userHandle, { color: accentHex }]}>@nhaluhanh</Text>
              
              {isEditingBio ? (
                <View style={styles.bioEditContainer}>
                  <TextInput 
                    style={[styles.bioInput, { borderColor: `rgba(${accentRgb}, 0.4)` }]}
                    value={tempBio}
                    onChangeText={setTempBio}
                    multiline
                    autoFocus
                    maxLength={100}
                  />
                  <View style={styles.bioActionRow}>
                    <TouchableOpacity onPress={() => setIsEditingBio(false)} style={styles.bioActionBtn}>
                      <Text style={styles.bioActionCancel}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setBio(tempBio);
                        setIsEditingBio(false);
                      }} 
                      style={styles.bioActionBtn}
                    >
                      <Text style={[styles.bioActionSave, { color: accentHex }]}>Lưu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setTempBio(bio); setIsEditingBio(true); }} style={styles.bioContainer}>
                  <Text style={styles.bio}>{bio}</Text>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ===== SOCIAL STATS ===== */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>128</Text>
                <Text style={styles.statLabel}>Bài viết</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10.5K</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>245</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
              </View>
            </View>

            {/* ===== SOCIAL TOOLBAR ===== */}
            <View style={styles.toolbarContainer}>
              <TouchableOpacity style={[styles.toolbarBtn, styles.primaryBtn, { backgroundColor: `rgba(${accentRgb}, 0.2)`, borderColor: `rgba(${accentRgb}, 0.5)` }]}>
                <Text style={styles.toolbarIcon}>👥</Text>
                <Text style={[styles.primaryBtnText, { color: accentHex }]}>Bạn bè</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn}>
                <Text style={styles.toolbarIcon}>➕</Text>
                <Text style={styles.toolbarBtnText}>Thêm bạn</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarBtn}>
                <Text style={styles.toolbarIcon}>🔔</Text>
                <Text style={styles.toolbarBtnText}>Lời mời (3)</Text>
              </TouchableOpacity>
            </View>

            {/* ===== MENU LIST ===== */}
            <View style={styles.menuContainer}>
              <Text style={styles.menuSectionTitle}>Cài đặt hệ thống</Text>

              {/* Tùy chỉnh giao diện removed as requested */}
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>⚙️</Text>
                  <Text style={styles.menuItemText}>Cài đặt & Quyền riêng tư</Text>
                </View>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>🛡️</Text>
                  <Text style={styles.menuItemText}>Bảo mật tài khoản</Text>
                </View>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>

              {/* Thanh toán & Giao dịch removed as requested */}
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>❓</Text>
                  <Text style={styles.menuItemText}>Trung tâm trợ giúp</Text>
                </View>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>

              {/* LOGOUT BUTTON */}
              <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleLogout}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>🚪</Text>
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </View>
              </TouchableOpacity>

            </View>

            <View style={{height: 120}} />
          </ScrollView>

          {/* ===== FLOATING BOTTOM TAB BAR ===== */}
          <View style={styles.bottomTabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
              <Text style={styles.tabIcon}>🏠</Text>
              <Text style={styles.tabText}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/social')}>
              <Text style={styles.tabIcon}>🌐</Text>
              <Text style={styles.tabText}>Mạng xã hội</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabIconActive}>👤</Text>
              <Text style={styles.tabTextActive}>Tài khoản</Text>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
  coverPhoto: {
    width: '100%',
    height: 180,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
    backgroundColor: 'rgba(0, 216, 255, 0.3)', // Glow effect
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
    }),
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#000', // Matches background to make it pop
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00FF00',
    borderWidth: 3,
    borderColor: '#000',
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#00D8FF',
    fontWeight: '600',
    marginBottom: 12,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
  },
  editIcon: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  bioEditContainer: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  bioInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 216, 255, 0.4)',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 14,
    padding: 10,
    textAlign: 'center',
    minHeight: 60,
  },
  bioActionRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  bioActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bioActionCancel: {
    color: '#A0AEC0',
    fontSize: 13,
    fontWeight: '600',
  },
  bioActionSave: {
    color: '#00D8FF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  primaryBtn: {
    backgroundColor: 'rgba(0, 216, 255, 0.2)',
    borderColor: 'rgba(0, 216, 255, 0.5)',
  },
  primaryBtnText: {
    color: '#00D8FF',
    fontSize: 13,
    fontWeight: '700',
  },
  toolbarBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  toolbarIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 35, 0.4)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  menuItemChevron: {
    fontSize: 20,
    color: '#64748B',
  },
  logoutBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  logoutText: {
    fontSize: 15,
    color: '#FF4D4D',
    fontWeight: '700',
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
});
