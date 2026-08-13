import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Search, Tag, DollarSign, Calendar, X, AlertCircle } from 'lucide-react';

export default function PromotionCreateWizard({
  selectedTypeName,
  catalogProducts = [],
  onClose,
  onSubmitPromotion
}) {
  const [step, setStep] = useState(1);

  // Form State
  const [promoName, setPromoName] = useState('');
  const [promoCode, setPromoCode] = useState(`KM${Math.floor(1000 + Math.random() * 9000)}`);
  const [startDate, setStartDate] = useState('2026-08-15T09:00');
  const [endDate, setEndDate] = useState('2026-08-22T23:59');

  // Step 2: Selected Catalog Product IDs
  const [selectedProductIds, setSelectedProductIds] = useState(['p1', 'p2']);
  const [productSearch, setProductSearch] = useState('');

  // Step 3: Discount Config
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'amount'
  const [discountValue, setDiscountValue] = useState(20);
  const [limitPerUser, setLimitPerUser] = useState(2);

  // Step 4: Budget
  const [budgetAmount, setBudgetAmount] = useState(2000000);

  const defaultCatalog = catalogProducts && catalogProducts.length > 0 ? catalogProducts : [
    { id: 'p1', name: 'Giày Sneaker Unisex Sport', sku: 'GS-WHT-42', price: 450000, stock: 45 },
    { id: 'p2', name: 'Áo thun nam basic', sku: 'ATB-BLK-M', price: 150000, stock: 128 },
    { id: 'p3', name: 'Sạc dự phòng 20000mAh', sku: 'SDP-20K-BLK', price: 550000, stock: 14 }
  ];

  const filteredCatalog = defaultCatalog.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || p.id.toLowerCase().includes(q);
  });

  const toggleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(i => i !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !promoName.trim()) {
      alert('Vui lòng nhập tên chương trình khuyến mãi!');
      return;
    }
    if (step === 2 && selectedProductIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm từ Product Catalog!');
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final Submit
      const newPromo = {
        id: `km_${Date.now()}`,
        name: promoName,
        code: promoCode,
        type: selectedTypeName || 'Giảm giá sản phẩm',
        status: 'Sắp diễn ra',
        startAt: startDate,
        endAt: endDate,
        time: `${startDate.split('T')[0]} - ${endDate.split('T')[0]}`,
        budget: Number(budgetAmount),
        spent: 0,
        revenue: 0,
        productIds: selectedProductIds,
        badgeText: discountType === 'percent' ? `${discountValue}% OFF` : 'KHUYẾN MÃI'
      };
      onSubmitPromotion(newPromo);
    }
  };

  return (
    <div className="shipping-modal-backdrop" onClick={onClose}>
      <div className="shipping-modal-panel wide-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-bar">
          <div className="header-title-group">
            <Tag size={20} className="header-icon-green" />
            <div>
              <h3 className="modal-title">Tạo chương trình khuyến mãi mới</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Loại: <strong>{selectedTypeName || 'Giảm giá sản phẩm'}</strong>
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)', padding: '12px 20px', gap: '8px' }}>
          {[
            { num: 1, label: 'Thông tin' },
            { num: 2, label: 'Chọn sản phẩm' },
            { num: 3, label: 'Ưu đãi' },
            { num: 4, label: 'Ngân sách' },
            { num: 5, label: 'Xác nhận' }
          ].map(s => (
            <div 
              key={s.num} 
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                fontSize: '12px',
                fontWeight: step === s.num ? '800' : '600',
                color: step === s.num ? '#00B14F' : step > s.num ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <span 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: step === s.num ? '#00B14F' : step > s.num ? '#E6F4EA' : 'var(--border)', 
                  color: step === s.num ? '#fff' : step > s.num ? '#00B14F' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px'
                }}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleNextStep} className="modal-form-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {/* BƯỚC 1: THÔNG TIN CHƯƠNG TRÌNH */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group-field">
                <label className="field-label">Tên chương trình khuyến mãi (*):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  placeholder="VD: Freeship XTRA 8.8 / Giảm 20% toàn shop"
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                />
              </div>

              <div className="form-group-field">
                <label className="field-label">Mã chương trình (Mã Voucher / Mã KM):</label>
                <input 
                  type="text"
                  className="modal-input-control"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-field">
                  <label className="field-label">Thời gian bắt đầu (*):</label>
                  <input 
                    type="datetime-local"
                    className="modal-input-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group-field">
                  <label className="field-label">Thời gian kết thúc (*):</label>
                  <input 
                    type="datetime-local"
                    className="modal-input-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 2: CHỌN SẢN PHẨM TỪ CATALOG */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Đã chọn: <strong className="green-text">{selectedProductIds.length}</strong> sản phẩm từ Product Catalog
                </span>

                <div className="search-input-wrapper" style={{ width: '220px' }}>
                  <Search size={14} className="search-icon" />
                  <input 
                    type="text"
                    className="search-control-input"
                    placeholder="Tìm tên, SKU, ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="tx-table-responsive" style={{ maxHeight: '280px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <table className="tx-master-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>Chọn</th>
                      <th>Sản phẩm Catalog</th>
                      <th>SKU</th>
                      <th>Giá bán</th>
                      <th>Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map(prod => {
                      const isSel = selectedProductIds.includes(prod.id);
                      return (
                        <tr key={prod.id} className={isSel ? 'selected-row' : ''}>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={isSel} 
                              onChange={() => toggleSelectProduct(prod.id)} 
                              className="stylish-checkbox"
                            />
                          </td>
                          <td>
                            <strong className="tx-product-name">{prod.name}</strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ID: {prod.id}</span>
                          </td>
                          <td><code>{prod.sku || 'SKU-001'}</code></td>
                          <td><strong>{(prod.price || 100000).toLocaleString('vi-VN')} đ</strong></td>
                          <td><span className="wh-status-badge">{prod.stock || prod.physicalStock || 50} sp</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BƯỚC 3: THIẾT LẬP ƯU ĐÃI */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group-field">
                <label className="field-label">Hình thức giảm giá:</label>
                <div className="form-row-grid-2">
                  <label className="radio-option-label">
                    <input 
                      type="radio" 
                      name="discountType" 
                      value="percent" 
                      checked={discountType === 'percent'} 
                      onChange={(e) => setDiscountType(e.target.value)} 
                    />
                    <span>Giảm theo phần trăm (%)</span>
                  </label>

                  <label className="radio-option-label">
                    <input 
                      type="radio" 
                      name="discountType" 
                      value="amount" 
                      checked={discountType === 'amount'} 
                      onChange={(e) => setDiscountType(e.target.value)} 
                    />
                    <span>Giảm số tiền cố định (đ)</span>
                  </label>
                </div>
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-field">
                  <label className="field-label">Mức giảm giá (*):</label>
                  <input 
                    type="number"
                    className="modal-input-control"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percent' ? '20%' : '50.000đ'}
                  />
                </div>

                <div className="form-group-field">
                  <label className="field-label">Giới hạn / Khách hàng:</label>
                  <input 
                    type="number"
                    className="modal-input-control"
                    value={limitPerUser}
                    onChange={(e) => setLimitPerUser(e.target.value)}
                    placeholder="2 đơn / khách"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 4: NGÂN SÁCH CHƯƠNG TRÌNH */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group-field">
                <label className="field-label">Tổng ngân sách tài trợ của Shop (*):</label>
                <input 
                  type="number"
                  className="modal-input-control"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="2.000.000 đ"
                />
              </div>

              <div className="stock-hero-breakdown-card">
                <div className="breakdown-grid-metrics">
                  <div className="bk-metric-box">
                    <span className="lbl">Ngân sách cài đặt</span>
                    <strong className="val">{Number(budgetAmount).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div className="bk-metric-box primary-border">
                    <span className="lbl">Dự kiến chi phí tối đa</span>
                    <strong className="val green-text">{Number(budgetAmount).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 5: XÁC NHẬN */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="stock-hero-breakdown-card">
                <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Xác nhận thông tin chương trình khuyến mãi
                </h4>
                <div className="key-value-stack">
                  <div className="kv-row">
                    <span className="k-lbl">Tên chương trình</span>
                    <strong className="v-val green-text">{promoName} ({promoCode})</strong>
                  </div>
                  <div className="kv-row">
                    <span className="k-lbl">Loại khuyến mãi</span>
                    <span className="v-val">{selectedTypeName || 'Giảm giá sản phẩm'}</span>
                  </div>
                  <div className="kv-row">
                    <span className="k-lbl">Thời gian</span>
                    <span className="v-val">{startDate.replace('T', ' ')} đến {endDate.replace('T', ' ')}</span>
                  </div>
                  <div className="kv-row">
                    <span className="k-lbl">Sản phẩm Catalog tham gia</span>
                    <strong className="v-val">{selectedProductIds.length} sản phẩm</strong>
                  </div>
                  <div className="kv-row">
                    <span className="k-lbl">Ưu đãi giảm giá</span>
                    <span className="v-val">{discountType === 'percent' ? `Giảm ${discountValue}%` : `Giảm ${Number(discountValue).toLocaleString('vi-VN')} đ`}</span>
                  </div>
                  <div className="kv-row">
                    <span className="k-lbl">Ngân sách tối đa</span>
                    <strong className="v-val green-text">{Number(budgetAmount).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="modal-actions-footer">
            {step > 1 ? (
              <button type="button" className="nav-btn-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={15} /> Quay lại
              </button>
            ) : (
              <button type="button" className="nav-btn-secondary" onClick={onClose}>
                Hủy
              </button>
            )}

            <button type="submit" className="nav-btn-primary">
              {step < 5 ? (
                <>Tiếp tục <ChevronRight size={15} /></>
              ) : (
                <><CheckCircle2 size={15} /> Tạo chương trình ngay</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
