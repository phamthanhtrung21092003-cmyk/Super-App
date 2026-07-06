import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function DeliveryPackage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemSize, setItemSize] = useState('');
  const [advisorApplied, setAdvisorApplied] = useState(false);

  // Laser scan animation
  const laserTop = useSharedValue(0);

  const startScan = () => {
    setIsScanning(true);
    laserTop.value = withRepeat(withTiming(300, { duration: 1500 }), 4, true);
    
    setTimeout(() => {
      setIsScanning(false);
      const result = {
        name: 'Laptop (Thiết bị điện tử)',
        weight: '2.5',
        size: '35 x 25 x 5',
        fragile: true,
      };
      setScannedResult(result);
      setItemName(result.name);
      setItemWeight(result.weight);
      setItemSize(result.size);
    }, 3000);
  };

  const animatedLaser = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: laserTop.value }]
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* AI Vision Scanner Overlay */}
      {isScanning && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.scannerOverlay}>
          <View style={styles.scannerContent}>
            <Ionicons name="scan" size={32} color="#8B5CF6" style={{ marginBottom: 16 }} />
            <Text style={styles.scanningText}>AI đang phân tích ảnh...</Text>
            <Text style={styles.scanningSubText}>Nhận diện loại hàng, kích thước & khối lượng</Text>
          </View>
          <View style={styles.scannerFrame}>
            <View style={styles.mockCameraBg} />
            <Animated.View style={[styles.laserLine, animatedLaser]} />
            {/* Corner brackets */}
            <View style={[styles.cornerBracket, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.cornerBracket, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
            <View style={[styles.cornerBracket, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[styles.cornerBracket, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
          </View>
          <TouchableOpacity
            style={styles.cancelScanBtn}
            onPress={() => setIsScanning(false)}
          >
            <Text style={styles.cancelScanText}>Huỷ quét</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/delivery/create');
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hàng hoá</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Vision Button */}
        <TouchableOpacity style={styles.aiVisionBtn} onPress={startScan}>
          <View style={styles.aiVisionIconWrap}>
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.aiVisionTitle}>Quét bằng AI Vision</Text>
            <Text style={styles.aiVisionSub}>Tự động nhận diện loại hàng, khối lượng</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#DDD6FE" />
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên hàng hoá</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ví dụ: Tài liệu, Quần áo..." 
            placeholderTextColor="#94A3B8"
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Khối lượng (kg)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0.0" 
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={itemWeight}
              onChangeText={setItemWeight}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Kích thước (cm)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="D x R x C" 
              placeholderTextColor="#94A3B8"
              value={itemSize}
              onChangeText={setItemSize}
            />
          </View>
        </View>

        {/* Note field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ghi chú cho tài xế</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Ví dụ: Hàng dễ vỡ, gọi trước khi giao..." 
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        {/* AI Packing Advisor */}
        {scannedResult?.fragile && !advisorApplied && (
          <Animated.View entering={SlideInDown} style={styles.aiPackingAdvisor}>
            <View style={styles.advisorHeader}>
              <Ionicons name="warning" size={24} color="#D97706" />
              <Text style={styles.advisorTitle}>AI Packing Advisor</Text>
            </View>
            <Text style={styles.advisorMessage}>
              Hàng hoá được nhận diện là thiết bị điện tử đắt tiền và dễ vỡ. Để đảm bảo an toàn, AI khuyến nghị:
            </Text>
            <View style={styles.advisorList}>
              <View style={styles.advisorListItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.advisorListText}>Bọc 3 lớp nilon chống sốc (Bubble wrap)</Text>
              </View>
              <View style={styles.advisorListItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.advisorListText}>Sử dụng hộp carton vừa khít</Text>
              </View>
              <View style={styles.advisorListItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.advisorListText}>Mua thêm gói bảo hiểm hàng hoá (20.000đ)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.applyAdvisorBtn}
              onPress={() => {
                setAdvisorApplied(true);
                if (Platform.OS === 'web') {
                  window.alert('✅ Đã áp dụng tất cả khuyến nghị đóng gói!\n\n• Bọc 3 lớp nilon chống sốc\n• Sử dụng hộp carton vừa khít\n• Đã thêm bảo hiểm hàng hoá (+20.000đ)');
                }
              }}
            >
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.applyAdvisorText}>Áp dụng tất cả khuyến nghị</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {advisorApplied && (
          <Animated.View entering={FadeIn} style={styles.advisorAppliedCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.advisorAppliedTitle}>Đã áp dụng khuyến nghị đóng gói</Text>
              <Text style={styles.advisorAppliedSub}>Bọc chống sốc + Hộp carton + Bảo hiểm hàng hoá</Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !itemName && styles.nextBtnDisabled]}
          onPress={() => router.push('/delivery/service')}
        >
          <Text style={styles.nextBtnText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },

  content: { flex: 1, padding: 20 },

  // AI Vision
  aiVisionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#8B5CF6', padding: 18, borderRadius: 20, marginBottom: 24,
    elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  aiVisionIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  aiVisionTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  aiVisionSub: { fontSize: 13, color: '#DDD6FE' },

  // Form
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, borderRadius: 14, fontSize: 15, color: '#0F172A', fontWeight: '500',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  row: { flexDirection: 'row' },

  // AI Advisor
  aiPackingAdvisor: {
    backgroundColor: '#FFFBEB', padding: 20, borderRadius: 20,
    marginTop: 8, borderWidth: 1, borderColor: '#FDE68A',
  },
  advisorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  advisorTitle: { fontSize: 16, fontWeight: 'bold', color: '#D97706', marginLeft: 8 },
  advisorMessage: { fontSize: 14, color: '#92400E', lineHeight: 22, marginBottom: 16 },
  advisorList: { gap: 12, marginBottom: 20 },
  advisorListItem: { flexDirection: 'row', alignItems: 'center' },
  advisorListText: { fontSize: 14, color: '#92400E', marginLeft: 8, fontWeight: '500' },
  applyAdvisorBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F59E0B', paddingVertical: 14, borderRadius: 14,
  },
  applyAdvisorText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  // Advisor applied
  advisorAppliedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#BBF7D0', marginTop: 8,
  },
  advisorAppliedTitle: { fontSize: 15, fontWeight: 'bold', color: '#059669' },
  advisorAppliedSub: { fontSize: 12, color: '#047857', marginTop: 2 },

  // Footer
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  nextBtn: {
    backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  // Scanner
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 100, justifyContent: 'center', alignItems: 'center',
  },
  scannerContent: { alignItems: 'center', marginBottom: 24 },
  scanningText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  scanningSubText: { color: '#94A3B8', fontSize: 14, marginTop: 6 },
  scannerFrame: {
    width: 280, height: 280, borderRadius: 24, overflow: 'hidden', position: 'relative',
  },
  mockCameraBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#334155' },
  laserLine: {
    position: 'absolute', left: 0, right: 0, height: 4,
    backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10,
  },
  cornerBracket: {
    position: 'absolute', width: 30, height: 30, borderColor: '#8B5CF6',
  },
  cancelScanBtn: {
    marginTop: 24, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelScanText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
