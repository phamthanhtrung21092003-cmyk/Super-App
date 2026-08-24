import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#000000',
  accent: '#EF4444'
};

export default function ShortsScreen() {
  const router = useRouter();
  const product = MOCK_PRODUCTS[1]; // Giày Sneakers
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1280);

  const handleToggleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 📹 Background Video Simulator */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080' }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={S.dimOverlay} />

      <SafeAreaView style={S.safe}>
        
        {/* Back Button (Top-Left) */}
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Right Sidebar Tools */}
        <View style={S.sidebar}>
          <TouchableOpacity style={S.sidebarBtn} onPress={handleToggleLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={32} color={liked ? T.accent : "#FFF"} />
            <Text style={S.sidebarText}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.sidebarBtn} onPress={() => window.alert('Bình luận mô phỏng')}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color="#FFF" />
            <Text style={S.sidebarText}>284</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.sidebarBtn} onPress={() => window.alert('Mô phỏng chia sẻ')}>
            <Ionicons name="paper-plane-outline" size={28} color="#FFF" />
            <Text style={S.sidebarText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Details & Product Link */}
        <View style={S.bottomDetails}>
          <Text style={S.shopHandle}>@{product.shopName.toLowerCase().replace(/\s+/g, '')}</Text>
          <Text style={S.descText} numberOfLines={2}>
            Review siêu phẩm {product.name} đang làm mưa làm gió dịp thu đông năm nay! Mọi người chốt ngay kẻo hết nhé. 🔥 #review #unboxing
          </Text>

          {/* 🏷️ Linked Product Badge */}
          <TouchableOpacity style={S.productBadge} onPress={() => router.push(`/shopping/product?id=${product.id}`)}>
            <Image source={{ uri: product.image }} style={S.productBadgeImg} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={S.productBadgeTitle} numberOfLines={1}>{product.name}</Text>
              <Text style={S.productBadgePrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={S.productBadgeLinkBtn}>
              <Text style={{ color: '#000', fontSize: 11, fontWeight: '700' }}>Xem ngay</Text>
            </View>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  safe: { flex: 1 },

  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', margin: 16, marginTop: Platform.OS === 'ios' ? 10 : 35 },

  sidebar: { position: 'absolute', right: 16, bottom: 220, gap: 20, alignItems: 'center' },
  sidebarBtn: { alignItems: 'center', gap: 4 },
  sidebarText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

  bottomDetails: { position: 'absolute', left: 16, right: 16, bottom: Platform.OS === 'ios' ? 40 : 20, gap: 10 },
  shopHandle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  descText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },

  productBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 8, borderRadius: 10, marginTop: 10 },
  productBadgeImg: { width: 36, height: 46, borderRadius: 4 },
  productBadgeTitle: { fontSize: 12, fontWeight: '700', color: T.black },
  productBadgePrice: { fontSize: 11, color: T.accent, fontWeight: '700', marginTop: 2 },
  productBadgeLinkBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }
});
