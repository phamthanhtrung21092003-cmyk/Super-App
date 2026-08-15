import React, { useState } from 'react';
import { 
  DollarSign, ShoppingBag, ClipboardList, PackageCheck, 
  Users, ChevronDown 
} from 'lucide-react';

export default function KpiCards({ kpiData, onPeriodChange, onNavigateTab, onActionClick }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const handleSelectPeriod = (e) => {
    const val = e.target.value;
    setSelectedPeriod(val);
    if (onPeriodChange) onPeriodChange(val);
  };

  const handleCardClick = (m) => {
    if (m.hasPeriodSelector) return;
    if (m.id === 'revenue' && onNavigateTab) onNavigateTab('analytics');
    if (m.id === 'orders' && onNavigateTab) onNavigateTab('orders');
    if (m.id === 'pending') {
      if (onActionClick) onActionClick('orders', 'confirm');
      else if (onNavigateTab) onNavigateTab('orders');
    }
    if (m.id === 'itemsSold' && onNavigateTab) onNavigateTab('products');
  };

  const metrics = [
    {
      id: 'revenue',
      title: 'Doanh thu hôm nay',
      value: kpiData?.revenue?.formatted || '12.580.000đ',
      trendText: `↑ ${kpiData?.revenue?.changePercent || 18.5}% so với hôm qua`,
      isPositive: kpiData?.revenue?.isPositive !== false,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F',
      icon: DollarSign,
      clickable: true
    },
    {
      id: 'orders',
      title: 'Đơn hàng hôm nay',
      value: kpiData?.orders?.formatted || '128',
      trendText: `↑ ${kpiData?.orders?.changePercent || 12}% so với hôm qua`,
      isPositive: kpiData?.orders?.isPositive !== false,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2',
      icon: ShoppingBag,
      clickable: true
    },
    {
      id: 'pending',
      title: 'Đang xử lý',
      value: kpiData?.pending?.formatted || '36',
      trendText: `↑ ${kpiData?.pending?.diffCount || 5} đơn so với hôm qua`,
      isPositive: kpiData?.pending?.isPositive !== false,
      bgColor: '#FFF7ED',
      iconColor: '#F97316',
      icon: ClipboardList,
      clickable: true
    },
    {
      id: 'itemsSold',
      title: 'Sản phẩm bán ra',
      value: kpiData?.itemsSold?.formatted || '84',
      trendText: `↑ ${kpiData?.itemsSold?.changePercent || 10}% so với hôm qua`,
      isPositive: kpiData?.itemsSold?.isPositive !== false,
      bgColor: '#F3E8FF',
      iconColor: '#A855F7',
      icon: PackageCheck,
      clickable: true
    },
    {
      id: 'customers',
      title: 'Khách hàng',
      value: kpiData?.customers?.formatted || '1.245',
      trendText: `↑ ${kpiData?.customers?.changePercent || 8.2}% so với hôm qua`,
      isPositive: kpiData?.customers?.isPositive !== false,
      bgColor: '#E0F2FE',
      iconColor: '#0284C7',
      icon: Users,
      hasPeriodSelector: true
    }
  ];

  return (
    <div className="kpi-cards-grid-row">
      {metrics.map(m => {
        const IconComponent = m.icon;

        return (
          <div 
            key={m.id} 
            className={`kpi-metric-card ${m.clickable ? 'is-clickable' : ''}`}
            onClick={() => handleCardClick(m)}
            role={m.clickable ? "button" : "region"}
            tabIndex={m.clickable ? 0 : undefined}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(m)}
          >
            {/* Header: Icon + Period selector (if applicable) */}
            <div className="kpi-card-header">
              <div 
                className="kpi-icon-wrapper" 
                style={{ backgroundColor: m.bgColor, color: m.iconColor }}
              >
                <IconComponent size={20} />
              </div>

              {m.hasPeriodSelector && (
                <div 
                  className="kpi-period-dropdown-wrapper" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <select 
                    value={selectedPeriod} 
                    onChange={handleSelectPeriod}
                    className="kpi-period-select"
                    aria-label="Chọn khoảng thời gian cho chỉ số khách hàng"
                  >
                    <option value="today">Hôm nay</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="30days">30 ngày qua</option>
                  </select>
                  <ChevronDown size={12} className="select-chevron" />
                </div>
              )}
            </div>

            {/* Content: Title, Big Value, Trend */}
            <div className="kpi-card-body">
              <span className="kpi-card-title">{m.title}</span>
              <div className="kpi-card-value">{m.value}</div>
              <div className={`kpi-card-trend ${m.isPositive ? 'trend-up' : 'trend-down'}`}>
                {m.trendText}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
