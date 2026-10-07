import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  TextInput, Image, Modal, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFood } from '../../context/FoodContext';
import { foodService, FoodRestaurant } from '../../services/foodService';
import { useUser } from '../../context/UserContext';
import { notificationService } from '../../services/notificationService';

const CATEGORIES = [
  { id: 'rice', name: 'Cơm', icon: '🍚' },
  { id: 'noodle', name: 'Bún/Phở', icon: '🍜' },
  { id: 'banhmi', name: 'Bánh mì', icon: '🥖' },
  { id: 'milktea', name: 'Trà sữa', icon: '🧋' },
  { id: 'hotpot', name: 'Lẩu', icon: '🍲' },
  { id: 'bbq', name: 'Đồ nướng', icon: '🍢' },
  { id: 'fastfood', name: 'Fast Food', icon: '🍔' },
  { id: 'chicken', name: 'Gà rán', icon: '🍗' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'seafood', name: 'Hải sản', icon: '🦀' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'snack', name: 'Ăn vặt', icon: '🍟' },
  { id: 'coffee', name: 'Cà phê', icon: '☕' },
  { id: 'cake', name: 'Bánh ngọt', icon: '🍰' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'vegan', name: 'Món chay', icon: '🥦' },
];

const BANNERS = [
  { id: '1', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', title: 'Freeship mọi đơn từ 200k' },
  { id: '2', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', title: 'Giảm 50% Combo Pizza' },
];

const NEARBY_RESTAURANTS = [
  {
    id: 'rest_pizza_hub',
    name: 'The Pizza Company & Pasta - Thái Hà',
    type: 'Pizza, Mì Ý, Đồ Âu',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviews: '320+',
    distance: '1.8 km',
    time: '20-25 phút',
    promo: 'Freeship đơn 200k',
  },
  {
    id: 'rest_com_tam',
    name: 'Cơm Tấm Sài Gòn Xưa - Sườn Bì Chả',
    type: 'Cơm tấm, Món Việt',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviews: '540+',
    distance: '2.4 km',
    time: '25-30 phút',
    promo: 'Tặng canh rong biển',
  },
  {
    id: 'rest_tea_lab',
    name: 'Trà Sữa & Trà Hoa Quả Tươi Lab',
    type: 'Trà đào, Trà sữa, Ăn vặt',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviews: '210+',
    distance: '1.2 km',
    time: '15-20 phút',
    promo: 'Mua 2 tặng 1',
  },
];

export default function FoodHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const { cart, activeOrder, setCustomerCoords } = useFood();
  const { addresses } = useUser();
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];
  const userLat = defaultAddress?.latitude ?? 21.0055;
  const userLng = defaultAddress?.longitude ?? 105.8450;
  const currentAddressText = defaultAddress
    ? `${defaultAddress.detailAddress}, ${defaultAddress.ward}`
    : '18 Tạ Quang Bửu, Hai Bà Trưng';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [popularDishes, setPopularDishes] = useState<any[]>([]);
  const [isFetchingRestaurants, setIsFetchingRestaurants] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    setCustomerCoords({ lat: userLat, lng: userLng });
    let isMounted = true;
    (async () => {
      try {
        setIsFetchingRestaurants(true);
        // Ưu tiên tải dữ liệu từ Discovery Feed mới nhất
        const disc = await foodService.getDiscovery({ latitude: userLat, longitude: userLng, limit: 10 });
        if (isMounted && disc) {
          if (disc.nearby && disc.nearby.length > 0) {
            setRestaurants(disc.nearby);
          } else if (disc.featured && disc.featured.length > 0) {
            setRestaurants(disc.featured);
          }
          if (disc.popularDishes && disc.popularDishes.length > 0) {
            setPopularDishes(disc.popularDishes);
          }
        }
      } catch (err) {
        console.log('Lỗi tải Discovery Feed, fallback sang getRestaurants:', err);
        try {
          const fallbackData = await foodService.getRestaurants(userLat, userLng);
          if (isMounted && fallbackData && fallbackData.length > 0) {
            setRestaurants(fallbackData);
          }
        } catch (fbErr) {
          console.log('Lỗi tải danh sách quán fallback:', fbErr);
        }
      } finally {
        if (isMounted) setIsFetchingRestaurants(false);
      }
    })();

    notificationService.getUnreadCount().then((res) => {
      if (isMounted && res?.unreadCount !== undefined) {
        setUnreadNotifCount(res.unreadCount);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [userLat, userLng]);

  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Gemini AI Assistant State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<{
    dishName: string;
    restName: string;
    restId: string;
    reason: string;
    price: string;
    calories: string;
  } | null>(null);

  const QUICK_PROMPTS = [
    { title: '🥗 Eat Clean thanh đạm', query: 'Gợi ý món ăn ít calo, nhiều rau, tốt cho sức khỏe' },
    { title: '🌧️ Món nóng ngày mưa', query: 'Gợi ý món nóng hổi, cay thơm giải cảm' },
    { title: '💰 No nê dưới 50k', query: 'Gợi ý món ăn trưa no bụng giá dưới 50.000đ' },
    { title: '🍕 Tiệc tùng / Fastfood', query: 'Gợi ý món ăn vặt hoặc Pizza combo nhiều người' },
  ];

  const handleAskGemini = (customPrompt?: string) => {
    const q = customPrompt || aiQuery;
    if (!q) return;

    setAiLoading(true);
    setAiResult(null);

    // Mô phỏng Gemini AI xử lý ngôn ngữ tự nhiên thông minh
    setTimeout(() => {
      setAiLoading(false);
      if (q.includes('Clean') || q.includes('rau') || q.includes('ít calo')) {
        setAiResult({
          dishName: 'Salad Gà Nướng Mè Rang',
          restName: 'The Pizza Company & Pasta',
          restId: 'rest_pizza_hub',
          reason: 'Ức gà nướng mềm kết hợp sốt mè rang giàu đạm, chỉ 290 Kcal, thanh nhiệt cơ thể.',
          price: '75.000đ',
          calories: '290 Kcal',
        });
      } else if (q.includes('50k') || q.includes('dưới 50k')) {
        setAiResult({
          dishName: 'Trà Đào Cam Sả + Bánh Mì Bơ Tỏi',
          restName: 'The Pizza Company & Pasta',
          restId: 'rest_pizza_hub',
          reason: 'Combo ăn nhẹ giải khát mát lành trọn gói chỉ 45.000đ, phù hợp xế chiều.',
          price: '45.000đ',
          calories: '180 Kcal',
        });
      } else {
        setAiResult({
          dishName: 'Pizza Hải Sản Viền Phô Mai',
          restName: 'The Pizza Company & Pasta',
          restId: 'rest_pizza_hub',
          reason: 'Món bán chạy nhất khu vực với hải sản tươi giòn và lớp phô mai béo ngậy hảo hạng.',
          price: '185.000đ',
          calories: '450 Kcal',
        });
      }
    }, 900);
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient colors={['#FFF9F5', '#FFFFFF']} style={StyleSheet.absoluteFill} />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontFamily: 'Outfit' }]}>GIAO ĐỒ ĂN</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={accentColor} />
              <Text style={styles.locationText} numberOfLines={1}>{currentAddressText}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => router.push('/food/orders' as any)}
              accessibilityLabel="Đơn hàng của tôi"
            >
              <Ionicons name="receipt-outline" size={22} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => router.push('/food-merchant' as any)}
              accessibilityLabel="Kênh Quán Ăn"
            >
              <Ionicons name="storefront-outline" size={20} color="#F97316" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => router.push('/notifications' as any)}
              accessibilityLabel="Thông báo"
            >
              <Ionicons name="notifications-outline" size={22} color="#0F172A" />
              {unreadNotifCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.badgeText}>{unreadNotifCount > 99 ? '99+' : unreadNotifCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => router.push('/food/cart')}
            >
              <Ionicons name="cart-outline" size={24} color="#0F172A" />
              {totalCartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeText}>{totalCartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Order Banner (Nếu có đơn đang giao) */}
        {activeOrder && activeOrder.status !== 'COMPLETED' && (
          <TouchableOpacity 
            style={styles.activeOrderBanner}
            onPress={() => router.push({ pathname: '/food/tracking/[id]' as any, params: { id: activeOrder.orderCode } })}
          >
            <View style={styles.activeOrderIconWrap}>
              <Ionicons name="bicycle" size={18} color="#FFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.activeOrderTitle}>Đơn hàng {activeOrder.orderCode} đang thực hiện</Text>
              <Text style={styles.activeOrderSub}>Bấm để xem lộ trình tài xế trực tiếp</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Search Bar + AI Assistant Button */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity 
              style={styles.searchContainer}
              activeOpacity={0.85}
              onPress={() => router.push('/food/search' as any)}
            >
              <Ionicons name="search" size={20} color="#64748B" />
              <Text style={[styles.searchInput, { color: '#94A3B8', paddingTop: 2 }]}>
                Tìm món ngon, quán ăn, trà sữa...
              </Text>
              <TouchableOpacity 
                style={styles.aiTriggerBtn} 
                onPress={() => {
                  setAiModalVisible(true);
                  setAiResult(null);
                }}
              >
                <Ionicons name="sparkles" size={16} color="#FFF" />
                <Text style={styles.aiTriggerText}>Hỏi AI</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>

          {/* AI Suggestion Box */}
          <TouchableOpacity 
            style={styles.aiBannerBox}
            activeOpacity={0.9}
            onPress={() => {
              setAiModalVisible(true);
              setAiResult(null);
            }}
          >
            <View style={styles.aiBannerLeft}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#F97316" />
                <Text style={styles.aiBadgeText}>GEMINI AI ASSISTANT</Text>
              </View>
              <Text style={styles.aiBannerTitle}>Hôm nay bạn muốn ăn gì?</Text>
              <Text style={styles.aiBannerDesc}>Để AI gợi ý món ngon chuẩn vị theo khẩu vị và ngân sách của bạn</Text>
            </View>
            <View style={styles.aiBannerIconWrap}>
              <Ionicons name="restaurant" size={32} color="#F97316" />
            </View>
          </TouchableOpacity>

          {/* Banners Promo */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {BANNERS.map((banner) => (
                <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.85}>
                  <Image source={{ uri: banner.img }} style={styles.bannerImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.bannerGradient} />
                  <Text style={styles.bannerText}>{banner.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Categories Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục món ăn</Text>
          </View>

          <View style={styles.catsGrid}>
            {CATEGORIES.slice(0, 8).map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.catItem}
                onPress={() => router.push({ pathname: '/food/search' as any, params: { q: cat.name } })}
              >
                <View style={styles.catIconWrap}>
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.catName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nearby Restaurants List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quán ngon gần bạn</Text>
            <TouchableOpacity onPress={() => router.push('/food/search' as any)}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.restList}>
            {isFetchingRestaurants && restaurants.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator color={accentColor} size="large" />
                <Text style={{ marginTop: 8, color: '#64748B', fontSize: 13 }}>Đang tìm quán ngon gần bạn...</Text>
              </View>
            ) : (
              (restaurants.length > 0 ? restaurants : NEARBY_RESTAURANTS).map((rest: any) => (
                <TouchableOpacity 
                  key={rest.id}
                  style={styles.restCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/food/restaurant/${rest.id}` as any)}
                >
                  <Image source={{ uri: rest.avatar || rest.img }} style={styles.restImg} />
                  <View style={styles.restInfo}>
                    <Text style={styles.restName} numberOfLines={1}>{rest.name}</Text>
                    <Text style={styles.restType} numberOfLines={1}>{rest.address || rest.type || 'Món ngon mỗi ngày'}</Text>

                    <View style={styles.restMetaRow}>
                      <View style={styles.restMetaItem}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.restRating}>{rest.rating || 5.0} ({rest.totalReviews || rest.reviews || 100}+)</Text>
                      </View>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.restDist}>{rest.distanceKm ? `${rest.distanceKm} km` : (rest.distance || '1.5 km')}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.restTime}>{rest.estimatedTime || rest.time || '20-25 phút'}</Text>
                    </View>

                    <View style={styles.restPromoBadge}>
                      <Ionicons name="pricetag" size={11} color="#10B981" />
                      <Text style={styles.restPromoText}>
                        {rest.shippingFee === 0 ? 'Freeship đơn từ 200k' : `Phí ship từ ${(rest.shippingFee || 15000).toLocaleString('vi-VN')}đ`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Popular Dishes Slider */}
          {popularDishes.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Món ăn bán chạy hôm nay 🔥</Text>
                <TouchableOpacity onPress={() => router.push('/food/search' as any)}>
                  <Text style={styles.seeAllText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
              >
                {popularDishes.map((dish: any) => (
                  <TouchableOpacity
                    key={dish.id}
                    style={styles.popDishCard}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/food/restaurant/${dish.restaurantId}` as any)}
                  >
                    <Image
                      source={{
                        uri:
                          dish.image ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
                      }}
                      style={styles.popDishImg}
                    />
                    <View style={styles.popDishBody}>
                      <Text style={styles.popDishName} numberOfLines={1}>
                        {dish.name}
                      </Text>
                      <Text style={styles.popDishRest} numberOfLines={1}>
                        {dish.restaurantName}
                      </Text>
                      <View style={styles.popDishPriceRow}>
                        <Text style={styles.popDishPrice}>
                          {dish.price?.toLocaleString('vi-VN')}đ
                        </Text>
                        <View style={styles.popDishRating}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={styles.popDishRatingText}>
                            {dish.rating > 0 ? dish.rating.toFixed(1) : '5.0'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* ========================================================================= */}
        {/* GEMINI AI ASSISTANT MODAL ("HÔM NAY ĂN GÌ?")                              */}
        {/* ========================================================================= */}
        <Modal
          visible={aiModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAiModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAiModalVisible(false)} />
            
            <View style={styles.aiModalContent}>
              <View style={styles.dragIndicator} />
              
              <View style={styles.aiModalHeader}>
                <View style={styles.aiModalTitleRow}>
                  <Ionicons name="sparkles" size={20} color="#F97316" />
                  <Text style={styles.aiModalTitle}>Trợ Lý Ẩm Thực Gemini AI</Text>
                </View>
                <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.aiModalSub}>
                Chọn nhanh tâm trạng hoặc nhập mong muốn của bạn hôm nay:
              </Text>

              {/* Quick Prompts */}
              <View style={styles.quickPromptWrap}>
                {QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p.title}
                    style={styles.quickPromptBtn}
                    onPress={() => handleAskGemini(p.query)}
                  >
                    <Text style={styles.quickPromptText}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <View style={styles.aiInputRow}>
                <TextInput
                  style={styles.aiTextInput}
                  placeholder="Hoặc gõ món bạn muốn tìm (VD: cơm gà xé...)"
                  placeholderTextColor="#94A3B8"
                  value={aiQuery}
                  onChangeText={setAiQuery}
                  onSubmitEditing={() => handleAskGemini()}
                />
                <TouchableOpacity 
                  style={[styles.aiSendBtn, { backgroundColor: accentColor }]}
                  onPress={() => handleAskGemini()}
                >
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* AI Processing Loading */}
              {aiLoading && (
                <View style={styles.aiLoadingWrap}>
                  <ActivityIndicator size="small" color="#F97316" />
                  <Text style={styles.aiLoadingText}>Gemini AI đang tìm kiếm món phù hợp nhất...</Text>
                </View>
              )}

              {/* AI Recommendation Result */}
              {aiResult && !aiLoading && (
                <View style={styles.aiResultCard}>
                  <View style={styles.aiResultHeader}>
                    <Text style={styles.aiResultDish}>{aiResult.dishName}</Text>
                    <Text style={styles.aiResultPrice}>{aiResult.price}</Text>
                  </View>
                  <Text style={styles.aiResultRest}>Tại {aiResult.restName} • {aiResult.calories}</Text>
                  <Text style={styles.aiResultReason}>{aiResult.reason}</Text>

                  <TouchableOpacity 
                    style={[styles.aiOrderNowBtn, { backgroundColor: accentColor }]}
                    onPress={() => {
                      setAiModalVisible(false);
                      router.push(`/food/restaurant/${aiResult.restId}`);
                    }}
                  >
                    <Text style={styles.aiOrderNowText}>Xem Menu & Đặt Ngay</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 20 }} />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#020617', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', backgroundColor: '#F8FAFC' },
  desktopFrame: { maxWidth: 500, borderWidth: 1, borderColor: '#1E293B' },

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', 
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9' 
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', 
    justifyContent: 'center', alignItems: 'center', position: 'relative' 
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 11, color: '#64748B', maxWidth: 170 },
  badge: { 
    position: 'absolute', top: -2, right: -2, width: 18, height: 18, 
    borderRadius: 9, justifyContent: 'center', alignItems: 'center' 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  activeOrderBanner: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', 
    paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, 
    marginTop: 12, borderRadius: 14 
  },
  activeOrderIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  activeOrderTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  activeOrderSub: { color: '#94A3B8', fontSize: 11, marginTop: 1 },

  scrollContent: { paddingVertical: 12 },

  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    marginHorizontal: 16, borderRadius: 16, paddingHorizontal: 14, 
    height: 48, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', 
    shadowOpacity: 0.03, shadowRadius: 6 
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', marginLeft: 8 },
  aiTriggerBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F97316', 
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4 
  },
  aiTriggerText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  aiBannerBox: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: '#FFF7ED', marginHorizontal: 16, marginTop: 14, 
    borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#FED7AA' 
  },
  aiBannerLeft: { flex: 1, paddingRight: 10 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  aiBadgeText: { fontSize: 10, fontWeight: '800', color: '#F97316', letterSpacing: 0.5 },
  aiBannerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  aiBannerDesc: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  aiBannerIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },

  bannerScroll: { marginTop: 14 },
  bannerCard: { width: 280, height: 130, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerGradient: { ...StyleSheet.absoluteFill },
  bannerText: { position: 'absolute', bottom: 12, left: 14, right: 14, color: '#FFF', fontSize: 15, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  seeAllText: { fontSize: 13, color: '#F97316', fontWeight: '700' },

  catsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  catItem: { width: '25%', alignItems: 'center', marginBottom: 16 },
  catIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
  catEmoji: { fontSize: 26 },
  catName: { fontSize: 12, color: '#334155', fontWeight: '600', marginTop: 6 },

  restList: { paddingHorizontal: 16, gap: 14 },
  restCard: { 
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, 
    padding: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', 
    shadowOpacity: 0.03, shadowRadius: 8 
  },
  restImg: { width: 95, height: 95, borderRadius: 12 },
  restInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  restName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  restType: { fontSize: 12, color: '#64748B' },
  restMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  restRating: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  metaDot: { fontSize: 12, color: '#CBD5E1' },
  restDist: { fontSize: 12, color: '#64748B' },
  restTime: { fontSize: 12, color: '#64748B' },
  restPromoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  restPromoText: { fontSize: 11, fontWeight: '700', color: '#059669' },

  // AI Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { flex: 1 },
  aiModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  dragIndicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 14 },
  aiModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aiModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiModalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  aiModalSub: { fontSize: 13, color: '#64748B', marginBottom: 14 },

  quickPromptWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickPromptBtn: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  quickPromptText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  aiInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  aiTextInput: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, fontSize: 13, color: '#0F172A' },
  aiSendBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  aiLoadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  aiLoadingText: { fontSize: 13, color: '#F97316', fontWeight: '600' },

  aiResultCard: { backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FED7AA' },
  aiResultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiResultDish: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  aiResultPrice: { fontSize: 15, fontWeight: '800', color: '#F97316' },
  aiResultRest: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 8 },
  aiResultReason: { fontSize: 13, color: '#334155', lineHeight: 18, marginBottom: 14 },
  aiOrderNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 11 },
  aiOrderNowText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Popular Dishes Styles
  popDishCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  popDishImg: {
    width: '100%',
    height: 95,
    backgroundColor: '#F1F5F9',
  },
  popDishBody: {
    padding: 8,
  },
  popDishName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  popDishRest: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  popDishPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  popDishPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F97316',
  },
  popDishRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  popDishRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});
