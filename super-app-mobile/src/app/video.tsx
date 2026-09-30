import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, useWindowDimensions,
  Platform, TouchableOpacity, Image, StatusBar, Modal,
  TextInput, KeyboardAvoidingView, SafeAreaView, Share, ScrollView, Alert,
  AppState, AppStateStatus, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, Easing, runOnJS, FadeInDown, FadeOutDown,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';
import { videoRepository } from '../modules/video';
import { getBaseURL } from '../services/apiClient';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const showAlert = (title: string, msg?: string) => {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n\n${msg}` : title);
  else Alert.alert(title, msg);
};

const formatCount = (n: number): string => {
  if (!n || n < 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

// ─── Data MOCK (Fallback an toàn khi chưa có mạng hoặc API rỗng) ──────────────
const MOCK_VIDEOS = [
  {
    id: 'mock_6',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
    user: { id: 'u_mountain', username: '@mountain_escape', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    caption: 'Chinh phục đỉnh núi cao giữa biển mây. Cảm giác thật tuyệt vời khi chạm tay vào bầu trời! 🏔️☁️ #mountains #clouds #adventure',
    music: 'Epic Journey - Mountain Sound',
    likesCount: 78000, commentsCount: 2100, sharesCount: 8900, savesCount: 1200, liked: false, saved: false, following: false,
    location: 'Fansipan, Lào Cai',
    linkedService: { type: 'tour', title: 'Vé cáp treo Fansipan', price: '850.000đ', icon: '🚠' },
    commentsList: [
      { id: 'c8', user: 'Đức Huy', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', text: 'Mây phủ đẹp quá bạn ơi!', likesCount: 88, timestamp: '1 phút trước', isOwn: false },
    ],
    isReal: false,
  },
  {
    id: 'mock_5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
    user: { id: 'u_sunset', username: '@sunset_lover', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
    caption: 'Hoàng hôn rực rỡ buông xuống đồi cỏ. Bức tranh hoàng hôn đẹp nhất từng thấy 🌅✨ #sunset #chillvibes #goldenhour',
    music: 'Sunset Melody - Acoustic Guitar',
    likesCount: 310000, commentsCount: 14200, sharesCount: 65000, savesCount: 5400, liked: true, saved: false, following: false,
    location: 'Tà Xùa, Sơn La',
    linkedService: { type: 'tour', title: 'Săn hoàng hôn Tà Xùa', price: '650.000đ', icon: '🌄' },
    commentsList: [
      { id: 'c7', user: 'Hoàng Yến', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'Màu hoàng hôn đỉnh thật sự!', likesCount: 156, timestamp: '5 phút trước', isOwn: false },
    ],
    isReal: false,
  },
  {
    id: 'mock_4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=600',
    user: { id: 'u_wander', username: '@wanderlust_vn', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    caption: 'Lạc bước vào cánh rừng thông xanh ngát. Hít thở không khí trong lành nguyên sơ 🌲🍃 #forest #nature #travel',
    music: 'Deep Forest - Healing Sound',
    likesCount: 52000, commentsCount: 920, sharesCount: 3100, savesCount: 890, liked: false, saved: false, following: false,
    location: 'Ba Vì, Hà Nội',
    linkedService: { type: 'tour', title: 'Cắm trại rừng thông Ba Vì', price: '350.000đ', icon: '⛺' },
    commentsList: [
      { id: 'c6', user: 'Tuấn Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Rừng thông đẹp mê mẩn!', likesCount: 42, timestamp: '10 phút trước', isOwn: false },
    ],
    isReal: false,
  },
  {
    id: 'mock_3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600',
    user: { id: 'u_photo', username: '@photo_graphy', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
    caption: 'Hậu trường chụp ảnh lookbook siêu ngầu. Góc chụp quyết định tất cả! 📸🔥 #photography #behindthescenes',
    music: 'Trending Song - Beat Drop',
    likesCount: 250000, commentsCount: 10000, sharesCount: 45000, savesCount: 3200, liked: false, saved: false, following: false,
    location: 'Hoàn Kiếm, Hà Nội',
    linkedService: { type: 'shopping', title: 'Máy ảnh Film Vintage', price: '1.200.000đ', icon: '📸' },
    commentsList: [
      { id: 'c4', user: 'Nhiếp Ảnh Gia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Góc máy ảo diệu thật sự!', likesCount: 312, timestamp: '30 phút trước', isOwn: false },
      { id: 'c5', user: 'Mẫu Ảnh HN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'Tuyệt vờiiii 🔥', likesCount: 89, timestamp: '45 phút trước', isOwn: false },
    ],
    isReal: false,
  },
  {
    id: 'mock_2',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
    user: { id: 'u_family', username: '@family_moments', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    caption: 'Khoảnh khắc đáng yêu của hai mẹ con cuối tuần. Marshmallow ngon tuyệt! 🥰🍡 #family #cute #weekend',
    music: 'Happy Kids - Background Music',
    likesCount: 89000, commentsCount: 1500, sharesCount: 5000, savesCount: 1100, liked: true, saved: false, following: false,
    location: 'Quận 1, TP.HCM',
    linkedService: { type: 'food', title: 'Kẹo dẻo Marshmallow', price: '55.000đ', icon: '🍬' },
    commentsList: [
      { id: 'c3', user: 'Mẹ Bỉm Sữa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', text: 'Bé cưng quá đi mất thôi 🥰', likesCount: 45, timestamp: '1 giờ trước', isOwn: false },
    ],
    isReal: false,
  },
  {
    id: 'mock_1',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
    user: { id: 'u_nature', username: '@nature_vibes', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    caption: 'Vẻ đẹp thiên nhiên rực rỡ! Một buổi chiều thật chill bên những bông hoa vàng. 🌼✨ #nature #chill #flowers',
    music: 'Original Sound - Nature Vibes',
    likesCount: 124000, commentsCount: 4200, sharesCount: 12000, savesCount: 2300, liked: false, saved: false, following: false,
    location: 'Đà Lạt, Lâm Đồng',
    linkedService: { type: 'tour', title: 'Tour Săn Mây Đà Lạt', price: '450.000đ', icon: '⛺' },
    commentsList: [
      { id: 'c1', user: 'Linh Nga', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', text: 'Cảnh đẹp quá! Ở đâu vậy bạn?', likesCount: 128, timestamp: '2 giờ trước', isOwn: false },
      { id: 'c2', user: 'Minh Quân', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'Thật yên bình ❤️', likesCount: 64, timestamp: '3 giờ trước', isOwn: false },
    ],
    isReal: false,
  },
];

const GIFTS = [
  { name: 'Hoa hồng', price: 10, icon: '🌹' },
  { name: 'Cà phê', price: 50, icon: '☕' },
  { name: 'Trái tim', price: 99, icon: '💖' },
  { name: 'Tên lửa', price: 299, icon: '🚀' },
  { name: 'Vương miện', price: 500, icon: '👑' },
  { name: 'Siêu xe', price: 1000, icon: '🏎️' },
  { name: 'Biệt thự', price: 5000, icon: '🏡' },
  { name: 'Du thuyền', price: 9999, icon: '🛥️' },
];

const TRENDING = ['Xu hướng du lịch 2026', 'Review ẩm thực Sài Gòn', 'Outfit of the day', 'Nhạc trend TikTok', 'Siêu app 2026', 'Cách chụp ảnh iPhone'];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, visible }: { message: string; visible: boolean }) => {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutDown.duration(200)} style={toastStyles.wrap}>
      <Ionicons name="checkmark-circle" size={17} color="#22c55e" />
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
};
const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 90, alignSelf: 'center', zIndex: 999,
    backgroundColor: 'rgba(20,20,20,0.96)', borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12,
  },
  text: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});

// ─── Tách ProgressBar thành React.memo component riêng (Triệt tiêu 2.5 re-render/s) ─
const VideoProgressBar = React.memo(({ player, isActive }: { player: any; isActive: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive || !player) {
      setProgress(0);
      return;
    }
    const id = setInterval(() => {
      try {
        const dur = player.duration;
        const cur = player.currentTime;
        if (dur && dur > 0) {
          setProgress(Math.min(1, Math.max(0, cur / dur)));
        }
      } catch {}
    }, 300);
    return () => clearInterval(id);
  }, [isActive, player]);

  return (
    <View style={styles.progressTrack} pointerEvents="none">
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );
});

// ─── Active Video Player Component (Khởi tạo useVideoPlayer cho active & adjacent) ──
const ActiveVideoPlayer = ({
  uri,
  thumbnail,
  isActive,
  isScreenActive,
  isPaused,
  isMuted,
  onPlayerReady,
}: {
  uri: string;
  thumbnail?: string;
  isActive: boolean;
  isScreenActive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  onPlayerReady?: (player: any) => void;
}) => {
  const safeUri = uri && typeof uri === 'string' && (uri.startsWith('http') || uri.startsWith('file:') || uri.startsWith('blob:'))
    ? uri
    : MOCK_VIDEOS[0].uri;

  const player = useVideoPlayer(safeUri, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.volume = 1;
  });

  useEffect(() => {
    if (onPlayerReady) onPlayerReady(player);
    return () => {
      if (onPlayerReady) onPlayerReady(null);
    };
  }, [player, onPlayerReady]);

  // Sync mute
  useEffect(() => {
    try {
      player.muted = isMuted;
    } catch {}
  }, [isMuted, player]);

  // Play / Pause dựa trên cả isActive, isPaused VÀ isScreenActive (chuyển tab/ẩn app)
  useEffect(() => {
    try {
      const shouldPlay = isActive && !isPaused && isScreenActive;
      if (shouldPlay) {
        player.play();
      } else {
        player.pause();
      }
    } catch {}
  }, [isActive, isPaused, isScreenActive, player]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Poster nền tránh chớp đen lúc tải */}
      {thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
};

// ─── Placeholder Video Item Component (Tiết kiệm RAM & MediaCodec) ──────────────
const PlaceholderVideoItem = ({
  thumbnail,
}: {
  thumbnail?: string;
}) => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#181818' }]} />
      )}
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="play" size={32} color="rgba(255,255,255,0.7)" style={{ marginLeft: 3 }} />
      </View>
    </View>
  );
};

// ─── VideoItem Component ──────────────────────────────────────────────────────
const VideoItem = ({
  item,
  index,
  activeIndex,
  windowHeight,
  windowWidth,
  theme,
  isMuted,
  onMuteToggle,
  likesCount,
  isLiked,
  onLikeToggle,
  savesCount,
  isSaved,
  onSaveToggle,
  commentsCount,
  isFollowing,
  onFollowToggle,
  onCommentPress,
  onSharePress,
  onGiftPress,
  onProfilePress,
  onAudioPress,
  onProductPress,
  isScreenActive,
}: any) => {
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [heartCoords, setHeartCoords] = useState<{ x: number; y: number } | null>(null);
  const [playerInstance, setPlayerInstance] = useState<any>(null);

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const discRotation = useSharedValue(0);
  const playIconOpacity = useSharedValue(0);
  const musicScroll = useSharedValue(0);

  // Player Windowing Pool: Chỉ khởi tạo player cho activeIndex và lân cận 1 bước
  const isNearby = Math.abs(index - activeIndex) <= 1;
  const isActive = index === activeIndex;

  // Spinning disc + music scroll
  useEffect(() => {
    if (isActive && !isPaused && isScreenActive) {
      discRotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
      musicScroll.value = withRepeat(withTiming(-160, { duration: 7000, easing: Easing.linear }), -1, false);
    }
  }, [isActive, isPaused, isScreenActive]);

  const animDiscStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${discRotation.value}deg` }] }));
  const animHeartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }, { translateY: -heartScale.value * 50 }],
  }));
  const animPlayStyle = useAnimatedStyle(() => ({ opacity: playIconOpacity.value }));
  const animMusicStyle = useAnimatedStyle(() => ({ transform: [{ translateX: musicScroll.value }] }));

  // Sửa lỗi Double-tap bằng useRef bền vững và dập tắt single-tap timer
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
  }, []);

  const handlePress = (evt: any) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = 0;
      const { locationX, locationY } = evt.nativeEvent;
      doubleTapLike(locationX, locationY);
    } else {
      lastTapRef.current = now;
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
      singleTapTimerRef.current = setTimeout(() => {
        singleTapTimerRef.current = null;
        lastTapRef.current = 0;
        togglePlay();
      }, 300);
    }
  };

  const doubleTapLike = (x: number, y: number) => {
    if (!isLiked) onLikeToggle();
    setHeartCoords({ x: x - 40, y: y - 40 });
    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSpring(1.5, { damping: 10 }, () => {
      heartOpacity.value = withTiming(0, { duration: 500 }, () => runOnJS(setHeartCoords)(null));
    });
  };

  const togglePlay = () => {
    setIsPaused(p => !p);
    playIconOpacity.value = 1;
    playIconOpacity.value = withTiming(0, { duration: 900 });
  };

  return (
    <View style={{ height: windowHeight, width: windowWidth, backgroundColor: '#000' }}>
      {/* Cửa sổ giải mã Video (Player Windowing): Chỉ tạo native player khi ở gần active index */}
      {isNearby ? (
        <ActiveVideoPlayer
          uri={item.uri}
          thumbnail={item.thumbnail}
          isActive={isActive}
          isScreenActive={isScreenActive}
          isPaused={isPaused}
          isMuted={isMuted}
          onPlayerReady={setPlayerInstance}
        />
      ) : (
        <PlaceholderVideoItem thumbnail={item.thumbnail} />
      )}

      <TouchableOpacity activeOpacity={1} style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={handlePress}>
        {/* Play/Pause overlay icon */}
        <Animated.View style={[styles.centerPlayIcon, animPlayStyle]}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={80} color="rgba(255,255,255,0.55)" />
        </Animated.View>

        {/* Double-tap animated heart */}
        {heartCoords && (
          <Animated.View style={[{ position: 'absolute', left: heartCoords.x, top: heartCoords.y, zIndex: 50 }, animHeartStyle]}>
            <Ionicons name="heart" size={80} color="#FF4D4F" />
          </Animated.View>
        )}
      </TouchableOpacity>

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={styles.bottomGradient} pointerEvents="none" />

      {/* Mute button */}
      <TouchableOpacity style={styles.muteBtn} onPress={onMuteToggle}>
        <BlurView intensity={60} tint="dark" style={styles.muteBtnInner}>
          <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color="#FFF" />
        </BlurView>
      </TouchableOpacity>

      {/* Bottom layout: Left content + Right action column */}
      <SafeAreaView style={styles.superAppLayout} pointerEvents="box-none">
        <View style={styles.bottomRow} pointerEvents="box-none">

            {/* ── Left: Info content ── */}
            <View style={styles.contentWrapper}>
              {/* Product / Service tag */}
              {item.linkedService && (
                <TouchableOpacity style={styles.linkedCard} onPress={() => onProductPress(item.linkedService)}>
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{item.linkedService.icon || '🛒'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.linkedTitle, { fontFamily: theme.fontFamily }]} numberOfLines={1}>{item.linkedService.title}</Text>
                    <Text style={[styles.linkedPrice, { fontFamily: theme.fontFamily }]}>{item.linkedService.price}</Text>
                  </View>
                  <View style={[styles.buyBtn, { backgroundColor: theme.accentHex }]}>
                    <Text style={[styles.buyBtnText, { fontFamily: theme.fontFamily }]}>Khám phá</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* User info */}
              <View style={styles.userRow}>
                <TouchableOpacity onPress={() => onProfilePress(item.user)}>
                  <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.username, { fontFamily: theme.fontFamily }]}>{item.user.username}</Text>
                    {!isFollowing && (
                      <TouchableOpacity style={[styles.followPill, { backgroundColor: theme.accentHex }]} onPress={onFollowToggle}>
                        <Text style={[styles.followPillText, { fontFamily: theme.fontFamily }]}>Theo dõi</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {item.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={[styles.locationText, { fontFamily: theme.fontFamily }]}>{item.location}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Caption */}
              <TouchableOpacity onPress={() => setExpandedCaption(!expandedCaption)} style={{ marginBottom: 8 }}>
                <Text style={[styles.captionText, { fontFamily: theme.fontFamily }]} numberOfLines={expandedCaption ? 0 : 2}>
                  {item.caption}
                </Text>
                {!expandedCaption && <Text style={{ color: theme.accentHex, fontSize: 12, fontWeight: '600' }}>Xem thêm</Text>}
              </TouchableOpacity>

              {/* Music ticker */}
              <TouchableOpacity style={styles.musicRow} onPress={onAudioPress}>
                <Ionicons name="musical-notes" size={14} color="rgba(255,255,255,0.8)" style={{ marginRight: 6 }} />
                <View style={{ width: 160, overflow: 'hidden' }}>
                  <Animated.Text style={[styles.musicText, { fontFamily: theme.fontFamily }, animMusicStyle]} numberOfLines={1}>
                    {item.music}    •    {item.music}
                  </Animated.Text>
                </View>
                <Animated.View style={[styles.disc, animDiscStyle]}>
                  <Image source={{ uri: item.user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* ── Right: Vertical action column ── */}
            <View style={styles.actionColumn}>
              {/* Like */}
              <TouchableOpacity style={styles.actionBtn} onPress={onLikeToggle}>
                <View style={[styles.actionIconWrap, isLiked && { backgroundColor: 'rgba(255,77,79,0.2)', borderColor: 'rgba(255,77,79,0.5)' }]}>
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={26} color={isLiked ? '#FF4D4F' : '#FFF'} />
                </View>
                <Text style={[styles.actionLabel, { color: isLiked ? '#FF4D4F' : '#FFF', fontFamily: theme.fontFamily }]}>{formatCount(likesCount)}</Text>
              </TouchableOpacity>

              {/* Comment */}
              <TouchableOpacity style={styles.actionBtn} onPress={onCommentPress}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color="#FFF" />
                </View>
                <Text style={[styles.actionLabel, { fontFamily: theme.fontFamily }]}>{formatCount(commentsCount)}</Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity style={styles.actionBtn} onPress={onSharePress}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
                </View>
                <Text style={[styles.actionLabel, { fontFamily: theme.fontFamily }]}>{formatCount(item.sharesCount)}</Text>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity style={styles.actionBtn} onPress={onSaveToggle}>
                <View style={[styles.actionIconWrap, isSaved && { backgroundColor: 'rgba(250,219,20,0.2)', borderColor: 'rgba(250,219,20,0.5)' }]}>
                  <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color={isSaved ? '#FADB14' : '#FFF'} />
                </View>
                <Text style={[styles.actionLabel, { color: isSaved ? '#FADB14' : '#FFF', fontFamily: theme.fontFamily }]}>
                  {isSaved ? 'Đã lưu' : formatCount(savesCount)}
                </Text>
              </TouchableOpacity>

              {/* Gift */}
              <TouchableOpacity style={styles.actionBtn} onPress={onGiftPress}>
                <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.35)' }]}>
                  <Ionicons name="gift-outline" size={26} color="#FFD700" />
                </View>
                <Text style={[styles.actionLabel, { color: '#FFD700', fontFamily: theme.fontFamily }]}>Quà</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>

      {/* Progress Bar hiển thị nổi trên đáy màn hình */}
      <VideoProgressBar player={playerInstance} isActive={isActive && isScreenActive} />
    </View>
  );
};

// ─── Skeleton Loading Component ───────────────────────────────────────────────
const SkeletonFeedItem = ({ height, width }: { height: number; width: number }) => (
  <View style={{ height, width, backgroundColor: '#0d0d0d', justifyContent: 'flex-end', paddingBottom: 60, paddingHorizontal: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ width: width * 0.7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' }} />
          <View style={{ marginLeft: 10, width: 120, height: 16, borderRadius: 8, backgroundColor: '#222' }} />
        </View>
        <View style={{ width: '90%', height: 14, borderRadius: 6, backgroundColor: '#222', marginBottom: 8 }} />
        <View style={{ width: '60%', height: 14, borderRadius: 6, backgroundColor: '#222', marginBottom: 16 }} />
        <View style={{ width: 140, height: 22, borderRadius: 11, backgroundColor: '#222' }} />
      </View>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' }} />
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' }} />
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' }} />
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' }} />
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ videoId?: string; tab?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const { userName, avatarUrl, currentUser } = useUser();
  const { width, height } = useWindowDimensions();

  // Lifecycle check: Tự động pause khi chuyển tab hoặc chuyển app
  const isFocused = useIsFocused();
  const [isAppActive, setIsAppActive] = useState(true);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextStatus: AppStateStatus) => {
      setIsAppActive(nextStatus === 'active');
    });
    return () => sub.remove();
  }, []);

  const isScreenActive = isFocused && isAppActive;

  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [isMuted, setIsMuted] = useState(true);

  // Feed State
  const [apiVideos, setApiVideos] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [customVideos, setCustomVideos] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Nạp dữ liệu Feed từ API thật
  const fetchFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (!cursor) {
      setIsLoadingFeed(true);
    } else {
      setIsLoadingMore(true);
    }
    setFeedError(null);

    try {
      const res = await videoRepository.getFeed({
        tab: activeTab,
        limit: 10,
        cursor: isRefresh ? undefined : (cursor || undefined),
      });

      const serverBase = getBaseURL().replace('/api/v1', '');
      const formattedItems = (res.items || []).map(v => {
        const relativeUrl = v.media?.[0]?.url || '';
        const fullUri = relativeUrl
          ? (relativeUrl.startsWith('http') ? relativeUrl : `${serverBase}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`)
          : MOCK_VIDEOS[0].uri;
        const relativeThumb = v.media?.[0]?.thumbnailUrl || '';
        const fullThumb = relativeThumb
          ? (relativeThumb.startsWith('http') ? relativeThumb : `${serverBase}${relativeThumb.startsWith('/') ? '' : '/'}${relativeThumb}`)
          : undefined;
        const rawAvatar = v.user?.avatarUrl;
        const fullAvatar = rawAvatar
          ? (rawAvatar.startsWith('http') ? rawAvatar : `${serverBase}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`)
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';

        return {
          id: v.id,
          uri: fullUri,
          thumbnail: fullThumb,
          user: {
            id: v.user?.id || v.userId,
            username: v.user?.username ? `@${v.user.username}` : (v.user?.fullName ? `@${v.user.fullName.replace(/\s+/g, '_').toLowerCase()}` : '@user'),
            avatar: fullAvatar,
          },
          caption: v.caption || '',
          music: v.musicTitle || 'Âm thanh gốc',
          likesCount: v.likesCount || 0,
          commentsCount: v.commentsCount || 0,
          sharesCount: v.sharesCount || 0,
          savesCount: v.savesCount || 0,
          liked: !!v.isLiked,
          saved: !!v.isSaved,
          following: !!v.isFollowing,
          location: v.location || '',
          linkedService: v.service ? {
            id: v.service.id,
            type: v.service.type,
            title: v.service.title,
            price: v.service.basePrice != null ? `${Number(v.service.basePrice).toLocaleString('vi-VN')}đ` : '',
            icon: '🛒',
          } : undefined,
          commentsList: [],
          isReal: true,
        };
      });

      if (isRefresh) {
        setApiVideos(formattedItems);
      } else {
        setApiVideos(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = formattedItems.filter(item => !existingIds.has(item.id));
          return [...prev, ...newUnique];
        });
      }

      setCursor(res.nextCursor || null);
      setHasMore(res.hasMore || false);
    } catch (err: any) {
      console.warn('[VideoFeed] Fetch feed failed, combining with mock data:', err?.message);
      setFeedError(err?.message || 'Không thể kết nối máy chủ');
    } finally {
      setIsLoadingFeed(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [activeTab, cursor]);

  useEffect(() => {
    setActiveVideoIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    setCursor(null);
    setApiVideos([]);
    fetchFeed(true);
  }, [activeTab]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingFeed && !isLoadingMore && !isRefreshing && cursor) {
      fetchFeed(false);
    }
  }, [hasMore, isLoadingFeed, isLoadingMore, isRefreshing, cursor, fetchFeed]);

  // Kết hợp Feed từ API, Custom upload và Fallback MOCK_VIDEOS
  const videoFeed = React.useMemo(() => {
    const combined = [...customVideos, ...apiVideos];
    // Nếu API rỗng hoặc lỗi mạng, kết hợp mượt mà với MOCK_VIDEOS
    const allVideos = combined.length > 0 ? [...combined, ...MOCK_VIDEOS] : MOCK_VIDEOS;

    if (params.tab === 'saved') {
      return allVideos.slice(0, 3);
    }
    if (params.tab === 'liked') {
      return allVideos.filter(v => v.liked);
    }
    if (params.tab === 'reposted') {
      return allVideos.slice(3, 6);
    }
    if (params.tab === 'posted') {
      return allVideos;
    }
    return activeTab === 'following' ? allVideos.filter(v => v.following || v.id.startsWith('mock_5')) : allVideos;
  }, [params.tab, activeTab, customVideos, apiVideos]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(() => {
    if (params.videoId) {
      const idx = videoFeed.findIndex(v => v.id === params.videoId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  // Sync scroll tới videoId nếu truyền từ ngoài vào
  useEffect(() => {
    if (params.videoId) {
      const idx = videoFeed.findIndex(v => v.id === params.videoId);
      if (idx !== -1) {
        setActiveVideoIndex(idx);
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: idx, animated: false });
          } catch {
            flatListRef.current?.scrollToOffset({ offset: idx * height, animated: false });
          }
        }, 60);
      }
    }
  }, [params.videoId, params.tab, height, videoFeed]);

  // ── Likes State ──
  const [likesState, setLikesState] = useState<{ [id: string]: { count: number; liked: boolean } }>({});
  useEffect(() => {
    setLikesState(prev => {
      let changed = false;
      const next = { ...prev };
      videoFeed.forEach(v => {
        if (!next[v.id]) {
          next[v.id] = { count: v.likesCount, liked: v.liked };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [videoFeed]);

  const handleLikeToggle = async (id: string) => {
    const current = likesState[id] || { count: 0, liked: false };
    const nextLiked = !current.liked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // Optimistic UI update
    setLikesState(prev => ({
      ...prev,
      [id]: { count: nextCount, liked: nextLiked },
    }));

    const targetVideo = videoFeed.find(v => v.id === id);
    if (targetVideo?.isReal) {
      try {
        if (nextLiked) {
          const res = await videoRepository.likeVideo(id);
          if (res?.likesCount != null) {
            setLikesState(prev => ({ ...prev, [id]: { count: res.likesCount, liked: true } }));
          }
        } else {
          const res = await videoRepository.unlikeVideo(id);
          if (res?.likesCount != null) {
            setLikesState(prev => ({ ...prev, [id]: { count: res.likesCount, liked: false } }));
          }
        }
      } catch (err) {
        // Rollback khi lỗi
        setLikesState(prev => ({ ...prev, [id]: current }));
        showToast('Không thể cập nhật lượt thích');
      }
    }
  };

  // ── Saves State ──
  const [savesState, setSavesState] = useState<{ [id: string]: { count: number; saved: boolean } }>({});
  useEffect(() => {
    setSavesState(prev => {
      let changed = false;
      const next = { ...prev };
      videoFeed.forEach(v => {
        if (!next[v.id]) {
          next[v.id] = { count: v.savesCount || 0, saved: v.saved };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [videoFeed]);

  const handleSaveToggle = async (id: string) => {
    const current = savesState[id] || { count: 0, saved: false };
    const nextSaved = !current.saved;
    const nextCount = nextSaved ? current.count + 1 : Math.max(0, current.count - 1);

    setSavesState(prev => ({
      ...prev,
      [id]: { count: nextCount, saved: nextSaved },
    }));

    showToast(nextSaved ? 'Đã lưu video vào bộ sưu tập' : 'Đã bỏ lưu video');

    const targetVideo = videoFeed.find(v => v.id === id);
    if (targetVideo?.isReal) {
      try {
        const res = await videoRepository.toggleSaveVideo(id);
        if (res?.savesCount != null) {
          setSavesState(prev => ({ ...prev, [id]: { count: res.savesCount, saved: res.isSaved } }));
        }
      } catch (err) {
        setSavesState(prev => ({ ...prev, [id]: current }));
      }
    }
  };

  // ── Comments Count State ──
  const [commentsCountState, setCommentsCountState] = useState<{ [id: string]: number }>({});
  useEffect(() => {
    setCommentsCountState(prev => {
      let changed = false;
      const next = { ...prev };
      videoFeed.forEach(v => {
        if (next[v.id] === undefined) {
          next[v.id] = v.commentsCount || 0;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [videoFeed]);

  // ── Follows State (Dictionary an toàn, cho phép bỏ theo dõi chuẩn xác) ──
  const [followState, setFollowState] = useState<{ [userId: string]: boolean }>({});
  useEffect(() => {
    setFollowState(prev => {
      let changed = false;
      const next = { ...prev };
      videoFeed.forEach(v => {
        if (v.user?.id && next[v.user.id] === undefined) {
          next[v.user.id] = !!v.following;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [videoFeed]);

  const toggleFollowUser = async (userId: string, username: string) => {
    const currentFollowing = followState[userId] ?? false;
    const nextFollowing = !currentFollowing;

    setFollowState(prev => ({ ...prev, [userId]: nextFollowing }));
    showToast(nextFollowing ? `Đã theo dõi ${username} ✓` : `Đã bỏ theo dõi ${username}`);

    try {
      if (nextFollowing) {
        await videoRepository.followUser(userId);
      } else {
        await videoRepository.unfollowUser(userId);
      }
    } catch (err) {
      setFollowState(prev => ({ ...prev, [userId]: currentFollowing }));
      showToast('Không thể cập nhật theo dõi');
    }
  };

  // ── View Recording ──
  const currentVideo = videoFeed[activeVideoIndex] || MOCK_VIDEOS[0];
  useEffect(() => {
    if (!isScreenActive || !currentVideo?.isReal) return;
    const timer = setTimeout(() => {
      try {
        videoRepository.recordView(currentVideo.id, 2);
      } catch {}
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeVideoIndex, isScreenActive, currentVideo?.id]);

  // ── Comments per video ──
  const [commentsData, setCommentsData] = useState<{ [id: string]: any[] }>({});
  const [commentLikes, setCommentLikes] = useState<{ [cid: string]: { count: number; liked: boolean } }>({});
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; user: string } | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const fetchCommentsForVideo = async (videoId: string) => {
    setIsLoadingComments(true);
    try {
      const serverBase = getBaseURL().replace('/api/v1', '');
      const formatAvatar = (url?: string | null) => {
        if (!url) return 'https://ui-avatars.com/api/?name=U&background=0072ff';
        return url.startsWith('http') ? url : `${serverBase}${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const targetVideo = videoFeed.find(v => v.id === videoId);
      if (targetVideo?.isReal) {
        const remote = await videoRepository.getVideoComments(videoId);
        const initialCommentLikes: { [cid: string]: { count: number; liked: boolean } } = {};
        remote.forEach(c => {
          initialCommentLikes[c.id] = { count: c.likesCount || 0, liked: !!c.isLiked };
          if (c.replies) {
            c.replies.forEach((r: any) => {
              initialCommentLikes[r.id] = { count: r.likesCount || 0, liked: !!r.isLiked };
            });
          }
        });
        setCommentLikes(prev => ({ ...prev, ...initialCommentLikes }));

        const currentUserId = currentUser?.id;
        setCommentsData(prev => ({
          ...prev,
          [videoId]: remote.map(c => ({
            id: c.id,
            userId: c.userId,
            user: c.user?.fullName || c.user?.username || 'Người dùng',
            avatar: formatAvatar(c.user?.avatarUrl),
            text: c.content,
            likesCount: c.likesCount || 0,
            timestamp: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: Boolean(currentUserId && c.userId === currentUserId),
            replies: (c.replies || []).map((r: any) => ({
              id: r.id,
              userId: r.userId,
              user: r.user?.fullName || r.user?.username || 'Người dùng',
              avatar: formatAvatar(r.user?.avatarUrl),
              text: r.content,
              likesCount: r.likesCount || 0,
              timestamp: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: Boolean(currentUserId && r.userId === currentUserId),
              parentId: r.parentId,
            })),
          })),
        }));
      } else {
        const mockItem = MOCK_VIDEOS.find(m => m.id === videoId);
        setCommentsData(prev => ({
          ...prev,
          [videoId]: mockItem?.commentsList || [],
        }));
      }
    } catch (err) {
      console.warn('Load comments failed:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // ── Modals ──
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // ── Video Upload State ──
  const [uploadVideoAsset, setUploadVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadCoverAsset, setUploadCoverAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadMusicTitle, setUploadMusicTitle] = useState('Âm thanh gốc');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Gift ──
  const [coinBalance, setCoinBalance] = useState(500);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [giftSending, setGiftSending] = useState(false);

  // ── Profile ──
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creatorActiveTab, setCreatorActiveTab] = useState<'posted' | 'liked' | 'saved' | 'reposted'>('posted');

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ── Messaging ──
  const [showInbox, setShowInbox] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [conversations, setConversations] = useState(() => [
    { id: '1', user: { username: '@nature_vibes', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }, lastMessage: 'Cảnh ở ngoài còn đẹp hơn nhiều á bạn! 😍', time: '5p trước', unread: true, messages: [
      { id: 'm1', text: 'Chào bạn, clip này quay ở đâu thế?', mine: true },
      { id: 'm2', text: 'Chào bạn! Mình quay ở Đồi chè Cầu Đất Đà Lạt đó.', mine: false },
      { id: 'm3', text: 'Đẹp quá, đi mùa này có lạnh không bạn?', mine: true },
      { id: 'm4', text: 'Cảnh ở ngoài còn đẹp hơn nhiều á bạn! 😍', mine: false }
    ]},
    { id: '2', user: { username: '@family_moments', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' }, lastMessage: 'Bé nhà mình thích ăn kẹo dẻo này lắm.', time: '1 giờ trước', unread: false, messages: [
      { id: 'm5', text: 'Kẹo dẻo này mua ở siêu thị nào vậy ạ?', mine: true },
      { id: 'm6', text: 'Bé nhà mình thích ăn kẹo dẻo này lắm.', mine: false }
    ]},
  ]);
  const [messages, setMessages] = useState<{ id: string; text: string; mine: boolean }[]>([]);
  const [messageText, setMessageText] = useState('');

  // ── Toast ──
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  // ── Video Upload Handlers ───────────────────────────────────────────────
  const resetUploadForm = () => {
    setUploadVideoAsset(null);
    setUploadCoverAsset(null);
    setUploadCaption('');
    setUploadMusicTitle('Âm thanh gốc');
    setUploadLocation('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    abortControllerRef.current = null;
  };

  const handlePickVideo = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          showAlert('Yêu cầu quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện để chọn video.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 100 * 1024 * 1024) {
        showAlert('Dung lượng quá lớn', 'Video vượt quá giới hạn 100MB. Vui lòng chọn video nhỏ hơn.');
        return;
      }

      if (asset.duration) {
        const durationSec = asset.duration > 1000 ? asset.duration / 1000 : asset.duration;
        if (durationSec > 600) {
          showAlert('Thời lượng quá dài', 'Thời lượng video tối đa là 10 phút. Vui lòng chọn video ngắn hơn.');
          return;
        }
      }

      setUploadVideoAsset(asset);
      setUploadError(null);
    } catch (err: any) {
      console.error('Error picking video:', err);
      showAlert('Lỗi', 'Không thể chọn video: ' + (err?.message || ''));
    }
  };

  const handlePickCover = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          showAlert('Yêu cầu quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện để chọn ảnh bìa.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setUploadCoverAsset(result.assets[0]);
    } catch (err: any) {
      console.error('Error picking cover:', err);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleStartUpload = async () => {
    if (!uploadVideoAsset) {
      showAlert('Chưa chọn video', 'Vui lòng chọn video trước khi đăng.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const durationSeconds = uploadVideoAsset.duration
        ? (uploadVideoAsset.duration > 1000 ? Math.round(uploadVideoAsset.duration / 1000) : uploadVideoAsset.duration)
        : undefined;

      const newVideo = await videoRepository.uploadAndCreateVideo(
        {
          videoUri: uploadVideoAsset.uri,
          thumbnailUri: uploadCoverAsset?.uri,
          caption: uploadCaption.trim() || undefined,
          musicTitle: uploadMusicTitle.trim() || 'Âm thanh gốc',
          location: uploadLocation.trim() || undefined,
          duration: durationSeconds,
          width: uploadVideoAsset.width,
          height: uploadVideoAsset.height,
          sizeBytes: uploadVideoAsset.fileSize,
          mimeType: uploadVideoAsset.mimeType || 'video/mp4',
        },
        (progressPercent) => {
          setUploadProgress(progressPercent);
        },
        controller.signal,
      );

      if (!newVideo || !newVideo.id) {
        throw new Error('Không thể tạo bài đăng video từ máy chủ');
      }

      const serverBase = getBaseURL().replace('/api/v1', '');
      const videoRelativeUrl = newVideo.media?.[0]?.url || '';
      const fullVideoUri = videoRelativeUrl.startsWith('http') ? videoRelativeUrl : `${serverBase}${videoRelativeUrl}`;
      const fullCoverUri = newVideo.media?.[0]?.thumbnailUrl
        ? (newVideo.media[0].thumbnailUrl.startsWith('http') ? newVideo.media[0].thumbnailUrl : `${serverBase}${newVideo.media[0].thumbnailUrl}`)
        : undefined;

      const feedItem = {
        id: newVideo.id,
        uri: fullVideoUri,
        thumbnail: fullCoverUri,
        user: {
          id: newVideo.user?.id || newVideo.userId,
          username: `@${newVideo.user?.username || userName || 'user'}`,
          avatar: newVideo.user?.avatarUrl || avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        },
        caption: newVideo.caption || '',
        music: newVideo.musicTitle || 'Âm thanh gốc',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        liked: false,
        saved: false,
        following: false,
        location: newVideo.location || '',
        linkedService: undefined,
        commentsList: [],
        isReal: true,
      };

      setLikesState(prev => ({ ...prev, [newVideo.id]: { count: 0, liked: false } }));
      setSavesState(prev => ({ ...prev, [newVideo.id]: { count: 0, saved: false } }));
      setCommentsData(prev => ({ ...prev, [newVideo.id]: [] }));
      setCustomVideos(prev => [feedItem, ...prev]);

      showToast('Đăng video thành công! 🎉');
      resetUploadForm();
      setShowUpload(false);
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'CanceledError' || err?.message === 'canceled') {
        showToast('Đã hủy tải lên video');
      } else {
        const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải lên video.';
        setUploadError(errorMsg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ── Comment Handlers ────────────────────────────────────────────────────────
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    const text = replyTarget ? `@${replyTarget.user} ${newComment.trim()}` : newComment.trim();
    const tempId = `temp_${Date.now()}`;
    const targetParentId = replyTarget?.id;

    // Optimistic comment insert
    const cmt = {
      id: tempId,
      user: userName || 'Bạn',
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=U&background=0072ff&color=fff`,
      text,
      likesCount: 0,
      timestamp: 'Vừa xong',
      isOwn: true,
      parentId: targetParentId || null,
    };

    if (targetParentId) {
      setCommentsData(prev => {
        const list = prev[currentVideo.id] || [];
        return {
          ...prev,
          [currentVideo.id]: list.map(c => {
            if (c.id === targetParentId || (c.replies && c.replies.some((r: any) => r.id === targetParentId))) {
              return {
                ...c,
                replies: [...(c.replies || []), cmt],
              };
            }
            return c;
          }),
        };
      });
    } else {
      setCommentsData(prev => ({
        ...prev,
        [currentVideo.id]: [cmt, ...(prev[currentVideo.id] || [])],
      }));
    }
    setCommentsCountState(prev => ({ ...prev, [currentVideo.id]: (prev[currentVideo.id] || 0) + 1 }));
    setCommentLikes(prev => ({ ...prev, [tempId]: { count: 0, liked: false } }));
    setNewComment('');
    setReplyTarget(null);

    if (currentVideo.isReal) {
      try {
        const created = await videoRepository.createVideoComment(currentVideo.id, text, targetParentId);
        if (created?.id) {
          setCommentsData(prev => {
            const list = prev[currentVideo.id] || [];
            return {
              ...prev,
              [currentVideo.id]: list.map(c => {
                if (c.id === tempId) {
                  return { ...c, id: created.id };
                }
                if (c.replies) {
                  return {
                    ...c,
                    replies: c.replies.map((r: any) => (r.id === tempId ? { ...r, id: created.id } : r)),
                  };
                }
                return c;
              }),
            };
          });
        }
      } catch (err) {
        showToast('Gửi bình luận thất bại');
        setCommentsCountState(prev => ({ ...prev, [currentVideo.id]: Math.max(0, (prev[currentVideo.id] || 1) - 1) }));
        setCommentsData(prev => {
          const list = prev[currentVideo.id] || [];
          return {
            ...prev,
            [currentVideo.id]: list
              .filter(c => c.id !== tempId)
              .map(c => ({
                ...c,
                replies: (c.replies || []).filter((r: any) => r.id !== tempId),
              })),
          };
        });
      }
    }
  };

  const handleCommentLike = async (cid: string) => {
    const cur = commentLikes[cid] || { count: 0, liked: false };
    const nextLiked = !cur.liked;
    const nextCount = nextLiked ? cur.count + 1 : Math.max(0, cur.count - 1);
    setCommentLikes(prev => ({ ...prev, [cid]: { count: nextCount, liked: nextLiked } }));

    if (currentVideo.isReal) {
      try {
        if (nextLiked) {
          const res = await videoRepository.likeComment(currentVideo.id, cid);
          if (res?.likesCount != null) {
            setCommentLikes(prev => ({ ...prev, [cid]: { count: res.likesCount, liked: true } }));
          }
        } else {
          const res = await videoRepository.unlikeComment(currentVideo.id, cid);
          if (res?.likesCount != null) {
            setCommentLikes(prev => ({ ...prev, [cid]: { count: res.likesCount, liked: false } }));
          }
        }
      } catch (err) {
        setCommentLikes(prev => ({ ...prev, [cid]: cur }));
        showToast('Không thể cập nhật lượt thích bình luận');
      }
    }
  };

  const handleDeleteComment = async (cid: string) => {
    const list = commentsData[currentVideo.id] || [];
    const targetParent = list.find(c => c.id === cid);
    const removedCount = targetParent ? 1 + (targetParent.replies?.length || 0) : 1;

    setCommentsData(prev => {
      const currentList = prev[currentVideo.id] || [];
      return {
        ...prev,
        [currentVideo.id]: currentList
          .filter(c => c.id !== cid)
          .map(c => ({
            ...c,
            replies: (c.replies || []).filter((r: any) => r.id !== cid),
          })),
      };
    });
    setCommentsCountState(prev => ({
      ...prev,
      [currentVideo.id]: Math.max(0, (prev[currentVideo.id] || removedCount) - removedCount),
    }));
    showToast('Đã xóa bình luận');

    if (currentVideo.isReal && !cid.startsWith('temp_')) {
      try {
        await videoRepository.deleteComment(currentVideo.id, cid);
      } catch (err) {
        showToast('Xóa bình luận trên máy chủ thất bại');
      }
    }
  };

  // ── Gift & Share Handlers ──────────────────────────────────────────────────
  const handleSendGift = () => {
    if (!selectedGift) return;
    if (coinBalance < selectedGift.price) { showToast('Không đủ xu! Hãy nạp thêm.'); return; }
    setGiftSending(true);
    setTimeout(() => {
      setCoinBalance(prev => prev - selectedGift.price);
      setGiftSending(false);
      setShowGift(false);
      const g = selectedGift;
      setSelectedGift(null);
      showToast(`Đã tặng ${g.icon} ${g.name} cho ${currentVideo.user.username}!`);
    }, 1200);
  };

  const handleCopyLink = () => {
    if (Platform.OS === 'web') {
      try { (navigator as any).clipboard?.writeText(currentVideo.uri); } catch {}
    }
    setShowShare(false);
    showToast('Đã sao chép liên kết!');
  };

  const handleShareSystem = async () => {
    try {
      await Share.share({ message: `Xem video này trên Super App! 🎬\n\n${currentVideo.caption}\n${currentVideo.uri}` });
      setShowShare(false);
    } catch {}
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) { setSearchResults([]); return; }
    setSearchResults(videoFeed.filter(v =>
      v.caption.toLowerCase().includes(text.toLowerCase()) ||
      v.user.username.toLowerCase().includes(text.toLowerCase()) ||
      v.music.toLowerCase().includes(text.toLowerCase())
    ));
  };

  const openChatWithUser = (user: any) => {
    const existing = conversations.find(c => c.user.username === user.username);
    if (existing) {
      setActiveChatId(existing.id);
      setMessages(existing.messages);
      setConversations(prev => prev.map(c => c.id === existing.id ? { ...c, unread: false } : c));
    } else {
      const newId = Date.now().toString();
      const newConvo = {
        id: newId,
        user: { username: user.username, avatar: user.avatar },
        lastMessage: 'Bắt đầu cuộc trò chuyện',
        time: 'Vừa xong',
        unread: false,
        messages: []
      };
      setConversations(prev => [newConvo, ...prev]);
      setActiveChatId(newId);
      setMessages([]);
    }
    setShowProfile(false);
    setShowInbox(false);
    setShowMessage(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId) return;
    const msgText = messageText.trim();
    const id = Date.now().toString();
    const newMsg = { id, text: msgText, mine: true };

    setMessages(prev => [...prev, newMsg]);
    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: msgText,
          time: 'Vừa xong',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
    setMessageText('');

    setTimeout(() => {
      const replyId = (Date.now() + 1).toString();
      const replyMsg = { id: replyId, text: `👋 Cảm ơn bạn! Mình sẽ phản hồi sớm nhé 😊`, mine: false };
      setMessages(prev => [...prev, replyMsg]);
      setConversations(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMessage: replyMsg.text,
            time: 'Vừa xong',
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      }));
    }, 1000);
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  }).current;

  // ─── Render Screen ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Loading Skeleton */}
      {isLoadingFeed && videoFeed.length === 0 ? (
        <SkeletonFeedItem height={height} width={width} />
      ) : feedError && videoFeed.length === 0 ? (
        // Error State có nút Retry
        <View style={styles.centerStatusView}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4D4F" />
          <Text style={[styles.statusTitle, { fontFamily: theme.fontFamily }]}>Không thể tải danh sách video</Text>
          <Text style={[styles.statusSubtitle, { fontFamily: theme.fontFamily }]}>{feedError}</Text>
          <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: theme.accentHex, paddingHorizontal: 24 }]} onPress={() => fetchFeed(true)}>
            <Ionicons name="reload" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={[styles.primaryActionBtnText, { fontFamily: theme.fontFamily }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : videoFeed.length === 0 ? (
        // Empty State
        <View style={styles.centerStatusView}>
          <Ionicons name="videocam-outline" size={64} color="#555" />
          <Text style={[styles.statusTitle, { fontFamily: theme.fontFamily }]}>Chưa có video nào</Text>
          <Text style={[styles.statusSubtitle, { fontFamily: theme.fontFamily }]}>
            {activeTab === 'following' ? 'Bạn chưa theo dõi creator nào hoặc họ chưa đăng video.' : 'Hãy là người đầu tiên đăng tải video lên V-Life!'}
          </Text>
          <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: theme.accentHex }]} onPress={() => fetchFeed(true)}>
            <Ionicons name="reload" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={[styles.primaryActionBtnText, { fontFamily: theme.fontFamily }]}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Video Feed */
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={videoFeed}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <VideoItem
              item={item}
              index={index}
              activeIndex={activeVideoIndex}
              windowHeight={height}
              windowWidth={width}
              theme={theme}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(m => !m)}
              likesCount={likesState[item.id]?.count ?? item.likesCount}
              isLiked={likesState[item.id]?.liked ?? false}
              onLikeToggle={() => handleLikeToggle(item.id)}
              savesCount={savesState[item.id]?.count ?? item.savesCount ?? 0}
              isSaved={savesState[item.id]?.saved ?? false}
              onSaveToggle={() => handleSaveToggle(item.id)}
              commentsCount={commentsCountState[item.id] ?? item.commentsCount ?? 0}
              isFollowing={followState[item.user.id] ?? !!item.following}
              onFollowToggle={() => toggleFollowUser(item.user.id, item.user.username)}
              onCommentPress={() => {
                fetchCommentsForVideo(item.id);
                setShowComments(true);
              }}
              onSharePress={() => setShowShare(true)}
              onGiftPress={() => { setSelectedGift(null); setShowGift(true); }}
              onProfilePress={(user: any) => { setSelectedUser(user); setMessages([]); setShowProfile(true); }}
              onAudioPress={() => setShowAudio(true)}
              onProductPress={(s: any) => showAlert(`🛒 ${s.title}`, `Giá: ${s.price}\nBạn có muốn khám phá dịch vụ này?`)}
              isScreenActive={isScreenActive}
            />
          )}
          pagingEnabled
          initialScrollIndex={activeVideoIndex}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          refreshing={isRefreshing}
          onRefresh={() => fetchFeed(true)}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="small" color={theme.accentHex} />
                <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: info.index * height, animated: false });
            }, 100);
          }}
        />
      )}

      {/* Top Navigation */}
      <SafeAreaView style={styles.topNavWrap} pointerEvents="box-none">
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/social')} style={styles.glassBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          {params.tab ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20 }}>
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700', fontFamily: theme.fontFamily }}>
                {params.tab === 'saved' ? 'Video đã lưu' :
                 params.tab === 'liked' ? 'Video đã thích' :
                 params.tab === 'reposted' ? 'Video đã đăng lại' : 'Video đã đăng'}
              </Text>
            </View>
          ) : (
            <View style={styles.pillWrap}>
              {(['following', 'foryou'] as const).map(tab => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.pill, activeTab === tab && styles.pillActive]}>
                  <Text style={[styles.pillText, { fontFamily: theme.fontFamily }, activeTab === tab && styles.pillTextActive]}>
                    {tab === 'following' ? 'Bạn bè' : 'Đề xuất'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => setShowUpload(true)}>
              <Ionicons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassBtn} onPress={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(true); }}>
              <Ionicons name="search" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Offline Error Banner khi có lỗi mạng nhưng đang dùng mock videos */}
      {feedError && videoFeed.length > 0 && (
        <View style={styles.offlineBar}>
          <Ionicons name="cloud-offline-outline" size={15} color="#FFD700" style={{ marginRight: 6 }} />
          <Text style={styles.offlineBarText} numberOfLines={1}>Ngoại tuyến ({feedError})</Text>
          <TouchableOpacity onPress={() => fetchFeed(true)} style={styles.offlineRetryBtn}>
            <Ionicons name="reload" size={12} color="#FFF" style={{ marginRight: 3 }} />
            <Text style={styles.offlineRetryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toast Alert */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ══════════ COMMENTS MODAL ══════════ */}
      <Modal visible={showComments} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowComments(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.65 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>
                {formatCount(commentsCountState[currentVideo?.id] ?? currentVideo?.commentsCount ?? (commentsData[currentVideo?.id] || []).length)} Bình luận
              </Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {isLoadingComments ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.accentHex} />
                <Text style={{ color: '#888', marginTop: 8, fontSize: 13 }}>Đang tải bình luận...</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                {(commentsData[currentVideo?.id] || []).length === 0 ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 13 }}>Chưa có bình luận nào. Hãy gửi lời đầu tiên!</Text>
                  </View>
                ) : (
                  (commentsData[currentVideo?.id] || []).map(cmt => {
                    const cl = commentLikes[cmt.id] || { count: cmt.likesCount || 0, liked: false };
                    return (
                      <View key={cmt.id} style={{ marginBottom: 14 }}>
                        <View style={styles.cmtItem}>
                          <Image source={{ uri: cmt.avatar }} style={styles.cmtAvatar} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <Text style={[styles.cmtUser, { fontFamily: theme.fontFamily }]}>{cmt.user}</Text>
                              <Text style={{ color: '#555', fontSize: 11 }}>{cmt.timestamp}</Text>
                            </View>
                            <Text style={[styles.cmtText, { fontFamily: theme.fontFamily }]}>{cmt.text}</Text>
                            <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                              <TouchableOpacity onPress={() => setReplyTarget({ id: cmt.id, user: cmt.user })}>
                                <Text style={{ color: '#777', fontSize: 12, fontWeight: '600' }}>↩ Trả lời</Text>
                              </TouchableOpacity>
                              {cmt.isOwn && (
                                <TouchableOpacity onPress={() => handleDeleteComment(cmt.id)}>
                                  <Text style={{ color: '#FF4D4D', fontSize: 12, fontWeight: '600' }}>Xóa</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity style={{ alignItems: 'center', paddingLeft: 10 }} onPress={() => handleCommentLike(cmt.id)}>
                            <Ionicons name={cl.liked ? 'heart' : 'heart-outline'} size={16} color={cl.liked ? '#FF4D4F' : '#666'} />
                            {cl.count > 0 && <Text style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{cl.count}</Text>}
                          </TouchableOpacity>
                        </View>

                        {/* Replies lồng nhau */}
                        {cmt.replies && cmt.replies.length > 0 && (
                          <View style={{ paddingLeft: 44, marginTop: 6, gap: 8 }}>
                            {cmt.replies.map((reply: any) => {
                              const rcl = commentLikes[reply.id] || { count: reply.likesCount || 0, liked: false };
                              return (
                                <View key={reply.id} style={[styles.cmtItem, { marginBottom: 4 }]}>
                                  <Image source={{ uri: reply.avatar }} style={[styles.cmtAvatar, { width: 24, height: 24, borderRadius: 12 }]} />
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                      <Text style={[styles.cmtUser, { fontSize: 11, fontFamily: theme.fontFamily }]}>{reply.user}</Text>
                                      <Text style={{ color: '#555', fontSize: 10 }}>{reply.timestamp}</Text>
                                    </View>
                                    <Text style={[styles.cmtText, { fontSize: 12, fontFamily: theme.fontFamily }]}>{reply.text}</Text>
                                    <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
                                      <TouchableOpacity onPress={() => setReplyTarget({ id: cmt.id, user: reply.user })}>
                                        <Text style={{ color: '#777', fontSize: 11, fontWeight: '600' }}>↩ Trả lời</Text>
                                      </TouchableOpacity>
                                      {reply.isOwn && (
                                        <TouchableOpacity onPress={() => handleDeleteComment(reply.id)}>
                                          <Text style={{ color: '#FF4D4D', fontSize: 11, fontWeight: '600' }}>Xóa</Text>
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  </View>
                                  <TouchableOpacity style={{ alignItems: 'center', paddingLeft: 8 }} onPress={() => handleCommentLike(reply.id)}>
                                    <Ionicons name={rcl.liked ? 'heart' : 'heart-outline'} size={14} color={rcl.liked ? '#FF4D4F' : '#666'} />
                                    {rcl.count > 0 && <Text style={{ color: '#666', fontSize: 9, marginTop: 1 }}>{rcl.count}</Text>}
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}

            <View style={styles.cmtInput}>
              <Image source={{ uri: avatarUrl || 'https://ui-avatars.com/api/?name=U&background=0072ff' }} style={styles.cmtInputAvatar} />
              <View style={{ flex: 1 }}>
                {replyTarget && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: theme.accentHex, fontSize: 12, fontWeight: '600' }}>↩ @{replyTarget.user}</Text>
                    <TouchableOpacity onPress={() => setReplyTarget(null)} style={{ marginLeft: 8 }}>
                      <Ionicons name="close-circle" size={14} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
                <TextInput
                  style={[styles.cmtInputField, { fontFamily: theme.fontFamily }]}
                  placeholder={replyTarget ? `Trả lời @${replyTarget.user}...` : 'Thêm bình luận...'}
                  placeholderTextColor="#666"
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={handleSendComment}
                  returnKeyType="send"
                />
              </View>
              <TouchableOpacity onPress={handleSendComment} style={{ paddingLeft: 12 }}>
                <Ionicons name="send" size={24} color={newComment.trim() ? theme.accentHex : '#444'} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════ SHARE MODAL ══════════ */}
      <Modal visible={showShare} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowShare(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: 310 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Chia sẻ tới</Text>
              <TouchableOpacity onPress={() => setShowShare(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={styles.shareGrid}>
              {[
                { label: 'Facebook', icon: 'logo-facebook', color: '#1877F2', fn: handleShareSystem },
                { label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', fn: handleShareSystem },
                { label: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2', fn: handleShareSystem },
                { label: 'Sao chép link', icon: 'copy-outline', color: '#374151', fn: handleCopyLink },
                { label: 'Tin nhắn', icon: 'chatbubble-outline', color: '#7C3AED', fn: handleShareSystem },
                { label: 'Khác', icon: 'share-social-outline', color: '#4B5563', fn: handleShareSystem },
              ].map((s, idx) => (
                <TouchableOpacity key={idx} style={styles.shareItem} onPress={s.fn}>
                  <View style={[styles.shareIcon, { backgroundColor: s.color }]}>
                    <Ionicons name={s.icon as any} size={24} color="#FFF" />
                  </View>
                  <Text style={[styles.shareLabel, { fontFamily: theme.fontFamily }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ GIFT MODAL ══════════ */}
      <Modal visible={showGift} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowGift(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: 420 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Tặng quà Creator</Text>
                <Text style={{ color: '#FFD700', fontSize: 13, marginTop: 2 }}>Số dư: {coinBalance} xu 🪙</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGift(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.giftGrid}>
                {GIFTS.map((g, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.giftCard, selectedGift?.name === g.name && { borderColor: theme.accentHex, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => setSelectedGift(g)}
                  >
                    <Text style={{ fontSize: 32 }}>{g.icon}</Text>
                    <Text style={[styles.giftName, { fontFamily: theme.fontFamily }]}>{g.name}</Text>
                    <Text style={styles.giftPrice}>{g.price} xu</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[styles.sendGiftBtn, { backgroundColor: selectedGift ? theme.accentHex : '#333' }]}
              disabled={!selectedGift || giftSending}
              onPress={handleSendGift}
            >
              <Text style={[styles.sendGiftBtnText, { fontFamily: theme.fontFamily }]}>
                {giftSending ? 'Đang gửi...' : selectedGift ? `Tặng ${selectedGift.name} (${selectedGift.price} xu)` : 'Chọn một món quà'}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ CREATOR PROFILE MODAL ══════════ */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowProfile(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.72 }]}>
            <View style={styles.handle} />
            {selectedUser && (
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Hồ sơ nhà sáng tạo</Text>
                  <TouchableOpacity onPress={() => setShowProfile(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Image source={{ uri: selectedUser.avatar }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: theme.accentHex }} />
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', fontFamily: theme.fontFamily }}>{selectedUser.username}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Nhà sáng tạo nội dung V-Life 🌟</Text>
                  <View style={{ flexDirection: 'row', gap: 32, marginTop: 16 }}>
                    {[{ label: 'Đang theo dõi', val: '128' }, { label: 'Follower', val: '45.2K' }, { label: 'Thích', val: '890K' }].map((s, idx) => (
                      <View key={idx} style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: theme.fontFamily }}>{s.val}</Text>
                        <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  <TouchableOpacity
                    style={[styles.profileFollowBtn, { backgroundColor: (followState[selectedUser.id] ?? false) ? '#333' : theme.accentHex }]}
                    onPress={() => toggleFollowUser(selectedUser.id, selectedUser.username)}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
                      {(followState[selectedUser.id] ?? false) ? 'Đang theo dõi ✓' : 'Theo dõi'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profileMsgBtn, { borderColor: '#444' }]}
                    onPress={() => openChatWithUser(selectedUser)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
                {/* Tabs */}
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', marginBottom: 12 }}>
                  {[
                    { id: 'posted', icon: 'grid-outline' },
                    { id: 'liked', icon: 'heart-outline' },
                    { id: 'saved', icon: 'bookmark-outline' },
                  ].map(t => (
                    <TouchableOpacity
                      key={t.id}
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: creatorActiveTab === t.id ? 2 : 0, borderColor: '#FFF' }}
                      onPress={() => setCreatorActiveTab(t.id as any)}
                    >
                      <Ionicons name={t.icon as any} size={20} color={creatorActiveTab === t.id ? '#FFF' : '#666'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <ScrollView style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {videoFeed.slice(0, 6).map((v, i) => (
                      <View key={i} style={{ width: (width - 44) / 3, height: 130, backgroundColor: '#222', borderRadius: 8, overflow: 'hidden' }}>
                        <Image source={{ uri: v.thumbnail || v.user.avatar }} style={StyleSheet.absoluteFill} />
                        <View style={{ position: 'absolute', bottom: 4, left: 6, flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="play" size={12} color="#FFF" style={{ marginRight: 3 }} />
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}>{formatCount(v.likesCount)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ AUDIO MODAL ══════════ */}
      <Modal visible={showAudio} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAudio(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: 380 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Âm thanh</Text>
              <TouchableOpacity onPress={() => setShowAudio(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Image source={{ uri: currentVideo.user.avatar }} style={{ width: 70, height: 70, borderRadius: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: theme.fontFamily }}>{currentVideo.music}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Dùng bởi 142.5K video</Text>
                <TouchableOpacity style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }} onPress={() => showToast('Đã lưu âm thanh!')}>
                  <Ionicons name="bookmark-outline" size={16} color={theme.accentHex} style={{ marginRight: 4 }} />
                  <Text style={{ color: theme.accentHex, fontSize: 13, fontWeight: '600' }}>Lưu âm thanh</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: theme.accentHex }]}
              onPress={() => { setShowAudio(false); setShowUpload(true); }}
            >
              <Ionicons name="videocam" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={[styles.primaryActionBtnText, { fontFamily: theme.fontFamily }]}>Dùng âm thanh này</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ SEARCH MODAL ══════════ */}
      <Modal visible={showSearch} transparent animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 20, paddingHorizontal: 14, height: 42 }}>
              <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, color: '#FFF', fontSize: 14, fontFamily: theme.fontFamily }}
                placeholder="Tìm video, hashtag, creator..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}><Ionicons name="close-circle" size={18} color="#888" /></TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Text style={{ color: theme.accentHex, fontSize: 15, fontWeight: '600' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {searchQuery.trim().length === 0 ? (
              <View>
                <Text style={{ color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 12, marginTop: 8 }}>TỪ KHÓA THỊNH HÀNH</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {TRENDING.map((t, idx) => (
                    <TouchableOpacity key={idx} style={{ backgroundColor: '#1e1e1e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 }} onPress={() => handleSearch(t)}>
                      <Text style={{ color: '#DDD', fontSize: 13 }}>#{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View>
                <Text style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Kết quả ({searchResults.length})</Text>
                {searchResults.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' }}
                    onPress={() => {
                      const idx = videoFeed.findIndex(v => v.id === item.id);
                      if (idx !== -1) setActiveVideoIndex(idx);
                      setShowSearch(false);
                    }}
                  >
                    <Image source={{ uri: item.thumbnail || item.user.avatar }} style={{ width: 60, height: 80, borderRadius: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{item.user.username}</Text>
                      <Text style={{ color: '#CCC', fontSize: 12, marginTop: 2 }} numberOfLines={2}>{item.caption}</Text>
                      <Text style={{ color: '#888', fontSize: 11, marginTop: 4 }}>🎵 {item.music}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ══════════ CHAT MODAL ══════════ */}
      <Modal visible={showMessage} transparent animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#222' }}>
            <TouchableOpacity onPress={() => setShowMessage(false)} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: theme.fontFamily }}>
                {conversations.find(c => c.id === activeChatId)?.user.username || 'Trò chuyện'}
              </Text>
              <Text style={{ color: '#22c55e', fontSize: 11 }}>Đang hoạt động</Text>
            </View>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {messages.map(m => (
              <View key={m.id} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', marginBottom: 12, maxWidth: '78%' }}>
                <View style={{ backgroundColor: m.mine ? theme.accentHex : '#262626', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 }}>
                  <Text style={{ color: '#FFF', fontSize: 14, fontFamily: theme.fontFamily }}>{m.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1a1a1a' }}>
              <TextInput
                style={{ flex: 1, color: '#FFF', backgroundColor: '#262626', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, fontFamily: theme.fontFamily }}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#666"
                value={messageText}
                onChangeText={setMessageText}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 10 }}>
                <Ionicons name="send" size={22} color={messageText.trim() ? theme.accentHex : '#555'} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ══════════ UPLOAD VIDEO MODAL ══════════ */}
      <Modal visible={showUpload} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={[styles.sheet, { height: height * 0.85 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Đăng Video Lên V-Life</Text>
              <TouchableOpacity onPress={() => !isUploading && setShowUpload(false)} disabled={isUploading}>
                <Ionicons name="close" size={24} color={isUploading ? '#555' : '#FFF'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {/* Video Picker Box */}
              <TouchableOpacity style={styles.uploadBox} onPress={handlePickVideo} disabled={isUploading}>
                {uploadVideoAsset ? (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="videocam" size={44} color="#22c55e" />
                    <Text style={{ color: '#FFF', fontWeight: '600', marginTop: 8 }}>Đã chọn video</Text>
                    <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                      {uploadVideoAsset.duration ? `${Math.round(uploadVideoAsset.duration > 1000 ? uploadVideoAsset.duration / 1000 : uploadVideoAsset.duration)}s • ` : ''}
                      {uploadVideoAsset.fileSize ? `${(uploadVideoAsset.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
                    </Text>
                    <Text style={{ color: theme.accentHex, fontSize: 12, marginTop: 6 }}>Chạm để chọn lại</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="cloud-upload-outline" size={48} color="#888" />
                    <Text style={{ color: '#FFF', fontWeight: '600', marginTop: 8 }}>Chọn video từ máy (MP4, MOV)</Text>
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Dung lượng tối đa 100MB, thời lượng đến 10 phút</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Cover Thumbnail Picker Box */}
              <TouchableOpacity style={styles.coverPickerBox} onPress={handlePickCover} disabled={isUploading}>
                {uploadCoverAsset ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Image source={{ uri: uploadCoverAsset.uri }} style={{ width: 44, height: 60, borderRadius: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Ảnh bìa đã chọn</Text>
                      <Text style={{ color: theme.accentHex, fontSize: 11, marginTop: 2 }}>Chạm để đổi ảnh</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="image-outline" size={22} color="#888" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#DDD', fontSize: 13, fontWeight: '600' }}>Chọn ảnh bìa đại diện (Thumbnail)</Text>
                      <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>Tùy chọn: giúp video thu hút hơn trên feed</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Caption */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#AAA', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>MÔ TẢ / CAPTION</Text>
                <TextInput
                  style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Viết caption kèm hashtag (#dulich, #amthuc...)"
                  placeholderTextColor="#666"
                  multiline
                  value={uploadCaption}
                  onChangeText={setUploadCaption}
                  editable={!isUploading}
                />
              </View>

              {/* Music Title */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#AAA', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>TÊN ÂM THANH NỀN</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Âm thanh gốc"
                  placeholderTextColor="#666"
                  value={uploadMusicTitle}
                  onChangeText={setUploadMusicTitle}
                  editable={!isUploading}
                />
              </View>

              {/* Location */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#AAA', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ĐỊA ĐIỂM (TÙY CHỌN)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Ví dụ: Đà Lạt, Hà Nội, TP.HCM..."
                  placeholderTextColor="#666"
                  value={uploadLocation}
                  onChangeText={setUploadLocation}
                  editable={!isUploading}
                />
              </View>

              {/* Upload Progress Bar */}
              {isUploading && (
                <View style={{ marginVertical: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Đang tải lên...</Text>
                    <Text style={{ color: theme.accentHex, fontSize: 13, fontWeight: '700' }}>{uploadProgress}%</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: theme.accentHex }} />
                  </View>
                </View>
              )}

              {/* Error Message */}
              {uploadError && (
                <View style={{ padding: 10, backgroundColor: 'rgba(255,77,79,0.15)', borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#FF4D4F' }}>
                  <Text style={{ color: '#FF4D4F', fontSize: 12 }}>{uploadError}</Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              {isUploading ? (
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={handleCancelUpload}>
                  <Text style={{ color: '#FF4D4F', fontWeight: '700', fontSize: 14 }}>Hủy tải lên</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { flex: 1, backgroundColor: uploadVideoAsset ? theme.accentHex : '#333' }]}
                  disabled={!uploadVideoAsset || isUploading}
                  onPress={handleStartUpload}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={[styles.primaryActionBtnText, { fontFamily: theme.fontFamily }]}>Đăng ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerPlayIcon: { position: 'absolute', alignSelf: 'center', top: '42%', zIndex: 10 },
  bottomGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 350 },
  muteBtn: { position: 'absolute', top: 56, right: 16, zIndex: 20 },
  muteBtnInner: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  superAppLayout: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 15 },
  bottomRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 24 },
  contentWrapper: { flex: 1, marginRight: 12 },
  linkedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  linkedTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  linkedPrice: { color: '#22c55e', fontSize: 12, fontWeight: '600', marginTop: 2 },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  buyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10, borderWidth: 1.5, borderColor: '#FFF' },
  username: { color: '#FFF', fontSize: 15, fontWeight: '700', marginRight: 8 },
  followPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  followPillText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 3 },
  captionText: { color: '#EEE', fontSize: 13, lineHeight: 18 },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  disc: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#333', marginLeft: 16 },
  actionColumn: { alignItems: 'center', gap: 16, paddingBottom: 6 },
  actionBtn: { alignItems: 'center' },
  actionIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  actionLabel: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  progressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 30 },
  progressFill: { height: '100%', backgroundColor: '#FFF' },
  topNavWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 25 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10 },
  glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pillWrap: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 3 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17 },
  pillActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillText: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#FFF', fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#141414', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, overflow: 'hidden' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 12 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cmtItem: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  cmtAvatar: { width: 34, height: 34, borderRadius: 17 },
  cmtUser: { color: '#BBB', fontSize: 12, fontWeight: '700' },
  cmtText: { color: '#FFF', fontSize: 13, lineHeight: 18 },
  cmtInput: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#222', paddingTop: 10 },
  cmtInputAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  cmtInputField: { color: '#FFF', backgroundColor: '#222', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, fontSize: 13 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', marginTop: 10 },
  shareItem: { width: '30%', alignItems: 'center', marginBottom: 12 },
  shareIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  shareLabel: { color: '#BBB', fontSize: 11, textAlign: 'center' },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  giftCard: { width: '23%', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#2c2c2c' },
  giftName: { color: '#FFF', fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  giftPrice: { color: '#FFD700', fontSize: 10, marginTop: 2 },
  sendGiftBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  sendGiftBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  profileFollowBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  profileMsgBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  uploadBox: { height: 130, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#444', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', marginBottom: 14 },
  coverPickerBox: { padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 10, backgroundColor: '#1a1a1a', marginBottom: 14 },
  inputField: { color: '#FFF', backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, borderWidth: 1, borderColor: '#333' },
  primaryActionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10 },
  primaryActionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  cancelBtn: { justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#222', borderWidth: 1, borderColor: '#FF4D4F' },
  centerStatusView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  statusTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 16 },
  statusSubtitle: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  offlineBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 84 : 96,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(25,25,25,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  offlineBarText: { flex: 1, color: '#EEE', fontSize: 12 },
  offlineRetryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, marginLeft: 8 },
  offlineRetryText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
