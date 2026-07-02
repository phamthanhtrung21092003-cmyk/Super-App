import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PARTNER_TYPES = [
  { id: 'homestay', name: 'Homestay', icon: 'home' },
  { id: 'hotel', name: 'Khách sạn', icon: 'business' },
  { id: 'restaurant', name: 'Nhà hàng', icon: 'restaurant' },
  { id: 'camping', name: 'Camping', icon: 'bonfire' },
  { id: 'car_rental', name: 'Thuê xe', icon: 'car' },
  { id: 'tour_guide', name: 'Hướng dẫn viên', icon: 'map' },
  { id: 'attraction', name: 'Điểm tham quan', icon: 'camera' },
  { id: 'other', name: 'Dịch vụ khác', icon: 'apps' },
];

export default function RegisterTypeScreen() {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F59E0B'; // Amber

  const toggleType = (id: string) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedTypes.length === 0) return;
    router.push({
      pathname: '/partner/verify-docs',
      params: { types: selectedTypes.join(',') }
    });
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <LinearGradient
          colors={['#0F172A', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: accentColor }]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={[styles.title, { fontFamily: 'Outfit' }]}>Loại hình kinh doanh</Text>
            <Text style={styles.subtitle}>Bạn dự định kinh doanh dịch vụ nào trên Super App? (Có thể chọn nhiều)</Text>
          </Animated.View>

          <View style={styles.grid}>
            {PARTNER_TYPES.map((type, index) => {
              const isSelected = selectedTypes.includes(type.id);
              return (
                <Animated.View 
                  key={type.id} 
                  entering={FadeInUp.delay(100 * index).duration(500)}
                  style={{ width: '48%', marginBottom: 16 }}
                >
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => toggleType(type.id)}
                    style={[
                      styles.typeCard,
                      isSelected && { borderColor: accentColor, backgroundColor: 'rgba(245, 158, 11, 0.15)' }
                    ]}
                  >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
                        <Ionicons name="checkmark" size={14} color="#000" />
                      </View>
                    )}
                    <View style={[styles.iconWrap, isSelected && { backgroundColor: accentColor }]}>
                      <Ionicons name={type.icon as any} size={28} color={isSelected ? '#000' : '#8F9BB3'} />
                    </View>
                    <Text style={[styles.typeName, isSelected && { color: '#FFF', fontWeight: '700' }]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Area */}
        <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleNext} 
            disabled={selectedTypes.length === 0}
            style={[styles.nextButtonWrapper, selectedTypes.length === 0 && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={selectedTypes.length === 0 ? ['#444', '#333'] : [accentColor, '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>TIẾP TỤC</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 40 }) },
  safeArea: { flex: 1, backgroundColor: '#000', width: '100%' },
  desktopFrame: { maxWidth: 414, maxHeight: 896, aspectRatio: 414 / 896, borderWidth: 10, borderColor: '#111', borderRadius: 55, overflow: 'hidden' },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  progressContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 40, gap: 8 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressLine: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  scrollContent: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 22, marginBottom: 30 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeCard: { height: 130, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 10, position: 'relative' },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  typeName: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: 'transparent' },
  nextButtonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  nextButton: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
