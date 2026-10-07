import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../services/foodService';

export default function MerchantReviewsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  // Filters
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest'>('latest');

  useEffect(() => {
    loadReviews();
  }, [selectedRating, sortBy]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await foodService.getMerchantReviews({
        page: 1,
        limit: 20,
        rating: selectedRating,
        sort: sortBy,
      });
      setData(res);
    } catch (err: any) {
      console.error('Lỗi tải đánh giá nhà hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const renderStarBar = (stars: number, count: number, total: number) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
      <View key={stars} style={styles.breakdownRow}>
        <Text style={styles.breakdownStarLabel}>{stars}★</Text>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.breakdownCountLabel}>{count}</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => {
    const dateFormatted = new Date(item.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="person" size={18} color="#0066FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.user?.fullName || 'Khách hàng V-Life'}</Text>
            <Text style={styles.reviewDate}>{dateFormatted}</Text>
          </View>
          <View style={styles.starBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.starBadgeText}>{item.rating}★</Text>
          </View>
        </View>

        {item.comment ? (
          <Text style={styles.reviewComment}>"{item.comment}"</Text>
        ) : (
          <Text style={styles.noCommentText}>Khách hàng chỉ gửi số sao, không để lại nhận xét.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Đánh Giá Khách Hàng</Text>
          <Text style={styles.headerSub}>Phản hồi chất lượng món ăn & phục vụ</Text>
        </View>
      </View>

      {/* Thống kê Tổng quan (Summary) */}
      {data?.ratingSummary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeftCol}>
            <Text style={styles.averageRatingNumber}>
              {Number(data.ratingSummary.averageRating).toFixed(1)}
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= Math.round(data.ratingSummary.averageRating) ? 'star' : 'star-outline'}
                  size={14}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>
              {data.ratingSummary.totalReviews} đánh giá
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRightCol}>
            {[5, 4, 3, 2, 1].map((s) =>
              renderStarBar(
                s,
                data.ratingSummary.starBreakdown?.[s] || 0,
                data.ratingSummary.totalReviews || 1
              )
            )}
          </View>
        </View>
      )}

      {/* Filter Tabs (Số sao) */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedRating === undefined && styles.filterChipActive]}
            onPress={() => setSelectedRating(undefined)}
          >
            <Text style={[styles.filterChipText, selectedRating === undefined && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          {[5, 4, 3, 2, 1].map((stars) => (
            <TouchableOpacity
              key={stars}
              style={[styles.filterChip, selectedRating === stars && styles.filterChipActive]}
              onPress={() => setSelectedRating(selectedRating === stars ? undefined : stars)}
            >
              <Ionicons
                name="star"
                size={12}
                color={selectedRating === stars ? '#FFFFFF' : '#F59E0B'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterChipText, selectedRating === stars && styles.filterChipTextActive]}>
                {stars} sao
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sắp xếp */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'latest' && styles.sortBtnActive]}
          onPress={() => setSortBy('latest')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'latest' && styles.sortBtnTextActive]}>Mới nhất</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'highest' && styles.sortBtnActive]}
          onPress={() => setSortBy('highest')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'highest' && styles.sortBtnTextActive]}>Sao cao</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'lowest' && styles.sortBtnActive]}
          onPress={() => setSortBy('lowest')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'lowest' && styles.sortBtnTextActive]}>Sao thấp</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.reviews || []}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
              <Text style={styles.emptySub}>
                Khi khách hàng hoàn tất đơn và gửi nhận xét, đánh giá sẽ xuất hiện tại đây.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  backBtn: {
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
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  averageRatingNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalReviewsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 70,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  summaryRightCol: {
    flex: 1,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownStarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    width: 24,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  breakdownCountLabel: {
    fontSize: 11,
    color: '#94A3B8',
    width: 22,
    textAlign: 'right',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#0066FF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#475569',
  },
  sortBtnTextActive: {
    color: '#0066FF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  starBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  reviewComment: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  noCommentText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
