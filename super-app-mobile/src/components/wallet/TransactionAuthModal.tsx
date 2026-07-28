import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletSecurity } from '../../context/WalletSecurityContext';
import { riskEngineService, RiskEvaluationResult } from '../../modules/wallet/services/riskEngineService';
import { walletSecurityService } from '../../modules/wallet/services/walletSecurityService';

interface TransactionAuthModalProps {
  visible: boolean;
  actionTitle: string;
  amount?: number;
  recipientInfo?: string;
  onSuccess: (signaturePackage: any) => void;
  onCancel: () => void;
}

export const TransactionAuthModal: React.FC<TransactionAuthModalProps> = ({
  visible,
  actionTitle,
  amount,
  recipientInfo,
  onSuccess,
  onCancel,
}) => {
  const { unlockWalletWithPin, unlockWalletWithBiometrics, signTransaction } = useWalletSecurity();
  const [step, setStep] = useState<'PIN' | 'OTP' | 'SUCCESS'>('PIN');
  const [pin, setPin] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [riskEvaluation, setRiskEvaluation] = useState<RiskEvaluationResult | null>(null);

  useEffect(() => {
    if (visible) {
      setStep('PIN');
      setPin('');
      setOtp('');
      setOtpTimer(60);
      setErrorMessage('');
      
      const evalResult = riskEngineService.evaluateRisk({
        actionType: actionTitle.includes('Rút') ? 'WITHDRAW' : actionTitle.includes('Thêm') ? 'LINK_BANK' : 'TRANSFER',
        amount,
      });
      setRiskEvaluation(evalResult);
    }
  }, [visible, actionTitle, amount]);

  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const handleKeyPress = async (num: string) => {
    if (pin.length < 6 && !loading) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMessage('');

      if (newPin.length === 6) {
        setLoading(true);
        const result = await unlockWalletWithPin(newPin);
        setLoading(false);

        if (result.success) {
          // Check if OTP is required by Risk Engine or action
          if (riskEvaluation?.requirement === 'REQUIRES_OTP' || actionTitle.includes('Rút') || actionTitle.includes('Thêm')) {
            setStep('OTP');
            setOtpTimer(60);
          } else {
            completeTransaction();
          }
        } else {
          setErrorMessage(result.message);
          setPin('');
        }
      }
    }
  };

  const handleBiometrics = async () => {
    setLoading(true);
    const res = await unlockWalletWithBiometrics();
    setLoading(false);
    if (res.success) {
      if (riskEvaluation?.requirement === 'REQUIRES_OTP' || actionTitle.includes('Rút') || actionTitle.includes('Thêm')) {
        setStep('OTP');
        setOtpTimer(60);
      } else {
        completeTransaction();
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp !== '123456' && otp.length !== 6) {
      Alert.alert('Mã OTP sai', 'Mã OTP thử nghiệm là 123456');
      return;
    }
    completeTransaction();
  };

  const completeTransaction = async () => {
    setLoading(true);
    const signedPkg = await signTransaction({
      actionTitle,
      amount,
      recipientInfo,
      timestamp: Date.now(),
    });
    setLoading(false);
    onSuccess(signedPkg);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent backdropColor="rgba(0,0,0,0.85)">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={styles.title}>Xác thực giao dịch</Text>
          <Text style={styles.actionTitle}>{actionTitle}</Text>

          {amount !== undefined && (
            <Text style={styles.amountText}>{amount.toLocaleString('vi-VN')} đ</Text>
          )}

          {recipientInfo && (
            <Text style={styles.recipientText}>{recipientInfo}</Text>
          )}

          {riskEvaluation && riskEvaluation.score > 0 && (
            <View style={styles.riskBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#D8C690" />
              <Text style={styles.riskBadgeText}>
                {riskEvaluation.requirement === 'REQUIRES_OTP' ? 'Giao dịch lớn - Yêu cầu PIN + OTP' : 'Xác thực bảo mật'}
              </Text>
            </View>
          )}

          {step === 'PIN' ? (
            <>
              <View style={styles.pinHeaderRow}>
                <Ionicons name="lock-closed" size={16} color="#D8C690" />
                <Text style={styles.pinHeaderText}>Nhập PIN 6 số để xác nhận</Text>
              </View>

              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[styles.pinDot, pin.length > index ? styles.pinDotFilled : styles.pinDotEmpty]}
                  />
                ))}
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : (
                <Text style={styles.hintText}>PIN thử nghiệm: 123890</Text>
              )}

              {/* Keypad */}
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
                            <Ionicons name="finger-print-outline" size={26} color="#D8C690" />
                          </TouchableOpacity>
                        );
                      }
                      if (key === 'del') {
                        return (
                          <TouchableOpacity key={key} style={styles.keyButton} onPress={() => setPin(pin.slice(0, -1))}>
                            <Ionicons name="backspace-outline" size={22} color="#9CA3AF" />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity key={key} style={styles.keyButton} onPress={() => handleKeyPress(key)}>
                          <Text style={styles.keyText}>{key}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.otpSection}>
              <Text style={styles.otpHeader}>Nhập mã OTP SMS gửi đến SĐT của bạn</Text>
              <Text style={styles.otpSubHeader}>Mã OTP thử nghiệm: 123456 (Hết hạn: {otpTimer}s)</Text>

              <View style={styles.otpKeypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'c', 0, 'del'].map((k, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.otpKeyBtn}
                    onPress={() => {
                      if (k === 'del') setOtp((p) => p.slice(0, -1));
                      else if (k === 'c') setOtp('');
                      else if (otp.length < 6) setOtp((p) => p + k);
                    }}
                  >
                    <Text style={styles.otpKeyText}>{k === 'del' ? '⌫' : k === 'c' ? 'C' : k}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.otpDisplay}>
                {otp.padEnd(6, '○').split('').join(' ')}
              </Text>

              <TouchableOpacity style={styles.submitOtpBtn} onPress={handleOtpSubmit} disabled={otp.length !== 6}>
                <Text style={styles.submitOtpText}>Xác nhận & Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && <ActivityIndicator color="#D8C690" style={{ marginTop: 10 }} />}
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
    right: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#D8C690',
    marginBottom: 4,
  },
  recipientText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(216, 198, 144, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  riskBadgeText: {
    fontSize: 12,
    color: '#D8C690',
    fontWeight: '600',
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  pinHeaderText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pinDotEmpty: {
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  pinDotFilled: {
    backgroundColor: '#D8C690',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  keypad: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keyButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otpSection: {
    width: '100%',
    alignItems: 'center',
  },
  otpHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  otpSubHeader: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 14,
  },
  otpDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D8C690',
    letterSpacing: 4,
    marginBottom: 16,
  },
  otpKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  otpKeyBtn: {
    width: 64,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpKeyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitOtpBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#D8C690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitOtpText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#02163B',
  },
});
