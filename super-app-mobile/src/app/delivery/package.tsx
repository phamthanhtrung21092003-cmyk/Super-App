import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function DeliveryPackage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);

  // Laser scan animation
  const laserTop = useSharedValue(0);

  const startScan = () => {
    setIsScanning(true);
    laserTop.value = withRepeat(withTiming(300, { duration: 1500 }), 4, true);
    
    // Simulate AI Vision delay
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        name: 'Laptop (Thiết bị điện tử)',
        weight: '2.5 kg',
        size: '35 x 25 x 5 cm',
        fragile: true,
      });
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
          <Text style={styles.scanningText}>AI đang phân tích ảnh...</Text>
          <View style={styles.scannerFrame}>
             {/* Mocking a camera view */}
             <View style={styles.mockCameraBg} />
             <Animated.View style={[styles.laserLine, animatedLaser]} />
          </View>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hàng hoá</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.aiVisionBtn} onPress={startScan}>
          <Ionicons name="camera" size={28} color="#FFFFFF" />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.aiVisionTitle}>Quét bằng AI Vision</Text>
            <Text style={styles.aiVisionSub}>Tự động nhận diện loại hàng, khối lượng</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên hàng hoá</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ví dụ: Tài liệu, Quần áo..." 
            value={scannedResult?.name}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Khối lượng (kg)</Text>
            <TextInput style={styles.input} placeholder="0.0" value={scannedResult?.weight} />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Kích thước (cm)</Text>
            <TextInput style={styles.input} placeholder="D x R x C" value={scannedResult?.size} />
          </View>
        </View>

        {scannedResult?.fragile && (
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
            <TouchableOpacity style={styles.applyAdvisorBtn}>
              <Text style={styles.applyAdvisorText}>Áp dụng tất cả khuyến nghị</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/delivery/service')}>
          <Text style={styles.nextBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  content: { flex: 1, padding: 20 },
  
  aiVisionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', padding: 20, borderRadius: 20, marginBottom: 24, elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiVisionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  aiVisionSub: { fontSize: 13, color: '#DDD6FE' },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, borderRadius: 16, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  row: { flexDirection: 'row' },
  
  aiPackingAdvisor: { backgroundColor: '#FFFBEB', padding: 20, borderRadius: 24, marginTop: 12, borderWidth: 1, borderColor: '#FDE68A' },
  advisorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  advisorTitle: { fontSize: 16, fontWeight: 'bold', color: '#D97706', marginLeft: 8 },
  advisorMessage: { fontSize: 14, color: '#92400E', lineHeight: 22, marginBottom: 16 },
  advisorList: { gap: 12, marginBottom: 20 },
  advisorListItem: { flexDirection: 'row', alignItems: 'center' },
  advisorListText: { fontSize: 14, color: '#92400E', marginLeft: 8, fontWeight: '500' },
  applyAdvisorBtn: { backgroundColor: '#F59E0B', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  applyAdvisorText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  nextBtn: { backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  
  scannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  scanningText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 32 },
  scannerFrame: { width: 300, height: 300, borderWidth: 2, borderColor: '#8B5CF6', borderRadius: 24, overflow: 'hidden', position: 'relative' },
  mockCameraBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#334155' },
  laserLine: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 }
});
