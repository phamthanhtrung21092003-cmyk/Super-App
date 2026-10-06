import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@127.0.0.1:5432/superapp_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🍕 [Food Seed] Starting Seed Food Delivery Restaurants & Menu...');

  // 1. Quán 1: The Pizza Company & Pasta
  const r1 = await prisma.restaurant.upsert({
    where: { slug: 'the-pizza-hub' },
    update: {},
    create: {
      id: 'rest_pizza_hub',
      name: 'The Pizza Company & Pasta - Thái Hà',
      slug: 'the-pizza-hub',
      avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
      address: '102 Phố Thái Hà, Trung Liệt, Đống Đa, Hà Nội',
      latitude: 21.0118,
      longitude: 105.8195,
      rating: 4.8,
      totalReviews: 320,
      openingHours: '09:00 - 22:30',
      isActive: true,
    },
  });

  // Categories cho Quán 1
  const cat1 = await prisma.menuCategory.upsert({
    where: { id: 'cat_pizza_best' },
    update: {},
    create: {
      id: 'cat_pizza_best',
      restaurantId: r1.id,
      name: 'Món bán chạy',
      sortOrder: 1,
    },
  });

  const cat2 = await prisma.menuCategory.upsert({
    where: { id: 'cat_pizza_drinks' },
    update: {},
    create: {
      id: 'cat_pizza_drinks',
      restaurantId: r1.id,
      name: 'Đồ uống & Tráng miệng',
      sortOrder: 2,
    },
  });

  // Món 1: Pizza Hải Sản
  const m1 = await prisma.menuItem.upsert({
    where: { id: 'item_pizza_1' },
    update: {},
    create: {
      id: 'item_pizza_1',
      restaurantId: r1.id,
      categoryId: cat1.id,
      name: 'Pizza Hải Sản Viền Phô Mai',
      description: 'Tôm, mực, nghêu, ớt chuông, phô mai Mozzarella dẻo dai hảo hạng',
      price: 185000,
      originalPrice: 220000,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
      calories: '450 Kcal',
      isAvailable: true,
    },
  });

  // Option Group: Size
  const og1 = await prisma.itemOptionGroup.upsert({
    where: { id: 'grp_pizza_size' },
    update: {},
    create: {
      id: 'grp_pizza_size',
      menuItemId: m1.id,
      name: 'Kích cỡ (Size)',
      required: true,
      maxSelect: 1,
    },
  });

  await prisma.itemOption.upsert({
    where: { id: 'opt_size_s' },
    update: {},
    create: { id: 'opt_size_s', groupId: og1.id, name: 'Size S (Nhỏ - 6 miếng)', price: 0 },
  });
  await prisma.itemOption.upsert({
    where: { id: 'opt_size_m' },
    update: {},
    create: { id: 'opt_size_m', groupId: og1.id, name: 'Size M (Vừa - 8 miếng)', price: 40000 },
  });
  await prisma.itemOption.upsert({
    where: { id: 'opt_size_l' },
    update: {},
    create: { id: 'opt_size_l', groupId: og1.id, name: 'Size L (Lớn - 10 miếng)', price: 80000 },
  });

  // Option Group: Topping
  const og2 = await prisma.itemOptionGroup.upsert({
    where: { id: 'grp_pizza_topping' },
    update: {},
    create: {
      id: 'grp_pizza_topping',
      menuItemId: m1.id,
      name: 'Topping thêm',
      required: false,
      maxSelect: 3,
    },
  });

  await prisma.itemOption.upsert({
    where: { id: 'top_cheese' },
    update: {},
    create: { id: 'top_cheese', groupId: og2.id, name: 'Gấp đôi Phô mai', price: 25000 },
  });
  await prisma.itemOption.upsert({
    where: { id: 'top_sausage' },
    update: {},
    create: { id: 'top_sausage', groupId: og2.id, name: 'Xúc xích Đức', price: 20000 },
  });
  await prisma.itemOption.upsert({
    where: { id: 'top_bacon' },
    update: {},
    create: { id: 'top_bacon', groupId: og2.id, name: 'Thịt xông khói', price: 20000 },
  });

  // Món 2: Mì Ý Bò Bằm
  const m2 = await prisma.menuItem.upsert({
    where: { id: 'item_spaghetti' },
    update: {},
    create: {
      id: 'item_spaghetti',
      restaurantId: r1.id,
      categoryId: cat1.id,
      name: 'Mì Ý Bò Băm Xốt Cà Chua',
      description: 'Thịt bò băm tươi, xốt cà chua thảo mộc, rắc phô mai Parmesan bột',
      price: 95000,
      originalPrice: 110000,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
      calories: '380 Kcal',
      isAvailable: true,
    },
  });

  // Món 3: Trà Đào Cam Sả
  const m3 = await prisma.menuItem.upsert({
    where: { id: 'item_tea_peach' },
    update: {},
    create: {
      id: 'item_tea_peach',
      restaurantId: r1.id,
      categoryId: cat2.id,
      name: 'Trà Đào Cam Sả',
      description: 'Trà đào thanh mát với miếng đào giòn và sả tươi giải nhiệt',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
      calories: '120 Kcal',
      isAvailable: true,
    },
  });

  // 2. Quán 2: Cơm Tấm Sài Gòn Xưa
  const r2 = await prisma.restaurant.upsert({
    where: { slug: 'com-tam-saigon-xua' },
    update: {},
    create: {
      id: 'rest_com_tam_saigon',
      name: 'Cơm Tấm Sài Gòn Xưa - Sườn Bì Chả',
      slug: 'com-tam-saigon-xua',
      avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      address: '45 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      latitude: 21.0023,
      longitude: 105.8152,
      rating: 4.9,
      totalReviews: 540,
      openingHours: '06:30 - 21:30',
      isActive: true,
    },
  });

  const catCom = await prisma.menuCategory.upsert({
    where: { id: 'cat_com_tam' },
    update: {},
    create: {
      id: 'cat_com_tam',
      restaurantId: r2.id,
      name: 'Cơm Tấm Đặc Biệt',
      sortOrder: 1,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'item_com_suon' },
    update: {},
    create: {
      id: 'item_com_suon',
      restaurantId: r2.id,
      categoryId: catCom.id,
      name: 'Cơm Tấm Sườn Nướng Mật Ong',
      description: 'Cơm tấm dẻo thơm, miếng sườn nướng than hoa mềm ướp sốt mật ong thơm lừng',
      price: 65000,
      originalPrice: 75000,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      calories: '550 Kcal',
      isAvailable: true,
    },
  });

  // 3. Quán 3: Trà Sữa & Trà Hoa Quả Tươi Lab
  const r3 = await prisma.restaurant.upsert({
    where: { slug: 'tra-sua-lab' },
    update: {},
    create: {
      id: 'rest_tea_lab',
      name: 'Trà Sữa & Trà Hoa Quả Tươi Lab - Bách Khoa',
      slug: 'tra-sua-lab',
      avatar: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      address: '18 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
      latitude: 21.0055,
      longitude: 105.8450,
      rating: 4.7,
      totalReviews: 210,
      openingHours: '08:00 - 23:00',
      isActive: true,
    },
  });

  const catTea = await prisma.menuCategory.upsert({
    where: { id: 'cat_tea_main' },
    update: {},
    create: {
      id: 'cat_tea_main',
      restaurantId: r3.id,
      name: 'Trà Sữa & Nước Ép',
      sortOrder: 1,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'item_milk_tea_1' },
    update: {},
    create: {
      id: 'item_milk_tea_1',
      restaurantId: r3.id,
      categoryId: catTea.id,
      name: 'Trà Sữa Trân Châu Hoàng Kim',
      description: 'Trà sữa đậm vị hồng trà Ceylon kết hợp trân châu hoàng kim giòn dai',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1558857563-b37cf5a9dc19?auto=format&fit=crop&w=400&q=80',
      calories: '280 Kcal',
      isAvailable: true,
    },
  });

  console.log('✅ [Food Seed] Hoàn tất nạp dữ liệu 3 quán ăn, menu, size và topping vào PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ [Food Seed] Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
