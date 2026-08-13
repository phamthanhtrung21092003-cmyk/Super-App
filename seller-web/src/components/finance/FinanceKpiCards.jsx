import React from 'react';
import { ShoppingBag, Package, Percent, Truck, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function FinanceKpiCards({ data, onSelectCard }) {
  const cards = [
    {
      id: 'net_revenue',
      title: 'Doanh thu thuần',
      value: '248.320.000 đ',
      change: '+18.6%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: ShoppingBag,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    },
    {
      id: 'gross_sales',
      title: 'Tiền hàng',
      value: '230.450.000 đ',
      change: '+16.2%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: Package,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'platform_fee',
      title: 'Phí sàn',
      value: '-12.560.000 đ',
      change: '+8.4%',
      isPositive: true,
      subtext: 'so với kỳ trước',
      icon: Percent,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444'
    },
    {
      id: 'shipping_fee',
      title: 'Phí vận chuyển',
      value: '-5.310.000 đ',
      change: '-2.1%',
      isPositive: false,
      subtext: 'so với kỳ trước',
      icon: Truck,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'net_profit',
      title: 'Lợi nhuận ước tính',
      value: '62.850.000 đ',
      change: '+20.3%',
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
            onClick={() => onSelectCard && onSelectCard(card.id)}
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
                {card.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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
