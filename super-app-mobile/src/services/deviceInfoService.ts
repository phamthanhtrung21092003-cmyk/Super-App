import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = '@vlife_device_installation_id';

export interface DeviceInfoPayload {
  deviceId: string;
  deviceName: string;
  manufacturer?: string;
  modelName?: string;
  platform: string;
  osVersion?: string;
}

export const deviceInfoService = {
  /**
   * Lấy hoặc tạo Installation-Scoped Device ID ổn định xuyên suốt vòng đời cài đặt app
   */
  async getDeviceId(): Promise<string> {
    try {
      const storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (storedId) {
        return storedId;
      }

      // Sinh ID ổn định 1 lần duy nhất cho cài đặt hiện tại
      const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const newId = `vlife_${Platform.OS}_${Date.now()}_${randomSuffix}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
      return newId;
    } catch (e) {
      return `vlife_fallback_${Date.now()}`;
    }
  },

  /**
   * Thu thập thông tin thiết bị thực tế chính xác từ expo-device và môi trường
   */
  async getDeviceInfo(): Promise<DeviceInfoPayload> {
    const deviceId = await this.getDeviceId();

    // 1. Trên Native (iOS / Android)
    if (Platform.OS === 'ios') {
      const model = Device.modelName || 'iPhone';
      const osVersion = Device.osVersion ? `iOS ${Device.osVersion}` : 'iOS';
      return {
        deviceId,
        deviceName: Device.deviceName || model,
        manufacturer: 'Apple',
        modelName: model,
        platform: 'iOS',
        osVersion,
      };
    }

    if (Platform.OS === 'android') {
      const brand = Device.brand || Device.manufacturer || '';
      const model = Device.modelName || 'Android';
      const osVersion = Device.osVersion ? `Android ${Device.osVersion}` : 'Android';
      const fullName = Device.deviceName || (brand ? `${brand} ${model}`.trim() : model);

      return {
        deviceId,
        deviceName: fullName || 'Android Device',
        manufacturer: brand || 'Android',
        modelName: model,
        platform: 'Android',
        osVersion,
      };
    }

    // 2. Trên Web Browser (Chrome mobile hoặc Desktop)
    let deviceName = 'Web Browser';
    let manufacturer = 'Web';
    let modelName = 'Web Browser';
    let platform = 'Web';
    let osVersion = '';

    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent;

      // Nhận diện Android qua User-Agent
      if (/Android/i.test(ua)) {
        platform = 'Android';
        const androidVerMatch = ua.match(/Android\s([0-9\.]+)/i);
        osVersion = androidVerMatch ? `Android ${androidVerMatch[1]}` : 'Android';

        // Trích xuất mã model thực tế (VD: SM-S928B, SM-G998B, Pixel 8, 23049PCD8G...)
        const modelMatch = ua.match(/\b([A-Z0-9\-]+(?:\s[A-Z0-9\-]+)?)\s+Build/i) ||
                           ua.match(/;\s*([A-Za-z0-9\-\s]+)\)/);

        if (modelMatch && modelMatch[1]) {
          const rawModel = modelMatch[1].trim();
          modelName = rawModel;

          if (/SM-S928/i.test(rawModel)) {
            deviceName = 'Samsung Galaxy S24 Ultra';
            manufacturer = 'Samsung';
          } else if (/SM-S918/i.test(rawModel)) {
            deviceName = 'Samsung Galaxy S23 Ultra';
            manufacturer = 'Samsung';
          } else if (/SM-A546/i.test(rawModel)) {
            deviceName = 'Samsung Galaxy A54 5G';
            manufacturer = 'Samsung';
          } else if (/SM-/i.test(rawModel)) {
            deviceName = `Samsung ${rawModel}`;
            manufacturer = 'Samsung';
          } else if (/Pixel/i.test(rawModel)) {
            deviceName = `Google ${rawModel}`;
            manufacturer = 'Google';
          } else if (/Xiaomi|Redmi|POCO/i.test(rawModel)) {
            deviceName = rawModel;
            manufacturer = 'Xiaomi';
          } else {
            deviceName = rawModel;
            manufacturer = 'Android';
          }
        } else {
          deviceName = 'Samsung Galaxy (Chrome Mobile)';
          manufacturer = 'Samsung';
        }
      }
      // Nhận diện iPhone / iPad qua User-Agent
      else if (/iPhone|iPad|iPod/i.test(ua)) {
        platform = 'iOS';
        manufacturer = 'Apple';
        const iosVerMatch = ua.match(/OS\s([0-9_]+)/i);
        osVersion = iosVerMatch ? `iOS ${iosVerMatch[1].replace(/_/g, '.')}` : 'iOS';
        modelName = 'iPhone';
        deviceName = 'iPhone (Chrome Web)';
      }
      // Nhận diện Desktop Mac
      else if (/Macintosh|Mac OS X/i.test(ua)) {
        platform = 'macOS';
        manufacturer = 'Apple';
        deviceName = 'MacBook (Chrome Web)';
        modelName = 'MacBook Pro';
      }
      // Nhận diện Desktop Windows
      else if (/Windows/i.test(ua)) {
        platform = 'Windows';
        manufacturer = 'Microsoft';
        deviceName = 'Windows PC (Chrome Web)';
        modelName = 'PC';
      }
    }

    return {
      deviceId,
      deviceName,
      manufacturer,
      modelName,
      platform,
      osVersion,
    };
  },
};
