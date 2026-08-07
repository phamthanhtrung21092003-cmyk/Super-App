import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_LIGHT_BACKGROUND = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Phạm+Thành+Trung&background=0EA5E9&color=fff&size=512';
const APP_ICON = require('../../assets/images/icon.png');
const TRAVEL_ICON = require('../../assets/images/travel-icon.png');

export default function HomeScreen() {
  const router = useRouter();
  const { userName, avatarUrl, vipTier, accentHex, accentRgb, bgUrl } = useUser();
  const { theme, scaleFont } = useTheme();

  const displayAvatar = avatarUrl || DEFAULT_AVATAR;
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedServiceNotif, setSelectedServiceNotif] = useState<{
    serviceName: string;
    icon: string;
    color: string;
    items: Array<{ id: string; title: string; message: string; time: string; detailCode?: string; detailStatus?: string; fullDesc?: string; route?: string }>;
    badge: string;
    route: string;
  } | null>(null);

  const [selectedDetailNotif, setSelectedDetailNotif] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    serviceName: string;
    icon: string;
    color: string;
    route: string;
    detailCode?: string;
    detailStatus?: string;
    fullDesc?: string;
  } | null>(null);

  const SERVICE_NOTIFICATIONS: Record<string, Array<{ id: string; title: string; message: string; time: string; detailCode?: string; detailStatus?: string; fullDesc?: string; route?: string }>> = {
    wallet: [
      {
        id: 'w1',
        title: 'Biến Động Số Dư (+50.000đ)',
        message: 'Tài khoản Ví S-Life vừa được cộng +50.000đ từ sự kiện liên kết ngân hàng thành công.',
        time: '10 phút trước',
        detailCode: 'FT202608069482',
        detailStatus: 'Cộng tiền thành công vào Ví S-Life',
        fullDesc: 'Tài khoản Ví S-Life của bạn vừa nhận thành công khoản nạp +50.000đ quà tặng liên kết tài khoản ngân hàng Vietcombank. Số dư hiện tại đã được cộng tự động và có thể dùng để thanh toán tất cả dịch vụ.',
        route: '/wallet'
      },
      {
        id: 'w2',
        title: 'Hoàn Tiền Giao Dịch (20%)',
        message: 'Hoàn tiền +12.000đ cho đơn hàng mua sắm thành công bằng Ví S-Life Cash.',
        time: '1 giờ trước',
        detailCode: 'CB94827102',
        detailStatus: 'Đã hoàn tiền vào Ví',
        fullDesc: 'Bạn vừa được hoàn lại 20% (+12.000đ) tổng giá trị đơn hàng mua sắm #VK9482 khi thanh toán qua Ví S-Life Cash.',
        route: '/wallet'
      },
      {
        id: 'w3',
        title: 'Cảnh Báo Bảo Mật',
        message: 'Tài khoản Ví S-Life của bạn vừa phát sinh giao dịch nạp tiền thành công.',
        time: '2 giờ trước',
        detailCode: 'SEC882194',
        detailStatus: 'Bảo mật an toàn',
        fullDesc: 'Hệ thống ghi nhận giao dịch nạp tiền +500.000đ thực hiện từ thiết bị đã đăng ký. Nếu đây không phải là bạn, vui lòng liên hệ tổng đài S-Life ngay lập tức.',
        route: '/wallet'
      },
    ],
    shopping: [
      {
        id: 's1',
        title: 'Đơn Hàng Đang Giao (#VK9482)',
        message: 'Đơn hàng mua sắm #VK9482 đã được bàn giao cho đơn vị vận chuyển.',
        time: '25 phút trước',
        detailCode: '#VK9482',
        detailStatus: 'Đang vận chuyển (Viettel Post)',
        fullDesc: 'Đơn hàng mua sắm #VK9482 (Bộ tai nghe Bluetooth V-Audio Studio) đã được kiểm định chất lượng và đang được nhân viên Viettel Post vận chuyển. Dự kiến giao đến bạn trước 17:00 chiều nay.',
        route: '/shopping'
      },
      {
        id: 's2',
        title: 'Voucher Siêu Sale 50%',
        message: 'Bạn vừa nhận được Voucher giảm 50% cho ngành hàng điện tử.',
        time: '2 giờ trước',
        detailCode: 'SUPER50OFF',
        detailStatus: 'Khả dụng trong Kho Voucher',
        fullDesc: 'Chúc mừng! Bạn vừa nhận được Voucher giảm 50% (tối đa 100.000đ) áp dụng cho toàn bộ các sản phẩm Thiết Bị Điện Tử & Phụ Kiện Công Nghệ trên sàn Mua Sắm S-Life. Hạn dùng đến 31/08/2026.',
        route: '/shopping'
      },
    ],
    video: [
      {
        id: 'v1',
        title: 'Tương Tác Video Mới',
        message: 'Nguyễn Văn B và 4 người khác đã thích video mới nhất của bạn.',
        time: '15 phút trước',
        detailCode: 'VID-84920',
        detailStatus: 'Đã cập nhật số lượt thích',
        fullDesc: 'Video Shorts "Trải nghiệm du lịch biển đảo 2026" của bạn đã đạt +5 lượt thích mới và 120 lượt xem trong 15 phút vừa qua.',
        route: '/video'
      },
      {
        id: 'v2',
        title: 'Bình Luận Mới',
        message: 'Trần Thị C đã bình luận: "Video tuyệt vời quá anh ơi!"',
        time: '30 phút trước',
        detailCode: 'CMT-99214',
        detailStatus: 'Bình luận mới',
        fullDesc: 'Người dùng Trần Thị C vừa bình luận trên video Shorts của bạn: "Video tuyệt vời quá anh ơi! Cho em hỏi địa điểm này ở đâu thế ạ?"',
        route: '/video'
      },
    ],
    social: [
      {
        id: 'sc1',
        title: 'Tin Nhắn Mới Từ V-Club',
        message: 'Nhóm V-Club: "Tối nay 8h họp nhóm mọi người nhé!"',
        time: '5 phút trước',
        detailCode: 'MSG-77218',
        detailStatus: 'Tin nhắn chưa đọc',
        fullDesc: 'Bạn có tin nhắn mới từ Trưởng nhóm V-Club: "Tối nay 8h họp nhóm trao đổi kế hoạch tuần mới mọi người nhé!"',
        route: '/social'
      },
    ],
    transport: [
      {
        id: 't1',
        title: 'Tài Xế Đang Đến',
        message: 'Tài xế Nguyễn Văn A đang di chuyển đến điểm đón (dự kiến 3 phút).',
        time: '3 phút trước',
        detailCode: 'TR849201',
        detailStatus: 'Tài xế đang di chuyển (3 phút)',
        fullDesc: 'Tài xế Nguyễn Văn A (Biển số xe 29A-888.88, Xe Honda SH) đang trên đường di chuyển tới điểm đón bạn tại 102 Nguyễn Trãi. Vui lòng chuẩn bị sẵn sàng.',
        route: '/transport'
      },
    ],
    food: [
      {
        id: 'f1',
        title: 'Quán Nhận Đơn (#FD8821)',
        message: 'Quán Bún Chả Hà Nội đã nhận đơn và đang chuẩn bị món ăn.',
        time: '10 phút trước',
        detailCode: '#FD8821',
        detailStatus: 'Đang chuẩn bị món ăn',
        fullDesc: 'Nhà hàng Bún Chả Hà Nội Phố đã xác nhận đơn hàng #FD8821 và đang nấu nướng. Tài xế V-Food sẽ ghé lấy món trong 5 phút nữa.',
        route: '/food'
      },
    ],
  };

  const handleBadgePress = (item: any, event: any) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    const notifList = SERVICE_NOTIFICATIONS[item.id] || [
      {
        id: 'def1',
        title: `Thông Báo ${item.title}`,
        message: `Bạn có ${item.badge} thông báo mới chưa đọc từ dịch vụ ${item.title}.`,
        time: 'Vừa xong',
      }
    ];

    setSelectedServiceNotif({
      serviceName: item.title,
      icon: item.icon,
      color: item.color,
      items: notifList,
      badge: item.badge,
      route: item.route,
    });
  };
  
  const { width } = useWindowDimensions();
  const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = Platform.OS === 'web' && width > 1024 && !isMobileUA;
  const currentBg = theme.backgroundImage || bgUrl || DEFAULT_LIGHT_BACKGROUND;

  // Promo Banners
  const BANNERS = [
    { 
      id: '1', 
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80', 
      tag: 'DEAL HOT 50%', 
      title: 'Siêu Hội Mua Sắm S-Life',
      desc: 'Giảm tới 50% cho tất cả đơn hàng đầu tiên',
      route: '/shopping'
    },
    { 
      id: '2', 
      image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80', 
      tag: 'V-TRAVEL', 
      title: 'Khám Phá Thiên Đường Du Lịch',
      desc: 'Săn vé máy bay & phòng khách sạn ưu đãi',
      route: '/travel'
    },
    { 
      id: '3', 
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', 
      tag: 'HOÀN TIỀN 20%', 
      title: 'Thanh Toán Ví S-Life Cash',
      desc: 'Hoàn tiền 20% khi gọi xe & đặt đồ ăn',
      route: '/wallet'
    },
  ];

  // Core Feature Grid
  const MAIN_FEATURES = [
    { id: 'wallet', title: 'Ví S-Life', icon: 'wallet', color: '#0EA5E9', gradient: ['#38BDF8', '#0EA5E9', '#0284C7'], route: '/wallet', badge: '3', badgeColor: '#EF4444' },
    { id: 'shopping', title: 'Mua Sắm', icon: 'cart', color: '#F59E0B', gradient: ['#FBBF24', '#F59E0B', '#D97706'], route: '/shopping', badge: '2', badgeColor: '#EF4444' },
    { id: 'video', title: 'Short Video', icon: 'film', color: '#EC4899', gradient: ['#F472B6', '#EC4899', '#DB2777'], route: '/video', badge: '5', badgeColor: '#EF4444' },
    { id: 'social', title: 'Mạng Xã Hội', icon: 'globe', color: '#2563EB', gradient: ['#60A5FA', '#3B82F6', '#1D4ED8'], route: '/social', badge: '3', badgeColor: '#EF4444' },
    { id: 'jobs', title: 'Việc Làm', icon: 'briefcase', color: '#10B981', gradient: ['#34D399', '#10B981', '#059669'], route: '/jobs' },
    { id: 'business', title: 'Doanh Nghiệp', icon: 'business', color: '#8B5CF6', gradient: ['#A78BFA', '#8B5CF6', '#6D28D9'], route: '/business' },
  ];

  // Categorized Super-App Services
  const UTILITY_GROUPS = [
    {
      id: 'transport',
      title: '🚀 Dịch Vụ Di Chuyển & Giao Vận',
      items: [
        { id: 'transport', title: 'Gọi Xe V-Ride', icon: 'car-sport', color: '#0EA5E9', gradient: ['#38BDF8', '#0EA5E9', '#0284C7'], route: '/transport', badge: '1', badgeColor: '#EF4444' },
        { id: 'food', title: 'Đặt Đồ Ăn', icon: 'fast-food', color: '#F59E0B', gradient: ['#F87171', '#EF4444', '#DC2626'], route: '/food', badge: '2', badgeColor: '#EF4444' },
        { id: 'health', title: 'Sức Khỏe', icon: 'medkit', color: '#EF4444', gradient: ['#FB7185', '#F43F5E', '#BE123C'], route: '/health' },
        { id: 'cleaning', title: 'Dọn Dẹp Nhà', icon: 'sparkles', color: '#10B981', gradient: ['#2DD4BF', '#14B8A6', '#0F766E'], route: '/cleaning' },
      ]
    },
    {
      id: 'entertainment',
      title: '🏖️ Du Lịch & Giải Trí Kỷ Nguyên Mới',
      items: [
        { id: 'travel', title: 'Du Lịch AI', icon: 'compass', color: '#2563EB', gradient: ['#818CF8', '#6366F1', '#4338CA'], image: TRAVEL_ICON, route: '/travel' },
        { id: 'cinema', title: 'Vé Xem Phim', icon: 'ticket', color: '#EC4899', gradient: ['#F472B6', '#E11D48', '#BE123C'], route: '/cinema' },
        { id: 'flights', title: 'Vé Máy Bay', icon: 'airplane', color: '#0EA5E9', gradient: ['#38BDF8', '#0284C7', '#075985'], route: '/flights' },
        { id: 'hotels', title: 'Đặt Khách Sạn', icon: 'bed', color: '#8B5CF6', gradient: ['#C084FC', '#A855F7', '#7E22CE'], route: '/hotels' },
        { id: 'events', title: 'Vé Sự Kiện', icon: 'calendar', color: '#F59E0B', gradient: ['#FBBF24', '#F59E0B', '#B45309'], route: '/events' },
      ]
    },
    {
      id: 'finance_education',
      title: '🎓 Tài Chính & Học Tập',
      items: [
        { id: 'education', title: 'Giáo Dục', icon: 'school', color: '#10B981', gradient: ['#34D399', '#10B981', '#047857'], route: '/education' },
        { id: 'savings', title: 'Gửi Tiết Kiệm', icon: 'trending-up', color: '#F59E0B', gradient: ['#FBBF24', '#D97706', '#92400E'], route: '/savings' },
        { id: 'appearance', title: 'Giao Diện', icon: 'color-palette', color: '#0EA5E9', gradient: ['#38BDF8', '#3B82F6', '#1D4ED8'], route: '/appearance' },
      ]
    }
  ];

  const NOTIFICATIONS = [
    { id: '1', title: 'Ví S-Life', msg: 'Tài khoản được cộng +50.000đ từ sự kiện liên kết ngân hàng.', time: '10 phút trước' },
    { id: '2', title: 'V-Ride', msg: 'Mã giảm giá 30% chuyến xe V-Ride đã sẵn sàng trong kho voucher.', time: '1 giờ trước' },
    { id: '3', title: 'Mua sắm', msg: 'Đơn hàng mua sắm #VK9482 đã được đóng gói và bàn giao vận chuyển.', time: '3 giờ trước' },
  ];

  return (
    <View style={[styles.webWrapper, !isDesktop && styles.mobileFullWrapper]}>
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root, #root > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #F8FAFC !important;
          }
        `}</style>
      )}
      <SafeAreaView style={[styles.safeArea, isDesktop ? styles.desktopFrame : styles.mobileSafeArea]}>
        <ImageBackground 
          source={{ uri: currentBg }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Glassmorphic Liquid Aurora Overlay */}
          <LinearGradient 
            colors={['rgba(248,250,252,0.62)', 'rgba(241,245,249,0.78)', 'rgba(238,242,255,0.88)']} 
            style={styles.overlay} 
          />

          {/* Ambient Floating Glow Orbs (Aurora Light Mesh) */}
          <View style={styles.ambientOrbTopLeft}>
            <LinearGradient
              colors={['rgba(56, 189, 248, 0.45)', 'rgba(14, 165, 233, 0.12)', 'transparent']}
              style={styles.orbGradient}
              start={{ x: 0.3, y: 0.3 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <View style={styles.ambientOrbTopRight}>
            <LinearGradient
              colors={['rgba(232, 121, 249, 0.35)', 'rgba(192, 132, 252, 0.1)', 'transparent']}
              style={styles.orbGradient}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <View style={styles.ambientOrbCenter}>
            <LinearGradient
              colors={['rgba(253, 224, 71, 0.3)', 'rgba(251, 146, 60, 0.08)', 'transparent']}
              style={styles.orbGradient}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

          {/* ══════════ OFFICIAL VIET SUPER APP HEADER ══════════ */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <TouchableOpacity 
              style={styles.brandSection} 
              onPress={() => router.push('/home')} 
              activeOpacity={0.8}
            >
              <View style={styles.appLogoWrap}>
                <Image source={APP_ICON} style={styles.originalLogoImg} resizeMode="cover" />
              </View>
              <View style={styles.brandTitleWrap}>
                <Text style={[styles.brandTitle, { fontFamily: theme.fontFamily }]}>VIET SUPER</Text>
                <Text style={styles.brandSubtitle}>Super App Kỷ Nguyên Mới</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerRight}>
              {/* User Profile Avatar Shortcut */}
              <TouchableOpacity 
                style={styles.userAvatarBtn} 
                onPress={() => router.push('/account')} 
                activeOpacity={0.8}
              >
                <Image source={{ uri: displayAvatar }} style={[styles.userAvatarImg, { borderColor: accentHex || '#0EA5E9' }]} resizeMode="cover" />
                <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
              </TouchableOpacity>

              {/* Giao Diện Shortcut Button */}
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push('/appearance')} 
                activeOpacity={0.7}
              >
                <View style={styles.iconBoxLight}>
                  <Ionicons name="color-palette-outline" size={20} color="#0F172A" />
                </View>
              </TouchableOpacity>

              {/* Notification Button (Always at far top-right corner) */}
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => setShowNotifModal(true)} 
                activeOpacity={0.7}
              >
                <View style={styles.iconBoxLight}>
                  <Ionicons name="notifications-outline" size={20} color="#0F172A" />
                  {notificationCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{notificationCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ══════════ SEARCH BAR ══════════ */}
            <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.searchContainer}>
              <View style={styles.searchBoxLight}>
                <Ionicons name="search" size={20} color="#0EA5E9" style={{ marginRight: 10 }} />
                <TextInput 
                  placeholder="Tìm dịch vụ, món ăn, chuyến xe..." 
                  placeholderTextColor="#94A3B8"
                  style={[styles.searchInput, { fontFamily: theme.fontFamily }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.qrSearchBtn} onPress={() => router.push('/wallet')}>
                  <Ionicons name="qr-code" size={18} color="#0EA5E9" />
                </TouchableOpacity>
              </View>

              {/* Quick Tags */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScrollView}>
                {['🚕 Xe ôm V-Ride', '🍔 Gà rán KFC', '✈️ Vé máy bay 0đ', '💰 Gửi tiết kiệm 8.5%'].map((tag, idx) => (
                  <TouchableOpacity key={idx} style={styles.tagPillLight} onPress={() => setSearchQuery(tag.split(' ')[1])}>
                    <Text style={styles.tagTextLight}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            {/* ══════════ PROMO CAROUSEL ══════════ */}
            <Animated.View entering={FadeInDown.delay(200).duration(700)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitleLight, { fontFamily: theme.fontFamily }]}>🔥 Ưu Đãi Đặc Quyền</Text>
                <TouchableOpacity onPress={() => router.push('/shopping')}>
                  <Text style={styles.seeAllTextLight}>Tất cả</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
                {BANNERS.map((banner) => (
                  <TouchableOpacity 
                    key={banner.id} 
                    style={styles.bannerCard} 
                    activeOpacity={0.9}
                    onPress={() => router.push(banner.route as any)}
                  >
                    <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                    <LinearGradient colors={['transparent', 'rgba(15, 23, 42, 0.85)']} style={styles.bannerOverlay}>
                      <View style={styles.bannerTagLight}>
                        <Text style={styles.bannerTagTextLight}>{banner.tag}</Text>
                      </View>
                      <Text style={[styles.bannerTitle, { fontFamily: theme.fontFamily }]}>{banner.title}</Text>
                      <Text style={styles.bannerDesc}>{banner.desc}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            {/* ══════════ MAIN CORE DISCOVER ══════════ */}
            <Animated.View entering={FadeInDown.delay(300).duration(700)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitleLight, { fontFamily: theme.fontFamily }]}>✨ Khám Phá Tính Năng</Text>
              </View>

              <View style={styles.gridContainer}>
                {MAIN_FEATURES.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.gridItemContainer}
                    activeOpacity={0.8}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={styles.gridItemLight}>
                      <View style={styles.gridIconWrapperLight}>
                        <LinearGradient
                          colors={item.gradient || ['#0EA5E9', '#0284C7']}
                          style={styles.iconGradientBadge}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                        </LinearGradient>
                        {item.badge && (
                          <TouchableOpacity 
                            style={[styles.gridIconBadge, { backgroundColor: item.badgeColor || '#EF4444' }]}
                            onPress={(e) => handleBadgePress(item, e)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.gridIconBadgeText}>{item.badge}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={[styles.gridTitleLight, { fontFamily: theme.fontFamily, fontSize: scaleFont(11) }]} numberOfLines={1}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* ══════════ UTILITY GROUPS ══════════ */}
            {UTILITY_GROUPS.map((group, groupIdx) => {
              const filteredItems = group.items.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              if (filteredItems.length === 0) return null;

              return (
                <Animated.View key={group.id} entering={FadeInDown.delay(400 + groupIdx * 100).duration(700)} style={styles.groupContainer}>
                  <Text style={[styles.groupTitleLight, { fontFamily: theme.fontFamily, fontSize: scaleFont(14) }]}>{group.title}</Text>
                  <View style={styles.utilityGridContainer}>
                    {filteredItems.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.utilityGridItem}
                        activeOpacity={0.8}
                        onPress={() => router.push(item.route as any)}
                      >
                        <View style={styles.utilityItemLightInner}>
                          <View style={styles.utilityIconWrapperLight}>
                            {item.image ? (
                              <Image source={item.image} style={styles.utilityCustomIconImg} resizeMode="cover" />
                            ) : (
                              <LinearGradient
                                colors={item.gradient || ['#0EA5E9', '#0284C7']}
                                style={styles.utilityIconGradientBadge}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <Ionicons name={item.icon as any} size={18} color="#FFFFFF" />
                              </LinearGradient>
                            )}
                            {item.badge && (
                              <TouchableOpacity 
                                style={[styles.gridIconBadge, { backgroundColor: item.badgeColor || '#EF4444' }]}
                                onPress={(e) => handleBadgePress(item, e)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.gridIconBadgeText}>{item.badge}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <Text style={[styles.utilityItemTitleLight, { fontFamily: theme.fontFamily, fontSize: scaleFont(12) }]}>{item.title}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              );
            })}

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* ══════════ FLOATING LIGHT GLASS BOTTOM TAB BAR ══════════ */}
          <View style={styles.bottomTabBarLight}>
            <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
              <View style={styles.activeTabGlowLight}>
                <Ionicons name="home" size={22} color="#0EA5E9" />
              </View>
              <Text style={[styles.tabTextActiveLight, { fontFamily: theme.fontFamily }]}>Trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/social')} activeOpacity={0.8}>
              <Ionicons name="planet-outline" size={22} color="#64748B" />
              <Text style={[styles.tabTextLight, { fontFamily: theme.fontFamily }]}>Mạng xã hội</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/wallet')} activeOpacity={0.8}>
              <Ionicons name="wallet-outline" size={22} color="#64748B" />
              <Text style={[styles.tabTextLight, { fontFamily: theme.fontFamily }]}>Ví S-Life</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/account')} activeOpacity={0.8}>
              <Ionicons name="person-outline" size={22} color="#64748B" />
              <Text style={[styles.tabTextLight, { fontFamily: theme.fontFamily }]}>Tài khoản</Text>
            </TouchableOpacity>
          </View>

          {/* ══════════ NOTIFICATION MODAL ══════════ */}
          <Modal visible={showNotifModal} transparent animationType="fade" onRequestClose={() => setShowNotifModal(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifModal(false)}>
              <View style={styles.notifCardContainer} onStartShouldSetResponder={() => true}>
                <View style={styles.notifCardInnerLight}>
                  <View style={styles.notifHeaderLight}>
                    <Text style={styles.notifHeaderTitleLight}>Thông báo mới ({notificationCount})</Text>
                    <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                      <Ionicons name="close" size={22} color="#0F172A" />
                    </TouchableOpacity>
                  </View>

                  {NOTIFICATIONS.map((n) => (
                    <View key={n.id} style={styles.notifItem}>
                      <View style={styles.notifIconWrapLight}>
                        <Ionicons name="notifications" size={18} color="#0EA5E9" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notifTitleLight}>{n.title}</Text>
                        <Text style={styles.notifMsgLight}>{n.msg}</Text>
                        <Text style={styles.notifTimeLight}>{n.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ══════════ DEDICATED SERVICE NOTIFICATION DETAIL MODAL ══════════ */}
          <Modal 
            visible={selectedServiceNotif !== null} 
            transparent 
            animationType="fade" 
            onRequestClose={() => setSelectedServiceNotif(null)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setSelectedServiceNotif(null)}
            >
              <View style={styles.serviceNotifModalContainer} onStartShouldSetResponder={() => true}>
                {selectedServiceNotif && (
                  <View style={styles.serviceNotifCardInner}>
                    {/* Header */}
                    <View style={styles.serviceNotifHeader}>
                      <View style={[styles.serviceNotifBadgeIconWrap, { backgroundColor: `rgba(${hexToRgb(selectedServiceNotif.color)}, 0.15)` }]}>
                        <Ionicons name={selectedServiceNotif.icon as any} size={22} color={selectedServiceNotif.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceNotifServiceName}>{selectedServiceNotif.serviceName}</Text>
                        <Text style={styles.serviceNotifHeaderTitle}>Danh Sách Thông Báo ({selectedServiceNotif.items.length})</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedServiceNotif(null)} style={styles.closeNotifBtn}>
                        <Ionicons name="close" size={20} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    {/* Scrollable Notification List */}
                    <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                      {selectedServiceNotif.items.map((n, idx) => (
                        <TouchableOpacity 
                          key={n.id || idx} 
                          style={styles.serviceNotifListItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            const baseRoute = (n as any).route || selectedServiceNotif.route;
                            const notifTitleParam = encodeURIComponent(n.title);
                            setSelectedServiceNotif(null);
                            if (baseRoute) {
                              const finalRoute = baseRoute.includes('?') 
                                ? `${baseRoute}&notifTitle=${notifTitleParam}` 
                                : `${baseRoute}?notifTitle=${notifTitleParam}`;
                              router.push(finalRoute as any);
                            }
                          }}
                        >
                          <View style={[styles.notifItemDot, { backgroundColor: selectedServiceNotif.color }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.serviceNotifItemTitle, { fontSize: scaleFont(13) }]}>{n.title}</Text>
                            <Text style={[styles.serviceNotifItemMessage, { fontSize: scaleFont(11) }]}>{n.message}</Text>
                            <Text style={[styles.serviceNotifItemTime, { fontSize: scaleFont(10) }]}>🕒 {n.time}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ alignSelf: 'center' }} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.serviceNotifActions}>
                      <TouchableOpacity 
                        style={styles.understandBtn} 
                        onPress={() => setSelectedServiceNotif(null)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.understandBtnText}>Đã hiểu ({selectedServiceNotif.items.length})</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.openServiceBtn, { backgroundColor: selectedServiceNotif.color }]} 
                        onPress={() => {
                          const targetRoute = selectedServiceNotif.route;
                          setSelectedServiceNotif(null);
                          router.push(targetRoute as any);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.openServiceBtnText}>Mở {selectedServiceNotif.serviceName}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

// Helper to convert hex to rgb string
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length === 6) {
    return `${parseInt(h.substring(0,2), 16)}, ${parseInt(h.substring(2,4), 16)}, ${parseInt(h.substring(4,6), 16)}`;
  }
  return '14, 165, 233';
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  mobileFullWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
    height: '100%',
  },
  mobileSafeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  desktopFrame: {
    maxWidth: 414,
    maxHeight: 896,
    aspectRatio: 414 / 896,
    borderWidth: 10,
    borderColor: '#0F172A',
    borderRadius: 55,
    overflow: 'hidden',
    boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(255,255,255,0.8)',
    ...(Platform.OS === 'web' && { marginVertical: 20 }),
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ambientOrbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: 'hidden',
  },
  ambientOrbTopRight: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  ambientOrbCenter: {
    position: 'absolute',
    top: 360,
    left: -30,
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    zIndex: 10,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  appLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
  },
  originalLogoImg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    transform: [{ scale: 1.28 }],
  },
  brandTitleWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  userAvatarBtn: {
    position: 'relative',
    marginLeft: 2,
  },
  userAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    borderRadius: 14,
  },
  iconBoxLight: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 24,
    marginTop: 6,
  },
  searchBoxLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    height: '100%',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  qrSearchBtn: {
    padding: 6,
    marginLeft: 6,
  },
  tagScrollView: {
    marginTop: 10,
  },
  tagPillLight: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  tagTextLight: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleLight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllTextLight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  carouselContainer: {
    marginBottom: 26,
  },
  bannerCard: {
    width: 260,
    height: 135,
    marginRight: 14,
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 14,
  },
  bannerTagLight: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#38BDF8',
  },
  bannerTagTextLight: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 26,
  },
  gridItemContainer: {
    width: '31%',
    borderRadius: 18,
  },
  gridItemLight: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
  },
  gridIconWrapperLight: {
    position: 'relative',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconGradientBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 14px rgba(14, 165, 233, 0.25)',
  },
  gridTitleLight: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitleLight: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  utilityGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilityGridItem: {
    width: '48%',
    borderRadius: 16,
  },
  utilityItemLightInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  utilityIconWrapperLight: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilityIconGradientBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)',
  },
  utilityCustomIconImg: {
    width: 40,
    height: 40,
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
  },
  gridIconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
    zIndex: 10,
  },
  gridIconBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  utilityItemTitleLight: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  bottomTabBarLight: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 2,
  },
  activeTabGlowLight: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  tabTextLight: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActiveLight: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0EA5E9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notifCardContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  notifCardInnerLight: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  notifHeaderLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifHeaderTitleLight: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  notifIconWrapLight: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  notifTitleLight: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  notifMsgLight: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  notifTimeLight: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 4,
  },
  serviceNotifModalContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
  },
  serviceNotifCardInner: {
    padding: 20,
  },
  serviceNotifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  serviceNotifBadgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceNotifServiceName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceNotifHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeNotifBtn: {
    padding: 4,
  },
  serviceNotifListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  serviceNotifItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  serviceNotifItemMessage: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 4,
  },
  serviceNotifItemTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  serviceNotifActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  understandBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  understandBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  openServiceBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  openServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
