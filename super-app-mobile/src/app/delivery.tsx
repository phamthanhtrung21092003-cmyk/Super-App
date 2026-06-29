import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, TextInput, useWindowDimensions,
  ScrollView, Image, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut, SlideInDown } from 'react-native-reanimated';

type DeliveryState = 'home' | 'form' | 'finding' | 'tracking';

const T = {
  bg: '#F8FAFC', card: '#FFFFFF', cardAlt: '#F1F5F9',
  accent: '#DC2626', accentSoft: '#FEE2E2',
  green: '#15803D', amber: '#D97706', text: '#0F172A',
  textSub: '#475569', textMuted: '#94A3B8', border: '#E2E8F0',
};

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function DeliveryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const [state, setState] = useState<DeliveryState>('home');
  
  // Delivery Form State
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddr, setSenderAddr] = useState('');
  
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddr, setReceiverAddr] = useState('');
  
  const [vehicle, setVehicle] = useState<'bike'|'truck'>('bike');
  const [note, setNote] = useState('');

  // Auto calculate price mock (Normally uses Haversine on lat/lng)
  const baseDistanceKm = senderAddr && receiverAddr ? 5.2 : 0;
  const pricePerKm = vehicle === 'bike' ? 5000 : 15000;
  const baseFare = vehicle === 'bike' ? 15000 : 50000;
  const calculatedPrice = baseDistanceKm > 0 ? baseFare + (baseDistanceKm * pricePerKm) : (vehicle === 'bike' ? 25000 : 150000);

  // Validation
  const isFormValid = senderName && senderPhone && senderAddr && receiverName && receiverPhone && receiverAddr;

  // Map Mockup
  const renderMap = () => (
    <View style={StyleSheet.absoluteFillObject}>
      <Image source={{ uri: 'https://cdn.dribbble.com/users/2561280/screenshots/11545638/media/1b5eeb430d4b961eb4c6c9a8ea8d9299.png' }} style={{ width: '100%', height: '100%', opacity: 0.3 }} blurRadius={2} />
      {/* Route Line Mockup if form is filled */}
      {(isFormValid && state !== 'home') ? (
        <View style={{ position: 'absolute', top: '40%', left: '20%', right: '20%', height: 2, backgroundColor: T.accent, borderStyle: 'dashed' }} />
      ) : null}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(248, 250, 252, 0.4)' }]} />
    </View>
  );

  const renderTopBar = () => (
    <Animated.View entering={FadeInDown} exiting={FadeOut} style={S.topBar}>
      <TouchableOpacity style={S.topBtn} onPress={() => {
        if (state === 'form') setState('home');
        else if (state === 'finding') setState('form');
        else if (router.canGoBack()) router.back();
        else router.replace('/transport');
      }}>
        <Ionicons name="chevron-back" size={28} color={T.text} />
      </TouchableOpacity>
      <Text style={S.topTitle}>{state === 'tracking' ? 'Theo Dõi Đơn Hàng' : 'Giao Hàng Hỏa Tốc'}</Text>
      <View style={{ width: 40 }} />
    </Animated.View>
  );

  const renderHome = () => {
    if (state !== 'home') return null;
    return (
      <Animated.View entering={SlideInDown.springify().damping(15)} style={S.sheet}>
        <View style={S.handle} />
        <View style={S.sheetContent}>
          <Text style={S.title}>Giao Hàng Hỏa Tốc</Text>
          <Text style={S.subtitle}>Nhập địa chỉ để bắt đầu giao hàng</Text>

          <View style={S.routeCard}>
            <View style={S.routeLine}>
              <Ionicons name="radio-button-on" size={16} color={T.accent} />
              <View style={S.vLine} />
              <Ionicons name="location" size={20} color={T.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={S.locBtn} onPress={() => setState('form')}>
                <Text style={S.locLabel}>ĐIỂM LẤY HÀNG</Text>
                <Text style={senderAddr ? S.locVal : S.locValMuted}>{senderAddr || 'Nhập địa chỉ lấy hàng'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.locBtn, { borderBottomWidth: 0, paddingBottom: 0, paddingTop: 12 }]} onPress={() => setState('form')}>
                <Text style={S.locLabel}>ĐIỂM GIAO HÀNG</Text>
                <Text style={receiverAddr ? S.locVal : S.locValMuted}>{receiverAddr || 'Bạn muốn giao đến đâu?'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderForm = () => {
    if (state !== 'form') return null;
    return (
      <Animated.View entering={SlideInDown.springify().damping(15)} style={S.fullSheet}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={S.sectionTitle}>Thông tin lấy hàng</Text>
          <View style={S.inputCard}>
            <TextInput style={S.input} placeholder="Tên người gửi *" placeholderTextColor={T.textMuted} value={senderName} onChangeText={setSenderName} />
            <View style={S.divider} />
            <TextInput style={S.input} placeholder="Số điện thoại *" placeholderTextColor={T.textMuted} keyboardType="phone-pad" value={senderPhone} onChangeText={setSenderPhone} />
            <View style={S.divider} />
            <TextInput style={S.input} placeholder="Địa chỉ chi tiết *" placeholderTextColor={T.textMuted} value={senderAddr} onChangeText={setSenderAddr} />
          </View>

          <Text style={[S.sectionTitle, { marginTop: 20 }]}>Thông tin giao hàng</Text>
          <View style={S.inputCard}>
            <TextInput style={S.input} placeholder="Tên người nhận *" placeholderTextColor={T.textMuted} value={receiverName} onChangeText={setReceiverName} />
            <View style={S.divider} />
            <TextInput style={S.input} placeholder="Số điện thoại *" placeholderTextColor={T.textMuted} keyboardType="phone-pad" value={receiverPhone} onChangeText={setReceiverPhone} />
            <View style={S.divider} />
            <TextInput style={S.input} placeholder="Địa chỉ chi tiết *" placeholderTextColor={T.textMuted} value={receiverAddr} onChangeText={setReceiverAddr} />
          </View>

          <Text style={[S.sectionTitle, { marginTop: 20 }]}>Loại xe & Gói hàng</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <TouchableOpacity style={[S.vBtn, vehicle === 'bike' && S.vBtnActive]} onPress={() => setVehicle('bike')}>
              <Text style={{ fontSize: 24, marginBottom: 5 }}>🏍️</Text>
              <Text style={S.vTitle}>Xe máy</Text>
              <Text style={S.vSub}>Dưới 20kg</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.vBtn, vehicle === 'truck' && S.vBtnActive]} onPress={() => setVehicle('truck')}>
              <Text style={{ fontSize: 24, marginBottom: 5 }}>🛻</Text>
              <Text style={S.vTitle}>Xe tải</Text>
              <Text style={S.vSub}>Hàng lớn</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={[S.inputCard, { height: 80, padding: 15, textAlignVertical: 'top' }]} placeholder="Ghi chú cho tài xế (VD: Hàng dễ vỡ, giao giờ hành chính...)" placeholderTextColor={T.textMuted} multiline value={note} onChangeText={setNote} />

          <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: T.textSub, fontSize: 13 }}>{baseDistanceKm > 0 ? `Tổng phí (${baseDistanceKm}km)` : 'Tạm tính'}</Text>
              <Text style={{ color: T.text, fontSize: 24, fontWeight: '800' }}>{formatMoney(calculatedPrice)}</Text>
            </View>
            <TouchableOpacity 
              style={[S.primaryBtn, !isFormValid && { backgroundColor: T.textMuted }]} 
              disabled={!isFormValid}
              onPress={() => {
                setState('finding');
                setTimeout(() => setState('tracking'), 3000);
              }}
            >
              <Text style={S.primaryBtnTxt}>ĐẶT GIAO HÀNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderFinding = () => {
    if (state !== 'finding') return null;
    return (
      <Animated.View entering={SlideInDown} style={[S.sheet, { alignItems: 'center', paddingVertical: 40 }]}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: T.accentSoft, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="search" size={40} color={T.accent} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: T.text, marginBottom: 8 }}>Đang tìm tài xế giao hàng...</Text>
        <Text style={{ fontSize: 14, color: T.textSub }}>Vui lòng đợi trong giây lát</Text>
      </Animated.View>
    );
  };

  const renderTracking = () => {
    if (state !== 'tracking') return null;
    return (
      <Animated.View entering={SlideInDown.springify()} style={S.sheet}>
        <View style={S.handle} />
        <View style={S.sheetContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: T.text }}>Đang đến lấy hàng</Text>
              <Text style={{ fontSize: 14, color: T.textSub }}>Dự kiến đến trong 5 phút</Text>
            </View>
            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: '#DC2626', fontWeight: '700' }}>GH-10293</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.cardAlt, padding: 15, borderRadius: 16 }}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: T.accent }} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>Trần Văn Giao</Text>
              <Text style={{ fontSize: 13, color: T.textSub }}>59-X2 123.45 • Honda Wave</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={S.actionIcon}><Ionicons name="chatbubble" size={20} color={T.accent} /></TouchableOpacity>
              <TouchableOpacity style={S.actionIcon}><Ionicons name="call" size={20} color={T.accent} /></TouchableOpacity>
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
              {renderHome()}
              {renderForm()}
              {renderFinding()}
              {renderTracking()}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 10, backgroundColor: 'rgba(255,255,255,0.9)' },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.card, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  topTitle: { fontSize: 18, fontWeight: '700', color: T.text },
  sheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: T.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: Platform.OS === 'ios' ? 40 : 20, shadowColor: '#000', shadowOffset: {width:0,height:-5}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  fullSheet: { position: 'absolute', bottom: 0, width: '100%', height: '85%', backgroundColor: T.card, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  handle: { width: 40, height: 5, backgroundColor: T.border, borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  sheetContent: { paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: T.accent, marginBottom: 8 },
  subtitle: { fontSize: 14, color: T.textSub, marginBottom: 24 },
  routeCard: { backgroundColor: T.cardAlt, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  routeLine: { width: 20, alignItems: 'center', marginRight: 15, gap: 4 },
  vLine: { width: 2, height: 30, backgroundColor: T.border },
  locBtn: { borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 12 },
  locLabel: { color: T.textSub, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  locVal: { color: T.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
  locValMuted: { color: T.textMuted, fontSize: 16, fontWeight: '500', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: T.text, marginBottom: 12 },
  inputCard: { backgroundColor: T.cardAlt, borderRadius: 16, borderWidth: 1, borderColor: T.border },
  input: { height: 50, paddingHorizontal: 15, fontSize: 15, color: T.text, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  divider: { height: 1, backgroundColor: T.border, marginHorizontal: 15 },
  vBtn: { flex: 1, backgroundColor: T.cardAlt, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  vBtnActive: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  vTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  vSub: { fontSize: 12, color: T.textSub },
  primaryBtn: { backgroundColor: T.accent, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
  primaryBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.accentSoft, justifyContent: 'center', alignItems: 'center' },
});
