import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, TextInput, useWindowDimensions,
  ScrollView, Image, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut, SlideInDown, SlideInUp } from 'react-native-reanimated';

type FoodState = 'home' | 'restaurant' | 'item' | 'cart' | 'tracking';

const T = {
  bg: '#F8FAFC', card: '#FFFFFF', cardAlt: '#F1F5F9',
  accent: '#D97706', accentSoft: '#FEF3C7',
  green: '#10B981', red: '#EF4444', text: '#0F172A',
  textSub: '#475569', textMuted: '#94A3B8', border: '#E2E8F0',
};

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'pizza', name: '🍕 Pizza' },
  { id: 'pho', name: '🍜 Bún/Phở' },
  { id: 'drink', name: '☕ Đồ Uống' },
];

const RESTAURANTS = [
  { id: '1', cat: 'pizza', name: "Pizza 4P's - Hai Bà Trưng", type: 'Pizza, Đồ Âu', rating: '4.8', time: '20 phút', dist: '1.2 km', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
  { id: '2', cat: 'pho', name: 'Phở Thìn Lò Đúc', type: 'Món Việt, Phở', rating: '4.5', time: '15 phút', dist: '0.8 km', img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80' },
  { id: '3', cat: 'drink', name: 'Katinat Saigon Kafe', type: 'Cafe, Trà Sữa', rating: '4.7', time: '10 phút', dist: '0.5 km', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
];

const MENU = [
  { id: 'm1', name: 'Pizza Burrata', price: 250000, desc: 'Pizza phô mai tươi đặc trưng', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80' },
  { id: 'm2', name: 'Mì Ý Hải Sản', price: 180000, desc: 'Sốt cà chua, tôm, mực, vẹm', img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=200&q=80' },
];

interface CartItem {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
  size: 'M' | 'L';
  sizePrice: number;
  note: string;
}

const formatMoney = (val: number) => val.toLocaleString('vi-VN') + 'đ';

export default function FoodScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  const [state, setState] = useState<FoodState>('home');
  const [activeCat, setActiveCat] = useState('all');
  
  // Item Options State
  const [selectedItem, setSelectedItem] = useState<typeof MENU[0] | null>(null);
  const [itemSize, setItemSize] = useState<'M'|'L'>('M');
  const [itemNote, setItemNote] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredRestaurants = useMemo(() => {
    if (activeCat === 'all') return RESTAURANTS;
    return RESTAURANTS.filter(r => r.cat === activeCat);
  }, [activeCat]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.basePrice + item.sizePrice) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openItem = (item: typeof MENU[0]) => {
    setSelectedItem(item);
    setItemSize('M');
    setItemNote('');
    setItemQty(1);
    setState('item');
  };

  const addToCart = () => {
    if (!selectedItem) return;
    const sizePrice = itemSize === 'L' ? 45000 : 0;
    
    // Check if exact same item exists in cart
    const existingIdx = cart.findIndex(c => c.id === selectedItem.id && c.size === itemSize && c.note === itemNote);
    
    if (existingIdx >= 0) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += itemQty;
      setCart(newCart);
    } else {
      setCart([...cart, {
        id: selectedItem.id,
        name: selectedItem.name,
        basePrice: selectedItem.price,
        quantity: itemQty,
        size: itemSize,
        sizePrice,
        note: itemNote
      }]);
    }
    setState('restaurant');
  };

  const renderTopBar = () => (
    <Animated.View entering={FadeInDown} exiting={FadeOut} style={S.topBar}>
      <TouchableOpacity style={S.topBtn} onPress={() => {
        if (state === 'tracking') router.replace('/transport');
        else if (state === 'cart') setState('restaurant');
        else if (state === 'item') setState('restaurant');
        else if (state === 'restaurant') setState('home');
        else router.replace('/transport');
      }}>
        <Ionicons name={state === 'home' ? "close" : "arrow-back"} size={24} color={T.text} />
      </TouchableOpacity>
      <Text style={S.topTitle}>{state === 'home' ? 'Giao Đồ Ăn' : state === 'cart' ? 'Giỏ Hàng' : state === 'tracking' ? 'Theo Dõi' : ''}</Text>
      <View style={{ width: 40 }} />
    </Animated.View>
  );

  const renderHome = () => {
    if (state !== 'home') return null;
    return (
      <Animated.View entering={FadeInDown} style={S.container}>
        <View style={S.searchRow}>
          <Ionicons name="search" size={20} color={T.textSub} />
          <TextInput placeholder="Tìm món ăn, nhà hàng..." style={S.searchInput} placeholderTextColor={T.textMuted} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.catList}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={[S.catBtn, activeCat === cat.id && S.catBtnActive]} onPress={() => setActiveCat(cat.id)}>
              <Text style={[S.catTxt, activeCat === cat.id && S.catTxtActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={S.sectionTitle}>Nhà hàng nổi bật</Text>
          {filteredRestaurants.length === 0 ? (
            <Text style={{ textAlign: 'center', color: T.textSub, marginTop: 20 }}>Không tìm thấy nhà hàng nào.</Text>
          ) : (
            filteredRestaurants.map(res => (
              <TouchableOpacity key={res.id} style={S.resCard} onPress={() => setState('restaurant')} activeOpacity={0.9}>
                <Image source={{ uri: res.img }} style={S.resImg} />
                <View style={S.resInfo}>
                  <Text style={S.resName}>{res.name}</Text>
                  <Text style={S.resType}>{res.type}</Text>
                  <View style={S.resMeta}>
                    <Ionicons name="star" size={14} color={T.accent} />
                    <Text style={S.resRating}>{res.rating}</Text>
                    <Ionicons name="time-outline" size={14} color={T.textSub} />
                    <Text style={S.resTime}>{res.time}</Text>
                    <Text style={S.resTime}> • {res.dist}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderRestaurant = () => {
    if (state !== 'restaurant') return null;
    return (
      <Animated.View entering={SlideInDown} style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bg, zIndex: 10 }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Image source={{ uri: RESTAURANTS[0].img }} style={{ width: '100%', height: 250 }} />
          <View style={S.resHeaderCard}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.text, marginBottom: 5 }}>{RESTAURANTS[0].name}</Text>
            <Text style={{ fontSize: 14, color: T.textSub, marginBottom: 15 }}>{RESTAURANTS[0].type}</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="star" size={18} color={T.accent} /><Text style={{ fontWeight: '700', marginLeft: 5 }}>{RESTAURANTS[0].rating}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="time" size={18} color={T.textSub} /><Text style={{ color: T.textSub, marginLeft: 5 }}>{RESTAURANTS[0].time}</Text></View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <Text style={S.sectionTitle}>Thực đơn</Text>
            {MENU.map(item => (
              <TouchableOpacity key={item.id} style={S.menuItem} onPress={() => openItem(item)}>
                <View style={{ flex: 1, paddingRight: 15 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 5 }}>{item.name}</Text>
                  <Text style={{ fontSize: 13, color: T.textSub, marginBottom: 10 }} numberOfLines={2}>{item.desc}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: T.text }}>{formatMoney(item.price)}</Text>
                </View>
                <Image source={{ uri: item.img }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                <View style={S.addBtn}><Ionicons name="add" size={20} color="#FFF" /></View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {cartCount > 0 && (
          <Animated.View entering={SlideInUp} style={S.floatingCart}>
            <TouchableOpacity style={S.cartBtnInner} onPress={() => setState('cart')}>
              <View style={S.cartBadge}><Text style={{ color: T.accent, fontWeight: '800' }}>{cartCount}</Text></View>
              <View style={{ flex: 1 }}><Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Giỏ hàng</Text></View>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18 }}>{formatMoney(cartTotal)}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderItemOptions = () => {
    if (state !== 'item' || !selectedItem) return null;
    const currentTotal = (selectedItem.price + (itemSize === 'L' ? 45000 : 0)) * itemQty;

    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 20, justifyContent: 'flex-end' }]}>
        <Animated.View entering={SlideInDown.springify()} style={[S.sheet, { height: '80%' }]}>
          <Image source={{ uri: selectedItem.img }} style={{ width: '100%', height: 200, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
          <TouchableOpacity style={{ position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 }} onPress={() => setState('restaurant')}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.text, marginBottom: 10 }}>{selectedItem.name}</Text>
            <Text style={{ fontSize: 14, color: T.textSub, marginBottom: 20 }}>{selectedItem.desc}</Text>

            <View style={S.optionGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>Chọn Kích cỡ</Text>
                <Text style={{ backgroundColor: T.accentSoft, color: T.accent, paddingHorizontal: 8, borderRadius: 5, fontSize: 12, fontWeight: '700', overflow: 'hidden' }}>BẮT BUỘC</Text>
              </View>
              <TouchableOpacity style={S.optionRow} onPress={() => setItemSize('M')}>
                <Text style={{ fontSize: 16, color: T.text }}>Size Vừa (M)</Text>
                <Ionicons name={itemSize === 'M' ? "radio-button-on" : "radio-button-off"} size={24} color={itemSize === 'M' ? T.accent : T.border} />
              </TouchableOpacity>
              <View style={S.divider} />
              <TouchableOpacity style={S.optionRow} onPress={() => setItemSize('L')}>
                <Text style={{ fontSize: 16, color: T.text }}>Size Lớn (L) <Text style={{ color: T.textSub }}>+45.000đ</Text></Text>
                <Ionicons name={itemSize === 'L' ? "radio-button-on" : "radio-button-off"} size={24} color={itemSize === 'L' ? T.accent : T.border} />
              </TouchableOpacity>
            </View>

            <View style={S.optionGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>Ghi chú đặc biệt</Text>
              </View>
              <TextInput 
                style={S.noteInput} 
                placeholder="VD: Không hành, không cay..." 
                placeholderTextColor={T.textMuted}
                value={itemNote}
                onChangeText={setItemNote}
              />
            </View>
          </ScrollView>

          <View style={S.footer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.cardAlt, borderRadius: 16, padding: 5, marginRight: 15 }}>
              <TouchableOpacity style={S.qtyBtn} onPress={() => setItemQty(q => Math.max(1, q - 1))}><Ionicons name="remove" size={20} /></TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '700', paddingHorizontal: 15 }}>{itemQty}</Text>
              <TouchableOpacity style={S.qtyBtn} onPress={() => setItemQty(q => q + 1)}><Ionicons name="add" size={20} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={[S.primaryBtn, { flex: 1 }]} onPress={addToCart}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Thêm {formatMoney(currentTotal)}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderCart = () => {
    if (state !== 'cart') return null;
    const shippingFee = 15000;
    const platformFee = 2000;
    const finalTotal = cartTotal + shippingFee + platformFee;

    return (
      <Animated.View entering={SlideInDown} style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bg, zIndex: 10 }]}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: Platform.OS === 'ios' ? 100 : 80, paddingBottom: 150 }}>
          <View style={S.cartCard}>
            <Text style={{ fontSize: 18, fontWeight: '800', borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 15, marginBottom: 15 }}>Chi tiết đơn hàng</Text>
            {cart.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 15 }}>
                <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: T.accentSoft, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                  <Text style={{ color: T.accent, fontWeight: '700' }}>{item.quantity}x</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Size {item.size === 'L' ? 'Lớn' : 'Vừa'}</Text>
                  {item.note ? <Text style={{ fontSize: 13, color: T.amber, marginTop: 2 }}>Ghi chú: {item.note}</Text> : null}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>{formatMoney((item.basePrice + item.sizePrice) * item.quantity)}</Text>
              </View>
            ))}
          </View>

          <View style={S.cartCard}>
            <View style={S.receiptRow}><Text style={S.receiptLabel}>Tạm tính ({cartCount} món)</Text><Text style={S.receiptVal}>{formatMoney(cartTotal)}</Text></View>
            <View style={S.receiptRow}><Text style={S.receiptLabel}>Phí giao hàng (1.2km)</Text><Text style={S.receiptVal}>{formatMoney(shippingFee)}</Text></View>
            <View style={S.receiptRow}><Text style={S.receiptLabel}>Phí nền tảng</Text><Text style={S.receiptVal}>{formatMoney(platformFee)}</Text></View>
            <View style={S.divider} />
            <View style={[S.receiptRow, { marginTop: 15 }]}><Text style={{ fontSize: 18, fontWeight: '800' }}>Tổng thanh toán</Text><Text style={{ fontSize: 20, fontWeight: '800', color: T.accent }}>{formatMoney(finalTotal)}</Text></View>
          </View>
        </ScrollView>
        
        <View style={[S.footer, { position: 'absolute', bottom: 0, width: '100%' }]}>
          <TouchableOpacity style={[S.primaryBtn, { flex: 1, backgroundColor: T.green }]} onPress={() => { setState('tracking'); setCart([]); }}>
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18 }}>ĐẶT ĐƠN</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderTracking = () => {
    if (state !== 'tracking') return null;
    return (
      <Animated.View entering={FadeInDown} style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bg, zIndex: 10 }]}>
        <Image source={{ uri: 'https://cdn.dribbble.com/users/2561280/screenshots/11545638/media/1b5eeb430d4b961eb4c6c9a8ea8d9299.png' }} style={{ width: '100%', height: '60%', opacity: 0.8 }} />
        
        <Animated.View entering={SlideInDown.springify()} style={[S.sheet, { height: '50%', backgroundColor: T.card }]}>
          <View style={S.handle} />
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.green, marginBottom: 8 }}>Nhà hàng đang chuẩn bị món</Text>
            <Text style={{ fontSize: 14, color: T.textSub, marginBottom: 20 }}>Dự kiến giao đến lúc 12:45</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.cardAlt, padding: 15, borderRadius: 16 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEFCE8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FEF08A' }}>
                <Text style={{ fontSize: 24 }}>👨‍🍳</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>Pizza 4P's</Text>
                <Text style={{ fontSize: 13, color: T.textSub }}>Đơn hàng #FD-9982</Text>
              </View>
              <TouchableOpacity style={S.actionIcon}><Ionicons name="call" size={20} color={T.accent} /></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={[S.safe, isDesktop && S.desktop]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            {renderTopBar()}
            {renderHome()}
            {renderRestaurant()}
            {renderItemOptions()}
            {renderCart()}
            {renderTracking()}
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
  topBar: { position: 'absolute', top: 0, width: '100%', zIndex: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderBottomWidth: 1, borderBottomColor: T.border },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.cardAlt, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '700', color: T.text },
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 100 : 80 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, marginHorizontal: 16, borderRadius: 16, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: T.text, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  catList: { paddingHorizontal: 16, paddingVertical: 15, gap: 10 },
  catBtn: { backgroundColor: T.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border },
  catBtnActive: { backgroundColor: T.accentSoft, borderColor: T.accent },
  catTxt: { color: T.textSub, fontWeight: '600' },
  catTxtActive: { color: T.accent, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: T.text, marginHorizontal: 16, marginTop: 10, marginBottom: 16 },
  resCard: { backgroundColor: T.card, marginHorizontal: 16, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: {width:0,height:5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  resImg: { width: '100%', height: 160 },
  resInfo: { padding: 16 },
  resName: { fontSize: 18, fontWeight: '800', color: T.text, marginBottom: 4 },
  resType: { fontSize: 14, color: T.textSub, marginBottom: 10 },
  resMeta: { flexDirection: 'row', alignItems: 'center' },
  resRating: { fontSize: 14, fontWeight: '700', marginLeft: 4, marginRight: 15 },
  resTime: { fontSize: 14, color: T.textSub, marginLeft: 4 },
  
  resHeaderCard: { backgroundColor: T.card, marginHorizontal: 16, marginTop: -40, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width:0,height:5}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  menuItem: { flexDirection: 'row', backgroundColor: T.card, padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: T.border },
  addBtn: { position: 'absolute', bottom: 15, right: 15, width: 32, height: 32, borderRadius: 16, backgroundColor: T.accent, justifyContent: 'center', alignItems: 'center' },
  floatingCart: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20, width: '100%', paddingHorizontal: 16 },
  cartBtnInner: { backgroundColor: T.accent, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: T.accent, shadowOffset: {width:0,height:8}, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  cartBadge: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 15 },
  
  sheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: {width:0,height:-5}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  handle: { width: 40, height: 5, backgroundColor: T.border, borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  optionGroup: { backgroundColor: T.cardAlt, borderRadius: 16, padding: 16, marginBottom: 15 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: T.border, marginVertical: 10 },
  noteInput: { backgroundColor: T.card, height: 50, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: T.border, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  footer: { flexDirection: 'row', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: T.card, borderTopWidth: 1, borderTopColor: T.border },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.card, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  primaryBtn: { backgroundColor: T.accent, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingVertical: 15 },
  
  cartCard: { backgroundColor: T.card, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: T.border },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  receiptLabel: { color: T.textSub, fontSize: 15 },
  receiptVal: { color: T.text, fontSize: 15, fontWeight: '600' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.accentSoft, justifyContent: 'center', alignItems: 'center' },
});
