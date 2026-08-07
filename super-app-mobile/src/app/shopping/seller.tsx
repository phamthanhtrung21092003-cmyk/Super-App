import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const T = {
  black: '#111827',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
  accent: '#00B14F',
  accentLight: '#E6F4EA',
};

export default function SellerCenterScreen() {
  const router = useRouter();

  const handleOpenWebPortal = () => {
    if (Platform.OS === 'web') {
      window.open('http://localhost:5173', '_blank');
    } else {
      Linking.openURL('http://192.168.12.109:5173');
    }
  };

  return (
    <SafeAreaView style={S.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />
      
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={24} color={T.black} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>KÊNH NGƯỜI BÁN</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Notice Card */}
      <View style={S.content}>
        <View style={S.card}>
          <View style={S.iconBadge}>
            <Ionicons name="desktop-outline" size={48} color={T.accent} />
          </View>
          <Text style={S.title}>Kênh Người Bán S-shopping (Web Portal)</Text>
          <Text style={S.subtitle}>
            Tính năng Tạo cửa hàng, Đăng bán sản phẩm và Quản lý kho hàng hiện được chuyển sang giao diện Web dành riêng cho máy tính PC.
          </Text>

          <TouchableOpacity style={S.openWebBtn} onPress={handleOpenWebPortal}>
            <Ionicons name="open-outline" size={18} color={T.white} style={{ marginRight: 8 }} />
            <Text style={S.openWebBtnTxt}>Truy Cập Web Portal Kênh Người Bán</Text>
          </TouchableOpacity>

          <Text style={S.urlNote}>Đường dẫn: http://localhost:5173</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: T.white, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: T.black, letterSpacing: 1 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, backgroundColor: T.white, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: T.accentLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '800', color: T.black, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 13, color: T.sub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  openWebBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  openWebBtnTxt: { color: T.white, fontSize: 13, fontWeight: '700' },
  urlNote: { fontSize: 11, color: T.sub, marginTop: 14, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }
});
