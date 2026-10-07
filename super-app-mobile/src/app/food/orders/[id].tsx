import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../../services/foodService';
import { foodSocketService, FoodOrderStatusChangedPayload } from '../../../services/foodSocketService';
import { useFood, FoodCartItem } from '../../../context/FoodContext';

export default function UserOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { replaceCartWithItems } = useFood();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Modal Hủy đơn
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Tải chi tiết đơn hàng
  const loadOrderDetail = useCallback(async (isRefresh = false) => {
    if (!id) return;
    if (!isRefresh) setLoading(true);

    try {
      const data = await foodService.getOrderDetail(id);
      setOrder(data);
    } catch (err: any) {
      console.error('Error loading order detail:', err);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  // Kết nối Realtime Socket
  useEffect(() => {
    if (!order?.id) return;

    let isMounted = true;

    // Kết nối socket và join room đơn hàng
    foodSocketService.connect().then(() => {
      if (!isMounted) return;
      foodSocketService.joinOrder(order.id);
    });

    // Lắng nghe trạng thái thay đổi
    const unsubStatus = foodSocketService.onOrderStatusChanged((payload: FoodOrderStatusChangedPayload) => {
      if (payload.orderId === order.id) {
        setOrder((prev: any) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            status: payload.status,
            paymentStatus: payload.paymentStatus || prev.paymentStatus,
          };
          if (payload.driver) {
            updated.driver = payload.driver;
          }
          if (payload.status === 'CONFIRMED') updated.confirmedAt = payload.timestamp;
          if (payload.status === 'PREPARING') updated.preparingAt = payload.timestamp;
          if (payload.status === 'FINDING_DRIVER') updated.readyAt = payload.timestamp;
          if (payload.status === 'PICKED_UP') updated.pickedUpAt = payload.timestamp;
          if (payload.status === 'COMPLETED') updated.completedAt = payload.timestamp;
          if (payload.status === 'CANCELLED') {
            updated.cancelledAt = payload.timestamp;
            updated.cancelledReason = payload.reason;
            updated.cancelledBy = payload.cancelledBy;
          }
          return updated;
        });
      }
    });

    // Lắng nghe tài xế nhận đơn
    const unsubDriver = foodSocketService.onDriverAssigned((payload: any) => {
      if (payload.orderId === order.id && payload.driver) {
        setOrder((prev: any) => (prev ? { ...prev, driver: payload.driver, driverId: payload.driver.id } : prev));
      }
    });

    return () => {
      isMounted = false;
      if (order?.id) {
        foodSocketService.leaveOrder(order.id);
      }
      unsubStatus();
      unsubDriver();
    };
  }, [order?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderDetail(true);
  };

  // Helper định dạng tiền
  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // Helper định dạng ngày giờ
  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} - ${day}/${month}/${year}`;
  };

  // Gọi điện
  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) {
      Alert.alert('Thông báo', 'Số điện thoại không khả dụng');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Lỗi', 'Không thể khởi chạy cuộc gọi');
    });
  };

  // Hủy đơn hàng
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Yêu cầu', 'Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    setCancelling(true);
    try {
      await foodService.cancelOrder(order.id, cancelReason.trim());
      setCancelModalVisible(false);
      setCancelReason('');
      Alert.alert('Thành công', 'Đơn hàng đã được hủy');
      loadOrderDetail(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể hủy đơn hàng';
      Alert.alert('Lỗi', msg);
    } finally {
      setCancelling(false);
    }
  };

  // Mua lại (Re-order)
  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);

    try {
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
      const msg = err.response?.data?.message || err.message || 'Không thể đặt lại lúc này.';
      Alert.alert('Lỗi', msg);
    } finally {
      setReordering(false);
    }
  };

  // Helper trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Đang xác nhận', bg: '#FEF3C7', color: '#D97706' };
      case 'CONFIRMED':
        return { label: 'Quán đã tiếp nhận', bg: '#DBEAFE', color: '#1D4ED8' };
      case 'PREPARING':
        return { label: 'Đang chế biến', bg: '#EDE9FE', color: '#6D28D9' };
      case 'FINDING_DRIVER':
        return { label: 'Đang tìm tài xế', bg: '#E0F2FE', color: '#0284C7' };
      case 'DRIVER_ACCEPTED':
        return { label: 'Tài xế đang đến quán', bg: '#CCFBF1', color: '#0F766E' };
      case 'PICKED_UP':
        return { label: 'Đang giao tới bạn', bg: '#E0E7FF', color: '#4338CA' };
      case 'COMPLETED':
        return { label: 'Giao hàng thành công', bg: '#DCFCE7', color: '#15803D' };
      case 'CANCELLED':
        return { label: 'Đã hủy đơn', bg: '#FEE2E2', color: '#B91C1C' };
      default:
        return { label: status, bg: '#F1F5F9', color: '#475569' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
          <Text style={styles.backButtonSimpleText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isPending = order.status === 'PENDING';
  const isCompleted = order.status === 'COMPLETED';
  const isLive = ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP'].includes(order.status);

  // Các bước Timeline
  const timelineSteps = [
    {
      key: 'CREATED',
      title: 'Đã đặt đơn',
      time: order.createdAt,
      desc: 'Đơn hàng được gửi tới quán',
      active: true,
      done: Boolean(order.createdAt),
      icon: 'receipt-outline' as const,
    },
    {
      key: 'CONFIRMED',
      title: 'Quán xác nhận',
      time: order.confirmedAt,
      desc: 'Quán đã tiếp nhận món',
      active: Boolean(order.confirmedAt) || ['CONFIRMED', 'PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status),
      done: Boolean(order.confirmedAt),
      icon: 'storefront-outline' as const,
    },
    {
      key: 'PREPARING',
      title: 'Đang nấu',
      time: order.preparingAt,
      desc: 'Đầu bếp đang chuẩn bị món',
      active: Boolean(order.preparingAt) || ['PREPARING', 'FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status),
      done: Boolean(order.preparingAt),
      icon: 'restaurant-outline' as const,
    },
    {
      key: 'READY',
      title: 'Tìm tài xế',
      time: order.readyAt,
      desc: 'Món đã sẵn sàng giao',
      active: Boolean(order.readyAt) || ['FINDING_DRIVER', 'DRIVER_ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(order.status),
      done: Boolean(order.readyAt),
      icon: 'bicycle-outline' as const,
    },
    {
      key: 'PICKED_UP',
      title: 'Đang giao',
      time: order.pickedUpAt,
      desc: 'Tài xế đã lấy món và đang giao',
      active: Boolean(order.pickedUpAt) || ['PICKED_UP', 'COMPLETED'].includes(order.status),
      done: Boolean(order.pickedUpAt),
      icon: 'navigate-outline' as const,
    },
    {
      key: 'COMPLETED',
      title: 'Hoàn thành',
      time: order.completedAt,
      desc: 'Đơn hàng giao thành công',
      active: order.status === 'COMPLETED',
      done: Boolean(order.completedAt),
      icon: 'checkmark-done-circle-outline' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.headerSubtitle}>#{order.orderCode}</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Trạng thái Hiện tại */}
        <View style={[styles.statusBanner, { backgroundColor: badge.bg }]}>
          <View style={styles.statusBannerTextWrap}>
            <Text style={[styles.statusBannerTitle, { color: badge.color }]}>{badge.label}</Text>
            <Text style={styles.statusBannerSub}>
              Cập nhật lúc: {formatTime(order.updatedAt || order.createdAt)}
            </Text>
          </View>
          {isLive && (
            <TouchableOpacity
              style={styles.liveTrackingMiniBtn}
              onPress={() => router.push({ pathname: '/food/tracking/[id]', params: { id: order.id } })}
            >
              <Ionicons name="navigate" size={14} color="#FFFFFF" />
              <Text style={styles.liveTrackingMiniText}>Bản đồ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Khối Order Timeline Thực tế */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Tiến trình đơn hàng</Text>

          {isCancelled ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
              <View style={styles.cancelledTextWrap}>
                <Text style={styles.cancelledTitle}>Đơn hàng đã bị hủy</Text>
                <Text style={styles.cancelledTime}>{formatTime(order.cancelledAt)}</Text>
                {order.cancelledReason && (
                  <Text style={styles.cancelledReason}>Lý do: {order.cancelledReason}</Text>
                )}
                {order.cancelledBy && (
                  <Text style={styles.cancelledBy}>Bởi: {order.cancelledBy}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {timelineSteps.map((step, idx) => {
                const isLast = idx === timelineSteps.length - 1;
                return (
                  <View key={step.key} style={styles.timelineRow}>
                    <View style={styles.timelineLeftCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          step.done && styles.timelineDotDone,
                          step.active && !step.done && styles.timelineDotActive,
                        ]}
                      >
                        <Ionicons
                          name={step.icon}
                          size={14}
                          color={step.done || step.active ? '#FFFFFF' : '#94A3B8'}
                        />
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            step.done && styles.timelineLineDone,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.timelineRightCol}>
                      <View style={styles.timelineTitleRow}>
                        <Text
                          style={[
                            styles.timelineStepTitle,
                            (step.done || step.active) && styles.timelineStepTitleActive,
                          ]}
                        >
                          {step.title}
                        </Text>
                        {step.time && (
                          <Text style={styles.timelineStepTime}>{formatTime(step.time)}</Text>
                        )}
                      </View>
                      <Text style={styles.timelineStepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Khối Nhà Hàng */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Nhà hàng</Text>
          <View style={styles.restaurantCardRow}>
            {order.restaurant?.avatar ? (
              <Image source={{ uri: order.restaurant.avatar }} style={styles.restaurantImg} />
            ) : (
              <View style={styles.restaurantImgPlaceholder}>
                <Ionicons name="storefront" size={24} color="#F97316" />
              </View>
            )}
            <View style={styles.restaurantDetailCol}>
              <Text style={styles.restaurantNameBig}>{order.restaurant?.name || 'Quán ăn V-Life'}</Text>
              <Text style={styles.restaurantAddress} numberOfLines={2}>
                {order.restaurant?.address || 'Địa chỉ đang cập nhật'}
              </Text>
            </View>

            {order.restaurant?.phone && (
              <TouchableOpacity
                style={styles.callCircleBtn}
                onPress={() => handleCall(order.restaurant.phone)}
              >
                <Ionicons name="call" size={18} color="#F97316" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Khối Tài Xế (Dữ liệu thật, nếu có) */}
        {order.driver ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Tài xế giao hàng</Text>
            <View style={styles.driverCardRow}>
              {order.driver.avatar ? (
                <Image source={{ uri: order.driver.avatar }} style={styles.driverAvatar} />
              ) : (
                <View style={styles.driverAvatarPlaceholder}>
                  <Ionicons name="person" size={22} color="#0284C7" />
                </View>
              )}
              <View style={styles.driverDetailCol}>
                <Text style={styles.driverName}>{order.driver.fullName}</Text>
                <View style={styles.driverMetaRow}>
                  <Text style={styles.driverPlate}>{order.driver.licensePlate || 'Xe máy'}</Text>
                  {order.driver.rating && (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#EAB308" />
                      <Text style={styles.ratingText}>{Number(order.driver.rating).toFixed(1)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {order.driver.phone && (
                <TouchableOpacity
                  style={styles.callCircleBtnDriver}
                  onPress={() => handleCall(order.driver.phone)}
                >
                  <Ionicons name="call" size={18} color="#0284C7" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          order.status === 'FINDING_DRIVER' && (
            <View style={styles.findingDriverBanner}>
              <ActivityIndicator size="small" color="#0284C7" style={{ marginRight: 10 }} />
              <Text style={styles.findingDriverText}>
                Hệ thống đang điều phối tài xế gần quán nhất...
              </Text>
            </View>
          )
        )}

        {/* Khối Địa Chỉ Giao Hàng */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Thông tin giao nhận</Text>
          <View style={styles.deliveryInfoRow}>
            <Ionicons name="location-sharp" size={20} color="#EA580C" style={styles.deliveryIcon} />
            <View style={styles.deliveryTextCol}>
              <Text style={styles.deliveryAddressText}>{order.deliveryAddress}</Text>
              {order.noteForMerchant ? (
                <Text style={styles.orderNoteText}>
                  <Text style={{ fontWeight: '600' }}>Ghi chú quán: </Text>
                  {order.noteForMerchant}
                </Text>
              ) : null}
              {order.noteForDriver ? (
                <Text style={styles.orderNoteText}>
                  <Text style={{ fontWeight: '600' }}>Ghi chú tài xế: </Text>
                  {order.noteForDriver}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Khối Danh Sách Món Ăn Chi Tiết */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Món đã đặt ({order.items?.length || 0})</Text>
          {(order.items || []).map((item: any, idx: number) => {
            const itemImg = item.menuItem?.imageUrl || item.menuItem?.image;
            const sizeName = item.optionsJson?.size?.name;
            const toppings = item.optionsJson?.toppings || [];

            return (
              <View key={item.id || idx} style={styles.foodItemRow}>
                {itemImg ? (
                  <Image source={{ uri: itemImg }} style={styles.foodItemImg} />
                ) : (
                  <View style={styles.foodItemPlaceholder}>
                    <Ionicons name="fast-food-outline" size={20} color="#94A3B8" />
                  </View>
                )}

                <View style={styles.foodItemDetailCol}>
                  <View style={styles.foodItemHeaderLine}>
                    <Text style={styles.foodItemQuantity}>{item.quantity}x</Text>
                    <Text style={styles.foodItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  {sizeName && (
                    <Text style={styles.foodOptionText}>• Size: {sizeName}</Text>
                  )}
                  {toppings.length > 0 && (
                    <Text style={styles.foodOptionText}>
                      • Topping: {toppings.map((t: any) => t.name).join(', ')}
                    </Text>
                  )}
                  {item.notes ? (
                    <Text style={styles.foodItemNotes}>Ghi chú: {item.notes}</Text>
                  ) : null}
                </View>

                <Text style={styles.foodItemPrice}>
                  {formatMoney(item.totalPrice || item.price * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Khối Chi Tiết Thanh Toán */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Chi tiết thanh toán</Text>

          <View style={styles.paymentLine}>
            <Text style={styles.paymentLineLabel}>Tiền món (Tạm tính)</Text>
            <Text style={styles.paymentLineValue}>{formatMoney(order.subtotal)}</Text>
          </View>

          <View style={styles.paymentLine}>
            <Text style={styles.paymentLineLabel}>Phí giao hàng ({order.distanceKm ? `${order.distanceKm} km` : ''})</Text>
            <Text style={styles.paymentLineValue}>{formatMoney(order.shippingFee)}</Text>
          </View>

          {Number(order.discountAmount) > 0 && (
            <View style={styles.paymentLine}>
              <Text style={[styles.paymentLineLabel, { color: '#16A34A' }]}>
                Freeship được tài trợ
              </Text>
              <Text style={[styles.paymentLineValue, { color: '#16A34A' }]}>
                -{formatMoney(order.discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.paymentDivider} />

          <View style={styles.paymentLineTotal}>
            <Text style={styles.paymentTotalLabel}>Tổng cộng khách trả</Text>
            <Text style={styles.paymentTotalValue}>{formatMoney(order.totalAmount)}</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentMethodBadge}>
              <Ionicons name="wallet-outline" size={14} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.paymentMethodName}>
                {order.paymentMethod === 'COD'
                  ? 'Tiền mặt khi nhận'
                  : order.paymentMethod === 'WALLET'
                  ? 'Ví V-Life'
                  : 'Chuyển khoản VietQR'}
              </Text>
            </View>
            <Text
              style={[
                styles.paymentStatusText,
                order.paymentStatus === 'PAID' ? { color: '#15803D' } : { color: '#D97706' },
              ]}
            >
              {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </Text>
          </View>
        </View>

        {/* Khối Đánh Giá Đơn Hàng (Nếu COMPLETED) */}
        {isCompleted && (
          <View style={styles.sectionCard}>
            <View style={styles.reviewBannerRow}>
              <View style={styles.reviewBannerIcon}>
                <Ionicons name="star" size={24} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewBannerTitle}>
                  {order.restaurantReview ? 'Đơn hàng đã được đánh giá' : 'Đánh giá đơn hàng'}
                </Text>
                <Text style={styles.reviewBannerSubtitle}>
                  {order.restaurantReview
                    ? `Bạn đã chấm ${order.restaurantReview.rating}⭐ cho nhà hàng này`
                    : 'Hãy chia sẻ trải nghiệm về món ăn và tài xế nhé'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reviewBannerBtn}
                onPress={() => router.push({ pathname: '/food/orders/review' as any, params: { orderId: order.id } })}
              >
                <Text style={styles.reviewBannerBtnText}>
                  {order.restaurantReview ? 'Xem lại' : 'Đánh giá'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#EA580C" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Thanh Hành Động Cuối Trang */}
      <View style={styles.bottomActionBar}>
        {/* Nếu PENDING: Cho phép hủy đơn */}
        {isPending && (
          <TouchableOpacity
            style={styles.cancelFullButton}
            onPress={() => setCancelModalVisible(true)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.cancelFullButtonText}>Hủy đơn hàng này</Text>
          </TouchableOpacity>
        )}

        {/* Nếu ĐANG GIAO: Mở live tracking */}
        {isLive && (
          <TouchableOpacity
            style={styles.trackFullButton}
            onPress={() => router.push({ pathname: '/food/tracking/[id]', params: { id: order.id } })}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.trackFullButtonText}>Theo dõi hành trình trực tiếp</Text>
          </TouchableOpacity>
        )}

        {/* Nếu HOÀN THÀNH: Đánh giá & Đặt lại đơn */}
        {isCompleted && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.reviewBottomBtn}
              onPress={() => router.push({ pathname: '/food/orders/review' as any, params: { orderId: order.id } })}
            >
              <Ionicons name="star" size={16} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.reviewBottomBtnText}>
                {order.restaurantReview ? 'Xem đánh giá' : 'Đánh giá'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reorderFullButton, { flex: 1 }]}
              disabled={reordering}
              onPress={handleReorder}
            >
              {reordering ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.reorderFullButtonText}>Đặt lại đơn này</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal Hủy Đơn Hàng */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do hủy đơn hàng</Text>
            <Text style={styles.modalSub}>
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: Tôi đổi ý, đặt nhầm món, bận việc đột xuất..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={cancelling}
                onPress={handleConfirmCancel}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    marginBottom: 16,
  },
  backButtonSimple: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backButtonSimpleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  headerRight: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBannerTextWrap: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusBannerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  liveTrackingMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  liveTrackingMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      },
    }),
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  cancelledTextWrap: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  cancelledTime: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cancelledReason: {
    fontSize: 13,
    color: '#475569',
  },
  cancelledBy: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#F97316',
  },
  timelineDotDone: {
    backgroundColor: '#16A34A',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineLineDone: {
    backgroundColor: '#16A34A',
  },
  timelineRightCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  timelineStepTitleActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  timelineStepTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timelineStepDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  restaurantCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  restaurantImgPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantDetailCol: {
    flex: 1,
    marginRight: 10,
  },
  restaurantNameBig: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  callCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  driverCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  driverAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetailCol: {
    flex: 1,
    marginRight: 10,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  driverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverPlate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#854D0E',
  },
  callCircleBtnDriver: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  findingDriverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  findingDriverText: {
    fontSize: 13,
    color: '#0369A1',
    flex: 1,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  deliveryTextCol: {
    flex: 1,
  },
  deliveryAddressText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    fontWeight: '500',
  },
  orderNoteText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 6,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  foodItemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  foodItemPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  foodItemDetailCol: {
    flex: 1,
    marginRight: 10,
  },
  foodItemHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodItemQuantity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
    marginRight: 6,
  },
  foodItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  foodOptionText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  foodItemNotes: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  foodItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  paymentLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  paymentLineLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  paymentLineValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  paymentLineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  paymentTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentTotalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F97316',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomActionBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelFullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelFullButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  trackFullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  trackFullButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reorderFullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  reorderFullButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewBannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  reviewBannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  reviewBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewBottomBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
});
