import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, TextInput, useWindowDimensions,
  Image, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';

type AppState = 'hub_home' | 'search_location' | 'choosing_vehicle' | 'finding_driver' | 'in_trip';

const T = {
  bg: '#F8FAFC', card: '#FFFFFF', cardAlt: '#F1F5F9',
  accent: '#10B981', accentSoft: '#D1FAE5', // XanhSM-like green
  red: '#EF4444', blue: '#3B82F6', text: '#0F172A',
  textSub: '#475569', textMuted: '#94A3B8', border: '#E2E8F0',
  lux: '#0F172A', // For Luxury cars
};

const VEHICLES = [
  { id: 'v1', name: 'XanhSM Bike', type: 'bike', price: 15000, origPrice: 20000, eta: '14:32 (3 phút)', cap: 1, desc: 'Nhanh chóng, luồn lách dễ dàng' },
  { id: 'v2', name: 'XanhSM Car', type: 'car', price: 45000, origPrice: 55000, eta: '14:35 (6 phút)', cap: 4, desc: 'Thoải mái, tiện nghi' },
  { id: 'v3', name: 'XanhSM Luxury', type: 'lux', price: 75000, origPrice: null, eta: '14:40 (11 phút)', cap: 4, desc: 'Trải nghiệm đẳng cấp VF8' },
];

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function TransportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [currentState, setCurrentState] = useState<AppState>('hub_home');
  
  // Locations
  const [locFrom, setLocFrom] = useState('Vị trí hiện tại');
  const [locTo, setLocTo] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0]);

  // Radar Animation
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);

  useEffect(() => {
    if (currentState === 'finding_driver') {
      pulse1.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
      pulse2.value = withDelay(1000, withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false));
      
      const t = setTimeout(() => setCurrentState('in_trip'), 4000);
      return () => clearTimeout(t);
    } else {
      pulse1.value = 0; pulse2.value = 0;
    }
  }, [currentState]);

  const animatedPulse1 = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse1.value * 2 }], opacity: 1 - pulse1.value }));
  const animatedPulse2 = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse2.value * 2 }], opacity: 1 - pulse2.value }));

  const renderMap = () => (
    <View style={StyleSheet.absoluteFillObject}>
      <Image source={{ uri: 'https://cdn.dribbble.com/users/2561280/screenshots/11545638/media/1b5eeb430d4b961eb4c6c9a8ea8d9299.png' }} style={{ width: '100%', height: '100%', opacity: 0.5 }} blurRadius={currentState === 'search_location' ? 10 : 0} />
      {currentState === 'in_trip' && (
        <View style={{ position: 'absolute', top: '30%', left: '20%', right: '20%', height: 4, backgroundColor: T.accent, borderRadius: 2 }} />
      )}
    </View>
  );

  const renderTopBar = () => {
    if (currentState === 'search_location') return null; // Search has its own header
    return (
      <Animated.View entering={FadeInDown} exiting={FadeOut} style={S.topBar} pointerEvents="box-none">
        <TouchableOpacity style={S.topBtn} onPress={() => {
          if (currentState === 'in_trip') return; // Cannot go back
          if (currentState === 'finding_driver') setCurrentState('choosing_vehicle');
          else if (currentState === 'choosing_vehicle') setCurrentState('search_location');
          else if (currentState === 'hub_home') {
            if (router.canGoBack()) router.back();
            else router.replace('/utilities');
          }
        }} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHubHome = () => {
    if (currentState !== 'hub_home') return null;
    return (
      <Animated.View entering={SlideInDown.springify().damping(15)} style={S.sheet}>
        <View style={S.handle} />
        <View style={{ paddingHorizontal: 24 }}>
          {/* Greeting */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: T.text, marginBottom: 20 }}>Chào bạn,{'\n'}Bạn muốn đi đâu?</Text>

          {/* Quick Search */}
          <TouchableOpacity style={S.searchBox} onPress={() => setCurrentState('search_location')} activeOpacity={0.9}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: T.accent, marginRight: 15 }} />
            <Text style={{ flex: 1, fontSize: 16, color: T.textMuted, fontWeight: '600' }}>Nhập điểm đến...</Text>
          </TouchableOpacity>

          {/* Saved Places */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 25 }}>
            <TouchableOpacity style={S.savedBtn} onPress={() => { setLocTo('Nhà'); setCurrentState('choosing_vehicle'); }}>
              <View style={[S.iconWrap, { backgroundColor: '#FEF2F2' }]}><Ionicons name="home" size={20} color={T.red} /></View>
              <Text style={S.savedTxt}>Nhà</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.savedBtn} onPress={() => { setLocTo('Công ty'); setCurrentState('choosing_vehicle'); }}>
              <View style={[S.iconWrap, { backgroundColor: '#EFF6FF' }]}><Ionicons name="briefcase" size={20} color={T.blue} /></View>
              <Text style={S.savedTxt}>Công ty</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '800', color: T.text, marginBottom: 15 }}>Khám phá tiện ích</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity style={[S.hubCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={() => router.push('/delivery')} activeOpacity={0.8}>
              <View style={[S.iconWrap, { backgroundColor: '#FEE2E2', width: 40, height: 40, borderRadius: 20, marginBottom: 10 }]}><Text style={{ fontSize: 20 }}>📦</Text></View>
              <Text style={S.hubCardTitle}>Giao Hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.hubCard, { backgroundColor: '#FEFCE8', borderColor: '#FEF08A' }]} onPress={() => router.push('/food')} activeOpacity={0.8}>
              <View style={[S.iconWrap, { backgroundColor: '#FEF9C3', width: 40, height: 40, borderRadius: 20, marginBottom: 10 }]}><Text style={{ fontSize: 20 }}>🍔</Text></View>
              <Text style={S.hubCardTitle}>Đồ Ăn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSearchLocation = () => {
    if (currentState !== 'search_location') return null;
    return (
      <Animated.View entering={SlideInDown} style={S.fullScreenSheet}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15 }}>
            <TouchableOpacity onPress={() => setCurrentState('hub_home')}><Ionicons name="chevron-back" size={28} color={T.text} /></TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', marginRight: 24 }}>Chọn tuyến đường</Text>
          </View>

          {/* Search Inputs */}
          <View style={{ paddingHorizontal: 16 }}>
            <View style={S.routeCard}>
              <View style={S.routeLine}>
                <Ionicons name="radio-button-on" size={16} color={T.blue} />
                <View style={S.vLine} />
                <Ionicons name="location" size={20} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput style={S.input} value={locFrom} onChangeText={setLocFrom} placeholder="Điểm đón" placeholderTextColor={T.textMuted} />
                <View style={S.divider} />
                <TextInput style={[S.input, { fontWeight: '700' }]} value={locTo} onChangeText={setLocTo} placeholder="Bạn muốn đến đâu?" placeholderTextColor={T.textMuted} autoFocus />
              </View>
            </View>

            {locTo.length > 2 && (
              <TouchableOpacity style={S.searchResult} onPress={() => setCurrentState('choosing_vehicle')}>
                <View style={S.resultIcon}><Ionicons name="location" size={20} color={T.textSub} /></View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>{locTo}</Text>
                  <Text style={{ fontSize: 13, color: T.textSub }}>Hồ Chí Minh, Việt Nam</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={S.mapPinBtn}>
              <Ionicons name="map-outline" size={20} color={T.text} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 15, fontWeight: '600' }}>Chọn điểm trên bản đồ</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  const renderChoosingVehicle = () => {
    if (currentState !== 'choosing_vehicle') return null;
    return (
      <Animated.View entering={SlideInDown.springify().damping(15)} style={[S.sheet, { height: '65%' }]}>
        <View style={S.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 15 }}>Chọn xe</Text>
          {VEHICLES.map(v => {
            const isSelected = selectedVehicle.id === v.id;
            return (
              <TouchableOpacity key={v.id} style={[S.vehicleCard, isSelected && S.vehicleCardActive]} onPress={() => setSelectedVehicle(v)} activeOpacity={0.9}>
                {/* Icon */}
                <View style={{ width: 60, alignItems: 'center' }}>
                  <Text style={{ fontSize: 32 }}>{v.type === 'bike' ? '🏍️' : v.type === 'lux' ? '🏎️' : '🚘'}</Text>
                </View>
                {/* Info */}
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: T.text }}>{v.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: T.cardAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Ionicons name="person" size={10} color={T.textSub} />
                      <Text style={{ fontSize: 12, fontWeight: '700', marginLeft: 3 }}>{v.cap}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{v.eta}</Text>
                  <Text style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{v.desc}</Text>
                </View>
                {/* Price */}
                <View style={{ alignItems: 'flex-end' }}>
                  {v.origPrice && <Text style={{ fontSize: 13, color: T.textMuted, textDecorationLine: 'line-through', marginBottom: 2 }}>{formatMoney(v.origPrice)}</Text>}
                  <Text style={{ fontSize: 16, fontWeight: '800', color: T.text }}>{formatMoney(v.price)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer: Payment & Book */}
        <View style={S.footer}>
          <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <TouchableOpacity style={S.footerItem}>
              <Ionicons name="cash" size={20} color={T.green} />
              <Text style={{ marginLeft: 8, fontWeight: '700' }}>Tiền mặt</Text>
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: T.border, marginHorizontal: 15 }} />
            <TouchableOpacity style={S.footerItem}>
              <Ionicons name="pricetag" size={20} color={T.accent} />
              <Text style={{ marginLeft: 8, fontWeight: '700' }}>Khuyến mãi</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[S.primaryBtn, selectedVehicle.type === 'lux' && { backgroundColor: T.lux }]} onPress={() => setCurrentState('finding_driver')}>
            <Text style={S.primaryBtnTxt}>ĐẶT {selectedVehicle.name.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderFindingDriver = () => {
    if (currentState !== 'finding_driver') return null;
    return (
      <Animated.View entering={SlideInDown} style={[S.sheet, { alignItems: 'center', paddingVertical: 50 }]}>
        <View style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={[S.radarCircle, animatedPulse1]} />
          <Animated.View style={[S.radarCircle, animatedPulse2]} />
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: T.accent, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
            <Ionicons name="search" size={30} color="#FFF" />
          </View>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: T.text, marginTop: 30 }}>Đang tìm tài xế...</Text>
        <Text style={{ fontSize: 15, color: T.textSub, marginTop: 8 }}>Vui lòng đợi trong giây lát</Text>
        
        <View style={{ width: '80%', height: 4, backgroundColor: T.cardAlt, borderRadius: 2, marginTop: 30, overflow: 'hidden' }}>
          <View style={{ width: '40%', height: '100%', backgroundColor: T.accent }} />
        </View>
      </Animated.View>
    );
  };

  const renderInTrip = () => {
    if (currentState !== 'in_trip') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} style={S.sheet}>
        <View style={S.handle} />
        <View style={S.sheetContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.text }}>Đang đón bạn</Text>
            <View style={S.safetyShield}>
              <Ionicons name="shield-checkmark" size={16} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>An Toàn</Text>
            </View>
          </View>

          <View style={S.driverCard}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: T.accent }} />
              <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: T.text }}>Trần Văn Tài</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={{ fontSize: 14, fontWeight: '700', marginLeft: 4 }}>4.9</Text>
                  <Text style={{ fontSize: 14, color: T.textSub, marginLeft: 10 }}>• 2.4K chuyến</Text>
                </View>
              </View>
            </View>
            
            <View style={{ backgroundColor: T.bg, padding: 12, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 14, color: T.textSub }}>Honda Winner X</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Xanh Dương</Text>
              </View>
              <View style={S.licensePlate}>
                <Text style={S.licensePlateText}>59-X2</Text>
                <Text style={S.licensePlateText}>123.45</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
              <TouchableOpacity style={S.contactBtn}>
                <Ionicons name="chatbubble-ellipses" size={20} color={T.text} />
                <Text style={S.contactTxt}>Nhắn tin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.contactBtn}>
                <Ionicons name="call" size={20} color={T.text} />
                <Text style={S.contactTxt}>Gọi điện</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            {renderMap()}
            <View style={S.overlay} pointerEvents="box-none">
              {renderTopBar()}
              {renderHubHome()}
              {renderSearchLocation()}
              {renderChoosingVehicle()}
              {renderFindingDriver()}
              {renderInTrip()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  safe: { flex: 1, backgroundColor: T.bg, width: '100%' },
  desktop: { maxWidth: 390, maxHeight: 844, aspectRatio: 390/844, borderRadius: 40, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  topBar: { position: 'absolute', top: 0, left: 0, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 30, zIndex: 100 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.card, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  
  sheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: T.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: Platform.OS === 'ios' ? 40 : 20, shadowColor: '#000', shadowOffset: {width:0,height:-5}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  fullScreenSheet: { ...StyleSheet.absoluteFillObject, backgroundColor: T.card, zIndex: 50 },
  handle: { width: 40, height: 5, backgroundColor: T.border, borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  sheetContent: { paddingHorizontal: 24 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.cardAlt, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: T.border },
  savedBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: T.border },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  savedTxt: { fontSize: 16, fontWeight: '700', color: T.text },
  
  hubCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
  hubCardTitle: { fontSize: 16, fontWeight: '800', color: T.text },

  routeCard: { backgroundColor: T.cardAlt, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  routeLine: { width: 20, alignItems: 'center', marginRight: 15, gap: 4 },
  vLine: { width: 2, height: 30, backgroundColor: T.border },
  input: { height: 40, fontSize: 16, color: T.text, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  divider: { height: 1, backgroundColor: T.border, marginVertical: 5 },
  searchResult: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: T.border },
  resultIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.cardAlt, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  mapPinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.cardAlt, padding: 15, borderRadius: 16, marginTop: 20 },

  vehicleCard: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  vehicleCardActive: { borderColor: T.accent, backgroundColor: T.accentSoft },
  
  footer: { padding: 16, backgroundColor: T.card, borderTopWidth: 1, borderTopColor: T.border, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  footerItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: T.accent, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  radarCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.accentSoft },

  driverCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width:0,height:5}, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10, borderWidth: 1, borderColor: T.border },
  licensePlate: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#000', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  licensePlateText: { fontSize: 14, fontWeight: '900', fontFamily: 'monospace' },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.cardAlt, paddingVertical: 12, borderRadius: 12 },
  contactTxt: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
  safetyShield: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.blue, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
});
