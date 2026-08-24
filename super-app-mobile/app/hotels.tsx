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
  useWindowDimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function HotelsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Khách sạn</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.comingSoon}>
            <Ionicons name="bed-outline" size={80} color={theme.accentHex} />
            <Text style={[styles.title, { fontFamily: theme.fontFamily }]}>Sắp ra mắt!</Text>
            <Text style={[styles.subtitle, { fontFamily: theme.fontFamily }]}>Tính năng Đặt phòng khách sạn cao cấp đang được hoàn thiện và sẽ sớm ra mắt.</Text>
            
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accentHex }]} onPress={() => router.back()}>
              <Text style={[styles.primaryBtnText, { fontFamily: theme.fontFamily }]}>Quay lại trang chủ</Text>
            </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  container: { flex: 1 },
  comingSoon: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 100 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  subtitle: { color: '#94A3B8', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  primaryBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 25 },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});
