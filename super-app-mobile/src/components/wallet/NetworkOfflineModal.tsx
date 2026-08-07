import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletSecurity } from '../../context/WalletSecurityContext';

interface NetworkOfflineModalProps {
  visible: boolean;
}

export const NetworkOfflineModal: React.FC<NetworkOfflineModalProps> = ({ visible }) => {
  const { recheckNetwork } = useWalletSecurity();

  return (
    <Modal visible={visible} animationType="fade" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="wifi-outline" size={48} color="#F59E0B" />
          </View>

          <Text style={styles.title}>Cần có kết nối Internet</Text>
          <Text style={styles.description}>
            Ví điện tử S-life yêu cầu kết nối mạng Internet để xác thực token và bảo vệ tài sản của bạn.
          </Text>

          <Text style={styles.instruction}>
            Vui lòng kiểm tra Wi-Fi hoặc dữ liệu di động (4G/5G), sau đó bấm "Kiểm tra lại".
          </Text>

          <TouchableOpacity style={styles.recheckButton} onPress={recheckNetwork}>
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.recheckText}>Kiểm tra lại</Text>
          </TouchableOpacity>
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
    maxWidth: 380,
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
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
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
    marginBottom: 12,
  },
  instruction: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  recheckButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
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
