import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  TextInput,
  useWindowDimensions,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, FadeInUp, SlideInDown, SlideOutDown, 
  FadeIn, FadeOut, SlideInUp, SlideOutUp, 
  withRepeat, withTiming, useSharedValue, useAnimatedStyle,
  Easing
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
type RideState = 'idle' | 'selecting_location' | 'choosing_vehicle' | 'finding_driver' | 'driver_found' | 'in_trip' | 'processing_payment' | 'arrived' | 'selecting_payment' | 'selecting_promo';
type FocusType = 'pickup' | 'dropoff';

interface LocationData {
  id: string;
  title: string;
  address: string;
  lat: number;
  lon: number;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

// --- Constants ---
const PAYMENT_METHODS = [
  { id: 'cash', title: 'Tiền mặt', icon: 'cash', color: '#28B16D' },
  { id: 'vnpay', title: 'Ví VN Pay', icon: 'wallet', color: '#00D8FF' },
  { id: 'card', title: 'Thẻ tín dụng', icon: 'card', color: '#6B46C1' },
];

const PROMO_CODES = [
  { id: 'discount20', title: 'Giảm 20.000đ', desc: 'Cho chuyến xe từ 50K', value: 20000 },
  { id: 'discount10', title: 'Giảm 10.000đ', desc: 'Dành cho mọi chuyến đi', value: 10000 },
  { id: 'superapp', title: 'Siêu Ưu Đãi (SUPERAPP)', desc: 'Mã bí mật giảm 50.000đ', value: 50000 },
];

const BOT_REPLIES = [
  "Dạ em sắp tới điểm đón rồi ạ.",
  "Anh/chị đứng chờ em 1 phút nhé.",
  "Đường đang hơi đông, em ráng chạy tới ngay.",
  "Dạ em thấy anh/chị rồi ạ!"
];

// --- Haversine Distance Algorithm ---
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.5, R * c);
}

export default function RideBookingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  // App States
  const [currentState, setCurrentState] = useState<RideState>('idle');
  const [currentFocus, setCurrentFocus] = useState<FocusType>('dropoff');
  
  // Location States
  const [pickupLocation, setPickupLocation] = useState<LocationData>({
    id: 'current', title: 'Vị trí hiện tại', address: 'Đang xác định...', lat: 10.7769, lon: 106.7009
  });
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);

  // Booking States
  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [manualPromoInput, setManualPromoInput] = useState('');
  const [rating, setRating] = useState(0);
  const [noteForDriver, setNoteForDriver] = useState('');
  const [showDriverProfile, setShowDriverProfile] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Chat States
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Chào anh/chị, em đang chạy tới điểm đón ạ.', isUser: false, time: '10:00' }
  ]);

  // Animations
  const pulse = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Inject web fonts
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Radar animation
  useEffect(() => {
    if (currentState === 'finding_driver') {
      pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
      const timer = setTimeout(() => { setCurrentState('driver_found'); }, 3000);
      return () => clearTimeout(timer);
    } else {
      pulse.value = 0;
    }
  }, [currentState]);

  // Trip Progress animation
  useEffect(() => {
    if (currentState === 'in_trip') {
      progressWidth.value = withTiming(100, { duration: 8000, easing: Easing.linear }); // 8 seconds trip simulation
      const timer = setTimeout(() => { 
        if (paymentMethod === 'cash') setCurrentState('arrived');
        else setCurrentState('processing_payment');
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      progressWidth.value = 0;
    }
  }, [currentState]);

  // Payment Gateway animation
  useEffect(() => {
    if (currentState === 'processing_payment') {
      const timer = setTimeout(() => { setCurrentState('arrived'); }, 2500); // 2.5s payment processing
      return () => clearTimeout(timer);
    }
  }, [currentState]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 1.5 }], opacity: 1 - pulse.value }));
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));

  // API Call
  const fetchLocations = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5&countrycodes=vn`);
      const data = await response.json();
      const formattedResults: LocationData[] = data.map((item: any) => ({
        id: item.place_id.toString(),
        title: item.name || item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
      setSearchResults(formattedResults);
    } catch (error) { console.error('Error fetching locations', error); } 
    finally { setIsSearching(false); }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.length > 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(() => { fetchLocations(searchQuery); }, 800);
    } else { setSearchResults([]); }
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  const handleSelectLocation = (loc: LocationData) => {
    if (currentFocus === 'pickup') {
      setPickupLocation(loc);
      if (!dropoffLocation) { setCurrentFocus('dropoff'); setSearchQuery(''); setSearchResults([]); } 
      else { calculateAndGoToChoosing(loc, dropoffLocation); }
    } else {
      setDropoffLocation(loc);
      calculateAndGoToChoosing(pickupLocation, loc);
    }
    Keyboard.dismiss();
  };

  const calculateAndGoToChoosing = (pickup: LocationData, dropoff: LocationData) => {
    const dist = calculateHaversineDistance(pickup.lat, pickup.lon, dropoff.lat, dropoff.lon);
    setDistanceKm(dist);
    setCurrentState('choosing_vehicle');
    setSearchQuery('');
  };

  const getDynamicVehicles = () => {
    const d = distanceKm;
    return [
      { id: 'bike', name: 'Xanh SM Bike', desc: 'Nhanh chóng, tiết kiệm', price: Math.round((15000 + (d * 5000))/1000)*1000, time: '3 phút', seats: 1, icon: 'motorbike', color: '#00D8FF' },
      { id: 'car', name: 'Xanh SM Taxi', desc: 'VinFast VF e34, VF 5', price: Math.round((20000 + (d * 15000))/1000)*1000, time: '5 phút', seats: 4, icon: 'car', color: '#00D8FF' },
      { id: 'premium', name: 'Xanh SM Luxury', desc: 'VinFast VF 8 đẳng cấp', price: Math.round((30000 + (d * 20000))/1000)*1000, time: '10 phút', seats: 4, icon: 'car-sports', color: '#00D8FF' },
      { id: 'suv', name: 'Xanh SM SUV', desc: 'Rộng rãi cho nhóm', price: Math.round((25000 + (d * 18000))/1000)*1000, time: '8 phút', seats: 7, icon: 'van-passenger', color: '#00D8FF' },
    ];
  };

  const dynamicVehicles = getDynamicVehicles();
  const formatPrice = (price: number) => {
    let finalPrice = price;
    if (promoCode) {
      const promo = PROMO_CODES.find(p => p.id === promoCode);
      if (promo) finalPrice = Math.max(0, price - promo.value);
    }
    return finalPrice.toLocaleString('vi-VN') + 'đ';
  };
  const getPaymentDetails = () => PAYMENT_METHODS.find(p => p.id === paymentMethod) || PAYMENT_METHODS[0];

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg: ChatMessage = { id: Date.now().toString(), text: chatMessage, isUser: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages([newMsg, ...messages]);
    setChatMessage('');
    setTimeout(() => {
      const replyText = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: replyText, isUser: false, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setMessages(prev => [botMsg, ...prev]);
    }, 1500);
  };

  const handleApplyManualPromo = () => {
    const code = manualPromoInput.toUpperCase();
    if (code === 'SUPERAPP') {
      setPromoCode('superapp');
      setCurrentState('choosing_vehicle');
    } else {
      alert("Mã không hợp lệ!");
    }
    Keyboard.dismiss();
  };

  const saveTripAndExit = async () => {
    try {
      const trip = {
        id: Date.now().toString(),
        pickup: pickupLocation.title,
        dropoff: dropoffLocation?.title,
        price: formatPrice(dynamicVehicles.find(v=>v.id===selectedVehicle)?.price || 0),
        date: new Date().toISOString()
      };
      const existing = await AsyncStorage.getItem('TRIP_HISTORY');
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(trip);
      await AsyncStorage.setItem('TRIP_HISTORY', JSON.stringify(history));
    } catch (e) { console.error('Error saving trip', e); }
    
    setShowToast(true);
    setTimeout(() => { router.replace('/utilities'); }, 2000);
  };

  const getMapBBox = () => {
    let minLat, maxLat, minLon, maxLon;
    const pad = 0.005; // ~500m padding
    if (dropoffLocation && currentState !== 'idle' && currentState !== 'selecting_location') {
      minLat = Math.min(pickupLocation.lat, dropoffLocation.lat) - pad;
      maxLat = Math.max(pickupLocation.lat, dropoffLocation.lat) + pad;
      minLon = Math.min(pickupLocation.lon, dropoffLocation.lon) - pad;
      maxLon = Math.max(pickupLocation.lon, dropoffLocation.lon) + pad;
    } else {
      minLat = pickupLocation.lat - pad;
      maxLat = pickupLocation.lat + pad;
      minLon = pickupLocation.lon - pad;
      maxLon = pickupLocation.lon + pad;
    }
    return `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
  };

  // --- Renderers ---

  const renderLiveMap = () => {
    if (Platform.OS === 'web') {
      return React.createElement('iframe', {
        src: `https://www.openstreetmap.org/export/embed.html?bbox=${getMapBBox()}&layer=mapnik&marker=${pickupLocation.lat}%2C${pickupLocation.lon}`,
        style: { border: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 0 },
        frameBorder: "0",
        scrolling: "no",
        marginHeight: "0",
        marginWidth: "0"
      });
    }
    // Fallback for native if react-native-maps not installed
    return <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#E5E7EB', zIndex: 0 }]} />;
  };

  const renderTopButtons = () => {
    if (currentState === 'selecting_location' || currentState === 'processing_payment') return null;
    return (
      <Animated.View entering={FadeInDown} exiting={FadeOut} style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => {
          if (currentState === 'in_trip' || currentState === 'arrived') return; // Cannot go back during/after trip
          if (currentState === 'choosing_vehicle' || currentState === 'finding_driver') setCurrentState('idle');
          else if (currentState === 'selecting_payment' || currentState === 'selecting_promo') setCurrentState('choosing_vehicle');
          else if (currentState === 'driver_found') setCurrentState('choosing_vehicle');
          else router.replace('/utilities');
        }} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderIdleState = () => {
    if (currentState !== 'idle') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={styles.bottomSheetContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <Text style={styles.greetingText}>Xin chào,</Text>
          <Text style={styles.sheetTitle}>Bạn muốn đi đâu?</Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.searchBarFake} onPress={() => {
            setCurrentFocus('dropoff');
            setCurrentState('selecting_location');
          }}>
            <View style={[styles.searchDot, {backgroundColor: '#EF4444'}]} />
            <Text style={styles.searchPlaceholder}>Nhập điểm đến...</Text>
          </TouchableOpacity>

          <View style={styles.idleShortcutsRow}>
            <TouchableOpacity style={styles.shortcutBtn} onPress={() => { setCurrentFocus('dropoff'); setCurrentState('selecting_location'); }}>
              <Ionicons name="map" size={24} color="#00D8FF" />
              <Text style={styles.shortcutText}>Bản đồ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutBtn} onPress={() => { setCurrentFocus('dropoff'); setCurrentState('selecting_location'); }}>
              <Ionicons name="home" size={24} color="#00D8FF" />
              <Text style={styles.shortcutText}>Nhà</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutBtn} onPress={() => { setCurrentFocus('dropoff'); setCurrentState('selecting_location'); }}>
              <Ionicons name="briefcase" size={24} color="#00D8FF" />
              <Text style={styles.shortcutText}>Công ty</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSelectingLocation = () => {
    if (currentState !== 'selecting_location') return null;
    return (
      <Animated.View entering={SlideInUp.springify()} exiting={SlideOutDown} style={styles.fullScreenModal}>
        <View style={styles.fullScreenWhite}>
          <View style={styles.searchHeaderGroup}>
            <TouchableOpacity onPress={() => setCurrentState('idle')} style={styles.searchBackButton}>
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.searchInputsContainer}>
              <TouchableOpacity style={[styles.searchBarReal, currentFocus === 'pickup' && styles.searchBarActive]} onPress={() => setCurrentFocus('pickup')}>
                <View style={styles.searchDot} />
                <TextInput style={styles.searchInputReal} placeholder="Điểm đón" placeholderTextColor="#9CA3AF" value={currentFocus === 'pickup' ? searchQuery : pickupLocation.title} onChangeText={setSearchQuery} autoFocus={currentFocus === 'pickup'} />
              </TouchableOpacity>
              <View style={styles.searchLineConnector} />
              <TouchableOpacity style={[styles.searchBarReal, currentFocus === 'dropoff' && styles.searchBarActive]} onPress={() => setCurrentFocus('dropoff')}>
                <View style={[styles.searchDot, {backgroundColor: '#EF4444'}]} />
                <TextInput style={styles.searchInputReal} placeholder="Điểm đến" placeholderTextColor="#9CA3AF" value={currentFocus === 'dropoff' ? searchQuery : dropoffLocation?.title || ''} onChangeText={setSearchQuery} autoFocus={currentFocus === 'dropoff'} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.searchResults}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00D8FF" />
                <Text style={styles.loadingText}>Đang tìm kiếm vệ tinh...</Text>
              </View>
            ) : (
              <>
                {searchResults.length === 0 && searchQuery.length > 2 && <Text style={styles.noResultText}>Không tìm thấy địa điểm trên bản đồ</Text>}
                {searchResults.map((place) => (
                  <TouchableOpacity key={place.id} style={styles.searchResultItem} onPress={() => handleSelectLocation(place)}>
                    <View style={styles.searchResultIcon}><Ionicons name="location" size={20} color="#6B7280" /></View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{place.title}</Text>
                      <Text style={styles.searchResultSubtitle} numberOfLines={2}>{place.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  const renderChoosingVehicle = () => {
    if (currentState !== 'choosing_vehicle') return null;
    const currentPay = getPaymentDetails();

    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={[styles.bottomSheetContainer, {height: '75%'}]}>
        <View style={[styles.whiteCard, { flex: 1, paddingBottom: 0 }]}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <View style={styles.routeContainer}>
            <View style={styles.routeLineBox}><View style={styles.blueDot} /><View style={styles.verticalLine} /><View style={styles.redDot} /></View>
            <View style={styles.routeTextsBox}>
              <TouchableOpacity style={styles.routeInputBox} onPress={() => { setCurrentFocus('pickup'); setCurrentState('selecting_location'); }}>
                <Text style={styles.routeTextLight} numberOfLines={1}>{pickupLocation.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.routeInputBox} onPress={() => { setCurrentFocus('dropoff'); setCurrentState('selecting_location'); }}>
                <Text style={styles.routeTextBold} numberOfLines={1}>{dropoffLocation?.title}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.distanceBadge}><Text style={styles.distanceText}>{distanceKm.toFixed(1)} km</Text></View>
          </View>

          <View style={styles.noteContainer}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#6B7280" />
            <TextInput style={styles.noteInput} placeholder="Ghi chú cho tài xế..." placeholderTextColor="#9CA3AF" value={noteForDriver} onChangeText={setNoteForDriver} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.verticalVehicleList}>
            {dynamicVehicles.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <TouchableOpacity key={v.id} activeOpacity={0.7} onPress={() => setSelectedVehicle(v.id)} style={[styles.verticalVehicleCard, isSelected && styles.verticalVehicleCardSelected]}>
                  <View style={styles.vehicleImageWrapper}><MaterialCommunityIcons name={v.icon as any} size={40} color={v.color} /></View>
                  <View style={styles.vehicleInfoWrapper}>
                    <View style={styles.vehicleNameRow}>
                      <Text style={styles.vehicleNameText}>{v.name}</Text>
                      <View style={styles.seatsBadge}><Ionicons name="person" size={10} color="#6B7280" /><Text style={styles.seatsText}>{v.seats}</Text></View>
                    </View>
                    <Text style={styles.vehicleDescText}>{v.desc}</Text>
                    <Text style={styles.vehicleEtaText}>Cách đây {v.time}</Text>
                  </View>
                  <View style={styles.vehiclePriceWrapper}>
                    {promoCode && <Text style={styles.oldPriceVertical}>{v.price.toLocaleString('vi-VN')}đ</Text>}
                    <Text style={[styles.priceTextVertical, isSelected && { color: '#00D8FF' }]}>{formatPrice(v.price)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{height: 20}}/>
          </ScrollView>

          <View style={styles.bookingFooter}>
            <View style={styles.paymentPromoRow}>
              <TouchableOpacity style={styles.paymentBox} onPress={() => setCurrentState('selecting_payment')}>
                <Ionicons name={currentPay.icon as any} size={20} color={currentPay.color} />
                <Text style={styles.paymentText}>{currentPay.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{marginLeft: 'auto'}} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.promoBox, promoCode && styles.promoBoxActive]} onPress={() => setCurrentState('selecting_promo')}>
                <Ionicons name="pricetag" size={20} color={promoCode ? "#FFF" : "#F5A623"} />
                <Text style={[styles.promoText, promoCode && {color: '#FFF'}]}>{promoCode ? 'Đã áp dụng' : 'Khuyến mãi'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.bookButtonWrapper} onPress={() => setCurrentState('finding_driver')}>
              <LinearGradient colors={['#00E5FF', '#00B4D8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bookButton}>
                <Text style={styles.bookButtonText}>ĐẶT {dynamicVehicles.find(v=>v.id===selectedVehicle)?.name.toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSelectingPayment = () => {
    if (currentState !== 'selecting_payment') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={styles.bottomSheetContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <Text style={styles.sheetTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity key={method.id} style={styles.selectionItem} onPress={() => { setPaymentMethod(method.id); setCurrentState('choosing_vehicle'); }}>
              <View style={[styles.selectionIconWrapper, { backgroundColor: method.color + '15' }]}><Ionicons name={method.icon as any} size={24} color={method.color} /></View>
              <Text style={styles.selectionText}>{method.title}</Text>
              {paymentMethod === method.id && <Ionicons name="checkmark-circle" size={24} color="#00D8FF" />}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderSelectingPromo = () => {
    if (currentState !== 'selecting_promo') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={[styles.bottomSheetContainer, {height: '70%'}]}>
        <View style={styles.whiteCard}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <Text style={styles.sheetTitle}>Khuyến mãi của bạn</Text>
          
          <View style={styles.manualPromoRow}>
            <TextInput style={styles.manualPromoInput} placeholder="Nhập mã khuyến mãi..." placeholderTextColor="#9CA3AF" autoCapitalize="characters" value={manualPromoInput} onChangeText={setManualPromoInput} />
            <TouchableOpacity style={styles.manualPromoBtn} onPress={handleApplyManualPromo}>
              <Text style={styles.manualPromoBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {PROMO_CODES.filter(p=>p.id !== 'superapp' || promoCode === 'superapp').map((promo) => (
              <TouchableOpacity key={promo.id} style={[styles.promoTicket, promoCode === promo.id && styles.promoTicketActive]} onPress={() => { setPromoCode(promo.id); setCurrentState('choosing_vehicle'); }}>
                <View style={styles.promoTicketLeft}><Ionicons name="ticket" size={32} color="#F5A623" /></View>
                <View style={styles.promoTicketRight}>
                  <Text style={styles.promoTicketTitle}>{promo.title}</Text>
                  <Text style={styles.promoTicketDesc}>{promo.desc}</Text>
                </View>
                <View style={styles.promoTicketCheck}>
                  <View style={[styles.radioCircle, promoCode === promo.id && styles.radioCircleActive]}>
                    {promoCode === promo.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {promoCode && (
              <TouchableOpacity style={styles.removePromoButton} onPress={() => { setPromoCode(null); setManualPromoInput(''); setCurrentState('choosing_vehicle'); }}>
                <Text style={styles.removePromoText}>Bỏ chọn khuyến mãi</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  const renderFindingDriver = () => {
    if (currentState !== 'finding_driver') return null;
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.findingContainer}>
        <View style={styles.radarWrapper}>
          <Animated.View style={[styles.radarPulseLight, pulseStyle]} />
          <View style={styles.radarCenterLight}><MaterialCommunityIcons name="car-connected" size={40} color="#00D8FF" /></View>
        </View>
        <Text style={styles.findingTextLight}>Đang tìm tài xế...</Text>
        <View style={styles.findingDetailsCard}>
          <View style={styles.findingDetailRow}><View style={styles.blueDot} /><Text style={styles.findingDetailText} numberOfLines={1}>{pickupLocation.title}</Text></View>
          <View style={styles.findingDetailRow}><View style={styles.redDot} /><Text style={styles.findingDetailText} numberOfLines={1}>{dropoffLocation?.title}</Text></View>
        </View>
        <TouchableOpacity style={styles.cancelButtonLight} onPress={() => setCurrentState('choosing_vehicle')}><Text style={styles.cancelButtonTextLight}>Hủy chuyến</Text></TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDriverFound = () => {
    if (currentState !== 'driver_found') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={styles.bottomSheetContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <View style={styles.driverHeaderRow}>
            <View><Text style={styles.etaTitleText}>Tài xế đang đến</Text><Text style={styles.etaMinutesText}>3 phút</Text></View>
            <View style={styles.licensePlateBoxLight}><Text style={styles.licensePlateTextLight}>51H-123.45</Text></View>
          </View>
          <View style={styles.dividerLight} />
          <TouchableOpacity style={styles.driverInfoRow} activeOpacity={0.7} onPress={() => setShowDriverProfile(true)}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.driverAvatarLight} />
            <View style={styles.driverDetails}>
              <Text style={styles.driverNameLight}>Nguyễn Văn Tài xế</Text>
              <View style={styles.ratingRow}><Ionicons name="star" size={14} color="#F5A623" /><Text style={styles.ratingTextLight}>4.9</Text><Text style={styles.carNameLight}> • VinFast VF e34</Text></View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.actionCircleLight} onPress={(e) => { e.stopPropagation(); }}><Ionicons name="call" size={20} color="#1F2937" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionCircleLight} onPress={(e) => { e.stopPropagation(); setIsChatting(true); }}><Ionicons name="chatbubble" size={20} color="#1F2937" /></TouchableOpacity>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} style={[styles.bookButtonWrapper, { marginTop: 24 }]} onPress={() => setCurrentState('in_trip')}>
            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bookButton}>
              <Text style={styles.bookButtonText}>TÀI XẾ ĐÃ ĐẾN NƠI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderInTrip = () => {
    if (currentState !== 'in_trip') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} style={styles.bottomSheetContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.handleBarWrapper}><View style={styles.handleBar} /></View>
          <View style={styles.inTripHeader}>
            <View style={styles.inTripPulse}><ActivityIndicator color="#00D8FF" /></View>
            <Text style={styles.inTripTitle}>Đang di chuyển đến {dropoffLocation?.title}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, progressStyle]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelText}>Khởi hành</Text>
              <Text style={styles.progressLabelText}>Đang đi</Text>
              <Text style={styles.progressLabelText}>Sắp đến</Text>
            </View>
          </View>

          <View style={styles.inTripInfoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
            <Text style={styles.inTripInfoText}>Chuyến đi mô phỏng sẽ hoàn thành sau vài giây...</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderProcessingPayment = () => {
    if (currentState !== 'processing_payment') return null;
    const isVNPay = paymentMethod === 'vnpay';
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.findingContainer, {backgroundColor: isVNPay ? '#005BAA' : '#1F2937'}]}>
        <ActivityIndicator size="large" color="#FFF" style={{transform: [{scale: 1.5}]}} />
        <Text style={[styles.findingTextLight, {color: '#FFF', marginTop: 32, fontSize: 24}]}>
          {isVNPay ? 'Cổng thanh toán VNPay' : 'Đang xử lý thẻ Visa...'}
        </Text>
        <Text style={{color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 8}}>Đang thực hiện giao dịch, vui lòng chờ...</Text>
      </Animated.View>
    );
  };

  const renderArrived = () => {
    if (currentState !== 'arrived') return null;
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.arrivedModal}>
        <View style={styles.arrivedBlurLight}>
          <View style={styles.receiptCardLight}>
            <View style={styles.checkIconWrapper}><Ionicons name="checkmark" size={40} color="#FFF" /></View>
            <Text style={styles.arrivedTitleLight}>Chuyến đi hoàn thành</Text>
            <Text style={styles.arrivedPriceLight}>{formatPrice(dynamicVehicles.find(v=>v.id===selectedVehicle)?.price || 0)}</Text>
            <Text style={styles.arrivedMethodLight}>Đã thanh toán bằng {getPaymentDetails().title}</Text>
            
            <View style={styles.dividerDashed} />
            
            <Text style={styles.ratingPromptLight}>Đánh giá tài xế</Text>
            <View style={styles.starRow}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}><Ionicons name={rating >= star ? "star" : "star-outline"} size={40} color="#F5A623" style={styles.starIcon} /></TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitRatingBtn} onPress={saveTripAndExit}><Text style={styles.submitRatingText}>GỬI ĐÁNH GIÁ</Text></TouchableOpacity>
          </View>
        </View>
        {showToast && (
          <Animated.View entering={FadeInUp} exiting={FadeOut} style={styles.toastContainerLight}>
            <Ionicons name="checkmark-circle" size={24} color="#00D8FF" />
            <Text style={styles.toastTextLight}>Đã lưu lịch sử & Cảm ơn bạn!</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderDriverProfileModal = () => {
    return (
      <Modal visible={showDriverProfile} transparent animationType="slide">
        <View style={styles.modalOverlayLight}>
          <TouchableOpacity style={styles.modalBackdropLight} onPress={() => setShowDriverProfile(false)} />
          <View style={styles.profileCardLight}>
            <TouchableOpacity style={styles.closeModalBtnLight} onPress={() => setShowDriverProfile(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.profileAvatarLight} />
            <Text style={styles.profileNameLight}>Nguyễn Văn Tài xế</Text>
            <Text style={styles.profileCarLight}>VinFast VF e34 • 51H-123.45</Text>
            <View style={styles.profileStatsRowLight}>
              <View style={styles.profileStatBox}><Text style={styles.profileStatNumberLight}>4.9</Text><Text style={styles.profileStatLabelLight}>Đánh giá</Text></View>
              <View style={styles.verticalLineProfileLight} />
              <View style={styles.profileStatBox}><Text style={styles.profileStatNumberLight}>1.5K</Text><Text style={styles.profileStatLabelLight}>Chuyến đi</Text></View>
              <View style={styles.verticalLineProfileLight} />
              <View style={styles.profileStatBox}><Text style={styles.profileStatNumberLight}>3 năm</Text><Text style={styles.profileStatLabelLight}>Kinh nghiệm</Text></View>
            </View>
            <Text style={styles.profileBioLight}>"Tài xế thân thiện, lái xe an toàn là trên hết. Cảm ơn quý khách đã tin tưởng!"</Text>
          </View>
        </View>
      </Modal>
    );
  };

  const renderChatModal = () => {
    return (
      <Modal visible={isChatting} transparent animationType="slide">
        <View style={styles.chatOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setIsChatting(false)} style={styles.closeChatBtn}><Ionicons name="chevron-down" size={28} color="#1F2937" /></TouchableOpacity>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.chatAvatar} />
              <Text style={styles.chatDriverName}>Tài xế Nguyễn Văn</Text>
            </View>
            <FlatList data={messages} keyExtractor={(item) => item.id} inverted contentContainerStyle={styles.chatListContent} renderItem={({item}) => (
              <View style={[styles.chatBubbleRow, item.isUser ? styles.chatBubbleRowUser : styles.chatBubbleRowBot]}>
                {!item.isUser && <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.chatSmallAvatar} />}
                <View style={[styles.chatBubble, item.isUser ? styles.chatBubbleUser : styles.chatBubbleBot]}>
                  <Text style={[styles.chatBubbleText, item.isUser ? {color: '#FFF'} : {color: '#1F2937'}]}>{item.text}</Text>
                  <Text style={[styles.chatTimeText, item.isUser ? {color: 'rgba(255,255,255,0.7)'} : {color: '#9CA3AF'}]}>{item.time}</Text>
                </View>
              </View>
            )}/>
            <View style={styles.chatInputRow}>
              <TextInput style={styles.chatInput} placeholder="Nhắn tin cho tài xế..." value={chatMessage} onChangeText={setChatMessage} onSubmitEditing={sendMessage} />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}><Ionicons name="send" size={20} color="#FFF" /></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.mapBackgroundContainer}>
            
            {/* The Live Interactive Map */}
            {renderLiveMap()}
            
            {/* The UI Overlays */}
            <View style={styles.uiOverlayContainer}>
              <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
              {renderTopButtons()}
              {renderIdleState()}
              {renderSelectingLocation()}
              {renderChoosingVehicle()}
              {renderSelectingPayment()}
              {renderSelectingPromo()}
              {renderFindingDriver()}
              {renderDriverFound()}
              {renderInTrip()}
              {renderProcessingPayment()}
              {renderArrived()}
              {renderDriverProfileModal()}
              {renderChatModal()}
            </View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#FFF', width: '100%' },
  desktopFrame: { maxWidth: 420, maxHeight: 850, aspectRatio: 420/850, borderWidth: 8, borderColor: '#1F2937', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  
  mapBackgroundContainer: { flex: 1, width: '100%', height: '100%', position: 'relative' },
  uiOverlayContainer: { ...StyleSheet.absoluteFillObject, zIndex: 10, pointerEvents: 'box-none' },

  topButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, zIndex: 10, position: 'absolute', width: '100%' },
  floatingButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  bottomSheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', position: 'absolute', bottom: 0, width: '100%', zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 20 },
  whiteCard: { backgroundColor: '#FFF', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingHorizontal: 20 },
  handleBarWrapper: { alignItems: 'center', marginBottom: 16 },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  greetingText: { fontSize: 14, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 20 },
  searchBarFake: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 },
  searchDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  searchPlaceholder: { color: '#9CA3AF', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  idleShortcutsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  shortcutBtn: { alignItems: 'center', backgroundColor: '#F0F9FF', padding: 16, borderRadius: 16, width: '30%' },
  shortcutText: { marginTop: 8, color: '#1F2937', fontWeight: '600', fontSize: 13 },
  fullScreenModal: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  fullScreenWhite: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'ios' ? 50 : 30 },
  searchHeaderGroup: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  searchBackButton: { marginRight: 12, paddingTop: 12 },
  searchInputsContainer: { flex: 1 },
  searchBarReal: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  searchBarActive: { backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD' },
  searchInputReal: { flex: 1, color: '#1F2937', fontSize: 16, fontWeight: '500', marginLeft: 12, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  searchLineConnector: { width: 2, height: 16, backgroundColor: '#E5E7EB', marginLeft: 20 },
  searchResults: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  noResultText: { color: '#9CA3AF', textAlign: 'center', marginTop: 20, fontSize: 15 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchResultIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  searchResultText: { flex: 1 },
  searchResultTitle: { color: '#1F2937', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  searchResultSubtitle: { color: '#6B7280', fontSize: 13 },
  routeContainer: { flexDirection: 'row', marginBottom: 16 },
  routeLineBox: { width: 24, alignItems: 'center', marginRight: 12, marginTop: 12 },
  blueDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  verticalLine: { width: 2, height: 30, backgroundColor: '#E5E7EB', marginVertical: 4 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  routeTextsBox: { flex: 1 },
  routeInputBox: { height: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  routeTextLight: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
  routeTextBold: { color: '#1F2937', fontSize: 16, fontWeight: '700' },
  distanceBadge: { justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  distanceText: { backgroundColor: '#E0F2FE', color: '#00D8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: '800', fontSize: 12 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 12, height: 40, marginBottom: 16 },
  noteInput: { flex: 1, marginLeft: 8, color: '#1F2937', fontSize: 14, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  verticalVehicleList: { flex: 1, marginBottom: 16 },
  verticalVehicleCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  verticalVehicleCardSelected: { backgroundColor: '#E0F2FE', borderRadius: 12, borderBottomWidth: 0 },
  vehicleImageWrapper: { width: 60, alignItems: 'center', marginRight: 12 },
  vehicleInfoWrapper: { flex: 1 },
  vehicleNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  vehicleNameText: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginRight: 8 },
  seatsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  seatsText: { fontSize: 10, color: '#6B7280', marginLeft: 2, fontWeight: '600' },
  vehicleDescText: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  vehicleEtaText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  vehiclePriceWrapper: { alignItems: 'flex-end' },
  oldPriceVertical: { textDecorationLine: 'line-through', fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  priceTextVertical: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  bookingFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16, backgroundColor: '#FFF' },
  paymentPromoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  paymentBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginRight: 8 },
  paymentText: { color: '#1F2937', fontWeight: '600', marginLeft: 8, fontSize: 14 },
  promoBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 12, marginLeft: 8 },
  promoBoxActive: { backgroundColor: '#FEF3C7' },
  promoText: { color: '#1F2937', fontWeight: '600', marginLeft: 8, fontSize: 14 },
  bookButtonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#00D8FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  bookButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  selectionIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  selectionText: { flex: 1, color: '#1F2937', fontSize: 16, fontWeight: '600' },
  
  manualPromoRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  manualPromoInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 15, color: '#1F2937', ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  manualPromoBtn: { backgroundColor: '#00D8FF', borderRadius: 12, justifyContent: 'center', paddingHorizontal: 16 },
  manualPromoBtnText: { color: '#FFF', fontWeight: '700' },
  
  promoTicket: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  promoTicketActive: { borderColor: '#00D8FF', backgroundColor: '#F0F9FF' },
  promoTicketLeft: { padding: 16, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#E5E7EB', borderStyle: 'dashed' },
  promoTicketRight: { flex: 1, padding: 16, justifyContent: 'center' },
  promoTicketTitle: { color: '#1F2937', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  promoTicketDesc: { color: '#6B7280', fontSize: 13 },
  promoTicketCheck: { padding: 16, justifyContent: 'center' },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#00D8FF' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00D8FF' },
  removePromoButton: { marginTop: 8, alignSelf: 'center', paddingVertical: 8, paddingBottom: 20 },
  removePromoText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  findingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100, pointerEvents: 'auto' },
  radarWrapper: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  radarPulseLight: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#00D8FF' },
  radarCenterLight: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#00D8FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  findingTextLight: { color: '#1F2937', fontSize: 20, fontWeight: '800', marginBottom: 24 },
  findingDetailsCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, width: '80%', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.05, elevation: 5 },
  findingDetailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  findingDetailText: { marginLeft: 12, color: '#4B5563', fontSize: 14, fontWeight: '500' },
  cancelButtonLight: { position: 'absolute', bottom: 60, paddingVertical: 14, paddingHorizontal: 40, backgroundColor: '#F3F4F6', borderRadius: 25 },
  cancelButtonTextLight: { color: '#374151', fontWeight: '700', fontSize: 15 },
  driverHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  etaTitleText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  etaMinutesText: { color: '#1F2937', fontSize: 20, fontWeight: '800' },
  licensePlateBoxLight: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  licensePlateTextLight: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
  dividerLight: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  driverInfoRow: { flexDirection: 'row', alignItems: 'center' },
  driverAvatarLight: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#00D8FF' },
  driverDetails: { flex: 1, marginLeft: 12 },
  driverNameLight: { color: '#1F2937', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingTextLight: { color: '#1F2937', fontWeight: '700', marginLeft: 4, fontSize: 13 },
  carNameLight: { color: '#6B7280', fontSize: 13, marginLeft: 4 },
  driverActions: { flexDirection: 'row', gap: 12 },
  actionCircleLight: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  
  inTripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  inTripPulse: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inTripTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', flex: 1 },
  progressContainer: { marginBottom: 24 },
  progressBarTrack: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#00D8FF', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  inTripInfoCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, alignItems: 'center' },
  inTripInfoText: { marginLeft: 12, fontSize: 13, color: '#4B5563', flex: 1 },

  arrivedModal: { ...StyleSheet.absoluteFillObject, zIndex: 150, justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto' },
  arrivedBlurLight: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  receiptCardLight: { width: '100%', maxWidth: 360, backgroundColor: '#FFF', borderRadius: 24, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, elevation: 10 },
  checkIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  arrivedTitleLight: { color: '#1F2937', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  arrivedPriceLight: { color: '#1F2937', fontSize: 36, fontWeight: '900', marginBottom: 8 },
  arrivedMethodLight: { color: '#6B7280', fontSize: 14, marginBottom: 24 },
  dividerDashed: { width: '100%', height: 1, borderTopWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', marginBottom: 24 },
  ratingPromptLight: { color: '#374151', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  starIcon: { marginHorizontal: 4 },
  submitRatingBtn: { width: '100%', backgroundColor: '#00D8FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  submitRatingText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  toastContainerLight: { position: 'absolute', top: 60, alignSelf: 'center', flexDirection: 'row', backgroundColor: '#1F2937', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 10 },
  toastTextLight: { color: '#FFF', fontWeight: '600', marginLeft: 8, fontSize: 15 },
  modalOverlayLight: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdropLight: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  profileCardLight: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:10}, shadowOpacity: 0.1, elevation: 10 },
  closeModalBtnLight: { position: 'absolute', top: 16, right: 16, padding: 8, backgroundColor: '#F3F4F6', borderRadius: 20 },
  profileAvatarLight: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#00D8FF', marginBottom: 16 },
  profileNameLight: { color: '#1F2937', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  profileCarLight: { color: '#6B7280', fontSize: 14, marginBottom: 20 },
  profileStatsRowLight: { flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 16, marginBottom: 20 },
  profileStatBox: { alignItems: 'center' },
  profileStatNumberLight: { color: '#1F2937', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  profileStatLabelLight: { color: '#6B7280', fontSize: 12 },
  verticalLineProfileLight: { width: 1, backgroundColor: '#E5E7EB' },
  profileBioLight: { color: '#4B5563', fontSize: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },
  chatOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  chatContainer: { height: '60%', backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  closeChatBtn: { padding: 4, marginRight: 12 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  chatDriverName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  chatListContent: { padding: 16, paddingBottom: 24 },
  chatBubbleRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  chatBubbleRowUser: { justifyContent: 'flex-end' },
  chatBubbleRowBot: { justifyContent: 'flex-start' },
  chatSmallAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  chatBubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  chatBubbleUser: { backgroundColor: '#00D8FF', borderBottomRightRadius: 4 },
  chatBubbleBot: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  chatBubbleText: { fontSize: 15, lineHeight: 20 },
  chatTimeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  chatInputRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  chatInput: { flex: 1, backgroundColor: '#F3F4F6', height: 44, borderRadius: 22, paddingHorizontal: 16, fontSize: 15, color: '#1F2937', ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00D8FF', justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});
