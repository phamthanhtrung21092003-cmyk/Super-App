import React from 'react';
import { Video, Heart, MousePointer, ShoppingBag, DollarSign, Percent, TrendingUp } from 'lucide-react';

export default function VideoKpiCards({ metrics, onSelectKpi }) {
  const cards = [
    {
      id: 'views',
      title: 'Tổng lượt xem',
      value: (metrics?.totalViews || 125800).toLocaleString('vi-VN'),
      change: '+18.6%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Video,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'likes',
      title: 'Lượt thích',
      value: (metrics?.totalLikes || 8420).toLocaleString('vi-VN'),
      change: '+15.3%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Heart,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    },
    {
      id: 'clicks',
      title: 'Click sản phẩm',
      value: (metrics?.totalClicks || 12540).toLocaleString('vi-VN'),
      change: '+12.4%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: MousePointer,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'orders',
      title: 'Đơn hàng',
      value: (metrics?.totalOrders || 428).toLocaleString('vi-VN'),
      change: '+21.3%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: ShoppingBag,
      bgColor: '#FFF7ED',
      iconColor: '#F97316'
    },
    {
      id: 'revenue',
      title: 'Doanh thu từ Video',
      value: (metrics?.totalRevenue || 85600000).toLocaleString('vi-VN') + ' đ',
      change: '+20.5%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: DollarSign,
      bgColor: '#ECFDF5',
      iconColor: '#059669'
    },
    {
      id: 'affiliate_commission',
      title: 'Hoa hồng Affiliate',
      value: (metrics?.affiliateCommission || 3250000).toLocaleString('vi-VN') + ' đ',
      change: '+14.2%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Percent,
      bgColor: '#FCE7F3',
      iconColor: '#EC4899'
    }
  ];

  return (
    <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div 
            key={card.id} 
            className="finance-kpi-card clickable-card"
            onClick={() => onSelectKpi && onSelectKpi(card.id)}
          >
            <div className="kpi-top-row">
              <div className="kpi-icon-badge" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
                <IconComp size={18} />
              </div>
              <span className="kpi-title-label" style={{ fontSize: '11px' }}>{card.title}</span>
            </div>

            <div className="kpi-value-number" style={{ fontSize: '16px' }}>{card.value}</div>

            <div className="kpi-change-row">
              <span className="change-badge positive" style={{ fontSize: '10px' }}>
                <TrendingUp size={11} /> {card.change}
              </span>
              <span className="subtext" style={{ fontSize: '10px' }}>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
