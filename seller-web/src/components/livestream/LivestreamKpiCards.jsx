import React from 'react';
import { Calendar, Eye, Heart, ShoppingBag, DollarSign, Radio, TrendingUp } from 'lucide-react';

export default function LivestreamKpiCards({ metrics, onSelectKpi }) {
  const cards = [
    {
      id: 'total_sessions',
      title: 'Buổi livestream',
      value: (metrics?.totalSessions || 28).toLocaleString('vi-VN'),
      change: '+27.3%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Calendar,
      bgColor: '#FCE7F3',
      iconColor: '#EC4899'
    },
    {
      id: 'total_views',
      title: 'Tổng lượt xem',
      value: (metrics?.totalViews || 256450).toLocaleString('vi-VN'),
      change: '+18.6%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Eye,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'total_likes',
      title: 'Lượt thích',
      value: (metrics?.totalLikes || 18920).toLocaleString('vi-VN'),
      change: '+23.1%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: Heart,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    },
    {
      id: 'total_orders',
      title: 'Đơn hàng',
      value: (metrics?.totalOrders || 1248).toLocaleString('vi-VN'),
      change: '+26.8%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: ShoppingBag,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'total_revenue',
      title: 'Doanh thu từ livestream',
      value: (metrics?.totalRevenue || 156780000).toLocaleString('vi-VN') + ' đ',
      change: '+31.4%',
      isPositive: true,
      subtext: 'so với 7 ngày trước',
      icon: DollarSign,
      bgColor: '#ECFDF5',
      iconColor: '#059669'
    },
    {
      id: 'live_now',
      title: 'Đang livestream',
      value: (metrics?.liveNowCount || 2).toString(),
      change: '🔴 LIVE',
      isPositive: true,
      subtext: 'ngay bây giờ',
      icon: Radio,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444'
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
              <span className={`change-badge ${card.id === 'live_now' ? 'danger-item' : 'positive'}`} style={{ fontSize: '10px' }}>
                {card.id !== 'live_now' && <TrendingUp size= {11} />} {card.change}
              </span>
              <span className="subtext" style={{ fontSize: '10px' }}>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
