import React from 'react';
import { Sparkles, Zap, Package, Truck, ChevronRight } from 'lucide-react';

export default function PromotionSuggestions({ onCreateType }) {
  const suggestions = [
    {
      id: 'freeship',
      title: 'Tạo chương trình freeship',
      desc: 'Freeship giúp tăng tỷ lệ chuyển đổi',
      icon: Truck,
      type: 'freeship'
    },
    {
      id: 'flash_sale',
      title: 'Flash Sale cuối tuần',
      desc: 'Tăng doanh thu nhanh chóng',
      icon: Zap,
      type: 'flash_sale'
    },
    {
      id: 'combo',
      title: 'Combo sản phẩm',
      desc: 'Tăng giá trị đơn hàng trung bình',
      icon: Package,
      type: 'combo'
    }
  ];

  return (
    <div className="finance-chart-card promotion-suggestions-card">
      <div className="card-header-row">
        <h3 className="card-heading-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} style={{ color: '#00B14F' }} /> Gợi ý cho bạn
        </h3>
      </div>

      <div className="reports-stack-list" style={{ marginTop: '12px' }}>
        {suggestions.map(sug => {
          const IconComp = sug.icon;

          return (
            <div key={sug.id} className="report-item-row" style={{ cursor: 'default' }}>
              <div className="report-item-left">
                <div className="report-icon-box" style={{ color: '#00B14F', backgroundColor: '#E6F4EA' }}>
                  <IconComp size={15} />
                </div>
                <div className="report-details-text">
                  <strong className="report-title">{sug.title}</strong>
                  <span className="report-desc">{sug.desc}</span>
                </div>
              </div>

              <button 
                className="nav-btn-primary" 
                style={{ fontSize: '11px', padding: '4px 10px', height: 'auto' }}
                onClick={() => onCreateType && onCreateType(sug.type)}
              >
                Tạo ngay
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <button 
          className="nav-btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
          onClick={() => alert('Đang xem thêm gợi ý khuyến mãi cá nhân hóa cho Shop...')}
        >
          Xem thêm gợi ý <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
