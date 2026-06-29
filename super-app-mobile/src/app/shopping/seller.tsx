import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
  SafeAreaView, StatusBar, Image, ScrollView, TextInput, Modal, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MOCK_PRODUCTS } from './index';

const T = {
  black: '#0F172A',
  white: '#FFFFFF',
  bg: '#F8FAFC',
  sub: '#64748B',
  border: '#E2E8F0',
  accent: '#4F46E5',
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  shopName: string;
  category?: string;
};

export default function SellerCenterScreen() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([
    ...MOCK_PRODUCTS.filter(p => p.shopId === 's1')
  ]);

  const [orders, setOrders] = useState([
    { id: 'ORD001', receiver: 'Nguyễn Văn A', total: 29990000, status: 'Chờ giao hàng', date: '29/06/2026' },
    { id: 'ORD002', receiver: 'Trần Thị B', total: 1850000, status: 'Đã bàn giao', date: '28/06/2026' },
    { id: 'ORD003', receiver: 'Phạm Văn C', total: 450000, status: 'Hoàn thành', date: '27/06/2026' }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'products' | 'orders'>('stats');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // CRUD Product Form States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImage, setProdImage] = useState('');

  const handleAddProduct = () => {
    if (!prodName || !prodPrice) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và giá sản phẩm');
      return;
    }
    const newProduct: Product = {
      id: 'p_new_' + Date.now(),
      name: prodName,
      price: parseFloat(prodPrice),
      image: prodImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      shopName: 'Shop của bạn',
      category: prodCategory || 'Thời trang'
    };
    setProducts([...products, newProduct]);
    setShowAddProductModal(false);
    // Reset Form
    setProdName('');
    setProdPrice('');
    setProdCategory('');
    setProdImage('');
    Alert.alert('Thành công', 'Đã đăng bán sản phẩm mới thành công!');
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn gỡ sản phẩm này khỏi sàn không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => {
          setProducts(products.filter(p => p.id !== id));
          Alert.alert('Đã xóa', 'Sản phẩm đã được gỡ xuống.');
        }}
      ]
    );
  };

  const handleFulfillOrder = (id: string) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return { ...o, status: 'Đã bàn giao' };
      }
      return o;
    }));
    Alert.alert('Thành công', `Đơn hàng ${id} đã được in nhãn và bàn giao cho Đơn vị vận chuyển!`);
  };

  return (
    <View style={S.root}>
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.bg} translucent={false} />
        
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={24} color={T.black} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>SELLER CENTER</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Selector */}
        <View style={S.tabSelector}>
          {[
            { key: 'stats', label: 'Biểu đồ', icon: 'bar-chart-outline' },
            { key: 'products', label: 'Kho hàng', icon: 'cube-outline' },
            { key: 'orders', label: 'Đơn hàng', icon: 'document-text-outline' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[S.tabItem, activeSubTab === tab.key && S.tabItemActive]}
              onPress={() => setActiveSubTab(tab.key as any)}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeSubTab === tab.key ? T.accent : T.sub} />
              <Text style={[S.tabText, activeSubTab === tab.key && { color: T.accent, fontWeight: '700' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* TAB 1: STATS & REVENUE */}
          {activeSubTab === 'stats' && (
            <View style={{ padding: 20 }}>
              <Text style={S.sectionTitle}>BIỂU ĐỒ DOANH THU & HIỆU SUẤT</Text>
              
              {/* Stats Grid */}
              <View style={S.statsGrid}>
                <View style={S.statCard}>
                  <Text style={S.statValue}>125.4M</Text>
                  <Text style={S.statLabel}>Doanh thu (VND)</Text>
                </View>
                <View style={S.statCard}>
                  <Text style={S.statValue}>48</Text>
                  <Text style={S.statLabel}>Đơn hàng mới</Text>
                </View>
                <View style={S.statCard}>
                  <Text style={S.statValue}>14.5k</Text>
                  <Text style={S.statLabel}>Lượt xem sản phẩm</Text>
                </View>
                <View style={S.statCard}>
                  <Text style={[S.statValue, { color: '#10B981' }]}>98%</Text>
                  <Text style={S.statLabel}>Tỉ lệ phản hồi chat</Text>
                </View>
              </View>

              {/* simulated charts */}
              <View style={S.chartBox}>
                <Text style={S.chartTitle}>Doanh Thu Tuần Này</Text>
                <View style={S.barChartContainer}>
                  {[
                    { day: 'T2', val: 40 },
                    { day: 'T3', val: 65 },
                    { day: 'T4', val: 30 },
                    { day: 'T5', val: 85 },
                    { day: 'T6', val: 120 },
                    { day: 'T7', val: 95 },
                    { day: 'CN', val: 110 },
                  ].map(b => (
                    <View key={b.day} style={S.chartBarCol}>
                      <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
                        <View style={[S.chartBarFill, { height: `${(b.val / 120) * 100}%`, backgroundColor: T.accent }]} />
                      </View>
                      <Text style={S.chartBarDay}>{b.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeSubTab === 'products' && (
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={S.sectionTitle}>DANH SÁCH SẢN PHẨM ({products.length})</Text>
                <TouchableOpacity style={S.addProductBtn} onPress={() => setShowAddProductModal(true)}>
                  <Text style={S.addProductBtnTxt}>+ Thêm sản phẩm</Text>
                </TouchableOpacity>
              </View>

              {products.map(p => (
                <View key={p.id} style={S.productRow}>
                  <Image source={{ uri: p.image }} style={S.productImg} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={S.productName} numberOfLines={1}>{p.name}</Text>
                    <Text style={S.productCategory}>{p.category || 'Điện thoại'}</Text>
                    <Text style={S.productPrice}>{p.price.toLocaleString('vi-VN')}đ</Text>
                  </View>
                  <View style={S.productActions}>
                    <TouchableOpacity onPress={() => handleDeleteProduct(p.id)} style={S.actionDelBtn}>
                      <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: ORDERS & FULFILLMENT */}
          {activeSubTab === 'orders' && (
            <View style={{ padding: 20 }}>
              <Text style={S.sectionTitle}>QUẢN LÝ ĐƠN HÀNG</Text>
              
              {orders.map(o => (
                <View key={o.id} style={S.orderCard}>
                  <View style={S.orderHeader}>
                    <Text style={S.orderId}>Mã ĐH: {o.id}</Text>
                    <View style={[S.statusBadge, o.status === 'Chờ giao hàng' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                      <Text style={[S.statusBadgeText, o.status === 'Chờ giao hàng' && { color: '#D97706' }]}>{o.status}</Text>
                    </View>
                  </View>
                  <Text style={S.orderText}>Khách hàng: {o.receiver}</Text>
                  <Text style={S.orderText}>Tổng tiền: {o.total.toLocaleString('vi-VN')}đ</Text>
                  <Text style={S.orderText}>Ngày đặt: {o.date}</Text>

                  {o.status === 'Chờ giao hàng' && (
                    <View style={S.orderActions}>
                      <TouchableOpacity style={S.fulfillBtn} onPress={() => handleFulfillOrder(o.id)}>
                        <Ionicons name="print-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={S.fulfillBtnText}>In nhãn & Bàn giao ĐVVC</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ➕ ADD PRODUCT FORM MODAL */}
        <Modal visible={showAddProductModal} transparent animationType="slide">
          <View style={S.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowAddProductModal(false)} />
            <View style={S.modalCard}>
              <Text style={S.modalTitle}>ĐĂNG BÁN SẢN PHẨM MỚI</Text>

              <Text style={S.inputLabel}>Tên sản phẩm *</Text>
              <TextInput style={S.input} value={prodName} onChangeText={setProdName} placeholder="Nhập tên sản phẩm..." placeholderTextColor="#888" />

              <Text style={S.inputLabel}>Giá bán (VND) *</Text>
              <TextInput style={S.input} value={prodPrice} onChangeText={prod => setProdPrice(prod.replace(/[^0-9]/g, ''))} placeholder="Nhập giá bán..." placeholderTextColor="#888" keyboardType="numeric" />

              <Text style={S.inputLabel}>Danh mục</Text>
              <TextInput style={S.input} value={prodCategory} onChangeText={setProdCategory} placeholder="Ví dụ: Thời trang, Điện thoại..." placeholderTextColor="#888" />

              <Text style={S.inputLabel}>Link hình ảnh</Text>
              <TextInput style={S.input} value={prodImage} onChangeText={setProdImage} placeholder="Link Unsplash hoặc bỏ trống lấy ảnh mặc định..." placeholderTextColor="#888" />

              <View style={S.modalButtons}>
                <TouchableOpacity style={[S.modalBtn, { backgroundColor: T.border }]} onPress={() => setShowAddProductModal(false)}>
                  <Text style={{ color: T.black }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.modalBtn, { backgroundColor: T.accent }]} onPress={handleAddProduct}>
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>Đăng Bán</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 2, color: T.black },

  tabSelector: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: T.white },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: T.accent },
  tabText: { fontSize: 12, color: T.sub, fontWeight: '500' },

  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: T.black, marginBottom: 16 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: T.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border },
  statValue: { fontSize: 22, fontWeight: '800', color: T.black },
  statLabel: { fontSize: 10, color: T.sub, marginTop: 4, fontWeight: '600' },

  chartBox: { backgroundColor: T.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginTop: 20 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: T.black, marginBottom: 20 },
  barChartContainer: { flexDirection: 'row', height: 150, justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10 },
  chartBarCol: { alignItems: 'center', width: 24, height: '100%' },
  chartBarFill: { width: 12, borderRadius: 6 },
  chartBarDay: { fontSize: 10, color: T.sub, marginTop: 8 },

  // Products List
  addProductBtn: { backgroundColor: T.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addProductBtnTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 10 },
  productImg: { width: 50, height: 60, borderRadius: 6 },
  productCategory: { fontSize: 10, color: T.sub, marginTop: 2 },
  productPrice: { fontSize: 12, fontWeight: '700', color: T.accent, marginTop: 4 },
  productActions: { marginLeft: 'auto' },
  actionDelBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,77,77,0.06)', justifyContent: 'center', alignItems: 'center' },

  // Orders
  orderCard: { backgroundColor: T.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 12, fontWeight: '700', color: T.black },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: T.border },
  statusBadgeText: { fontSize: 9, fontWeight: '700', color: T.sub },
  orderText: { fontSize: 12, color: T.sub, marginTop: 4 },
  orderActions: { borderTopWidth: 1, borderTopColor: T.border, marginTop: 12, paddingTop: 12, alignItems: 'flex-end' },
  fulfillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  fulfillBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: T.white, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1, color: T.black, marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: T.sub, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: T.black },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 24 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});
