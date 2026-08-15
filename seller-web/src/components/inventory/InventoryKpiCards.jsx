import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function InventoryKpiCards({ stats, onFilterStatus }) {
  const isZero = !stats || stats.totalProducts === 0;

  const cards = [
    {
      id: 'total_products',
      title: 'Tổng sản phẩm',
      value: isZero ? 0 : (stats?.totalProducts || 48),
      subtitle: isZero ? 'Chưa có sản phẩm' : 'Sản phẩm trong Catalog',
      icon: Package,
      iconColor: '#00B14F',
      bgColor: '#E6F4EA',
      statusFilter: 'Tất cả'
    },
    {
      id: 'in_stock',
      title: 'Đang còn hàng',
      value: isZero ? 0 : (stats?.inStockCount || 41),
      subtitle: isZero ? 'Chưa có hàng' : 'Tồn kho an toàn (> 5)',
      icon: CheckCircle2,
      iconColor: '#16A34A',
      bgColor: '#F0FDF4',
      statusFilter: 'Còn hàng'
    },
    {
      id: 'low_stock',
      title: 'Sắp hết hàng',
      value: isZero ? 0 : (stats?.lowStockCount || 5),
      subtitle: isZero ? '0 cảnh báo' : 'Tồn kho <= 5 sản phẩm',
      icon: AlertTriangle,
      iconColor: '#F97316',
      bgColor: '#FFF7ED',
      statusFilter: 'Sắp hết'
    },
    {
      id: 'out_of_stock',
      title: 'Hết hàng',
      value: isZero ? 0 : (stats?.outOfStockCount || 2),
      subtitle: isZero ? '0 sản phẩm' : 'Tồn kho = 0 sản phẩm',
      icon: XCircle,
      iconColor: '#EF4444',
      bgColor: '#FEF2F2',
      statusFilter: 'Hết hàng'
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
            title={`Lọc danh sách theo ${card.title}`}
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
