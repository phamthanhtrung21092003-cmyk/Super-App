import React from 'react';
import { Package, Layers, Box, AlertTriangle, XCircle } from 'lucide-react';

export default function InventoryKpiCards({ stats, onFilterStatus }) {
  const cards = [
    {
      id: 'total_products',
      title: 'Tổng sản phẩm',
      value: `${stats?.totalProducts || 128} sản phẩm`,
      subtitle: 'Sản phẩm có trong Catalog',
      icon: Package,
      iconColor: '#00B14F',
      bgColor: '#E6F4EA',
      statusFilter: 'all'
    },
    {
      id: 'total_sku',
      title: 'Tổng SKU',
      value: `${stats?.totalSku || 356} SKU`,
      subtitle: 'Mã biến thể phân loại',
      icon: Layers,
      iconColor: '#1877F2',
      bgColor: '#EFF6FF',
      statusFilter: 'all'
    },
    {
      id: 'total_quantity',
      title: 'Tổng tồn kho',
      value: `${(stats?.totalQuantity || 12580).toLocaleString('vi-VN')} sản phẩm`,
      subtitle: 'Tồn thực tế trong kho',
      icon: Box,
      iconColor: '#9333EA',
      bgColor: '#F3E8FF',
      statusFilter: 'all'
    },
    {
      id: 'low_stock',
      title: 'Sắp hết hàng',
      value: `${stats?.lowStockCount || 18} sản phẩm`,
      subtitle: 'Tồn kho <= 10 sản phẩm',
      icon: AlertTriangle,
      iconColor: '#F97316',
      bgColor: '#FFF7ED',
      statusFilter: 'low'
    },
    {
      id: 'out_of_stock',
      title: 'Hết hàng',
      value: `${stats?.outOfStockCount || 5} sản phẩm`,
      subtitle: 'Tồn kho khả dụng = 0',
      icon: XCircle,
      iconColor: '#EF4444',
      bgColor: '#FEF2F2',
      statusFilter: 'out'
    }
  ];

  return (
    <div className="inventory-kpi-grid">
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div 
            key={card.id} 
            className="inventory-kpi-card clickable-card"
            onClick={() => onFilterStatus && onFilterStatus(card.statusFilter)}
          >
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
