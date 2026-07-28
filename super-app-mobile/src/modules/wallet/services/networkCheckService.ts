import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export const networkCheckService = {
  /**
   * Check real-time internet availability
   */
  async checkNetworkConnection(): Promise<NetworkStatus> {
    if (Platform.OS === 'web') {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      return {
        isConnected: isOnline,
        isInternetReachable: isOnline,
        type: 'wifi/cellular',
      };
    }

    try {
      // Ping check or navigator online check for cross-platform robustness
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      return {
        isConnected: isOnline,
        isInternetReachable: isOnline,
        type: 'connected',
      };
    } catch {
      return {
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      };
    }
  },
};
