import React from 'react';
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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
const FONTS = ['Outfit', 'Inter', 'Roboto', 'System'];
const COLORS = ['#FFFFFF', '#00c6ff', '#fcd34d', '#f472b6', '#4ade80'];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, updateTheme, pickImage } = useTheme();
  
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const currentBg = theme.backgroundImage || DEFAULT_BACKGROUND;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <ImageBackground 
          source={{ uri: currentBg }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Dark Overlay for better readability */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
            style={styles.darkOverlay}
          />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              style={styles.backButton} 
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={32} color={theme.textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.textColor, fontFamily: theme.fontFamily }]}>
              TÙY CHỈNH
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Background Section */}
            <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textColor, fontFamily: theme.fontFamily }]}>Hình nền</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.buttonGradient}>
                    <Ionicons name="color-palette-outline" size={26} color="#00c6ff" />
                    <Text style={[styles.buttonText, { fontFamily: theme.fontFamily }]}>Chọn từ Thư viện</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => updateTheme({ backgroundImage: null })}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.buttonGradient}>
                    <Ionicons name="sparkles-outline" size={26} color="#f472b6" />
                    <Text style={[styles.buttonText, { fontFamily: theme.fontFamily }]}>Mặc định</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Typography Section */}
            <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textColor, fontFamily: theme.fontFamily }]}>Phông chữ</Text>
              <BlurView intensity={40} tint="dark" style={styles.card}>
                <View style={styles.grid}>
                  {FONTS.map((font) => (
                    <TouchableOpacity
                      key={font}
                      style={[styles.gridItem, theme.fontFamily === font && styles.gridItemActive]}
                      onPress={() => updateTheme({ fontFamily: font })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.fontPreview, { fontFamily: font, color: theme.fontFamily === font ? '#000' : '#FFF' }]}>Aa</Text>
                      <Text style={[styles.fontLabel, { color: theme.fontFamily === font ? '#000' : '#94A3B8' }]}>{font}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </Animated.View>

            {/* Font Size Section */}
            <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textColor, fontFamily: theme.fontFamily }]}>Cỡ chữ</Text>
              <BlurView intensity={40} tint="dark" style={styles.card}>
                <View style={styles.row}>
                  {[ 
                    { label: 'Nhỏ', value: 0.8 }, 
                    { label: 'Vừa', value: 1.0 }, 
                    { label: 'Lớn', value: 1.2 } 
                  ].map((size) => (
                    <TouchableOpacity
                      key={size.label}
                      style={[styles.sizeBtn, theme.fontSizeScale === size.value && styles.sizeBtnActive]}
                      onPress={() => updateTheme({ fontSizeScale: size.value })}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.sizeText, 
                        { fontFamily: theme.fontFamily, fontSize: 16 * size.value, color: theme.fontSizeScale === size.value ? '#000' : '#FFF' }
                      ]}>
                        {size.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </Animated.View>

            {/* Text Color Section */}
            <Animated.View entering={FadeInUp.delay(400).duration(800).springify()} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textColor, fontFamily: theme.fontFamily }]}>Màu chủ đạo</Text>
              <BlurView intensity={40} tint="dark" style={styles.card}>
                <View style={styles.colorRow}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorSwatch, { backgroundColor: color }, theme.textColor === color && styles.colorSwatchActive]}
                      onPress={() => updateTheme({ textColor: color })}
                      activeOpacity={0.7}
                    >
                      {theme.textColor === color && <Ionicons name="checkmark" size={20} color={color === '#FFFFFF' ? '#000' : '#FFF'} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
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
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { paddingVertical: 40 }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 414,       
    maxHeight: 896,
    aspectRatio: 414 / 896, 
    borderWidth: 10,     
    borderColor: '#111',
    borderRadius: 55,    
    overflow: 'hidden',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255,255,255,0.1)',
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    zIndex: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web' && {
      backgroundColor: 'rgba(20, 20, 25, 0.4)',
      backdropFilter: 'blur(20px)',
    }),
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    aspectRatio: 1.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemActive: {
    backgroundColor: '#00c6ff',
    borderColor: '#00c6ff',
    shadowColor: '#00c6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fontPreview: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  fontLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sizeBtn: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sizeBtnActive: {
    backgroundColor: '#00c6ff',
    borderColor: '#00c6ff',
  },
  sizeText: {
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    transform: [{ scale: 1.15 }],
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});
