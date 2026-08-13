import React, { useState } from 'react';
import { Eye, Edit3, MoreHorizontal, Pause, Play, Copy, BarChart2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import PromotionEmptyState from './PromotionEmptyState';

export default function PromotionTable({
  promotions = [],
  onViewDetail,
  onEdit,
  onPause,
  onResume,
  onDuplicate,
  onViewReport,
  onDelete,
  onCreatePromotion
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!promotions || promotions.length === 0) {
    return <PromotionEmptyState onCreatePromotion={onCreatePromotion} />;
  }

  const totalPages = Math.ceil(promotions.length / pageSize) || 1;
  const pagedList = promotions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Đang diễn ra':
        return { bg: '#E6F4EA', color: '#00B14F', border: '#BBF7D0', label: '🟢 Đang diễn ra' };
      case 'Sắp diễn ra':
        return { bg: '#FFF7ED', color: '#F97316', border: '#FFEDD5', label: '🟠 Sắp diễn ra' };
      case 'Đã kết thúc':
        return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', label: '⚪ Đã kết thúc' };
      case 'Tạm dừng':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '🔴 Tạm dừng' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: status };
    }
  };

  const getPromoBadgeStyle = (type, badgeText) => {
    if (badgeText?.includes('FREESHIP') || type === 'Miễn phí vận chuyển') {
      return { bg: '#00B14F', color: '#ffffff', text: 'FREESHIP XTRA' };
    }
    if (badgeText?.includes('20%') || badgeText?.includes('OFF')) {
      return { bg: '#F97316', color: '#ffffff', text: '20% OFF' };
    }
    if (badgeText?.includes('50K') || type === 'Giảm giá đơn hàng') {
      return { bg: '#EF4444', color: '#ffffff', text: 'REDEEM 50K' };
    }
    if (badgeText?.includes('FLASH') || type === 'Flash Sale') {
      return { bg: '#1877F2', color: '#ffffff', text: 'FLASH SALE' };
    }
    if (badgeText?.includes('TẶNG') || type === 'Mua X tặng Y') {
      return { bg: '#EC4899', color: '#ffffff', text: 'MUA 1 TẶNG 1' };
    }
    return { bg: '#9333EA', color: '#ffffff', text: badgeText || 'KHUYẾN MÃI' };
  };

  return (
    <div className="shipping-table-card" style={{ marginTop: '16px', position: 'relative' }}>
      <div className="shipping-table-responsive-wrapper">
        <table className="shipping-master-table">
          <thead>
            <tr>
              <th>Chương trình</th>
              <th>Loại chương trình</th>
              <th>Thời gian</th>
              <th>Ngân sách</th>
              <th style={{ width: '180px' }}>Đã dùng</th>
              <th>Trạng thái</th>
              <th>Hiệu quả</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedList.map(item => {
              const statusBadge = getBadgeStyle(item.status);
              const pBadge = getPromoBadgeStyle(item.type, item.badgeText);
              const spentPct = Math.min(100, Math.round(((item.spent || 0) / (item.budget || 1)) * 100));
              const isOverBudget = spentPct >= 100;

              return (
                <tr key={item.id}>
                  {/* Column 1: Program Name & Badge */}
                  <td>
                    <div className="shipping-product-mini-cell" style={{ gap: '8px' }}>
                      <div className="promo-badge-tag" style={{ backgroundColor: pBadge.bg, color: pBadge.color }}>
                        {pBadge.text}
                      </div>
                      <div>
                        <strong className="prod-name-title" style={{ fontSize: '13px' }}>{item.name}</strong>
                        <span className="prod-sku-tag">Mã: {item.code || item.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Program Type */}
                  <td>
                    <span className="c-tag-pill">{item.type}</span>
                  </td>

                  {/* Column 3: Time */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                      <span className="font-bold">{item.time || item.period || '08/08/2026 - 12/08/2026'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.timeSubtext || 'Đang áp dụng'}</span>
                    </div>
                  </td>

                  {/* Column 4: Budget */}
                  <td>
                    <strong style={{ fontSize: '12px' }}>{(item.budget || 0).toLocaleString('vi-VN')} đ</strong>
                  </td>

                  {/* Column 5: Spent & Progress bar */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span>{(item.spent || 0).toLocaleString('vi-VN')} đ</span>
                        <strong style={{ color: isOverBudget ? '#EF4444' : 'var(--text-primary)' }}>{spentPct}%</strong>
                      </div>
                      
                      {/* Budget Progress Bar */}
                      <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${spentPct}%`, 
                            background: isOverBudget ? '#EF4444' : '#00B14F', 
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }} 
                        />
                      </div>

                      {isOverBudget && (
                        <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <AlertTriangle size={10} /> Đã hết ngân sách
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Status */}
                  <td>
                    <span 
                      className="shipping-status-badge"
                      style={{ 
                        backgroundColor: statusBadge.bg, 
                        color: statusBadge.color, 
                        borderColor: statusBadge.border 
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Column 7: Performance / Revenue */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Doanh thu</span>
                      <strong style={{ color: '#00B14F', fontSize: '12px' }}>
                        {(item.revenue || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </td>

                  {/* Column 8: Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-cell" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', position: 'relative' }}>
                      <button 
                        className="action-view-btn" 
                        onClick={() => onViewDetail(item)}
                        title="Xem chi tiết chương trình"
                      >
                        <Eye size={13} /> Xem
                      </button>

                      <button 
                        className="action-icon-btn" 
                        onClick={() => onEdit(item)}
                        title="Chỉnh sửa chương trình"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button 
                        className="action-icon-btn" 
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        title="Thao tác khác"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === item.id && (
                        <div 
                          className="action-menu-dropdown-box"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '32px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 10,
                            minWidth: '170px',
                            padding: '6px',
                            textAlign: 'left'
                          }}
                        >
                          <button className="menu-item-btn" onClick={() => { onViewDetail(item); setActiveMenuId(null); }}>
                            <Eye size={13} /> Xem chi tiết
                          </button>

                          <button className="menu-item-btn" onClick={() => { onViewReport(item); setActiveMenuId(null); }}>
                            <BarChart2 size={13} /> Xem báo cáo
                          </button>

                          {item.status === 'Đang diễn ra' && (
                            <button className="menu-item-btn warning-item" onClick={() => { onPause(item.id); setActiveMenuId(null); }}>
                              <Pause size={13} /> Tạm dừng
                            </button>
                          )}

                          {item.status === 'Tạm dừng' && (
                            <button className="menu-item-btn success-item" onClick={() => { onResume(item.id); setActiveMenuId(null); }}>
                              <Play size={13} /> Tiếp tục
                            </button>
                          )}

                          <button className="menu-item-btn" onClick={() => { onDuplicate(item); setActiveMenuId(null); }}>
                            <Copy size={13} /> Sao chép
                          </button>

                          <button className="menu-item-btn danger-item" onClick={() => { onDelete(item.id); setActiveMenuId(null); }}>
                            <Trash2 size={13} /> Xóa chương trình
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="shipping-pagination-bar">
        <div className="pagination-info-text">
          Hiển thị 1 - {pagedList.length} của {promotions.length} chương trình
        </div>

        <div className="pagination-controls">
          <button 
            className="pag-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(page => (
            <button 
              key={page}
              className={`pag-number-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button 
            className="pag-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight size={16} />
          </button>

          <select className="page-size-select">
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
          </select>
        </div>
      </div>
    </div>
  );
}
