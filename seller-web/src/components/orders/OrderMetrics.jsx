import React from 'react';
import { Package, Clock, Box, Truck, Send } from 'lucide-react';

export default function OrderMetrics({ metrics, onSelectKpiTab }) {
  const isZero = !metrics || metrics.total === 0;

  const metricCards = [
    {
      id: 'all',
      title: 'Tất cả',
      count: isZero ? 0 : (metrics?.total || 128),
      subtext: isZero ? 'Chưa có đơn hàng' : '📈 Toàn bộ đơn hàng',
      icon: Package,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'confirm',
      title: 'Chờ xác nhận',
      count: isZero ? 0 : (metrics?.confirm || 24),
      subtext: isZero ? 'Chưa có đơn mới' : '⏱️ Cần xác nhận ngay',
      icon: Clock,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      badgeAlert: !isZero && (metrics?.confirm > 0 || 24 > 0)
    },
    {
      id: 'packing',
      title: 'Chờ đóng gói',
      count: isZero ? 0 : (metrics?.packing || 18),
      subtext: isZero ? 'Chưa có đơn đóng gói' : '📦 Cần chuẩn bị hàng',
      icon: Box,
      bgColor: '#FFF7ED',
      iconColor: '#F97316'
    },
    {
      id: 'handover',
      title: 'Chờ bàn giao',
      count: isZero ? 0 : (metrics?.handover || 12),
      subtext: isZero ? 'Chưa có đơn bàn giao' : '🚛 Sẵn sàng gửi ĐVVC',
      icon: Truck,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'delivering',
      title: 'Đang giao',
      count: isZero ? 0 : (metrics?.delivering || 36),
      subtext: isZero ? 'Chưa có đơn đang giao' : '⚡ Đang vận chuyển',
      icon: Send,
      bgColor: '#F5F3FF',
      iconColor: '#8B5CF6'
    }
  ];

  return (
    <div className="order-metrics-grid">
      {metricCards.map(card => {
        const IconComp = card.icon;

        return (
          <div 
            key={card.id} 
            className="order-mini-kpi-card"
            onClick={() => onSelectKpiTab && onSelectKpiTab(card.id)}
            style={{ cursor: onSelectKpiTab ? 'pointer' : 'default' }}
            title={`Lọc theo ${card.title}`}
          >
            <div className="mini-card-header-row">
              <span className="mini-card-title">{card.title}</span>
              <div className="mini-card-icon-wrapper" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
                <IconComp size={16} />
              </div>
            </div>

            <div className="mini-card-val-row">
              <span className="mini-card-val">{card.count}</span>
            </div>

            <span className="mini-card-subtext">{card.subtext}</span>
          </div>
        );
      })}
    </div>
  );
}
