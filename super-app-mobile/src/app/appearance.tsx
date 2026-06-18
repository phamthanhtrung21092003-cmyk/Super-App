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
  useWindowDimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

const BACKGROUNDS = [
  { id: '1', title: 'Cyber City', url: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1000&q=80' },
  { id: '2', title: 'Neon Night', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80' },
  { id: '3', title: 'Dark Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80' },
  { id: '4', title: 'Purple Void', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80' },
];

const COLORS = [
  { id: 'cyan', name: 'Xanh Cyan', hex: '#00D8FF', rgb: '0, 216, 255' },
  { id: 'pink', name: 'Hồng Cyber', hex: '#FF00FF', rgb: '255, 0, 255' },
  { id: 'gold', name: 'Vàng Royal', hex: '#FFD700', rgb: '255, 215, 0' },
  { id: 'green', name: 'Xanh Matrix', hex: '#00FF00', rgb: '0, 255, 0' },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { accentHex, accentRgb, setThemeColor, bgUrl, setBgUrl } = useUser();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

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

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giao diện hệ thống</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* THAY ĐỔI MÀU SẮC CHỦ ĐẠO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Màu sắc chủ đạo</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => {
                  const isActive = accentHex === color.hex;
                  return (
                    <TouchableOpacity 
                      key={color.id} 
                      style={[
                        styles.colorCard, 
                        isActive && { borderColor: color.hex, backgroundColor: `rgba(${color.rgb}, 0.15)` }
                      ]}
                      onPress={() => setThemeColor(color.hex, color.rgb)}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color.hex }]} />
                      <Text style={[styles.colorName, isActive && { color: color.hex, fontWeight: '700' }]}>
                        {color.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* THAY ĐỔI HÌNH NỀN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hình nền toàn cục</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgScroll}>
                {BACKGROUNDS.map((bg) => {
                  const isActive = bgUrl === bg.url;
                  return (
                    <TouchableOpacity 
                      key={bg.id} 
                      style={[
                        styles.bgCard,
                        isActive && { borderColor: accentHex, borderWidth: 2 }
                      ]}
                      onPress={() => setBgUrl(bg.url)}
                    >
                      <Image source={{ uri: bg.url }} style={styles.bgImage} />
                      {isActive && (
                        <View style={[styles.bgActiveBadge, { backgroundColor: accentHex }]}>
                          <Text style={styles.checkIcon}>✓</Text>
                        </View>
                      )}
                      <Text style={[styles.bgName, isActive && { color: accentHex }]}>{bg.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* PREVIEW KHUNG MẪU */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bản xem trước</Text>
              <View style={[styles.previewCard, { borderColor: `rgba(${accentRgb}, 0.5)`, backgroundColor: `rgba(${accentRgb}, 0.05)` }]}>
                <Text style={styles.previewText}>Nội dung hệ thống sẽ phát sáng và áp dụng màu sắc bạn vừa chọn!</Text>
                <TouchableOpacity style={[styles.previewBtn, { backgroundColor: `rgba(${accentRgb}, 0.2)`, borderColor: accentHex }]}>
                  <Text style={[styles.previewBtnText, { color: accentHex }]}>Nút bấm mẫu</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
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
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  backIcon: {
    color: '#FFF',
    fontSize: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  colorName: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  bgScroll: {
    flexDirection: 'row',
  },
  bgCard: {
    width: 120,
    marginRight: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  bgImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
  },
  bgName: {
    color: '#CBD5E1',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  bgActiveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'center',
  },
  previewBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewBtnText: {
    fontSize: 15,
    fontWeight: '700',
  }
});
