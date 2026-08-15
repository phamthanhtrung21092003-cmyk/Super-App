import React from 'react';
import { ShoppingBag, TrendingUp, PauseCircle, PackageX, FileText } from 'lucide-react';

export default function ProductMetrics({ metrics, onSelectFilter }) {
  const total = metrics?.total || 0;

  const getPercent = (count) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  const metricCards = [
    {
      id: 'all',
      title: 'Tổng sản phẩm',
      count: metrics?.total || 0,
      subtext: total > 0 ? `${total} sản phẩm` : 'Chưa có sản phẩm',
      icon: ShoppingBag,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'active',
      title: 'Đang bán',
      count: metrics?.active || 0,
      subtext: `${getPercent(metrics?.active || 0)} tổng số sản phẩm`,
      icon: TrendingUp,
      bgColor: '#F0FDF4',
      iconColor: '#16A34A'
    },
    {
      id: 'hidden',
      title: 'Tạm ẩn',
      count: metrics?.hidden || 0,
      subtext: `${getPercent(metrics?.hidden || 0)} tổng số sản phẩm`,
      icon: PauseCircle,
      bgColor: '#FEFCE8',
      iconColor: '#CA8A04'
    },
    {
      id: 'outofstock',
      title: 'Hết hàng',
      count: metrics?.outofstock || 0,
      subtext: `${getPercent(metrics?.outofstock || 0)} tổng số sản phẩm`,
      icon: PackageX,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444'
    },
    {
      id: 'draft',
      title: 'Bản nháp',
      count: metrics?.draft || 0,
      subtext: `${getPercent(metrics?.draft || 0)} tổng số sản phẩm`,
      icon: FileText,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    }
  ];

  return (
    <div className="product-metrics-grid">
      {metricCards.map(card => {
        const IconComp = card.icon;

        return (
          <div 
            key={card.id} 
            className="product-mini-kpi-card cursor-pointer"
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectFilter && onSelectFilter(card.id)}
            title={`Lọc danh sách theo ${card.title}`}
          >
            <div className="mini-card-icon-wrapper" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
              <IconComp size={18} />
            </div>

            <div className="mini-card-info">
              <span className="mini-card-title">{card.title}</span>
              <span className="mini-card-val">{card.count}</span>
              <span className="mini-card-subtext">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
