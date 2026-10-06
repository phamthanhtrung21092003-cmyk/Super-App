/**
 * driverConstants.ts (super-app-driver)
 * ─────────────────────────────────────────────────────────────
 * Hằng số, cấu hình, key lưu trữ và giá trị mặc định dùng chung.
 * DRY: Gom toàn bộ các thông số phân tán về một nguồn duy nhất.
 * ─────────────────────────────────────────────────────────────
 */

export const PLATFORM_FEE_RATE = 0.15; // Phí nền tảng 15%

export const EMERGENCY_CONTACTS = {
  POLICE: '113',
  AMBULANCE: '115',
  HOTLINE: '19001234',
  HOTLINE_LABEL: 'Tổng đài Cứu hộ 24/7 (1900 1234)',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  DRIVER_INFO: 'driverInfo',
  SETTINGS: '@sunstar_driver_app_settings',
  QUICK_CHATS: '@sunstar_driver_quick_chats',
  ACTIVE_TRIP: '@sunstar_driver_active_trip',
  TRIP_STEP: '@sunstar_driver_trip_step',
  WALLETS: '@sunstar_driver_wallets',
  TRIP_HISTORY: '@sunstar_driver_trip_history',
};

export const DEFAULT_QUICK_CHATS: string[] = [
  'Tôi đang đến điểm đón, quý khách vui lòng chờ khoảng 3-5 phút nhé!',
  'Tôi đã đến nơi đón, quý khách ra xe nhé ạ!',
  'Tôi đang bật đèn xi nhan khẩn cấp đứng chờ ở sảnh.',
  'Khu vực này khó dừng đỗ, quý khách có thể đứng ở đầu ngõ giúp tôi được không?',
  'Đường đang bị ùn ứ một chút, tôi sẽ đến ngay ạ.',
  'Quý khách vui lòng cho tôi xin số nhà cụ thể nhé ạ.',
];

export interface DriverAppSettings {
  // 1. Cuốc xe & Điều phối
  autoAccept: boolean;
  dispatchRadius: number; // 1, 2, 3, 5, 10 km
  serviceBike: boolean;
  serviceCar: boolean;
  serviceExpress: boolean;
  serviceFood: boolean;
  homeDestinationEnabled: boolean;
  homeAddress: string;
  backToBack: boolean;

  // 2. Âm thanh & Thông báo
  maxLoudRingtone: boolean;
  ringtoneType: 'CLASSIC' | 'TECH' | 'VOICE';
  hapticsVibration: boolean;
  voiceReadRoute: boolean;

  // 3. Bản đồ & Dẫn đường
  defaultMap: 'GOOGLE' | 'SUNSTAR' | 'APPLE';
  autoOpenGoogleMaps: boolean;
  avoidTollBOT: boolean;
  avoidHighways: boolean;

  // 4. Màn hình & Pin
  keepAwakeMode: 'ALWAYS_ONLINE' | 'IN_TRIP_ONLY' | 'SYSTEM_DEFAULT';
  darkMode: boolean;

  // 5. An toàn SOS & Khẩn cấp
  sosPhone1: string;
  sosPhone2: string;
  nightSafetyShield: boolean;
}

export const DEFAULT_APP_SETTINGS: DriverAppSettings = {
  // 1. Cuốc xe & Điều phối
  autoAccept: false,
  dispatchRadius: 3,
  serviceBike: true,
  serviceCar: true,
  serviceExpress: true,
  serviceFood: true,
  homeDestinationEnabled: false,
  homeAddress: 'Số 128 Cầu Giấy, Phường Quan Hoa, Cầu Giấy, Hà Nội',
  backToBack: true,

  // 2. Âm thanh & Thông báo
  maxLoudRingtone: true,
  ringtoneType: 'TECH',
  hapticsVibration: true,
  voiceReadRoute: true,

  // 3. Bản đồ & Dẫn đường
  defaultMap: 'GOOGLE',
  autoOpenGoogleMaps: true,
  avoidTollBOT: true,
  avoidHighways: false,

  // 4. Màn hình & Pin
  keepAwakeMode: 'ALWAYS_ONLINE',
  darkMode: false,

  // 5. An toàn SOS
  sosPhone1: '0988111222 (Vợ / Người thân)',
  sosPhone2: '0912333444 (Bạn thân / Đội xe)',
  nightSafetyShield: true,
};
