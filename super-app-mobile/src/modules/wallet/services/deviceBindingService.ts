import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = 'slife_secure_device_id';

export const deviceBindingService = {
  /**
   * Get or generate unique hardware-bound Device ID
   */
  async getDeviceId(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        let webId = localStorage.getItem(DEVICE_ID_KEY);
        if (!webId) {
          webId = `dev_web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem(DEVICE_ID_KEY, webId);
        }
        return webId;
      }

      let storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (!storedId) {
        const hardwareInfo = `${Device.brand || ''}_${Device.modelName || ''}_${Device.osBuildId || ''}`;
        storedId = `dev_hw_${Date.now()}_${Math.abs(hardwareInfo.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
        await SecureStore.setItemAsync(DEVICE_ID_KEY, storedId, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
        });
      }
      return storedId;
    } catch {
      return `dev_fallback_${Date.now()}`;
    }
  },

  /**
   * Secure Storage Set Item (Bound to hardware, excludes iCloud/Android cloud backup)
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      sessionStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },

  /**
   * Secure Storage Get Item
   */
  async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return sessionStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  /**
   * Secure Storage Remove Item
   */
  async removeSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};
