import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image,
  Modal, TextInput, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Extrapolate, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useFood, FoodCartItem, FoodRestaurant, calculateDistanceKm } from '@/context/FoodContext';
import { foodService } from '@/services/foodService';

interface RawMenuItem {
  id: string;
  cat: string;
  name: string;
  desc: string;
  price: number;
  oldPrice?: number;
  img: string;
  calories?: string;
  sizes: { name: string; price: number }[];
  toppings: { name: string; price: number }[];
}

const HEADER_HEIGHT = 220;

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { 
    cart, 
    restaurant: currentCartRest, 
    addToCart, 
    subtotal,
    customerCoords,
    conflictModalVisible,
    confirmReplaceRestaurantCart,
    cancelReplaceRestaurantCart
  } = useFood();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<RawMenuItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>('Tất cả');

  // Tải thông tin quán và menu từ Backend
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const restId = Array.isArray(id) ? id[0] : (id || '');
        if (!restId) {
          setErrorMsg('Không tìm thấy thông tin quán ăn');
          setLoading(false);
          return;
        }

        const data = await foodService.getRestaurantDetail(restId);
        if (!isMounted) return;

        setRestaurantData(data);

        // Trích xuất Categories và Menu Items từ Database thật
        const cats: string[] = ['Tất cả'];
        const items: RawMenuItem[] = [];

        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((cat: any) => {
            if (cat.name && !cats.includes(cat.name)) {
              cats.push(cat.name);
            }

            if (cat.items && Array.isArray(cat.items)) {
              cat.items.forEach((item: any) => {
                // Phân tích Size và Topping từ OptionGroups trong DB
                const sizes: { name: string; price: number }[] = [];
                const toppings: { name: string; price: number }[] = [];

                if (item.optionGroups && Array.isArray(item.optionGroups)) {
                  item.optionGroups.forEach((grp: any) => {
                    const grpName = (grp.name || '').toLowerCase();
                    const isSizeGroup = grp.type === 'SINGLE' || grpName.includes('size') || grpName.includes('cỡ');
                    
                    if (grp.options && Array.isArray(grp.options)) {
                      grp.options.forEach((opt: any) => {
                        const optObj = { name: opt.name, price: Number(opt.price || 0) };
                        if (isSizeGroup) {
                          sizes.push(optObj);
                        } else {
                          toppings.push(optObj);
                        }
                      });
                    }
                  });
                }

                if (sizes.length === 0) {
                  sizes.push({ name: 'Tiêu chuẩn', price: 0 });
                }

                items.push({
                  id: item.id,
                  cat: cat.name,
                  name: item.name,
                  desc: item.description || '',
                  price: Number(item.price || item.basePrice || 0),
                  oldPrice: item.originalPrice ? Number(item.originalPrice) : (item.oldPrice ? Number(item.oldPrice) : undefined),
                  img: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
                  calories: item.calories,
                  sizes,
                  toppings,
                });
              });
            }
          });
        }

        setMenuCategories(cats);
        setMenuItems(items);
        if (cats.length > 1) {
          setActiveCat(cats[0]); // Mặc định 'Tất cả'
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg = err.response?.data?.message || err.message || 'Không thể tải thông tin quán ăn';
        setErrorMsg(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentRestaurant: FoodRestaurant = {
    id: restaurantData?.id || (typeof id === 'string' ? id : 'rest_unknown'),
    name: restaurantData?.name || 'Quán ăn V-Life',
    address: restaurantData?.address || '',
    avatar: restaurantData?.avatar || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    coverImage: restaurantData?.coverImage,
    latitude: restaurantData?.latitude || 21.0118,
    longitude: restaurantData?.longitude || 105.8195,
  };

  // Tính khoảng cách GPS thật từ tọa độ khách
  const realDistanceKm = restaurantData 
    ? calculateDistanceKm(customerCoords.lat, customerCoords.lng, restaurantData.latitude, restaurantData.longitude)
    : 1.5;
  const scrollY = useSharedValue(0);

  // State cho Interactive Bottom Sheet chọn Option món
  const [selectedItem, setSelectedItem] = useState<RawMenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chosenSize, setChosenSize] = useState<{ name: string; price: number }>({ name: '', price: 0 });
  const [chosenToppings, setChosenToppings] = useState<{ name: string; price: number }[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.3, 1], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, -(HEADER_HEIGHT / 2)], Extrapolate.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  // Mở Bottom Sheet khi bấm vào món
  const handleOpenItemSheet = (item: RawMenuItem) => {
    setSelectedItem(item);
    setChosenSize(item.sizes[0] || { name: 'Mặc định', price: 0 });
    setChosenToppings([]);
    setItemQuantity(1);
    setItemNotes('');
    setModalVisible(true);
  };

  // Toggle chọn topping
  const toggleTopping = (top: { name: string; price: number }) => {
    setChosenToppings(prev => 
      prev.some(t => t.name === top.name) 
        ? prev.filter(t => t.name !== top.name)
        : [...prev, top]
    );
  };

  // Tính tổng tiền trong modal
  const modalTotalPrice = selectedItem 
    ? (selectedItem.price + chosenSize.price + chosenToppings.reduce((s, t) => s + t.price, 0)) * itemQuantity
    : 0;

  // Xác nhận thêm vào giỏ
  const handleConfirmAddToCart = () => {
    if (!selectedItem) return;

    addToCart(
      {
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        basePrice: selectedItem.price,
        image: selectedItem.img,
        quantity: itemQuantity,
        size: chosenSize,
        toppings: chosenToppings,
        notes: itemNotes.trim() ? itemNotes.trim() : undefined,
      },
      currentRestaurant
    );

    setModalVisible(false);
  };

  const totalCartCount = cart.reduce((sum: number, item: FoodCartItem) => sum + item.quantity, 0);

  if (loading) {
    return (
      <View style={[styles.webWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={{ marginTop: 16, color: '#64748B', fontSize: 15, fontWeight: '600' }}>
          Đang tải thực đơn quán ăn...
        </Text>
      </View>
    );
  }

  if (errorMsg || !restaurantData) {
    return (
      <View style={[styles.webWrapper, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' }}>
          {errorMsg || 'Không thể hiển thị quán ăn'}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: accentColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Quay lại trang Đồ Ăn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.webWrapper}>
      <View style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Top Header Icons */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="heart-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView 
          onScroll={onScroll} 
          scrollEventThrottle={16} 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        >
          {/* Parallax Header */}
          <View style={{ height: HEADER_HEIGHT }}>
            <Animated.Image 
              source={{ uri: restaurantData.coverImage || restaurantData.avatar || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' }} 
              style={[StyleSheet.absoluteFill, headerStyle]} 
            />
            <LinearGradient colors={['rgba(255,255,255,0.05)', '#F8FAFC']} style={StyleSheet.absoluteFill} />
          </View>

          <View style={styles.content}>
            {/* Info Card */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.infoCard}>
              <Text style={styles.resName}>{currentRestaurant.name}</Text>
              <Text style={styles.resType} numberOfLines={2}>
                {restaurantData.address} • {restaurantData.isActive ? 'Đang mở cửa' : 'Tạm đóng cửa'}
              </Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.metaText, { color: '#0F172A', fontWeight: 'bold' }]}>
                    {(restaurantData.rating || 4.8).toFixed(1)} <Text style={{ color: '#64748B', fontWeight: 'normal' }}>({restaurantData.totalReviews || 120}+)</Text>
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>{restaurantData.estimatedTime || '20 - 30 phút'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>~{realDistanceKm} km</Text>
                </View>
              </View>
              
              <View style={styles.promoRow}>
                <View style={[styles.promoTag, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="flash" size={12} color="#10B981" />
                  <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>
                    {realDistanceKm <= 3 ? 'Freeship đơn từ 200k (≤3km)' : `Freeship đơn từ ${(200000 + Math.round((realDistanceKm - 3) * 100000)).toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Sticky Category Tabs */}
            {menuCategories.length > 0 && (
              <View style={styles.stickyMenuCats}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
                  {menuCategories.map(cat => {
                    const isCatActive = activeCat === cat;
                    return (
                      <TouchableOpacity 
                        key={cat} 
                        style={[styles.catBtn, isCatActive && { backgroundColor: accentColor, borderColor: accentColor }]}
                        onPress={() => setActiveCat(cat)}
                      >
                        <Text style={[styles.catText, isCatActive && { color: '#FFF', fontWeight: '700' }]}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Items List */}
            <View style={styles.itemList}>
              {menuItems.filter(item => activeCat === 'Tất cả' || item.cat === activeCat).map((item, idx) => (
                <Animated.View key={item.id} entering={FadeInUp.delay(idx * 40).duration(300)}>
                  <TouchableOpacity 
                    style={styles.itemCard}
                    activeOpacity={0.8}
                    onPress={() => handleOpenItemSheet(item)}
                  >
                    <Image source={{ uri: item.img }} style={styles.itemImg} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                      
                      <View style={styles.priceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                          <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                          {item.oldPrice && <Text style={styles.itemOldPrice}>{item.oldPrice.toLocaleString('vi-VN')}đ</Text>}
                        </View>
                        
                        <View style={styles.addBtn}>
                          <Ionicons name="add" size={20} color="#FFF" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={{ height: cart.length > 0 ? 120 : 60 }} />
          </View>
        </Animated.ScrollView>

        {/* Floating Cart Bottom Bar */}
        {cart.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.floatCartWrap}>
            <TouchableOpacity 
              style={[styles.floatCartBtn, { backgroundColor: accentColor }]}
              activeOpacity={0.9}
              onPress={() => router.push('/food/cart')}
            >
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{totalCartCount}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.floatCartTitle}>Xem giỏ hàng ({totalCartCount} món)</Text>
                <Text style={styles.floatCartSub}>Tổng tạm tính: {subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>
              <Ionicons name="arrow-forward" size={22} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE BOTTOM SHEET (MODAL TÙY CHỌN TOPPING/SIZE NGAY TẠI TRANG)     */}
        {/* ========================================================================= */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={() => setModalVisible(false)} 
            />
            
            <View style={styles.modalSheet}>
              {/* Sheet Drag Indicator */}
              <View style={styles.dragIndicator} />

              {selectedItem && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                  {/* Item Summary Header */}
                  <View style={styles.sheetItemHeader}>
                    <Image source={{ uri: selectedItem.img }} style={styles.sheetItemImg} />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.sheetItemName}>{selectedItem.name}</Text>
                      <Text style={styles.sheetItemDesc} numberOfLines={2}>{selectedItem.desc}</Text>
                      <Text style={styles.sheetItemPrice}>{selectedItem.price.toLocaleString('vi-VN')}đ</Text>
                    </View>
                  </View>

                  {/* Chọn Size */}
                  {selectedItem.sizes.length > 0 && (
                    <View style={styles.optionSection}>
                      <View style={styles.optionSectionHeader}>
                        <Text style={styles.optionSectionTitle}>Chọn kích cỡ (Size)</Text>
                        <Text style={styles.reqBadge}>Bắt buộc chọn 1</Text>
                      </View>
                      {selectedItem.sizes.map((sz) => {
                        const isChosen = chosenSize.name === sz.name;
                        return (
                          <TouchableOpacity
                            key={sz.name}
                            style={[styles.optionRow, isChosen && styles.optionRowActive]}
                            onPress={() => setChosenSize(sz)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <View style={[styles.radioCircle, isChosen && { borderColor: accentColor }]}>
                                {isChosen && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
                              </View>
                              <Text style={[styles.optionText, isChosen && { fontWeight: '700', color: '#0F172A' }]}>
                                {sz.name}
                              </Text>
                            </View>
                            <Text style={styles.optionPrice}>
                              {sz.price > 0 ? `+${sz.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Chọn Topping thêm */}
                  {selectedItem.toppings.length > 0 && (
                    <View style={styles.optionSection}>
                      <View style={styles.optionSectionHeader}>
                        <Text style={styles.optionSectionTitle}>Topping ăn kèm</Text>
                        <Text style={styles.optBadge}>Tùy chọn</Text>
                      </View>
                      {selectedItem.toppings.map((top) => {
                        const isChosen = chosenToppings.some(t => t.name === top.name);
                        return (
                          <TouchableOpacity
                            key={top.name}
                            style={[styles.optionRow, isChosen && styles.optionRowActive]}
                            onPress={() => toggleTopping(top)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <View style={[styles.checkboxBox, isChosen && { backgroundColor: accentColor, borderColor: accentColor }]}>
                                {isChosen && <Ionicons name="checkmark" size={14} color="#FFF" />}
                              </View>
                              <Text style={[styles.optionText, isChosen && { fontWeight: '700', color: '#0F172A' }]}>
                                {top.name}
                              </Text>
                            </View>
                            <Text style={styles.optionPrice}>
                              +{top.price.toLocaleString('vi-VN')}đ
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Ghi chú cho quán */}
                  <View style={styles.optionSection}>
                    <Text style={styles.optionSectionTitle}>Ghi chú cho quán</Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="VD: Không lấy hành tây, ít đá, nhiều tương ớt..."
                      placeholderTextColor="#94A3B8"
                      value={itemNotes}
                      onChangeText={setItemNotes}
                    />
                  </View>
                </ScrollView>
              )}

              {/* Action Bar Footer */}
              <View style={styles.sheetFooter}>
                <View style={styles.sheetQtyBox}>
                  <TouchableOpacity 
                    style={styles.sheetQtyBtn}
                    onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#0F172A" />
                  </TouchableOpacity>
                  <Text style={styles.sheetQtyText}>{itemQuantity}</Text>
                  <TouchableOpacity 
                    style={styles.sheetQtyBtn}
                    onPress={() => setItemQuantity(itemQuantity + 1)}
                  >
                    <Ionicons name="add" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.sheetConfirmBtn, { backgroundColor: accentColor }]}
                  onPress={handleConfirmAddToCart}
                >
                  <Text style={styles.sheetConfirmText}>
                    Thêm vào giỏ • {modalTotalPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL CẢNH BÁO XUNG ĐỘT QUÁN ĂN (QUY TẮC 1 QUÁN CỐT LÕI)                  */}
        {/* ========================================================================= */}
        <Modal
          visible={conflictModalVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelReplaceRestaurantCart}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <View style={styles.alertIconWrap}>
                <Ionicons name="restaurant" size={32} color="#F97316" />
              </View>
              <Text style={styles.alertTitle}>Tạo giỏ hàng mới?</Text>
              <Text style={styles.alertDesc}>
                Giỏ hàng của bạn đang có món từ quán <Text style={{ fontWeight: 'bold' }}>{currentCartRest?.name}</Text>. 
                Nếu thêm món từ quán này, giỏ hàng hiện tại sẽ bị xóa.
              </Text>
              
              <View style={styles.alertBtnRow}>
                <TouchableOpacity 
                  style={styles.alertCancelBtn}
                  onPress={cancelReplaceRestaurantCart}
                >
                  <Text style={styles.alertCancelText}>Giữ giỏ cũ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.alertConfirmBtn, { backgroundColor: accentColor }]}
                  onPress={confirmReplaceRestaurantCart}
                >
                  <Text style={styles.alertConfirmText}>Làm mới giỏ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  desktopFrame: { maxWidth: 500, borderWidth: 1, borderColor: '#1E293B' },

  topBar: { 
    position: 'absolute', top: Platform.OS === 'ios' ? 44 : 20, left: 16, right: 16, 
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', 
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, 
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 } 
  },

  content: { paddingHorizontal: 16, marginTop: -40 },
  infoCard: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, 
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } 
  },
  resName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  resType: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  
  metaRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748B' },

  promoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  promoTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },

  stickyMenuCats: { backgroundColor: '#F8FAFC', paddingVertical: 4 },
  catBtn: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' 
  },
  catText: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  itemList: { gap: 12, marginTop: 10 },
  itemCard: { 
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 12, 
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.03, 
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 } 
  },
  itemImg: { width: 90, height: 90, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#F97316' },
  itemOldPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },

  floatCartWrap: { 
    position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 20 
  },
  floatCartBtn: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, 
    borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } 
  },
  cartCountBadge: { 
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center' 
  },
  cartCountText: { fontSize: 14, fontWeight: '800', color: '#F97316' },
  floatCartTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  floatCartSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Bottom Sheet Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { flex: 1 },
  modalSheet: { 
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, 
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20, shadowColor: '#000', 
    shadowOpacity: 0.2, shadowRadius: 15 
  },
  dragIndicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 14 },
  
  sheetItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetItemImg: { width: 70, height: 70, borderRadius: 12 },
  sheetItemName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  sheetItemDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  sheetItemPrice: { fontSize: 16, fontWeight: '800', color: '#F97316', marginTop: 4 },

  optionSection: { marginBottom: 18 },
  optionSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  optionSectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  reqBadge: { fontSize: 11, fontWeight: '700', color: '#F97316', backgroundColor: '#F9731615', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  optBadge: { fontSize: 11, fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  
  optionRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, 
    borderColor: '#E2E8F0', marginBottom: 8 
  },
  optionRowActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  checkboxBox: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  optionText: { fontSize: 14, color: '#334155' },
  optionPrice: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  noteInput: { 
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, 
    paddingVertical: 10, fontSize: 13, color: '#0F172A', marginTop: 6 
  },

  sheetFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sheetQtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, height: 46 },
  sheetQtyBtn: { width: 40, height: 46, justifyContent: 'center', alignItems: 'center' },
  sheetQtyText: { fontSize: 16, fontWeight: '800', color: '#0F172A', minWidth: 24, textAlign: 'center' },
  sheetConfirmBtn: { flex: 1, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sheetConfirmText: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  // Conflict Alert Box
  alertOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24 },
  alertBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 22, width: '100%', maxWidth: 360, alignItems: 'center' },
  alertIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  alertTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  alertDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  alertBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  alertCancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  alertCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  alertConfirmBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertConfirmText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
});
