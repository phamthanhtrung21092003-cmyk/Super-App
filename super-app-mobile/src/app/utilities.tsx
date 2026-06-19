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
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

const UTILITY_GROUPS = [
  {
    id: 'transport',
    title: 'Dịch vụ Đa dụng (Siêu App)',
    items: [
      { id: 'transport', title: 'Vận chuyển', icon: '🛵' },
      { id: 'health', title: 'Sức khỏe', icon: '⚕️' },
      { id: 'mart', title: 'Mua sắm', icon: '🛒' },
      { id: 'cleaning', title: 'Dọn dẹp', icon: '🧹' },
    ]
  },
  {
    id: 'entertainment',
    title: 'Giải trí & Du lịch',
    items: [
      { id: 'cinema', title: 'Xem phim', icon: '🎬' },
      { id: 'flights', title: 'Vé máy bay', icon: '✈️' },
      { id: 'hotels', title: 'Khách sạn', icon: '🏨' },
      { id: 'events', title: 'Sự kiện', icon: '🎟️' },
    ]
  }
];

export default function UtilitiesScreen() {
  const router = useRouter();
  const { accentHex, accentRgb, bgUrl } = useUser();
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
          <View style={styles.overlay} pointerEvents="none" />
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: accentHex }]}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Trung tâm Tiện ích</Text>
          </View>

          {/* Thanh tìm kiếm */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { borderColor: `rgba(${accentRgb}, 0.3)` }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput 
                placeholder="Bạn đang tìm dịch vụ gì?" 
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {UTILITY_GROUPS.map((group) => (
              <View key={group.id} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                
                <View style={styles.gridContainer}>
                  {group.items.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.gridItem, { borderColor: `rgba(${accentRgb}, 0.2)` }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (item.id === 'transport') {
                          router.push('/transport');
                        } else if (item.id === 'health') {
                          router.push('/health');
                        } else if (item.id === 'mart') {
                          router.push('/shopping');
                        } else {
                          window.alert(`Đang mở dịch vụ: ${item.title}`);
                        }
                      }}
                    >
                      <View style={[styles.iconWrapper, { backgroundColor: `rgba(${accentRgb}, 0.15)` }]}>
                        <Text style={styles.itemIcon}>{item.icon}</Text>
                      </View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            
            <View style={{height: 50}} />
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
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 15,
  },
  searchContainer: {
    paddingHorizontal: 20,
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
  },
  scrollContent: {
    paddingHorizontal: 20,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(5px)' }),
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  }
});
