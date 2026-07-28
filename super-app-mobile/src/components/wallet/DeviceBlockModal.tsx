import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletSecurity } from '../../context/WalletSecurityContext';

interface DeviceBlockModalProps {
  visible: boolean;
}

export const DeviceBlockModal: React.FC<DeviceBlockModalProps> = ({ visible }) => {
  const { deviceViolations, recheckDeviceSecurity } = useWalletSecurity();

  const handleOpenSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      alert('Vui lòng kiểm tra cài đặt trình duyệt hoặc hệ thống');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-half-outline" size={48} color="#EF4444" />
          </View>

          <Text style={styles.title}>Không thể mở Ví</Text>
          <Text style={styles.description}>
            Thiết bị của bạn hiện không đáp ứng tiêu chuẩn bảo mật ngân hàng của V-life.
          </Text>

          <View style={styles.violationsBox}>
            <Text style={styles.violationsHeader}>Cần tắt/khắc phục các chế độ sau:</Text>
            {deviceViolations.map((item, index) => (
              <View key={index} style={styles.violationItem}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={styles.itemIcon} />
                <Text style={styles.violationText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.instruction}>
            Sau khi tắt hoàn toàn các chế độ trên, hãy bấm nút "Kiểm tra lại" để tiếp tục sử dụng Ví.
          </Text>

          {/* STRICT POLICY: ONLY 2 BUTTONS [Cài đặt] AND [Kiểm tra lại]. NO BYPASS! */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
              <Ionicons name="settings-outline" size={18} color="#4B5563" style={{ marginRight: 6 }} />
              <Text style={styles.settingsText}>Cài đặt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.recheckButton} onPress={recheckDeviceSecurity}>
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.recheckText}>Kiểm tra lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  violationsBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  violationsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemIcon: {
    marginRight: 6,
  },
  violationText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '500',
    flex: 1,
  },
  instruction: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  settingsButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  settingsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  recheckButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recheckText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
