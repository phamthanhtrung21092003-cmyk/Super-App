import React from 'react';
import { MousePointer, ShoppingBag, DollarSign, Percent, TrendingUp } from 'lucide-react';

export default function AffiliateOverview() {
  const kpis = [
    { title: 'Lượt click Affiliate', value: '4.280', icon: MousePointer, color: '#1877F2', bg: '#EFF6FF' },
    { title: 'Đơn hàng Affiliate', value: '86 đơn', icon: ShoppingBag, color: '#F97316', bg: '#FFF7ED' },
    { title: 'Doanh thu phát sinh', value: '12.800.000 đ', icon: DollarSign, color: '#00B14F', bg: '#E6F4EA' },
    { title: 'Hoa hồng ước tính (5%)', value: '640.000 đ', icon: Percent, color: '#EC4899', bg: '#FCE7F3' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
      {/* 4 Affiliate KPI Cards */}
      <div className="finance-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="finance-kpi-card">
              <div className="kpi-top-row">
                <div className="kpi-icon-badge" style={{ backgroundColor: card.bg, color: card.color }}>
                  <IconComp size={18} />
                </div>
                <span className="kpi-title-label">{card.title}</span>
              </div>
              <div className="kpi-value-number">{card.value}</div>
              <div className="kpi-change-row">
                <span className="change-badge positive" style={{ fontSize: '10px' }}>
                  <TrendingUp size={11} /> +15.8%
                </span>
                <span className="subtext" style={{ fontSize: '10px' }}>so với 7 ngày trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Conversion Graph */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Phễu chuyển đổi Affiliate Video</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF' }}>1. Lượt click vào link sản phẩm Affiliate</span>
            <strong style={{ fontSize: '15px', color: '#1E40AF' }}>4.280 clicks (100%)</strong>
          </div>

          <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '12px', width: '80%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#9A3412' }}>2. Số đơn hàng thanh toán thành công</span>
            <strong style={{ fontSize: '15px', color: '#9A3412' }}>86 đơn (2.01%)</strong>
          </div>

          <div style={{ background: '#FCE7F3', border: '1px solid #FBCFE8', borderRadius: '10px', padding: '12px', width: '60%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#9D174D' }}>3. Hoa hồng thực nhận (5% Commission)</span>
            <strong style={{ fontSize: '15px', color: '#9D174D' }}>640.000 đ</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
