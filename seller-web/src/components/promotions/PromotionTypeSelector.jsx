import React from 'react';
import { Tag, Store, Ticket, Truck, Zap, Gift, Package, X, ChevronRight } from 'lucide-react';

export default function PromotionTypeSelector({ onClose, onSelectType }) {
  const promoTypes = [
    {
      id: 'discount_product',
      name: 'Giảm giá sản phẩm',
      desc: 'Giảm giá theo % hoặc số tiền cố định cho từng sản phẩm cụ thể',
      condition: 'Áp dụng cho từng SKU chọn từ Product Catalog',
      icon: Tag,
      color: '#00B14F',
      bg: '#E6F4EA'
    },
    {
      id: 'discount_store',
      name: 'Giảm giá toàn shop',
      desc: 'Áp dụng giảm giá đồng loạt cho toàn bộ sản phẩm đang bán tại gian hàng',
      condition: 'Áp dụng tự động cho toàn bộ Đơn hàng',
      icon: Store,
      color: '#F97316',
      bg: '#FFF7ED'
    },
    {
      id: 'voucher',
      name: 'Voucher / Mã giảm giá',
      desc: 'Tạo mã voucher nhập tay hoặc thu thập voucher vào Ví người mua',
      condition: 'Yêu cầu đơn hàng đạt giá trị tối thiểu',
      icon: Ticket,
      color: '#EF4444',
      bg: '#FEF2F2'
    },
    {
      id: 'freeship',
      name: 'Miễn phí vận chuyển (Freeship)',
      desc: 'Shop tài trợ toàn bộ hoặc một phần phí giao hàng cho người mua',
      condition: 'Tối ưu tỷ lệ chốt đơn hàng liên tỉnh',
      icon: Truck,
      color: '#1877F2',
      bg: '#EFF6FF'
    },
    {
      id: 'flash_sale',
      name: 'Flash Sale (Khung giờ vàng)',
      desc: 'Bán giá sốc trong các khung giờ giới hạn để bùng nổ doanh số',
      condition: 'Giới hạn số lượng tồn kho mở bán',
      icon: Zap,
      color: '#9333EA',
      bg: '#F3E8FF'
    },
    {
      id: 'buy_x_get_y',
      name: 'Mua X tặng Y (Mua 1 tặng 1)',
      desc: 'Tặng quà hoặc tặng sản phẩm khi khách mua đủ số lượng X',
      condition: 'Tăng khối lượng bán lẻ nhanh chóng',
      icon: Gift,
      color: '#EC4899',
      bg: '#FCE7F3'
    },
    {
      id: 'combo',
      name: 'Combo sản phẩm (Bundle Deal)',
      desc: 'Mua theo bộ combo 2-3 sản phẩm để nhận ưu đãi giảm giá sâu',
      condition: 'Tăng giá trị giỏ hàng trung bình AOV',
      icon: Package,
      color: '#059669',
      bg: '#ECFDF5'
    }
  ];

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Tag size={20} className="header-icon-green" />
            <h3 className="modal-title">Chọn loại chương trình khuyến mãi</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Chọn hình thức khuyến mãi phù hợp với chiến lược tăng trưởng doanh số của shop:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {promoTypes.map(pt => {
              const IconComp = pt.icon;

              return (
                <div 
                  key={pt.id} 
                  className="report-item-row"
                  style={{ padding: '14px', alignItems: 'flex-start', border: '1px solid var(--border)' }}
                  onClick={() => onSelectType(pt.id, pt.name)}
                >
                  <div className="report-item-left" style={{ gap: '12px' }}>
                    <div className="report-icon-box" style={{ backgroundColor: pt.bg, color: pt.color, width: '40px', height: '40px' }}>
                      <IconComp size={20} />
                    </div>
                    <div className="report-details-text">
                      <strong className="report-title" style={{ fontSize: '14px' }}>{pt.name}</strong>
                      <span className="report-desc" style={{ marginTop: '2px', lineHeight: '1.3' }}>{pt.desc}</span>
                      <span style={{ fontSize: '10px', color: '#00B14F', marginTop: '4px', fontWeight: '700' }}>
                        ✓ {pt.condition}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
