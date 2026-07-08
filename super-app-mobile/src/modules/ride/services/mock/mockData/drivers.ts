export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  avatar: string;
  vehicleType: 'bike' | 'car';
  vehiclePlate: string;
  vehicleName: string;
  rating: number;
  tripsCount: number;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'offline';
}

export const MOCK_DRIVERS: Driver[] = [
  { id: 'drv_1', fullName: 'Trần Minh Hoàng', phone: '0901234567', avatar: 'https://i.pravatar.cc/150?img=11', vehicleType: 'bike', vehiclePlate: '59-A1 123.45', vehicleName: 'Honda Wave Alpha', rating: 4.9, tripsCount: 1250, latitude: 10.7626, longitude: 106.6601, status: 'available' },
  { id: 'drv_2', fullName: 'Nguyễn Tiến Minh', phone: '0912345678', avatar: 'https://i.pravatar.cc/150?img=12', vehicleType: 'bike', vehiclePlate: '59-B2 678.90', vehicleName: 'Yamaha Exciter', rating: 4.8, tripsCount: 840, latitude: 10.7735, longitude: 106.6945, status: 'available' },
  { id: 'drv_3', fullName: 'Lê Hoàng Nam', phone: '0923456789', avatar: 'https://i.pravatar.cc/150?img=13', vehicleType: 'car', vehiclePlate: '30-A 999.99', vehicleName: 'Toyota Vios', rating: 5.0, tripsCount: 3100, latitude: 10.7501, longitude: 106.6710, status: 'available' },
  { id: 'drv_4', fullName: 'Phạm Đức Duy', phone: '0934567890', avatar: 'https://i.pravatar.cc/150?img=14', vehicleType: 'bike', vehiclePlate: '59-S3 456.78', vehicleName: 'Honda Vision', rating: 4.7, tripsCount: 520, latitude: 10.7850, longitude: 106.6820, status: 'available' },
  { id: 'drv_5', fullName: 'Vũ Quốc Anh', phone: '0945678901', avatar: 'https://i.pravatar.cc/150?img=15', vehicleType: 'car', vehiclePlate: '51-F 543.21', vehicleName: 'Hyundai Grand i10', rating: 4.6, tripsCount: 1100, latitude: 10.7960, longitude: 106.7030, status: 'busy' },
  { id: 'drv_6', fullName: 'Đặng Tuấn Tú', phone: '0956789012', avatar: 'https://i.pravatar.cc/150?img=16', vehicleType: 'bike', vehiclePlate: '59-K1 888.88', vehicleName: 'Honda Winner X', rating: 4.9, tripsCount: 1980, latitude: 10.7300, longitude: 106.7200, status: 'available' },
  { id: 'drv_7', fullName: 'Bùi Thanh Sơn', phone: '0967890123', avatar: 'https://i.pravatar.cc/150?img=17', vehicleType: 'car', vehiclePlate: '51-H 987.65', vehicleName: 'Mitsubishi Xpander', rating: 4.8, tripsCount: 2400, latitude: 10.8010, longitude: 106.6500, status: 'available' },
  { id: 'drv_8', fullName: 'Ngô Việt Hùng', phone: '0978901234', avatar: 'https://i.pravatar.cc/150?img=18', vehicleType: 'bike', vehiclePlate: '59-D1 246.80', vehicleName: 'Suzuki Raider', rating: 4.5, tripsCount: 450, latitude: 10.7420, longitude: 106.6450, status: 'offline' },
  { id: 'drv_9', fullName: 'Dương Văn Khoa', phone: '0989012345', avatar: 'https://i.pravatar.cc/150?img=19', vehicleType: 'bike', vehiclePlate: '59-E2 135.79', vehicleName: 'Honda Air Blade', rating: 4.7, tripsCount: 1600, latitude: 10.7680, longitude: 106.6780, status: 'available' },
  { id: 'drv_10', fullName: 'Lý Quốc Bảo', phone: '0990123456', avatar: 'https://i.pravatar.cc/150?img=20', vehicleType: 'car', vehiclePlate: '51-G 222.33', vehicleName: 'Kia Morning', rating: 4.7, tripsCount: 780, latitude: 10.7550, longitude: 106.6990, status: 'available' },
  { id: 'drv_11', fullName: 'Trần Lâm Tùng', phone: '0812345678', avatar: 'https://i.pravatar.cc/150?img=21', vehicleType: 'bike', vehiclePlate: '59-F1 889.01', vehicleName: 'Honda Lead', rating: 4.8, tripsCount: 1450, latitude: 10.7812, longitude: 106.6622, status: 'available' },
  { id: 'drv_12', fullName: 'Nguyễn Hữu Chiến', phone: '0823456789', avatar: 'https://i.pravatar.cc/150?img=22', vehicleType: 'bike', vehiclePlate: '59-C1 777.66', vehicleName: 'Yamaha Sirius', rating: 4.4, tripsCount: 300, latitude: 10.7932, longitude: 106.6852, status: 'available' },
  { id: 'drv_13', fullName: 'Lê Minh Thành', phone: '0834567890', avatar: 'https://i.pravatar.cc/150?img=23', vehicleType: 'car', vehiclePlate: '30-E 888.77', vehicleName: 'Mazda 3', rating: 4.9, tripsCount: 1850, latitude: 10.7712, longitude: 106.7022, status: 'busy' },
  { id: 'drv_14', fullName: 'Đỗ Tiến Đạt', phone: '0845678901', avatar: 'https://i.pravatar.cc/150?img=24', vehicleType: 'bike', vehiclePlate: '59-L2 334.45', vehicleName: 'Honda SH Mode', rating: 4.8, tripsCount: 970, latitude: 10.7482, longitude: 106.6802, status: 'available' },
  { id: 'drv_15', fullName: 'Hoàng Văn Quý', phone: '0856789012', avatar: 'https://i.pravatar.cc/150?img=25', vehicleType: 'car', vehiclePlate: '51-K 444.55', vehicleName: 'VinFast Lux A2.0', rating: 5.0, tripsCount: 4200, latitude: 10.7250, longitude: 106.7110, status: 'available' },
  { id: 'drv_16', fullName: 'Phùng Anh Tuấn', phone: '0867890123', avatar: 'https://i.pravatar.cc/150?img=26', vehicleType: 'bike', vehiclePlate: '59-M1 556.67', vehicleName: 'Yamaha Grande', rating: 4.6, tripsCount: 890, latitude: 10.8120, longitude: 106.6430, status: 'available' },
  { id: 'drv_17', fullName: 'Mai Văn Nam', phone: '0878901234', avatar: 'https://i.pravatar.cc/150?img=27', vehicleType: 'car', vehiclePlate: '51-A 111.22', vehicleName: 'Honda City', rating: 4.7, tripsCount: 1200, latitude: 10.8034, longitude: 106.6712, status: 'available' },
  { id: 'drv_18', fullName: 'Trịnh Tiến Dũng', phone: '0889012345', avatar: 'https://i.pravatar.cc/150?img=28', vehicleType: 'bike', vehiclePlate: '59-N2 778.89', vehicleName: 'Honda PCX', rating: 4.8, tripsCount: 1540, latitude: 10.7380, longitude: 106.6560, status: 'offline' },
  { id: 'drv_19', fullName: 'Hồ Hoàng Long', phone: '0899012345', avatar: 'https://i.pravatar.cc/150?img=29', vehicleType: 'bike', vehiclePlate: '59-P1 990.01', vehicleName: 'Vespa Sprint', rating: 4.9, tripsCount: 2100, latitude: 10.7612, longitude: 106.6890, status: 'available' },
  { id: 'drv_20', fullName: 'Cao Minh Triết', phone: '0701234567', avatar: 'https://i.pravatar.cc/150?img=30', vehicleType: 'car', vehiclePlate: '51-L 777.88', vehicleName: 'Hyundai Accent', rating: 4.7, tripsCount: 920, latitude: 10.7645, longitude: 106.6912, status: 'available' }
];
