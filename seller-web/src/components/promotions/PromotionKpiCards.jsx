import React from 'react';
import { Tag, Gift, Clock, CheckCircle2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function PromotionKpiCards({ metrics, onSelectKpi }) {
  const cards = [
    {
      id: 'total',
      title: 'Tổng chương trình',
      value: metrics?.total || 18,
      change: '+12.5%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: Tag,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'active',
      title: 'Đang diễn ra',
      value: metrics?.active || 6,
      change: '+20%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: Gift,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'upcoming',
      title: 'Sắp diễn ra',
      value: metrics?.upcoming || 3,
      change: '—',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: Clock,
      bgColor: '#FFF7ED',
      iconColor: '#F97316'
    },
    {
      id: 'ended',
      title: 'Đã kết thúc',
      value: metrics?.ended || 9,
      change: '-10%',
      isPositive: false,
      subtext: 'so với kỳ trước',
      icon: CheckCircle2,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    },
    {
      id: 'cost',
      title: 'Tổng chi phí KM',
      value: '12.450.000 đ',
      change: '+8.3%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: DollarSign,
      bgColor: '#ECFDF5',
      iconColor: '#059669'
    }
  ];

  return (
    <div className="finance-kpi-grid">
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
              <span className="kpi-title-label">{card.title}</span>
            </div>

            <div className="kpi-value-number">{card.value}</div>

            <div className="kpi-change-row">
              <span className={`change-badge ${card.isPositive ? 'positive' : 'negative'}`}>
                {card.isPositive && card.change !== '—' && <TrendingUp size={12} />}
                {!card.isPositive && card.change !== '—' && <TrendingDown size={12} />}
                {card.change}
              </span>
              <span className="subtext">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
