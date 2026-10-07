import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../services/foodService';
import { useFood, FoodCartItem } from '../../context/FoodContext';

type TabKey = 'ALL' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

interface TabOption {
  key: TabKey;
  label: string;
}

const TABS: TabOption[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export default function UserFoodOrdersScreen() {
  const router = useRouter();
  const { replaceCartWithItems } = useFood();

  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (tab: TabKey, pageNum: number, isRefresh = false) => {
    if (pageNum === 1) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await foodService.getUserOrders({
        page: pageNum,
        limit: 10,
        tab,
      });

      if (res && Array.isArray(res.orders)) {
        if (pageNum === 1) {
          setOrders(res.orders);
        } else {
          setOrders((prev) => [...prev, ...res.orders]);
        }
        setHasMore(res.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (error: any) {
      console.error('Error fetching food orders:', error);
      Alert.alert('Thông báo', 'Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab, 1);
  }, [activeTab, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(activeTab, 1, true);
  };

  const onLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(activeTab, page + 1);
    }
  };

  // Helper hiển thị trạng thái tiếng Việt và màu sắc
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Đang xác nhận', bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' as const };
      case 'CONFIRMED':
        return { label: 'Quán đã nhận', bg: '#DBEAFE', color: '#1D4ED8', icon: 'checkmark-circle-outline' as const };
      case 'PREPARING':
        return { label: 'Đang chuẩn bị', bg: '#EDE9FE', color: '#6D28D9', icon: 'restaurant-outline' as const };
      case 'FINDING_DRIVER':
        return { label: 'Đang tìm tài xế', bg: '#E0F2FE', color: '#0284C7', icon: 'search-outline' as const };
      case 'DRIVER_ACCEPTED':
        return { label: 'Tài xế đang đến', bg: '#CCFBF1', color: '#0F766E', icon: 'bicycle-outline' as const };
      case 'PICKED_UP':
        return { label: 'Đang giao hàng', bg: '#E0E7FF', color: '#4338CA', icon: 'navigate-outline' as const };
      case 'COMPLETED':
        return { label: 'Hoàn thành', bg: '#DCFCE7', color: '#15803D', icon: 'checkmark-done-circle-outline' as const };
      case 'CANCELLED':
        return { label: 'Đã hủy', bg: '#FEE2E2', color: '#B91C1C', icon: 'close-circle-outline' as const };
      default:
        return { label: status, bg: '#F1F5F9', color: '#475569', icon: 'ellipse-outline' as const };
    }
  };

  // Helper hiển thị phương thức thanh toán
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Tiền mặt khi nhận';
      case 'WALLET':
        return 'Ví V-Life';
      case 'VIETQR':
        return 'Chuyển khoản VietQR';
      default:
        return method || 'Tiền mặt';
    }
  };

  // Format tiền tệ Việt Nam
  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // Format ngày giờ Việt Nam
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} - ${day}/${month}/${year}`;
  };

  // Xử lý Hủy đơn (chỉ cho phép khi PENDING)
  const handleCancelOrder = (order: any) => {
    Alert.alert(
      'Xác nhận hủy đơn',
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.orderCode}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingOrderId(order.id);
              await foodService.cancelOrder(order.id, 'Người dùng chủ động hủy trên danh sách');
              Alert.alert('Thành công', 'Đơn hàng đã được hủy.');
              // Refresh danh sách
              fetchOrders(activeTab, 1, true);
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || 'Không thể hủy đơn.';
              Alert.alert('Lỗi', msg);
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ]
    );
  };

  // Xử lý Mua lại (Re-order)
  const handleReorder = async (order: any) => {
    try {
      setReorderingOrderId(order.id);
      const checkRes = await foodService.checkReorder(order.id);

      if (!checkRes.isRestaurantAvailable) {
        Alert.alert(
          'Không thể đặt lại',
          checkRes.unavailableReason || 'Nhà hàng hiện đang đóng cửa hoặc tạm ngừng nhận đơn.'
        );
        return;
      }

      if (!checkRes.validItems || checkRes.validItems.length === 0) {
        Alert.alert('Thông báo', 'Tất cả các món trong đơn hàng này hiện đã ngừng bán hoặc hết hàng.');
        return;
      }

      // Chuẩn bị danh sách Cart Items
      const targetRestaurant = {
        id: checkRes.restaurant.id,
        name: checkRes.restaurant.name,
        address: checkRes.restaurant.address,
        avatar: checkRes.restaurant.avatar,
        latitude: order.restaurant?.latitude || 21.0285,
        longitude: order.restaurant?.longitude || 105.8542,
      };

      const newCartItems: FoodCartItem[] = checkRes.validItems.map((item) => {
        const sizePrice = item.optionsJson?.size?.price || 0;
        const toppingSum = (item.optionsJson?.toppings || []).reduce((s: number, t: any) => s + (t.price || 0), 0);
        const unitPrice = item.basePrice + sizePrice + toppingSum;
        const cartItemId = `${item.menuItemId}_${item.optionsJson?.size?.name || 'def'}_${item.optionsJson?.toppings?.map((t: any) => t.name).join(',') || 'none'}`;

        return {
          cartItemId,
          menuItemId: item.menuItemId,
          name: item.name,
          basePrice: item.basePrice,
          image: item.image,
          quantity: item.quantity,
          size: item.optionsJson?.size,
          toppings: item.optionsJson?.toppings || [],
          notes: item.notes,
          itemUnitPrice: unitPrice,
          totalPrice: unitPrice * item.quantity,
        };
      });

      // Cập nhật vào giỏ hàng
      replaceCartWithItems(newCartItems, targetRestaurant);

      if (checkRes.unavailableItems && checkRes.unavailableItems.length > 0) {
        const unavailNames = checkRes.unavailableItems.map((u) => u.name).join(', ');
        Alert.alert(
          'Lưu ý món hết hàng',
          `Các món sau đã hết hàng và không được thêm vào giỏ: ${unavailNames}`,
          [
            {
              text: 'Đến giỏ hàng',
              onPress: () => router.push('/food/cart'),
            },
          ]
        );
      } else {
        router.push('/food/cart');
      }
    } catch (err: any) {
      console.error('Reorder error:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể thực hiện mua lại lúc này.';
      Alert.alert('Lỗi', msg);
    } finally {
      setReorderingOrderId(null);
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status);
    const restaurantName = item.restaurant?.name || 'Nhà hàng V-Life';
    const restaurantAvatar = item.restaurant?.avatar;
    const itemsCount = item.items?.length || 0;
    const firstTwoItems = item.items?.slice(0, 2) || [];
    const remainingCount = itemsCount > 2 ? itemsCount - 2 : 0;
    const isLive = ['PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP'].includes(item.status);

    return (
      <View style={styles.card}>
        {/* Card Header: Quán + Status */}
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/food/orders/[id]', params: { id: item.id } })}
        >
          <View style={styles.restaurantRow}>
            {restaurantAvatar ? (
              <Image source={{ uri: restaurantAvatar }} style={styles.restaurantAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="restaurant" size={18} color="#F97316" />
              </View>
            )}
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurantName}
              </Text>
              <Text style={styles.orderCodeTime}>
                #{item.orderCode} • {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={13} color={badge.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Card Body: Tóm tắt món */}
        <TouchableOpacity
          style={styles.cardBody}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/food/orders/[id]', params: { id: item.id } })}
        >
          {firstTwoItems.map((food: any, idx: number) => (
            <View key={food.id || idx} style={styles.foodRow}>
              <Text style={styles.foodQuantity}>{food.quantity}x</Text>
              <Text style={styles.foodName} numberOfLines={1}>
                {food.name}
              </Text>
              <Text style={styles.foodPrice}>{formatMoney(food.totalPrice || food.price * food.quantity)}</Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <Text style={styles.remainingText}>+ {remainingCount} món khác...</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Card Footer: Tổng tiền + Nút hành động */}
        <View style={styles.cardFooter}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethodText}>
              <Ionicons name="card-outline" size={12} color="#64748B" /> {getPaymentMethodLabel(item.paymentMethod)}
            </Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalAmount}>{formatMoney(item.totalAmount)}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {/* Nút Xem chi tiết */}
            <TouchableOpacity
              style={styles.detailButton}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/food/orders/[id]', params: { id: item.id } })}
            >
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>

            {/* Nút Theo dõi nếu đang giao */}
            {isLive && (
              <TouchableOpacity
                style={styles.trackButton}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/food/tracking/[id]', params: { id: item.id } })}
              >
                <Ionicons name="navigate" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.trackButtonText}>Theo dõi</Text>
              </TouchableOpacity>
            )}

            {/* Nút Đánh giá / Đã đánh giá nếu hoàn thành */}
            {item.status === 'COMPLETED' && (
              <TouchableOpacity
                style={item.isReviewed ? styles.reviewedButton : styles.reviewButton}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/food/orders/review' as any, params: { orderId: item.id } })}
              >
                <Ionicons
                  name={item.isReviewed ? 'checkmark-circle' : 'star'}
                  size={13}
                  color={item.isReviewed ? '#16A34A' : '#D97706'}
                  style={{ marginRight: 4 }}
                />
                <Text style={item.isReviewed ? styles.reviewedButtonText : styles.reviewButtonText}>
                  {item.isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Nút Đặt lại nếu hoàn thành */}
            {item.status === 'COMPLETED' && (
              <TouchableOpacity
                style={styles.reorderButton}
                activeOpacity={0.8}
                disabled={reorderingOrderId === item.id}
                onPress={() => handleReorder(item)}
              >
                {reorderingOrderId === item.id ? (
                  <ActivityIndicator size="small" color="#F97316" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={14} color="#F97316" style={{ marginRight: 4 }} />
                    <Text style={styles.reorderButtonText}>Đặt lại</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Nút Hủy đơn nếu còn PENDING */}
            {item.status === 'PENDING' && (
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                disabled={cancellingOrderId === item.id}
                onPress={() => handleCancelOrder(item)}
              >
                {cancellingOrderId === item.id ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    let emptyMessage = 'Bạn chưa có đơn đặt món nào.';
    if (activeTab === 'PROCESSING') emptyMessage = 'Không có đơn hàng nào đang xử lý.';
    if (activeTab === 'COMPLETED') emptyMessage = 'Bạn chưa có đơn hàng nào hoàn thành.';
    if (activeTab === 'CANCELLED') emptyMessage = 'Không có đơn hàng nào đã hủy.';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
        <Text style={styles.emptySubtitle}>{emptyMessage}</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          activeOpacity={0.8}
          onPress={() => router.push('/food')}
        >
          <Ionicons name="fast-food" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.exploreButtonText}>Khám phá món ngon ngay</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <TouchableOpacity
          style={styles.headerAction}
          activeOpacity={0.7}
          onPress={() => router.push('/food')}
        >
          <Ionicons name="search" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Danh sách đơn hàng */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F97316']}
              tintColor="#F97316"
            />
          }
          ListEmptyComponent={renderEmptyState}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#F97316" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerAction: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    //
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#F97316',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  restaurantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  orderCodeTime: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  foodQuantity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
    width: 26,
  },
  foodName: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  foodPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  remainingText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  cardFooter: {
    padding: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 12,
    color: '#475569',
    marginRight: 6,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F97316',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  reviewedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  reviewedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  reorderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
