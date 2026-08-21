import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, useWindowDimensions,
  Platform, TouchableOpacity, Image, StatusBar, Modal,
  TextInput, KeyboardAvoidingView, SafeAreaView, Share, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const showAlert = (title: string, msg?: string) => {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n\n${msg}` : title);
  else Alert.alert(title, msg);
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

// ─── Data (Thứ tự danh sách feed: Video 6 mới nhất [index 0] -> Video 1 cũ nhất [index 5]) ─────────
const MOCK_VIDEOS = [
  {
    id: '6',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    user: { username: '@mountain_escape', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    caption: 'Chinh phục đỉnh núi cao giữa biển mây. Cảm giác thật tuyệt vời khi chạm tay vào bầu trời! 🏔️☁️ #mountains #clouds #adventure',
    music: 'Epic Journey - Mountain Sound',
    likesCount: 78000, commentsCount: 2100, sharesCount: 8900, liked: false,
    location: 'Fansipan, Lào Cai',
    linkedService: { type: 'tour', title: 'Vé cáp treo Fansipan', price: '850.000đ', icon: '🚠' },
    commentsList: [
      { id: 'c8', user: 'Đức Huy', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', text: 'Mây phủ đẹp quá bạn ơi!', likesCount: 88, timestamp: '1 phút trước', isOwn: false },
    ],
  },
  {
    id: '5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    user: { username: '@sunset_lover', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
    caption: 'Hoàng hôn rực rỡ buông xuống đồi cỏ. Bức tranh hoàng hôn đẹp nhất từng thấy 🌅✨ #sunset #chillvibes #goldenhour',
    music: 'Sunset Melody - Acoustic Guitar',
    likesCount: 310000, commentsCount: 14200, sharesCount: 65000, liked: true,
    location: 'Tà Xùa, Sơn La',
    linkedService: { type: 'tour', title: 'Săn hoàng hôn Tà Xùa', price: '650.000đ', icon: '🌄' },
    commentsList: [
      { id: 'c7', user: 'Hoàng Yến', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'Màu hoàng hôn đỉnh thật sự!', likesCount: 156, timestamp: '5 phút trước', isOwn: false },
    ],
  },
  {
    id: '4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    user: { username: '@wanderlust_vn', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    caption: 'Lạc bước vào cánh rừng thông xanh ngát. Hít thở không khí trong lành nguyên sơ 🌲🍃 #forest #nature #travel',
    music: 'Deep Forest - Healing Sound',
    likesCount: 52000, commentsCount: 920, sharesCount: 3100, liked: false,
    location: 'Ba Vì, Hà Nội',
    linkedService: { type: 'tour', title: 'Cắm trại rừng thông Ba Vì', price: '350.000đ', icon: '⛺' },
    commentsList: [
      { id: 'c6', user: 'Tuấn Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Rừng thông đẹp mê mẩn!', likesCount: 42, timestamp: '10 phút trước', isOwn: false },
    ],
  },
  {
    id: '3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: { username: '@photo_graphy', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
    caption: 'Hậu trường chụp ảnh lookbook siêu ngầu. Góc chụp quyết định tất cả! 📸🔥 #photography #behindthescenes',
    music: 'Trending Song - Beat Drop',
    likesCount: 250000, commentsCount: 10000, sharesCount: 45000, liked: false,
    location: 'Hoàn Kiếm, Hà Nội',
    linkedService: { type: 'shopping', title: 'Máy ảnh Film Vintage', price: '1.200.000đ', icon: '📸' },
    commentsList: [
      { id: 'c4', user: 'Nhiếp Ảnh Gia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Góc máy ảo diệu thật sự!', likesCount: 312, timestamp: '30 phút trước', isOwn: false },
      { id: 'c5', user: 'Mẫu Ảnh HN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'Tuyệt vờiiii 🔥', likesCount: 89, timestamp: '45 phút trước', isOwn: false },
    ],
  },
  {
    id: '2',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: { username: '@family_moments', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    caption: 'Khoảnh khắc đáng yêu của hai mẹ con cuối tuần. Marshmallow ngon tuyệt! 🥰🍡 #family #cute #weekend',
    music: 'Happy Kids - Background Music',
    likesCount: 89000, commentsCount: 1500, sharesCount: 5000, liked: true,
    location: 'Quận 1, TP.HCM',
    linkedService: { type: 'food', title: 'Kẹo dẻo Marshmallow', price: '55.000đ', icon: '🍬' },
    commentsList: [
      { id: 'c3', user: 'Mẹ Bỉm Sữa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', text: 'Bé cưng quá đi mất thôi 🥰', likesCount: 45, timestamp: '1 giờ trước', isOwn: false },
    ],
  },
  {
    id: '1',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: { username: '@nature_vibes', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    caption: 'Vẻ đẹp thiên nhiên rực rỡ! Một buổi chiều thật chill bên những bông hoa vàng. 🌼✨ #nature #chill #flowers',
    music: 'Original Sound - Nature Vibes',
    likesCount: 124000, commentsCount: 4200, sharesCount: 12000, liked: false,
    location: 'Đà Lạt, Lâm Đồng',
    linkedService: { type: 'tour', title: 'Tour Săn Mây Đà Lạt', price: '450.000đ', icon: '⛺' },
    commentsList: [
      { id: 'c1', user: 'Linh Nga', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', text: 'Cảnh đẹp quá! Ở đâu vậy bạn?', likesCount: 128, timestamp: '2 giờ trước', isOwn: false },
      { id: 'c2', user: 'Minh Quân', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'Thật yên bình ❤️', likesCount: 64, timestamp: '3 giờ trước', isOwn: false },
    ],
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

// ─── VideoItem ────────────────────────────────────────────────────────────────
const VideoItem = ({
  item, isActive, windowHeight, windowWidth, theme,
  isMuted, onMuteToggle,
  likesCount, isLiked, onLikeToggle,
  onCommentPress, onSharePress, onGiftPress,
  onProfilePress, onAudioPress, onProductPress,
}: any) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [heartCoords, setHeartCoords] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const discRotation = useSharedValue(0);
  const playIconOpacity = useSharedValue(0);
  const musicScroll = useSharedValue(0);

  const player = useVideoPlayer(item.uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.volume = 1;
  });

  // Sync mute
  useEffect(() => { try { player.muted = isMuted; } catch {} }, [isMuted, player]);

  // Play / pause
  useEffect(() => {
    try {
      if (isActive && !isPaused) player.play();
      else player.pause();
    } catch {}
  }, [isActive, isPaused, player]);

  // Real progress bar
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      try {
        const dur = player.duration;
        const cur = player.currentTime;
        if (dur && dur > 0) setProgress(cur / dur);
      } catch {}
    }, 400);
    return () => clearInterval(id);
  }, [isActive, player]);

  // Spinning disc + music scroll
  useEffect(() => {
    if (isActive && !isPaused) {
      discRotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
      musicScroll.value = withRepeat(withTiming(-160, { duration: 7000, easing: Easing.linear }), -1, false);
    }
  }, [isActive, isPaused]);

  const animDiscStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${discRotation.value}deg` }] }));
  const animHeartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }, { translateY: -heartScale.value * 50 }],
  }));
  const animPlayStyle = useAnimatedStyle(() => ({ opacity: playIconOpacity.value }));
  const animMusicStyle = useAnimatedStyle(() => ({ transform: [{ translateX: musicScroll.value }] }));

  let lastTap = 0;
  const handlePress = (evt: any) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const { locationX, locationY } = evt.nativeEvent;
      doubleTapLike(locationX, locationY);
    } else {
      setTimeout(() => { if (Date.now() - lastTap >= 300) togglePlay(); }, 300);
    }
    lastTap = now;
  };

  const doubleTapLike = (x: number, y: number) => {
    if (!isLiked) onLikeToggle();
    setHeartCoords({ x: x - 40, y: y - 40 });
    heartScale.value = 0; heartOpacity.value = 1;
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
    <View style={{ height: Platform.OS === 'web' ? ('100vh' as any) : windowHeight, width: windowWidth, backgroundColor: '#000' }}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />

      <TouchableOpacity activeOpacity={1} style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={handlePress}>
        {/* Play/Pause overlay */}
        <Animated.View style={[styles.centerPlayIcon, animPlayStyle]}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={80} color="rgba(255,255,255,0.55)" />
        </Animated.View>

        {/* Double-tap heart */}
        {heartCoords && (
          <Animated.View style={[{ position: 'absolute', left: heartCoords.x, top: heartCoords.y, zIndex: 50 }, animHeartStyle]}>
            <Ionicons name="heart" size={80} color="#FF4D4F" />
          </Animated.View>
        )}

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={styles.bottomGradient} />

        {/* Mute button */}
        <TouchableOpacity style={styles.muteBtn} onPress={onMuteToggle}>
          <BlurView intensity={60} tint="dark" style={styles.muteBtnInner}>
            <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color="#FFF" />
          </BlurView>
        </TouchableOpacity>

        {/* Bottom layout: left content + right action column */}
        <SafeAreaView style={styles.superAppLayout} pointerEvents="box-none">
          <View style={styles.bottomRow}>

            {/* ── Left: info content ── */}
            <View style={styles.contentWrapper}>
              {/* Product card */}
              {item.linkedService && (
                <TouchableOpacity style={styles.linkedCard} onPress={() => onProductPress(item.linkedService)}>
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{item.linkedService.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.linkedTitle, { fontFamily: theme.fontFamily }]} numberOfLines={1}>{item.linkedService.title}</Text>
                    <Text style={[styles.linkedPrice, { fontFamily: theme.fontFamily }]}>{item.linkedService.price}</Text>
                  </View>
                  <View style={[styles.buyBtn, { backgroundColor: theme.accentHex }]}>
                    <Text style={[styles.buyBtnText, { fontFamily: theme.fontFamily }]}>Mua</Text>
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
                      <TouchableOpacity style={[styles.followPill, { backgroundColor: theme.accentHex }]} onPress={() => setIsFollowing(true)}>
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

            {/* ── Right: vertical action column ── */}
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
                <Text style={[styles.actionLabel, { fontFamily: theme.fontFamily }]}>{formatCount(item.commentsCount)}</Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity style={styles.actionBtn} onPress={onSharePress}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
                </View>
                <Text style={[styles.actionLabel, { fontFamily: theme.fontFamily }]}>{formatCount(item.sharesCount)}</Text>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity style={styles.actionBtn} onPress={() => setIsSaved(s => !s)}>
                <View style={[styles.actionIconWrap, isSaved && { backgroundColor: 'rgba(250,219,20,0.2)', borderColor: 'rgba(250,219,20,0.5)' }]}>
                  <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color={isSaved ? '#FADB14' : '#FFF'} />
                </View>
                {isSaved && <Text style={[styles.actionLabel, { color: '#FADB14', fontFamily: theme.fontFamily }]}>Đã lưu</Text>}
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

        {/* Real Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ videoId?: string; tab?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const { userName, avatarUrl } = useUser();
  const { width, height } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('foryou');
  const [isMuted, setIsMuted] = useState(true);

  // Compute feed list dynamically based on incoming profile tab
  const videoFeed = React.useMemo(() => {
    if (params.tab === 'saved') {
      return MOCK_VIDEOS.slice(0, 3); // 3 saved videos
    }
    if (params.tab === 'liked') {
      return MOCK_VIDEOS.filter(v => v.liked); // Liked videos
    }
    if (params.tab === 'reposted') {
      return MOCK_VIDEOS.slice(3, 6); // 3 reposted videos
    }
    if (params.tab === 'posted') {
      return MOCK_VIDEOS; // All 6 posted videos
    }
    return activeTab === 'following' ? [MOCK_VIDEOS[0]] : MOCK_VIDEOS;
  }, [params.tab, activeTab]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(() => {
    if (params.videoId) {
      const idx = videoFeed.findIndex(v => v.id === params.videoId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  // Sync scroll to requested videoId
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

  // ── Likes per video ──
  const [likesState, setLikesState] = useState<{ [id: string]: { count: number; liked: boolean } }>(() => {
    const init: any = {};
    MOCK_VIDEOS.forEach(v => { init[v.id] = { count: v.likesCount, liked: false }; });
    return init;
  });
  const handleLikeToggle = (id: string) => {
    setLikesState(prev => {
      const cur = prev[id];
      return { ...prev, [id]: { count: cur.liked ? cur.count - 1 : cur.count + 1, liked: !cur.liked } };
    });
  };

  // ── Comments per video ──
  const [commentsData, setCommentsData] = useState<{ [id: string]: any[] }>(() => {
    const init: any = {};
    MOCK_VIDEOS.forEach(v => { init[v.id] = [...v.commentsList]; });
    return init;
  });
  const [commentLikes, setCommentLikes] = useState<{ [cid: string]: { count: number; liked: boolean } }>(() => {
    const init: any = {};
    MOCK_VIDEOS.forEach(v => v.commentsList.forEach(c => { init[c.id] = { count: c.likesCount, liked: false }; }));
    return init;
  });
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; user: string } | null>(null);

  // ── Modals ──
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // ── Gift ──
  const [coinBalance, setCoinBalance] = useState(500);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [giftSending, setGiftSending] = useState(false);

  // ── Profile ──
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [creatorActiveTab, setCreatorActiveTab] = useState<'posted' | 'liked' | 'saved' | 'reposted'>('posted');

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ── Messaging ──
  const [showInbox, setShowInbox] = useState(false);
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
    { id: '3', user: { username: '@photo_graphy', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' }, lastMessage: 'Hôm nào qua studio mình giao lưu nhé!', time: 'Hôm qua', unread: false, messages: [
      { id: 'm7', text: 'Hình chụp chất lượng quá anh ơi.', mine: true },
      { id: 'm8', text: 'Cảm ơn bạn nhiều nha!', mine: false },
      { id: 'm9', text: 'Hôm nào qua studio mình giao lưu nhé!', mine: false }
    ]},
    { id: '4', user: { username: '@super_support', avatar: 'https://ui-avatars.com/api/?name=SP&background=0072ff&color=fff' }, lastMessage: 'Yêu cầu của bạn đã được tiếp nhận.', time: '2 ngày trước', unread: false, messages: [
      { id: 'm10', text: 'App mượt lắm, cảm ơn đội ngũ phát triển.', mine: true },
      { id: 'm11', text: 'Chào bạn! Cảm ơn ý kiến đóng góp của bạn. Yêu cầu của bạn đã được tiếp nhận.', mine: false }
    ]}
  ]);
  const [messages, setMessages] = useState<{ id: string; text: string; mine: boolean }[]>([]);
  const [messageText, setMessageText] = useState('');

  // ── Toast ──
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const currentVideo = videoFeed[activeVideoIndex] || MOCK_VIDEOS[0];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSendComment = () => {
    if (!newComment.trim()) return;
    const text = replyTarget ? `@${replyTarget.user} ${newComment.trim()}` : newComment.trim();
    const id = Date.now().toString();
    const cmt = {
      id, user: userName || 'Bạn',
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=U&background=0072ff&color=fff`,
      text, likesCount: 0, timestamp: 'Vừa xong', isOwn: true,
    };
    setCommentsData(prev => ({ ...prev, [currentVideo.id]: [cmt, ...prev[currentVideo.id]] }));
    setCommentLikes(prev => ({ ...prev, [id]: { count: 0, liked: false } }));
    setNewComment('');
    setReplyTarget(null);
  };

  const handleCommentLike = (cid: string) => {
    setCommentLikes(prev => {
      const cur = prev[cid] || { count: 0, liked: false };
      return { ...prev, [cid]: { count: cur.liked ? cur.count - 1 : cur.count + 1, liked: !cur.liked } };
    });
  };

  const handleDeleteComment = (cid: string) => {
    setCommentsData(prev => ({ ...prev, [currentVideo.id]: prev[currentVideo.id].filter(c => c.id !== cid) }));
    showToast('Đã xóa bình luận');
  };

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
      try { navigator.clipboard?.writeText(currentVideo.uri); } catch {}
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
    setSearchResults(MOCK_VIDEOS.filter(v =>
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
      // Mark as read
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

  const toggleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(username)) { next.delete(username); showToast(`Đã bỏ theo dõi ${username}`); }
      else { next.add(username); showToast(`Đã theo dõi ${username} ✓`); }
      return next;
    });
  };

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveVideoIndex(viewableItems[0].index);
  }).current;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Feed */}
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={videoFeed}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <VideoItem
            item={item}
            isActive={index === activeVideoIndex}
            windowHeight={height}
            windowWidth={width}
            theme={theme}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(m => !m)}
            likesCount={likesState[item.id]?.count ?? item.likesCount}
            isLiked={likesState[item.id]?.liked ?? false}
            onLikeToggle={() => handleLikeToggle(item.id)}
            onCommentPress={() => setShowComments(true)}
            onSharePress={() => setShowShare(true)}
            onGiftPress={() => { setSelectedGift(null); setShowGift(true); }}
            onProfilePress={(user: any) => { setSelectedUser(user); setMessages([]); setShowProfile(true); }}
            onAudioPress={() => setShowAudio(true)}
            onProductPress={(s: any) => showAlert(`🛒 ${s.title}`, `Giá: ${s.price}\nBạn có muốn mua không?`)}
          />
        )}
        pagingEnabled
        initialScrollIndex={activeVideoIndex}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={videoFeed.length}
        maxToRenderPerBatch={3}
        windowSize={5}
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

      {/* Top Nav */}
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
              {['following', 'foryou'].map(tab => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.pill, activeTab === tab && styles.pillActive]}>
                  <Text style={[styles.pillText, { fontFamily: theme.fontFamily }, activeTab === tab && styles.pillTextActive]}>
                    {tab === 'following' ? 'Bạn bè' : 'Đề xuất'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.glassBtn} onPress={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(true); }}>
            <Ionicons name="search" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ══════════ COMMENTS MODAL ══════════ */}
      <Modal visible={showComments} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowComments(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.65 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>
                {(commentsData[currentVideo?.id] || []).length} Bình luận
              </Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {(commentsData[currentVideo?.id] || []).map(cmt => {
                const cl = commentLikes[cmt.id] || { count: cmt.likesCount || 0, liked: false };
                return (
                  <View key={cmt.id} style={styles.cmtItem}>
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
                );
              })}
            </ScrollView>

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
              ].map((s, i) => (
                <TouchableOpacity key={i} style={styles.shareItem} onPress={s.fn}>
                  <View style={[styles.shareIcon, { backgroundColor: s.color }]}>
                    <Ionicons name={s.icon as any} size={26} color="#FFF" />
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
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.58 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Tặng quà cho {currentVideo?.user.username}</Text>
              <TouchableOpacity onPress={() => setShowGift(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>

            {/* Coin balance */}
            <View style={styles.coinRow}>
              <Ionicons name="logo-bitcoin" size={18} color="#FADB14" />
              <Text style={styles.coinText}>{coinBalance} xu</Text>
              <TouchableOpacity style={styles.topUpBtn} onPress={() => showToast('Tính năng nạp xu đang phát triển!')}>
                <Text style={styles.topUpText}>+ Nạp xu</Text>
              </TouchableOpacity>
            </View>

            {/* Grid */}
            <ScrollView contentContainerStyle={styles.giftGrid}>
              {GIFTS.map((g, i) => {
                const sel = selectedGift?.name === g.name;
                const canAfford = coinBalance >= g.price;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.giftItem, sel && styles.giftItemSel, !canAfford && { opacity: 0.35 }]}
                    onPress={() => setSelectedGift(sel ? null : g)}
                  >
                    <Text style={{ fontSize: 30, marginBottom: 4 }}>{g.icon}</Text>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }} numberOfLines={1}>{g.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                      <Ionicons name="logo-bitcoin" size={9} color="#FADB14" />
                      <Text style={{ color: '#FADB14', fontSize: 10, marginLeft: 2, fontWeight: '800' }}>{g.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.sendGiftBtn, { backgroundColor: selectedGift ? theme.accentHex : 'rgba(255,255,255,0.1)' }]}
              onPress={handleSendGift}
              disabled={!selectedGift || giftSending}
            >
              <Text style={{ color: selectedGift ? '#000' : '#666', fontWeight: '800', fontSize: 15 }}>
                {giftSending ? 'Đang gửi...' : selectedGift ? `Gửi ${selectedGift.icon}  (${selectedGift.price} xu)` : 'Chọn quà để gửi'}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ PROFILE MODAL ══════════ */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowProfile(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.8 }]}>
            <View style={styles.handle} />
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              
              {/* Creator Card */}
              <View style={{ alignItems: 'center', padding: 20 }}>
                {/* Avatar with ring */}
                <View style={{ position: 'relative', marginBottom: 12 }}>
                  <Image source={{ uri: selectedUser?.avatar }} style={[styles.profileAvatar, { borderColor: theme.accentHex, borderWidth: 2 }]} />
                  <View style={{ position: 'absolute', bottom: 12, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#000' }} />
                </View>

                {/* Username + verified tick */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.profileName}>{selectedUser?.username}</Text>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.accentHex, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="checkmark" size={10} color="#000" />
                  </View>
                </View>

                {/* Badges / tags row */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ color: theme.accentHex, fontSize: 10, fontWeight: '700' }}>Reviewer ✨</Text>
                  </View>
                  {currentVideo?.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 3 }}>
                      <Ionicons name="location" size={10} color="rgba(255,255,255,0.6)" />
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' }}>{currentVideo.location}</Text>
                    </View>
                  )}
                </View>

                <Text style={{ color: '#aaa', fontSize: 13, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
                  Kênh chia sẻ trải nghiệm & dịch vụ tiện ích trên Super App! 🎬✨
                </Text>

                {/* Boxed Stats Presentation */}
                <View style={styles.creatorStatsBox}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: theme.accentHex, fontSize: 16, fontWeight: '800' }}>1.2M</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: '600' }}>Đang follow</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: '60%' }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: theme.accentHex, fontSize: 16, fontWeight: '800' }}>5.8M</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: '600' }}>Follower</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: '60%' }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: theme.accentHex, fontSize: 16, fontWeight: '800' }}>24M</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: '600' }}>Thích</Text>
                  </View>
                </View>

                {/* Follow + Message Actions */}
                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.profileBtn, { backgroundColor: followedUsers.has(selectedUser?.username) ? 'rgba(255,255,255,0.12)' : theme.accentHex, flex: 1 }]}
                    onPress={() => selectedUser && toggleFollow(selectedUser.username)}
                  >
                    <Ionicons name={followedUsers.has(selectedUser?.username) ? 'checkmark' : 'person-add-outline'} size={16} color={followedUsers.has(selectedUser?.username) ? '#FFF' : '#000'} style={{ marginRight: 6 }} />
                    <Text style={{ color: followedUsers.has(selectedUser?.username) ? '#FFF' : '#000', fontWeight: '700' }}>
                      {followedUsers.has(selectedUser?.username) ? 'Đang theo dõi' : 'Theo dõi'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profileBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', flex: 1 }]}
                    onPress={() => selectedUser && openChatWithUser(selectedUser)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Segmented Pills Tab bar */}
              <View style={styles.creatorTabContainer}>
                {[
                  { key: 'posted', icon: 'grid', label: 'Đã đăng' },
                  { key: 'liked', icon: 'heart', label: 'Đã tim' },
                  { key: 'saved', icon: 'bookmark', label: 'Đã lưu' },
                  { key: 'reposted', icon: 'repeat', label: 'Đăng lại' },
                ].map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.creatorTabBtn, creatorActiveTab === tab.key && styles.creatorTabBtnActive]}
                    onPress={() => setCreatorActiveTab(tab.key as any)}
                  >
                    <Ionicons name={tab.icon as any} size={14} color={creatorActiveTab === tab.key ? theme.accentHex : '#777'} />
                    <Text 
                      style={[
                        styles.creatorTabBtnText, 
                        { fontFamily: theme.fontFamily, fontSize: 11 }, 
                        creatorActiveTab === tab.key && styles.creatorTabBtnTextActive
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Contents */}
              {creatorActiveTab === 'posted' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <View key={i} style={{ width: '33.33%', aspectRatio: 0.75, padding: 1 }}>
                      <Image source={{ uri: MOCK_VIDEOS[(i - 1) % MOCK_VIDEOS.length].user.avatar }} style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 28 }} />
                      <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="play" size={10} color="#FFF" />
                        <Text style={{ color: '#FFF', fontSize: 10, marginLeft: 2 }}>{30 + i * 25}K</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {creatorActiveTab === 'liked' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[1, 2, 4].map(i => (
                    <View key={i} style={{ width: '33.33%', aspectRatio: 0.75, padding: 1 }}>
                      <Image source={{ uri: MOCK_VIDEOS[i % MOCK_VIDEOS.length].user.avatar }} style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 28 }} />
                      <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="heart" size={10} color="#FF4D4F" />
                        <Text style={{ color: '#FFF', fontSize: 10, marginLeft: 2 }}>{12 + i * 15}K</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {creatorActiveTab === 'saved' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[0, 2].map(i => (
                    <View key={i} style={{ width: '33.33%', aspectRatio: 0.75, padding: 1 }}>
                      <Image source={{ uri: MOCK_VIDEOS[i % MOCK_VIDEOS.length].user.avatar }} style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 28 }} />
                      <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="bookmark" size={10} color="#FADB14" />
                        <Text style={{ color: '#FFF', fontSize: 10, marginLeft: 2 }}>{8 + i * 10}K</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {creatorActiveTab === 'reposted' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[1].map(i => (
                    <View key={i} style={{ width: '33.33%', aspectRatio: 0.75, padding: 1 }}>
                      <Image source={{ uri: MOCK_VIDEOS[i % MOCK_VIDEOS.length].user.avatar }} style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 28 }} />
                      <View style={{ position: 'absolute', bottom: 5, left: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="repeat" size={10} color="#22c55e" />
                        <Text style={{ color: '#FFF', fontSize: 10, marginLeft: 2 }}>{24 + i * 8}K</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}


            </ScrollView>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ INBOX MODAL ══════════ */}
      <Modal visible={showInbox} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <TouchableOpacity onPress={() => setShowInbox(false)} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={26} color="#111111" />
            </TouchableOpacity>
            <Text style={{ color: '#111111', fontSize: 18, fontWeight: '800', fontFamily: theme.fontFamily }}>Hộp thư</Text>
            <View style={{ width: 34 }} />
          </View>
          
          <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} keyboardShouldPersistTaps="handled">
            {conversations.map(convo => (
              <TouchableOpacity
                key={convo.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F3F4F6',
                  backgroundColor: convo.unread ? '#F3F4F6' : '#FFFFFF'
                }}
                onPress={() => openChatWithUser(convo.user)}
              >
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: convo.user.avatar }} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E7EB' }} />
                  <View style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', borderWidth: 2.5, borderColor: convo.unread ? '#F3F4F6' : '#FFFFFF' }} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#111111', fontWeight: convo.unread ? '800' : '600', fontSize: 15 }}>
                      {convo.user.username}
                    </Text>
                    <Text style={{ color: '#888888', fontSize: 12 }}>{convo.time}</Text>
                  </View>
                  <Text
                    style={{
                      color: convo.unread ? '#111111' : '#6B7280',
                      fontSize: 13,
                      marginTop: 5,
                      fontWeight: convo.unread ? '700' : '400'
                    }}
                    numberOfLines={1}
                  >
                    {convo.lastMessage}
                  </Text>
                </View>
                {convo.unread && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#0084FF', marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ══════════ MESSAGE MODAL ══════════ */}
      <Modal visible={showMessage} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <TouchableOpacity onPress={() => setShowMessage(false)} style={{ padding: 4 }}>
                <Ionicons name="chevron-back" size={26} color="#111111" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={{ uri: selectedUser?.avatar }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB' }} />
                <View>
                  <Text style={{ color: '#111111', fontSize: 16, fontWeight: '700', fontFamily: theme.fontFamily }}>{selectedUser?.username}</Text>
                  <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '600' }}>Đang hoạt động</Text>
                </View>
              </View>
              <View style={{ width: 34 }} />
            </View>

            <ScrollView style={{ flex: 1, backgroundColor: '#F5F6F8', padding: 16 }}>
              {messages.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 100 }}>
                  <Text style={{ fontSize: 50 }}>💬</Text>
                  <Text style={{ color: '#6B7280', marginTop: 14, fontSize: 15 }}>Bắt đầu cuộc trò chuyện!</Text>
                </View>
              )}
              {messages.map(m => (
                <View key={m.id} style={{ alignItems: m.mine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <View style={{
                    backgroundColor: m.mine ? '#0084FF' : '#E4E6EB',
                    paddingHorizontal: 16,
                    paddingVertical: 11,
                    borderRadius: 20,
                    maxWidth: '80%',
                    borderBottomRightRadius: m.mine ? 4 : 20,
                    borderBottomLeftRadius: m.mine ? 20 : 4,
                  }}>
                    <Text style={{ color: m.mine ? '#FFFFFF' : '#111111', fontSize: 15, lineHeight: 21 }}>{m.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB'
            }}>
              <TextInput
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: '#F0F2F5',
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  color: '#111111',
                  fontSize: 15,
                  fontFamily: theme.fontFamily
                }}
                placeholder="Nhắn tin..."
                placeholderTextColor="#888888"
                value={messageText}
                onChangeText={setMessageText}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleSendMessage} style={{ paddingLeft: 12, paddingRight: 6 }}>
                <Ionicons name="send" size={24} color={messageText.trim() ? '#0084FF' : '#B0B3B8'} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ══════════ AUDIO MODAL ══════════ */}
      <Modal visible={showAudio} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAudio(false)} />
          <BlurView intensity={85} tint="dark" style={[styles.sheet, { height: height * 0.48 }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { fontFamily: theme.fontFamily }]}>Âm thanh</Text>
              <TouchableOpacity onPress={() => setShowAudio(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Image source={{ uri: currentVideo?.user.avatar }} style={[styles.profileAvatar, { borderColor: theme.accentHex, width: 90, height: 90, borderRadius: 45, marginBottom: 14 }]} />
              <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center' }}>{currentVideo?.music}</Text>
              <Text style={{ color: '#777', fontSize: 13, marginTop: 5 }}>150K video đang dùng bài này</Text>
              <TouchableOpacity
                style={[styles.audioBtn, { backgroundColor: theme.accentHex, marginTop: 24 }]}
                onPress={() => { setShowAudio(false); showToast('Đã lưu âm thanh vào thư viện!'); }}
              >
                <Ionicons name="musical-note" size={18} color="#000" style={{ marginRight: 8 }} />
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>Sử dụng âm thanh này</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.audioBtn, { backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 10 }]}
                onPress={() => { setShowAudio(false); showToast('Đã thêm vào yêu thích!'); }}
              >
                <Ionicons name="heart-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Yêu thích</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ══════════ SEARCH MODAL ══════════ */}
      <Modal visible={showSearch} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
          <SafeAreaView>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: Platform.OS === 'ios' ? 4 : 24, paddingBottom: 10, gap: 12 }}>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#888" />
                <TextInput
                  autoFocus
                  style={{ flex: 1, color: '#FFF', fontSize: 15, marginLeft: 8 }}
                  placeholder="Tìm kiếm video, người dùng..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                    <Ionicons name="close-circle" size={18} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            {searchQuery.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text style={{ color: '#888', fontWeight: '700', marginBottom: 14, fontSize: 13, letterSpacing: 1 }}>TÌM KIẾM PHỔ BIẾN</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {TRENDING.map((tag, i) => (
                    <TouchableOpacity key={i} style={styles.trendTag} onPress={() => handleSearch(tag)}>
                      <Text style={{ color: '#FFF', fontSize: 13 }}>🔥 {tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : searchResults.length > 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={{ color: '#777', fontWeight: '700', marginBottom: 12, fontSize: 12, letterSpacing: 1 }}>KẾT QUẢ ({searchResults.length})</Text>
                {searchResults.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.searchResult}
                    onPress={() => {
                      setShowSearch(false);
                      const idx = MOCK_VIDEOS.findIndex(m => m.id === v.id);
                      if (idx >= 0) setActiveVideoIndex(idx);
                    }}
                  >
                    <Image source={{ uri: v.user.avatar }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: '#222' }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{v.user.username}</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }} numberOfLines={2}>{v.caption}</Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <Text style={{ color: '#555', fontSize: 11 }}>❤️ {formatCount(v.likesCount)}</Text>
                        <Text style={{ color: '#555', fontSize: 11 }}>💬 {formatCount(v.commentsCount)}</Text>
                      </View>
                    </View>
                    <Ionicons name="play-circle" size={32} color={theme.accentHex} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginTop: 80 }}>
                <Text style={{ fontSize: 48 }}>😶</Text>
                <Text style={{ color: '#666', marginTop: 12, fontSize: 15 }}>Không tìm thấy kết quả cho</Text>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15, marginTop: 4 }}>"{searchQuery}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════ UPLOAD MODAL ══════════ */}
      <Modal visible={showUpload} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowUpload(false)}
        >
          <BlurView intensity={80} tint="dark" style={{ width: width * 0.84, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 64, marginBottom: 14 }}>📹</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Đăng video</Text>
              <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                Tính năng đăng video đang được phát triển và sẽ sớm ra mắt.{'\n'}Hãy theo dõi để cập nhật nhé! 🚀
              </Text>
              <TouchableOpacity
                style={{ marginTop: 26, backgroundColor: theme.accentHex, paddingHorizontal: 40, paddingVertical: 13, borderRadius: 24 }}
                onPress={() => setShowUpload(false)}
              >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 15 }}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/social')}>
          <Ionicons name="planet-outline" size={24} color="rgba(255,255,255,0.55)" />
          <Text style={[styles.tabLabel, { fontFamily: theme.fontFamily }]}>Mạng xã hội</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="bag-handle-outline" size={24} color="rgba(255,255,255,0.55)" />
          <Text style={[styles.tabLabel, { fontFamily: theme.fontFamily }]}>Cửa hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setShowUpload(true)}>
          <View style={[styles.addBtn, { backgroundColor: theme.accentHex }]}>
            <Ionicons name="add" size={26} color="#000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setShowInbox(true)}>
          <Ionicons name="chatbox-ellipses-outline" size={24} color="rgba(255,255,255,0.55)" />
          <Text style={[styles.tabLabel, { fontFamily: theme.fontFamily }]}>Hộp thư</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => { setSelectedUser({ username: userName || '@me', avatar: avatarUrl || 'https://ui-avatars.com/api/?name=Me' }); setMessages([]); setShowProfile(true); }}>
          <Ionicons name="person-outline" size={24} color="rgba(255,255,255,0.55)" />
          <Text style={[styles.tabLabel, { fontFamily: theme.fontFamily }]}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#000',
    ...(Platform.OS === 'web' && { height: '100vh', overflow: 'hidden' } as any),
  },
  // VideoItem
  centerPlayIcon: { position: 'absolute', top: '50%', left: '50%', marginLeft: -40, marginTop: -40, zIndex: 10 },
  muteBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 104 : 84, right: 14, zIndex: 20, borderRadius: 22, overflow: 'hidden' },
  muteBtnInner: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },
  superAppLayout: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 14,
    justifyContent: 'flex-end',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  contentWrapper: {
    flex: 1,
    marginRight: 12,
    marginBottom: 2,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#FFF', marginRight: 10 },
  username: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  followPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  followPillText: { color: '#000', fontSize: 10, fontWeight: '700' },
  locationText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginLeft: 3 },
  captionText: { color: '#FFF', fontSize: 13, lineHeight: 20, marginBottom: 2 },
  musicRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  musicText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  disc: { width: 36, height: 36, borderRadius: 18, marginLeft: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    gap: 4,
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  linkedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginBottom: 14, ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' } as any) },
  linkedTitle: { color: '#FFF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  linkedPrice: { color: '#FADB14', fontSize: 13, fontWeight: '800' },
  buyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginLeft: 6 },
  buyBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  progressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: 'rgba(255,255,255,0.18)', zIndex: 5 },
  progressFill: { height: 2.5, backgroundColor: '#FFF' },
  // Top nav
  topNavWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: Platform.OS === 'ios' ? 6 : 26, paddingBottom: 10 },
  glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  pillWrap: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  pill: { paddingHorizontal: 20, paddingVertical: 10 },
  pillActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pillText: { color: 'rgba(255,255,255,0.65)', fontWeight: '600', fontSize: 14 },
  pillTextActive: { color: '#FFF', fontWeight: '800' },
  // Shared modal styles
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 2 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  sheetTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  // Comments
  cmtItem: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  cmtAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  cmtUser: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  cmtText: { color: '#D0D0D0', fontSize: 14, lineHeight: 20 },
  cmtInput: { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  cmtInputAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  cmtInputField: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, color: '#FFF', fontSize: 14 },
  // Share
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 10, justifyContent: 'space-around' },
  shareItem: { alignItems: 'center', width: '30%', marginVertical: 10 },
  shareIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 7 },
  shareLabel: { color: '#BBB', fontSize: 12, textAlign: 'center' },
  // Gift
  coinRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  coinText: { color: '#FADB14', fontWeight: '700', fontSize: 15, marginLeft: 6, flex: 1 },
  topUpBtn: { backgroundColor: 'rgba(250,219,20,0.12)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(250,219,20,0.25)' },
  topUpText: { color: '#FADB14', fontWeight: '700', fontSize: 12 },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, justifyContent: 'space-between' },
  giftItem: { width: '22%', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  giftItemSel: { borderColor: '#FADB14', backgroundColor: 'rgba(250,219,20,0.15)' },
  sendGiftBtn: { marginHorizontal: 16, marginBottom: 16, padding: 15, borderRadius: 26, alignItems: 'center' },
  // Profile
  profileAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5 },
  profileName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  creatorStatsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginTop: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    width: '100%',
    alignItems: 'center',
  },
  profileBtn: { flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  creatorTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  creatorTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderRadius: 16,
  },
  creatorTabBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  creatorTabBtnText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  creatorTabBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  creatorServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Audio
  audioBtn: { width: '90%', padding: 13, borderRadius: 26, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  // Search
  searchBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  trendTag: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchResult: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  // Bottom tab
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.88)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(20px)' } as any),
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 3, fontWeight: '500' },
  addBtn: { width: 46, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
