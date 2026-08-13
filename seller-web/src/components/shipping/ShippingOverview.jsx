import React from 'react';
import { Package, Truck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function ShippingOverview({ overview, onFilterStatus }) {
  const cards = [
    {
      id: 'pickup',
      title: 'Chờ lấy hàng',
      count: overview?.pendingPickup || 24,
      subtext: 'vận đơn',
      icon: Package,
      bgColor: '#FFF7ED',
      iconColor: '#F97316',
      statusFilter: 'Chờ lấy hàng'
    },
    {
      id: 'delivering',
      title: 'Đang vận chuyển',
      count: overview?.delivering || 31,
      subtext: 'vận đơn',
      icon: Truck,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2',
      statusFilter: 'Đang vận chuyển'
    },
    {
      id: 'delivered',
      title: 'Đã giao',
      count: overview?.success || 86,
      subtext: 'vận đơn',
      icon: CheckCircle2,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F',
      statusFilter: 'Đã giao'
    },
    {
      id: 'failed',
      title: 'Giao thất bại',
      count: overview?.failed || 4,
      subtext: 'vận đơn',
      icon: AlertTriangle,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      statusFilter: 'Giao thất bại'
    },
    {
      id: 'returned',
      title: 'Đơn hoàn',
      count: overview?.returned || 3,
      subtext: 'vận đơn',
      icon: RotateCcw,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA',
      statusFilter: 'Đã hoàn'
    }
  ];

  return (
    <div className="shipping-overview-grid">
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div 
            key={card.id} 
            className="shipping-kpi-card clickable-card"
            onClick={() => onFilterStatus && onFilterStatus(card.statusFilter)}
          >
            <div className="kpi-icon-badge" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
              <IconComp size={20} />
            </div>

            <div className="kpi-details-block">
              <span className="kpi-title">{card.title}</span>
              <div className="kpi-count-row">
                <span className="kpi-number">{card.count}</span>
                <span className="kpi-unit">{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
