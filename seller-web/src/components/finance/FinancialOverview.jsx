import React from 'react';
import { Wallet, Clock, TrendingUp, FileText, Percent, ArrowRight } from 'lucide-react';

export default function FinancialOverview({ overview, onOpenWithdrawModal }) {
  const cards = [
    {
      id: 'available',
      title: 'Số dư khả dụng',
      amount: overview?.formattedAvailable || '18.500.000đ',
      subtext: 'Có thể rút ngay',
      actionText: 'Rút tiền',
      actionType: 'withdraw',
      icon: Wallet,
      bgColor: '#E6F4EA',
      iconColor: '#00B14F',
      amountColor: 'var(--text-primary)'
    },
    {
      id: 'pending',
      title: 'Đang chờ đối soát',
      amount: overview?.formattedPending || '5.200.000đ',
      subtext: `Sẽ chuyển vào ${overview?.settlementDate || '15/08/2026'}`,
      actionText: 'Xem chi tiết',
      actionType: 'detail',
      icon: Clock,
      bgColor: '#FFF7ED',
      iconColor: '#F97316',
      amountColor: 'var(--text-primary)'
    },
    {
      id: 'monthly',
      title: 'Doanh thu tháng này',
      amount: overview?.formattedMonthly || '125.800.000đ',
      badgeText: overview?.monthlyGrowth || '+18,6%',
      badgePositive: true,
      subtext: 'So với tháng trước',
      actionText: 'Xem báo cáo',
      actionType: 'report',
      icon: TrendingUp,
      bgColor: '#EFF6FF',
      iconColor: '#1877F2',
      amountColor: 'var(--text-primary)'
    },
    {
      id: 'total',
      title: 'Tổng doanh thu',
      amount: overview?.formattedTotal || '1.268.400.000đ',
      subtext: 'Tất cả thời gian hoạt động',
      actionText: 'Xem chi tiết',
      actionType: 'detail',
      icon: FileText,
      bgColor: '#F3E8FF',
      iconColor: '#9333EA',
      amountColor: 'var(--text-primary)'
    },
    {
      id: 'commission',
      title: 'Tỷ lệ hoa hồng',
      amount: overview?.formattedCommission || '8%',
      subtext: 'Theo danh mục sản phẩm',
      actionText: 'Xem chi tiết',
      actionType: 'detail',
      icon: Percent,
      bgColor: '#FEF2F2',
      iconColor: '#EF4444',
      amountColor: 'var(--text-primary)'
    }
  ];

  return (
    <div className="finance-kpi-cards-grid">
      {cards.map(card => {
        const IconComp = card.icon;

        return (
          <div key={card.id} className="finance-metric-card">
            <div className="card-top-row">
              <div className="finance-icon-badge" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
                <IconComp size={20} />
              </div>
              <span className="card-title-label">{card.title}</span>
            </div>

            <div className="card-amount-row">
              <span className="card-amount-value" style={{ color: card.amountColor }}>
                {card.amount}
              </span>
              {card.badgeText && (
                <span className={`growth-badge ${card.badgePositive ? 'positive' : 'negative'}`}>
                  ↑ {card.badgeText}
                </span>
              )}
            </div>

            <div className="card-footer-row">
              <span className="card-subtext">{card.subtext}</span>

              {card.actionType === 'withdraw' ? (
                <button className="card-action-link-btn primary-link" onClick={onOpenWithdrawModal}>
                  {card.actionText} <ArrowRight size={13} />
                </button>
              ) : (
                <button 
                  className="card-action-link-btn"
                  onClick={() => alert(`Tính năng ${card.actionText} đang được tải...`)}
                >
                  {card.actionText} <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
