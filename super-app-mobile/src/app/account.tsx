import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  ScrollView, StatusBar, Platform, Modal, TextInput,
  useWindowDimensions, SafeAreaView, Alert, ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

// ─── Mock Video Data ──────────────────────────────────────────────────────────
const MOCK_VIDEOS = [
  { id: '1', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300', views: '124K', duration: '0:32', liked: false },
  { id: '2', thumb: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=300', views: '89K',  duration: '1:04', liked: true  },
  { id: '3', thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300', views: '250K', duration: '0:47', liked: false },
  { id: '4', thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300', views: '52K',  duration: '0:18', liked: false },
  { id: '5', thumb: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=300', views: '310K', duration: '2:15', liked: true  },
  { id: '6', thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300', views: '78K',  duration: '0:55', liked: false },
];

const MOCK_SERVICES = [
  { id: 's1', title: 'Vé xem phim: Dune Part 2', date: 'Vé ngày 30/06 - 19:30', icon: '🎟️', category: 'Giải trí' },
  { id: 's2', title: 'Tour Khám Phá Đà Lạt 2N1Đ', date: 'Khởi hành 15/07', icon: '⛺', category: 'Du lịch' },
  { id: 's3', title: 'Thanh toán tiền điện tháng 6', date: 'Đã thanh toán thành công', icon: '⚡', category: 'Hóa đơn' },
];

const HIGHLIGHTS = [
  { id: 'h1', label: 'Hành trình', emoji: '🗺️', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
  { id: 'h2', label: 'Cà phê', emoji: '☕', thumb: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=200' },
  { id: 'h3', label: 'Bộ sưu tập', emoji: '👜', thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200' },
  { id: 'h4', label: 'Thêm mới', emoji: '＋', thumb: '' },
];

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, visible }: { message: string; visible: boolean }) => {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutDown.duration(200)} style={toastStyles.wrap}>
      <Ionicons name="checkmark-circle" size={17} color="#22c55e" />
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
};
import { FadeOutDown } from 'react-native-reanimated';
const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 90, alignSelf: 'center', zIndex: 999,
    backgroundColor: 'rgba(20,20,20,0.96)', borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12,
  },
  text: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});

export default function AccountScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    userName, avatarUrl, setAvatarUrl, bio, setBio, accentHex, accentRgb, bgUrl, setUserName,
    addresses, addAddress, deleteAddress, setDefaultAddress, coins, rewardPoints, vipTier 
  } = useUser();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const COLS = 3;
  const CELL = (isDesktop ? 390 - 2 : width - 2) / COLS;

  const [activeTab, setActiveTab] = useState<'posted' | 'saved' | 'liked' | 'reposted'>('posted');
  const [showEdit, setShowEdit] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // New Address form states
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newDetailAddress, setNewDetailAddress] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Edit states
  const [editName, setEditName] = useState(userName);
  const [editBio, setEditBio] = useState(bio);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để đổi Avatar!');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setShowEdit(false);
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

  const handleSaveEdit = () => {
    setUserName(editName.trim() || userName);
    setBio(editBio.trim());
    setShowEdit(false);
    showToast('Đã cập nhật hồ sơ thành công!');
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
        <ImageBackground source={{ uri: bgUrl }} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.darkOverlay} />
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

          {/* Toast */}
          <Toast message={toast.message} visible={toast.visible} />

          {/* ══════════ TOP BAR ══════════ */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { fontFamily: theme.fontFamily }]}>Hồ sơ cá nhân</Text>
            <TouchableOpacity style={styles.topBtn} onPress={() => setShowMore(true)}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* ══════════ PROFILE HEADER CARD (Premium Layout) ══════════ */}
            <View style={styles.profileHeaderCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              
              <View style={styles.avatarRow}>
                <TouchableOpacity style={styles.avatarRing} onPress={pickImage}>
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                  <View style={[styles.onlineDot, { backgroundColor: '#10B981', borderColor: '#000' }]} />
                  <View style={[styles.editBadge, { backgroundColor: accentHex }]}>
                    <Ionicons name="camera" size={12} color="#000" />
                  </View>
                </TouchableOpacity>

                <View style={styles.nameDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.displayName, { fontFamily: theme.fontFamily }]} numberOfLines={1}>
                      {userName}
                    </Text>
                    <View style={[styles.verifiedIcon, { backgroundColor: accentHex }]}>
                      <Ionicons name="checkmark" size={10} color="#000" />
                    </View>
                  </View>
                  <Text style={[styles.handleName, { color: accentHex }]}>
                    @{userName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')}
                  </Text>
                  <Text style={styles.bioText} numberOfLines={2}>
                    {bio || 'Giới thiệu bản thân của bạn... ✏️'}
                  </Text>
                </View>
              </View>

              {/* Stats Card inside Header */}
              <View style={styles.statsCard}>
                <View style={styles.statCell}>
                  <Text style={[styles.statNum, { color: accentHex }]}>12</Text>
                  <Text style={styles.statLbl}>Bài viết</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={[styles.statNum, { color: accentHex }]}>10.5K</Text>
                  <Text style={styles.statLbl}>Người theo dõi</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={[styles.statNum, { color: accentHex }]}>348</Text>
                  <Text style={styles.statLbl}>Đang theo dõi</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `rgba(${accentRgb}, 0.15)`, borderColor: accentHex }]} onPress={() => setShowEdit(true)}>
                  <Ionicons name="create-outline" size={16} color={accentHex} style={{ marginRight: 6 }} />
                  <Text style={[styles.actionBtnText, { color: accentHex, fontFamily: theme.fontFamily }]}>
                    Sửa hồ sơ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconBtn} onPress={() => setShowQR(true)}>
                  <Ionicons name="qr-code-outline" size={18} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconBtn} onPress={() => router.push('/settings')}>
                  <Ionicons name="settings-outline" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ══════════ STORY HIGHLIGHTS ══════════ */}
            <View style={styles.highlightSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {HIGHLIGHTS.map(h => (
                  <TouchableOpacity key={h.id} style={styles.highlightItem}>
                    <View style={[styles.highlightRing, { borderColor: `rgba(${accentRgb}, 0.4)` }]}>
                      {h.thumb ? (
                        <Image source={{ uri: h.thumb }} style={styles.highlightImg} />
                      ) : (
                        <View style={[styles.highlightImg, { backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 18 }}>{h.emoji}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.highlightLabel} numberOfLines={1}>{h.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ══════════ MARKETPLACE ACCOUNT INFO ══════════ */}
            <View style={styles.marketCard}>
              <View style={styles.marketRow}>
                <View style={styles.marketItem}>
                  <Text style={styles.marketIcon}>🪙</Text>
                  <View>
                    <Text style={styles.marketVal}>{coins.toLocaleString('vi-VN')} Xu</Text>
                    <Text style={styles.marketLbl}>Xu tích luỹ</Text>
                  </View>
                </View>
                <View style={styles.marketDivider} />
                <View style={styles.marketItem}>
                  <Text style={styles.marketIcon}>🏆</Text>
                  <View>
                    <Text style={styles.marketVal}>{rewardPoints} Điểm</Text>
                    <Text style={styles.marketLbl}>Điểm thưởng</Text>
                  </View>
                </View>
                <View style={styles.marketDivider} />
                <View style={styles.marketItem}>
                  <Text style={styles.marketIcon}>👑</Text>
                  <View>
                    <Text style={[styles.marketVal, { color: '#F59E0B' }]}>{vipTier}</Text>
                    <Text style={styles.marketLbl}>Hạng VIP</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={[styles.addressBtn, { backgroundColor: accentHex }]} onPress={() => setShowAddressModal(true)}>
                <Ionicons name="location-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.addressBtnText}>Quản lý địa chỉ giao hàng ({addresses.length})</Text>
              </TouchableOpacity>
            </View>

            {/* ══════════ PREMIUM TABS SWITCHER ══════════ */}
            <View style={styles.tabsContainer}>
              {[
                { key: 'posted', icon: 'grid-outline', label: 'Đã đăng' },
                { key: 'saved', icon: 'bookmark-outline', label: 'Đã lưu' },
                { key: 'liked', icon: 'heart-outline', label: 'Đã tim' },
                { key: 'reposted', icon: 'repeat-outline', label: 'Đăng lại' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Ionicons
                    name={activeTab === tab.key ? tab.icon.replace('-outline', '') as any : tab.icon as any}
                    size={18}
                    color={activeTab === tab.key ? accentHex : 'rgba(255,255,255,0.45)'}
                  />
                  <Text style={[styles.tabLabel, { fontFamily: theme.fontFamily }, activeTab === tab.key && { color: accentHex, fontWeight: '700' }]}>
                    {tab.label}
                  </Text>
                  {activeTab === tab.key && (
                    <Animated.View entering={FadeInUp.duration(200)} style={[styles.activeIndicator, { backgroundColor: accentHex }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* ══════════ TABS CONTENT ══════════ */}
            {activeTab === 'posted' && (
              <View style={styles.grid}>
                {MOCK_VIDEOS.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.gridCell, { width: CELL, height: CELL * 1.5 }]}
                    onPress={() => router.push('/video')}
                  >
                    <Image source={{ uri: v.thumb }} style={styles.gridThumb} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gridOverlay} />
                    <View style={styles.viewsRow}>
                      <Ionicons name="play-outline" size={10} color="#FFF" />
                      <Text style={styles.viewsText}>{v.views}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'saved' && (
              <View style={styles.grid}>
                {MOCK_VIDEOS.slice(0, 3).map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.gridCell, { width: CELL, height: CELL * 1.5 }]}
                    onPress={() => router.push('/video')}
                  >
                    <Image source={{ uri: v.thumb }} style={styles.gridThumb} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gridOverlay} />
                    <View style={styles.viewsRow}>
                      <Ionicons name="bookmark-outline" size={10} color="#FFF" />
                      <Text style={styles.viewsText}>{v.views}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'liked' && (
              <View style={styles.grid}>
                {MOCK_VIDEOS.filter(v => v.liked).map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.gridCell, { width: CELL, height: CELL * 1.5 }]}
                    onPress={() => router.push('/video')}
                  >
                    <Image source={{ uri: v.thumb }} style={styles.gridThumb} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gridOverlay} />
                    <View style={styles.viewsRow}>
                      <Ionicons name="heart" size={10} color="#FF4D4F" />
                      <Text style={styles.viewsText}>{v.views}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'reposted' && (
              <View style={styles.grid}>
                {MOCK_VIDEOS.slice(3, 6).map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.gridCell, { width: CELL, height: CELL * 1.5 }]}
                    onPress={() => router.push('/video')}
                  >
                    <Image source={{ uri: v.thumb }} style={styles.gridThumb} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gridOverlay} />
                    <View style={styles.viewsRow}>
                      <Ionicons name="repeat-outline" size={10} color="#FFF" />
                      <Text style={styles.viewsText}>{v.views}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* ══════════ FLOATING BOTTOM TAB BAR ══════════ */}
          <View style={styles.bottomTabBar}>
            <TouchableOpacity style={styles.tabItemBar} onPress={() => router.replace('/home')}>
              <Ionicons name="home-outline" size={22} color="rgba(255,255,255,0.55)" />
              <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily }]}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItemBar} onPress={() => router.push('/social')}>
              <Ionicons name="planet-outline" size={22} color="rgba(255,255,255,0.55)" />
              <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily }]}>Mạng xã hội</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItemBar}>
              <Ionicons name="person" size={22} color={accentHex} />
              <Text style={[styles.tabBarLabel, { fontFamily: theme.fontFamily, color: accentHex, fontWeight: '700' }]}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* ══════════ EDIT MODAL ══════════ */}
          <Modal visible={showEdit} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowEdit(false)} />
              <BlurView intensity={90} tint="dark" style={styles.sheetContent}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHead}>
                  <TouchableOpacity onPress={() => setShowEdit(false)}>
                    <Text style={{ color: '#888', fontSize: 15 }}>Huỷ</Text>
                  </TouchableOpacity>
                  <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Sửa hồ sơ</Text>
                  <TouchableOpacity onPress={handleSaveEdit}>
                    <Text style={{ color: accentHex, fontSize: 15, fontWeight: '800' }}>Lưu</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }}>
                  <View style={styles.editAvatarWrap}>
                    <TouchableOpacity style={styles.editAvatarRing} onPress={pickImage}>
                      <Image source={{ uri: avatarUrl }} style={styles.editAvatarImg} />
                      <View style={styles.cameraOverlay}>
                        <Ionicons name="camera" size={24} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.photoTip}>Chạm vào ảnh để đổi avatar</Text>
                  </View>

                  <Text style={styles.inputLabel}>Tên hiển thị</Text>
                  <TextInput
                    style={[styles.textInput, { fontFamily: theme.fontFamily }]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Nhập tên của bạn..."
                    placeholderTextColor="#555"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 20 }]}>Tiểu sử</Text>
                  <TextInput
                    style={[styles.textInput, { fontFamily: theme.fontFamily, height: 80, textAlignVertical: 'top' }]}
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="Nhập tiểu sử ngắn..."
                    placeholderTextColor="#555"
                    multiline
                    maxLength={100}
                  />
                </ScrollView>
              </BlurView>
            </View>
          </Modal>

          {/* ══════════ QR MODAL ══════════ */}
          <Modal visible={showQR} transparent animationType="fade">
            <TouchableOpacity style={styles.qrOverlay} activeOpacity={1} onPress={() => setShowQR(false)}>
              <BlurView intensity={85} tint="dark" style={styles.qrCard}>
                <Image source={{ uri: avatarUrl }} style={styles.qrAvatar} />
                <Text style={styles.qrName}>{userName}</Text>
                <Text style={styles.qrHandle}>@{userName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')}</Text>

                <View style={[styles.qrBox, { borderColor: accentHex }]}>
                  <LinearGradient
                    colors={[`${accentHex}15`, `${accentHex}40`]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.qrGrid}>
                    {Array.from({ length: 49 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.qrDot,
                          Math.random() > 0.55 && { backgroundColor: accentHex },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={[styles.qrLogo, { backgroundColor: accentHex }]}>
                    <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>S</Text>
                  </View>
                </View>

                <Text style={styles.qrHint}>Quét để theo dõi tôi trên Super App</Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[styles.qrBtn, { backgroundColor: accentHex }]} onPress={() => showToast('Mã QR đã được lưu!')}>
                    <Ionicons name="download-outline" size={16} color="#000" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#000', fontWeight: '700', fontSize: 13 }}>Lưu ảnh</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.qrBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={() => showToast('Đã copy link hồ sơ!')}>
                    <Ionicons name="share-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </TouchableOpacity>
          </Modal>

          {/* ══════════ MORE OPTIONS MODAL ══════════ */}
          <Modal visible={showMore} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowMore(false)} />
              <BlurView intensity={90} tint="dark" style={styles.moreSheet}>
                <View style={styles.sheetHandle} />
                <Text style={[styles.moreTitle, { fontFamily: theme.fontFamily }]}>Tùy chọn</Text>
                {[
                  { icon: 'shield-checkmark-outline', label: 'Cài đặt quyền riêng tư', color: '#FFF', fn: () => router.push('/settings') },
                  { icon: 'log-out-outline', label: 'Đăng xuất tài khoản', color: '#FF4D4D', fn: handleLogout },
                ].map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.moreItem}
                    onPress={() => { setShowMore(false); opt.fn(); }}
                  >
                    <View style={[styles.moreIconWrap, { backgroundColor: opt.color === '#FF4D4D' ? 'rgba(255,77,77,0.1)' : 'rgba(255,255,255,0.05)' }]}>
                      <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                    </View>
                    <Text style={[styles.moreItemText, { color: opt.color, fontFamily: theme.fontFamily }]}>{opt.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#555" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </BlurView>
            </View>
          </Modal>

          {/* ══════════ ADDRESS LIST MODAL ══════════ */}
          <Modal visible={showAddressModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAddressModal(false)} />
              <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHead}>
                  <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                    <Text style={{ color: '#888', fontSize: 15 }}>Đóng</Text>
                  </TouchableOpacity>
                  <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Sổ địa chỉ</Text>
                  <TouchableOpacity onPress={() => setShowAddAddressModal(true)}>
                    <Text style={{ color: accentHex, fontSize: 15, fontWeight: '800' }}>+ Thêm</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                  {addresses.length === 0 ? (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>Chưa có địa chỉ nào.</Text>
                  ) : (
                    addresses.map(addr => (
                      <View key={addr.id} style={styles.addressCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.addressCardName}>{addr.receiverName}</Text>
                          {addr.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: `${accentHex}20`, borderColor: accentHex }]}>
                              <Text style={{ color: accentHex, fontSize: 10, fontWeight: '800' }}>Mặc định</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressCardText}>SĐT: {addr.receiverPhone}</Text>
                        <Text style={styles.addressCardText}>{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</Text>
                        {addr.note ? <Text style={[styles.addressCardText, { fontStyle: 'italic', opacity: 0.8 }]}>Ghi chú: {addr.note}</Text> : null}
                        
                        <View style={styles.addressCardActions}>
                          {!addr.isDefault && (
                            <TouchableOpacity onPress={() => setDefaultAddress(addr.id)} style={{ marginRight: 15 }}>
                              <Text style={{ color: accentHex, fontSize: 12, fontWeight: '600' }}>Đặt mặc định</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                            <Text style={{ color: '#FF4D4D', fontSize: 12, fontWeight: '600' }}>Xoá</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </BlurView>
            </View>
          </Modal>

          {/* ══════════ ADD ADDRESS MODAL ══════════ */}
          <Modal visible={showAddAddressModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAddAddressModal(false)} />
              <BlurView intensity={95} tint="dark" style={styles.sheetContent}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHead}>
                  <TouchableOpacity onPress={() => setShowAddAddressModal(false)}>
                    <Text style={{ color: '#888', fontSize: 15 }}>Huỷ</Text>
                  </TouchableOpacity>
                  <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Địa chỉ mới</Text>
                  <TouchableOpacity onPress={() => {
                    if (!newReceiverName || !newReceiverPhone || !newDetailAddress) {
                      Alert.alert('Lỗi', 'Vui lòng điền đủ Tên, SĐT và Địa chỉ cụ thể');
                      return;
                    }
                    addAddress({
                      receiverName: newReceiverName,
                      receiverPhone: newReceiverPhone,
                      province: newProvince || 'Hà Nội',
                      district: newDistrict || 'Cầu Giấy',
                      ward: newWard || 'Dịch Vọng',
                      detailAddress: newDetailAddress,
                      note: newNote,
                      isDefault: newIsDefault
                    });
                    // Reset
                    setNewReceiverName('');
                    setNewReceiverPhone('');
                    setNewProvince('');
                    setNewDistrict('');
                    setNewWard('');
                    setNewDetailAddress('');
                    setNewNote('');
                    setNewIsDefault(false);
                    setShowAddAddressModal(false);
                    showToast('Đã thêm địa chỉ giao hàng mới!');
                  }}>
                    <Text style={{ color: accentHex, fontSize: 15, fontWeight: '800' }}>Lưu</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.inputLabel}>Tên người nhận *</Text>
                  <TextInput style={styles.textInput} value={newReceiverName} onChangeText={setNewReceiverName} placeholder="Ví dụ: Nguyễn Văn A" placeholderTextColor="#555" />
                  
                  <Text style={styles.inputLabel}>Số điện thoại *</Text>
                  <TextInput style={styles.textInput} value={newReceiverPhone} onChangeText={setNewReceiverPhone} placeholder="Ví dụ: 0912345678" placeholderTextColor="#555" keyboardType="phone-pad" />
                  
                  <Text style={styles.inputLabel}>Tỉnh / Thành phố</Text>
                  <TextInput style={styles.textInput} value={newProvince} onChangeText={setNewProvince} placeholder="Ví dụ: Hà Nội" placeholderTextColor="#555" />
                  
                  <Text style={styles.inputLabel}>Quận / Huyện</Text>
                  <TextInput style={styles.textInput} value={newDistrict} onChangeText={setNewDistrict} placeholder="Ví dụ: Cầu Giấy" placeholderTextColor="#555" />
                  
                  <Text style={styles.inputLabel}>Phường / Xã</Text>
                  <TextInput style={styles.textInput} value={newWard} onChangeText={setNewWard} placeholder="Ví dụ: Dịch Vọng Hậu" placeholderTextColor="#555" />
                  
                  <Text style={styles.inputLabel}>Địa chỉ chi tiết (Số nhà, đường) *</Text>
                  <TextInput style={styles.textInput} value={newDetailAddress} onChangeText={setNewDetailAddress} placeholder="Ví dụ: Số 123 Duy Tân" placeholderTextColor="#555" />
                  
                  <Text style={styles.inputLabel}>Ghi chú</Text>
                  <TextInput style={styles.textInput} value={newNote} onChangeText={setNewNote} placeholder="Ví dụ: Giao giờ hành chính..." placeholderTextColor="#555" />
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 20 }}>
                    <Text style={{ color: '#FFF', fontSize: 14 }}>Đặt làm địa chỉ mặc định</Text>
                    <Switch value={newIsDefault} onValueChange={setNewIsDefault} trackColor={{ false: '#444', true: accentHex }} thumbColor="#FFF" />
                  </View>
                  <View style={{ height: 60 }} />
                </ScrollView>
              </BlurView>
            </View>
          </Modal>

        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  webWrapper: {
    flex: 1, backgroundColor: '#0c0f17',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 10 } as any),
  },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: {
    maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844,
    borderWidth: 10, borderColor: '#1c1c1e', borderRadius: 40,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 20,
  },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,12,20,0.85)' },

  // Top Nav
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 6 : 28, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  topBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  topTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Profile Card (Customized Premium Design)
  profileHeaderCard: {
    margin: 16, padding: 18, borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  avatarRing: { position: 'relative' },
  avatarImg: { width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: '#FFF' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  editBadge: { position: 'absolute', bottom: -2, left: -2, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderContent: 1, borderColor: '#000' } as any,
  nameDetails: { flex: 1, paddingTop: 2 },
  displayName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  verifiedIcon: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  handleName: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  bioText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 8, lineHeight: 16 },

  // Stats
  statsCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, marginTop: 18, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statCell: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: '70%', alignSelf: 'center' },

  // Action Buttons
  btnRow: { flexDirection: 'row', marginTop: 14, gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 14, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  actionIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Highlights
  highlightSection: { marginVertical: 10 },
  highlightItem: { alignItems: 'center', width: 68 },
  highlightRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, padding: 2, marginBottom: 5 },
  highlightImg: { width: '100%', height: '100%', borderRadius: 26 },
  highlightLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', width: '100%', textAlign: 'center' },

  // Tabs Switcher
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 4, position: 'relative' },
  tabItemActive: {},
  tabLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  activeIndicator: { position: 'absolute', bottom: 0, width: '40%', height: 2, borderRadius: 1 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  gridCell: { position: 'relative', overflow: 'hidden' },
  gridThumb: { width: '100%', height: '100%', backgroundColor: '#111' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  viewsRow: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

  // Services
  servicesList: { padding: 14, gap: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  serviceIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  serviceTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  serviceDate: { color: '#666', fontSize: 11, marginTop: 3 },
  serviceCategory: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Edit Sheet
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', maxHeight: '92%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 2 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  sheetTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  editAvatarWrap: { alignItems: 'center', marginVertical: 20 },
  editAvatarRing: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', position: 'relative' },
  editAvatarImg: { width: 90, height: 90 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  photoTip: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 },
  inputLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', marginLeft: 4, marginBottom: 8 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },

  // QR Modal
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  qrCard: { width: '100%', borderRadius: 28, overflow: 'hidden', alignItems: 'center', padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  qrAvatar: { width: 68, height: 68, borderRadius: 34, marginBottom: 10 },
  qrName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  qrHandle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3, marginBottom: 20 },
  qrBox: { width: 190, height: 190, borderRadius: 20, borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 156, height: 156 },
  qrDot: { width: 22, height: 22, backgroundColor: 'transparent', borderRadius: 3 },
  qrLogo: { position: 'absolute', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0a0c14' },
  qrHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 16, textAlign: 'center' },
  qrBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 14 },

  // More Sheet
  moreSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', paddingBottom: 40 },
  moreTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  moreItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  moreIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  moreItemText: { fontSize: 14, fontWeight: '600' },

  // Floating Bottom Tab Bar
  bottomTabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: 'rgba(10,12,20,0.92)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(20px)' } as any),
  },
  tabItemBar: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabBarLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 3, fontWeight: '500' },

  // Marketplace Styles
  marketCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 16, 
    borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'
  },
  marketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  marketItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  marketIcon: { fontSize: 24 },
  marketVal: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  marketLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: '600' },
  marketDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 30 },
  addressBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 14, marginTop: 4
  },
  addressBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },

  // Addresses List Card inside Modal
  addressCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  addressCardName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  addressCardText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4, lineHeight: 18 },
  addressCardActions: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
  defaultBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1
  },
});
