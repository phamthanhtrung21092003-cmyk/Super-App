import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletSecurity } from '../../context/WalletSecurityContext';
import { walletSecurityService } from '../../modules/wallet/services/walletSecurityService';

interface WalletAuthModalProps {
  visible: boolean;
  onClose?: () => void;
  onRegister?: () => void;
}

export const WalletAuthModal: React.FC<WalletAuthModalProps> = ({ visible, onClose, onRegister }) => {
  const { unlockWalletWithPin, unlockWalletWithBiometrics } = useWalletSecurity();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setPin('');
      setErrorMessage('');
      setIsPermanentlyLocked(false);
    }
  }, [visible]);

  const handleKeyPress = async (num: string) => {
    if (pin.length < 6 && !loading) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMessage('');

      if (newPin.length === 6) {
        setLoading(true);
        const result = await unlockWalletWithPin(newPin);
        setLoading(false);

        if (!result.success) {
          setErrorMessage(result.message);
          setPin('');
          if (result.isPermanentlyLocked) {
            setIsPermanentlyLocked(true);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  const handleBiometrics = async () => {
    setLoading(true);
    const res = await unlockWalletWithBiometrics();
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRecoverOtp = async () => {
    if (!otpInput || otpInput.length < 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP SMS 6 chữ số');
      return;
    }
    const success = await walletSecurityService.resetLockViaOtp(otpInput);
    if (success) {
      setIsPermanentlyLocked(false);
      setErrorMessage('');
      Alert.alert('Thành công', 'Khôi phục mở khóa Ví thành công! Bạn có thể nhập mã PIN mặc định 123890.');
    } else {
      Alert.alert('Lỗi', 'Mã OTP không chính xác');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Nút quay lại / đóng */}
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          <Text style={styles.brandTitle}>Ví S-life</Text>
          <Text style={styles.subTitle}>
            Để bảo vệ tài sản của bạn, hãy xác thực một lần nữa.
          </Text>

          <View style={styles.pinHeaderRow}>
            <Ionicons name="lock-closed" size={16} color="#D8C690" />
            <Text style={styles.pinHeaderText}>PIN 6 số</Text>
          </View>

          {/* 6 Digit Indicators ○ ○ ○ ○ ○ ○ */}
          <View style={styles.pinDotsRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const filled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[styles.pinDot, filled ? styles.pinDotFilled : styles.pinDotEmpty]}
                />
              );
            })}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.hintText}>Mã PIN mặc định thử nghiệm: 123890</Text>
          )}

          {isPermanentlyLocked ? (
            <View style={styles.otpBox}>
              <Text style={styles.otpTitle}>Mở khóa Ví bằng OTP SMS</Text>
              <Text style={styles.otpDesc}>Mã OTP thử nghiệm: 123456</Text>
              <View style={styles.otpInputContainer}>
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <View key={idx} style={styles.otpCell}>
                    <Text style={styles.otpCellText}>{otpInput[idx] || ''}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.otpButton} onPress={handleRecoverOtp}>
                <Text style={styles.otpButtonText}>Xác nhận mở khóa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Security Keypad */}
              <View style={styles.keypad}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['bio', '0', 'del'],
                ].map((row, rIdx) => (
                  <View key={rIdx} style={styles.keypadRow}>
                    {row.map((key) => {
                      if (key === 'bio') {
                        return (
                          <TouchableOpacity key={key} style={styles.keyButton} onPress={handleBiometrics}>
                            <Ionicons name="finger-print-outline" size={28} color="#D8C690" />
                          </TouchableOpacity>
                        );
                      }
                      if (key === 'del') {
                        return (
                          <TouchableOpacity key={key} style={styles.keyButton} onPress={handleDelete}>
                            <Ionicons name="backspace-outline" size={24} color="#9CA3AF" />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.keyButton}
                          onPress={() => handleKeyPress(key)}
                          disabled={loading}
                        >
                          <Text style={styles.keyText}>{key}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <View style={styles.footerRow}>
                <TouchableOpacity onPress={() => Alert.alert('Quên PIN', 'Vui lòng xác thực qua OTP SMS (123456) để khôi phục PIN.')}>
                  <Text style={styles.forgotText}>[Quên PIN]</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleBiometrics}>
                  <Text style={styles.biometricLinkText}>[Face ID / Vân tay]</Text>
                </TouchableOpacity>
              </View>

              {onRegister && (
                <TouchableOpacity onPress={onRegister} style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '600', textAlign: 'center' }}>
                    Chưa có Ví? Đăng ký Ví mới ngay
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {loading && <ActivityIndicator color="#D8C690" style={{ marginTop: 12 }} />}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 22, 59, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#031E4B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 198, 144, 0.3)',
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D8C690',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pinHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pinDotEmpty: {
    borderWidth: 2,
    borderColor: '#4B5563',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#D8C690',
    shadowColor: '#D8C690',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 18,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  keypad: {
    width: '100%',
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  biometricLinkText: {
    fontSize: 13,
    color: '#D8C690',
    fontWeight: '600',
  },
  otpBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
  },
  otpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F87171',
    marginBottom: 4,
  },
  otpDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  otpCell: {
    width: 36,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCellText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpButton: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
