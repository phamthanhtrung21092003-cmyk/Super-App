import React from 'react';
import { DollarSign, ShoppingBag, Tag, Eye, Award, TrendingUp } from 'lucide-react';

export default function ReportKpiCards({ metrics, isNewShop = false }) {
  const cards = [
    {
      id: 'revenue',
      title: 'Doanh thu',
      value: isNewShop ? '0 đ' : (metrics?.revenue || 156780000).toLocaleString('vi-VN') + ' đ',
      change: isNewShop ? '0%' : '+31.4%',
      isPositive: true,
      subtext: 'so với 31/07 - 06/08',
      icon: DollarSign,
      bgColor: '#ECFDF5',
      iconColor: '#059669'
    },
    {
      id: 'orders',
      title: 'Đơn hàng',
      value: isNewShop ? '0' : (metrics?.orders || 1248).toLocaleString('vi-VN'),
      change: isNewShop ? '0%' : '+26.8%',
      isPositive: true,
      subtext: 'so với 31/07 - 06/08',
      icon: ShoppingBag,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'aov',
      title: 'Giá trị đơn hàng TB',
      value: isNewShop ? '0 đ' : (metrics?.aov || 125450).toLocaleString('vi-VN') + ' đ',
      change: isNewShop ? '0%' : '+3.6%',
      isPositive: true,
      subtext: 'so với 31/07 - 06/08',
      icon: Tag,
      bgColor: '#FFF7ED',
      iconColor: '#F97316'
    },
    {
      id: 'visits',
      title: 'Lượt truy cập',
      value: isNewShop ? '0' : (metrics?.visits || 82450).toLocaleString('vi-VN'),
      change: isNewShop ? '0%' : '+18.6%',
      isPositive: true,
      subtext: 'so với 31/07 - 06/08',
      icon: Eye,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    },
    {
      id: 'conversion',
      title: 'Tỷ lệ chuyển đổi',
      value: isNewShop ? '0%' : (metrics?.conversion || '2,12%'),
      change: isNewShop ? '0%' : '+6.2%',
      isPositive: true,
      subtext: 'so với 31/07 - 06/08',
      icon: Award,
      bgColor: '#FCE7F3',
      iconColor: '#EC4899'
    }
  ];

  return (
    <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div key={card.id} className="finance-kpi-card">
            <div className="kpi-top-row">
              <div className="kpi-icon-badge" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
                <IconComp size={18} />
              </div>
              <span className="kpi-title-label" style={{ fontSize: '11px' }}>{card.title}</span>
            </div>

            <div className="kpi-value-number" style={{ fontSize: '17px' }}>{card.value}</div>

            <div className="kpi-change-row">
              <span className={`change-badge ${isNewShop ? '' : 'positive'}`} style={{ fontSize: '10px' }}>
                {!isNewShop && <TrendingUp size={11} />} {card.change}
              </span>
              <span className="subtext" style={{ fontSize: '10px' }}>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
