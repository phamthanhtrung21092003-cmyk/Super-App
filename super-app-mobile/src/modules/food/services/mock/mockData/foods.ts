export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  salesCount: number;
  category: string;
}

// Danh sách món ăn thực tế mẫu của một số nhà hàng tiêu biểu
const baseFoods = [
  // res_1: Highlands Coffee (Cà phê, Trà, Bánh mì)
  { restaurantId: 'res_1', name: 'Phin Sữa Đá Size L', price: 39000, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500', description: 'Cà phê phin đậm đà kết hợp sữa đặc ngọt béo thơm lừng truyền thống.', rating: 4.8, category: 'Cà phê' },
  { restaurantId: 'res_1', name: 'Bạc Xỉu Đá Size M', price: 35000, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500', description: 'Vị sữa đặc ngọt ngào hòa quyện cùng vị đắng nhẹ của cà phê phin.', rating: 4.7, category: 'Cà phê' },
  { restaurantId: 'res_1', name: 'Trà Sen Vàng Size L', price: 59000, image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=500', description: 'Trà ô long thanh mát kết hợp hạt sen bùi béo và củ năng giòn ngọt.', rating: 4.9, category: 'Trà' },
  { restaurantId: 'res_1', name: 'Bánh Mì Thịt Nướng', price: 25000, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500', description: 'Bánh mì giòn nóng hổi kẹp thịt nướng sả thơm ngon đậm vị.', rating: 4.6, category: 'Bánh mì' },

  // res_2: Phúc Long (Trà sữa, Trà trái cây)
  { restaurantId: 'res_2', name: 'Trà Sữa Phúc Long Size L', price: 55000, image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500', description: 'Trà sữa đậm vị trà truyền thống độc quyền Phúc Long thơm ngon nổi tiếng.', rating: 4.9, category: 'Trà sữa' },
  { restaurantId: 'res_2', name: 'Trà Đào Đá Size L', price: 50000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', description: 'Trà đào thanh mát ngọt dịu đi kèm những miếng đào giòn dai thơm ngậy.', rating: 4.8, category: 'Trà trái cây' },
  { restaurantId: 'res_2', name: 'Trà Thiết Quan Âm Macchiato', price: 55000, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', description: 'Trà Thiết Quan Âm đậm mùi thơm kết hợp lớp kem sữa Macchiato mặn béo.', rating: 4.7, category: 'Trà sữa' },

  // res_3: Cơm Tấm Cali
  { restaurantId: 'res_3', name: 'Cơm Tấm Sườn Bì Chả Đặc Biệt', price: 65000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500', description: 'Cơm tấm dẻo thơm ăn kèm sườn nướng mật ong thơm phức, bì thính vàng rơm và chả trứng.', rating: 4.8, category: 'Cơm tấm' },
  { restaurantId: 'res_3', name: 'Bún Thịt Nướng Chả Giò', price: 49000, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', description: 'Bún tươi ăn kèm thịt nướng đậm đà, chả giò chiên giòn rụm và nước mắm chua ngọt.', rating: 4.7, category: 'Bún thịt nướng' },

  // res_4: Phở Hùng
  { restaurantId: 'res_4', name: 'Phở Bò Tái Nạm Gầu Đặc Biệt', price: 75000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500', description: 'Nước dùng phở bò hầm xương 24h ngọt lịm kết hợp thịt tái tươi ngon, nạm và gầu bò thơm béo.', rating: 4.9, category: 'Phở' },

  // res_5: Bánh Mì Huỳnh Hoa
  { restaurantId: 'res_5', name: 'Bánh Mì Đặc Biệt Huỳnh Hoa', price: 58000, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500', description: 'Ổ bánh mì siêu chà bông đầy ắp bơ patê nhà làm độc quyền cùng 5 loại chả lụa thịt nguội.', rating: 4.9, category: 'Bánh mì' },

  // res_6: KFC
  { restaurantId: 'res_6', name: 'Combo Gà Rán 2 Miếng KFC', price: 79000, image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac23c3?w=500', description: '2 miếng gà giòn cay hoặc truyền thống ngon trứ danh cùng khoai tây chiên và Pepsi.', rating: 4.5, category: 'Gà rán' },

  // res_7: The Pizza Company
  { restaurantId: 'res_7', name: 'Pizza Hải Sản Đào Cao Cấp', price: 189000, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', description: 'Đế pizza giòn rụm phủ đầy tôm tươi, mực ống, thanh cua kết hợp đào chín thơm ngọt.', rating: 4.8, category: 'Pizza' }
];

// Tạo tự động 100 món ăn dựa trên 30 nhà hàng
const generateFoods = (): FoodItem[] => {
  const list: FoodItem[] = [];
  
  // Nạp trước các món mẫu
  baseFoods.forEach((bf, idx) => {
    list.push({
      id: `food_${idx + 1}`,
      restaurantId: bf.restaurantId,
      name: bf.name,
      price: bf.price,
      image: bf.image,
      description: bf.description,
      rating: bf.rating,
      salesCount: Math.floor(Math.random() * 500) + 100,
      category: bf.category
    });
  });

  const namesByCat: { [key: string]: string[] } = {
    'Cà phê': ['Espresso', 'Cappuccino', 'Americano', 'Cà phê muối', 'Cà phê cốt dừa', 'Cà phê trứng'],
    'Trà': ['Trà thạch đào', 'Trà vải lài', 'Trà sen củ năng', 'Trà sữa matcha', 'Trà hoa cúc mật ong'],
    'Trà sữa': ['Trà sữa trân châu hoàng kim', 'Trà sữa khoai môn', 'Sữa tươi trân châu đường đen', 'Trà sữa ô long'],
    'Món Việt': ['Cơm gà xối mỡ', 'Phở bò tái', 'Phở gà ta', 'Hủ tiếu Nam Vang sườn', 'Bún riêu cua đồng', 'Bún chả Hà Nội', 'Bánh đa cua', 'Bánh cuốn nóng'],
    'Cơm tấm': ['Cơm tấm sườn nướng mật ong', 'Cơm tấm chả trứng', 'Cơm tấm ba rọi nướng sả', 'Cơm sườn bì chả lạp xưởng'],
    'Ăn nhanh': ['Khoai tây chiên xóc phô mai', 'Gà rán giòn cay', 'Burger bò phô mai kép', 'Hotdog xúc xích pho mai'],
    'Pizza': ['Pizza phô mai gấp đôi', 'Pizza bò beefsteak nướng', 'Pizza gà nướng dứa', 'Pizza xúc xích pepperoni'],
    'Món Nhật': ['Sashimi cá hồi tươi', 'Set Sushi thập cẩm', 'Mì Ramen xá xíu trứng lòng đào', 'Cơm lươn nướng Nhật'],
    'Lẩu': ['Set lẩu Thái mini tự chọn', 'Nước lẩu Tomyum chua cay', 'Set bò Mỹ nhúng lẩu', 'Lẩu riêu cua sườn sụn']
  };

  const imagesByCat: { [key: string]: string[] } = {
    'Cà phê': ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'],
    'Trà': ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'],
    'Trà sữa': ['https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'],
    'Món Việt': ['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500'],
    'Cơm tấm': ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'],
    'Ăn nhanh': ['https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500'],
    'Pizza': ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500'],
    'Món Nhật': ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500'],
    'Lẩu': ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500']
  };

  // Tiếp tục sinh dữ liệu cho đến khi đủ 100 món ăn
  let foodCounter = list.length + 1;
  const categories = Object.keys(namesByCat);

  // Lặp qua 30 nhà hàng (res_1 đến res_30) để tạo món ăn
  for (let resNum = 1; resNum <= 30; resNum++) {
    const restaurantId = `res_${resNum}`;
    
    // Mỗi nhà hàng tạo khoảng 3-4 món ăn ngẫu nhiên
    for (let m = 0; m < 3; m++) {
      if (foodCounter > 100) break;
      
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const names = namesByCat[randomCat];
      const name = names[Math.floor(Math.random() * names.length)] + ` (Res ${resNum})`;
      const images = imagesByCat[randomCat] || ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'];
      const image = images[Math.floor(Math.random() * images.length)];
      
      list.push({
        id: `food_${foodCounter}`,
        restaurantId,
        name,
        price: (Math.floor(Math.random() * 20) + 5) * 5000, // Giá từ 25k -> 120k
        image,
        description: `Món ăn đặc biệt đậm vị tươi ngon, chế biến hợp vệ sinh tại cửa hàng số ${resNum}.`,
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Đánh giá từ 3.5 -> 5.0
        salesCount: Math.floor(Math.random() * 1000) + 10,
        category: randomCat
      });
      foodCounter++;
    }
  }

  // Đảm bảo tạo chính xác 100 món ăn
  while (list.length < 100) {
    const randomResNum = Math.floor(Math.random() * 30) + 1;
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const names = namesByCat[randomCat];
    const name = names[Math.floor(Math.random() * names.length)] + ` Thập Cẩm (Gia Truyền)`;
    const images = imagesByCat[randomCat] || ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'];
    const image = images[Math.floor(Math.random() * images.length)];

    list.push({
      id: `food_${list.length + 1}`,
      restaurantId: `res_${randomResNum}`,
      name,
      price: (Math.floor(Math.random() * 15) + 6) * 5000,
      image,
      description: `Món ăn cao cấp gia truyền đặc sắc nhất của chúng tôi, chuẩn hương vị Việt.`,
      rating: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)),
      salesCount: Math.floor(Math.random() * 800) + 100,
      category: randomCat
    });
  }

  return list;
};

export const MOCK_FOOD_ITEMS = generateFoods();
