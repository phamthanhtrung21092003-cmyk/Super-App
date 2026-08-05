import React, { useState, useMemo } from 'react';
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
  ActivityIndicator,
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

// Helper to remove Vietnamese diacritical marks (tones) for search matching
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
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

  // ==================== HÀ NỘI (ĐẦY ĐỦ RẠP TOÀN THÀNH PHỐ) ====================
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
    id: 'cgv-vincom-times-city',
    brand: 'CGV',
    name: 'CGV Vincom Times City',
    area: 'Minh Khai',
    city: 'TP. Hà Nội',
    address: 'Tầng B1, Vincom Mega Mall Times City, 458 Minh Khai, Q. Hai Bà Trưng, Hà Nội',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm Times City rộng', '🎟️ Scan QR Kiosk', '🔊 Dolby Atmos'],
    distance: '5.0 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-vincom-nguyen-chi-thanh',
    brand: 'CGV',
    name: 'CGV Vincom Nguyễn Chí Thanh',
    area: 'Nguyễn Chí Thanh',
    city: 'TP. Hà Nội',
    address: 'Tầng 6, Vincom Center Nguyễn Chí Thanh, 54A Nguyễn Chí Thanh, Q. Đống Đa, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm B3 Vincom', '🎟️ Scan QR', '🌟 Premium Recliner Seat'],
    distance: '2.8 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-vincom-tran-duy-hung',
    brand: 'CGV',
    name: 'CGV Vincom Trần Duy Hưng',
    area: 'Trần Duy Hưng',
    city: 'TP. Hà Nội',
    address: 'Tầng 5, Vincom Plaza Trần Duy Hưng, 119 Trần Duy Hưng, Q. Cầu Giấy, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Vincom', '🎟️ QR Scan', '✨ Cine & Foret & Gold Class'],
    distance: '2.5 km',
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
    id: 'cgv-aeon-long-bien',
    brand: 'CGV',
    name: 'CGV AEON Mall Long Biên',
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
    area: 'Dương Nội',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM AEON Mall Hà Đông, KĐT Dương Nội, Q. Hà Đông, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Bãi xe AEON Mall miễn phí', '🎟️ Scan QR', '✨ IMAX & Starium'],
    distance: '7.5 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-ho-guom-plaza',
    brand: 'CGV',
    name: 'CGV Hồ Gươm Plaza Hà Đông',
    area: 'Trần Phú',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, TTTM Hồ Gươm Plaza, 110 Trần Phú, Q. Hà Đông, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm Hồ Gươm Plaza', '🎟️ QR Scan', '🎬 2D/3D'],
    distance: '6.0 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-vincom-ocean-park',
    brand: 'CGV',
    name: 'CGV Vincom Mega Mall Ocean Park',
    area: 'Gia Lâm',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, Vincom Mega Mall Ocean Park, KĐT Vinhomes Ocean Park, H. Gia Lâm, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi đỗ Vincom Ocean Park', '🎟️ QR Scan', '🔊 Dolby Atmos'],
    distance: '10.2 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-vincom-skylake',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Skylake',
    area: 'Phạm Hùng',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Vincom Plaza Skylake, Đường Phạm Hùng, Q. Nam Từ Liêm, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Skylake', '🎟️ Scan QR Kiosk', '🔊 Dolby Sound'],
    distance: '3.5 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-ha-noi-center-point',
    brand: 'CGV',
    name: 'CGV Hà Nội Center Point',
    area: 'Lê Văn Lương',
    city: 'TP. Hà Nội',
    address: 'Tầng 5, Tòa nhà Center Point, 27 Lê Văn Lương, Q. Thanh Xuân, Hà Nội',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp caramel', '🅿️ Hầm Center Point', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '3.0 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-west-lake-tay-ho',
    brand: 'Lotte',
    name: 'LOTTE Cinema West Lake Tây Hồ',
    area: 'Võ Chí Công',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, Lotte Mall West Lake, 272 Võ Chí Công, Q. Tây Hồ, Hà Nội',
    phone: '024 3775 2525',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Combo Popcorn Gourmet', '🅿️ Hầm Lotte Mall rộng', '🎟️ Check-in QR', '✨ Charlotte VIP Lounge'],
    distance: '4.8 km',
    moviesCount: 8,
  },
  {
    id: 'lotte-ha-dong',
    brand: 'Lotte',
    name: 'LOTTE Cinema Hà Đông',
    area: 'Tô Hiệu',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM Mê Linh Plaza, Đường Tô Hiệu, Q. Hà Đông, Hà Nội',
    phone: '024 3355 8888',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp phô mai & Caramel', '🅿️ Hầm xe Mê Linh Plaza', '🎟️ Kiosk in vé', '🔊 Dolby 7.1'],
    distance: '7.0 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-thang-long',
    brand: 'Lotte',
    name: 'LOTTE Cinema Thăng Long',
    area: 'Trần Duy Hưng',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Big C Thăng Long, 222 Trần Duy Hưng, Q. Cầu Giấy, Hà Nội',
    phone: '024 3783 2222',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp phô mai', '🅿️ Bãi xe Big C rộng', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '2.2 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-kosmo-tay-ho',
    brand: 'Lotte',
    name: 'LOTTE Cinema Kosmo Tây Hồ',
    area: 'Xuân La',
    city: 'TP. Hà Nội',
    address: 'Tầng 2, Tòa nhà Novo Kosmo Tây Hồ, 161 Xuân La, Q. Bắc Từ Liêm, Hà Nội',
    phone: '024 3202 2222',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Couple', '🅿️ Hầm xe Kosmo', '🎟️ Scan QR', '🛋️ Ghế nằm thư giãn'],
    distance: '3.8 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-discovery-cau-giay',
    brand: 'Lotte',
    name: 'LOTTE Cinema Discovery Cầu Giấy',
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
    id: 'beta-thanh-xuan',
    brand: 'Beta',
    name: 'Beta Cinema Thanh Xuân',
    area: 'Lê Văn Thiêm',
    city: 'TP. Hà Nội',
    address: 'Tầng hầm B1, Tòa nhà Golden West, 2 Lê Văn Thiêm, Q. Thanh Xuân, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp phô mai & caramel giá tốt', '🅿️ Hầm Golden West', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '3.1 km',
    moviesCount: 7,
  },
  {
    id: 'beta-my-dinh',
    brand: 'Beta',
    name: 'Beta Cinema Mỹ Đình',
    area: 'Mễ Trì',
    city: 'TP. Hà Nội',
    address: 'Tầng hầm B1, Tòa nhà Golden Palace, Đường Mễ Trì, Q. Nam Từ Liêm, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp phô mai giá sinh viên', '🅿️ Hầm Golden Palace', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '3.5 km',
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
    id: 'beta-giai-phong',
    brand: 'Beta',
    name: 'Beta Cinema Giải Phóng',
    area: 'Giải Phóng',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Imperial Plaza, 360 Giải Phóng, Q. Thanh Xuân, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Bắp caramel giá sinh viên', '🅿️ Hầm Imperial Plaza', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '5.5 km',
    moviesCount: 6,
  },
  {
    id: 'beta-vincom-smart-city',
    brand: 'Beta',
    name: 'Beta Cinema Vincom Smart City',
    area: 'Tây Mỗ',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, TTTM Vincom Mega Mall Smart City, Nam Từ Liêm, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Popcorn Gourmet giá tốt', '🅿️ Bãi đỗ xe Smart City rộng', '🎟️ QR Scan', '🔊 Sound Atmos'],
    distance: '8.0 km',
    moviesCount: 7,
  },
  {
    id: 'beta-dan-phuong',
    brand: 'Beta',
    name: 'Beta Cinema Đan Phượng',
    area: 'Tân Tây Đô',
    city: 'TP. Hà Nội',
    address: 'Tầng 2, Tòa HHA, KĐT XPHomes - Tân Tây Đô, H. Đan Phượng, Hà Nội',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi xe Tân Tây Đô', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '12.0 km',
    moviesCount: 5,
  },
  {
    id: 'bhd-star-pham-ngoc-thach',
    brand: 'BHD',
    name: 'BHD Star Vincom Phạm Ngọc Thạch',
    area: 'Phạm Ngọc Thạch',
    city: 'TP. Hà Nội',
    address: 'Tầng 8, Vincom Center, 2 Phạm Ngọc Thạch, Q. Đống Đa, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm Vincom Phạm Ngọc Thạch', '🎟️ Scan QR', '🛋️ First Class Lounge'],
    distance: '4.0 km',
    moviesCount: 7,
  },
  {
    id: 'bhd-star-discovery-cau-giay',
    brand: 'BHD',
    name: 'BHD Star Discovery Cầu Giấy',
    area: 'Cầu Giấy',
    city: 'TP. Hà Nội',
    address: 'Tầng 8, TTTM Discovery Complex, 302 Cầu Giấy, Q. Cầu Giấy, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm Discovery Complex', '🎟️ Scan QR', '🎬 2D/3D Sound 7.1'],
    distance: '1.2 km',
    moviesCount: 7,
  },
  {
    id: 'bhd-star-the-garden',
    brand: 'BHD',
    name: 'BHD Star The Garden Mỹ Đình',
    area: 'Mễ Trì',
    city: 'TP. Hà Nội',
    address: 'Tầng 4, TTTM The Garden, Đường Mễ Trì, Q. Nam Từ Liêm, Hà Nội',
    phone: '1900 2099',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp bơ mặn caramel', '🅿️ Hầm The Garden', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '4.0 km',
    moviesCount: 6,
  },
  {
    id: 'galaxy-hanoi-centre',
    brand: 'Galaxy',
    name: 'Galaxy CineX Hanoi Centre (Nguyễn Thái Học)',
    area: 'Ba Đình',
    city: 'TP. Hà Nội',
    address: 'Tầng 3, Tòa Nam, 175 Nguyễn Thái Học, Q. Ba Đình, Hà Nội',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Bãi xe Nguyễn Thái Học', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '2.5 km',
    moviesCount: 7,
  },
  {
    id: 'galaxy-mipec-long-bien',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Mipec Long Biên',
    area: 'Long Biên',
    city: 'TP. Hà Nội',
    address: 'Tầng 6, Mipec Riverside, Số 2 Long Biên 2, Q. Long Biên, Hà Nội',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp caramel & phô mai', '🅿️ Hầm xe Mipec Riverside', '🎟️ Quét QR', '🎬 2D/3D Hi-Def'],
    distance: '5.0 km',
    moviesCount: 7,
  },

  // ==================== TP. HỒ CHÍ MINH (ĐẦY ĐỦ RẠP TOÀN THÀNH PHỐ) ====================
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
    id: 'cgv-landmark-81',
    brand: 'CGV',
    name: 'CGV Vincom Center Landmark 81',
    area: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng B1, TTTM Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP. HCM',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Landmark 81', '🎟️ QR Scan', '✨ IMAX Laser & Gold Class'],
    distance: '3.0 km',
    moviesCount: 9,
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
    id: 'cgv-giga-mall-thu-duc',
    brand: 'CGV',
    name: 'CGV Giga Mall Thủ Đức',
    area: 'Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 6, TTTM Giga Mall, 240-242 Phạm Văn Đồng, TP. Thủ Đức, TP. HCM',
    phone: '1900 6017',
    hours: '08:30 - 24:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Giga Mall', '🎟️ QR Scan', '🎬 2D/3D Sound 7.1'],
    distance: '4.5 km',
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
    id: 'lotte-nam-sai-gon',
    brand: 'Lotte',
    name: 'LOTTE Cinema Nam Sài Gòn (Quận 7)',
    area: 'Quận 7',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 3, Lotte Mart Nam Sài Gòn, 469 Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP. HCM',
    phone: '028 3775 2524',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi xe Lotte Mart rộng', '🎟️ Scan QR', '🔊 Dolby Sound'],
    distance: '4.0 km',
    moviesCount: 7,
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
  {
    id: 'galaxy-sala-thu-duc',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Sala Thủ Đức',
    area: 'Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 3, TTTM Thiso Mall Sala, 10 Mai Chí Thọ, TP. Thủ Đức, TP. HCM',
    phone: '1900 2224',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Thiso Mall', '🎟️ Scan QR', '✨ IMAX Laser & CineX Premium'],
    distance: '3.5 km',
    moviesCount: 8,
  },

  // ==================== HẢI PHÒNG ====================
  {
    id: 'cgv-aeon-mall-hai-phong',
    brand: 'CGV',
    name: 'CGV AEON Mall Hải Phòng Lê Chân',
    area: 'Lê Chân',
    city: 'Hải Phòng',
    address: 'Tầng 3, TTTM AEON Mall Hải Phòng Lê Chân, số 10 Võ Nguyên Giáp, Q. Lê Chân, Hải Phòng',
    phone: '1900 6017',
    hours: '08:00 - 24:00',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Bãi xe AEON Mall miễn phí', '🎟️ Kiosk check-in QR Code', '🔊 IMAX & Starium Screen'],
    distance: '2.0 km',
    moviesCount: 8,
  },
  {
    id: 'cgv-vincom-imperia-hai-phong',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Imperia Hải Phòng',
    area: 'Hồng Bàng',
    city: 'Hải Phòng',
    address: 'Tầng 4, Vincom Plaza Imperia Hải Phòng, KĐT Vinhomes Imperia, Q. Hồng Bàng, Hải Phòng',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ xe Vincom', '🎟️ Scan vé QR Code', '🎬 Phòng 2D/3D Sound 7.1'],
    distance: '2.6 km',
    moviesCount: 7,
  },
  {
    id: 'galaxy-hai-phong',
    brand: 'Galaxy',
    name: 'Galaxy Cinema Hải Phòng (Nguyễn Kim)',
    area: 'Ngô Quyền',
    city: 'Hải Phòng',
    address: 'Tầng 7, TTTM Nguyễn Kim – Sài Gòn Mall, số 104 Lương Khánh Thiện, Q. Ngô Quyền, Hải Phòng',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp caramel & phô mai', '🅿️ Hầm xe Nguyễn Kim', '🎟️ Quét QR Code', '🔊 Sound 7.1 Hi-Def'],
    distance: '1.5 km',
    moviesCount: 7,
  },
  {
    id: 'lotte-cinema-hai-phong',
    brand: 'Lotte',
    name: 'LOTTE Cinema Hải Phòng (Vincom Lê Thánh Tông)',
    area: 'Ngô Quyền',
    city: 'Hải Phòng',
    address: 'Tầng 5, TTTM Vincom Lê Thánh Tông, số 1 KĐT Bạch Đằng, P. Máy Tơ, Q. Ngô Quyền, Hải Phòng',
    phone: '0225 3836 888',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm đỗ xe Vincom', '🎟️ Check-in Kiosk QR', '🎬 5 phòng chiếu (680 ghế)'],
    distance: '1.8 km',
    moviesCount: 6,
  },

  // ==================== BÌNH DƯƠNG (ĐẦY ĐỦ RẠP) ====================
  {
    id: 'cgv-aeon-canary-binh-duong',
    brand: 'CGV',
    name: 'CGV AEON Canary Bình Dương',
    area: 'Thuận An',
    city: 'Bình Dương',
    address: 'Tầng 2, TTTM AEON Mall Canary, QL13, TP. Thuận An, Bình Dương',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Free bãi xe AEON Mall', '🎟️ QR Scan', '🔊 Dolby Atmos'],
    distance: '2.5 km',
    moviesCount: 7,
  },
  {
    id: 'cgv-binh-duong-square',
    brand: 'CGV',
    name: 'CGV Bình Dương Square',
    area: 'Thủ Dầu Một',
    city: 'Bình Dương',
    address: 'Tầng 3, Bình Dương Square, 1 Phú Lợi, TP. Thủ Dầu Một, Bình Dương',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Square', '🎟️ QR Scan', '🎬 2D/3D'],
    distance: '3.2 km',
    moviesCount: 7,
  },
  {
    id: 'lotte-cinema-binh-duong',
    brand: 'Lotte',
    name: 'LOTTE Cinema Bình Dương',
    area: 'Thuận An',
    city: 'Bình Dương',
    address: 'Tầng 2, Lotte Mart Bình Dương, QL13, TP. Thuận An, Bình Dương',
    phone: '0274 3798 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Bãi xe Lotte Mart', '🎟️ Vé QR code', '🎬 2D/3D'],
    distance: '3.0 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-cinema-di-an',
    brand: 'Lotte',
    name: 'LOTTE Cinema Dĩ An',
    area: 'Dĩ An',
    city: 'Bình Dương',
    address: 'Tầng 3, Vincom Plaza Dĩ An, 79 DT743, TP. Dĩ An, Bình Dương',
    phone: '0274 3799 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🔊 Dolby Sound'],
    distance: '4.0 km',
    moviesCount: 6,
  },
  {
    id: 'beta-empire-binh-duong',
    brand: 'Beta',
    name: 'Beta Cinema Empire Dĩ An',
    area: 'Dĩ An',
    city: 'Bình Dương',
    address: 'Tầng 4, Empire City, TP. Dĩ An, Bình Dương',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai giá tốt', '🅿️ Bãi đỗ xe Empire', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '4.2 km',
    moviesCount: 6,
  },

  // ==================== ĐỒNG NAI (ĐẦY ĐỦ RẠP) ====================
  {
    id: 'lotte-cinema-bien-hoa',
    brand: 'Lotte',
    name: 'LOTTE Cinema Biên Hòa',
    area: 'Biên Hòa',
    city: 'Đồng Nai',
    address: 'Tầng 5, Vincom Plaza Biên Hòa, 1096 Phạm Văn Thuận, TP. Biên Hòa, Đồng Nai',
    phone: '0251 3918 888',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Vincom', '🎟️ Check-in QR Code', '🔊 Dolby 7.1'],
    distance: '1.8 km',
    moviesCount: 6,
  },
  {
    id: 'cgv-bigc-dong-nai',
    brand: 'CGV',
    name: 'CGV BigC (GO!) Đồng Nai',
    area: 'Biên Hòa',
    city: 'Đồng Nai',
    address: 'Tầng 2, TTTM Big C (GO!) Đồng Nai, KDC Bình Đa, TP. Biên Hòa, Đồng Nai',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe Big C rộng', '🎟️ QR Scan', '🎬 2D/3D'],
    distance: '2.2 km',
    moviesCount: 7,
  },
  {
    id: 'beta-bien-hoa',
    brand: 'Beta',
    name: 'Beta Cinema Biên Hòa',
    area: 'Võ Thị Sáu',
    city: 'Đồng Nai',
    address: 'Tầng 4, Pegasus Plaza, 53-55 Võ Thị Sáu, TP. Biên Hòa, Đồng Nai',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai & caramel', '🅿️ Hầm Pegasus', '🎟️ Kiosk in vé', '🔊 Sound 7.1'],
    distance: '1.5 km',
    moviesCount: 6,
  },

  // ==================== BÀ RỊA - VŨNG TÀU (ĐẦY ĐỦ RẠP) ====================
  {
    id: 'cgv-lapen-vung-tau',
    brand: 'CGV',
    name: 'CGV Lapen Center Vũng Tàu',
    area: 'Phường 9',
    city: 'Bà Rịa - Vũng Tàu',
    address: 'Tầng 4, Lapen Center, 33A Đường 30/4, Phường 9, TP. Vũng Tàu',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm xe Lapen', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '1.2 km',
    moviesCount: 6,
  },
  {
    id: 'cgv-lam-son-square',
    brand: 'CGV',
    name: 'CGV Lam Sơn Square Vũng Tàu',
    area: 'Lê Lợi',
    city: 'Bà Rịa - Vũng Tàu',
    address: 'Tầng 4, Lam Sơn Square, 9 Lê Lợi, TP. Vũng Tàu',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe Lam Sơn Square', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.5 km',
    moviesCount: 6,
  },
  {
    id: 'lotte-cinema-vung-tau',
    brand: 'Lotte',
    name: 'LOTTE Cinema Vũng Tàu',
    area: 'Phường 8',
    city: 'Bà Rịa - Vũng Tàu',
    address: 'Tầng 3, Lotte Mart Vũng Tàu, Đường 3/2, Phường 8, TP. Vũng Tàu',
    phone: '0254 3551 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Bắp phô mai & caramel', '🅿️ Bãi xe Lotte Mart', '🎟️ Kiosk in vé', '🎬 2D/3D'],
    distance: '2.0 km',
    moviesCount: 6,
  },
  {
    id: 'galaxy-go-ba-ria',
    brand: 'Galaxy',
    name: 'Galaxy Cinema GO! Bà Rịa',
    area: 'TP. Bà Rịa',
    city: 'Bà Rịa - Vũng Tàu',
    address: 'Tầng 2, TTTM GO! Bà Rịa, Đường Nguyễn Hữu Thọ, TP. Bà Rịa',
    phone: '1900 2224',
    hours: '08:00 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe GO! rộng', '🎟️ Check-in QR', '🔊 Sound Atmos'],
    distance: '8.0 km',
    moviesCount: 6,
  },

  // ==================== ĐÀ NẴNG ====================
  {
    id: 'cgv-vincom-da-nang',
    brand: 'CGV',
    name: 'CGV Vincom Đà Nẵng',
    area: 'Sơn Trà',
    city: 'Đà Nẵng',
    address: 'Tầng 4, TTTM Vincom Plaza, 910A Ngô Quyền, Q. Sơn Trà, Đà Nẵng',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm Vincom', '🎟️ Scan QR Kiosk', '✨ Starium Screen'],
    distance: '1.5 km',
    moviesCount: 7,
  },

  // ==================== CẦN THƠ ====================
  {
    id: 'cgv-vincom-xuan-khanh-can-tho',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Xuân Khánh Cần Thơ',
    area: 'Ninh Kiều',
    city: 'Cần Thơ',
    address: 'Tầng 5, TTTM Vincom Plaza Xuân Khánh, 209 30/4, P. Xuân Khánh, Q. Ninh Kiều, Cần Thơ',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm Vincom', '🎟️ Scan QR Kiosk', '🔊 Dolby Atmos'],
    distance: '1.2 km',
    moviesCount: 7,
  },

  // ==================== NHA TRANG (KHÁNH HÒA) ====================
  {
    id: 'galaxy-gold-coast-nha-trang',
    brand: 'Galaxy',
    name: 'Galaxy Cine+ Gold Coast Nha Trang',
    area: 'Lộc Thọ',
    city: 'Nha Trang (Khánh Hòa)',
    address: 'TTTM Gold Coast, 01 Trần Hưng Đạo, P. Lộc Thọ, TP. Nha Trang',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Bắp phô mai & caramel', '🅿️ Hầm Gold Coast', '🎟️ Quét QR', '🔊 Dolby Atmos'],
    distance: '0.9 km',
    moviesCount: 6,
  },

  // ==================== THỪA THIÊN HUẾ ====================
  {
    id: 'galaxy-aeon-mall-hue',
    brand: 'Galaxy',
    name: 'Galaxy Cinema AEON Mall Huế',
    area: 'An Đông',
    city: 'Thừa Thiên Huế',
    address: 'Tầng 4, TTTM AEON Mall Huế, 8 Võ Nguyên Giáp, P. An Đông, TP. Huế',
    phone: '1900 2224',
    hours: '08:00 - 23:45',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Bãi xe AEON Mall miễn phí', '🎟️ Scan QR', '🔊 IMAX & Dolby Atmos'],
    distance: '1.5 km',
    moviesCount: 7,
  },

  // ==================== BÌNH ĐỊNH (QUY NHƠN) ====================
  {
    id: 'starlight-quy-nhon',
    brand: 'Starlight',
    name: 'Starlight Cinema Quy Nhơn',
    area: 'Lê Lợi',
    city: 'Bình Định (Quy Nhơn)',
    address: 'Tầng 8, TTTM An Phú Thịnh, 52A Tăng Bạt Hổ, P. Lê Lợi, TP. Quy Nhơn',
    phone: '1900 1722',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Hầm xe An Phú Thịnh', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '0.9 km',
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

  // ==================== NAM ĐỊNH ====================
  {
    id: 'lotte-cinema-nam-dinh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Nam Định',
    area: 'Điện Biên',
    city: 'Nam Định',
    address: 'Tầng 5, Tòa nhà Nam Định Tower, số 91 đường Điện Biên, Phường Cửa Bắc, TP. Nam Định',
    phone: '0228 3528 888',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp phô mai & Caramel', '🅿️ Hầm đỗ xe Nam Định Tower', '🎟️ Kiosk check-in QR Code', '🔊 Phòng chiếu 2D/3D Sound 7.1'],
    distance: '0.5 km',
    moviesCount: 7,
  },

  // ==================== THÁI BÌNH ====================
  {
    id: 'lotte-cinema-thai-binh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Thái Bình',
    area: 'Lý Bôn',
    city: 'Thái Bình',
    address: 'Tầng 5, TTTM Vincom Plaza Thái Bình, số 460 đường Lý Bôn, P. Trần Hưng Đạo, TP. Thái Bình',
    phone: '0227 3839 555',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Bắp nước Combo', '🅿️ Hầm đỗ xe Vincom', '🎟️ Scan vé QR Code', '🔊 4 phòng chiếu (540 ghế)'],
    distance: '1.0 km',
    moviesCount: 6,
  },

  // ==================== NINH BÌNH ====================
  {
    id: 'lotte-cinema-ninh-binh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Ninh Bình',
    area: 'Ninh Phúc',
    city: 'Ninh Bình',
    address: 'Tầng 1, TTTM GO! Ninh Bình (Big C), Đường Trần Nhân Tông, Xã Ninh Phúc, TP. Ninh Bình',
    phone: '0229 3898 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi đỗ xe GO! rộng', '🎟️ Check-in Kiosk QR', '🎬 4 phòng chiếu (572 ghế)'],
    distance: '1.2 km',
    moviesCount: 6,
  },

  // ==================== HÀ NAM ====================
  {
    id: 'lotte-cinema-phu-ly-ha-nam',
    brand: 'Lotte',
    name: 'LOTTE Cinema Phủ Lý (Hà Nam)',
    area: 'Phủ Lý',
    city: 'Hà Nam',
    address: 'Tầng 4, Vincom Plaza Phủ Lý, Số 60 Nguyễn Văn Trỗi, TP. Phủ Lý, Hà Nam',
    phone: '0226 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Kiosk check-in', '🔊 Dolby Atmos'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== HƯNG YÊN ====================
  {
    id: 'cgv-ecopark-hung-yen',
    brand: 'CGV',
    name: 'CGV Ecopark Hưng Yên',
    area: 'Văn Giang',
    city: 'Hưng Yên',
    address: 'TTTM Ecopark, Phụng Công, Huyện Văn Giang, Tỉnh Hưng Yên',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe Ecopark rộng', '🎟️ Scan QR', '🔊 Dolby Sound'],
    distance: '2.0 km',
    moviesCount: 5,
  },

  // ==================== PHÚ THỌ (VIỆT TRÌ) ====================
  {
    id: 'lotte-cinema-viet-tri',
    brand: 'Lotte',
    name: 'LOTTE Cinema Việt Trì (Phú Thọ)',
    area: 'Việt Trì',
    city: 'Phú Thọ (Việt Trì)',
    address: 'Tầng 4, Vincom Plaza Việt Trì, Đường Hùng Vương, TP. Việt Trì, Phú Thọ',
    phone: '0210 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ xe Vincom', '🎟️ Kiosk in vé', '🔊 Dolby Atmos'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== THANH HÓA ====================
  {
    id: 'beta-cinema-thanh-hoa',
    brand: 'Beta',
    name: 'Beta Cinema Thanh Hóa',
    area: 'TP. Thanh Hóa',
    city: 'Thanh Hóa',
    address: 'Tầng 3, TTTM Vincom Plaza Thanh Hóa, Đường Trần Phú, TP. Thanh Hóa',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai & caramel', '🅿️ Hầm xe Vincom', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '1.4 km',
    moviesCount: 5,
  },

  // ==================== NGHỆ AN (VINH) ====================
  {
    id: 'lotte-cinema-vinh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Vinh (Nghệ An)',
    area: 'TP. Vinh',
    city: 'Nghệ An (Vinh)',
    address: 'Tầng 5, TTTM Vinh Centre, Đường Trần Phú, TP. Vinh, Nghệ An',
    phone: '0238 3888 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vinh Centre', '🎟️ Check-in QR', '🔊 Dolby Sound'],
    distance: '1.5 km',
    moviesCount: 5,
  },

  // ==================== QUẢNG BÌNH (ĐỒNG HỚI) ====================
  {
    id: 'lotte-cinema-dong-hoi',
    brand: 'Lotte',
    name: 'LOTTE Cinema Đồng Hới',
    area: 'Đồng Hới',
    city: 'Quảng Bình (Đồng Hới)',
    address: 'Tầng 3, TTTM Vincom Plaza Đồng Hới, Đường Quách Xuân Kỳ, TP. Đồng Hới',
    phone: '0232 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== QUẢNG TRỊ (ĐÔNG HÀ) ====================
  {
    id: 'rio-vincom-quang-tri',
    brand: 'RIO',
    name: 'RIO Cinema Vincom Quảng Trị',
    area: 'Nam Đông Hà',
    city: 'Quảng Trị (Đông Hà)',
    address: 'Tầng 4, Vincom Plaza Đông Hà, 252 Hùng Vương, P. Nam Đông Hà, TP. Đông Hà',
    phone: '0233 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Scan vé QR', '🔊 Dolby 7.1'],
    distance: '1.0 km',
    moviesCount: 5,
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

  // ==================== AN GIANG (LONG XUYÊN) ====================
  {
    id: 'lotte-cinema-long-xuyen',
    brand: 'Lotte',
    name: 'LOTTE Cinema Long Xuyên',
    area: 'Long Xuyên',
    city: 'An Giang (Long Xuyên)',
    address: 'Tầng 5, TTTM Vincom Plaza Long Xuyên, Đường Trần Hưng Đạo, TP. Long Xuyên',
    phone: '0296 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== KIÊN GIANG (RẠCH GIÁ / PHÚ QUỐC) ====================
  {
    id: 'cgv-vincom-rach-gia',
    brand: 'CGV',
    name: 'CGV Vincom Rạch Giá',
    area: 'Rạch Giá',
    city: 'Kiên Giang (Rạch Giá / Phú Quốc)',
    address: 'Tầng 4, Vincom Plaza Rạch Giá, Đường Cô Bắc, TP. Rạch Giá, Kiên Giang',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ Vincom', '🎟️ Scan QR', '🔊 Dolby 7.1'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== ĐẮK LẮK (BUÔN MA THUỘT) ====================
  {
    id: 'starlight-buon-ma-thuot',
    brand: 'Starlight',
    name: 'Starlight Cinema Buôn Ma Thuột',
    area: 'Buôn Ma Thuột',
    city: 'Đắc Lắk (Buôn Ma Thuột)',
    address: 'Tầng 6, Vincom Plaza Buôn Ma Thuột, 78 Lý Thường Kiệt, TP. Buôn Ma Thuột',
    phone: '1900 1722',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Hầm xe Vincom', '🎟️ Vé QR code', '🔊 Sound Atmos'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== TIỀN GIANG (MỸ THO) ====================
  {
    id: 'cgv-go-my-tho',
    brand: 'CGV',
    name: 'CGV GO! Mỹ Tho',
    area: 'Mỹ Tho',
    city: 'Tiền Giang (Mỹ Tho)',
    address: 'Tầng 2, TTTM GO! Mỹ Tho, Đường Tết Mậu Thân, TP. Mỹ Tho, Tiền Giang',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Bãi xe GO! rộng', '🎟️ Scan QR', '🎬 2D/3D'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== TÂY NINH ====================
  {
    id: 'lotte-cinema-tay-ninh',
    brand: 'Lotte',
    name: 'LOTTE Cinema Tây Ninh',
    area: 'TP. Tây Ninh',
    city: 'Tây Ninh',
    address: 'Tầng 3, TTTM Vincom Plaza Tây Ninh, Số 444 Đường 30/4, TP. Tây Ninh',
    phone: '0276 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ xe Vincom', '🎟️ Check-in QR', '🔊 Dolby Sound'],
    distance: '1.0 km',
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
    facilities: ['🍿 Combo Popcorn', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🔊 Dolby Sound'],
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

  // ==================== YÊN BÁI ====================
  {
    id: 'rio-yen-bai',
    brand: 'RIO',
    name: 'RIO Cinema Vincom Yên Bái',
    area: 'TP. Yên Bái',
    city: 'Yên Bái',
    address: 'Tầng 4, Vincom Plaza Yên Bái, Đường Nguyễn Thái Học, TP. Yên Bái',
    phone: '0216 3888 999',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🔊 Sound 7.1'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== CAO BẰNG ====================
  {
    id: 'cgv-vincom-cao-bang',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Cao Bằng',
    area: 'Hợp Giang',
    city: 'Cao Bằng',
    address: 'Tầng 4, Vincom Plaza Cao Bằng, Đường Kim Đồng, P. Hợp Giang, TP. Cao Bằng',
    phone: '1900 6017',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm xe Vincom', '🎟️ QR Scan', '🎬 2D/3D'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== ĐIỆN BIÊN ====================
  {
    id: 'dien-bien-cinema',
    brand: 'Cinemax',
    name: 'Rạp Chiếu Phim Điện Biên Phủ',
    area: 'Mường Thanh',
    city: 'Điện Biên',
    address: 'Số 888 Đường Võ Nguyên Giáp, P. Mường Thanh, TP. Điện Biên Phủ',
    phone: '0215 3888 666',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Giữ xe máy free', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.1 km',
    moviesCount: 4,
  },

  // ==================== HÀ GIANG ====================
  {
    id: 'ha-giang-cinema',
    brand: 'Cinemax',
    name: 'Rạp Chiếu Phim Trung Tâm Hà Giang',
    area: 'TP. Hà Giang',
    city: 'Hà Giang',
    address: 'Đường Nguyễn Trãi, P. Nguyễn Trãi, TP. Hà Giang',
    phone: '0219 3888 555',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp ngọt caramel', '🅿️ Bãi xe trung tâm', '🎟️ Vé QR code', '🔊 Sound 7.1'],
    distance: '1.0 km',
    moviesCount: 4,
  },

  // ==================== HÒA BÌNH ====================
  {
    id: 'hoa-binh-cinema',
    brand: 'Beta',
    name: 'Beta Cinema Vincom Hòa Bình',
    area: 'TP. Hòa Bình',
    city: 'Hòa Bình',
    address: 'Tầng 4, Vincom Plaza Hòa Bình, Đường Cù Chính Lan, TP. Hòa Bình',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ Vincom', '🎟️ Kiosk in vé', '🔊 Dolby Sound'],
    distance: '1.3 km',
    moviesCount: 5,
  },

  // ==================== LAI CHÂU ====================
  {
    id: 'lai-chau-cinema',
    brand: 'Cinemax',
    name: 'Rạp Chiếu Phim Trung Tâm Lai Châu',
    area: 'TP. Lai Châu',
    city: 'Lai Châu',
    address: 'Đường 30/4, P. Đông Phong, TP. Lai Châu',
    phone: '0213 3888 777',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp caramel', '🅿️ Giữ xe máy free', '🎟️ Check-in QR', '🎬 2D Screen'],
    distance: '1.0 km',
    moviesCount: 4,
  },

  // ==================== LẠNG SƠN ====================
  {
    id: 'cgv-vincom-lang-son',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Lạng Sơn',
    area: 'TP. Lạng Sơn',
    city: 'Lạng Sơn',
    address: 'Tầng 4, Vincom Plaza Lạng Sơn, Đường Hùng Vương, TP. Lạng Sơn',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Gourmet', '🅿️ Hầm xe Vincom', '🎟️ Scan QR', '🔊 Dolby Atmos'],
    distance: '1.2 km',
    moviesCount: 5,
  },

  // ==================== LÀO CAI ====================
  {
    id: 'cgv-vincom-lao-cai',
    brand: 'CGV',
    name: 'CGV Vincom Plaza Lào Cai',
    area: 'TP. Lào Cai',
    city: 'Lào Cai',
    address: 'Tầng 4, Vincom Plaza Lào Cai, Đường Hoàng Liên, TP. Lào Cai',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Bar', '🅿️ Hầm đỗ Vincom', '🎟️ Scan QR', '🎬 2D/3D Hi-Def'],
    distance: '1.1 km',
    moviesCount: 5,
  },

  // ==================== SƠN LA ====================
  {
    id: 'vincom-son-la-cinema',
    brand: 'Lotte',
    name: 'LOTTE Cinema Vincom Sơn La',
    area: 'TP. Sơn La',
    city: 'Sơn La',
    address: 'Tầng 3, Vincom Plaza Sơn La, Đường Giảng Phân, TP. Sơn La',
    phone: '0212 3888 888',
    hours: '08:30 - 23:00',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm đỗ xe Vincom', '🎟️ Check-in QR', '🔊 Sound 7.1'],
    distance: '1.0 km',
    moviesCount: 5,
  },

  // ==================== TUYÊN QUANG ====================
  {
    id: 'tuyen-quang-cinema',
    brand: 'Beta',
    name: 'Beta Cinema Vincom Tuyên Quang',
    area: 'TP. Tuyên Quang',
    city: 'Tuyên Quang',
    address: 'Tầng 4, Vincom Plaza Tuyên Quang, Đường Quang Trung, TP. Tuyên Quang',
    phone: '1900 636807',
    hours: '08:00 - 23:00',
    facilities: ['🍿 Bắp phô mai', '🅿️ Hầm xe Vincom', '🎟️ Kiosk in vé', '🔊 Dolby Sound'],
    distance: '1.2 km',
    moviesCount: 5,
  },
];

// Robust Search Function matching name, area, city, address, brand with Accent-Insensitive matching (Không dấu)
function getCinemasForCity(searchOrCity: string): CinemaBranch[] {
  if (searchOrCity === 'Tất cả tỉnh thành' || !searchOrCity) {
    return BASE_CINEMA_BRANCHES;
  }

  const rawQuery = searchOrCity.toLowerCase().trim();
  const cleanQuery = removeVietnameseTones(searchOrCity);

  const matched = BASE_CINEMA_BRANCHES.filter(b => {
    const nameClean = removeVietnameseTones(b.name);
    const areaClean = removeVietnameseTones(b.area);
    const cityClean = removeVietnameseTones(b.city);
    const addressClean = removeVietnameseTones(b.address);
    const brandClean = removeVietnameseTones(b.brand);

    return (
      b.name.toLowerCase().includes(rawQuery) ||
      b.area.toLowerCase().includes(rawQuery) ||
      b.city.toLowerCase().includes(rawQuery) ||
      b.address.toLowerCase().includes(rawQuery) ||
      b.brand.toLowerCase().includes(rawQuery) ||
      (cleanQuery.length > 0 &&
        (nameClean.includes(cleanQuery) ||
          areaClean.includes(cleanQuery) ||
          cityClean.includes(cleanQuery) ||
          addressClean.includes(cleanQuery) ||
          brandClean.includes(cleanQuery)))
    );
  });

  if (matched.length > 0) {
    return matched;
  }

  // Clean city name label for fallback generator
  const cityName = searchOrCity.replace(/\s*\(.*\)/g, '').replace(/TP\.\s*/gi, '').trim();

  return [
    {
      id: `cgv-vincom-${removeVietnameseTones(cityName)}`,
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

export interface DateTabItem {
  id: string;
  dateStr: string;
  dayStr: string;
  label: string;
  dayOfWeekIdx: number; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  isToday: boolean;
}

/**
 * Dynamic 6-Day Date Tab Generator
 * Computes 6 consecutive dates starting dynamically from TODAY (Hôm nay)!
 */
export function generateDynamic6Dates(): DateTabItem[] {
  const daysOfWeek = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const fullDaysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  const today = new Date();
  const result: DateTabItem[] = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayNum = d.getDate();
    const monthNum = d.getMonth() + 1;
    const dayOfWeekIdx = d.getDay();

    const dateStr = `${dayNum}/${monthNum}`;
    const dayStr = i === 0 ? 'Hôm nay' : daysOfWeek[dayOfWeekIdx];
    const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const monthFormatted = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;

    const label = i === 0
      ? `Hôm Nay · ${dayFormatted}/${monthFormatted}`
      : `${fullDaysOfWeek[dayOfWeekIdx]} · ${dayFormatted}/${monthFormatted}`;

    result.push({
      id: `${i + 1}`,
      dateStr,
      dayStr,
      label,
      dayOfWeekIdx,
      isToday: i === 0,
    });
  }

  return result;
}

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

// Master Movie Catalog
const MASTER_MOVIE_CATALOG: Omit<MovieItem, 'showtimes'>[] = [
  {
    id: 'conan-29',
    title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
    originalTitle: 'Conan Movie 29 (2026): Fallen Angel of the Highway',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
    ageRating: 'T13',
    duration: "1h49'",
    hasTrailer: true,
    genres: 'Hành Động, Trinh Thám, Hoạt Hình',
  },
  {
    id: 'lat-mat-7',
    title: 'Lật Mặt 7: Một Điều Ước (Đạo diễn Lý Hải)',
    originalTitle: 'Face Off 7: One Wish',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80',
    ageRating: 'K',
    duration: "2h18'",
    hasTrailer: true,
    genres: 'Gia Đình, Tâm Lý, Tình Cảm',
  },
  {
    id: 'mai-tran-thanh',
    title: 'Mai (Đạo diễn Trấn Thành)',
    originalTitle: 'MAI',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80',
    ageRating: 'T18',
    duration: "2h11'",
    hasTrailer: true,
    genres: 'Tâm Lý, Tình Cảm, Hài',
  },
  {
    id: 'kung-fu-panda-4',
    title: 'Kung Fu Panda 4',
    originalTitle: 'Kung Fu Panda 4',
    poster: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=500&q=80',
    ageRating: 'P',
    duration: "1h34'",
    hasTrailer: true,
    genres: 'Hoạt Hình, Hành Động, Hài',
  },
  {
    id: 'dune-2',
    title: 'Dune: Hành Tinh Cát - Phần Hai',
    originalTitle: 'Dune: Part Two',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    ageRating: 'T16',
    duration: "2h46'",
    hasTrailer: true,
    genres: 'Khoa Học Viễn Tưởng, Hành Động',
  },
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine (2026)',
    originalTitle: 'Deadpool & Wolverine',
    poster: 'https://images.unsplash.com/photo-1568876694728-451bbf694b83?w=500&q=80',
    ageRating: 'T18',
    duration: "2h08'",
    hasTrailer: true,
    genres: 'Hành Động, Hài, Siêu Anh Hùng',
  },
  {
    id: 'godzilla-kong',
    title: 'Godzilla x Kong: Đế Chế Mới',
    originalTitle: 'Godzilla x Kong: The New Empire',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
    ageRating: 'T13',
    duration: "1h55'",
    hasTrailer: true,
    genres: 'Hành Động, Viễn Tưởng, Quái Vật',
  }
];

/**
 * Dynamic Showtime & Movie Schedule Engine
 * Generates unique movies, screening formats, prices, and time slots based on Cinema Branch & Date!
 */
function getMoviesForBranchAndDate(branch: CinemaBranch, dateTab: DateTabItem): MovieItem[] {
  const isCGV = branch.brand === 'CGV';
  const isLotte = branch.brand === 'Lotte';
  const isBeta = branch.brand === 'Beta';
  const isCinestar = branch.brand === 'Cinestar';

  const dayIdx = dateTab.dayOfWeekIdx; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const isTuesday = dayIdx === 2;
  const isWeekend = dayIdx === 5 || dayIdx === 6 || dayIdx === 0;

  // Base price dynamically computed per date & brand
  let basePrice = 50000;
  if (isTuesday) basePrice = 45000; // Happy Tuesday
  if (isWeekend) basePrice = 70000; // Weekend

  if (isCGV) basePrice += 10000;
  if (isBeta || isCinestar) basePrice = Math.max(45000, basePrice - 5000);

  // Dynamic Time Slot Presets depending on Day of Week
  const timePresets: Record<number, { t1: string[]; t2: string[] }> = {
    1: {
      // Thứ 2
      t1: ['08:30', '11:00', '14:15', '17:00', '18:30', '20:30', '21:45'],
      t2: ['10:00', '13:30', '16:00', '19:00', '20:45', '22:15'],
    },
    2: {
      // Thứ 3 (Happy Day)
      t1: ['09:15', '11:45', '14:00', '16:30', '18:15', '19:45', '21:15'],
      t2: ['10:30', '13:00', '15:30', '17:45', '20:00', '22:00'],
    },
    3: {
      // Thứ 4
      t1: ['10:00', '12:30', '15:15', '17:45', '19:20', '21:00'],
      t2: ['09:30', '11:50', '14:20', '16:45', '18:50', '21:30'],
    },
    4: {
      // Thứ 5
      t1: ['08:45', '11:15', '13:50', '16:30', '18:45', '20:45', '22:15'],
      t2: ['10:15', '12:45', '15:00', '17:30', '19:40', '21:50'],
    },
    5: {
      // Thứ 6 (Đêm Cuối Tuần)
      t1: ['13:15', '15:45', '17:30', '19:00', '20:15', '21:30', '22:45', '23:30'],
      t2: ['14:00', '16:15', '18:30', '20:00', '21:15', '22:30', '23:55'],
    },
    6: {
      // Thứ 7 (Sáng Đến Khuya)
      t1: ['08:00', '09:30', '11:00', '13:30', '15:00', '17:00', '18:30', '20:00', '21:30', '23:15'],
      t2: ['08:45', '10:15', '12:00', '14:15', '16:00', '17:45', '19:15', '20:45', '22:15'],
    },
    0: {
      // Chủ Nhật
      t1: ['08:15', '09:45', '11:30', '13:45', '15:30', '17:15', '18:45', '20:15', '22:00'],
      t2: ['09:00', '10:45', '12:30', '14:30', '16:15', '18:00', '19:30', '21:00', '22:30'],
    }
  };

  const preset = timePresets[dayIdx] || timePresets[1];

  // Helper to determine if slot is available (if today, past morning hours are disabled)
  const currentHour = new Date().getHours();
  const isSlotAvailable = (timeStr: string) => {
    if (!dateTab.isToday) return true;
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour >= currentHour;
  };

  // Select subset of movies based on branch ID hash & day
  const branchHash = branch.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + dayIdx;
  const movieCount = isCGV ? 6 : isLotte ? 5 : 4;

  const movieIndices = [];
  for (let i = 0; i < movieCount; i++) {
    movieIndices.push((branchHash + i * 2) % MASTER_MOVIE_CATALOG.length);
  }
  const uniqueIndices = Array.from(new Set(movieIndices));
  const branchMovies = uniqueIndices.map(idx => MASTER_MOVIE_CATALOG[idx]);

  return branchMovies.map((movie, mIdx) => {
    // Generate formats for this movie & branch
    const formats = [];

    // Format 1: 2D Lồng Tiếng or IMAX 3D
    const fmt1Name = isCGV && mIdx === 0 ? 'IMAX 3D Phụ Đề' : '2D Lồng Tiếng';
    const fmt1Times = preset.t1.map((time) => {
      const price = fmt1Name.includes('IMAX') ? basePrice + 40000 : basePrice;
      return {
        time,
        price,
        priceText: `${Math.round(price / 1000)}K`,
        available: isSlotAvailable(time)
      };
    });
    formats.push({ format: fmt1Name, times: fmt1Times });

    // Format 2: 2D Phụ Đề Việt or 4DX
    const fmt2Name = isCGV && mIdx === 1 ? '4DX Lồng Tiếng' : '2D Phụ Đề Việt';
    const fmt2Times = preset.t2.map((time) => {
      const price = fmt2Name.includes('4DX') ? basePrice + 35000 : basePrice + 5000;
      return {
        time,
        price,
        priceText: `${Math.round(price / 1000)}K`,
        available: isSlotAvailable(time)
      };
    });
    formats.push({ format: fmt2Name, times: fmt2Times });

    return {
      ...movie,
      showtimes: formats
    };
  });
}

export default function CinemaShowtimesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const { selectShowtime } = useCinema();

  // Dynamic 6 Dates generated starting from Today
  const dynamicDates = useMemo(() => generateDynamic6Dates(), []);

  const [selectedDateId, setSelectedDateId] = useState('1'); // Default to Day 1 (Hôm Nay)
  const [selectedBrandId, setSelectedBrandId] = useState('all');

  // Selected Cinema Branch & Selected City Filters
  const [currentBranch, setCurrentBranch] = useState<CinemaBranch>(BASE_CINEMA_BRANCHES[0]); // NCC Láng Hạ
  const [selectedCityFilter, setSelectedCityFilter] = useState('TP. Hà Nội');

  // Loading state when user switches branch or date
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cinema Search Modal & Query
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDateObj = useMemo(() => {
    return dynamicDates.find(d => d.id === selectedDateId) || dynamicDates[0];
  }, [dynamicDates, selectedDateId]);

  // Dynamic Movie List per selected Branch & Date
  const activeMovies = useMemo(() => {
    return getMoviesForBranchAndDate(currentBranch, selectedDateObj);
  }, [currentBranch, selectedDateObj]);

  // Get cinemas based on current city filter or search query
  let displayCinemas = getCinemasForCity(searchQuery || selectedCityFilter);

  // Apply brand filter if selected ONLY when not searching by query
  if (selectedBrandId !== 'all' && !searchQuery) {
    displayCinemas = displayCinemas.filter(b => b.brand === selectedBrandId);
  }

  const handleSelectBranch = (branch: CinemaBranch) => {
    setIsRefreshing(true);
    setCurrentBranch(branch);
    setShowSearchModal(false);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  const handleSelectDate = (dateId: string) => {
    if (dateId === selectedDateId) return;
    setIsRefreshing(true);
    setSelectedDateId(dateId);
    setTimeout(() => setIsRefreshing(false), 200);
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

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopFrame]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
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
              Bấm để chọn rạp thực tế tại 63 Tỉnh Thành...
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

        {/* Horizontal Date Selector - Dynamically starts from TODAY */}
        <View style={styles.dateSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
            {dynamicDates.map(date => {
              const isSelected = date.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={date.id}
                  style={[styles.dateTab, isSelected && styles.dateTabActive]}
                  onPress={() => handleSelectDate(date.id)}
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
              Lịch chiếu tại <Text style={{ fontWeight: '800' }}>{currentBranch.name}</Text> ngày <Text style={{ fontWeight: '800', color: '#DC2626' }}>{selectedDateObj.label}</Text>
            </Text>
          </View>

          {/* Refreshing Overlay Indicator */}
          {isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Đang cập nhật lịch chiếu mới nhất...</Text>
            </View>
          ) : (
            /* Dynamic Movies & Showtimes Grid List */
            activeMovies.map(movie => (
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
            ))
          )}
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
                  Chọn Rạp Chi Tiết 63 Tỉnh Thành ({displayCinemas.length} rạp)
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
                  placeholder="Gõ tên rạp hoặc tỉnh thành (vd: Yên Bái, Điện Biên, Lào Cai...)"
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text && selectedBrandId !== 'all') {
                      setSelectedBrandId('all'); // Reset brand filter to show search results across all brands
                    }
                  }}
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
                          setSelectedBrandId('all');
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
                  {searchQuery
                    ? `Kết quả tìm kiếm rạp cho "${searchQuery}" (${displayCinemas.length} rạp)`
                    : selectedCityFilter !== 'Tất cả tỉnh thành'
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
                      Không tìm thấy rạp nào cho "{searchQuery || selectedCityFilter}"
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

  loadingContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, fontWeight: '600', color: '#DC2626' },

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
