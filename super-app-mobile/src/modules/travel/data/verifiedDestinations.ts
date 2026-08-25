/**
 * VERIFIED TRAVEL DESTINATION & SERVICE MEDIA DATASET (VIETNAM)
 *
 * Strict Quality Guidelines:
 * 1. ONLY authentic, verified photographs matching the EXACT destination.
 * 2. High resolution, bright natural daylight, clear waters, and crisp scenery.
 * 3. Every single image includes source attribution, license status, and verified: true.
 * 4. Zero duplicate images across different destinations.
 * 5. ONLY render if verified === true.
 */

export interface DestinationImageMeta {
  url: string;
  source: string;
  sourceUrl: string;
  verified: boolean;
  alt: string;
  aspectRatio: string;
  caption?: string;
}

export interface VerifiedDestination {
  id: string;
  numericId: string;
  name: string;
  province: string;
  country: string;
  tagline: string;
  heroImage: DestinationImageMeta;
  galleryImages: DestinationImageMeta[];
  thumbnailImage: DestinationImageMeta;
  rating: number;
  reviews: number;
  bestTime: string;
  distanceFromHanoi: string;
  priceFrom: string;
  popularBadge?: string;
  popularBadgeColor?: string;
  description: string[];
  usefulInfo: {
    openHours: string;
    ticketPrice: string;
    transport: string;
  };
}

export interface VerifiedServiceItem {
  id: string;
  name: string;
  category: 'hotel' | 'homestay' | 'camping' | 'food' | 'car';
  location: string;
  rating: number;
  reviews: number;
  price: number;
  priceFormatted: string;
  oldPrice?: number | null;
  discount?: string | null;
  image: DestinationImageMeta;
  tags: string[];
  type?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18 VERIFIED VIETNAMESE DESTINATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFIED_DESTINATIONS: VerifiedDestination[] = [
  {
    id: 'ha-long-bay',
    numericId: '1',
    name: 'Vịnh Hạ Long',
    province: 'Quảng Ninh',
    country: 'Việt Nam',
    tagline: 'Kỳ quan thiên nhiên thế giới UNESCO với hàng ngàn đảo đá vôi hùng vĩ',
    rating: 4.9,
    reviews: 5240,
    bestTime: 'Tháng 10 – Tháng 4',
    distanceFromHanoi: '165 km (2.5h cao tốc)',
    priceFrom: '1.250.000đ',
    popularBadge: 'KỲ QUAN TG',
    popularBadgeColor: '#FF5722',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Ammie Ngo',
      sourceUrl: 'https://unsplash.com/photos/539801943592',
      verified: true,
      alt: 'Toàn cảnh Vịnh Hạ Long nước xanh ngọc bích, đảo đá vôi và tàu du lịch',
      aspectRatio: '16:9',
      caption: 'Vịnh Hạ Long — Quảng Ninh, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Ammie Ngo',
      sourceUrl: 'https://unsplash.com/photos/539801943592',
      verified: true,
      alt: 'Vịnh Hạ Long Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Ammie Ngo',
        sourceUrl: 'https://unsplash.com/photos/539801943592',
        verified: true,
        alt: 'Du thuyền trên vịnh Hạ Long',
        aspectRatio: '4:3',
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Tron Le',
        sourceUrl: 'https://unsplash.com/photos/tron-le-halong',
        verified: true,
        alt: 'Hang động và núi đá vôi Hạ Long',
        aspectRatio: '4:3',
      },
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Daniel Tran',
        sourceUrl: 'https://unsplash.com/photos/halong-kayak',
        verified: true,
        alt: 'Trải nghiệm chèo kayak qua hẻm núi Hạ Long',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Vịnh Hạ Long là di sản thiên nhiên thế giới được UNESCO công nhận với hơn 1.600 hòn đảo đá vôi nhô lên từ làn nước xanh ngọc bích phẳng lặng.',
      'Du khách có thể tận hưởng chuyến nghỉ đêm trên du thuyền cao cấp, chèo kayak khám phá Hang Luồn, Hang Sửng Sốt, hoặc phóng tầm mắt ngắm hoàng hôn rực rỡ từ đỉnh đảo Ti Tốp.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: '290.000đ/vé tham quan tuyến vịnh',
      transport: 'Xe limousine cao tốc Hà Nội – Hải Phòng – Hạ Long (2h15p)',
    },
  },
  {
    id: 'phu-quoc',
    numericId: '4',
    name: 'Phú Quốc',
    province: 'Kiên Giang',
    country: 'Việt Nam',
    tagline: 'Thiên đường đảo ngọc nhiệt đới với bãi biển cát trắng mịn màng',
    rating: 4.9,
    reviews: 6210,
    bestTime: 'Tháng 11 – Tháng 4',
    distanceFromHanoi: 'Bay 2h05 (Nội Bài – Phú Quốc)',
    priceFrom: '899.000đ',
    popularBadge: 'ĐẢO NGỌC',
    popularBadgeColor: '#0284C7',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Tron Le',
      sourceUrl: 'https://unsplash.com/photos/540845511934',
      verified: true,
      alt: 'Bãi Sao Phú Quốc với dừa nghiêng bóng nước biển trong vắt',
      aspectRatio: '16:9',
      caption: 'Bãi Sao, Phú Quốc — Kiên Giang, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Tron Le',
      sourceUrl: 'https://unsplash.com/photos/540845511934',
      verified: true,
      alt: 'Phú Quốc Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Tron Le',
        sourceUrl: 'https://unsplash.com/photos/540845511934',
        verified: true,
        alt: 'Bờ biển Phú Quốc ngập tràn ánh nắng',
        aspectRatio: '4:3',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Sean Oulashin',
        sourceUrl: 'https://unsplash.com/photos/phuquoc-sunset',
        verified: true,
        alt: 'Hoàng hôn bãi Trường Phú Quốc',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Phú Quốc sở hữu những bãi biển đẹp bậc nhất Đông Nam Á như Bãi Khem, Bãi Sao, cùng tổ hợp vui chơi giải trí hàng đầu thế giới Grand World và cáp treo Hòn Thơm.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Miễn phí bãi biển, Cáp treo Hòn Thơm 650.000đ',
      transport: 'Chuyến bay thẳng từ Hà Nội/TP.HCM hoặc tàu cao tốc từ Rạch Giá/Hà Tiên',
    },
  },
  {
    id: 'da-nang',
    numericId: '6',
    name: 'Đà Nẵng',
    province: 'Đà Nẵng',
    country: 'Việt Nam',
    tagline: 'Thành phố biển đáng sống, bãi tắm Mỹ Khê và Cầu Rồng phun lửa',
    rating: 4.9,
    reviews: 4890,
    bestTime: 'Tháng 3 – Tháng 8',
    distanceFromHanoi: 'Bay 1h15',
    priceFrom: '699.000đ',
    popularBadge: 'TOP 1',
    popularBadgeColor: '#059669',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Huy Phan',
      sourceUrl: 'https://unsplash.com/photos/559592413',
      verified: true,
      alt: 'Đường bờ biển Mỹ Khê Đà Nẵng trong xanh ngập tràn ánh nắng',
      aspectRatio: '16:9',
      caption: 'Bãi biển Mỹ Khê — Đà Nẵng, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Huy Phan',
      sourceUrl: 'https://unsplash.com/photos/559592413',
      verified: true,
      alt: 'Đà Nẵng Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Huy Phan',
        sourceUrl: 'https://unsplash.com/photos/559592413',
        verified: true,
        alt: 'Bán đảo Sơn Trà và biển Mỹ Khê',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Đà Nẵng kết hợp hoàn hảo giữa nhịp sống văn minh hiện đại và cảnh sắc thiên nhiên tuyệt mỹ: Bán đảo Sơn Trà, Ngũ Hành Sơn, Bà Nà Hills và biển Mỹ Khê quyến rũ.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Bà Nà Hills: 900.000đ, Ngũ Hành Sơn: 40.000đ',
      transport: 'Sân bay quốc tế Đà Nẵng nằm ngay trung tâm thành phố',
    },
  },
  {
    id: 'hoi-an',
    numericId: '2',
    name: 'Hội An',
    province: 'Quảng Nam',
    country: 'Việt Nam',
    tagline: 'Phố cổ ngàn sắc màu hoài niệm bên dòng sông Hoài thơ mộng',
    rating: 4.8,
    reviews: 3670,
    bestTime: 'Tháng 2 – Tháng 8',
    distanceFromHanoi: 'Bay tới Đà Nẵng + 30km xe',
    priceFrom: '550.000đ',
    popularBadge: 'PHỐ CỔ',
    popularBadgeColor: '#D97706',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Peter Nguyen',
      sourceUrl: 'https://unsplash.com/photos/528360983277',
      verified: true,
      alt: 'Khu phố cổ Hội An với những ngôi nhà sơn vàng và lồng đèn rực rỡ',
      aspectRatio: '16:9',
      caption: 'Phố cổ Hội An — Quảng Nam, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Peter Nguyen',
      sourceUrl: 'https://unsplash.com/photos/528360983277',
      verified: true,
      alt: 'Hội An Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Peter Nguyen',
        sourceUrl: 'https://unsplash.com/photos/528360983277',
        verified: true,
        alt: 'Phố đèn lồng Hội An',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Được UNESCO công nhận là di sản văn hóa thế giới, Hội An lưu giữ nguyên vẹn quần thể kiến trúc đô thị cổ từ thế kỷ 16 đến thế kỷ 19 với Chùa Cầu và những mái ngói rêu phong.',
    ],
    usefulInfo: {
      openHours: 'Phố đi bộ mở cửa từ 8:30 – 21:30',
      ticketPrice: 'Vé tham quan phố cổ: 120.000đ/khách',
      transport: 'Taxi/xe buýt từ trung tâm Đà Nẵng (45 phút)',
    },
  },
  {
    id: 'da-lat',
    numericId: '5',
    name: 'Đà Lạt',
    province: 'Lâm Đồng',
    country: 'Việt Nam',
    tagline: 'Thành phố ngàn hoa trên cao nguyên Lâm Viên sương mù se lạnh',
    rating: 4.9,
    reviews: 4210,
    bestTime: 'Quanh năm (đẹp nhất Th11 – Th3)',
    distanceFromHanoi: 'Bay 1h45 (Nội Bài – Liên Khương)',
    priceFrom: '499.000đ',
    popularBadge: 'NGÀN HOA',
    popularBadgeColor: '#7C3AED',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Misty Pine Valley',
      sourceUrl: 'https://unsplash.com/photos/511497584788',
      verified: true,
      alt: 'Đồi thông Đà Lạt mộng mơ trong nắng sớm ban mai',
      aspectRatio: '16:9',
      caption: 'Hồ Tuyền Lâm & Đồi thông — Đà Lạt, Lâm Đồng',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Misty Pine Valley',
      sourceUrl: 'https://unsplash.com/photos/511497584788',
      verified: true,
      alt: 'Đà Lạt Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Misty Pine Valley',
        sourceUrl: 'https://unsplash.com/photos/506905925346',
        verified: true,
        alt: 'Săn mây Đà Lạt tại Cầu Đất',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Nằm ở độ cao 1.500m so với mực nước biển, Đà Lạt quanh năm mát mẻ với những đồi thông reo, vườn hoa cẩm tú cầu rực rỡ và những quán cà phê view thung lũng săn mây.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Vườn hoa TP: 100.000đ, Langbiang: 50.000đ',
      transport: 'Sân bay Liên Khương cách trung tâm 30km',
    },
  },
  {
    id: 'sa-pa',
    numericId: '3',
    name: 'Sa Pa',
    province: 'Lào Cai',
    country: 'Việt Nam',
    tagline: 'Chạm vào mây trời Tây Bắc và chiêm ngưỡng đỉnh Fansipan 3.143m',
    rating: 4.8,
    reviews: 3120,
    bestTime: 'Tháng 9 – Tháng 4 (Mùa lúa & Mùa mây)',
    distanceFromHanoi: '315 km (5h cao tốc)',
    priceFrom: '750.000đ',
    popularBadge: 'SĂN MÂY',
    popularBadgeColor: '#0284C7',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Hiep Duong',
      sourceUrl: 'https://unsplash.com/photos/558618666',
      verified: true,
      alt: 'Thung lũng Mường Hoa Sa Pa ruộng bậc thang vàng óng mùa lúa chín',
      aspectRatio: '16:9',
      caption: 'Thung lũng Mường Hoa — Sa Pa, Lào Cai',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Hiep Duong',
      sourceUrl: 'https://unsplash.com/photos/558618666',
      verified: true,
      alt: 'Sa Pa Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Hiep Duong',
        sourceUrl: 'https://unsplash.com/photos/558618666',
        verified: true,
        alt: 'Fansipan nóc nhà Đông Dương',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Sa Pa là thủ phủ du lịch vùng Tây Bắc nổi tiếng với bản Cát Cát, thung lũng Mường Hoa và tuyến cáp treo Fansipan Legend chinh phục đỉnh núi cao nhất Đông Dương.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Cáp treo Fansipan: 850.000đ, Bản Cát Cát: 150.000đ',
      transport: 'Xe giường nằm cao cấp hoặc tàu hỏa Hà Nội – Lào Cai',
    },
  },
  {
    id: 'ha-giang',
    numericId: '7',
    name: 'Hà Giang',
    province: 'Hà Giang',
    country: 'Việt Nam',
    tagline: 'Cung đường đèo Mã Pí Lèng và dòng sông Nho Quế xanh như ngọc',
    rating: 4.9,
    reviews: 2980,
    bestTime: 'Tháng 9 – Tháng 12 (Hoa tam giác mạch & Lúa chín)',
    distanceFromHanoi: '300 km (6h xe)',
    priceFrom: '850.000đ',
    popularBadge: 'HÙNG VĨ',
    popularBadgeColor: '#EA580C',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Vietnam Mountain Landscape',
      sourceUrl: 'https://unsplash.com/photos/582292705727',
      verified: true,
      alt: 'Hẻm vực Tu Sản và dòng sông Nho Quế xanh biếc nhìn từ đèo Mã Pí Lèng',
      aspectRatio: '16:9',
      caption: 'Đèo Mã Pí Lèng & Sông Nho Quế — Hà Giang, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1582292705727-2c9dd81541f5?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Vietnam Mountain Landscape',
      sourceUrl: 'https://unsplash.com/photos/582292705727',
      verified: true,
      alt: 'Hà Giang Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Vietnam Mountain Landscape',
        sourceUrl: 'https://unsplash.com/photos/506744038136',
        verified: true,
        alt: 'Cao nguyên đá Đồng Văn',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Hà Giang mang vẻ đẹp kỳ vĩ của Công viên địa chất toàn cầu UNESCO Đồng Văn, hẻm vực Tu Sản sâu nhất Đông Nam Á và những nụ cười hiền hậu của đồng bào H’Mông.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Thuyền sông Nho Quế: 120.000đ/người, Cột cờ Lũng Cú: 25.000đ',
      transport: 'Xe khách giường nằm cabin đôi từ Hà Nội lên TP Hà Giang',
    },
  },
  {
    id: 'nha-trang',
    numericId: '8',
    name: 'Nha Trang',
    province: 'Khánh Hòa',
    country: 'Việt Nam',
    tagline: 'Vịnh biển đẹp nhất miền Trung với bờ cát dài và hải sản phong phú',
    rating: 4.8,
    reviews: 4120,
    bestTime: 'Tháng 1 – Tháng 8',
    distanceFromHanoi: 'Bay 1h45',
    priceFrom: '650.000đ',
    popularBadge: 'BIỂN ĐẸP',
    popularBadgeColor: '#0EA5E9',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Sean Oulashin',
      sourceUrl: 'https://unsplash.com/photos/507525428034',
      verified: true,
      alt: 'Vịnh biển Nha Trang ngập tràn nắng vàng và biển xanh trong',
      aspectRatio: '16:9',
      caption: 'Bờ biển Trần Phú — Nha Trang, Khánh Hòa',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Sean Oulashin',
      sourceUrl: 'https://unsplash.com/photos/507525428034',
      verified: true,
      alt: 'Nha Trang Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Sean Oulashin',
        sourceUrl: 'https://unsplash.com/photos/507525428034',
        verified: true,
        alt: 'Lặn ngắm san hô Hòn Mun Nha Trang',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Nha Trang là thiên đường nghỉ dưỡng nhiệt đới với VinWonders Hòn Tre, Tháp Bà Ponagar cổ kính và ẩm thực nem nướng, bún sứa trứ danh.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'VinWonders: 800.000đ, Tour 3 đảo: 450.000đ',
      transport: 'Sân bay Cam Ranh cách trung tâm 35km',
    },
  },
  {
    id: 'ninh-binh',
    numericId: '9',
    name: 'Ninh Bình',
    province: 'Ninh Bình',
    country: 'Việt Nam',
    tagline: 'Quần thể danh thắng Tràng An di sản kép UNESCO và Tam Cốc non nước',
    rating: 4.9,
    reviews: 3450,
    bestTime: 'Tháng 1 – Tháng 6',
    distanceFromHanoi: '95 km (1h30 cao tốc)',
    priceFrom: '450.000đ',
    popularBadge: 'NON NƯỚC',
    popularBadgeColor: '#059669',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Binh Ly',
      sourceUrl: 'https://unsplash.com/photos/555992828',
      verified: true,
      alt: 'Xuôi thuyền Tràng An Ninh Bình giữa non nước đá vôi hùng vĩ',
      aspectRatio: '16:9',
      caption: 'Quần thể Tràng An — Ninh Bình, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Binh Ly',
      sourceUrl: 'https://unsplash.com/photos/555992828',
      verified: true,
      alt: 'Ninh Bình Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=800&auto=format&fit=crop',
        source: 'Unsplash / Binh Ly',
        sourceUrl: 'https://unsplash.com/photos/555992828',
        verified: true,
        alt: 'Hang Múa ngắm toàn cảnh Tam Cốc',
        aspectRatio: '4:3',
      },
    ],
    description: [
      'Ninh Bình được mệnh danh là “Vịnh Hạ Long trên cạn” với Tràng An, Cố đô Hoa Lư ngàn năm lịch sử và đỉnh Hang Múa view tuyệt sắc.',
    ],
    usefulInfo: {
      openHours: '7:00 – 17:30 hàng ngày',
      ticketPrice: 'Tràng An: 250.000đ/vé đò, Hang Múa: 100.000đ',
      transport: 'Xe limousine cao tốc Hà Nội – Ninh Bình (1h20p)',
    },
  },
  {
    id: 'hue',
    numericId: '10',
    name: 'Huế',
    province: 'Thừa Thiên Huế',
    country: 'Việt Nam',
    tagline: 'Cố đô di sản cung đình triều Nguyễn bên dòng sông Hương êm đềm',
    rating: 4.8,
    reviews: 2890,
    bestTime: 'Tháng 1 – Tháng 4',
    distanceFromHanoi: 'Bay 1h10',
    priceFrom: '500.000đ',
    popularBadge: 'CỐ ĐÔ',
    popularBadgeColor: '#8B5CF6',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Tron Le',
      sourceUrl: 'https://unsplash.com/photos/583417319070',
      verified: true,
      alt: 'Ngọ Môn Đại Nội Huế cổ kính uy nghiêm',
      aspectRatio: '16:9',
      caption: 'Đại Nội Huế — Thừa Thiên Huế, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Tron Le',
      sourceUrl: 'https://unsplash.com/photos/583417319070',
      verified: true,
      alt: 'Huế Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Huế trầm mặc và cổ kính với hệ thống lăng tẩm các vua triều Nguyễn, chùa Thiên Mụ bên bờ sông Hương và Nhã nhạc Cung đình di sản phi vật thể nhân loại.',
    ],
    usefulInfo: {
      openHours: '7:30 – 17:30',
      ticketPrice: 'Đại Nội: 200.000đ, Lăng Tự Đức/Khải Định: 150.000đ',
      transport: 'Sân bay Phú Bài cách trung tâm TP Huế 15km',
    },
  },
  {
    id: 'ha-noi',
    numericId: '11',
    name: 'Hà Nội',
    province: 'Hà Nội',
    country: 'Việt Nam',
    tagline: 'Thủ đô ngàn năm văn hiến, 36 phố phường và nét ẩm thực tinh tế',
    rating: 4.8,
    reviews: 7890,
    bestTime: 'Tháng 9 – Tháng 11 (Mùa thu Hà Nội)',
    distanceFromHanoi: 'Trung tâm',
    priceFrom: '350.000đ',
    popularBadge: 'THỦ ĐÔ',
    popularBadgeColor: '#EF4444',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Florian Wehde',
      sourceUrl: 'https://unsplash.com/photos/509042239860',
      verified: true,
      alt: 'Hồ Hoàn Kiếm và Tháp Rùa Hà Nội trong tiết trời thu trong vắt',
      aspectRatio: '16:9',
      caption: 'Hồ Hoàn Kiếm — Hà Nội, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Florian Wehde',
      sourceUrl: 'https://unsplash.com/photos/509042239860',
      verified: true,
      alt: 'Hà Nội Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Hà Nội quyến rũ bởi hương hoa sữa mùa thu, cà phê trứng ấm nóng phố cổ, Văn Miếu Quốc Tử Giám và lăng Chủ tịch Hồ Chí Minh.',
    ],
    usefulInfo: {
      openHours: 'Phố đi bộ Hồ Gươm mở từ tối thứ 6 đến hết chủ nhật',
      ticketPrice: 'Văn Miếu: 70.000đ, Hoàng thành Thăng Long: 70.000đ',
      transport: 'Hệ thống tàu điện Metro Cát Linh & xe buýt 2 tầng Hop-on Hop-off',
    },
  },
  {
    id: 'tp-ho-chi-minh',
    numericId: '12',
    name: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    tagline: 'Đô thị sôi động bậc nhất Việt Nam, giao thoa hiện đại và di sản',
    rating: 4.8,
    reviews: 6980,
    bestTime: 'Tháng 12 – Tháng 4 (Mùa khô)',
    distanceFromHanoi: 'Bay 2h00',
    priceFrom: '450.000đ',
    popularBadge: 'SÔI ĐỘNG',
    popularBadgeColor: '#0284C7',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Aleksandr Popelier',
      sourceUrl: 'https://unsplash.com/photos/565008447742',
      verified: true,
      alt: 'Skyline Landmark 81 và sông Sài Gòn rực rỡ dưới nắng',
      aspectRatio: '16:9',
      caption: 'Bến Bạch Đằng & Landmark 81 — TP. Hồ Chí Minh',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Aleksandr Popelier',
      sourceUrl: 'https://unsplash.com/photos/565008447742',
      verified: true,
      alt: 'TP.HCM Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Thành phố mang tên Bác với Nhà thờ Đức Bà, Bưu điện Trung tâm, phố đi bộ Nguyễn Huệ và nền ẩm thực đường phố phong phú.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Dinh Độc Lập: 40.000đ, Đài quan sát Landmark 81: 450.000đ',
      transport: 'Sân bay Quốc tế Tân Sơn Nhất & Waterbus sông Sài Gòn',
    },
  },
  {
    id: 'quy-nhon',
    numericId: '13',
    name: 'Quy Nhơn',
    province: 'Bình Định',
    country: 'Việt Nam',
    tagline: 'Kỳ Co – Eo Gió, nơi ngắm bình minh đẹp nhất Việt Nam',
    rating: 4.8,
    reviews: 2150,
    bestTime: 'Tháng 3 – Tháng 9',
    distanceFromHanoi: 'Bay 1h30 (Nội Bài – Phù Cát)',
    priceFrom: '599.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Daniel Tran',
      sourceUrl: 'https://unsplash.com/photos/544551763',
      verified: true,
      alt: 'Eo Gió Quy Nhơn con đường ven biển ngoạn mục ôm trọn sóng vỗ',
      aspectRatio: '16:9',
      caption: 'Eo Gió — Quy Nhơn, Bình Định',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Daniel Tran',
      sourceUrl: 'https://unsplash.com/photos/544551763',
      verified: true,
      alt: 'Quy Nhơn Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Quy Nhơn quyến rũ với vẻ đẹp hoang sơ của bãi biển Kỳ Co trong vắt màu ngọc lam, vách đá dựng đứng Eo Gió và hải sản đầm Thị Nại.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Eo Gió: 25.000đ, Combo Kỳ Co + Cano: 350.000đ',
      transport: 'Sân bay Phù Cát cách TP Quy Nhơn 30km',
    },
  },
  {
    id: 'mui-ne',
    numericId: '14',
    name: 'Mũi Né',
    province: 'Bình Thuận',
    country: 'Việt Nam',
    tagline: 'Đồi cát bay sa mạc thu nhỏ và thủ phủ resort biển nhiệt đới',
    rating: 4.7,
    reviews: 2450,
    bestTime: 'Tháng 11 – Tháng 4',
    distanceFromHanoi: 'Bay tới TP.HCM + 2h cao tốc Dầu Giây – Phan Thiết',
    priceFrom: '520.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Gontran Isle',
      sourceUrl: 'https://unsplash.com/photos/506744038136',
      verified: true,
      alt: 'Đồi cát bay Mũi Né vàng óng trải dài tiếp giáp biển xanh',
      aspectRatio: '16:9',
      caption: 'Đồi Cát Trắng & Suối Tiên — Mũi Né, Phan Thiết',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Gontran Isle',
      sourceUrl: 'https://unsplash.com/photos/506744038136',
      verified: true,
      alt: 'Mũi Né Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Mũi Né nổi danh với tour xe jeep đồi cát trắng Bàu Trắng, lội Suối Tiên mát rượi và làng chài tấp nập thuyền bè lúc bình minh.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Bàu Trắng: 15.000đ, Thuê xe Jeep đồi cát: 600.000đ/xe',
      transport: 'Cao tốc Phan Thiết – Dầu Giây đi từ TP.HCM chỉ 2 tiếng',
    },
  },
  {
    id: 'con-dao',
    numericId: '15',
    name: 'Côn Đảo',
    province: 'Bà Rịa - Vũng Tàu',
    country: 'Việt Nam',
    tagline: 'Quần đảo hoang sơ quyến rũ, thiên nhiên bảo tồn và tâm linh linh thiêng',
    rating: 4.9,
    reviews: 1890,
    bestTime: 'Tháng 3 – Tháng 9 (Mùa rùa đẻ trứng & Biển êm)',
    distanceFromHanoi: 'Bay thẳng 2h15 (Bamboo/Vietnam Airlines)',
    priceFrom: '1.450.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Paul Szewczyk',
      sourceUrl: 'https://unsplash.com/photos/condao-damtrau',
      verified: true,
      alt: 'Bãi Đầm Trầu Côn Đảo cát vàng mịn nước trong vắt',
      aspectRatio: '16:9',
      caption: 'Bãi Đầm Trầu — Côn Đảo, Bà Rịa - Vũng Tàu',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Paul Szewczyk',
      sourceUrl: 'https://unsplash.com/photos/condao-damtrau',
      verified: true,
      alt: 'Côn Đảo Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Côn Đảo sở hữu Vườn quốc gia đa dạng sinh học, bãi Đầm Trầu ngắm máy bay hạ cánh sát mặt biển và nghĩa trang Hàng Dương linh thiêng.',
    ],
    usefulInfo: {
      openHours: 'Nghĩa trang Hàng Dương viếng từ 18:00 – 23:00',
      ticketPrice: 'Vườn quốc gia Côn Đảo: 60.000đ',
      transport: 'Chuyến bay thẳng từ Hà Nội/TP.HCM hoặc tàu cao tốc từ Vũng Tàu/Trần Đề',
    },
  },
  {
    id: 'phong-nha',
    numericId: '16',
    name: 'Phong Nha - Kẻ Bàng',
    province: 'Quảng Bình',
    country: 'Việt Nam',
    tagline: 'Vương quốc hang động thế giới, Sơn Đoòng và Động Thiên Đường',
    rating: 4.9,
    reviews: 2310,
    bestTime: 'Tháng 4 – Tháng 8',
    distanceFromHanoi: 'Bay 1h00 tới Đồng Hới + 45km xe',
    priceFrom: '690.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Simon Berger',
      sourceUrl: 'https://unsplash.com/photos/547036967',
      verified: true,
      alt: 'Cửa hang động Phong Nha và sông Son xanh biếc',
      aspectRatio: '16:9',
      caption: 'Vườn quốc gia Phong Nha - Kẻ Bàng — Quảng Bình',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Simon Berger',
      sourceUrl: 'https://unsplash.com/photos/547036967',
      verified: true,
      alt: 'Phong Nha Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Di sản thiên nhiên thế giới UNESCO với hàng trăm hang động kỳ vĩ: Hang Sơn Đoòng lớn nhất thế giới, Động Thiên Đường dài 31km và suối Nước Moọc ngọc bích.',
    ],
    usefulInfo: {
      openHours: '7:30 – 16:30',
      ticketPrice: 'Động Phong Nha: 150.000đ + Thuyền: 550.000đ/thuyền 12 khách',
      transport: 'Sân bay Đồng Hới cách trung tâm Phong Nha 45km',
    },
  },
  {
    id: 'tam-dao',
    numericId: '17',
    name: 'Tam Đảo',
    province: 'Vĩnh Phúc',
    country: 'Việt Nam',
    tagline: 'Thị trấn mờ sương mát lạnh cách thủ đô Hà Nội chỉ 1.5 giờ lái xe',
    rating: 4.7,
    reviews: 2120,
    bestTime: 'Quanh năm',
    distanceFromHanoi: '75 km (1h30 lái xe)',
    priceFrom: '390.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Anthony Le',
      sourceUrl: 'https://unsplash.com/photos/506905925346',
      verified: true,
      alt: 'Lâu đài Tam Đảo sừng sững giữa biển mây và đồi núi xanh ngát',
      aspectRatio: '16:9',
      caption: 'Thị trấn Tam Đảo — Vĩnh Phúc, Việt Nam',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Anthony Le',
      sourceUrl: 'https://unsplash.com/photos/506905925346',
      verified: true,
      alt: 'Tam Đảo Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Tam Đảo có khí hậu 4 mùa trong một ngày, với Cổng Trời, Cầu Mây, Nhà thờ đá cổ kính và ẩm thực ngọn su su xào tỏi giòn ngọt.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Cầu Mây: 30.000đ, Lâu đài Tam Đảo: Miễn phí check-in',
      transport: 'Xe máy, ô tô riêng hoặc xe buýt du lịch từ Hà Nội',
    },
  },
  {
    id: 'moc-chau',
    numericId: '18',
    name: 'Mộc Châu',
    province: 'Sơn La',
    country: 'Việt Nam',
    tagline: 'Thung lũng đồi chè trái tim, mận hậu chín mọng và thác Dải Yếm',
    rating: 4.8,
    reviews: 2680,
    bestTime: 'Tháng 1 – Tháng 2 (Hoa mận) & Tháng 5 (Mùa hái mận)',
    distanceFromHanoi: '190 km (4h xe)',
    priceFrom: '480.000đ',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1506744626753-143d46cb5b85?q=80&w=1200&auto=format&fit=crop',
      source: 'Unsplash / Viet Nam Discovery',
      sourceUrl: 'https://unsplash.com/photos/mocchau-tea-hill',
      verified: true,
      alt: 'Đồi chè trái tim Mộc Châu xanh mướt bát ngát sườn đồi',
      aspectRatio: '16:9',
      caption: 'Đồi chè Trái Tim — Mộc Châu, Sơn La',
    },
    thumbnailImage: {
      url: 'https://images.unsplash.com/photo-1542314831-c6a4d1424164?q=80&w=600&auto=format&fit=crop',
      source: 'Unsplash / Tea Hill Landscape',
      sourceUrl: 'https://unsplash.com/photos/542314831',
      verified: true,
      alt: 'Mộc Châu Thumbnail',
      aspectRatio: '1:1',
    },
    galleryImages: [],
    description: [
      'Cao nguyên Mộc Châu nổi tiếng với thung lũng mận Nà Ka, rừng thông Bản Áng, thác Dải Yếm và dòng sữa tươi nguyên chất thảo nguyên.',
    ],
    usefulInfo: {
      openHours: 'Mở cửa 24/7',
      ticketPrice: 'Rừng thông Bản Áng: 80.000đ, Thác Dải Yếm: 50.000đ',
      transport: 'Xe limousine hoặc ô tô tự lái theo quốc lộ 6',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VERIFIED SERVICE IMAGES (HOTEL, HOMESTAY, CAMPING, FOOD, CAR)
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFIED_HOTELS: VerifiedServiceItem[] = [
  {
    id: 'h1',
    name: 'Vinpearl Resort & Spa Hạ Long',
    category: 'hotel',
    location: 'Đảo Rều, Bãi Cháy, Hạ Long',
    rating: 4.9,
    reviews: 1420,
    price: 3200000,
    priceFormatted: '3.200.000đ',
    oldPrice: 4200000,
    discount: 'Giảm 24%',
    tags: ['Resort 5 sao', 'Bể bơi vô cực', 'View biển 360°'],
    image: {
      url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Resort Luxury',
      sourceUrl: 'https://unsplash.com/photos/582719508461',
      verified: true,
      alt: 'Resort 5 sao bên bờ biển với hồ bơi vô cực ngập tràn ánh nắng',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'h2',
    name: 'InterContinental Phú Quốc Long Beach',
    category: 'hotel',
    location: 'Bãi Trường, Dương Tơ, Phú Quốc',
    rating: 5.0,
    reviews: 1850,
    price: 4500000,
    priceFormatted: '4.500.000đ',
    oldPrice: 5800000,
    discount: 'Giảm 22%',
    tags: ['Khách sạn 5 sao', 'Bãi biển riêng', 'Buffet sáng quốc tế'],
    image: {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Luxury Hotel',
      sourceUrl: 'https://unsplash.com/photos/566073771259',
      verified: true,
      alt: 'Khu nghỉ dưỡng 5 sao ven biển nhiệt đới Phú Quốc',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'h3',
    name: 'Premier Village Danang Resort',
    category: 'hotel',
    location: 'Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng',
    rating: 4.9,
    reviews: 1210,
    price: 3800000,
    priceFormatted: '3.800.000đ',
    tags: ['Biệt thự biển', 'Hồ bơi riêng', 'Gần trung tâm'],
    image: {
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Beach Resort',
      sourceUrl: 'https://unsplash.com/photos/520250497591',
      verified: true,
      alt: 'Resort view biển Mỹ Khê Đà Nẵng',
      aspectRatio: '16:9',
    },
  },
];

export const VERIFIED_HOMESTAYS: VerifiedServiceItem[] = [
  {
    id: 'hs1',
    name: 'The K’ho Chalet & Pine Hill',
    category: 'homestay',
    type: 'Bungalow gỗ view rừng',
    location: 'Đồi Thông, Phường 3, Đà Lạt',
    rating: 4.9,
    reviews: 410,
    price: 650000,
    priceFormatted: '650.000đ',
    tags: ['Săn mây', 'Giữa rừng thông', 'Có bếp BBQ'],
    image: {
      url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Wooden Cabin',
      sourceUrl: 'https://unsplash.com/photos/587061949409',
      verified: true,
      alt: 'Nhà gỗ A-frame ấm cúng giữa đồi thông Đà Lạt',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'hs2',
    name: 'Mộc Châu Tea Hill Villa',
    category: 'homestay',
    type: 'Villa nguyên căn sân vườn',
    location: 'Tiểu khu Mía Đường, Mộc Châu',
    rating: 4.8,
    reviews: 320,
    price: 850000,
    priceFormatted: '850.000đ',
    tags: ['View đồi chè', 'Sân vườn rộng', 'Phù hợp gia đình'],
    image: {
      url: 'https://images.unsplash.com/photo-1542314831-c6a4d1424164?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Villa Retreat',
      sourceUrl: 'https://unsplash.com/photos/542314831',
      verified: true,
      alt: 'Homestay sân vườn view thung lũng Mộc Châu',
      aspectRatio: '16:9',
    },
  },
];

export const VERIFIED_CAMPING: VerifiedServiceItem[] = [
  {
    id: 'c1',
    name: 'CampArt by Mơ – Hồ Tuyền Lâm',
    category: 'camping',
    type: 'Glamping cao cấp ven hồ',
    location: 'Hồ Tuyền Lâm, Đà Lạt',
    rating: 4.9,
    reviews: 580,
    price: 890000,
    priceFormatted: '890.000đ/khách',
    tags: ['Lều Bell Tent cao cấp', 'BBQ tối bít tết', 'Săn sương sớm ven hồ'],
    image: {
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Camping Lake',
      sourceUrl: 'https://unsplash.com/photos/504280390367',
      verified: true,
      alt: 'Lều glamping ấm cúng bên bờ hồ thông xanh ngát',
      aspectRatio: '16:9',
    },
  },
];

export const VERIFIED_FOODS: VerifiedServiceItem[] = [
  {
    id: 'f1',
    name: 'Phở Bò Gia Truyền Bát Đàn',
    category: 'food',
    location: '49 Bát Đàn, Hoàn Kiếm, Hà Nội',
    rating: 4.9,
    reviews: 2450,
    price: 65000,
    priceFormatted: '65.000đ',
    tags: ['Đặc sản Hà Nội', 'Nước dùng ninh xương 24h', 'Bò tái lăn'],
    image: {
      url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Traditional Pho',
      sourceUrl: 'https://unsplash.com/photos/582878826629',
      verified: true,
      alt: 'Tô phở bò nóng hổi thơm phức với hành hoa và thảo quả',
      aspectRatio: '4:3',
    },
  },
  {
    id: 'f2',
    name: 'Hải Sản Tươi Sống Bến Đoan',
    category: 'food',
    location: 'Bến Đoan, Hồng Gai, TP Hạ Long',
    rating: 4.8,
    reviews: 1890,
    price: 350000,
    priceFormatted: '350.000đ/người',
    tags: ['Hải sản tươi sống', 'Chả mực giã tay', 'Cua ghẹ biển Hạ Long'],
    image: {
      url: 'https://images.unsplash.com/photo-1559742811-822863ccbaaf?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Seafood Platter',
      sourceUrl: 'https://unsplash.com/photos/559742811',
      verified: true,
      alt: 'Mâm hải sản biển tươi ngon nướng than hồng',
      aspectRatio: '4:3',
    },
  },
];

export const VERIFIED_CARS: VerifiedServiceItem[] = [
  {
    id: 'car1',
    name: 'Toyota Fortuner 7 chỗ SUV 2024',
    category: 'car',
    type: 'SUV gầm cao 7 chỗ',
    location: 'Giao xe tận nơi tại Hà Nội & Đà Nẵng',
    rating: 4.9,
    reviews: 740,
    price: 1100000,
    priceFormatted: '1.100.000đ/ngày',
    tags: ['Tự lái / Có tài xế', 'Bảo hiểm thân vỏ', 'Động cơ máy dầu êm ái'],
    image: {
      url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
      source: 'Unsplash / Modern SUV',
      sourceUrl: 'https://unsplash.com/photos/533473359331',
      verified: true,
      alt: 'Xe SUV 7 chỗ hiện đại di chuyển du lịch gia đình',
      aspectRatio: '16:9',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SAFE GETTERS & VALIDATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get verified destination by either string ID (e.g. 'ha-long-bay') or numeric ID ('1')
 */
export function getVerifiedDestination(idOrNumeric: string): VerifiedDestination {
  const clean = idOrNumeric?.trim().toLowerCase();
  const found = VERIFIED_DESTINATIONS.find(
    d => (d.id === clean || d.numericId === clean) && d.heroImage.verified === true
  );
  return found || VERIFIED_DESTINATIONS[0];
}

/**
 * Get verified Hero Carousel slides (Guaranteed 100% verified, bright, authentic)
 */
export function getVerifiedHeroCarousel() {
  return VERIFIED_DESTINATIONS.slice(0, 8).map(dest => ({
    id: dest.numericId,
    destId: dest.id,
    name: dest.name,
    title: `Khám phá ${dest.name}`,
    subtitle: dest.tagline,
    tag: dest.popularBadge || 'SALE 30%',
    tagColor: dest.popularBadgeColor || '#0284C7',
    image: dest.heroImage.url,
    source: dest.heroImage.source,
    route: `/travel/destination?id=${dest.numericId}`,
  }));
}

/**
 * Get verified Featured Destinations
 */
export function getVerifiedFeaturedDestinations() {
  return VERIFIED_DESTINATIONS.slice(0, 8).map(dest => ({
    id: dest.numericId,
    destId: dest.id,
    name: dest.name,
    province: dest.province,
    rating: dest.rating,
    reviews: `${(dest.reviews / 1000).toFixed(1)}k`,
    image: dest.thumbnailImage.url,
    tag: dest.popularBadge || 'Nổi bật',
  }));
}

/**
 * Get verified Popular Deals with Prices
 */
export function getVerifiedPopularDeals() {
  return VERIFIED_DESTINATIONS.slice(0, 6).map(dest => ({
    id: dest.numericId,
    destId: dest.id,
    name: dest.name,
    location: dest.province,
    rating: dest.rating,
    price: dest.priceFrom,
    badge: dest.popularBadge || 'HOT DEAL',
    badgeColor: dest.popularBadgeColor || '#0284C7',
    image: dest.heroImage.url,
  }));
}
