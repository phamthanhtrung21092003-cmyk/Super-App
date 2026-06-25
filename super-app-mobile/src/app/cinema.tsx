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
  Image,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const MOVIES = [
  { id: '1', title: 'Dune: Hành tinh cát 2', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', rating: '9.2' },
  { id: '2', title: 'Kung Fu Panda 4', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400', rating: '8.5' },
  { id: '3', title: 'Mai - Trấn Thành', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', rating: '8.9' },
];

export default function CinemaScreen() {
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
          <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Rạp chiếu phim</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>Phim đang chiếu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieList}>
              {MOVIES.map(movie => (
                <TouchableOpacity key={movie.id} style={styles.movieCard} onPress={() => window.alert('Đang mở rạp chiếu...')}>
                  <Image source={{ uri: movie.image }} style={styles.movieImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.movieGradient}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FADB14" />
                      <Text style={[styles.ratingText, { fontFamily: theme.fontFamily }]}>{movie.rating}</Text>
                    </View>
                    <Text style={[styles.movieTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>{movie.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.comingSoon}>
            <Ionicons name="film-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={[styles.comingSoonText, { fontFamily: theme.fontFamily }]}>Hệ thống đặt vé toàn quốc đang được nâng cấp!</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accentHex }]}>
              <Text style={[styles.primaryBtnText, { fontFamily: theme.fontFamily }]}>Nhận thông báo khi ra mắt</Text>
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
  section: { padding: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  movieList: { flexDirection: 'row' },
  movieCard: { width: 160, height: 240, borderRadius: 16, marginRight: 16, overflow: 'hidden' },
  movieImage: { width: '100%', height: '100%' },
  movieGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, justifyContent: 'flex-end', padding: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginBottom: 8 },
  ratingText: { color: '#FADB14', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  movieTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  comingSoon: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 20 },
  comingSoonText: { color: '#94A3B8', fontSize: 16, textAlign: 'center', marginTop: 16, marginBottom: 24, lineHeight: 24 },
  primaryBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 25 },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});
