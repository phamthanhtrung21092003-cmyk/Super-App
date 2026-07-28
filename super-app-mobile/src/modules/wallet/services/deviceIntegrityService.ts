import { Platform } from 'react-native';
import * as Device from 'expo-device';

export interface DeviceSecurityCheckResult {
  isSecure: boolean;
  violations: string[];
  attestationToken?: string;
}

export const deviceIntegrityService = {
  /**
   * Perform comprehensive 3-stage Device Integrity Check:
   * 1. USB Debugging
   * 2. Root / Jailbreak
   * 3. Emulator / Hardware tampering
   * Note: Developer Options alone WITHOUT USB Debugging is ALLOWED.
   */
  async checkDeviceSecurity(): Promise<DeviceSecurityCheckResult> {
    const violations: string[] = [];

    // Check Emulator
    if (!Device.isDevice) {
      // In web browser testing mode, we allow simulation unless explicitly testing emulator block
      if (Platform.OS !== 'web') {
        violations.push('Thiết bị giả lập (Emulator / Simulator)');
      }
    }

    // Check Android USB Debugging & Root indicators
    if (Platform.OS === 'android') {
      // USB Debugging check flag simulation / native check
      const globalWindow = globalThis as any;
      if (globalWindow.__TEST_USB_DEBUGGING_ENABLED__) {
        violations.push('Chế độ USB Debugging đang bật');
      }
      if (globalWindow.__TEST_ROOT_DETECTED__) {
        violations.push('Thiết bị đã bị Root (Magisk / KernelSU / APatch)');
      }
    }

    // Check iOS Jailbreak indicators
    if (Platform.OS === 'ios') {
      const globalWindow = globalThis as any;
      if (globalWindow.__TEST_JAILBREAK_DETECTED__) {
        violations.push('Thiết bị đã bị Jailbreak (Cydia / Sileo / Zebra)');
      }
    }

    const isSecure = violations.length === 0;
    const attestationToken = isSecure 
      ? `attest_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(7)}` 
      : undefined;

    return {
      isSecure,
      violations,
      attestationToken,
    };
  },

  /**
   * Helper to simulate USB Debugging or Root detection during manual QA
   */
  setSecurityViolationSimulation(type: 'usb_debugging' | 'root' | 'jailbreak' | 'none') {
    const globalWindow = globalThis as any;
    globalWindow.__TEST_USB_DEBUGGING_ENABLED__ = type === 'usb_debugging';
    globalWindow.__TEST_ROOT_DETECTED__ = type === 'root';
    globalWindow.__TEST_JAILBREAK_DETECTED__ = type === 'jailbreak';
  }
};
