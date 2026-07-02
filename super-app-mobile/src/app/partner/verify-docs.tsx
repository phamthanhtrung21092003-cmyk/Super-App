import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Platform, SafeAreaView, StatusBar, useWindowDimensions,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function VerifyDocsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const accentColor = '#F59E0B'; // Amber

  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [faceId, setFaceId] = useState(false);
  const [businessLicense, setBusinessLicense] = useState(false);

  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const isDocsComplete = idFront && idBack && faceId; // Business license is optional

  const handleNext = () => {
    router.push('/partner/pending');
  };

  const renderUploadBox = (title: string, state: boolean, setter: (val: boolean) => void) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => setter(!state)}
      style={[
        styles.uploadBox, 
        state && { borderColor: accentColor, backgroundColor: 'rgba(245, 158, 11, 0.1)' }
      ]}
    >
      <Ionicons 
        name={state ? "checkmark-circle" : "cloud-upload-outline"} 
        size={32} 
        color={state ? accentColor : '#8F9BB3'} 
      />
      <Text style={[styles.uploadText, state && { color: accentColor }]}>
        {state ? 'Đã tải lên' : title}
      </Text>
    </TouchableOpacity>
  );

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
            <View style={[styles.progressLine, { backgroundColor: accentColor }]} />
            <View style={[styles.progressDot, { backgroundColor: accentColor }]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={[styles.title, { fontFamily: 'Outfit' }]}>Xác minh danh tính</Text>
            <Text style={styles.subtitle}>Bảo mật & an toàn cho cả Đối tác và Khách hàng.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Giấy tờ tùy thân (Bắt buộc)</Text>
            <View style={styles.row}>
              {renderUploadBox('Mặt trước CCCD', idFront, setIdFront)}
              {renderUploadBox('Mặt sau CCCD', idBack, setIdBack)}
            </View>
            <View style={[styles.row, { marginTop: 12 }]}>
              {renderUploadBox('Ảnh khuôn mặt (Face ID)', faceId, setFaceId)}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Giấy phép kinh doanh (Tuỳ chọn)</Text>
            <View style={styles.row}>
              {renderUploadBox('Tải lên GPKD', businessLicense, setBusinessLicense)}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(500)} style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Tài khoản nhận tiền (Bắt buộc)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#8F9BB3" />
              <TextInput
                style={styles.input}
                placeholder="Tên ngân hàng (VD: Vietcombank)"
                placeholderTextColor="#6B7A90"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 12 }]}>
              <Ionicons name="card-outline" size={20} color="#8F9BB3" />
              <TextInput
                style={styles.input}
                placeholder="Số tài khoản"
                placeholderTextColor="#6B7A90"
                keyboardType="numeric"
                value={bankAccount}
                onChangeText={setBankAccount}
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer Area */}
        <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleNext} 
            disabled={!isDocsComplete || !bankName || !bankAccount}
            style={[styles.nextButtonWrapper, (!isDocsComplete || !bankName || !bankAccount) && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={(!isDocsComplete || !bankName || !bankAccount) ? ['#444', '#333'] : [accentColor, '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>HOÀN TẤT ĐĂNG KÝ</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
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
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 22, marginBottom: 20 },
  
  sectionTitle: { fontSize: 14, color: '#E2E8F0', fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12 },
  uploadBox: { flex: 1, height: 100, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', padding: 10 },
  uploadText: { color: '#8F9BB3', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF', marginLeft: 12, height: '100%', ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: 'transparent' },
  nextButtonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  nextButton: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
