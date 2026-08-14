import React from 'react';
import { Radio, Eye, Calendar, TrendingUp, Smartphone, ArrowRight, Play } from 'lucide-react';

export default function LivestreamOverviewChart({ 
  liveNowList = [], 
  upcomingList = [], 
  onOpenLiveControl, 
  onOpenSuperApp 
}) {
  const defaultLiveNow = liveNowList.length > 0 ? liveNowList : [
    {
      id: 'LIVE001',
      title: 'Top deal cuối tuần - Giảm đến 50%',
      hostName: 'MC Linh',
      viewers: '45.680',
      thumb: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'
    },
    {
      id: 'LIVE002',
      title: 'Review đồ gia dụng thông minh',
      hostName: 'MC Hoàng',
      viewers: '38.750',
      thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'
    }
  ];

  const defaultUpcoming = upcomingList.length > 0 ? upcomingList : [
    { id: 'LIVE006', title: 'Flash Sale 15.8 - Giá hủy diệt', date: '15/08/2026 20:00', hostName: 'MC Linh' },
    { id: 'LIVE007', title: 'Mẹo nhà bếp - Nấu ngon mỗi ngày', date: '16/08/2026 11:00', hostName: 'MC Hương' },
    { id: 'LIVE008', title: 'Thời trang thu đông - Mới nhất', date: '17/08/2026 19:30', hostName: 'MC Hoàng' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Livestream đang diễn ra (Live Now Cards) */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
            Livestream đang diễn ra
          </h3>
          <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Xem tất cả &gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {defaultLiveNow.map(item => (
            <div key={item.id} className="report-item-row" style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
              <div style={{ position: 'relative', width: '54px', height: '65px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '2px', left: '2px', background: '#EF4444', color: '#fff', fontSize: '8px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px' }}>
                  🔴 LIVE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }} className="truncate-text">{item.title}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.hostName}</span>
                <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Eye size={11} /> {item.viewers} lượt xem
                </span>
              </div>

              <button 
                className="action-small-btn nav-btn-primary" 
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => onOpenLiveControl && onOpenLiveControl(item)}
              >
                Vào Studio
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Hiệu quả livestream (Trend Line Sparkline Graph) */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Hiệu quả Livestream</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>7 ngày qua</span>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tổng lượt xem:</span>
            <strong style={{ color: '#1877F2' }}>256.450 (+18.6%)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Doanh thu phát sinh:</span>
            <strong className="green-text">156.780.000 đ (+31.4%)</strong>
          </div>

          <svg viewBox="0 0 300 70" style={{ width: '100%', height: '60px', marginTop: '6px' }}>
            <path d="M0,50 Q30,30 60,40 T120,20 T180,35 T240,10 T300,25" fill="none" stroke="#EF4444" strokeWidth="2.5" />
            <circle cx="240" cy="10" r="4" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* 3. Livestream sắp diễn ra (Upcoming List) */}
      <div className="finance-chart-card">
        <div className="card-header-row">
          <h3 className="card-heading-title">Livestream sắp diễn ra</h3>
          <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Xem lịch &gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {defaultUpcoming.map(u => (
            <div key={u.id} className="report-item-row" style={{ padding: '8px 10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={16} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }} className="truncate-text">{u.title}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.date} • {u.hostName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Super App Integration Card Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Smartphone size={20} style={{ color: '#00B14F' }} />
          <strong style={{ fontSize: '13px' }}>Livestream trên V-life Super App</strong>
        </div>
        <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4', marginBottom: '12px' }}>
          Các buổi livestream sẽ tự động hiển thị trực tiếp trong mục <strong>Video + Livestream Feed</strong> của Super App.
        </p>
        <button 
          className="nav-btn-primary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '8px' }}
          onClick={onOpenSuperApp}
        >
          <Play size={13} /> Xem thử trên V-life Super App
        </button>
      </div>
    </div>
  );
}
