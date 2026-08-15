import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Zap, Check, Hash, DollarSign, Package } from 'lucide-react';

export default function ProductVariants({ formData, onChange }) {
  const [hasVariants, setHasVariants] = useState(
    Boolean(formData.hasVariants || (formData.variantGroups && formData.variantGroups.length > 0) || formData.variants)
  );

  const [group1Name, setGroup1Name] = useState(formData.variantGroup1Name || 'Màu sắc');
  const [group1Options, setGroup1Options] = useState(formData.variantGroup1Options || ['Đen', 'Trắng', 'Xanh Navy']);
  const [newOption1, setNewOption1] = useState('');

  const [hasGroup2, setHasGroup2] = useState(Boolean(formData.variantGroup2Options && formData.variantGroup2Options.length > 0));
  const [group2Name, setGroup2Name] = useState(formData.variantGroup2Name || 'Kích thước');
  const [group2Options, setGroup2Options] = useState(formData.variantGroup2Options || ['M', 'L', 'XL']);
  const [newOption2, setNewOption2] = useState('');

  // Batch Apply State
  const [batchPrice, setBatchPrice] = useState('');
  const [batchStock, setBatchStock] = useState('');
  const [batchSkuPrefix, setBatchSkuPrefix] = useState('ATN');

  // Variant Matrix Items
  const [matrixItems, setMatrixItems] = useState(formData.variantMatrix || []);

  // Recalculate Matrix combinations whenever groups change
  useEffect(() => {
    if (!hasVariants) {
      onChange('hasVariants', false);
      onChange('variants', '');
      return;
    }

    onChange('hasVariants', true);
    onChange('variantGroup1Name', group1Name);
    onChange('variantGroup1Options', group1Options);
    onChange('variantGroup2Name', hasGroup2 ? group2Name : '');
    onChange('variantGroup2Options', hasGroup2 ? group2Options : []);

    const combinations = [];
    const basePrice = formData.price || '189000';
    const baseStock = formData.stock || '50';

    if (group1Options.length > 0) {
      if (hasGroup2 && group2Options.length > 0) {
        group1Options.forEach(opt1 => {
          group2Options.forEach(opt2 => {
            const key = `${opt1}-${opt2}`;
            const existing = matrixItems.find(m => m.key === key);
            combinations.push(existing || {
              key,
              opt1,
              opt2,
              price: basePrice,
              stock: baseStock,
              sku: `${batchSkuPrefix || 'SKU'}-${opt1.substring(0, 3).toUpperCase()}-${opt2}`
            });
          });
        });
      } else {
        group1Options.forEach(opt1 => {
          const key = opt1;
          const existing = matrixItems.find(m => m.key === key);
          combinations.push(existing || {
            key,
            opt1,
            opt2: '',
            price: basePrice,
            stock: baseStock,
            sku: `${batchSkuPrefix || 'SKU'}-${opt1.substring(0, 3).toUpperCase()}`
          });
        });
      }
    }

    setMatrixItems(combinations);
    onChange('variantMatrix', combinations);

    // Sync summary string to formData.variants
    const summaryStr = combinations.map(c => `${c.opt1}${c.opt2 ? ' / ' + c.opt2 : ''}`).join(', ');
    onChange('variants', summaryStr);

    // Calculate total stock from variants
    const totalStock = combinations.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
    if (totalStock > 0) {
      onChange('stock', totalStock.toString());
    }
  }, [hasVariants, group1Name, group1Options, hasGroup2, group2Name, group2Options]);

  const handleAddOption1 = () => {
    if (!newOption1.trim()) return;
    if (!group1Options.includes(newOption1.trim())) {
      setGroup1Options([...group1Options, newOption1.trim()]);
    }
    setNewOption1('');
  };

  const handleRemoveOption1 = (opt) => {
    if (group1Options.length <= 1) {
      alert('Cần có ít nhất 1 giá trị phân loại!');
      return;
    }
    setGroup1Options(group1Options.filter(o => o !== opt));
  };

  const handleAddOption2 = () => {
    if (!newOption2.trim()) return;
    if (!group2Options.includes(newOption2.trim())) {
      setGroup2Options([...group2Options, newOption2.trim()]);
    }
    setNewOption2('');
  };

  const handleRemoveOption2 = (opt) => {
    if (group2Options.length <= 1) {
      alert('Cần có ít nhất 1 giá trị phân loại!');
      return;
    }
    setGroup2Options(group2Options.filter(o => o !== opt));
  };

  const handleApplyBatch = () => {
    if (!batchPrice && !batchStock && !batchSkuPrefix) return;

    const updated = matrixItems.map(item => ({
      ...item,
      price: batchPrice ? batchPrice : item.price,
      stock: batchStock ? batchStock : item.stock,
      sku: batchSkuPrefix ? `${batchSkuPrefix}-${item.opt1.substring(0, 3).toUpperCase()}${item.opt2 ? '-' + item.opt2 : ''}` : item.sku
    }));

    setMatrixItems(updated);
    onChange('variantMatrix', updated);

    if (batchPrice) onChange('price', batchPrice);
    const totalStock = updated.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
    onChange('stock', totalStock.toString());
  };

  const handleMatrixFieldChange = (key, field, value) => {
    const updated = matrixItems.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setMatrixItems(updated);
    onChange('variantMatrix', updated);

    if (field === 'stock') {
      const totalStock = updated.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
      onChange('stock', totalStock.toString());
    }
  };

  return (
    <div className="form-step-card">
      <div className="step-card-header">
        <div className="step-icon-badge">
          <Layers size={20} />
        </div>
        <div className="step-header-text">
          <h3 className="step-card-title">3. SKU & Phân loại sản phẩm (Biến thể)</h3>
          <p className="step-card-desc">Thiết lập các nhóm phân loại như Màu sắc, Kích cỡ, Dung lượng giúp người mua dễ dàng lựa chọn.</p>
        </div>

        <div className="variant-toggle-wrapper">
          <label className="toggle-switch-card">
            <input 
              type="checkbox" 
              checked={hasVariants} 
              onChange={(e) => setHasVariants(e.target.checked)} 
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text-label">
              {hasVariants ? 'Đang bật phân loại' : 'Không có phân loại'}
            </span>
          </label>
        </div>
      </div>

      {hasVariants ? (
        <div className="variants-setup-body">
          {/* Nhóm phân loại 1 */}
          <div className="variant-group-box">
            <div className="group-header-row">
              <span className="group-badge">Nhóm phân loại 1</span>
              <input 
                type="text" 
                value={group1Name} 
                onChange={(e) => setGroup1Name(e.target.value)} 
                placeholder="Tên nhóm (ví dụ: Màu sắc, Họa tiết...)"
                className="stylish-group-name-input"
              />
            </div>

            <div className="options-tag-cloud">
              {group1Options.map(opt => (
                <span key={opt} className="option-tag-pill">
                  {opt}
                  <button type="button" onClick={() => handleRemoveOption1(opt)} title="Xóa tùy chọn này">
                    ×
                  </button>
                </span>
              ))}

              <div className="add-option-inline-input">
                <input 
                  type="text" 
                  placeholder="+ Thêm màu (Đỏ, Vàng...)" 
                  value={newOption1} 
                  onChange={(e) => setNewOption1(e.target.value)}
                  onKeyDown={(e) => (e.key === 'Enter') && (e.preventDefault(), handleAddOption1())}
                />
                <button type="button" onClick={handleAddOption1} className="add-opt-btn">
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Nhóm phân loại 2 */}
          {hasGroup2 ? (
            <div className="variant-group-box">
              <div className="group-header-row">
                <span className="group-badge">Nhóm phân loại 2</span>
                <input 
                  type="text" 
                  value={group2Name} 
                  onChange={(e) => setGroup2Name(e.target.value)} 
                  placeholder="Tên nhóm (ví dụ: Kích thước, Dung lượng...)"
                  className="stylish-group-name-input"
                />
                <button 
                  type="button" 
                  className="remove-group-btn"
                  onClick={() => setHasGroup2(false)}
                >
                  <Trash2 size={14} /> Xóa nhóm 2
                </button>
              </div>

              <div className="options-tag-cloud">
                {group2Options.map(opt => (
                  <span key={opt} className="option-tag-pill">
                    {opt}
                    <button type="button" onClick={() => handleRemoveOption2(opt)}>×</button>
                  </span>
                ))}

                <div className="add-option-inline-input">
                  <input 
                    type="text" 
                    placeholder="+ Thêm size (S, M, L...)" 
                    value={newOption2} 
                    onChange={(e) => setNewOption2(e.target.value)}
                    onKeyDown={(e) => (e.key === 'Enter') && (e.preventDefault(), handleAddOption2())}
                  />
                  <button type="button" onClick={handleAddOption2} className="add-opt-btn">
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              type="button" 
              className="add-group2-button-dashed"
              onClick={() => setHasGroup2(true)}
            >
              <Plus size={16} /> + Thêm nhóm phân loại 2 (Kích thước / Size / Dung lượng)
            </button>
          )}

          {/* Batch Apply Toolbar */}
          <div className="batch-apply-toolbar">
            <div className="batch-title-row">
              <Zap size={15} color="var(--primary)" />
              <strong>Chỉnh sửa hàng loạt cho tất cả {matrixItems.length} phân loại:</strong>
            </div>

            <div className="batch-inputs-row">
              <div className="batch-input-item">
                <span className="input-prefix">₫</span>
                <input 
                  type="number" 
                  placeholder="Giá chung (VND)" 
                  value={batchPrice} 
                  onChange={(e) => setBatchPrice(e.target.value)}
                />
              </div>

              <div className="batch-input-item">
                <span className="input-prefix">📦</span>
                <input 
                  type="number" 
                  placeholder="Kho hàng chung" 
                  value={batchStock} 
                  onChange={(e) => setBatchStock(e.target.value)}
                />
              </div>

              <div className="batch-input-item">
                <span className="input-prefix">🏷️</span>
                <input 
                  type="text" 
                  placeholder="Tiền tố SKU" 
                  value={batchSkuPrefix} 
                  onChange={(e) => setBatchSkuPrefix(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="nav-btn-primary apply-batch-btn"
                onClick={handleApplyBatch}
              >
                Áp dụng cho tất cả
              </button>
            </div>
          </div>

          {/* Combinations Matrix Table */}
          <div className="matrix-table-container">
            <table className="variant-matrix-table">
              <thead>
                <tr>
                  <th>{group1Name || 'Nhóm 1'}</th>
                  {hasGroup2 && <th>{group2Name || 'Nhóm 2'}</th>}
                  <th>Giá bán (VNĐ) *</th>
                  <th>Kho hàng (SL) *</th>
                  <th>Mã SKU phân loại</th>
                </tr>
              </thead>
              <tbody>
                {matrixItems.map(item => (
                  <tr key={item.key}>
                    <td className="font-semibold">{item.opt1}</td>
                    {hasGroup2 && <td className="font-semibold">{item.opt2}</td>}
                    <td>
                      <div className="table-input-with-suffix">
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleMatrixFieldChange(item.key, 'price', e.target.value)}
                          className="table-cell-input"
                          placeholder="0"
                        />
                        <span>₫</span>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={item.stock} 
                        onChange={(e) => handleMatrixFieldChange(item.key, 'stock', e.target.value)}
                        className="table-cell-input"
                        placeholder="100"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={item.sku} 
                        onChange={(e) => handleMatrixFieldChange(item.key, 'sku', e.target.value)}
                        className="table-cell-input font-monospace"
                        placeholder="SKU Code"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Single Variant Default SKU Form */
        <div className="single-sku-fallback-box">
          <div className="form-group-item">
            <label className="form-field-label">Mã SKU sản phẩm chính (Stock Keeping Unit)</label>
            <input 
              type="text" 
              placeholder="Ví dụ: ATN-BASIC-001" 
              value={formData.sku || ''} 
              onChange={(e) => onChange('sku', e.target.value)}
              className="stylish-form-input font-monospace"
            />
            <span className="field-tip-text">Mã định danh riêng cho sản phẩm giúp quản lý kho và quét mã vạch dễ dàng.</span>
          </div>
        </div>
      )}
    </div>
  );
}
