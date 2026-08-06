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
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

const BACKGROUNDS = [
  { id: '1', title: 'Liquid Light', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: '2', title: 'Cyber City', url: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80' },
  { id: '3', title: 'Neon Night', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80' },
  { id: '4', title: 'Dark Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80' },
  { id: '5', title: 'Purple Void', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80' },
];

const COLORS = [
  { id: 'cyan', name: 'Xanh Cyan', hex: '#00D8FF', rgb: '0, 216, 255' },
  { id: 'pink', name: 'Hồng Cyber', hex: '#FF00FF', rgb: '255, 0, 255' },
  { id: 'gold', name: 'Vàng Royal', hex: '#FFD700', rgb: '255, 215, 0' },
  { id: 'green', name: 'Xanh Matrix', hex: '#00FF00', rgb: '0, 255, 0' },
  { id: 'purple', name: 'Tím Neon', hex: '#8B5CF6', rgb: '139, 92, 246' },
  { id: 'coral', name: 'Đỏ San Hô', hex: '#FF6B6B', rgb: '255, 107, 107' },
];

const FONTS = ['Outfit', 'Inter', 'Roboto', 'System'];

export default function AppearanceScreen() {
  const router = useRouter();
  const { accentHex, accentRgb, setThemeColor, bgUrl, setBgUrl } = useUser();
  const { theme, updateTheme, pickImage, scaleFont } = useTheme();
  
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 1024 && !isMobileUA;

  const currentBg = bgUrl || theme.backgroundImage || DEFAULT_BACKGROUND;

  // Notification & Sound Toggles
  const [pushNotif, setPushNotif] = useState(true);
  const [appSound, setAppSound] = useState(true);
  const [autoFullscreen, setAutoFullscreen] = useState(true);

  const handleSetBg = (url: string | null) => {
    setBgUrl(url || '');
    updateTheme({ backgroundImage: url });
  };

  const handleSetAccentColor = (hex: string, rgb: string) => {
    setThemeColor(hex, rgb);
    updateTheme({ textColor: hex });
  };

  return (
    <View style={[styles.webWrapper, !isDesktop && styles.mobileFullWrapper]}>
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root, #root > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #0F172A !important;
          }
        `}</style>
      )}
      <SafeAreaView style={[styles.safeArea, isDesktop ? styles.desktopFrame : styles.mobileSafeArea]}>
        <ImageBackground 
          source={{ uri: currentBg }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.65)', 'rgba(15, 23, 42, 0.92)']}
            style={styles.darkOverlay}
          />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* HEADER */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/home');
                }
              }} 
              style={styles.backButton} 
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(17) }]}>GIAO DIỆN</Text>
              <Text style={[styles.headerSubtitle, { fontSize: scaleFont(11) }]}>Tùy chỉnh giao diện, hình nền, màu sắc & phông chữ</Text>
            </View>
            <View style={{ width: 40 }} />
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* ══════════ MÀU SẮC CHỦ ĐẠO ══════════ */}
            <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🎨 Màu Sắc Chủ Đạo Hệ Thống</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => {
                  const isActive = accentHex === color.hex;
                  return (
                    <TouchableOpacity 
                      key={color.id} 
                      style={[
                        styles.colorCard, 
                        isActive && { borderColor: color.hex, backgroundColor: `rgba(${color.rgb}, 0.2)` }
                      ]}
                      onPress={() => handleSetAccentColor(color.hex, color.rgb)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color.hex }]} />
                      <Text style={[styles.colorName, isActive && { color: color.hex, fontWeight: '800' }, { fontSize: scaleFont(13) }]}>
                        {color.name}
                      </Text>
                      {isActive && <Ionicons name="checkmark-circle" size={18} color={color.hex} style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* ══════════ HÌNH NỀN TOÀN CỤC ══════════ */}
            <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🖼️ Hình Nền Hệ Thống</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['rgba(56, 189, 248, 0.25)', 'rgba(14, 165, 233, 0.1)']} style={styles.actionBtnGradient}>
                    <Ionicons name="image-outline" size={22} color="#38BDF8" />
                    <Text style={[styles.actionBtnText, { fontSize: scaleFont(12) }]}>Chọn Từ Thư Viện</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleSetBg(null)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['rgba(244, 114, 182, 0.25)', 'rgba(236, 72, 153, 0.1)']} style={styles.actionBtnGradient}>
                    <Ionicons name="sparkles-outline" size={22} color="#F472B6" />
                    <Text style={[styles.actionBtnText, { fontSize: scaleFont(12) }]}>Mặc Định Aurora</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgScroll}>
                {BACKGROUNDS.map((bg) => {
                  const isActive = currentBg === bg.url;
                  return (
                    <TouchableOpacity 
                      key={bg.id} 
                      style={[
                        styles.bgCard,
                        isActive && { borderColor: accentHex || '#0EA5E9', borderWidth: 2 }
                      ]}
                      onPress={() => handleSetBg(bg.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: bg.url }} style={styles.bgImage} />
                      {isActive && (
                        <View style={[styles.bgActiveBadge, { backgroundColor: accentHex || '#0EA5E9' }]}>
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        </View>
                      )}
                      <Text style={[styles.bgName, isActive && { color: accentHex || '#0EA5E9', fontWeight: '700' }, { fontSize: scaleFont(12) }]}>{bg.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ══════════ PHÔNG CHỮ HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🔤 Phông Chữ Hiển Thị</Text>
              <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.fontGrid}>
                  {FONTS.map((font) => {
                    const isSelected = theme.fontFamily === font;
                    return (
                      <TouchableOpacity
                        key={font}
                        style={[
                          styles.fontGridItem, 
                          isSelected && { borderColor: accentHex || '#0EA5E9', backgroundColor: `rgba(${accentRgb || '14, 165, 233'}, 0.2)` }
                        ]}
                        onPress={() => updateTheme({ fontFamily: font })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.fontPreview, { fontFamily: font, color: isSelected ? accentHex || '#38BDF8' : '#FFF', fontSize: scaleFont(22) }]}>Aa</Text>
                        <Text style={[styles.fontLabel, { color: isSelected ? '#FFF' : '#94A3B8', fontWeight: isSelected ? '700' : '500', fontSize: scaleFont(12) }]}>{font}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </Animated.View>

            {/* ══════════ CỠ CHỮ HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(400).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🔍 Tỷ Lệ Cỡ Chữ</Text>
              <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.sizeRow}>
                  {[ 
                    { label: 'Nhỏ', value: 0.8 }, 
                    { label: 'Vừa', value: 1.0 }, 
                    { label: 'Lớn', value: 1.2 } 
                  ].map((size) => {
                    const isSelected = theme.fontSizeScale === size.value;
                    return (
                      <TouchableOpacity
                        key={size.label}
                        style={[
                          styles.sizeBtn, 
                          isSelected && { backgroundColor: accentHex || '#0EA5E9', borderColor: accentHex || '#0EA5E9' }
                        ]}
                        onPress={() => updateTheme({ fontSizeScale: size.value })}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.sizeText, 
                          { fontFamily: theme.fontFamily, fontSize: scaleFont(14 * size.value), color: isSelected ? '#FFFFFF' : '#94A3B8' }
                        ]}>
                          {size.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </Animated.View>

            {/* ══════════ CẤU HÌNH THÔNG BÁO & HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(500).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>⚙️ Cấu Hình Thông Báo & Hệ Thống</Text>
              <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name="notifications-outline" size={20} color="#38BDF8" />
                    <Text style={[styles.toggleLabel, { fontSize: scaleFont(13) }]}>Thông báo đẩy (Push Notifications)</Text>
                  </View>
                  <Switch 
                    value={pushNotif} 
                    onValueChange={setPushNotif}
                    trackColor={{ false: '#334155', true: accentHex || '#0EA5E9' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.toggleRow, { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 12 }]}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name="volume-high-outline" size={20} color="#F472B6" />
                    <Text style={[styles.toggleLabel, { fontSize: scaleFont(13) }]}>Âm thanh & Hiệu ứng hệ thống</Text>
                  </View>
                  <Switch 
                    value={appSound} 
                    onValueChange={setAppSound}
                    trackColor={{ false: '#334155', true: accentHex || '#0EA5E9' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.toggleRow, { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 12 }]}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name="expand-outline" size={20} color="#FBBF24" />
                    <Text style={[styles.toggleLabel, { fontSize: scaleFont(13) }]}>Tự động trải tràn kín màn hình</Text>
                  </View>
                  <Switch 
                    value={autoFullscreen} 
                    onValueChange={setAutoFullscreen}
                    trackColor={{ false: '#334155', true: accentHex || '#0EA5E9' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </BlurView>
            </Animated.View>

            {/* ══════════ BẢN XEM TRƯỚC TRỰC TIẾP ══════════ */}
            <Animated.View entering={FadeInUp.delay(600).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>✨ Bản Xem Trước Trực Tiếp</Text>
              <View style={[
                styles.previewCard, 
                { 
                  borderColor: `rgba(${accentRgb || '14, 165, 233'}, 0.4)`, 
                  backgroundColor: `rgba(${accentRgb || '14, 165, 233'}, 0.1)` 
                }
              ]}>
                <Text style={[styles.previewHeading, { color: accentHex || '#38BDF8', fontFamily: theme.fontFamily, fontSize: scaleFont(16) }]}>
                  VIET SUPER Giao Diện Mới
                </Text>
                <Text style={[styles.previewText, { fontFamily: theme.fontFamily, fontSize: scaleFont(13) }]}>
                  Giao diện, màu sắc chủ đạo ({accentHex}) và phông chữ ({theme.fontFamily}) sẽ lập tức được áp dụng toàn bộ trên ứng dụng của bạn!
                </Text>
                <TouchableOpacity style={[styles.previewBtn, { backgroundColor: accentHex || '#0EA5E9' }]} activeOpacity={0.8}>
                  <Text style={[styles.previewBtnText, { fontFamily: theme.fontFamily, fontSize: scaleFont(14) }]}>Nút Bấm Trải Nghiệm Mẫu</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFullWrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    width: '100%',
    height: '100%',
  },
  mobileSafeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  desktopFrame: {
    maxWidth: 414,       
    maxHeight: 896,
    aspectRatio: 414 / 896, 
    borderWidth: 10,     
    borderColor: '#0F172A',
    borderRadius: 55,    
    overflow: 'hidden',
    boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.9)',
    ...(Platform.OS === 'web' && { marginVertical: 20 }),
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 10,
  },
  colorName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bgScroll: {
    flexDirection: 'row',
  },
  bgCard: {
    width: 120,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bgImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
  },
  bgName: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '600',
  },
  bgActiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fontGridItem: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  fontPreview: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  fontLabel: {
    fontSize: 12,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sizeText: {
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewHeading: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  previewText: {
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
