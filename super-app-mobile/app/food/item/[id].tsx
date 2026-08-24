import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const accentColor = '#F97316';

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [toppings, setToppings] = useState<string[]>([]);

  const toggleTopping = (t: string) => {
    setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const MOCK_ITEM = {
    name: 'Pizza Hải Sản Viền Phô Mai',
    desc: 'Tôm, mực, nghêu, ớt chuông, phô mai dầy, viền phô mai béo ngậy.',
    price: 185000,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    calories: '450 Kcal',
    allergies: ['Hải sản', 'Sữa'],
  };

  const calculateTotal = () => {
    let total = MOCK_ITEM.price;
    if (size === 'L') total += 50000;
    if (size === 'S') total -= 30000;
    total += toppings.length * 20000;
    return total * quantity;
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Floating Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/food')}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#FFF' }}>
          
          <Animated.View entering={FadeInDown.duration(400)}>
            <Image source={{ uri: MOCK_ITEM.img }} style={styles.heroImg} />
            <LinearGradient colors={['rgba(255,255,255,0.05)', '#FFF']} style={styles.heroGradient} />
          </Animated.View>

          <View style={styles.content}>
            {/* Title & Desc */}
            <Animated.View entering={FadeInUp.duration(400)}>
              <Text style={styles.title}>{MOCK_ITEM.name}</Text>
              <Text style={styles.desc}>{MOCK_ITEM.desc}</Text>
              <Text style={styles.priceText}>{MOCK_ITEM.price.toLocaleString('vi-VN')}đ</Text>
            </Animated.View>

            {/* AI Nutrition Facts */}
            <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.aiBox}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={16} color="#F59E0B" />
                <Text style={styles.aiTitle}>AI Dinh Dưỡng</Text>
              </View>
              <View style={styles.aiRow}>
                <View style={styles.aiItem}>
                  <Text style={styles.aiLabel}>Năng lượng</Text>
                  <Text style={styles.aiValue}>{MOCK_ITEM.calories}</Text>
                </View>
                <View style={styles.aiItem}>
                  <Text style={styles.aiLabel}>Dị ứng</Text>
                  <Text style={[styles.aiValue, { color: '#EF4444' }]}>{MOCK_ITEM.allergies.join(', ')}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Customization: Size */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chọn Kích cỡ</Text>
                <Text style={styles.reqBadge}>Bắt buộc</Text>
              </View>
              <View style={styles.optionsList}>
                {['S', 'M', 'L'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.radioItem, size === s && { borderColor: accentColor, backgroundColor: 'rgba(249, 115, 22, 0.05)' }]}
                    onPress={() => setSize(s)}
                  >
                    <View style={styles.radioRow}>
                      <View style={[styles.radioDot, size === s && { borderColor: accentColor }]}>
                        {size === s && <View style={[styles.radioFill, { backgroundColor: accentColor }]} />}
                      </View>
                      <Text style={styles.optionName}>Size {s}</Text>
                    </View>
                    <Text style={styles.optionPrice}>{s === 'L' ? '+50.000đ' : s === 'S' ? '-30.000đ' : 'Miễn phí'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Customization: Toppings */}
            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Topping Thêm</Text>
                <Text style={styles.optBadge}>Tùy chọn</Text>
              </View>
              <View style={styles.optionsList}>
                {['Thêm Phô Mai', 'Thêm Xúc Xích', 'Thêm Hành Tây'].map(t => {
                  const isChecked = toppings.includes(t);
                  return (
                    <TouchableOpacity 
                      key={t} 
                      style={[styles.radioItem, isChecked && { borderColor: accentColor, backgroundColor: 'rgba(249, 115, 22, 0.05)' }]}
                      onPress={() => toggleTopping(t)}
                    >
                      <View style={styles.radioRow}>
                        <View style={[styles.checkbox, isChecked && { backgroundColor: accentColor, borderColor: accentColor }]}>
                          {isChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                        <Text style={styles.optionName}>{t}</Text>
                      </View>
                      <Text style={styles.optionPrice}>+20.000đ</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => quantity > 1 && setQuantity(quantity - 1)} style={styles.qtyBtn}>
              <Ionicons name="remove" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
              <Ionicons name="add" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.addCartBtn, { backgroundColor: accentColor }]} onPress={() => {
            alert('Đã thêm vào giỏ hàng!');
            if (router.canGoBack()) router.back();
            else router.replace('/food');
          }}>
            <Text style={styles.addCartText}>Thêm • {calculateTotal().toLocaleString('vi-VN')}đ</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#FFF', width: '100%', position: 'relative' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#E2E8F0', borderRadius: 55, overflow: 'hidden' },
  
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  
  heroImg: { width: '100%', height: 350 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  
  content: { paddingHorizontal: 16, marginTop: -20 },
  
  title: { color: '#0F172A', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#64748B', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  priceText: { color: '#F97316', fontSize: 22, fontWeight: '800', marginBottom: 20 },

  aiBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  aiTitle: { color: '#F59E0B', fontSize: 14, fontWeight: '700' },
  aiRow: { flexDirection: 'row', gap: 20 },
  aiItem: { flex: 1 },
  aiLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  aiValue: { color: '#0F172A', fontSize: 14, fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  reqBadge: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#F97316', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700' },
  optBadge: { backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#64748B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700' },
  
  optionsList: { gap: 12 },
  radioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  optionName: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
  optionPrice: { color: '#64748B', fontSize: 14 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 30 : 16, flexDirection: 'row', gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  qtyBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#0F172A', fontSize: 16, fontWeight: '700', width: 30, textAlign: 'center' },
  addCartBtn: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addCartText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
