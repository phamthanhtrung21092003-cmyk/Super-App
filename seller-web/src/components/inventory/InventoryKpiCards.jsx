import React from 'react';
import { 
  DollarSign, Package, Layers, ArrowDown, XCircle 
} from 'lucide-react';

export default function InventoryKpiCards({ stats }) {
  const cards = [
    {
      id: 'total_value',
      title: 'Tổng giá trị tồn kho',
      value: stats?.formattedTotalValue || '0đ',
      subtitle: 'Giá vốn hàng tồn kho',
      icon: DollarSign,
      iconColor: '#00B14F',
      bgColor: '#E6F4EA'
    },
    {
      id: 'total_sku',
      title: 'Tổng số sản phẩm',
      value: `${stats?.totalSku || 0} SKU`,
      subtitle: 'Mã phân loại sản phẩm',
      icon: Package,
      iconColor: '#1877F2',
      bgColor: '#EFF6FF'
    },
    {
      id: 'total_quantity',
      title: 'Tổng tồn kho',
      value: `${(stats?.totalQuantity || 0).toLocaleString('vi-VN')} sản phẩm`,
      subtitle: 'Số lượng thực tế trong kho',
      icon: Layers,
      iconColor: '#F97316',
      bgColor: '#FFF7ED'
    },
    {
      id: 'low_stock',
      title: 'Sắp hết hàng',
      value: `${stats?.lowStockCount || 0} sản phẩm`,
      subtitle: 'Cần nhập hàng bổ sung',
      icon: ArrowDown,
      iconColor: '#EF4444',
      bgColor: '#FEF2F2'
    },
    {
      id: 'out_of_stock',
      title: 'Hết hàng',
      value: `${stats?.outOfStockCount || 0} sản phẩm`,
      subtitle: 'Đã tạm ngưng bán',
      icon: XCircle,
      iconColor: '#A855F7',
      bgColor: '#F3E8FF'
    }
  ];

  return (
    <div className="inventory-kpi-grid">
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div key={card.id} className="inventory-kpi-card">
            <div className="kpi-icon-circle" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
              <IconComp size={20} />
            </div>

            <div className="kpi-card-info">
              <span className="kpi-title-label">{card.title}</span>
              <div className="kpi-value-number">{card.value}</div>
              <span className="kpi-subtitle-text">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
