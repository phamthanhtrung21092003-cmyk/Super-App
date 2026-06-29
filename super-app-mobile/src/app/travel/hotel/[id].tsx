import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

const HOTEL_DETAILS: Record<string, any> = {
  '1': {
    id: '1', name: 'InterContinental Phú Quốc', rating: 5.0, reviews: 1240, 
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    description: 'Nằm ẩn mình bên bờ biển Bãi Kem tuyệt đẹp, InterContinental mang đến trải nghiệm nghỉ dưỡng sang trọng bậc nhất với các tiện nghi đẳng cấp 5 sao quốc tế.',
    amenities: ['Hồ bơi vô cực', 'Bãi biển riêng', 'Spa xịn', 'Phòng Gym', 'Kid Club', 'Nhà hàng 5 sao'],
    aiPros: ['Bãi biển riêng cực đẹp và sạch sẽ', 'Buffet sáng đa dạng, ngon miệng', 'Nhân viên thân thiện, chuyên nghiệp'],
    aiCons: ['Vị trí hơi xa trung tâm (Dương Đông)', 'Giá các dịch vụ tại resort khá cao'],
    publicReviews: [
      { id: 'r1', user: 'Hoàng Lan', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', rating: 5, date: '3 ngày trước', text: 'Resort siêu đẹp, nhân viên phục vụ tận tình 10 điểm. Ăn sáng rất ngon và nhiều món. Hồ bơi view thẳng ra biển cực đỉnh.' },
      { id: 'r2', user: 'Trần Nam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating: 4, date: '2 tuần trước', text: 'Phòng ốc rộng rãi, sạch sẽ. Điểm trừ duy nhất là giá đồ ăn trong nhà hàng của resort hơi đắt so với mặt bằng chung.' },
      { id: 'r3', user: 'Lê Yến', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', rating: 5, date: '1 tháng trước', text: 'Khu vui chơi trẻ em (Kid Club) rất tuyệt, các bé nhà mình chơi cả ngày không chán. Một kỳ nghỉ trọn vẹn!' }
    ],
    rooms: [
      { id: 'r1', name: 'Classic Room Ocean View', price: 4200000, beds: '1 Giường đôi lớn', capacity: '2 Người lớn', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
      { id: 'r2', name: 'Family Suite with Pool', price: 8500000, beds: '1 Giường đôi, 2 Giường đơn', capacity: '4 Người lớn, 2 Trẻ em', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
    ]
  }
};

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const hotel = HOTEL_DETAILS[id as string] || HOTEL_DETAILS['1'];

  const handleBooking = (roomName: string, price: number) => {
    router.push({ pathname: '/travel/checkout', params: { type: 'hotel', id: hotel.id, name: hotel.name, roomName, price } } as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/travel/hotel');
    }
  };

  return (
    <View style={[S.root, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER IMAGE */}
        <View style={S.imageHeader}>
          <Image source={{ uri: hotel.image }} style={S.mainImage} />
        </View>

        <View style={S.content}>
          {/* HOTEL INFO */}
          <View style={S.titleRow}>
            <Text style={S.hotelName}>{hotel.name}</Text>
            <View style={S.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={S.ratingTxtBadge}>{hotel.rating}</Text>
            </View>
          </View>
          <Text style={S.reviewSummary}>Dựa trên {hotel.reviews} đánh giá từ khách hàng</Text>
          <Text style={S.description}>{hotel.description}</Text>

          {/* AI REVIEW ANALYSIS */}
          <Text style={S.sectionTitle}>AI Phân tích Đánh giá</Text>
          <View style={S.aiBox}>
            <View style={S.aiHeader}>
              <Ionicons name="sparkles" size={18} color="#8B5CF6" />
              <Text style={S.aiTitle}>Tóm tắt từ 1,240 bình luận</Text>
            </View>
            <View style={S.aiColumns}>
              <View style={S.aiCol}>
                <Text style={S.proTitle}><Ionicons name="thumbs-up" size={14} color="#10B981"/> Ưu điểm</Text>
                {hotel.aiPros.map((p: string, i: number) => (
                  <Text key={i} style={S.aiText}>• {p}</Text>
                ))}
              </View>
              <View style={S.aiDivider} />
              <View style={S.aiCol}>
                <Text style={S.conTitle}><Ionicons name="thumbs-down" size={14} color="#EF4444"/> Nhược điểm</Text>
                {hotel.aiCons.map((c: string, i: number) => (
                  <Text key={i} style={S.aiText}>• {c}</Text>
                ))}
              </View>
            </View>
          </View>

          {/* AMENITIES */}
          <Text style={S.sectionTitle}>Tiện nghi nổi bật</Text>
          <View style={S.amenitiesGrid}>
            {hotel.amenities.map((amenity: string, i: number) => (
              <View key={i} style={S.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                <Text style={S.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* ROOMS */}
          <Text style={S.sectionTitle}>Chọn phòng</Text>
          {hotel.rooms.map((room: any) => (
            <View key={room.id} style={S.roomCard}>
              <Image source={{ uri: room.image }} style={S.roomImage} />
              <View style={S.roomInfo}>
                <Text style={S.roomName}>{room.name}</Text>
                <View style={S.roomSpecRow}>
                  <Ionicons name="bed-outline" size={16} color="#64748B" />
                  <Text style={S.roomSpecTxt}>{room.beds}</Text>
                </View>
                <View style={S.roomSpecRow}>
                  <Ionicons name="people-outline" size={16} color="#64748B" />
                  <Text style={S.roomSpecTxt}>{room.capacity}</Text>
                </View>
                
                <View style={S.roomPriceRow}>
                  <View>
                    <Text style={S.priceValue}>{room.price.toLocaleString('vi-VN')}đ</Text>
                    <Text style={S.priceUnit}>/đêm (Chưa thuế phí)</Text>
                  </View>
                  <TouchableOpacity style={S.bookBtn} onPress={() => handleBooking(room.name, room.price)}>
                    <Text style={S.bookBtnText}>Chọn</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* PUBLIC REVIEWS */}
          <Text style={S.sectionTitle}>Bình luận của khách ({hotel.reviews})</Text>
          <View style={S.reviewsContainer}>
            {hotel.publicReviews.map((review: any) => (
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
              <Text style={S.viewAllReviewsTxt}>Xem tất cả {hotel.reviews} bình luận</Text>
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
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={S.iconBtn}><Ionicons name="share-social-outline" size={22} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={S.iconBtn}><Ionicons name="heart-outline" size={22} color="#FFF" /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  imageHeader: { position: 'relative', height: 300 },
  mainImage: { width: '100%', height: '100%' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, elevation: 10 },
  headerBtns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  
  content: { padding: 16, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  hotelName: { fontSize: 24, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingTxtBadge: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  reviewSummary: { fontSize: 14, color: '#3B82F6', fontWeight: '500', marginBottom: 16 },
  description: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  
  aiBox: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EDE9FE', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#6D28D9' },
  aiColumns: { flexDirection: 'row' },
  aiCol: { flex: 1 },
  aiDivider: { width: 1, backgroundColor: '#DDD6FE', marginHorizontal: 12 },
  proTitle: { fontSize: 14, fontWeight: '700', color: '#059669', marginBottom: 8 },
  conTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
  aiText: { fontSize: 13, color: '#4C1D95', marginBottom: 6, lineHeight: 18 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, width: '47%', gap: 8 },
  amenityText: { fontSize: 13, color: '#334155', flex: 1 },

  roomCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  roomImage: { width: '100%', height: 160 },
  roomInfo: { padding: 16 },
  roomName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  roomSpecRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  roomSpecTxt: { fontSize: 14, color: '#475569' },
  roomPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#EF4444' },
  priceUnit: { fontSize: 12, color: '#64748B' },
  bookBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  bookBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

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
});
