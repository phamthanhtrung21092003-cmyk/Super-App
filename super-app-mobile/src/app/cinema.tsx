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
  // ==================== HÀ NỘI ====================
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

  // ==================== HẢI PHÒNG ====================
  {
    id: 'cgv-vincom-hai-phong',
    brand: 'CGV',
    name: 'CGV Vincom Imperial Hải Phòng',
    area: 'Hồng Bàng',
    city: 'Hải Phòng',
    address: 'Tầng 5, Vincom Imperial Plaza, KĐT Vinhomes Imperia, Thượng Lý, Q. Hồng Bàng, Hải Phòng',
    phone: '1900 6017',
    hours: '08:30 - 23:30',
    facilities: ['🍿 Popcorn Combo', '🅿️ Hầm xe Vincom', '🎟️ Vé QR code', '🎬 Phòng 2D/3D'],
    distance: '2.6 km',
    moviesCount: 6,
  },

  // ==================== LÂM ĐỒNG (ĐÀ LẠT) ====================
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
];

// Robust Search Function matching name, area, city, address, brand
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

  // Clean city name label for fallback generator
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
function getMoviesForBranchAndDate(branch: CinemaBranch, dateId: string): MovieItem[] {
  const isCGV = branch.brand === 'CGV';
  const isLotte = branch.brand === 'Lotte';
  const isBeta = branch.brand === 'Beta';
  const isCinestar = branch.brand === 'Cinestar';

  // Base price dynamically computed per date & brand
  let basePrice = 50000;
  if (dateId === '2') basePrice = 45000; // Happy Tuesday
  if (dateId === '5' || dateId === '6') basePrice = 70000; // Weekend

  if (isCGV) basePrice += 10000;
  if (isBeta || isCinestar) basePrice = Math.max(45000, basePrice - 5000);

  // Different time slot presets per Date ID
  const timePresets: Record<string, { t1: string[]; t2: string[]; avail1: boolean[]; avail2: boolean[] }> = {
    '1': {
      // 27/07 Thứ 2
      t1: ['08:30', '11:00', '14:15', '17:00', '18:30', '20:30', '21:45'],
      t2: ['10:00', '13:30', '16:00', '19:00', '20:45', '22:15'],
      avail1: [false, false, true, true, true, true, true],
      avail2: [false, true, true, true, true, true]
    },
    '2': {
      // 28/07 Thứ 3 (Happy Day)
      t1: ['09:15', '11:45', '14:00', '16:30', '18:15', '19:45', '21:15'],
      t2: ['10:30', '13:00', '15:30', '17:45', '20:00', '22:00'],
      avail1: [true, true, true, true, true, true, true],
      avail2: [true, true, true, true, true, true]
    },
    '3': {
      // 29/07 Thứ 4
      t1: ['10:00', '12:30', '15:15', '17:45', '19:20', '21:00'],
      t2: ['09:30', '11:50', '14:20', '16:45', '18:50', '21:30'],
      avail1: [true, true, true, true, true, true],
      avail2: [true, true, true, true, true, true]
    },
    '4': {
      // 30/07 Thứ 5
      t1: ['08:45', '11:15', '13:50', '16:30', '18:45', '20:45', '22:15'],
      t2: ['10:15', '12:45', '15:00', '17:30', '19:40', '21:50'],
      avail1: [true, true, true, true, true, true, true],
      avail2: [true, true, true, true, true, true]
    },
    '5': {
      // 31/07 Thứ 6 (Đêm Cuối Tuần)
      t1: ['13:15', '15:45', '17:30', '19:00', '20:15', '21:30', '22:45', '23:30'],
      t2: ['14:00', '16:15', '18:30', '20:00', '21:15', '22:30', '23:55'],
      avail1: [true, true, true, true, true, true, true, true],
      avail2: [true, true, true, true, true, true, true]
    },
    '6': {
      // 01/08 Thứ 7 (Sáng Đến Khuya)
      t1: ['08:00', '09:30', '11:00', '13:30', '15:00', '17:00', '18:30', '20:00', '21:30', '23:15'],
      t2: ['08:45', '10:15', '12:00', '14:15', '16:00', '17:45', '19:15', '20:45', '22:15'],
      avail1: [true, true, true, true, true, true, true, true, true, true],
      avail2: [true, true, true, true, true, true, true, true, true]
    }
  };

  const preset = timePresets[dateId] || timePresets['1'];

  // Select subset of movies based on branch ID hash
  const branchHash = branch.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
    const fmt1Times = preset.t1.map((time, tIdx) => {
      const price = fmt1Name.includes('IMAX') ? basePrice + 40000 : basePrice;
      return {
        time,
        price,
        priceText: `${Math.round(price / 1000)}K`,
        available: preset.avail1[tIdx % preset.avail1.length]
      };
    });
    formats.push({ format: fmt1Name, times: fmt1Times });

    // Format 2: 2D Phụ Đề Việt or 4DX
    const fmt2Name = isCGV && mIdx === 1 ? '4DX Lồng Tiếng' : '2D Phụ Đề Việt';
    const fmt2Times = preset.t2.map((time, tIdx) => {
      const price = fmt2Name.includes('4DX') ? basePrice + 35000 : basePrice + 5000;
      return {
        time,
        price,
        priceText: `${Math.round(price / 1000)}K`,
        available: preset.avail2[tIdx % preset.avail2.length]
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
  const [selectedDateId, setSelectedDateId] = useState('1');
  const [selectedBrandId, setSelectedBrandId] = useState('all');

  // Selected Cinema Branch & Selected City Filters
  const [currentBranch, setCurrentBranch] = useState<CinemaBranch>(BASE_CINEMA_BRANCHES[0]); // NCC Láng Hạ
  const [selectedCityFilter, setSelectedCityFilter] = useState('TP. Hà Nội');

  // Loading state when user switches branch or date
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cinema Search Modal & Query
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDateObj = DATES.find(d => d.id === selectedDateId) || DATES[0];

  // Dynamic Movie List per selected Branch & Date
  const activeMovies = useMemo(() => {
    return getMoviesForBranchAndDate(currentBranch, selectedDateId);
  }, [currentBranch, selectedDateId]);

  // Get cinemas based on current city filter or search query
  let displayCinemas = getCinemasForCity(searchQuery || selectedCityFilter);

  // Apply brand filter if selected
  if (selectedBrandId !== 'all') {
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
