import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../services/foodService';
import { useFoodMerchant } from '../../context/FoodMerchantContext';

export default function MerchantVouchersScreen() {
  const router = useRouter();
  const { restaurant } = useFoodMerchant();
  const accentColor = '#F97316';

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Create / Edit State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED' | 'FREESHIP'>('PERCENT');
  const [value, setValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxUsage, setMaxUsage] = useState('100');
  const [maxUsagePerUser, setMaxUsagePerUser] = useState('1');
  const [endDays, setEndDays] = useState('30'); // Số ngày áp dụng từ hôm nay

  const fetchVouchers = useCallback(async () => {
    try {
      const res = await foodService.getMerchantVouchers();
      setVouchers(res.items || []);
    } catch (err: any) {
      console.log('[MerchantVouchers] Lỗi tải danh sách voucher:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode('');
    setName('');
    setDescription('');
    setType('PERCENT');
    setValue('20');
    setMaxDiscount('40000');
    setMinOrderValue('100000');
    setMaxUsage('100');
    setMaxUsagePerUser('1');
    setEndDays('30');
    setModalVisible(true);
  };

  const handleOpenEdit = (v: any) => {
    setIsEditing(true);
    setEditingId(v.id);
    setCode(v.code);
    setName(v.name);
    setDescription(v.description || '');
    setType(v.type);
    setValue(String(v.value));
    setMaxDiscount(v.maxDiscount ? String(v.maxDiscount) : '');
    setMinOrderValue(String(v.minOrderValue || 0));
    setMaxUsage(String(v.maxUsage || 100));
    setMaxUsagePerUser(String(v.maxUsagePerUser || 1));
    setEndDays('30');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chương trình');
      return;
    }
    if (!isEditing && (!code.trim() || code.trim().length < 3)) {
      Alert.alert('Lỗi', 'Mã khuyến mãi phải từ 3 đến 20 ký tự');
      return;
    }
    const numVal = Number(value);
    if (isNaN(numVal) || numVal <= 0) {
      Alert.alert('Lỗi', 'Giá trị giảm không hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (Number(endDays) || 30));

      if (isEditing && editingId) {
        await foodService.updateMerchantVoucher(editingId, {
          name: name.trim(),
          description: description.trim() || undefined,
          value: numVal,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
          maxUsage: Number(maxUsage) || 100,
          maxUsagePerUser: Number(maxUsagePerUser) || 1,
          endAt: futureDate.toISOString(),
        });
        Alert.alert('Thành công', 'Đã cập nhật mã khuyến mãi');
      } else {
        await foodService.createMerchantVoucher({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          type,
          value: numVal,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
          maxUsage: Number(maxUsage) || 100,
          maxUsagePerUser: Number(maxUsagePerUser) || 1,
          endAt: futureDate.toISOString(),
          isActive: true,
        });
        Alert.alert('Thành công', 'Đã tạo mã khuyến mãi mới');
      }

      setModalVisible(false);
      fetchVouchers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lưu voucher';
      Alert.alert('Không thể lưu', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (v: any) => {
    try {
      await foodService.toggleMerchantVoucher(v.id);
      setVouchers((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, isActive: !item.isActive } : item))
      );
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái kích hoạt');
    }
  };

  const handleDelete = (v: any) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa mã "${v.code}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await foodService.deleteMerchantVoucher(v.id);
              fetchVouchers();
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || 'Không thể xóa voucher';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ]
    );
  };

  // Thống kê nhanh
  const activeCount = vouchers.filter((v) => v.isActive && !v.isExpired).length;
  const totalUsages = vouchers.reduce((sum, v) => sum + (v.usagesCount || 0), 0);
  const totalDiscountGiven = vouchers.reduce((sum, v) => sum + (v.totalDiscountGiven || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/food-merchant' as any))}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Mã Khuyến Mãi</Text>
        <TouchableOpacity style={styles.createBtn} onPress={handleOpenCreate}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.createBtnText}>Tạo mã</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{activeCount}</Text>
          <Text style={styles.metricLabel}>Đang chạy</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{totalUsages}</Text>
          <Text style={styles.metricLabel}>Lượt đã dùng</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: '#059669' }]}>
            {Math.round(totalDiscountGiven / 1000)}k
          </Text>
          <Text style={styles.metricLabel}>Đã tài trợ</Text>
        </View>
      </View>

      {/* Body List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>Đang tải danh sách khuyến mãi...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accentColor]} />}
        >
          {vouchers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Quán chưa có mã khuyến mãi nào</Text>
              <Text style={styles.emptySubtitle}>
                Hãy tạo mã giảm giá hoặc mã freeship để thu hút thêm nhiều khách hàng đặt món!
              </Text>
              <TouchableOpacity style={styles.emptyCreateBtn} onPress={handleOpenCreate}>
                <Text style={styles.emptyCreateBtnText}>+ Tạo mã đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            vouchers.map((v) => {
              const isPercent = v.type === 'PERCENT';
              const isFreeship = v.type === 'FREESHIP';

              return (
                <View key={v.id} style={[styles.voucherCard, !v.isActive && styles.voucherCardDisabled]}>
                  {/* Card Top */}
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>{v.code}</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: isFreeship ? '#EFF6FF' : '#FFF7ED',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '800',
                            color: isFreeship ? '#2563EB' : '#F97316',
                          }}
                        >
                          {isPercent ? `Giảm ${v.value}%` : isFreeship ? 'Miễn phí ship' : `Giảm ${v.value.toLocaleString('vi-VN')}đ`}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      value={v.isActive}
                      onValueChange={() => handleToggle(v)}
                      trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                      thumbColor={v.isActive ? '#10B981' : '#F1F5F9'}
                    />
                  </View>

                  <Text style={styles.voucherTitle}>{v.name}</Text>
                  {v.description ? <Text style={styles.voucherDesc}>{v.description}</Text> : null}

                  {/* Conditions Details */}
                  <View style={styles.conditionBox}>
                    <Text style={styles.conditionText}>
                      • Đơn tối thiểu: {v.minOrderValue?.toLocaleString('vi-VN')}đ
                    </Text>
                    {v.maxDiscount ? (
                      <Text style={styles.conditionText}>
                        • Giảm tối đa: {v.maxDiscount.toLocaleString('vi-VN')}đ
                      </Text>
                    ) : null}
                    <Text style={styles.conditionText}>
                      • Số lượt dùng: {v.usedCount} / {v.maxUsage} (tối đa {v.maxUsagePerUser} lần/khách)
                    </Text>
                    <Text style={styles.conditionText}>
                      • Hạn sử dụng: {new Date(v.endAt).toLocaleDateString('vi-VN')}
                      {v.isExpired ? ' (ĐÃ HẾT HẠN)' : ''}
                    </Text>
                  </View>

                  {/* Card Footer Actions */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.usageStatText}>
                      Đã giảm: {v.totalDiscountGiven?.toLocaleString('vi-VN')}đ
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(v)}>
                        <Ionicons name="create-outline" size={16} color="#0066FF" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0066FF' }}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(v)}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal Tạo / Sửa Voucher */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? `Sửa mã: ${code}` : 'Tạo Mã Khuyến Mãi Mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mã khuyến mãi (Code) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: BANME50, CHAOMUNG"
                    placeholderTextColor="#94A3B8"
                    value={code}
                    onChangeText={(val) => setCode(val.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên chương trình *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Giảm 20% đơn đầu tiên"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả điều kiện (tùy chọn)</Text>
                <TextInput
                  style={[styles.formInput, { height: 60 }]}
                  placeholder="Áp dụng cho mọi món trong menu..."
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              {!isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Loại giảm giá</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {(['PERCENT', 'FIXED', 'FREESHIP'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.typeOption, type === t && styles.typeOptionActive]}
                        onPress={() => setType(t)}
                      >
                        <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                          {t === 'PERCENT' ? 'Giảm %' : t === 'FIXED' ? 'Giảm tiền' : 'Freeship'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>
                    {type === 'PERCENT' ? 'Tỉ lệ giảm (%) *' : 'Số tiền giảm (đ) *'}
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={type === 'PERCENT' ? '20' : '30000'}
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={setValue}
                    keyboardType="numeric"
                  />
                </View>

                {type === 'PERCENT' && (
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Giảm tối đa (đ)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="40000"
                      placeholderTextColor="#94A3B8"
                      value={maxDiscount}
                      onChangeText={setMaxDiscount}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Đơn tối thiểu (đ)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="100000"
                    placeholderTextColor="#94A3B8"
                    value={minOrderValue}
                    onChangeText={setMinOrderValue}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Thời hạn (ngày)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    value={endDays}
                    onChangeText={setEndDays}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Tổng lượt dùng</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="100"
                    placeholderTextColor="#94A3B8"
                    value={maxUsage}
                    onChangeText={setMaxUsage}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Lượt/khách</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="1"
                    placeholderTextColor="#94A3B8"
                    value={maxUsagePerUser}
                    onChangeText={setMaxUsagePerUser}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accentColor }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isEditing ? 'Cập Nhật Voucher' : 'Tạo Voucher Khuyến Mãi'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },

  scrollContent: { padding: 16, gap: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  emptyCreateBtn: { backgroundColor: '#F97316', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  emptyCreateBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  voucherCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  voucherCardDisabled: { opacity: 0.65, backgroundColor: '#F8FAFC' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: { fontSize: 13, fontWeight: '900', color: '#F97316' },
  voucherTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  voucherDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

  conditionBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginTop: 10, gap: 2 },
  conditionText: { fontSize: 11, color: '#475569' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  usageStatText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

  formGroup: { marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  typeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  typeOptionActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  typeText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  typeTextActive: { color: '#F97316' },

  submitBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
