import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DeliveryService() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState('standard');
  const [selectedVehicle, setSelectedVehicle] = useState('bike');
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({
    id: 'superpay',
    name: 'Ví SuperPay',
    icon: 'wallet-outline',
    color: '#3B82F6',
    desc: 'Hoàn 8% nhờ AI tối ưu'
  });
  
  // Voucher States
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const services = [
    { id: 'express', name: 'Siêu tốc', price: 45000, eta: '30 phút', desc: 'Giao nhanh nhất', icon: 'flash' },
    { id: 'standard', name: 'Tiêu chuẩn', price: 25000, eta: '4 giờ', desc: 'Tiết kiệm chi phí', icon: 'time', aiRecommend: true },
  ];

  const vehicles = [
    { id: 'bike', name: 'Xe máy', icon: 'bicycle', disabled: false, extraFee: 0 },
    { id: 'van', name: 'Xe Van (Nhỏ)', icon: 'car-sport', disabled: false, eco: true, extraFee: 15000 },
    { id: 'truck', name: 'Xe tải', icon: 'bus', disabled: true, reason: 'AI: Không cần thiết cho kiện hàng 2.5kg', extraFee: 50000 },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt', icon: 'cash-outline', color: '#10B981', desc: 'Thanh toán khi nhận hàng' },
    { id: 'superpay', name: 'Ví SuperPay', icon: 'wallet-outline', color: '#3B82F6', desc: 'Hoàn 8% nhờ AI tối ưu' },
    { id: 'card', name: 'Thẻ tín dụng', icon: 'card-outline', color: '#8B5CF6', desc: 'Visa, Mastercard' },
    { id: 'qr', name: 'VNPAY QR', icon: 'qr-code-outline', color: '#EF4444', desc: 'Quét mã thanh toán' }
  ];

  const vouchers = [
    { code: 'GIAOAI15', title: 'GIAOAI15', desc: 'Giảm 15% phí dịch vụ', type: 'pct', value: 0.15 },
    { code: 'FREESHIP20', title: 'FREESHIP20', desc: 'Giảm 20.000đ phí giao hàng', type: 'fixed', value: 20000 },
    { code: 'VNPAY5K', title: 'VNPAY5K', desc: 'Giảm 5.000đ thanh toán VNPAY', type: 'fixed', value: 5000 }
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
  
  const rawPrice = (selectedServiceData?.price || 0) + (selectedVehicleData?.extraFee || 0);

  // Calculate discount
  const getCalculatedDiscount = () => {
    if (!selectedVoucher) return 0;
    const v = vouchers.find(x => x.code === selectedVoucher);
    if (!v) return 0;
    if (v.type === 'pct') {
      return Math.round((selectedServiceData?.price || 0) * v.value);
    }
    return Math.min(rawPrice, v.value);
  };

  const currentDiscount = getCalculatedDiscount();
  const totalPrice = Math.max(0, rawPrice - currentDiscount);

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const handleOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      router.push('/delivery/tracking');
    }, 1200);
  };

  const handleApplyVoucher = (code: string) => {
    setSelectedVoucher(code);
    setShowVoucherModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/delivery/package');
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ & Phương tiện</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Service Selection */}
        <Text style={styles.sectionTitle}>Loại dịch vụ</Text>
        <View style={styles.serviceList}>
          {services.map(s => (
            <TouchableOpacity 
              key={s.id} 
              style={[styles.serviceItem, selectedService === s.id && styles.serviceItemSelected]}
              onPress={() => setSelectedService(s.id)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceLeft}>
                  <View style={[styles.serviceIconWrap, selectedService === s.id && { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name={s.icon as any} size={20} color={selectedService === s.id ? '#10B981' : '#64748B'} />
                  </View>
                  <View>
                    <Text style={[styles.serviceName, selectedService === s.id && { color: '#10B981' }]}>{s.name}</Text>
                    <Text style={styles.serviceDesc}>{s.desc} • Chờ {s.eta}</Text>
                  </View>
                </View>
                <Text style={[styles.servicePrice, selectedService === s.id && { color: '#10B981' }]}>{formatPrice(s.price)}</Text>
              </View>
              
              {s.aiRecommend && (
                <View style={styles.aiTag}>
                  <Ionicons name="sparkles" size={14} color="#D97706" />
                  <Text style={styles.aiTagText}>AI Khuyên Dùng: Tiết kiệm 20.000đ do bạn không vội.</Text>
                </View>
              )}

              <View style={styles.radioRow}>
                <Ionicons
                  name={selectedService === s.id ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={selectedService === s.id ? '#10B981' : '#CBD5E1'}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vehicle Selection */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Phương tiện vận chuyển</Text>
        <View style={styles.vehicleList}>
          {vehicles.map(v => (
            <TouchableOpacity 
              key={v.id} 
              disabled={v.disabled}
              style={[
                styles.vehicleItem, 
                selectedVehicle === v.id && styles.vehicleItemSelected,
                v.disabled && styles.vehicleItemDisabled
              ]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <View style={[styles.vehicleIconWrapper, selectedVehicle === v.id && { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name={v.icon as any} size={28} color={v.disabled ? '#CBD5E1' : (selectedVehicle === v.id ? '#10B981' : '#475569')} />
              </View>
              <View style={styles.vehicleInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.vehicleName, v.disabled && { color: '#94A3B8' }, selectedVehicle === v.id && { color: '#10B981' }]}>{v.name}</Text>
                  {v.eco && (
                    <View style={styles.ecoBadge}>
                      <Ionicons name="leaf" size={12} color="#10B981" />
                      <Text style={styles.ecoText}>Eco</Text>
                    </View>
                  )}
                </View>
                {v.extraFee > 0 && !v.disabled && (
                  <Text style={styles.vehicleFee}>+{formatPrice(v.extraFee)}</Text>
                )}
                {v.disabled && (
                  <Text style={styles.vehicleDisabledReason}>{v.reason}</Text>
                )}
              </View>
              <Ionicons name={selectedVehicle === v.id ? "radio-button-on" : "radio-button-off"} size={24} color={v.disabled ? '#CBD5E1' : (selectedVehicle === v.id ? '#10B981' : '#CBD5E1')} />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Green Delivery */}
        {selectedVehicle === 'van' && (
          <View style={styles.aiGreenBox}>
            <Ionicons name="leaf" size={24} color="#10B981" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.aiGreenTitle}>AI Green Delivery 🌱</Text>
              <Text style={styles.aiGreenText}>Xe Van hiện đang chạy ghép đơn qua khu vực của bạn. Nếu chọn xe này, bạn giúp giảm 2.4kg CO₂ phát thải ra môi trường.</Text>
            </View>
          </View>
        )}

        {/* Voucher/Promo selection row */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Ưu đãi khuyến mãi</Text>
        <TouchableOpacity style={styles.promoSelector} onPress={() => setShowVoucherModal(true)}>
          <View style={styles.promoLeft}>
            <Ionicons name="pricetag-outline" size={20} color="#EF4444" />
            <Text style={styles.promoText}>
              {selectedVoucher ? `Đang áp dụng mã: ${selectedVoucher}` : 'Chọn mã giảm giá (Voucher)...'}
            </Text>
          </View>
          <View style={styles.promoRight}>
            {selectedVoucher && (
              <TouchableOpacity onPress={() => setSelectedVoucher(null)} style={{ marginRight: 8 }}>
                <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Xóa</Text>
              </TouchableOpacity>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dịch vụ: {selectedServiceData?.name}</Text>
            <Text style={styles.summaryValue}>{formatPrice(selectedServiceData?.price || 0)}</Text>
          </View>
          {(selectedVehicleData?.extraFee || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phụ phí {selectedVehicleData?.name}</Text>
              <Text style={styles.summaryValue}>+{formatPrice(selectedVehicleData?.extraFee || 0)}</Text>
            </View>
          )}
          {selectedVoucher && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Khuyến mãi ({selectedVoucher})</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-{formatPrice(currentDiscount)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.paymentMethod} onPress={() => setShowPaymentModal(true)}>
          <Ionicons name={selectedPayment.icon as any} size={22} color={selectedPayment.color} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.paymentName}>{selectedPayment.name}</Text>
            <Text style={styles.paymentPromo}>{selectedPayment.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, isOrdering && styles.nextBtnOrdering]}
          onPress={handleOrder}
          disabled={isOrdering}
        >
          {isOrdering ? (
            <Text style={styles.nextBtnText}>Đang xử lý...</Text>
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.nextBtnText}>Thanh toán & Đặt đơn</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Selection Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Chọn phương thức để hoàn tất thanh toán đơn hàng.</Text>

            <ScrollView style={styles.paymentList} showsVerticalScrollIndicator={false}>
              {paymentMethods.map(pm => (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.paymentItem, selectedPayment.id === pm.id && styles.paymentItemSelected]}
                  onPress={() => {
                    setSelectedPayment(pm);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={[styles.pmIconWrap, { backgroundColor: pm.color + '15' }]}>
                    <Ionicons name={pm.icon as any} size={24} color={pm.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pmName}>{pm.name}</Text>
                    <Text style={styles.pmDesc}>{pm.desc}</Text>
                  </View>
                  <Ionicons
                    name={selectedPayment.id === pm.id ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selectedPayment.id === pm.id ? '#10B981' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Voucher Selection Modal */}
      <Modal visible={showVoucherModal} transparent animationType="slide" onRequestClose={() => setShowVoucherModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <View style={styles.bsHeader}>
              <Text style={styles.bsTitle}>Chọn mã khuyến mãi</Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bsSub}>Áp dụng mã giảm giá để tối ưu hóa phí vận chuyển của bạn.</Text>

            <ScrollView style={styles.paymentList} showsVerticalScrollIndicator={false}>
              {vouchers.map(v => (
                <TouchableOpacity
                  key={v.code}
                  style={[styles.paymentItem, selectedVoucher === v.code && styles.paymentItemSelected]}
                  onPress={() => handleApplyVoucher(v.code)}
                >
                  <View style={[styles.pmIconWrap, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="pricetag" size={24} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pmName}>{v.title}</Text>
                    <Text style={styles.pmDesc}>{v.desc}</Text>
                  </View>
                  <Ionicons
                    name={selectedVoucher === v.code ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selectedVoucher === v.code ? '#10B981' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },

  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 14 },

  // Services
  serviceList: { gap: 14 },
  serviceItem: {
    backgroundColor: '#F8FAFC', padding: 18, borderRadius: 18,
    borderWidth: 2, borderColor: 'transparent',
  },
  serviceItemSelected: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceLeft: { flexDirection: 'row', alignItems: 'center' },
  serviceIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  serviceName: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  servicePrice: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  serviceDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  radioRow: { alignItems: 'flex-end', marginTop: 8 },

  aiTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, marginTop: 12,
  },
  aiTagText: { fontSize: 12, color: '#D97706', fontWeight: 'bold', marginLeft: 6 },

  // Vehicles
  vehicleList: { gap: 12 },
  vehicleItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  vehicleItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  vehicleItemDisabled: { backgroundColor: '#F8FAFC', borderColor: 'transparent' },
  vehicleIconWrapper: {
    width: 48, height: 48, backgroundColor: '#F1F5F9',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  vehicleFee: { fontSize: 13, color: '#64748B', marginTop: 2 },
  ecoBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8,
  },
  ecoText: { fontSize: 10, color: '#10B981', fontWeight: 'bold', marginLeft: 2 },
  vehicleDisabledReason: { fontSize: 12, color: '#EF4444', marginTop: 4 },

  // Green box
  aiGreenBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16,
    marginTop: 20, borderWidth: 1, borderColor: '#A7F3D0',
  },
  aiGreenTitle: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginBottom: 4 },
  aiGreenText: { fontSize: 13, color: '#047857', lineHeight: 20 },

  // Promo Code Selector
  promoSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FEB2B2',
    padding: 14, borderRadius: 16,
  },
  promoLeft: { flexDirection: 'row', alignItems: 'center' },
  promoText: { fontSize: 14, fontWeight: '700', color: '#EF4444', marginLeft: 10 },
  promoRight: { flexDirection: 'row', alignItems: 'center' },

  // Summary
  summaryCard: {
    backgroundColor: '#F8FAFC', padding: 18, borderRadius: 16,
    marginTop: 24, borderWidth: 1, borderColor: '#E2E8F0',
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  summaryTotal: {
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12, marginTop: 4, marginBottom: 0,
  },
  totalLabel: { fontSize: 16, color: '#475569', fontWeight: '600' },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#10B981' },

  // Footer
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  paymentName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  paymentPromo: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  
  nextBtn: {
    backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 20,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  nextBtnOrdering: { backgroundColor: '#475569' },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  // Modals
  modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  bsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  bsSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  paymentList: { gap: 10 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  paymentItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  pmIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pmName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  pmDesc: { fontSize: 12, color: '#64748B', marginTop: 2 }
});
