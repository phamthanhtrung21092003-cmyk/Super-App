import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, StatusBar, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const HOMESTAY_DETAILS: Record<string, any> = {
  '1': {
    id: '1', name: 'The K’ho Homestay', rating: 4.8, reviews: 210, price: 650000, 
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
      'https://images.unsplash.com/photo-1542314831-c6a4d1424164?w=800',
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800'
    ],
    description: 'Nằm lặng lẽ giữa đồi thông mộng mơ của Đà Lạt, The K’ho Homestay là một không gian vintage bằng gỗ với tầm nhìn bao quát thung lũng, nơi lý tưởng để săn mây vào buổi sáng.',
    amenities: ['Wifi miễn phí', 'Phòng bếp chung', 'Lò sưởi', 'Sân vườn BBQ', 'Chỗ đỗ xe', 'Cho thuê xe máy'],
    aiSuggestion: 'Homestay này cực kỳ phù hợp cho các cặp đôi thích sự yên tĩnh, lãng mạn. Tuy nhiên đường vào hơi dốc, bạn nên cân nhắc nếu tay lái yếu.',
    publicReviews: [
      { id: 'r1', user: 'Minh Tuấn', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', rating: 5, date: '2 ngày trước', text: 'View siêu đỉnh, sáng dậy mở cửa ra là thấy mây bay vào tận giường. Anh chủ rất nhiệt tình hỗ trợ đốt lửa trại buổi tối.' },
      { id: 'r2', user: 'Hoài Phương', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', rating: 4, date: '1 tuần trước', text: 'Homestay đẹp, vintage. Tuy nhiên đường vào hơi khó đi vào ban đêm do dốc và tối. Nên đi vào lúc trời sáng.' },
      { id: 'r3', user: 'Tuấn Cường', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', rating: 5, date: '2 tuần trước', text: 'Cực kỳ thích hợp cho cặp đôi, yên tĩnh và riêng tư. Bữa sáng đơn giản nhưng ngon lành.' }
    ]
  }
};

export default function HomestayDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const home = HOMESTAY_DETAILS[id as string] || HOMESTAY_DETAILS['1'];
  const width = Dimensions.get('window').width;
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel/homestay');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={S.imageHeader}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={S.mainImageScroll}
          >
            {home.images.map((img: string, idx: number) => (
              <Image key={idx} source={{ uri: img }} style={[S.mainImage, { width }]} />
            ))}
          </ScrollView>
          <View style={S.imageBadge}>
            <Text style={S.imageBadgeText}>{activeImageIndex + 1}/{home.images.length}</Text>
          </View>
        </View>

        <View style={S.content}>
          <View style={S.titleRow}>
            <Text style={S.name}>{home.name}</Text>
            <View style={S.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={S.ratingTxtBadge}>{home.rating}</Text>
            </View>
          </View>
          <Text style={S.description}>{home.description}</Text>

          {/* AI SUGGESTION */}
          <View style={S.aiBox}>
            <View style={S.aiHeader}>
              <Ionicons name="bulb" size={18} color="#D97706" />
              <Text style={S.aiTitle}>AI Đánh giá phù hợp</Text>
            </View>
            <Text style={S.aiText}>{home.aiSuggestion}</Text>
          </View>

          {/* AMENITIES */}
          <Text style={S.sectionTitle}>Tiện nghi Homestay</Text>
          <View style={S.amenitiesGrid}>
            {home.amenities.map((amenity: string, i: number) => (
              <View key={i} style={S.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#DB2777" />
                <Text style={S.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* PUBLIC REVIEWS */}
          <Text style={S.sectionTitle}>Bình luận của khách ({home.reviews})</Text>
          <View style={S.reviewsContainer}>
            {home.publicReviews.map((review: any) => (
              <View key={review.id} style={S.reviewCard}>
                <View style={S.reviewHeader}>
                  <Image source={{ uri: review.avatar }} style={S.reviewAvatar} />
                  <View style={S.reviewUserBox}>
                    <Text style={S.reviewUserName}>{review.user}</Text>
                    <Text style={S.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={S.reviewRatingBox}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={S.reviewRatingTxt}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={S.reviewText}>{review.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={S.viewAllReviewsBtn}>
              <Text style={S.viewAllReviewsTxt}>Xem tất cả 210 bình luận</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={S.headerGradient}>
        <SafeAreaView>
          <View style={S.headerBtns}>
            <TouchableOpacity onPress={handleBack} style={S.iconBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={S.iconBtn}>
              <Ionicons name="heart-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* BOTTOM ACTION BAR */}
      <View style={S.bottomBar}>
        <View style={S.priceInfo}>
          <Text style={S.priceValue}>{home.price.toLocaleString('vi-VN')}đ<Text style={S.priceUnit}>/đêm</Text></Text>
          <Text style={S.totalDays}>Giá tốt nhất hiện tại</Text>
        </View>
        <TouchableOpacity style={S.bookBtn} onPress={() => router.push({ pathname: '/travel/checkout', params: { type: 'homestay', id: home.id, price: home.price, name: home.name } } as any)}>
          <Text style={S.bookBtnText}>Đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  imageHeader: { position: 'relative', height: 300 },
  mainImageScroll: { width: '100%', height: '100%' },
  mainImage: { width: Platform.OS === 'web' ? 400 : 400, height: '100%' }, // Fallback, will be replaced with screen width below
  imageBadge: { position: 'absolute', bottom: 36, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, zIndex: 10 },
  imageBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, elevation: 10 },
  headerBtns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  
  content: { padding: 16, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingTxtBadge: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  description: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },

  aiBox: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FEF3C7', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#B45309' },
  aiText: { fontSize: 14, color: '#92400E', lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, width: '47%', gap: 8 },
  amenityText: { fontSize: 13, color: '#334155', flex: 1 },

  reviewsContainer: { gap: 16, marginBottom: 24 },
  reviewCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 12 },
  reviewUserBox: { flex: 1 },
  reviewUserName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  reviewDate: { fontSize: 12, color: '#64748B' },
  reviewRatingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, gap: 2 },
  reviewRatingTxt: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  reviewText: { fontSize: 14, color: '#334155', lineHeight: 22 },
  viewAllReviewsBtn: { alignItems: 'center', paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
  viewAllReviewsTxt: { color: '#0F172A', fontSize: 14, fontWeight: '600' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  priceInfo: { flex: 1 },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#DB2777' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#64748B' },
  totalDays: { fontSize: 13, color: '#64748B' },
  bookBtn: { backgroundColor: '#DB2777', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
