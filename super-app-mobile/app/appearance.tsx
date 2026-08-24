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

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';

const BACKGROUNDS = [
  { id: '1', title: 'Liquid Cyber', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
  { id: '2', title: 'Cyber City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop' },
  { id: '3', title: 'Pastel Drops', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop' },
  { id: '4', title: 'Neon Horizon', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop' },
  { id: '5', title: 'Matrix Tech', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop' },
  { id: '6', title: 'Purple Nebula', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop' },
  { id: '7', title: 'Aurora Glow', url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=1200&auto=format&fit=crop' },
  { id: '8', title: 'Minimal Obsidian', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=1200&auto=format&fit=crop' },
  { id: '9', title: 'Sunset Metropolis', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop' },
  { id: '10', title: 'Cyberpunk Rain', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop' },
  { id: '11', title: 'Fuji Blossom', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop' },
  { id: '12', title: 'Tropical Oasis', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' },
  { id: '13', title: 'Golden Silk Dunes', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop' },
  { id: '14', title: 'Emerald Marble', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop' },
  { id: '15', title: 'Mystic Forest', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop' },
  { id: '16', title: 'Deep Ocean Wave', url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1200&auto=format&fit=crop' },
  { id: '17', title: 'Neon Synth Stream', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop' },
  { id: '18', title: 'Cosmic Starfield', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop' },
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
    updateTheme({ textColor: hex, accentHex: hex, accentRgb: rgb });
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
          {/* Deep Dark Frosted Overlay to guarantee 100% contrast for all text */}
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.82)', 'rgba(15, 23, 42, 0.94)']}
            style={styles.darkOverlay}
            pointerEvents="none"
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
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
                        isActive && { borderColor: color.hex, backgroundColor: `rgba(${color.rgb}, 0.25)` }
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
                  <LinearGradient colors={['rgba(56, 189, 248, 0.3)', 'rgba(14, 165, 233, 0.15)']} style={styles.actionBtnGradient}>
                    <Ionicons name="image-outline" size={20} color="#38BDF8" />
                    <Text style={[styles.actionBtnText, { fontSize: scaleFont(12) }]}>Chọn Từ Thư Viện</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleSetBg(null)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['rgba(244, 114, 182, 0.3)', 'rgba(236, 72, 153, 0.15)']} style={styles.actionBtnGradient}>
                    <Ionicons name="sparkles-outline" size={20} color="#F472B6" />
                    <Text style={[styles.actionBtnText, { fontSize: scaleFont(12) }]}>Mặc Định Aurora</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.bgScrollContent}
              >
                {BACKGROUNDS.map((bg) => {
                  const isActive = currentBg === bg.url;
                  return (
                    <TouchableOpacity 
                      key={bg.id} 
                      style={[
                        styles.bgCard,
                        isActive && { borderColor: accentHex || '#0EA5E9', borderWidth: 2.5, transform: [{ scale: 1.02 }] }
                      ]}
                      onPress={() => handleSetBg(bg.url)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: bg.url }} style={styles.bgImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                        style={styles.bgCardGradient}
                      />
                      {isActive && (
                        <View style={[styles.bgActiveBadge, { backgroundColor: accentHex || '#0EA5E9' }]}>
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                        </View>
                      )}
                      <Text style={[styles.bgName, isActive && { color: accentHex || '#38BDF8', fontWeight: '800' }, { fontSize: scaleFont(11.5) }]} numberOfLines={1}>
                        {bg.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ══════════ PHÔNG CHỮ HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🔤 Phông Chữ Hiển Thị</Text>
              <View style={styles.glassCard}>
                <View style={styles.fontGrid}>
                  {FONTS.map((font) => {
                    const isSelected = theme.fontFamily === font;
                    return (
                      <TouchableOpacity
                        key={font}
                        style={[
                          styles.fontGridItem, 
                          isSelected && { borderColor: accentHex || '#0EA5E9', backgroundColor: `rgba(${accentRgb || '14, 165, 233'}, 0.25)` }
                        ]}
                        onPress={() => updateTheme({ fontFamily: font })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.fontPreview, { fontFamily: font, color: isSelected ? accentHex || '#38BDF8' : '#FFFFFF', fontSize: scaleFont(22) }]}>Aa</Text>
                        <Text style={[styles.fontLabel, { color: isSelected ? '#FFFFFF' : '#CBD5E1', fontWeight: isSelected ? '800' : '600', fontSize: scaleFont(12) }]}>{font}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* ══════════ CỠ CHỮ HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(400).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>🔍 Tỷ Lệ Cỡ Chữ</Text>
              <View style={styles.glassCard}>
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
                          { fontFamily: theme.fontFamily, fontSize: scaleFont(14 * size.value), color: isSelected ? '#FFFFFF' : '#CBD5E1' }
                        ]}>
                          {size.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* ══════════ CẤU HÌNH THÔNG BÁO & HỆ THỐNG ══════════ */}
            <Animated.View entering={FadeInUp.delay(500).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>⚙️ Cấu Hình Thông Báo & Hệ Thống</Text>
              <View style={styles.glassCard}>
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
              </View>
            </Animated.View>

            {/* ══════════ BẢN XEM TRƯỚC TRỰC TIẾP ══════════ */}
            <Animated.View entering={FadeInUp.delay(600).duration(700)} style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily, fontSize: scaleFont(15) }]}>✨ Bản Xem Trước Trực Tiếp</Text>
              <View style={[
                styles.previewCard, 
                { 
                  borderColor: accentHex || '#38BDF8', 
                  backgroundColor: 'rgba(15, 23, 42, 0.85)' 
                }
              ]}>
                <Text style={[styles.previewHeading, { color: accentHex || '#38BDF8', fontFamily: theme.fontFamily, fontSize: scaleFont(16) }]}>
                  VIET SUPER Giao Diện Mới
                </Text>
                <Text style={[styles.previewText, { fontFamily: theme.fontFamily, fontSize: scaleFont(13) }]}>
                  Giao diện, màu sắc chủ đạo ({accentHex}) và phông chữ ({theme.fontFamily}) sẽ lập tức được áp dụng đồng bộ toàn bộ trên ứng dụng của bạn!
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
    ...StyleSheet.absoluteFill,
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
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
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  colorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bgScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  bgCard: {
    width: 125,
    height: 175,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bgCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 65,
  },
  bgName: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    right: 6,
    color: '#FFFFFF',
    fontSize: 11.5,
    textAlign: 'center',
    fontWeight: '700',
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
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  glassCard: {
    padding: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  previewHeading: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  previewText: {
    color: '#F1F5F9',
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
