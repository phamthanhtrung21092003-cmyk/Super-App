import React from 'react';
import { Package, Clock, Truck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function OrderMetrics({ metrics }) {
  const isZero = !metrics || metrics.total === 0;

  const metricCards = [
    {
      id: 'total',
      title: 'Tổng đơn',
      count: metrics?.total || 0,
      subtext: isZero ? 'Chưa có đơn hàng' : '📈 +12% so với 7 ngày trước',
      icon: Package,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F'
    },
    {
      id: 'confirm',
      title: 'Chờ xác nhận',
      count: metrics?.confirm || 0,
      subtext: isZero ? 'Chưa có đơn mới' : '⏱️ Cần xử lý ngay',
      icon: Clock,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      badgeAlert: true
    },
    {
      id: 'pickup',
      title: 'Chờ lấy hàng',
      count: metrics?.pickup || 0,
      subtext: isZero ? 'Chưa có đơn chờ lấy' : '📦 Trong 24h',
      icon: Truck,
      bgColor: '#FFF7ED',
      iconColor: '#F97316'
    },
    {
      id: 'delivering',
      title: 'Đang giao',
      count: metrics?.delivering || 0,
      subtext: isZero ? 'Chưa có đơn đang giao' : '🚛 Đang vận chuyển',
      icon: RefreshCw,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2'
    },
    {
      id: 'completed',
      title: 'Hoàn thành',
      count: metrics?.completed || 0,
      subtext: isZero ? 'Chưa có đơn hoàn thành' : '✅ 97.2% giao đúng hẹn',
      icon: CheckCircle2,
      bgColor: '#F0FDF4',
      iconColor: '#16A34A'
    },
    {
      id: 'cancelled',
      title: 'Đơn hủy',
      count: metrics?.cancelled || 0,
      subtext: isZero ? '0 đơn bị hủy' : '❌ 4.2% tỷ lệ hủy',
      icon: XCircle,
      bgColor: '#FEF2F2',
      iconColor: '#DC2626'
    }
  ];

  return (
    <div className="order-metrics-grid">
      {metricCards.map(card => {
        const IconComp = card.icon;

        return (
          <div key={card.id} className="order-mini-kpi-card">
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
