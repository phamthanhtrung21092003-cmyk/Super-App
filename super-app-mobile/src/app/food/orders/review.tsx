import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../../services/foodService';

export default function FoodOrderReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = (params.orderId || params.id) as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Form State
  const [restaurantRating, setRestaurantRating] = useState<number>(5);
  const [restaurantComment, setRestaurantComment] = useState<string>('');

  const [driverRating, setDriverRating] = useState<number>(5);
  const [driverComment, setDriverComment] = useState<string>('');

  // Map menuItemId -> { rating, comment }
  const [itemReviews, setItemReviews] = useState<{ [key: string]: { rating: number; comment: string } }>({});

  useEffect(() => {
    if (orderId) {
      loadOrderAndReviewData();
    }
  }, [orderId]);

  const loadOrderAndReviewData = async () => {
    try {
      setLoading(true);
      const [orderData, reviewData] = await Promise.all([
        foodService.getOrderDetail(orderId),
        foodService.getOrderReviews(orderId).catch(() => null),
      ]);

      setOrder(orderData);

      if (reviewData?.isReviewed) {
        setExistingReview(reviewData);
      } else {
        // Khởi tạo mặc định 5 sao cho từng món ăn
        const initialItems: { [key: string]: { rating: number; comment: string } } = {};
        if (orderData?.items) {
          orderData.items.forEach((item: any) => {
            initialItems[item.menuItemId] = { rating: 5, comment: '' };
          });
        }
        setItemReviews(initialItems);
      }
    } catch (err: any) {
      console.error('Lỗi tải thông tin đơn hàng:', err);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng để đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemRatingChange = (menuItemId: string, rating: number) => {
    setItemReviews((prev) => ({
      ...prev,
      [menuItemId]: {
        ...prev[menuItemId],
        rating,
      },
    }));
  };

  const handleItemCommentChange = (menuItemId: string, comment: string) => {
    setItemReviews((prev) => ({
      ...prev,
      [menuItemId]: {
        ...prev[menuItemId],
        comment,
      },
    }));
  };

  const handleSubmitReview = async () => {
    if (!order) return;

    if (order.status !== 'COMPLETED') {
      Alert.alert('Chưa hoàn tất', 'Chỉ đơn hàng đã hoàn tất mới được phép gửi đánh giá.');
      return;
    }

    try {
      setSubmitting(true);

      const itemsPayload = Object.keys(itemReviews).map((menuItemId) => ({
        menuItemId,
        rating: itemReviews[menuItemId].rating || 5,
        comment: itemReviews[menuItemId].comment?.trim() || undefined,
      }));

      const payload = {
        restaurantRating,
        restaurantComment: restaurantComment.trim() || undefined,
        driverRating: order.driver ? driverRating : undefined,
        driverComment: order.driver ? driverComment.trim() || undefined : undefined,
        itemReviews: itemsPayload.length > 0 ? itemsPayload : undefined,
      };

      await foodService.submitOrderReviews(order.id, payload);

      Alert.alert(
        'Cảm ơn bạn! 🎉',
        'Đánh giá của bạn đã được ghi nhận và giúp V-Life nâng cao chất lượng dịch vụ mỗi ngày.',
        [
          {
            text: 'Đồng ý',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      console.error('Lỗi gửi đánh giá:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.';
      Alert.alert('Không thể gửi đánh giá', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (
    currentRating: number,
    onSelect: (stars: number) => void,
    size: number = 32
  ) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            activeOpacity={0.7}
            onPress={() => onSelect(star)}
            style={styles.starTouch}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={size}
              color={star <= currentRating ? '#F59E0B' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.loadingText}>Đang tải thông tin đánh giá...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Đánh giá đơn hàng</Text>
          <Text style={styles.headerSubtitle}>Mã đơn: #{order.orderCode}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Nếu đã review trước đó -> Chế độ xem lại */}
        {existingReview ? (
          <View style={styles.reviewedCard}>
            <View style={styles.reviewedHeader}>
              <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
              <Text style={styles.reviewedTitle}>Bạn đã đánh giá đơn hàng này</Text>
            </View>
            <Text style={styles.reviewedSub}>
              Cảm ơn những đóng góp quý giá của bạn dành cho nhà hàng và tài xế V-Life!
            </Text>

            {existingReview.restaurantReview && (
              <View style={styles.reviewSummaryBox}>
                <Text style={styles.summaryLabel}>Quán ăn: {order.restaurant?.name}</Text>
                <View style={styles.starRowSmall}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= existingReview.restaurantReview.rating ? 'star' : 'star-outline'}
                      size={18}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={styles.summaryStarText}>{existingReview.restaurantReview.rating}★</Text>
                </View>
                {existingReview.restaurantReview.comment ? (
                  <Text style={styles.summaryCommentText}>
                    "{existingReview.restaurantReview.comment}"
                  </Text>
                ) : null}
              </View>
            )}

            {existingReview.driverReview && (
              <View style={styles.reviewSummaryBox}>
                <Text style={styles.summaryLabel}>Tài xế: {order.driver?.fullName || 'Tài xế'}</Text>
                <View style={styles.starRowSmall}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= existingReview.driverReview.rating ? 'star' : 'star-outline'}
                      size={18}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={styles.summaryStarText}>{existingReview.driverReview.rating}★</Text>
                </View>
                {existingReview.driverReview.comment ? (
                  <Text style={styles.summaryCommentText}>
                    "{existingReview.driverReview.comment}"
                  </Text>
                ) : null}
              </View>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Quay lại chi tiết đơn</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 1. KHỐI ĐÁNH GIÁ NHÀ HÀNG */}
            <View style={styles.sectionCard}>
              <View style={styles.restaurantHeaderRow}>
                {order.restaurant?.avatar ? (
                  <Image source={{ uri: order.restaurant.avatar }} style={styles.restaurantAvatar} />
                ) : (
                  <View style={styles.restaurantPlaceholder}>
                    <Ionicons name="restaurant" size={22} color="#EA580C" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Đánh giá quán ăn</Text>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {order.restaurant?.name || 'Nhà hàng'}
                  </Text>
                </View>
              </View>

              <View style={styles.starRatingContainer}>
                {renderStarSelector(restaurantRating, setRestaurantRating, 34)}
                <Text style={styles.ratingHintText}>
                  {restaurantRating === 5 && 'Cực kỳ hài lòng ⭐⭐⭐⭐⭐'}
                  {restaurantRating === 4 && 'Hài lòng, món ăn ngon ⭐⭐⭐⭐'}
                  {restaurantRating === 3 && 'Bình thường ⭐⭐⭐'}
                  {restaurantRating === 2 && 'Chưa hài lòng ⭐⭐'}
                  {restaurantRating === 1 && 'Rất thất vọng ⭐'}
                </Text>
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ cảm nhận về hương vị món ăn, cách đóng gói..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                maxLength={500}
                value={restaurantComment}
                onChangeText={setRestaurantComment}
              />
            </View>

            {/* 2. KHỐI ĐÁNH GIÁ TÀI XẾ (NẾU CÓ) */}
            {order.driver && (
              <View style={styles.sectionCard}>
                <View style={styles.driverHeaderRow}>
                  <View style={styles.driverAvatarCircle}>
                    <Ionicons name="bicycle" size={22} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Đánh giá tài xế giao hàng</Text>
                    <Text style={styles.driverName}>
                      {order.driver?.fullName || 'Tài xế V-Life'}
                    </Text>
                  </View>
                </View>

                <View style={styles.starRatingContainer}>
                  {renderStarSelector(driverRating, setDriverRating, 34)}
                  <Text style={styles.ratingHintText}>
                    {driverRating === 5 && 'Giao rất nhanh, lịch sự, 5 sao ⭐⭐⭐⭐⭐'}
                    {driverRating === 4 && 'Giao đúng giờ, thân thiện ⭐⭐⭐⭐'}
                    {driverRating === 3 && 'Bình thường ⭐⭐⭐'}
                    {driverRating === 2 && 'Giao trễ hoặc thái độ chưa tốt ⭐⭐'}
                    {driverRating === 1 && 'Dịch vụ kém ⭐'}
                  </Text>
                </View>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Gửi lời khen hoặc góp ý tới tài xế giao hàng..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  maxLength={500}
                  value={driverComment}
                  onChangeText={setDriverComment}
                />
              </View>
            )}

            {/* 3. KHỐI ĐÁNH GIÁ TỪNG MÓN ĂN */}
            {order.items && order.items.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Chất lượng từng món ăn</Text>
                <Text style={styles.sectionSub}>Đánh giá các món để quán cải thiện menu</Text>

                {order.items.map((item: any, idx: number) => {
                  const currentItemReview = itemReviews[item.menuItemId] || { rating: 5, comment: '' };
                  const itemImg = item.menuItem?.image || item.menuItem?.imageUrl;

                  return (
                    <View key={item.id || idx} style={styles.itemReviewRow}>
                      <View style={styles.itemHeaderLine}>
                        {itemImg ? (
                          <Image source={{ uri: itemImg }} style={styles.itemThumb} />
                        ) : (
                          <View style={styles.itemThumbPlaceholder}>
                            <Ionicons name="fast-food-outline" size={16} color="#94A3B8" />
                          </View>
                        )}
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>

                      <View style={styles.itemStarRow}>
                        {renderStarSelector(
                          currentItemReview.rating,
                          (stars) => handleItemRatingChange(item.menuItemId, stars),
                          24
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      {!existingReview && (
        <View style={styles.footerBar}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            disabled={submitting}
            onPress={handleSubmitReview}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>GỬI ĐÁNH GIÁ</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            disabled={submitting}
            onPress={() => router.back()}
          >
            <Text style={styles.skipButtonText}>Để sau</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  restaurantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  restaurantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  restaurantPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  restaurantName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  driverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  driverAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  starRatingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starTouch: {
    padding: 4,
  },
  ratingHintText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    marginTop: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  itemReviewRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itemThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  itemThumbPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemStarRow: {
    alignItems: 'flex-start',
  },
  footerBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  reviewedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  reviewedSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  starRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  summaryStarText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  summaryCommentText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
  },
  doneBtn: {
    marginTop: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});
