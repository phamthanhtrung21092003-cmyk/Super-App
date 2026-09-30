import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import WebMap, { MapPoint } from '../../components/WebMap';
import * as Location from 'expo-location';

interface DestinationItem {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  tag?: string;
  lat: number;
  lng: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const POPULAR_DESTINATIONS: DestinationItem[] = [
  {
    id: '1',
    name: 'Royal City',
    address: '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    distanceKm: 4.8,
    etaMinutes: 14,
    tag: 'Thường đến',
    lat: 21.0028,
    lng: 105.8155,
    icon: 'business',
  },
  {
    id: '2',
    name: 'Keangnam Landmark 72',
    address: 'Khu E6 Đô thị Cầu Giấy, Phạm Hùng, Mễ Trì, Nam Từ Liêm',
    distanceKm: 6.2,
    etaMinutes: 16,
    tag: 'Gần công ty',
    lat: 21.0173,
    lng: 105.7839,
    icon: 'briefcase',
  },
  {
    id: '3',
    name: 'Sân bay Quốc tế Nội Bài',
    address: 'Xã Phú Minh, Huyện Sóc Sơn, Hà Nội (Nhà ga T1 & T2)',
    distanceKm: 27.5,
    etaMinutes: 35,
    tag: 'Sân bay',
    lat: 21.2212,
    lng: 105.8072,
    icon: 'airplane',
  },
  {
    id: '4',
    name: 'Hồ Hoàn Kiếm (Bờ Hồ)',
    address: 'Phố Đinh Tiên Hoàng, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    distanceKm: 7.1,
    etaMinutes: 20,
    tag: 'Trung tâm',
    lat: 21.0287,
    lng: 105.8523,
    icon: 'leaf',
  },
  {
    id: '5',
    name: 'Aeon Mall Hà Đông',
    address: 'Khu đô thị Dương Nội, Hà Đông, Hà Nội',
    distanceKm: 8.5,
    etaMinutes: 22,
    tag: 'Mua sắm',
    lat: 20.9825,
    lng: 105.7548,
    icon: 'cart',
  },
  {
    id: '6',
    name: 'Bến xe Mỹ Đình',
    address: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    distanceKm: 3.2,
    etaMinutes: 9,
    tag: 'Bến xe',
    lat: 21.0283,
    lng: 105.7779,
    icon: 'bus',
  },
];

export default function RideSearch() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ vehicleId?: string; vehicleName?: string }>();
  const [pickup, setPickup] = useState('Vị trí hiện tại của bạn');
  const [destination, setDestination] = useState('');
  const [coords, setCoords] = useState({ lat: 21.028511, lng: 105.804817 });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setCoords({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      } catch (e) {
        // Use default coords
      }
    })();
  }, []);

  const filteredDestinations = destination.trim()
    ? POPULAR_DESTINATIONS.filter(
        (item) =>
          item.name.toLowerCase().includes(destination.toLowerCase()) ||
          item.address.toLowerCase().includes(destination.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  const customItem: DestinationItem | null =
    destination.trim() &&
    !filteredDestinations.some(
      (d) => d.name.toLowerCase() === destination.trim().toLowerCase()
    )
      ? {
          id: 'custom_dest',
          name: destination.trim(),
          address: `${destination.trim()}, Hà Nội`,
          distanceKm: 5.5,
          etaMinutes: 15,
          tag: 'Địa chỉ bạn tìm',
          lat: 21.036,
          lng: 105.782,
          icon: 'location',
        }
      : null;

  const displayList = customItem ? [customItem, ...filteredDestinations] : filteredDestinations;

  const handleSelectDestination = (item: DestinationItem) => {
    router.push({
      pathname: '/ride/booking',
      params: {
        destinationName: item.name,
        destinationAddress: item.address,
        distanceKm: item.distanceKm.toString(),
        etaMinutes: item.etaMinutes.toString(),
        dropLat: item.lat.toString(),
        dropLng: item.lng.toString(),
        vehicleId: searchParams.vehicleId || 'ev',
      },
    });
  };

  const mapPoints: MapPoint[] = [
    { lat: coords.lat, lng: coords.lng, label: pickup, color: '#3B82F6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Top Search Area */}
        <View style={styles.searchHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/transport');
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tìm kiếm điểm đến</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.timeline}>
              <View style={styles.dotBlue} />
              <View style={styles.line} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.inputs}>
              <TextInput
                style={styles.inputBox}
                value={pickup}
                onChangeText={setPickup}
                placeholder="Điểm đón của bạn"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.inputBox, styles.inputBoxActive]}
                value={destination}
                onChangeText={setDestination}
                placeholder="Nhập tên toà nhà, đường phố..."
                placeholderTextColor="#94A3B8"
                autoFocus
              />
            </View>
          </View>
        </View>

        {/* Map Area */}
        <View style={styles.mapContainer}>
          <WebMap points={mapPoints} showRoute={false} height={190} zoom={15} />

          {/* AI Floating Smart Tip */}
          <View style={styles.aiFloatingBubble}>
            <Ionicons name="sparkles" size={16} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.aiFloatingText}>
              {destination.trim()
                ? `Đang tìm kiếm điểm đến "${destination}"...`
                : 'AI đang tìm kiếm các điểm đón trả thuận tiện quanh bạn'}
            </Text>
          </View>
        </View>

        {/* Suggestions List */}
        <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.listSectionTitle}>
            {destination.trim() ? 'Kết quả gợi ý phù hợp' : 'Địa điểm phổ biến quanh bạn'}
          </Text>

          {displayList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestionItem}
              onPress={() => handleSelectDestination(item)}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name={item.icon} size={20} color="#3B82F6" />
              </View>
              <View style={styles.suggestionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  {item.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.suggestionAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{item.distanceKm} km</Text>
                <Text style={styles.etaText}>~{item.etaMinutes}p</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 25 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchHeader: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  timeline: { alignItems: 'center', marginRight: 12, width: 12 },
  dotBlue: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  line: { width: 2, height: 38, backgroundColor: '#CBD5E1', marginVertical: 3 },
  dotRed: { width: 10, height: 10, backgroundColor: '#EF4444' },

  inputs: { flex: 1, gap: 10 },
  inputBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputBoxActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
  },

  mapContainer: { height: 190, position: 'relative' },
  aiFloatingBubble: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  aiFloatingText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },

  suggestionsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 10,
  },
  listSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  suggestionAddress: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tagBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  tagText: { fontSize: 9, fontWeight: '800', color: '#475569' },
  distanceBadge: { alignItems: 'flex-end', marginLeft: 8 },
  distanceText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  etaText: { fontSize: 10, color: '#10B981', fontWeight: '700', marginTop: 2 },
});
