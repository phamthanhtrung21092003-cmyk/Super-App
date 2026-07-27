import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Modal,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCinema, MovieItem } from '../context/CinemaContext';

export interface CinemaBranch {
  id: string;
  brand: string; // 'Beta', 'CGV', 'Lotte', 'BHD', 'Galaxy', 'Starlight', 'Cinestar', 'RIO', 'DCINE', 'Metiz', 'Empire', 'Dabaco', 'Rạp Quốc Gia', 'Cinemax', 'Venus', 'RameStar', 'EVG', 'Touch'
  name: string;
  area: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  facilities: string[];
  distance: string;
  moviesCount: number;
}

// 63 Tỉnh Thành Việt Nam Đầy Đủ
const ALL_63_PROVINCES = [
  'Tất cả tỉnh thành',
  'TP. Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Bình Dương',
  'Cần Thơ',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Lâm Đồng (Đà Lạt)',
  'Nha Trang (Khánh Hòa)',
  'Thừa Thiên Huế',
  'Bình Định (Quy Nhơn)',
  'Quảng Ninh',
  'Thái Nguyên',
  'Bắc Giang',
  'Bắc Ninh',
  'Hải Dương',
  'Nam Định',
  'Thái Bình',
  'Ninh Bình',
  'Hà Nam',
  'Hưng Yên',
  'Phú Thọ (Việt Trì)',
  'Thanh Hóa',
  'Nghệ An (Vinh)',
  'Quảng Bình (Đồng Hới)',
  'Quảng Trị (Đông Hà)',
  'Quảng Ngãi',
  'Gia Lai (Pleiku)',
  'Bình Thuận (Phan Thiết)',
  'An Giang (Long Xuyên)',
  'Kiên Giang (Rạch Giá / Phú Quốc)',
  'Đắc Lắk (Buôn Ma Thuột)',
  'Tiền Giang (Mỹ Tho)',
  'Tây Ninh',
  'Bạc Liêu',
  'Bến Tre',
  'Bình Phước (Đồng Xoài)',
  'Cà Mau',
  'Đồng Tháp (Cao Lãnh)',
  'Hà Tĩnh',
  'Long An (Tân An)',
  'Ninh Thuận (Phan Rang)',
  'Phú Yên (Tuy Hòa)',
  'Quảng Nam (Hội An / Tam Kỳ)',
  'Sóc Trăng',
  'Trà Vinh',
  'Vĩnh Long',
  'Vĩnh Phúc (Vĩnh Yên)',
  'Yên Bái',
  'Cao Bằng',
  'Điện Biên',
  'Hà Giang',
  'Hòa Bình',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Sơn La',
  'Tuyên Quang'
];

const BASE_CINEMA_BRANCHES: CinemaBranch[] = [
  // ==================== HÀ NỘI (24 RẠP) ====================
  {
    id: 'national-cinema-center-hn',
    brand: 'Rạp Quốc Gia',
    name: 'Trung Tâm Chiếu Phim Quốc Gia (NCC)',
    area: 'Láng Hạ',
    city: 'TP. Hà Nội',
    address: '87 Láng Hạ, Q. Ba Đình, Hà Nội',
    phone: '024 3514 1791',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp phô mai & socola', '🅿️ Bãi đỗ xe ô tô & xe máy rộng', '🎟️ Kiosk in vé tự động', '🔊 Dolby Atmos 7.1'],
    distance: '3.2 km',
    moviesCount: 9,
  },
  {
    id: 'cgv-vincom-ba-trieu',
    brand: 'CGV',
    name: 'CGV Vincom Bà Triệu',
    area: 'Bà Triệu',
    city: 'TP. Hà Nội',
    address: 'Tầng 6, TTTM Vincom Center, 191 Bà Triệu, Q. Hai Bà Trưng, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm B2 Vincom', '🎟️ Scan QR Kiosk', '🎬 10 phòng chiếu 2D/3D'],
    distance: '4.1 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-royal-city-nguyen-trai',
    brand: 'CGV',
    name: 'CGV Vincom Royal City',
    area: 'Nguyễn Trãi',
    city: 'TP. Hà Nội',
    address: 'Tầng B2 - TTTM Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Q. Thanh Xuân, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm B3 Royal City', '🎟️ Scan Kiosk', '🌟 VIP Gold Class & L\'amour'],
    distance: '4.5 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-times-city',
    brand: 'CGV',
    name: 'CGV Vincom Mega Mall Times City',
    area: 'Minh Khai',
    city: 'TP. Hà Nội',
    address: 'Tầng B1, TTTM Vincom Mega Mall Times City, 458 Minh Khai, Q. Hai Bà Trưng, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm B2 Times City', '🎟️ Kiosk in vé', '🔊 Dolby Sound'],
    distance: '5.8 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-aeon-long-bien',
    brand: 'CGV',
    name: 'CGV AEON Long Biên',
    area: 'Long Biên',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM AEON Mall Long Biên, 27 Cổ Linh, Q. Long Biên, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Free bãi xe AEON Mall', '🎟️ QR Scan', '✨ IMAX & Sweetbox'],
    distance: '6.2 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-aeon-ha-dong',
    brand: 'CGV',
    name: 'CGV AEON Mall Hà Đông',
    area: 'Hà Đông',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM AEON Mall Hà Đông, P. Dương Nội, Q. Hà Đông, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Bãi xe AEON rộng rãi', '🎟️ Scan Kiosk', '✨ IMAX Screen'],
    distance: '7.5 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-iph-xuan-thuy',
    brand: 'CGV',
    name: 'CGV Indochina Plaza (IPH) Xuân Thủy',
    area: 'Xuân Thủy',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM Indochina Plaza, 241 Xuân Thủy, Q. Cầu Giấy, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Bắp nước Combo', '🅿️ Hầm giữ xe', '🎟️ Scan QR Kiosk', '🎬 Phòng 2D/3D'],
    distance: '0.8 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-tran-duy-hung',
    brand: 'CGV',
    name: 'CGV Vincom Trần Duy Hưng',
    area: 'Trần Duy Hưng',
    city: 'TP. Hà Nội',
    address: 'Tầng 5, TTTM Vincom Center Trần Duy Hưng, Q. Cầu Giấy, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Cine Cafe Bar', '🅿️ Hầm B3 Vincom', '🎟️ QR Kiosk', '🌟 Starium & Cine & Foret'],
    distance: '2.5 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-metropolis-lieu-giai',
    brand: 'CGV',
    name: 'CGV Vincom Metropolis Liễu Giai',
    area: 'Liễu Giai',
    city: 'TP. Hà Nội',
    address: 'Tầng B1, TTTM Vincom Center Metropolis, 29 Liễu Giai, Q. Ba Đình, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Vincom', '🎟️ Scan QR', '🎬 IMAX Cinema'],
    distance: '2.8 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-pham-ngoc-thach',
    brand: 'CGV',
    name: 'CGV Vincom Center Phạm Ngọc Thạch',
    area: 'Phạm Ngọc Thạch',
    city: 'TP. Hà Nội',
    address: 'Tầng 8, TTTM Vincom Center, 02 Phạm Ngọc Thạch, Q. Đống Đa, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm giữ xe Vincom', '🎟️ Check-in QR', '✨ Gold Class VIP'],
    distance: '3.6 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-rice-city-linh-dam',
    brand: 'CGV',
    name: 'CGV Rice City Linh Đàm',
    area: 'Linh Đàm',
    city: 'TP. Hà Nội',
    address: 'Tầng 2, Tòa nhà Trung, Rice City Linh Đàm, Q. Hoàng Mai, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp ngọt & phô mai', '🅿️ Bãi xe Linh Đàm', '🎟️ Scan Kiosk', '🎬 Phòng 2D/3D giá tốt'],
    distance: '7.8 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-trang-tien-plaza',
    brand: 'CGV',
    name: 'CGV Tràng Tiền Plaza',
    area: 'Hoàn Kiếm',
    city: 'TP. Hà Nội',
    address: 'Tầng 5, TTTM Tràng Tiền Plaza, 24 Tràng Tiền, Q. Hoàn Kiếm, Hà Nội',
    phone: '1900 6017',
    hours: '09:00 - 23:30',
    facilities: ['🍿 Premium Snack', '🅿️ Bãi đỗ xe Phố Cổ', '🎟️ Check-in nhanh', '✨ Premium Lounge'],
    distance: '5.5 km',
    moviesCount: 7,
  },
  {
    id: 'beta-xuan-thuy',
    brand: 'Beta',
    name: 'Beta Cinema Xuân Thủy',
    area: 'Xuân Thủy',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM Pico, 173 Xuân Thủy, Q. Cầu Giấy, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp phô mai & caramel giá tốt', '🅿️ Bãi giữ xe Pico', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '0.4 km',
    moviesCount: 7,
  },
  {
    id: 'beta-thanh-xuan',
    brand: 'Beta',
    name: 'Beta Cinema Thanh Xuân',
    area: 'Nguyễn Trãi',
    city: 'TP. Hà Nội',
    address: 'Tầng B2, Tòa nhà Golden Land, 275 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Popcorn Bar giá sinh viên', '🅿️ Hầm Golden Land', '🎟️ In vé Kiosk', '🔊 Dolby Atmos'],
    distance: '4.8 km',
    moviesCount: 7,
  },
  {
    id: 'beta-giai-phong',
    brand: 'Beta',
    name: 'Beta Cinema Giải Phóng',
    area: 'Giải Phóng',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Imperial Plaza, 360 Giải Phóng, Q. Thanh Xuân, Hà Nội',
    phone: '1900 636807',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp caramel & phô mai', '🅿️ Hầm Imperial Plaza', '🎟️ QR Scan Kiosk', '🎬 2D/3D giá ưu đãi'],
    distance: '6.5 km',
    moviesCount: 7,
  },
  {
    id: 'beta-dan-phuong',
    brand: 'Beta',
    name: 'Beta Cinema Đan Phượng',
    area: 'Đan Phượng',
    city: 'TP. Hà Nội',
    address: 'Tầng 2, TTTM Tuấn Thủy, TT. Phùng, H. Đan Phượng, Hà Nội',
    phone: '1900 636807',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Snack', '🅿️ Bãi giữ xe rộng rãi', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '12.0 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-discovery-cau-giay',
    brand: 'Lotte',
    name: 'Lotte Cinema Discovery Cầu Giấy',
    area: 'Cầu Giấy',
    city: 'TP. Hà Nội',
    address: 'Tầng 6 TTTM Discovery Complex, 302 Cầu Giấy, Q. Cầu Giấy, Hà Nội',
    phone: '024 3775 2525',
    hours: '09:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Discovery rộng', '🎟️ Check-in nhanh', '🔊 Dolby Atmos'],
    distance: '1.2 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-landmark-keangnam',
    brand: 'Lotte',
    name: 'Lotte Cinema Landmark Keangnam',
    area: 'Mễ Trì',
    city: 'TP. Hà Nội',
    address: 'Tầng 5, Keangnam Landmark Tower, Phạm Hùng, Q. Nam Từ Liêm, Hà Nội',
    phone: '024 3837 8032',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm Keangnam', '🎟️ Check-in Kiosk', '✨ Cine Comfort Lounge'],
    distance: '3.1 km',
    moviesCount: 7,
  },
  {
    id: 'lotte-ha-dong',
    brand: 'Lotte',
    name: 'Lotte Cinema Hà Đông',
    area: 'Hà Đông',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, Melinh Plaza Hà Đông, Tô Hiệu, Q. Hà Đông, Hà Nội',
    phone: '024 3355 8000',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Bắp bơ & phô mai', '🅿️ Bãi xe Melinh Plaza', '🎟️ Scan QR', '🎬 2D/3D Digital'],
    distance: '8.2 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-long-bien',
    brand: 'Lotte',
    name: 'Lotte Cinema Long Biên',
    area: 'Long Biên',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Mipec Riverside, 2 Long Biên II, Q. Long Biên, Hà Nội',
    phone: '024 3698 1111',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm Mipec Riverside', '🎟️ In vé nhanh', '🔊 Super Sound'],
    distance: '6.9 km',
    moviesCount: 7,
  },
  {
    id: 'bhd-discovery-cau-giay',
    brand: 'BHD',
    name: 'BHD Star Discovery Cầu Giấy',
    area: 'Cầu Giấy',
    city: 'TP. Hà Nội',
    address: 'Tầng 8, Discovery Complex, 302 Cầu Giấy, Q. Cầu Giấy, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Discovery', '🎟️ QR Code', '🛋️ First Class Lounge'],
    distance: '1.2 km',
    moviesCount: 7,
  },
  {
    id: 'bhd-the-garden',
    brand: 'BHD',
    name: 'BHD Star The Garden Mễ Trì',
    area: 'Mễ Trì',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM The Garden, Đường Mễ Trì, Q. Nam Từ Liêm, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Combo Popcorn Gourmet', '🅿️ Hầm The Garden', '🎟️ Check-in QR', '🔊 7.1 Surround'],
    distance: '3.5 km',
    moviesCount: 7,
  },
  {
    id: 'bhd-pham-ngoc-thach',
    brand: 'BHD',
    name: 'BHD Star Phạm Ngọc Thạch',
    area: 'Phạm Ngọc Thạch',
    city: 'TP. Hà Nội',
    address: 'Tầng 8, Vincom Center, 02 Phạm Ngọc Thạch, Q. Đống Đa, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp Caramel & Phô mai', '🅿️ Hầm Vincom', '🎟️ Quét mã QR', '✨ Gold ClassVIP'],
    distance: '3.6 km',
    moviesCount: 7,
  },
  {
    id: 'galaxy-trang-thi',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Tràng Thi',
    area: 'Hoàn Kiếm',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM Tràng Thi, 10 Tràng Thi, Q. Hoàn Kiếm, Hà Nội',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp phô mai caramel', '🅿️ Bãi giữ xe Tràng Thi', '🎟️ Quét QR', '🎬 2D/3D Hi-Def'],
    distance: '5.2 km',
    moviesCount: 7,
  },

  // ==================== TP. HỒ CHÍ MINH ====================
  {
    id: 'cgv-vincom-dong-khoi',
    brand: 'CGV',
    name: 'CGV Vincom Đồng Khởi',
    area: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 3 TTTM Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Vincom', '🎟️ QR Scan', '💎 L\'amour Bed'],
    distance: '2.1 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-su-van-hanh',
    brand: 'CGV',
    name: 'CGV Sư Vạn Hạnh Mall',
    area: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 6, TTTM Sư Vạn Hạnh Mall, 11 Sư Vạn Hạnh, Phường 12, Quận 10, TP. HCM',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Sư Vạn Hạnh', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '3.4 km',
    moviesCount: 8,
  },
  {
    id: 'lotte-cantavil-quan-2',
    brand: 'Lotte',
    name: 'LOTTE Cinema Cantavil Quận 2',
    area: 'Quận 2',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 7 Cantavil Premier, An Phú, Quận 2, TP. Hồ Chí Minh',
    phone: '028 3740 2323',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Combo Couple', '🅿️ Bãi xe ô tô Cantavil', '🎟️ Kiosk tự động', '🛋️ Ghế đôi Couple'],
    distance: '5.2 km',
    moviesCount: 6,
  },
  {
    id: 'galaxy-nguyen-du',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Nguyễn Du',
    area: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    address: '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp caramel', '🅿️ Giữ xe khuôn viên', '🎟️ Quét QR', '🎬 2D/3D Hi-Def'],
    distance: '1.8 km',
    moviesCount: 7,
  },

  // ==================== BẮC GIANG ====================
  {
    id: 'beta-bac-giang',
    brand: 'Beta',
    name: 'Beta Cinema Bắc Giang',
    area: 'TP. Bắc Giang',
    city: 'Bắc Giang',
    address: 'Tầng 4, Co.opmart Bắc Giang, 51 Nguyễn Văn Cừ, P. Ngô Quyền, TP. Bắc Giang',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe Co.opmart', '🎟️ Kiosk in vé', '🔊 7.1 Surround'],
    distance: '1.2 km',
    moviesCount: 5,
  },
  {
    id: 'lotte-bac-giang',
    brand: 'Lotte',
    name: 'LOTTE Cinema Bắc Giang',
    area: 'Tân Tiến',
    city: 'Bắc Giang',
    address: 'Tầng 1, TTTM Big C (GO!), Xã Tân Tiến, TP. Bắc Giang',
    phone: '0204 3828 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Big C rộng', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '2.0 km',
    moviesCount: 5,
  },

  // ==================== HẢI DƯƠNG ====================
  {
    id: 'lotte-cinema-hai-duong',
    brand: 'Lotte',
    name: 'LOTTE Cinema Hải Dương',
    area: 'Thanh Bình',
    city: 'Hải Dương',
    address: 'Tầng 4, TTTM Đỗ Gia Palace, 158 Ngô Quyền, P. Thanh Bình, TP. Hải Dương',
    phone: '0220 3898 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Bãi xe Đỗ Gia Palace', '🎟️ Scan vé QR', '🔊 Dolby Atmos'],
    distance: '1.7 km',
    moviesCount: 5,
  },
  {
    id: 'venus-cinema-hai-duong',
    brand: 'Venus',
    name: 'Venus Cinema Hải Dương',
    area: 'Tân Bình',
    city: 'Hải Dương',
    address: '62 - 66 Nguyễn Văn Linh, P. Tân Bình, TP. Hải Dương',
    phone: '0220 3899 777',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe Nguyễn Văn Linh', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.5 km',
    moviesCount: 5,
  },
  {
    id: 'ramestar-hai-duong',
    brand: 'RameStar',
    name: 'RameStar Cinema Hải Dương',
    area: 'Thanh Bình',
    city: 'Hải Dương',
    address: '172 Thanh Bình, P. Thanh Trung, TP. Hải Dương',
    phone: '0220 3895 555',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp bơ mặn', '🅿️ Giữ xe máy free', '🎟️ Vé QR code', '🎬 2D Hi-Def'],
    distance: '2.1 km',
    moviesCount: 4,
  },

  // ==================== VĨNH PHÚC (VĨNH YÊN) ====================
  {
    id: 'cinemax-vinh-phuc',
    brand: 'Cinemax',
    name: 'Cinemax Vĩnh Phúc (Vĩnh Yên)',
    area: 'Vĩnh Yên',
    city: 'Vĩnh Phúc (Vĩnh Yên)',
    address: 'Tầng 4, Soiva Plaza (Co.opmart), Đường Mê Linh, TP. Vĩnh Yên, Vĩnh Phúc',
    phone: '0211 3888 666',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Soiva Plaza', '🎟️ Kiosk in vé', '🔊 Dolby 7.1'],
    distance: '1.4 km',
    moviesCount: 5,
  },

  // ==================== HÀ TĨNH ====================
  {
    id: 'cgv-vincom-ha-tinh',
    brand: 'CGV',
    name: 'CGV Vincom Hà Tĩnh',
    area: 'Hà Huy Tập',
    city: 'Hà Tĩnh',
    address: 'Tầng 3, Vincom Plaza Hà Tĩnh, Phường Hà Huy Tập, TP. Hà Tĩnh',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D Hi-Def'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== QUẢNG TRỊ (ĐÔNG HÀ) ====================
  {
    id: 'rio-vincom-quang-tri',
    brand: 'RIO',
    name: 'RIO Cinema Vincom Quảng Trị',
    area: 'Nam Đông Hà',
    city: 'Quảng Trị (Đông Hà)',
    address: 'Tầng 4, Vincom Plaza Đông Hà, 252 Hùng Vương, P. Nam Đông Hà, TP. Đông Hà, Quảng Trị',
    phone: '0233 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Scan vé QR', '🔊 Dolby 7.1'],
    distance: '1.0 km',
    moviesCount: 5,
  },
  {
    id: 'cinemax-quang-tri',
    brand: 'Cinemax',
    name: 'Cinemax Quảng Trị',
    area: 'Đông Hà',
    city: 'Quảng Trị (Đông Hà)',
    address: '04 Nguyễn Du, Phường 1, TP. Đông Hà, Quảng Trị',
    phone: '0233 3855 666',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp bơ mặn', '🅿️ Bãi xe Nguyễn Du', '🎟️ Check-in QR', '🎬 2D Screen'],
    distance: '1.3 km',
    moviesCount: 4,
  },

  // ==================== QUẢNG NGÃI ====================
  {
    id: 'cgv-vincom-quang-ngai',
    brand: 'CGV',
    name: 'CGV Vincom Quảng Ngãi',
    area: 'Nghĩa Chánh',
    city: 'Quảng Ngãi',
    address: 'Vincom Plaza Quảng Ngãi, 26 Lê Thánh Tôn, Nghĩa Chánh Nam, TP. Quảng Ngãi',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ Vincom', '🎟️ Scan QR', '🔊 Dolby Sound 7.1'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== GIA LAI (PLEIKU) ====================
  {
    id: 'touch-cinema-pleiku',
    brand: 'Touch',
    name: 'Touch Cinema Pleiku',
    area: 'Phù Đổng',
    city: 'Gia Lai (Pleiku)',
    address: '212 Nguyễn Tất Thành, Phường Phù Đổng, TP. Pleiku, Gia Lai',
    phone: '0269 3838 999',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Caramel & Cheese', '🅿️ Hầm đỗ xe máy', '🎟️ Kiosk quét QR', '🔊 Sound Atmos'],
    distance: '1.2 km',
    moviesCount: 6,
  },
  {
    id: 'starlight-gia-lai',
    brand: 'Starlight',
    name: 'Starlight Cinema Gia Lai',
    area: 'TP. Pleiku',
    city: 'Gia Lai (Pleiku)',
    address: 'Tầng 5, Tòa nhà Kim Center, 53 Quang Trung, TP. Pleiku, Gia Lai',
    phone: '1900 1722',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp ngọt & mặn', '🅿️ Bãi xe Kim Center', '🎟️ Vé QR code', '🎬 2D/3D'],
    distance: '1.8 km',
    moviesCount: 5,
  },

  // ==================== BÌNH THUẬN (PHAN THIẾT) ====================
  {
    id: 'lotte-cinema-phan-thiet',
    brand: 'Lotte',
    name: 'LOTTE Cinema Phan Thiết',
    area: 'Phú Thủy',
    city: 'Bình Thuận (Phan Thiết)',
    address: 'Tầng 6, Lotte Mart Phan Thiết, KDC Hùng Vương I, P. Phú Thủy, TP. Phan Thiết',
    phone: '0252 3750 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Free bãi xe Lotte Mart', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '1.5 km',
    moviesCount: 5,
  },

  // ==================== CÀ MAU ====================
  {
    id: 'lotte-cinema-ca-mau',
    brand: 'Lotte',
    name: 'LOTTE Cinema Cà Mau',
    area: 'Phường 1',
    city: 'Cà Mau',
    address: 'Tầng 4, TTTM Vincom Plaza Cà Mau, Lê Duẩn, Phường 1, TP. Cà Mau',
    phone: '0290 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.2 km',
    moviesCount: 5,
  },
  {
    id: 'galaxy-cinema-ca-mau',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Cà Mau',
    area: 'Phường 5',
    city: 'Cà Mau',
    address: 'Lầu 2, TTTM Sense City, Số 09 Trần Hưng Đạo, Phường 5, TP. Cà Mau',
    phone: '1900 2224',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp caramel', '🅿️ Bãi xe Sense City', '🎟️ Quét QR', '🔊 Sound 7.1'],
    distance: '1.8 km',
    moviesCount: 5,
  },

  // ==================== BẠC LIÊU ====================
  {
    id: 'cgv-vincom-bac-lieu',
    brand: 'CGV',
    name: 'CGV Vincom Bạc Liêu',
    area: 'Phường 7',
    city: 'Bạc Liêu',
    address: 'Tầng 4, TTTM Vincom Plaza Bạc Liêu, Đường Trần Huỳnh, Phường 7, TP. Bạc Liêu',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D Phụ đề / Lồng tiếng'],
    distance: '1.0 km',
    moviesCount: 5,
  },
  {
    id: 'dcine-bac-lieu',
    brand: 'DCINE',
    name: 'DCINE Bạc Liêu',
    area: 'TP. Bạc Liêu',
    city: 'Bạc Liêu',
    address: 'Tầng 3, Tòa nhà Nguyễn Kim Bạc Liêu, Số 7A Trần Phú, TP. Bạc Liêu',
    phone: '0291 3888 777',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Nguyễn Kim', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.5 km',
    moviesCount: 4,
  },

  // ==================== BẾN TRE ====================
  {
    id: 'galaxy-sense-city-ben-tre',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Sense City Bến Tre',
    area: 'Phường 4',
    city: 'Bến Tre',
    address: 'Lầu 1, TTTM Sense City, 26A Trần Quốc Tuấn, Phường 4, TP. Bến Tre',
    phone: '1900 2224',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Sense City', '🎟️ Quét QR', '🎬 2D/3D'],
    distance: '0.9 km',
    moviesCount: 5,
  },
  {
    id: 'galaxy-go-ben-tre',
    brand: 'Galaxy',
    name: 'Galaxy CineO GO! Bến Tre',
    area: 'Sơn Đông',
    city: 'Bến Tre',
    address: 'Tầng 2, TTTM GO! Bến Tre, Đường Võ Nguyên Giáp, P. Sơn Đông, TP. Bến Tre',
    phone: '1900 2224',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi đỗ xe GO! Mall', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '2.4 km',
    moviesCount: 5,
  },

  // ==================== TRÀ VINH ====================
  {
    id: 'cgv-vincom-tra-vinh',
    brand: 'CGV',
    name: 'CGV Vincom Trà Vinh',
    area: 'Phường 2',
    city: 'Trà Vinh',
    address: 'Tầng 4, TTTM Vincom Plaza Trà Vinh, 24 Nguyễn Thị Minh Khai, P. 2, TP. Trà Vinh',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== VĨNH LONG ====================
  {
    id: 'cgv-vincom-vinh-long',
    brand: 'CGV',
    name: 'CGV Vincom Vĩnh Long',
    area: 'Phường 4',
    city: 'Vĩnh Long',
    address: 'Tầng 4, TTTM Vincom Plaza Vĩnh Long, 55 Phạm Thái Bường, P. 4, TP. Vĩnh Long',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🔊 Sound 7.1'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== SÓC TRĂNG ====================
  {
    id: 'cgv-vincom-soc-trang',
    brand: 'CGV',
    name: 'CGV Vincom Sóc Trăng',
    area: 'Phường 2',
    city: 'Sóc Trăng',
    address: 'TTTM Vincom Plaza Sóc Trăng, Đường Trần Hưng Đạo, Phường 2, TP. Sóc Trăng',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Vincom', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.2 km',
    moviesCount: 5,
  },
  {
    id: 'dcine-soc-trang',
    brand: 'DCINE',
    name: 'DCINE Sóc Trăng (Ánh Quang Plaza)',
    area: 'Phường 6',
    city: 'Sóc Trăng',
    address: 'Tầng 7, Ánh Quang Plaza, 7-9 Tôn Đức Thắng, Phường 6, TP. Sóc Trăng',
    phone: '0299 3888 888',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Bãi xe Ánh Quang', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.6 km',
    moviesCount: 4,
  },

  // ==================== ĐỒNG THÁP (CAO LÃNH) ====================
  {
    id: 'cgv-vincom-cao-lanh',
    brand: 'CGV',
    name: 'CGV Vincom Cao Lãnh',
    area: 'Phường 1',
    city: 'Đồng Tháp (Cao Lãnh)',
    address: 'Tầng 5, TTTM Vincom Plaza Cao Lãnh, 02 Đường 30/4, Phường 1, TP. Cao Lãnh',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D Hi-Def'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== LONG AN (TÂN AN) ====================
  {
    id: 'starlight-long-an',
    brand: 'Starlight',
    name: 'Starlight Cinema Long An (Tân An)',
    area: 'Tân An',
    city: 'Long An (Tân An)',
    address: 'Tầng 3, TTTM Vincom Plaza Long An, Đường Hùng Vương, TP. Tân An, Long An',
    phone: '1900 1722',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai & caramel', '🅿️ Hầm đỗ xe Vincom', '🎟️ Vé QR code', '🔊 Sound Atmos'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== NINH THUẬN (PHAN RANG) ====================
  {
    id: 'lotte-cinema-phan-rang',
    brand: 'Lotte',
    name: 'LOTTE Cinema Phan Rang',
    area: 'Mỹ Hải',
    city: 'Ninh Thuận (Phan Rang)',
    address: 'Tầng 3, TTTM Vincom Plaza Phan Rang, 122 Đường 16/4, P. Mỹ Hải, TP. Phan Rang – Tháp Chàm',
    phone: '0259 3888 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Vincom', '🎟️ Scan QR (4 phòng chiếu)', '🔊 Dolby Sound'],
    distance: '1.3 km',
    moviesCount: 5,
  },

  // ==================== PHÚ YÊN (TUY HÒA) ====================
  {
    id: 'cgv-vincom-phu-yen',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Phú Yên (Tuy Hòa)',
    area: 'Phường 7',
    city: 'Phú Yên (Tuy Hòa)',
    address: 'Tầng 4, TTTM Vincom Plaza Tuy Hòa, Ngã tư Hùng Vương & Trần Phú, P. 7, TP. Tuy Hòa',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm đỗ xe Vincom', '🎟️ Scan QR', '🔊 Dolby 7.1'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== QUẢNG NAM (TAM KỲ / HỘI AN) ====================
  {
    id: 'rio-tam-ky',
    brand: 'RIO',
    name: 'RIO Cinema Tam Kỳ',
    area: 'Tam Kỳ',
    city: 'Quảng Nam (Hội An / Tam Kỳ)',
    address: 'Khu tổ hợp giải trí RIO, Đường Bạch Đằng, TP. Tam Kỳ, Quảng Nam',
    phone: '0235 3888 777',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi xe RIO rộng', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.5 km',
    moviesCount: 5,
  },

  // ==================== BÌNH PHƯỚC (ĐỒNG XOÀI) ====================
  {
    id: 'evg-dong-xoai-cinema',
    brand: 'EVG',
    name: 'EVG Cinema Đồng Xoài',
    area: 'Tân Phú',
    city: 'Bình Phước (Đồng Xoài)',
    address: 'Số 1 Nguyễn Thị Minh Khai, Phường Tân Phú, TP. Đồng Xoài, Bình Phước',
    phone: '0271 3888 555',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe máy free', '🎟️ Kiosk in vé', '🔊 Dolby Sound'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== LÂM ĐỒNG (ĐÀ LẠT & BẢO LỘC) ====================
  {
    id: 'cinestar-da-lat',
    brand: 'Cinestar',
    name: 'Cinestar Đà Lạt (Quảng Trường Lâm Viên)',
    area: 'Phường 10',
    city: 'Lâm Đồng (Đà Lạt)',
    address: 'Tầng Trệt, Quảng Trường Lâm Viên, Phường 10, TP. Đà Lạt, Lâm Đồng',
    phone: '0263 3550 555',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp Phô Mai & Bơ', '🅿️ Bãi xe Quảng Trường', '🎟️ Check-in Kiosk', '🔊 Dolby Atmos'],
    distance: '0.8 km',
    moviesCount: 7,
  },
  {
    id: 'lotte-cinema-bao-loc',
    brand: 'Lotte',
    name: 'LOTTE Cinema Bảo Lộc',
    area: 'Bảo Lộc',
    city: 'Lâm Đồng (Đà Lạt)',
    address: 'Tầng 3, Vincom Plaza Bảo Lộc, 83 Lê Hồng Phong, P. 1, TP. Bảo Lộc, Lâm Đồng',
    phone: '0263 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Vé QR code', '🎬 2D/3D'],
    distance: '22 km',
    moviesCount: 5,
  },
  {
    id: 'starlight-bao-loc',
    brand: 'Starlight',
    name: 'Starlight Cinema Bảo Lộc',
    area: 'Bảo Lộc',
    city: 'Lâm Đồng (Đà Lạt)',
    address: 'Số 729 Trần Phú, Phường B\'Lao, TP. Bảo Lộc, Lâm Đồng',
    phone: '1900 1722',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Bãi xe Trần Phú', '🎟️ Scan QR', '🔊 Sound 7.1'],
    distance: '23 km',
    moviesCount: 5,
  },

  // ==================== QUẢNG NINH ====================
  {
    id: 'cgv-vincom-ha-long',
    brand: 'CGV',
    name: 'CGV Vincom Hạ Long',
    area: 'Bạch Đằng',
    city: 'Quảng Ninh',
    address: 'Tầng 4, TTTM Vincom Center Hạ Long, Khu Cột Đồng Hồ, P. Bạch Đằng, TP. Hạ Long',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D Phụ đề / Lồng tiếng'],
    distance: '2.2 km',
    moviesCount: 5,
  },
  {
    id: 'lotte-cinema-ha-long',
    brand: 'Lotte',
    name: 'LOTTE Cinema Hạ Long',
    area: 'Hồng Hải',
    city: 'Quảng Ninh',
    address: 'TTTM Big C (GO!) Hạ Long, KDC Cột 1, P. Hồng Hải, TP. Hạ Long, Quảng Ninh',
    phone: '0203 3819 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Bãi xe Big C rộng', '🎟️ Check-in QR', '🔊 Dolby 7.1'],
    distance: '3.0 km',
    moviesCount: 5,
  },
  {
    id: 'cgv-vincom-mong-cai',
    brand: 'CGV',
    name: 'CGV Vincom Móng Cái',
    area: 'Móng Cái',
    city: 'Quảng Ninh',
    address: 'Tầng 3 & 4, Vincom Plaza Móng Cái, 10 Hòa Bình, P. Trần Phú, TP. Móng Cái',
    phone: '1900 6017',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ Vincom', '🎟️ QR Scan', '🎬 2D/3D'],
    distance: '120 km',
    moviesCount: 5,
  },

  // ==================== BẮC NINH ====================
  {
    id: 'lotte-cinema-bac-ninh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Bắc Ninh',
    area: 'Suối Hoa',
    city: 'Bắc Ninh',
    address: 'Tầng 3, TTTM Vincom Plaza Bắc Ninh, Ngã 6, P. Suối Hoa, TP. Bắc Ninh',
    phone: '0222 3899 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan vé QR', '🎬 2D/3D'],
    distance: '1.4 km',
    moviesCount: 6,
  },
  {
    id: 'dabaco-lotus-bac-ninh',
    brand: 'Dabaco',
    name: 'Dabaco Cinema Lotus Central Bắc Ninh',
    area: 'TP. Bắc Ninh',
    city: 'Bắc Ninh',
    address: 'TTTM Dabaco Lotus Central, 28 Lý Thái Tổ, TP. Bắc Ninh',
    phone: '0222 3822 999',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp bơ mặn', '🅿️ Hầm Lotus Central', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '1.8 km',
    moviesCount: 5,
  },
  {
    id: 'dabaco-tu-son',
    brand: 'Dabaco',
    name: 'Dabaco Cinema Từ Sơn',
    area: 'Từ Sơn',
    city: 'Bắc Ninh',
    address: 'Tầng 2, TTTM Dabaco Từ Sơn, Đường Lý Thái Tổ, P. Đình Bảng, TP. Từ Sơn, Bắc Ninh',
    phone: '0222 3766 888',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi xe Dabaco', '🎟️ Kiosk in vé', '🔊 Dolby Sound'],
    distance: '12 km',
    moviesCount: 5,
  },

  // ==================== THÁI NGUYÊN ====================
  {
    id: 'beta-thai-nguyen',
    brand: 'Beta',
    name: 'Beta Cinema Thái Nguyên',
    area: 'Tân Thịnh',
    city: 'Thái Nguyên',
    address: '259 Quang Trung, P. Tân Thịnh, TP. Thái Nguyên',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp giá rẻ', '🅿️ Xe máy free', '🎟️ Kiosk in vé', '🔊 Dolby 7.1'],
    distance: '1.0 km',
    moviesCount: 5,
  },
  {
    id: 'cgv-vincom-thai-nguyen',
    brand: 'CGV',
    name: 'CGV Vincom Thái Nguyên',
    area: 'Quang Trung',
    city: 'Thái Nguyên',
    address: 'Tầng 4, TTTM Vincom Plaza Thái Nguyên, 284 Lương Ngọc Quyến, P. Quang Trung, TP. Thái Nguyên',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ Vincom', '🎟️ Scan QR', '🎬 2D/3D Hi-Def'],
    distance: '1.5 km',
    moviesCount: 5,
  },
];

// Robust Search Function matching name, area, city, address, brand without forced placeholders
function getCinemasForCity(searchOrCity: string): CinemaBranch[] {
  if (searchOrCity === 'Tất cả tỉnh thành' || !searchOrCity) {
    return BASE_CINEMA_BRANCHES;
  }

  const rawQuery = searchOrCity.toLowerCase().trim();

  // Normalize query string (remove "tp.", brackets, extra spaces)
  const normQuery = rawQuery
    .replace(/tp\.\s*/g, '')
    .replace(/\s*\(.*\)/g, '')
    .trim();

  const matched = BASE_CINEMA_BRANCHES.filter(b => {
    const nameStr = b.name.toLowerCase();
    const areaStr = b.area.toLowerCase();
    const cityStr = b.city.toLowerCase();
    const addressStr = b.address.toLowerCase();
    const brandStr = b.brand.toLowerCase();

    return (
      nameStr.includes(rawQuery) ||
      areaStr.includes(rawQuery) ||
      cityStr.includes(rawQuery) ||
      addressStr.includes(rawQuery) ||
      brandStr.includes(rawQuery) ||
      (normQuery.length > 0 &&
        (nameStr.includes(normQuery) ||
          cityStr.includes(normQuery) ||
          addressStr.includes(normQuery)))
    );
  });

  if (matched.length > 0) {
    return matched;
  }

  // Clean city name label for fallback generator if province doesn't have a pre-loaded record
  const cityName = searchOrCity.replace(/\s*\(.*\)/g, '').replace(/TP\.\s*/gi, '').trim();

  return [
    {
      id: `cgv-vincom-${cityName.toLowerCase()}`,
      brand: 'CGV',
      name: `CGV Vincom Plaza ${cityName}`,
      area: `Trung tâm ${cityName}`,
      city: searchOrCity,
      address: `Tầng 4, TTTM Vincom Plaza ${cityName}, Đường Phố Chính, TP. ${cityName}`,
      phone: '1900 6017',
      hours: '08:30 - 23:30',
      facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Vincom', '🎟️ Kiosk check-in QR Code', '🔊 Phòng chiếu 2D/3D Sound 7.1'],
      distance: '1.2 km',
      moviesCount: 6,
    }
  ];
}

const DATES = [
  { id: '1', dateStr: '27/7', dayStr: 'Thứ 2', label: 'Thứ Hai · 27/07' },
  { id: '2', dateStr: '28/7', dayStr: 'Thứ 3', label: 'Thứ Ba · 28/07' },
  { id: '3', dateStr: '29/7', dayStr: 'Thứ 4', label: 'Thứ Tư · 29/07' },
  { id: '4', dateStr: '30/7', dayStr: 'Thứ 5', label: 'Thứ Năm · 30/07' },
  { id: '5', dateStr: '31/7', dayStr: 'Thứ 6', label: 'Thứ Sáu · 31/07' },
  { id: '6', dateStr: '1/8', dayStr: 'Thứ 7', label: 'Thứ Bảy · 01/08' },
];

const CINEMA_BRANDS = [
  { id: 'all', name: 'Tất cả rạp', color: '#1E293B' },
  { id: 'Beta', name: 'Beta Cinema', color: '#E11D48' },
  { id: 'CGV', name: 'CGV Cinema', color: '#DC2626' },
  { id: 'Lotte', name: 'Lotte Cinema', color: '#B91C1C' },
  { id: 'Galaxy', name: 'Galaxy Cinema', color: '#EA580C' },
  { id: 'BHD', name: 'BHD Star', color: '#16A34A' },
  { id: 'Cinestar', name: 'Cinestar', color: '#7C3AED' },
  { id: 'Starlight', name: 'Starlight', color: '#0284C7' },
];

export function getMoviesForDateAndBranch(dateId: string, branch: CinemaBranch): MovieItem[] {
  // Brand multiplier
  let priceMult = 1.0;
  if (branch.brand === 'CGV') priceMult = 1.25;
  else if (branch.brand === 'Lotte') priceMult = 1.15;
  else if (branch.brand === 'BHD') priceMult = 1.1;
  else if (branch.brand === 'Beta') priceMult = 0.85;
  else if (branch.brand === 'Rạp Quốc Gia') priceMult = 0.9;
  else if (branch.brand === 'Galaxy') priceMult = 1.0;

  // Day 2 (Thứ 3 · 28/07) is Happy Tuesday discount!
  if (dateId === '2') {
    priceMult *= 0.8;
  }

  const makePrice = (base: number) => {
    const raw = Math.round((base * priceMult) / 5000) * 5000;
    const finalPrice = Math.max(45000, raw);
    return {
      price: finalPrice,
      priceText: `${finalPrice / 1000}K`
    };
  };

  // Base movie templates
  const MOVIE_TEMPLATES = {
    conan: {
      id: 'conan-29',
      title: 'Conan Movie 29: Thiên Thần Sa Ngã Trên Xa Lộ',
      originalTitle: 'Detective Conan: Fallen Angel of the Highway',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
      ageRating: 'T13',
      duration: "1h49'",
      hasTrailer: true,
      genres: 'Hành Động, Trinh Thám, Hoạt Hình',
    },
    latmat: {
      id: 'lat-mat-7',
      title: 'Lật Mặt 7: Một Điều Ước (Đạo diễn Lý Hải)',
      originalTitle: 'Face Off 7: One Wish',
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80',
      ageRating: 'K',
      duration: "2h18'",
      hasTrailer: true,
      genres: 'Gia Đình, Tâm Lý, Tình Cảm',
    },
    deadpool: {
      id: 'deadpool-wolverine',
      title: 'Deadpool & Wolverine',
      originalTitle: 'Deadpool & Wolverine (Marvel Studios)',
      poster: 'https://images.unsplash.com/photo-1568876694728-451bbf694b83?w=500&q=80',
      ageRating: 'T18',
      duration: "2h07'",
      hasTrailer: true,
      genres: 'Hành Động, Hài Hước, Sci-Fi',
    },
    insideout: {
      id: 'inside-out-2',
      title: 'Những Mảnh Ghép Cảm Xúc 2',
      originalTitle: 'Inside Out 2 (Disney Pixar)',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
      ageRating: 'P',
      duration: "1h36'",
      hasTrailer: true,
      genres: 'Hoạt Hình, Gia Đình, Hài Hước',
    },
    minions: {
      id: 'despicable-me-4',
      title: 'Kẻ Trộm Mặt Trăng 4',
      originalTitle: 'Despicable Me 4 (Illumination)',
      poster: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=500&q=80',
      ageRating: 'P',
      duration: "1h34'",
      hasTrailer: true,
      genres: 'Hoạt Hình, Hài, Phiêu Lưu',
    },
    exhuma: {
      id: 'exhuma',
      title: 'Quật Mộ Trùng Ma (Exhuma)',
      originalTitle: 'Exhuma (Pamyo)',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
      ageRating: 'T18',
      duration: "2h14'",
      hasTrailer: true,
      genres: 'Kinh Dị, Giật Gân, Bí Ẩn',
    },
    godzilla: {
      id: 'godzilla-x-kong',
      title: 'Godzilla x Kong: Đế Chế Mới',
      originalTitle: 'Godzilla x Kong: The New Empire',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
      ageRating: 'T13',
      duration: "1h55'",
      hasTrailer: true,
      genres: 'Hành Động, Viễn Tưởng, Quái Vật',
    },
    fantasticfour: {
      id: 'fantastic-four-sneak',
      title: dateId === '4' ? '[SUẤT CHIẾU SỚM] Bộ Tứ Thần Thánh: Bước Khởi Đầu' : 'Bộ Tứ Thần Thánh: Bước Khởi Đầu',
      originalTitle: 'The Fantastic Four: First Steps (Marvel Studios)',
      poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80',
      ageRating: 'T13',
      duration: "2h05'",
      hasTrailer: true,
      genres: 'Hành Động, Siêu Anh Hùng, Viễn Tưởng',
    },
    alien: {
      id: 'alien-romulus',
      title: 'Alien: Romulus (Quái Vật Không Gian)',
      originalTitle: 'Alien: Romulus (20th Century Studios)',
      poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&q=80',
      ageRating: 'T18',
      duration: "1h59'",
      hasTrailer: true,
      genres: 'Kinh Dị, Viễn Tưởng, Giật Gân',
    },
    mai: {
      id: 'mai-tran-thanh',
      title: 'Mai (Đạo diễn Trấn Thành)',
      originalTitle: 'MAI (Film by Tran Thanh)',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80',
      ageRating: 'T18',
      duration: "2h11'",
      hasTrailer: true,
      genres: 'Tâm Lý, Tình Cảm, Hài',
    }
  };

  // Build daily movie schedules
  if (dateId === '1') { // 27/07 Thứ 2
    return [
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '08:30', available: false, ...makePrice(50000) },
              { time: '11:00', available: false, ...makePrice(50000) },
              { time: '14:15', available: true, ...makePrice(55000) },
              { time: '17:00', available: true, ...makePrice(55000) },
              { time: '19:30', available: true, ...makePrice(60000) },
              { time: '21:45', available: true, ...makePrice(60000) },
            ]
          },
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '10:00', available: false, ...makePrice(55000) },
              { time: '16:00', available: true, ...makePrice(55000) },
              { time: '18:15', available: true, ...makePrice(60000) },
              { time: '20:45', available: true, ...makePrice(60000) },
              { time: '23:00', available: true, ...makePrice(55000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.latmat,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '08:45', available: false, ...makePrice(50000) },
              { time: '11:30', available: true, ...makePrice(55000) },
              { time: '14:00', available: true, ...makePrice(55000) },
              { time: '16:30', available: true, ...makePrice(60000) },
              { time: '19:00', available: true, ...makePrice(65000) },
              { time: '21:30', available: true, ...makePrice(65000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.deadpool,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '09:30', available: false, ...makePrice(60000) },
              { time: '13:00', available: true, ...makePrice(65000) },
              { time: '15:45', available: true, ...makePrice(65000) },
              { time: '18:30', available: true, ...makePrice(70000) },
              { time: '21:15', available: true, ...makePrice(70000) },
              { time: '23:45', available: true, ...makePrice(60000) },
            ]
          },
          ...(branch.brand === 'CGV' ? [{
            format: 'IMAX 2D Phụ Đề',
            times: [
              { time: '14:30', available: true, ...makePrice(120000) },
              { time: '19:45', available: true, ...makePrice(140000) },
            ]
          }] : [])
        ]
      },
      {
        ...MOVIE_TEMPLATES.insideout,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '09:15', available: true, ...makePrice(50000) },
              { time: '11:15', available: true, ...makePrice(55000) },
              { time: '15:00', available: true, ...makePrice(55000) },
              { time: '17:15', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.minions,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '08:15', available: true, ...makePrice(50000) },
              { time: '10:15', available: true, ...makePrice(50000) },
              { time: '14:00', available: true, ...makePrice(55000) },
              { time: '16:00', available: true, ...makePrice(55000) },
              { time: '18:00', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.exhuma,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '18:00', available: true, ...makePrice(65000) },
              { time: '20:30', available: true, ...makePrice(70000) },
              { time: '22:45', available: true, ...makePrice(65000) },
            ]
          }
        ]
      }
    ];
  } else if (dateId === '2') { // 28/07 Thứ 3 (Happy Tuesday - Giá đồng giá ưu đãi)
    return [
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Lồng Tiếng [ƯU ĐÃI THỨ 3 - 45K]',
            times: [
              { time: '09:00', available: true, ...makePrice(45000) },
              { time: '11:30', available: true, ...makePrice(45000) },
              { time: '15:00', available: true, ...makePrice(45000) },
              { time: '17:45', available: true, ...makePrice(50000) },
              { time: '20:00', available: true, ...makePrice(50000) },
              { time: '22:15', available: true, ...makePrice(45000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.latmat,
        showtimes: [
          {
            format: '2D Phụ Đề Việt [ƯU ĐÃI THỨ 3]',
            times: [
              { time: '09:15', available: true, ...makePrice(45000) },
              { time: '12:00', available: true, ...makePrice(45000) },
              { time: '14:45', available: true, ...makePrice(45000) },
              { time: '17:30', available: true, ...makePrice(50000) },
              { time: '20:15', available: true, ...makePrice(50000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.mai,
        showtimes: [
          {
            format: '2D Phụ Đề Việt [ƯU ĐÃI THỨ 3]',
            times: [
              { time: '10:00', available: true, ...makePrice(45000) },
              { time: '13:15', available: true, ...makePrice(45000) },
              { time: '16:30', available: true, ...makePrice(50000) },
              { time: '19:45', available: true, ...makePrice(50000) },
              { time: '22:30', available: true, ...makePrice(45000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.godzilla,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '11:00', available: true, ...makePrice(45000) },
              { time: '14:30', available: true, ...makePrice(50000) },
              { time: '18:00', available: true, ...makePrice(50000) },
              { time: '21:00', available: true, ...makePrice(50000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.exhuma,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '17:00', available: true, ...makePrice(50000) },
              { time: '19:30', available: true, ...makePrice(50000) },
              { time: '22:00', available: true, ...makePrice(50000) },
            ]
          }
        ]
      }
    ];
  } else if (dateId === '3') { // 29/07 Thứ 4 (Mid-week Student Special)
    return [
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '10:15', available: true, ...makePrice(50000) },
              { time: '13:30', available: true, ...makePrice(55000) },
              { time: '16:45', available: true, ...makePrice(55000) },
              { time: '19:15', available: true, ...makePrice(60000) },
              { time: '21:30', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.deadpool,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '11:00', available: true, ...makePrice(60000) },
              { time: '14:00', available: true, ...makePrice(65000) },
              { time: '17:00', available: true, ...makePrice(65000) },
              { time: '20:00', available: true, ...makePrice(70000) },
              { time: '22:45', available: true, ...makePrice(65000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.insideout,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '08:45', available: true, ...makePrice(50000) },
              { time: '10:45', available: true, ...makePrice(50000) },
              { time: '14:15', available: true, ...makePrice(55000) },
              { time: '16:30', available: true, ...makePrice(55000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.minions,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '09:30', available: true, ...makePrice(50000) },
              { time: '13:15', available: true, ...makePrice(55000) },
              { time: '15:30', available: true, ...makePrice(55000) },
              { time: '17:30', available: true, ...makePrice(55000) },
            ]
          }
        ]
      }
    ];
  } else if (dateId === '4') { // 30/07 Thứ 5 (Sneak Previews Day)
    return [
      {
        ...MOVIE_TEMPLATES.fantasticfour,
        showtimes: [
          {
            format: '2D Phụ Đề [SUẤT CHIẾU SỚM ĐẶC BIỆT]',
            times: [
              { time: '18:30', available: true, ...makePrice(75000) },
              { time: '20:45', available: true, ...makePrice(80000) },
              { time: '23:00', available: true, ...makePrice(75000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '09:00', available: true, ...makePrice(50000) },
              { time: '11:45', available: true, ...makePrice(55000) },
              { time: '14:30', available: true, ...makePrice(55000) },
              { time: '17:15', available: true, ...makePrice(60000) },
              { time: '20:00', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.latmat,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '10:00', available: true, ...makePrice(50000) },
              { time: '13:00', available: true, ...makePrice(55000) },
              { time: '16:00', available: true, ...makePrice(60000) },
              { time: '19:00', available: true, ...makePrice(65000) },
              { time: '21:45', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.deadpool,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '12:15', available: true, ...makePrice(65000) },
              { time: '15:15', available: true, ...makePrice(65000) },
              { time: '18:15', available: true, ...makePrice(70000) },
              { time: '21:15', available: true, ...makePrice(70000) },
            ]
          }
        ]
      }
    ];
  } else if (dateId === '5') { // 31/07 Thứ 6 (New Release Friday + Midnights)
    return [
      {
        ...MOVIE_TEMPLATES.fantasticfour,
        showtimes: [
          {
            format: '2D Phụ Đề [MỚI CÔNG CHIẾU]',
            times: [
              { time: '09:30', available: true, ...makePrice(65000) },
              { time: '12:15', available: true, ...makePrice(70000) },
              { time: '15:00', available: true, ...makePrice(70000) },
              { time: '17:45', available: true, ...makePrice(75000) },
              { time: '20:30', available: true, ...makePrice(80000) },
              { time: '23:15', available: true, ...makePrice(75000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.alien,
        showtimes: [
          {
            format: '2D Phụ Đề [MỚI CÔNG CHIẾU]',
            times: [
              { time: '10:30', available: true, ...makePrice(65000) },
              { time: '13:45', available: true, ...makePrice(70000) },
              { time: '16:45', available: true, ...makePrice(70000) },
              { time: '19:45', available: true, ...makePrice(75000) },
              { time: '22:30', available: true, ...makePrice(75000) },
              { time: '00:15', available: true, ...makePrice(70000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '08:30', available: true, ...makePrice(50000) },
              { time: '11:15', available: true, ...makePrice(55000) },
              { time: '14:00', available: true, ...makePrice(55000) },
              { time: '16:45', available: true, ...makePrice(60000) },
              { time: '19:30', available: true, ...makePrice(60000) },
              { time: '22:15', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.deadpool,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '10:00', available: true, ...makePrice(65000) },
              { time: '13:00', available: true, ...makePrice(70000) },
              { time: '16:00', available: true, ...makePrice(70000) },
              { time: '19:00', available: true, ...makePrice(75000) },
              { time: '22:00', available: true, ...makePrice(75000) },
              { time: '00:30', available: true, ...makePrice(70000) },
            ]
          }
        ]
      }
    ];
  } else { // 01/08 Thứ 7 (Weekend Prime-Time Blockbusters)
    return [
      {
        ...MOVIE_TEMPLATES.conan,
        showtimes: [
          {
            format: '2D Lồng Tiếng [CUỐI TUẦN SÔI ĐỘNG]',
            times: [
              { time: '08:00', available: true, ...makePrice(55000) },
              { time: '09:15', available: true, ...makePrice(60000) },
              { time: '10:30', available: true, ...makePrice(60000) },
              { time: '11:45', available: true, ...makePrice(60000) },
              { time: '13:00', available: true, ...makePrice(65000) },
              { time: '14:15', available: true, ...makePrice(65000) },
              { time: '15:30', available: true, ...makePrice(65000) },
              { time: '16:45', available: true, ...makePrice(70000) },
              { time: '18:00', available: true, ...makePrice(70000) },
              { time: '19:15', available: true, ...makePrice(70000) },
              { time: '20:30', available: true, ...makePrice(70000) },
              { time: '21:45', available: true, ...makePrice(65000) },
              { time: '23:00', available: true, ...makePrice(60000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.fantasticfour,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '08:30', available: true, ...makePrice(65000) },
              { time: '11:00', available: true, ...makePrice(70000) },
              { time: '13:30', available: true, ...makePrice(75000) },
              { time: '16:00', available: true, ...makePrice(75000) },
              { time: '18:30', available: true, ...makePrice(80000) },
              { time: '21:00', available: true, ...makePrice(80000) },
              { time: '23:30', available: true, ...makePrice(75000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.alien,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '09:45', available: true, ...makePrice(65000) },
              { time: '12:30', available: true, ...makePrice(70000) },
              { time: '15:15', available: true, ...makePrice(75000) },
              { time: '18:00', available: true, ...makePrice(80000) },
              { time: '20:45', available: true, ...makePrice(80000) },
              { time: '23:15', available: true, ...makePrice(75000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.deadpool,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '09:00', available: true, ...makePrice(70000) },
              { time: '11:45', available: true, ...makePrice(75000) },
              { time: '14:30', available: true, ...makePrice(75000) },
              { time: '17:15', available: true, ...makePrice(80000) },
              { time: '20:00', available: true, ...makePrice(85000) },
              { time: '22:45', available: true, ...makePrice(80000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.latmat,
        showtimes: [
          {
            format: '2D Phụ Đề Việt',
            times: [
              { time: '08:15', available: true, ...makePrice(60000) },
              { time: '10:45', available: true, ...makePrice(65000) },
              { time: '13:15', available: true, ...makePrice(70000) },
              { time: '15:45', available: true, ...makePrice(70000) },
              { time: '18:15', available: true, ...makePrice(75000) },
              { time: '20:45', available: true, ...makePrice(75000) },
              { time: '23:15', available: true, ...makePrice(70000) },
            ]
          }
        ]
      },
      {
        ...MOVIE_TEMPLATES.insideout,
        showtimes: [
          {
            format: '2D Lồng Tiếng',
            times: [
              { time: '08:00', available: true, ...makePrice(60000) },
              { time: '10:00', available: true, ...makePrice(65000) },
              { time: '12:00', available: true, ...makePrice(65000) },
              { time: '14:00', available: true, ...makePrice(70000) },
              { time: '16:00', available: true, ...makePrice(70000) },
              { time: '18:00', available: true, ...makePrice(70000) },
            ]
          }
        ]
      }
    ];
  }
}

export default function CinemaShowtimesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { selectShowtime } = useCinema();
  const [selectedDateId, setSelectedDateId] = useState('1');
  const [selectedBrandId, setSelectedBrandId] = useState('all');

  // Selected Cinema Branch & Selected City Filters
  const [currentBranch, setCurrentBranch] = useState<CinemaBranch>(BASE_CINEMA_BRANCHES[0]); // NCC Láng Hạ
  const [selectedCityFilter, setSelectedCityFilter] = useState('TP. Hà Nội');

  // Cinema Search Modal & Query
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDateObj = DATES.find(d => d.id === selectedDateId) || DATES[0];

  // Get cinemas based on current city filter or search query
  let displayCinemas = getCinemasForCity(searchQuery || selectedCityFilter);

  // Apply brand filter if selected
  if (selectedBrandId !== 'all') {
    displayCinemas = displayCinemas.filter(b => b.brand === selectedBrandId);
  }

  const activeMovies = getMoviesForDateAndBranch(selectedDateId, currentBranch);

  const handleSelectBranch = (branch: CinemaBranch) => {
    setCurrentBranch(branch);
    setShowSearchModal(false);
  };

  const handleSelectShowtime = (movie: MovieItem, format: string, time: string, price: number) => {
    selectShowtime(
      movie,
      format,
      time,
      price,
      selectedDateObj.label,
      currentBranch.name,
      'Phòng chiếu P7'
    );
    router.push('/cinema/seat-selection');
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontFamily: theme.fontFamily }]}>Đặt vé xem phim</Text>
            
            {/* Location & Active Cinema Badge */}
            <TouchableOpacity
              style={styles.cinemaLocationBadge}
              onPress={() => setShowSearchModal(true)}
            >
              <Ionicons name="location-sharp" size={13} color="#DC2626" />
              <Text style={styles.cinemaLocationText} numberOfLines={1}>
                {currentBranch.city} · {currentBranch.name}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Area & City Search Input Bar */}
        <View style={styles.searchAreaBar}>
          <TouchableOpacity style={styles.searchAreaInputBox} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <Text style={styles.searchAreaPlaceholder}>
              Bấm để xem danh sách rạp thực tế chính xác từng tỉnh thành...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cinema Brands Filter Horizontal Bar */}
        <View style={styles.brandsBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsList}>
            {CINEMA_BRANDS.map(brand => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandChip,
                    isSelected && { backgroundColor: brand.color, borderColor: brand.color }
                  ]}
                  onPress={() => setSelectedBrandId(brand.id)}
                >
                  <Text style={[styles.brandChipText, isSelected && styles.brandChipTextActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Horizontal Date Selector */}
        <View style={styles.dateSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
            {DATES.map(date => {
              const isSelected = date.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={date.id}
                  style={[styles.dateTab, isSelected && styles.dateTabActive]}
                  onPress={() => setSelectedDateId(date.id)}
                >
                  <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                    {date.dateStr}
                  </Text>
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                    {date.dayStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Yellow Instruction Banner */}
          <View style={styles.instructionBanner}>
            <Ionicons name="information-circle" size={20} color="#CA8A04" style={{ marginRight: 8 }} />
            <Text style={[styles.instructionText, { fontFamily: theme.fontFamily }]}>
              Suất chiếu tại <Text style={{ fontWeight: '800' }}>{currentBranch.name}</Text> ({currentBranch.city}) · <Text style={{ fontWeight: '700', color: '#DC2626' }}>{selectedDateObj.label}</Text>
            </Text>
          </View>

          {/* Movies & Showtimes Grid List */}
          {activeMovies.map(movie => (
            <View key={movie.id} style={styles.movieCard}>
              {/* Movie Header Info */}
              <View style={styles.movieHeaderRow}>
                <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
                <View style={styles.movieInfoColumn}>
                  <Text style={[styles.movieTitle, { fontFamily: theme.fontFamily }]} numberOfLines={2}>
                    {movie.title}
                  </Text>
                  
                  <View style={styles.movieMetaRow}>
                    {movie.originalTitle && (
                      <Text style={styles.movieSubTitle} numberOfLines={1}>
                        {movie.originalTitle} ·{' '}
                      </Text>
                    )}
                    <View style={styles.ageBadge}>
                      <Text style={styles.ageBadgeText}>{movie.ageRating}</Text>
                    </View>
                    <Text style={styles.movieSubTitle}> · {movie.duration} · </Text>
                    <TouchableOpacity onPress={() => alert(`Đang phát Trailer phim: ${movie.title}`)}>
                      <Text style={styles.trailerLink}>Trailer</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.genresText}>{movie.genres}</Text>
                </View>
              </View>

              {/* Format Sections */}
              {movie.showtimes.map((stGroup, groupIdx) => (
                <View key={groupIdx} style={styles.formatSection}>
                  <Text style={[styles.formatTitle, { fontFamily: theme.fontFamily }]}>
                    {stGroup.format}
                  </Text>

                  {/* 4-Column Grid for Showtimes */}
                  <View style={styles.showtimesGrid}>
                    {stGroup.times.map((stItem, timeIdx) => {
                      if (!stItem.available) {
                        return (
                          <View key={timeIdx} style={styles.showtimeDisabledBox}>
                            <Text style={styles.showtimeDisabledText}>{stItem.time}</Text>
                          </View>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={timeIdx}
                          style={styles.showtimeActiveBox}
                          onPress={() => handleSelectShowtime(movie, stGroup.format, stItem.time, stItem.price)}
                        >
                          <Text style={styles.showtimeActiveTime}>{stItem.time}</Text>
                          <Text style={styles.showtimePriceText}>{stItem.priceText}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Tìm & Chọn Rạp Chi Tiết Theo 63 Tỉnh Thành */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSearchModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { fontFamily: theme.fontFamily }]}>
                  Chọn Rạp Thực Tế Moveek ({displayCinemas.length} rạp)
                </Text>
                <TouchableOpacity onPress={() => setShowSearchModal(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Search Box Input */}
              <View style={styles.modalSearchBox}>
                <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Gõ tên rạp hoặc tỉnh thành (vd: Bắc Giang, Hải Dương, Gia Lai...)"
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* City Selection Pills (Danh sách 63 Tỉnh Thành) */}
              <View style={styles.citySelectorSection}>
                <Text style={styles.citySelectorTitle}>Nhấn chọn Tỉnh / Thành Phố:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityListRow}>
                  {ALL_63_PROVINCES.map(city => {
                    const isSelected = city === selectedCityFilter;
                    return (
                      <TouchableOpacity
                        key={city}
                        style={[styles.cityPill, isSelected && styles.cityPillActive]}
                        onPress={() => {
                          setSelectedCityFilter(city);
                          setSearchQuery('');
                        }}
                      >
                        <Text style={[styles.cityPillText, isSelected && styles.cityPillTextActive]}>
                          {city}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Header Tỉnh Thành Đã Chọn */}
              <View style={styles.selectedCityHeaderRow}>
                <Ionicons name="location-sharp" size={16} color="#DC2626" />
                <Text style={styles.selectedCityHeaderText}>
                  {selectedCityFilter !== 'Tất cả tỉnh thành'
                    ? `Danh sách rạp thực tế tại ${selectedCityFilter} (${displayCinemas.length} rạp)`
                    : `Tất cả cụm rạp Moveek (${displayCinemas.length} rạp)`}
                </Text>
              </View>

              {/* Cinema Branches Rich Detailed Cards List */}
              <ScrollView style={styles.branchListContainer} showsVerticalScrollIndicator={false}>
                {displayCinemas.length === 0 ? (
                  <View style={styles.emptyResultsBox}>
                    <Ionicons name="location-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyResultsText}>
                      Không tìm thấy rạp nào ở "{searchQuery || selectedCityFilter}"
                    </Text>
                  </View>
                ) : (
                  displayCinemas.map(branch => {
                    const isSelected = branch.id === currentBranch.id;
                    return (
                      <View
                        key={branch.id}
                        style={[styles.richBranchCard, isSelected && styles.richBranchCardSelected]}
                      >
                        {/* Title Row */}
                        <View style={styles.branchHeaderRow}>
                          <View style={styles.brandBadge}>
                            <Text style={styles.brandBadgeText}>{branch.brand}</Text>
                          </View>
                          <Text style={[styles.branchNameText, { fontFamily: theme.fontFamily }]}>
                            {branch.name}
                          </Text>
                        </View>

                        {/* Full Address */}
                        <View style={styles.richDetailRow}>
                          <Ionicons name="map-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                          <Text style={styles.branchAddressText}>{branch.address}</Text>
                        </View>

                        {/* Phone & Working Hours */}
                        <View style={styles.phoneHoursRow}>
                          <View style={styles.richDetailRow}>
                            <Ionicons name="call-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                            <Text style={styles.phoneText}>{branch.phone}</Text>
                          </View>

                          <View style={styles.richDetailRow}>
                            <Ionicons name="time-outline" size={13} color="#D97706" style={{ marginRight: 4 }} />
                            <Text style={styles.hoursText}>{branch.hours}</Text>
                          </View>
                        </View>

                        {/* Facilities Pills */}
                        <View style={styles.facilitiesRow}>
                          {branch.facilities.map((fac, fIdx) => (
                            <View key={fIdx} style={styles.facilityChip}>
                              <Text style={styles.facilityText}>{fac}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Bottom Actions Row */}
                        <View style={styles.branchBottomRow}>
                          <View style={styles.distanceBadge}>
                            <Ionicons name="navigate" size={11} color="#2563EB" />
                            <Text style={styles.distanceText}>{branch.distance}</Text>
                            <Text style={styles.moviesCountSub}> · {branch.moviesCount} phim đang chiếu</Text>
                          </View>

                          <TouchableOpacity
                            style={[styles.selectBranchBtn, isSelected && styles.selectBranchBtnSelected]}
                            onPress={() => handleSelectBranch(branch)}
                          >
                            <Text style={[styles.selectBranchBtnText, isSelected && styles.selectBranchBtnTextSelected]}>
                              {isSelected ? '✓ Đang chọn' : 'Xem suất chiếu ➔'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' && { paddingVertical: 20 }) },
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', width: '100%' },
  desktopFrame: { maxWidth: 390, maxHeight: 844, aspectRatio: 390 / 844, borderWidth: 12, borderColor: '#000000', borderRadius: 44, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { padding: 4 },
  headerCenter: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cinemaLocationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 2, maxWidth: 240 },
  cinemaLocationText: { fontSize: 11, fontWeight: '700', color: '#DC2626', marginLeft: 4 },
  searchBtn: { padding: 4 },

  /* Search Area Bar */
  searchAreaBar: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchAreaInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', height: 40, borderRadius: 20, paddingHorizontal: 14 },
  searchAreaPlaceholder: { fontSize: 12, color: '#64748B', flex: 1 },

  brandsBarContainer: { backgroundColor: '#FFF', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  brandsList: { paddingHorizontal: 12, flexDirection: 'row' },
  brandChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', marginRight: 8 },
  brandChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  brandChipTextActive: { color: '#FFF' },

  dateSelectorContainer: { backgroundColor: '#E2E8F0', paddingVertical: 6 },
  dateList: { paddingHorizontal: 8, flexDirection: 'row' },
  dateTab: { width: 62, height: 58, borderRadius: 8, backgroundColor: '#F1F5F9', marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  dateTabActive: { backgroundColor: '#3B82F6' },
  dateText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  dateTextActive: { color: '#FFF' },
  dayText: { fontSize: 12, fontWeight: '500', color: '#94A3B8', marginTop: 2 },
  dayTextActive: { color: '#E0F2FE' },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  
  instructionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF08A', borderWidth: 1, borderColor: '#FACC15', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 16 },
  instructionText: { fontSize: 13, fontWeight: '600', color: '#854D0E', flex: 1 },

  movieCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  movieHeaderRow: { flexDirection: 'row', marginBottom: 14 },
  moviePoster: { width: 80, height: 115, borderRadius: 10, backgroundColor: '#E2E8F0' },
  movieInfoColumn: { flex: 1, marginLeft: 12, justifyContent: 'flex-start' },
  movieTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 21 },
  movieMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 6 },
  movieSubTitle: { fontSize: 12, color: '#64748B' },
  ageBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  ageBadgeText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  trailerLink: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  genresText: { fontSize: 12, color: '#94A3B8', marginTop: 6 },

  formatSection: { marginTop: 10 },
  formatTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  showtimesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  
  showtimeDisabledBox: { width: '23%', margin: '1%', height: 42, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  showtimeDisabledText: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },

  showtimeActiveBox: { width: '23%', margin: '1%', paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#3B82F6', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  showtimeActiveTime: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  showtimePriceText: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 },

  /* Modal Search & Filter Rạp Toàn Quốc Chi Tiết */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: '90%' },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalCloseBtn: { padding: 4 },

  modalSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', height: 44, borderRadius: 14, paddingHorizontal: 12, marginBottom: 12 },
  modalSearchInput: { flex: 1, fontSize: 13, color: '#0F172A' },

  citySelectorSection: { marginBottom: 12 },
  citySelectorTitle: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  cityListRow: { flexDirection: 'row' },
  cityPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  cityPillActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  cityPillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  cityPillTextActive: { color: '#FFF' },

  selectedCityHeaderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 12 },
  selectedCityHeaderText: { fontSize: 12, fontWeight: '700', color: '#DC2626', marginLeft: 6 },

  branchListContainer: { flex: 1 },
  emptyResultsBox: { alignItems: 'center', paddingVertical: 40 },
  emptyResultsText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 10 },

  /* Rich Branch Card */
  richBranchCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  richBranchCardSelected: { borderColor: '#DC2626', backgroundColor: '#FFFDFD', borderWidth: 1.5 },
  branchHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  brandBadge: { backgroundColor: '#E11D48', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  brandBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  branchNameText: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },

  richDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  branchAddressText: { fontSize: 12, color: '#475569', flex: 1, lineHeight: 17 },

  phoneHoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  phoneText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  hoursText: { fontSize: 12, fontWeight: '600', color: '#D97706' },

  facilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  facilityChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  facilityText: { fontSize: 11, color: '#475569' },

  branchBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  distanceBadge: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { fontSize: 11, fontWeight: '700', color: '#2563EB', marginLeft: 3 },
  moviesCountSub: { fontSize: 11, color: '#64748B' },

  selectBranchBtn: { backgroundColor: '#E11D48', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  selectBranchBtnSelected: { backgroundColor: '#22C55E' },
  selectBranchBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  selectBranchBtnTextSelected: { color: '#FFF' },
});
