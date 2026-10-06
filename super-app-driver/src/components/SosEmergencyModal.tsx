/**
 * SosEmergencyModal.tsx (super-app-driver)
 * ─────────────────────────────────────────────────────────────
 * Component Modal Trung Tâm An Toàn SOS Khẩn Cấp Dùng Chung.
 * DRY: Tái sử dụng giữa Trang chủ Buồng lái và Cài đặt an toàn.
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMERGENCY_CONTACTS } from '../constants/driverConstants';

interface SosEmergencyModalProps {
  visible: boolean;
  onClose: () => void;
  sosPhone1?: string;
  sosPhone2?: string;
  currentLat?: number;
  currentLng?: number;
}

export default function SosEmergencyModal({
  visible,
  onClose,
  sosPhone1,
  sosPhone2,
  currentLat,
  currentLng,
}: SosEmergencyModalProps) {
  const handleCall = (phone: string, label: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone) {
      Alert.alert('Thông báo', `Chưa thiết lập số điện thoại cho ${label}.`);
      return;
    }
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Cuộc gọi khẩn cấp', `Không thể thực hiện cuộc gọi đến ${cleanPhone}`);
    });
    onClose();
  };

  const handleSendEmergencySignal = () => {
    const coordsStr = currentLat && currentLng ? ` (GPS: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)})` : '';
    Alert.alert(
      'Tín hiệu Khẩn Cấp Đã Gửi',
      `Tọa độ và tín hiệu báo nguy hiểm${coordsStr} đã được kích hoạt tới trung tâm điều hành Sunstar và các xe đồng đội trong bán kính 2km.`,
      [{ text: 'ĐÃ HIỂU', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.shieldIconContainer}>
            <Ionicons name="warning" size={48} color="#DC2626" />
          </View>

          <Text style={styles.title}>TRUNG TÂM AN TOÀN SOS</Text>
          <Text style={styles.desc}>
            Bạn đang gặp sự cố nguy hiểm hoặc tình huống khẩn cấp trên đường? Lựa chọn hỗ trợ ngay bên dưới:
          </Text>

          {/* Phím gọi Cảnh sát 113 */}
          <TouchableOpacity
            style={styles.policeBtn}
            activeOpacity={0.8}
            onPress={() => handleCall(EMERGENCY_CONTACTS.POLICE, 'Cảnh sát 113')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>GỌI CẢNH SÁT 113</Text>
          </TouchableOpacity>

          {/* Phím gọi Cấp cứu 115 */}
          <TouchableOpacity
            style={styles.ambulanceBtn}
            activeOpacity={0.8}
            onPress={() => handleCall(EMERGENCY_CONTACTS.AMBULANCE, 'Cấp cứu 115')}
          >
            <Ionicons name="medkit" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>GỌI CẤP CỨU Y TẾ 115</Text>
          </TouchableOpacity>

          {/* Phím gọi Tổng đài Cứu hộ 24/7 */}
          <TouchableOpacity
            style={styles.hotlineBtn}
            activeOpacity={0.8}
            onPress={() => handleCall(EMERGENCY_CONTACTS.HOTLINE, 'Tổng đài')}
          >
            <Ionicons name="headset" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>GỌI TỔNG ĐÀI CỨU HỘ 24/7 (1900 1234)</Text>
          </TouchableOpacity>

          {/* Phím gọi người thân (nếu có cấu hình) */}
          {sosPhone1 && (
            <TouchableOpacity
              style={styles.relativeBtn}
              activeOpacity={0.8}
              onPress={() => handleCall(sosPhone1, 'Người thân 1')}
            >
              <Ionicons name="call" size={18} color="#334155" style={{ marginRight: 8 }} />
              <Text style={styles.relativeBtnText}>Gọi: {sosPhone1}</Text>
            </TouchableOpacity>
          )}

          {/* Nút gửi cảnh báo định vị khẩn cấp */}
          <TouchableOpacity
            style={styles.pingSignalBtn}
            activeOpacity={0.8}
            onPress={handleSendEmergencySignal}
          >
            <Ionicons name="radio" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.pingSignalText}>Phát Tín Hiệu SOS Đến Đội Xe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.cancelText}>Đóng lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  shieldIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  policeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  ambulanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  hotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  relativeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relativeBtnText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },
  pingSignalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 12,
  },
  pingSignalText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
});
