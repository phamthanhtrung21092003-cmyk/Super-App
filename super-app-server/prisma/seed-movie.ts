import { PrismaClient, CinemaBrand, SeatType, ShowtimeSeatStatus, VoucherDiscountType, VoucherStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🎬 [Phase 1 Seed] Starting Idempotent Movie Domain Seed...');

  // 1. Seed 6 Cinema Integrations (CGV, LOTTE, GALAXY, BETA, BHD, CINESTAR)
  const integrationsData: {
    brand: CinemaBrand;
    adapterKey: string;
    providerName: string;
    baseUrl: string;
    supportsCancel: boolean;
    holdTtlSeconds: number;
  }[] = [
    {
      brand: CinemaBrand.CGV,
      adapterKey: 'cgv-adapter',
      providerName: 'CGV Cinemas Vietnam',
      baseUrl: 'https://partner-api.cgv.vn/v1',
      supportsCancel: false,
      holdTtlSeconds: 600,
    },
    {
      brand: CinemaBrand.LOTTE,
      adapterKey: 'lotte-adapter',
      providerName: 'Lotte Cinema Vietnam',
      baseUrl: 'https://partner-api.lottecinema.vn/v1',
      supportsCancel: true,
      holdTtlSeconds: 600,
    },
    {
      brand: CinemaBrand.GALAXY,
      adapterKey: 'galaxy-adapter',
      providerName: 'Galaxy Cinema Vietnam',
      baseUrl: 'https://partner-api.galaxycine.vn/v1',
      supportsCancel: false,
      holdTtlSeconds: 600,
    },
    {
      brand: CinemaBrand.BETA,
      adapterKey: 'beta-adapter',
      providerName: 'Beta Cinemas',
      baseUrl: 'https://partner-api.betacinemas.vn/v1',
      supportsCancel: true,
      holdTtlSeconds: 600,
    },
    {
      brand: CinemaBrand.BHD,
      adapterKey: 'bhd-adapter',
      providerName: 'BHD Star Cineplex',
      baseUrl: 'https://partner-api.bhdstar.vn/v1',
      supportsCancel: false,
      holdTtlSeconds: 600,
    },
    {
      brand: CinemaBrand.CINESTAR,
      adapterKey: 'cinestar-adapter',
      providerName: 'Cinestar Vietnam',
      baseUrl: 'https://partner-api.cinestar.com.vn/v1',
      supportsCancel: true,
      holdTtlSeconds: 600,
    },
  ];

  const integrationMap = new Map<CinemaBrand, string>();
  for (const item of integrationsData) {
    const record = await prisma.cinemaIntegration.upsert({
      where: { brand: item.brand },
      update: {
        adapterKey: item.adapterKey,
        providerName: item.providerName,
        baseUrl: item.baseUrl,
        supportsCancel: item.supportsCancel,
        holdTtlSeconds: item.holdTtlSeconds,
        isActive: true,
      },
      create: {
        brand: item.brand,
        adapterKey: item.adapterKey,
        providerName: item.providerName,
        baseUrl: item.baseUrl,
        supportsCancel: item.supportsCancel,
        holdTtlSeconds: item.holdTtlSeconds,
        isActive: true,
      },
    });
    integrationMap.set(item.brand, record.id);
  }
  console.log(`✅ Seeded ${integrationMap.size} CinemaIntegrations (6 brands).`);

  // 2. Seed 6 Representative Cinemas across the 6 Brands
  const cinemasData: {
    code: string;
    name: string;
    brand: CinemaBrand;
    city: string;
    area: string;
    address: string;
    phone: string;
  }[] = [
    {
      code: 'cgv-vincom-ba-trieu',
      name: 'CGV Vincom Center Bà Triệu',
      brand: CinemaBrand.CGV,
      city: 'TP. Hà Nội',
      area: 'Hai Bà Trưng',
      address: 'Tầng 6, Vincom Center, 191 Bà Triệu, Q. Hai Bà Trưng, Hà Nội',
      phone: '1900 6017',
    },
    {
      code: 'lotte-west-lake-tay-ho',
      name: 'LOTTE Cinema West Lake Tây Hồ',
      brand: CinemaBrand.LOTTE,
      city: 'TP. Hà Nội',
      area: 'Tây Hồ',
      address: 'Tầng 4, Lotte Mall West Lake, 272 Võ Chí Công, Q. Tây Hồ, Hà Nội',
      phone: '024 3775 2525',
    },
    {
      code: 'galaxy-hanoi-centre',
      name: 'Galaxy CineX Hanoi Centre (Nguyễn Thái Học)',
      brand: CinemaBrand.GALAXY,
      city: 'TP. Hà Nội',
      area: 'Ba Đình',
      address: 'Tầng 3, Tòa Nam, 175 Nguyễn Thái Học, Q. Ba Đình, Hà Nội',
      phone: '1900 2224',
    },
    {
      code: 'beta-xuan-thuy',
      name: 'Beta Cinema Xuân Thủy',
      brand: CinemaBrand.BETA,
      city: 'TP. Hà Nội',
      area: 'Cầu Giấy',
      address: 'Tầng 4, TTTM Pico, 173 Xuân Thủy, Q. Cầu Giấy, Hà Nội',
      phone: '1900 636807',
    },
    {
      code: 'bhd-star-pham-ngoc-thach',
      name: 'BHD Star Vincom Phạm Ngọc Thạch',
      brand: CinemaBrand.BHD,
      city: 'TP. Hà Nội',
      area: 'Đống Đa',
      address: 'Tầng 8, Vincom Center, 2 Phạm Ngọc Thạch, Q. Đống Đa, Hà Nội',
      phone: '1900 2099',
    },
    {
      code: 'cinestar-quoc-thanh',
      name: 'Cinestar Quốc Thanh',
      brand: CinemaBrand.CINESTAR,
      city: 'TP. Hồ Chí Minh',
      area: 'Quận 1',
      address: '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh',
      phone: '028 7300 8881',
    },
  ];

  const cinemaRecords: any[] = [];
  for (const c of cinemasData) {
    const integrationId = integrationMap.get(c.brand)!;
    const record = await prisma.cinema.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        brand: c.brand,
        integrationId,
        city: c.city,
        area: c.area,
        address: c.address,
        phone: c.phone,
        isActive: true,
      },
      create: {
        code: c.code,
        name: c.name,
        brand: c.brand,
        integrationId,
        city: c.city,
        area: c.area,
        address: c.address,
        phone: c.phone,
        isActive: true,
      },
    });
    cinemaRecords.push(record);
  }
  console.log(`✅ Seeded ${cinemaRecords.length} Cinemas.`);

  // 3. Seed Auditoriums & Seats for each Cinema (Rows A-F, 8 seats for A-E, 4 couple seats for F)
  const auditoriumMap = new Map<string, { id: string; cinemaId: string }>();
  for (const cinema of cinemaRecords) {
    const auditorium = await prisma.auditorium.upsert({
      where: {
        cinemaId_code: {
          cinemaId: cinema.id,
          code: 'P7',
        },
      },
      update: {
        name: 'Phòng chiếu P7',
        totalRows: 6,
        totalCols: 8,
        capacity: 44,
        screenType: '2D Dolby 7.1',
        isActive: true,
      },
      create: {
        cinemaId: cinema.id,
        code: 'P7',
        name: 'Phòng chiếu P7',
        totalRows: 6,
        totalCols: 8,
        capacity: 44,
        screenType: '2D Dolby 7.1',
        isActive: true,
      },
    });
    auditoriumMap.set(cinema.id, { id: auditorium.id, cinemaId: cinema.id });

    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const row of rows) {
      if (row === 'F') {
        for (let num = 1; num <= 4; num++) {
          const seatCode = `${row}${num}`;
          await prisma.seat.upsert({
            where: {
              auditoriumId_seatCode: {
                auditoriumId: auditorium.id,
                seatCode,
              },
            },
            update: {
              rowLabel: row,
              seatNumber: num,
              type: SeatType.COUPLE,
              seatSpan: 2,
              priceModifier: 65000,
              isActive: true,
            },
            create: {
              auditoriumId: auditorium.id,
              seatCode,
              rowLabel: row,
              seatNumber: num,
              type: SeatType.COUPLE,
              seatSpan: 2,
              priceModifier: 65000,
              isActive: true,
            },
          });
        }
      } else {
        const isVip = row === 'D' || row === 'E';
        for (let num = 1; num <= 8; num++) {
          const seatCode = `${row}${num}`;
          await prisma.seat.upsert({
            where: {
              auditoriumId_seatCode: {
                auditoriumId: auditorium.id,
                seatCode,
              },
            },
            update: {
              rowLabel: row,
              seatNumber: num,
              type: isVip ? SeatType.VIP : SeatType.STANDARD,
              seatSpan: 1,
              priceModifier: isVip ? 5000 : 0,
              isActive: true,
            },
            create: {
              auditoriumId: auditorium.id,
              seatCode,
              rowLabel: row,
              seatNumber: num,
              type: isVip ? SeatType.VIP : SeatType.STANDARD,
              seatSpan: 1,
              priceModifier: isVip ? 5000 : 0,
              isActive: true,
            },
          });
        }
      }
    }
  }
  console.log(`✅ Seeded ${auditoriumMap.size} Auditoriums & ${auditoriumMap.size * 44} Seats.`);

  // 4. Seed Movies
  const moviesData = [
    {
      slug: 'conan-movie-29-thien-than-sa-nga',
      externalCode: 'MOV-CONAN-29',
      title: 'Conan Movie 29 (2026): Thiên Thần Sa Ngã Trên Xa Lộ',
      originalTitle: 'Conan Movie 29: Fallen Angel of the Highway',
      description: 'Thám tử lừng danh Conan đối đầu tổ chức bí ẩn trên cao tốc liên vùng.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
      ageRating: 'T13',
      durationMin: 109,
      genres: 'Hành Động, Trinh Thám, Hoạt Hình',
    },
    {
      slug: 'lat-mat-7-mot-dieu-uoc',
      externalCode: 'MOV-LAT-MAT-7',
      title: 'Lật Mặt 7: Một Điều Ước (Đạo diễn Lý Hải)',
      originalTitle: 'Face Off 7: One Wish',
      description: 'Câu chuyện cảm động về tình mẫu tử và gia đình Việt Nam.',
      posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80',
      ageRating: 'K',
      durationMin: 138,
      genres: 'Gia Đình, Tâm Lý, Tình Cảm',
    },
    {
      slug: 'dune-hanh-tinh-cat-2',
      externalCode: 'MOV-DUNE-2',
      title: 'Dune: Hành Tinh Cát - Phần Hai',
      originalTitle: 'Dune: Part Two',
      description: 'Hành trình báo thù và giải phóng Arrakis của Paul Atreides.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
      ageRating: 'T16',
      durationMin: 166,
      genres: 'Khoa Học Viễn Tưởng, Hành Động',
    },
  ];

  const movieRecords: any[] = [];
  for (const m of moviesData) {
    const record = await prisma.movie.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        originalTitle: m.originalTitle,
        description: m.description,
        posterUrl: m.posterUrl,
        ageRating: m.ageRating,
        durationMin: m.durationMin,
        genres: m.genres,
        isShowing: true,
        isActive: true,
      },
      create: {
        slug: m.slug,
        externalCode: m.externalCode,
        title: m.title,
        originalTitle: m.originalTitle,
        description: m.description,
        posterUrl: m.posterUrl,
        ageRating: m.ageRating,
        durationMin: m.durationMin,
        genres: m.genres,
        isShowing: true,
        isActive: true,
      },
    });
    movieRecords.push(record);
  }
  console.log(`✅ Seeded ${movieRecords.length} Movies.`);

  // 5. Seed Showtimes & ShowtimeSeats for each Cinema (Tomorrow 17:30 & 20:00)
  const baseDate = new Date();
  baseDate.setUTCDate(baseDate.getUTCDate() + 1);
  baseDate.setUTCHours(10, 30, 0, 0); // 17:30 GMT+7

  let showtimeCount = 0;
  let showtimeSeatCount = 0;

  for (const cinema of cinemaRecords) {
    const audInfo = auditoriumMap.get(cinema.id)!;
    const movie = movieRecords[0];
    const externalCode = `ST-${cinema.code}-CONAN-1730`;
    const endTime = new Date(baseDate.getTime() + movie.durationMin * 60 * 1000);

    const basePrice = cinema.brand === CinemaBrand.CGV ? 75000 : 50000;
    const vipPrice = basePrice + 5000;
    const couplePrice = basePrice * 2 + 15000;

    const showtime = await prisma.showtime.upsert({
      where: { externalCode },
      update: {
        movieId: movie.id,
        cinemaId: cinema.id,
        auditoriumId: audInfo.id,
        screeningFormat: '2D Lồng Tiếng',
        startTime: baseDate,
        endTime,
        basePrice,
        vipPrice,
        couplePrice,
        serviceFee: 5000,
        isActive: true,
      },
      create: {
        externalCode,
        movieId: movie.id,
        cinemaId: cinema.id,
        auditoriumId: audInfo.id,
        screeningFormat: '2D Lồng Tiếng',
        startTime: baseDate,
        endTime,
        basePrice,
        vipPrice,
        couplePrice,
        serviceFee: 5000,
        isActive: true,
      },
    });
    showtimeCount++;

    const seats = await prisma.seat.findMany({
      where: { auditoriumId: audInfo.id },
    });

    for (const seat of seats) {
      const seatPrice =
        seat.type === SeatType.COUPLE
          ? couplePrice
          : seat.type === SeatType.VIP
            ? vipPrice
            : basePrice;

      await prisma.showtimeSeat.upsert({
        where: {
          showtimeId_seatId: {
            showtimeId: showtime.id,
            seatId: seat.id,
          },
        },
        update: {
          seatCode: seat.seatCode,
          seatType: seat.type,
          price: seatPrice,
        },
        create: {
          showtimeId: showtime.id,
          seatId: seat.id,
          seatCode: seat.seatCode,
          seatType: seat.type,
          price: seatPrice,
          status: ShowtimeSeatStatus.AVAILABLE,
        },
      });
      showtimeSeatCount++;
    }
  }
  console.log(`✅ Seeded ${showtimeCount} Showtimes & ${showtimeSeatCount} ShowtimeSeats.`);

  // 6. Seed Cinema/Brand-specific Combos (Preventing CGV getting Beta combos)
  const combosData = [
    {
      code: 'CGV-MY-COMBO',
      brand: CinemaBrand.CGV,
      name: 'CGV My Combo',
      description: '1 Bắp Ngọt Lớn (44oz) + 1 Nước Siêu Lớn (32oz)',
      price: 89000,
      originalPrice: 115000,
      savingsText: 'TIẾT KIỆM 26K',
    },
    {
      code: 'LOTTE-COUPLE-COMBO',
      brand: CinemaBrand.LOTTE,
      name: 'Lotte Couple Combo',
      description: '1 Bắp Phô Mai Lớn + 2 Nước Ngọt Lớn',
      price: 105000,
      originalPrice: 135000,
      savingsText: 'TIẾT KIỆM 30K',
    },
    {
      code: 'GALAXY-ICOMBO-1',
      brand: CinemaBrand.GALAXY,
      name: 'Galaxy iCombo 1 Big',
      description: '1 Bắp Caramel (44oz) + 1 Nước Ngọt (22oz)',
      price: 79000,
      originalPrice: 100000,
      savingsText: 'TIẾT KIỆM 21K',
    },
    {
      code: 'BETA-COMBO-69OZ',
      brand: CinemaBrand.BETA,
      name: 'Beta Combo 69oz',
      description: 'TIẾT KIỆM 28K!!! Gồm: 1 Bắp (69oz) + 1 Nước có gas (22oz)',
      price: 68000,
      originalPrice: 96000,
      savingsText: 'TIẾT KIỆM 28K!!!',
    },
    {
      code: 'BETA-SWEET-COMBO-69OZ',
      brand: CinemaBrand.BETA,
      name: 'Sweet Combo 69oz',
      description: 'TIẾT KIỆM 46K!!! Gồm: 1 Bắp (69oz) + 2 Nước có gas (22oz)',
      price: 88000,
      originalPrice: 134000,
      savingsText: 'TIẾT KIỆM 46K!!!',
    },
    {
      code: 'BHD-SINGLE-COMBO',
      brand: CinemaBrand.BHD,
      name: 'BHD Single Combo',
      description: '1 Bắp Bơ Mặn + 1 Coca-Cola Lớn',
      price: 75000,
      originalPrice: 95000,
      savingsText: 'TIẾT KIỆM 20K',
    },
    {
      code: 'CINESTAR-SOLO-COMBO',
      brand: CinemaBrand.CINESTAR,
      name: 'Cinestar Solo Combo',
      description: '1 Bắp Ngọt + 1 Pepsi Lớn giá sinh viên',
      price: 62000,
      originalPrice: 80000,
      savingsText: 'TIẾT KIỆM 18K',
    },
  ];

  for (const cb of combosData) {
    const matchingCinema = cinemaRecords.find((c) => c.brand === cb.brand);
    await prisma.combo.upsert({
      where: { code: cb.code },
      update: {
        cinemaId: matchingCinema?.id || null,
        brand: cb.brand,
        name: cb.name,
        description: cb.description,
        price: cb.price,
        originalPrice: cb.originalPrice,
        savingsText: cb.savingsText,
        stockQuantity: 200,
        isActive: true,
      },
      create: {
        code: cb.code,
        cinemaId: matchingCinema?.id || null,
        brand: cb.brand,
        name: cb.name,
        description: cb.description,
        price: cb.price,
        originalPrice: cb.originalPrice,
        savingsText: cb.savingsText,
        stockQuantity: 200,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${combosData.length} Combos across all 6 brands.`);

  // 7. Seed Vouchers
  const validFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const vouchersData = [
    {
      code: 'VLIFEMOVIE20K',
      title: 'Giảm 20.000đ cho đơn vé từ 100.000đ',
      description: 'Áp dụng cho tất cả các cụm rạp trên V-Life.',
      discountType: VoucherDiscountType.FIXED_AMOUNT,
      discountValue: 20000,
      maxDiscountAmount: 20000,
      minOrderAmount: 100000,
      usageLimit: 500,
      perUserLimit: 2,
      cinemaBrand: null,
    },
    {
      code: 'BETAVIP15',
      title: 'Giảm 15% tối đa 30.000đ tại Beta Cinema',
      description: 'Chỉ áp dụng cho các rạp thuộc hệ thống Beta Cinema.',
      discountType: VoucherDiscountType.PERCENTAGE,
      discountValue: 15,
      maxDiscountAmount: 30000,
      minOrderAmount: 80000,
      usageLimit: 200,
      perUserLimit: 1,
      cinemaBrand: CinemaBrand.BETA,
    },
  ];

  for (const v of vouchersData) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {
        title: v.title,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        maxDiscountAmount: v.maxDiscountAmount,
        minOrderAmount: v.minOrderAmount,
        usageLimit: v.usageLimit,
        perUserLimit: v.perUserLimit,
        validFrom,
        validUntil,
        cinemaBrand: v.cinemaBrand,
        status: VoucherStatus.ACTIVE,
      },
      create: {
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        maxDiscountAmount: v.maxDiscountAmount,
        minOrderAmount: v.minOrderAmount,
        usageLimit: v.usageLimit,
        perUserLimit: v.perUserLimit,
        validFrom,
        validUntil,
        cinemaBrand: v.cinemaBrand,
        status: VoucherStatus.ACTIVE,
      },
    });
  }
  console.log(`✅ Seeded ${vouchersData.length} Vouchers.`);
  console.log('🎉 [Phase 1 Seed] Completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
