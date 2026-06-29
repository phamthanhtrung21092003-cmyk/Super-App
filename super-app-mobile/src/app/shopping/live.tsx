import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, TextInput, FlatList, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShopping } from '../../context/ShoppingContext';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#000000',
  sub: '#94A3B8',
  accent: '#EF4444'
};

type Comment = {
  id: string;
  user: string;
  text: string;
};

export default function LivestreamScreen() {
  const router = useRouter();
  const { addToCart } = useShopping();
  const pinnedProduct = MOCK_PRODUCTS[0]; // iPhone 15 Pro Max
  
  const [chatText, setChatText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'Trung Phạm', text: 'Ốp lưng titan này có bền không shop?' },
    { id: '2', user: 'Hoàng Nam', text: 'Shop ơi có được kiểm tra hàng trước khi thanh toán không?' },
    { id: '3', user: 'Minh Thư', text: 'Em mới đặt 1 chiếc, mong giao sớm ạ! 😍' },
  ]);

  const [viewerCount, setViewerCount] = useState(1280);
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  // Simulation: add mock comments periodically
  useEffect(() => {
    const mockUsers = ['Anh Tuấn', 'Lan Hương', 'Quốc Bảo', 'Thanh Trúc', 'Hoàng Hải'];
    const mockMsgs = [
      'Giao hàng nhanh lắm mọi người ơi, mình mua rồi',
      'Đang có mã giảm giá 50k đó!',
      'Màu đen titan đẹp thật sự',
      'Đơn hàng mã 28472 của mình gửi chưa shop?',
      'Shop tư vấn nhiệt tình ghê',
    ];

    const commentTimer = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomMsg = mockMsgs[Math.floor(Math.random() * mockMsgs.length)];
      const newComment: Comment = {
        id: Date.now().toString(),
        user: randomUser,
        text: randomMsg
      };
      setComments(prev => [...prev, newComment]);
    }, 4000);

    const viewerTimer = setInterval(() => {
      setViewerCount(v => v + Math.floor(Math.random() * 10) - 4);
    }, 3000);

    return () => {
      clearInterval(commentTimer);
      clearInterval(viewerTimer);
    };
  }, []);

  const handleSendChat = () => {
    if (!chatText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'Bạn',
      text: chatText
    };
    setComments(prev => [...prev, newComment]);
    setChatText('');
  };

  const handleTriggerHeart = () => {
    const newHeart = {
      id: Date.now(),
      left: Math.random() * 80 + 20 // random position
    };
    setHearts(prev => [...prev, newHeart]);
    // Remove heart after animation ends
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 📹 Video Mockup (Host presenting) */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=1080' }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={S.dimOverlay} />

      <SafeAreaView style={S.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          
          {/* Header Row */}
          <View style={S.header}>
            <View style={S.hostCard}>
              <Image source={{ uri: 'https://ui-avatars.com/api/?name=Apple+Store&background=000&color=fff' }} style={S.hostAvatar} />
              <View>
                <Text style={S.hostName}>{pinnedProduct.shopName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={S.liveIndicator} />
                  <Text style={S.liveText}>TRỰC TIẾP</Text>
                </View>
              </View>
            </View>

            <View style={S.viewerCard}>
              <Ionicons name="eye-outline" size={14} color="#FFF" />
              <Text style={S.viewerText}>{viewerCount}</Text>
            </View>

            <TouchableOpacity style={S.closeBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* 💬 Comments Stream (Bottom-Left) */}
          <View style={S.chatArea}>
            <FlatList
              data={comments.slice(-6)} // display only latest 6 comments
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={S.commentBubble}>
                  <Text style={S.commentUser}>{item.user}: <Text style={S.commentText}>{item.text}</Text></Text>
                </View>
              )}
              style={{ maxHeight: 220 }}
            />
          </View>

          {/* 📌 Pinned Product Card */}
          <View style={S.pinnedCard}>
            <Image source={{ uri: pinnedProduct.image }} style={S.pinnedImg} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={S.pinnedTitle} numberOfLines={1}>{pinnedProduct.name}</Text>
              <Text style={S.pinnedPrice}>{pinnedProduct.price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <TouchableOpacity style={S.buyBtn} onPress={() => {
              addToCart(pinnedProduct, 'Mặc định');
              Alert.alert('Thành công', 'Đã thêm sản phẩm ghim vào giỏ hàng!');
            }}>
              <Text style={S.buyBtnTxt}>Mua Ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Toolbar */}
          <View style={S.toolbar}>
            <TextInput
              style={S.chatInput}
              value={chatText}
              onChangeText={setChatText}
              placeholder="Bình luận..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              onSubmitEditing={handleSendChat}
            />

            <TouchableOpacity style={S.iconActionBtn} onPress={handleTriggerHeart}>
              <Ionicons name="heart" size={26} color="#EF4444" />
            </TouchableOpacity>

            <TouchableOpacity style={S.iconActionBtn} onPress={() => router.push('/shopping/cart')}>
              <Ionicons name="bag-handle" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Floating Hearts Animation */}
          {hearts.map(h => (
            <View key={h.id} style={[S.floatingHeart, { left: h.left }]}>
              <Ionicons name="heart" size={24} color="#EF4444" />
            </View>
          ))}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 35, gap: 10 },
  hostCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 8 },
  hostAvatar: { width: 32, height: 32, borderRadius: 16 },
  hostName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.accent },
  liveText: { color: T.accent, fontSize: 9, fontWeight: '800' },

  viewerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
  viewerText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },

  chatArea: { paddingHorizontal: 16, marginBottom: 10 },
  commentBubble: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6, alignSelf: 'flex-start', maxWidth: '85%' },
  commentUser: { color: '#60A5FA', fontSize: 12, fontWeight: '700' },
  commentText: { color: '#FFF', fontWeight: '400' },

  pinnedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, padding: 10, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  pinnedImg: { width: 44, height: 56, borderRadius: 4 },
  pinnedTitle: { fontSize: 13, fontWeight: '700', color: T.black },
  pinnedPrice: { fontSize: 12, color: T.accent, fontWeight: '700', marginTop: 4 },
  buyBtn: { backgroundColor: T.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  buyBtnTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 10 : 20, gap: 10 },
  chatInput: { flex: 1, height: 44, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, paddingHorizontal: 16, color: '#FFF', fontSize: 13 },
  iconActionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  floatingHeart: {
    position: 'absolute',
    bottom: 80,
    opacity: 0.8,
    // simulated animation properties
    transform: [{ translateY: -120 }]
  }
});
