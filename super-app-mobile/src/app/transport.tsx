import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebMap, { MapPoint } from '../components/WebMap';
import * as Location from 'expo-location';
import { aiTransportService, AITransportAdvice, VoiceBookingResult } from '../services/aiTransportService';

export default function TransportHome() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  // User location state
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.028511,
    lng: 105.804817,
  });
  const [locationName, setLocationName] = useState('Đang lấy vị trí của bạn...');

  // AI Contextual Advice state
  const [aiAdvice, setAiAdvice] = useState<AITransportAdvice | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  // Voice Booking Modal
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceBookingResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          const currentCoords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setCoords(currentCoords);

          const geocode = await Location.reverseGeocodeAsync({
            latitude: currentCoords.lat,
            longitude: currentCoords.lng,
          });
          if (geocode && geocode.length > 0) {
            const place = geocode[0];
            setLocationName(`${place.street || place.name || 'Vị trí hiện tại'}, ${place.city || place.subregion || 'Hà Nội'}`);
          } else {
            setLocationName('Khu vực Cầu Giấy, Hà Nội');
          }
        } else {
          setLocationName('Royal City, Thanh Xuân, Hà Nội');
        }
      } catch (e) {
        setLocationName('Royal City, Thanh Xuân, Hà Nội');
      }

      // Load AI Dynamic Advice
      const advice = await aiTransportService.getDynamicAdvice(coords);
      setAiAdvice(advice);
      setLoadingAI(false);
    })();
  }, []);

  const handleTriggerVoice = () => {
    setVoiceModalVisible(true);
    setIsListening(true);
    setVoiceResult(null);

    // Simulate listening speech recognition for 2.2 seconds
    setTimeout(() => {
      setIsListening(false);
      const parsed = aiTransportService.parseVoiceBooking('Đặt cho tôi một xe máy về Royal City');
      setVoiceResult(parsed);
    }, 2000);
  };

  const handleSelectSampleVoice = (sampleText: string) => {
    setIsListening(false);
    const parsed = aiTransportService.parseVoiceBooking(sampleText);
    setVoiceResult(parsed);
  };

  const handleConfirmVoiceBooking = () => {
    setVoiceModalVisible(false);
    if (voiceResult) {
      router.push({
        pathname: '/ride/booking',
        params: {
          destinationName: voiceResult.destinationName,
          destinationAddress: voiceResult.destinationAddress,
          vehicleId: voiceResult.serviceType,
        },
      });
    }
  };

  const mapPoints: MapPoint[] = [
    {
      lat: coords.lat,
      lng: coords.lng,
      label: locationName,
      color: '#3B82F6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Full Screen Interactive Vector Map Background */}
      <View style={styles.mapContainer}>
        <WebMap
          points={mapPoints}
          showRoute={false}
          height={windowHeight - 210}
          zoom={15}
          showNearbyDrivers={true}
        />
      </View>

      {/* 2. Floating Top Header Actions */}
      <View style={styles.floatingHeader} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/home');
          }}
          style={styles.floatingCircleBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Current Location Pill */}
        <View style={styles.locationPill}>
          <Ionicons name="location-sharp" size={14} color="#10B981" />
          <Text style={styles.locationPillText} numberOfLines={1}>
            {locationName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.floatingCircleBtn}
          onPress={async () => {
            try {
              const stored = await AsyncStorage.getItem('@recent_rides');
              if (stored) {
                const list = JSON.parse(stored);
                if (list && list.length > 0) {
                  const tripLines = list
                    .slice(0, 4)
                    .map(
                      (t: any, idx: number) =>
                        `${idx + 1}. ${t.vehicleName || 'Taxi'} → ${t.destinationName}\n   Giá: ${(t.price || 0).toLocaleString('vi-VN')}đ • Đánh giá: ${t.rating || 5}★ (${t.date || 'Hôm nay'})`
                    )
                    .join('\n\n');
                  Alert.alert('Lịch sử di chuyển gần đây', tripLines);
                  return;
                }
              }
            } catch (e) {}

            Alert.alert(
              'Lịch sử di chuyển',
              '🚗 Hôm nay - Chuyến xe tới Royal City (65.000đ)\n⚡ Hôm qua - Taxi điện tới Keangnam (52.000đ)\n📦 28/09 - Giao hàng siêu tốc (25.000đ)'
            );
          }}
        >
          <Ionicons name="time-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* 3. Bottom Sheet Panel */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
          {/* AI Trợ lý Gợi ý Thông minh */}
          <View style={styles.aiCard}>
            <View style={styles.aiTopRow}>
              <View style={styles.aiBadgeContainer}>
                <Ionicons name="sparkles" size={16} color="#D97706" />
                <Text style={styles.aiBadgeText}>{aiAdvice?.badgeText || 'AI Trợ lý Gợi ý'}</Text>
              </View>
              {aiAdvice?.weather && (
                <View style={styles.weatherTag}>
                  <Ionicons
                    name={aiAdvice.weather.condition === 'rain' ? 'rainy' : 'sunny'}
                    size={14}
                    color="#D97706"
                  />
                  <Text style={styles.weatherText}>{aiAdvice.weather.temperature}</Text>
                </View>
              )}
            </View>

            {loadingAI ? (
              <ActivityIndicator size="small" color="#D97706" style={{ marginVertical: 8 }} />
            ) : (
              <>
                <Text style={styles.aiHeadline}>{aiAdvice?.headline}</Text>
                <Text style={styles.aiBodyText}>{aiAdvice?.body}</Text>
              </>
            )}

            {/* Voice-to-Ride Button */}
            <TouchableOpacity style={styles.voiceButton} onPress={handleTriggerVoice}>
              <View style={styles.voiceMicIcon}>
                <Ionicons name="mic" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.voiceButtonText}>Đặt xe bằng Giọng nói (Voice-to-Ride)</Text>
              <Ionicons name="chevron-forward" size={16} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* Quick Destination Search Box */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/ride/search')}>
            <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 10 }} />
            <Text style={styles.searchPlaceholder}>Bạn muốn đi đâu hoặc giao hàng đi đâu?</Text>
          </TouchableOpacity>

          {/* 4 Core Services Grid */}
          <Text style={styles.sectionTitle}>Dịch vụ Vận chuyển & Giao nhận</Text>
          <View style={styles.servicesGrid}>
            {/* 1. Xe máy công nghệ */}
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
              onPress={() => router.push({ pathname: '/ride/search', params: { vehicleId: 'bike', vehicleName: 'Xe máy Công nghệ' } })}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceEmoji}>🛵</Text>
                <View style={[styles.miniBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#166534' }]}>Nhanh nhất</Text>
                </View>
              </View>
              <Text style={styles.serviceTitle}>Xe máy Công nghệ</Text>
              <Text style={styles.serviceDesc}>Lách kẹt xe, giá từ 15k</Text>
            </TouchableOpacity>

            {/* 2. Taxi điện xanh */}
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              onPress={() => router.push({ pathname: '/ride/search', params: { vehicleId: 'ev', vehicleName: 'Taxi điện Xanh' } })}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceEmoji}>⚡</Text>
                <View style={[styles.miniBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#1E40AF' }]}>AI Đề xuất</Text>
                </View>
              </View>
              <Text style={styles.serviceTitle}>Taxi điện Xanh</Text>
              <Text style={styles.serviceDesc}>VinFast êm ái, xe 4-7 chỗ</Text>
            </TouchableOpacity>

            {/* 3. Xe hơi cao cấp */}
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
              onPress={() => router.push({ pathname: '/ride/search', params: { vehicleId: 'suv', vehicleName: 'Xe hơi Cao cấp' } })}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceEmoji}>🚗</Text>
                <View style={[styles.miniBadge, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#6B21A8' }]}>Tiện nghi</Text>
                </View>
              </View>
              <Text style={styles.serviceTitle}>Xe hơi Cao cấp</Text>
              <Text style={styles.serviceDesc}>Sedan & SUV sang trọng</Text>
            </TouchableOpacity>

            {/* 4. Giao hàng siêu tốc & COD */}
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
              onPress={() => router.push('/delivery')}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceEmoji}>📦</Text>
                <View style={[styles.miniBadge, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#9A3412' }]}>30 Phút</Text>
                </View>
              </View>
              <Text style={styles.serviceTitle}>Giao hàng Siêu tốc</Text>
              <Text style={styles.serviceDesc}>Thu hộ COD & Đồ ăn</Text>
            </TouchableOpacity>
          </View>

          {/* Promotion Banner Carousel */}
          <View style={styles.promoCard}>
            <View style={styles.promoIconContainer}>
              <Ionicons name="gift" size={24} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.promoTitle}>Ưu đãi Mùa mưa: Giảm 25% Taxi điện</Text>
              <Text style={styles.promoDesc}>Áp dụng tự động cho mọi chuyến xe VinFast trong khung giờ 14h - 19h.</Text>
            </View>
            <TouchableOpacity style={styles.promoButton} onPress={() => router.push('/ride/booking')}>
              <Text style={styles.promoBtnText}>Dùng ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Saved Places with 1-Tap Quick Booking */}
          <Text style={styles.sectionTitle}>Địa điểm thường đến</Text>
          <View style={styles.savedPlaces}>
            <TouchableOpacity
              style={styles.placeItem}
              onPress={() => {
                router.push({
                  pathname: '/ride/booking',
                  params: {
                    destinationName: 'Nhà (Royal City)',
                    destinationAddress: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
                  },
                });
              }}
            >
              <View style={[styles.placeIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="home" size={20} color="#10B981" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Nhà</Text>
                <Text style={styles.placeAddress}>Royal City, 72A Nguyễn Trãi • 4.8 km</Text>
              </View>
              <View style={styles.quickBookBtn}>
                <Text style={styles.quickBookText}>Đặt xe</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.placeItem}
              onPress={() => {
                router.push({
                  pathname: '/ride/booking',
                  params: {
                    destinationName: 'Công ty (Keangnam)',
                    destinationAddress: 'Keangnam Landmark 72, Mễ Trì, Hà Nội',
                  },
                });
              }}
            >
              <View style={[styles.placeIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="briefcase" size={20} color="#3B82F6" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>Công ty</Text>
                <Text style={styles.placeAddress}>Keangnam Landmark 72, Mễ Trì • 6.2 km</Text>
              </View>
              <View style={styles.quickBookBtn}>
                <Text style={styles.quickBookText}>Đặt xe</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 35 }} />
        </ScrollView>
      </View>

      {/* Voice-to-Ride Interactive Modal */}
      <Modal visible={voiceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>AI Trợ lý Đặt xe Bằng Giọng nói</Text>
              <TouchableOpacity onPress={() => setVoiceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isListening ? (
              <View style={styles.listeningState}>
                <View style={styles.pulsingMic}>
                  <Ionicons name="mic" size={36} color="#FFFFFF" />
                </View>
                <Text style={styles.listeningText}>Đang lắng nghe bạn nói...</Text>
                <Text style={styles.listeningHint}>Nói câu lệnh như: "Đặt xe máy tới Royal City"</Text>
              </View>
            ) : voiceResult ? (
              <View style={styles.resultState}>
                <View style={styles.resultSuccessIcon}>
                  <Ionicons name="checkmark-circle" size={36} color="#10B981" />
                </View>
                <Text style={styles.resultTitle}>Đã nhận diện thành công!</Text>
                
                <View style={styles.resultSummaryBox}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Dịch vụ:</Text>
                    <Text style={styles.resultValue}>{voiceResult.serviceName}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Điểm đến:</Text>
                    <Text style={styles.resultValue}>{voiceResult.destinationName}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Giá cước ước tính:</Text>
                    <Text style={[styles.resultValue, { color: '#10B981', fontWeight: '800' }]}>
                      {voiceResult.estimatedPrice.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmVoiceBtn} onPress={handleConfirmVoiceBooking}>
                  <Text style={styles.confirmVoiceBtnText}>Xác nhận & Đi đến Đặt xe</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Quick Sample Voice Chips */}
            <Text style={styles.sampleVoiceTitle}>Hoặc thử các câu lệnh nhanh:</Text>
            <View style={styles.sampleChipsContainer}>
              <TouchableOpacity
                style={styles.sampleChip}
                onPress={() => handleSelectSampleVoice('Đặt cho tôi một xe máy về Royal City')}
              >
                <Text style={styles.sampleChipText}>🛵 Xe máy về Royal City</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleChip}
                onPress={() => handleSelectSampleVoice('Tìm taxi điện tới Keangnam')}
              >
                <Text style={styles.sampleChipText}>⚡ Taxi điện tới Keangnam</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleChip}
                onPress={() => handleSelectSampleVoice('Giao hàng siêu tốc đến Cầu Giấy')}
              >
                <Text style={styles.sampleChipText}>📦 Giao hàng tới Cầu Giấy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
  mapContainer: { ...StyleSheet.absoluteFill, zIndex: 1 },

  // Floating Actions
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingCircleBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '65%',
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    zIndex: 10,
    maxHeight: '68%',
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetContent: { flex: 1 },

  // AI Card
  aiCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
  },
  aiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 6,
  },
  weatherTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  weatherText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  aiHeadline: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  aiBodyText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 18,
  },
  voiceButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  voiceMicIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  voiceButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Services Grid
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  serviceCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceEmoji: { fontSize: 28 },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  // Promo Banner
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 14,
    borderRadius: 18,
    marginBottom: 20,
  },
  promoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2410C',
  },
  promoDesc: {
    fontSize: 11,
    color: '#9A3412',
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 16,
  },
  promoButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  promoBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Saved locations
  savedPlaces: { gap: 8 },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  placeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: { marginLeft: 12, flex: 1 },
  placeName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  placeAddress: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' },
  quickBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickBookText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 4,
  },

  // Voice Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  voiceModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  listeningState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pulsingMic: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
  },
  listeningText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  listeningHint: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  resultState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resultSuccessIcon: {
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  resultSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmVoiceBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  confirmVoiceBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  sampleVoiceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  sampleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  sampleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});
