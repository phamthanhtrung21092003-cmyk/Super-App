import React, { useState } from 'react';
import { Radio, Eye, Edit3, BarChart2, MoreHorizontal, Play, Pause, Trash2, ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react';
import LivestreamEmptyState from './LivestreamEmptyState';

export default function LivestreamTable({
  livestreams = [],
  onOpenLiveControl,
  onViewDetail,
  onViewAnalytics,
  onEdit,
  onEndLive,
  onCancelLive,
  onCreateLivestream
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!livestreams || livestreams.length === 0) {
    return <LivestreamEmptyState onCreateLivestream={onCreateLivestream} />;
  }

  const totalPages = Math.ceil(livestreams.length / pageSize) || 1;
  const pagedList = livestreams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'LIVE':
      case 'Đang diễn ra':
        return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA', label: '🔴 LIVE Đang diễn ra' };
      case 'SCHEDULED':
      case 'Sắp diễn ra':
        return { bg: '#FFF7ED', color: '#F97316', border: '#FFEDD5', label: '⏱️ Sắp diễn ra' };
      case 'ENDED':
      case 'Đã kết thúc':
        return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', label: '⚫ Đã kết thúc' };
      case 'CANCELLED':
      case 'Đã hủy':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '🔴 Đã hủy' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: status };
    }
  };

  const getCategoryBadgeStyle = (cat) => {
    switch (cat) {
      case 'Thời trang':
        return { bg: '#EFF6FF', color: '#1877F2' };
      case 'Gia dụng':
        return { bg: '#E6F4EA', color: '#00B14F' };
      case 'Tổng hợp':
        return { bg: '#FFF7ED', color: '#F97316' };
      case 'Làm đẹp':
        return { bg: '#FCE7F3', color: '#EC4899' };
      case 'Công nghệ':
        return { bg: '#F0FDF4', color: '#059669' };
      default:
        return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  return (
    <div className="shipping-table-card" style={{ marginTop: '16px', position: 'relative' }}>
      <div className="shipping-table-responsive-wrapper">
        <table className="shipping-master-table">
          <thead>
            <tr>
              <th>Livestream</th>
              <th>Chủ đề</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Đơn hàng</th>
              <th>Doanh thu</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedList.map(item => {
              const statusBadge = getStatusBadgeStyle(item.status);
              const catBadge = getCategoryBadgeStyle(item.category);

              return (
                <tr key={item.id}>
                  {/* Column 1: Livestream Thumbnail & Title */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative', width: '58px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9px', padding: '1px 3px', borderRadius: '3px' }}>
                          {item.duration || '01:25:20'}
                        </span>
                        {(item.status === 'LIVE' || item.status === 'Đang diễn ra') && (
                          <span style={{ position: 'absolute', top: '2px', left: '2px', background: '#EF4444', color: '#fff', fontSize: '8px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px' }}>
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong className="prod-name-title" style={{ fontSize: '13px' }}>{item.title}</strong>
                        <span className="prod-sku-tag">{item.hostName || 'MC Linh'} • ID: {item.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Category Badge */}
                  <td>
                    <span className="c-tag-pill" style={{ backgroundColor: catBadge.bg, color: catBadge.color }}>
                      {item.category || 'Thời trang'}
                    </span>
                  </td>

                  {/* Column 3: Time */}
                  <td>
                    <span className="tx-time-cell">{item.scheduledAt || '13/08/2026 19:00'}</span>
                  </td>

                  {/* Column 4: Status Badge */}
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

                  {/* Column 5: Views */}
                  <td>
                    <strong style={{ fontSize: '13px' }}>{(item.viewers || item.views || 0).toLocaleString('vi-VN')}</strong>
                  </td>

                  {/* Column 6: Orders */}
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.orders || 0} đơn</span>
                  </td>

                  {/* Column 7: Revenue */}
                  <td>
                    <strong style={{ color: '#00B14F', fontSize: '13px' }}>
                      {(item.revenue || 0).toLocaleString('vi-VN')} đ
                    </strong>
                  </td>

                  {/* Column 8: Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-cell" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', position: 'relative' }}>
                      {item.status === 'LIVE' || item.status === 'Đang diễn ra' ? (
                        <button 
                          className="action-view-btn" 
                          style={{ background: '#EF4444', borderColor: '#EF4444', color: '#fff' }}
                          onClick={() => onOpenLiveControl(item)}
                          title="Mở Seller Studio Live Control"
                        >
                          🔴 Vào Studio
                        </button>
                      ) : (
                        <button 
                          className="action-view-btn" 
                          onClick={() => onViewDetail(item)}
                          title="Xem chi tiết"
                        >
                          <Eye size={13} /> Xem
                        </button>
                      )}

                      <button 
                        className="action-icon-btn" 
                        onClick={() => onViewAnalytics(item)}
                        title="Xem thống kê hiệu quả"
                      >
                        <BarChart2 size={13} />
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
                            minWidth: '190px',
                            padding: '6px',
                            textAlign: 'left'
                          }}
                        >
                          <button className="menu-item-btn" onClick={() => { onViewDetail(item); setActiveMenuId(null); }}>
                            <ExternalLink size={13} /> Xem trên Super App
                          </button>

                          <button className="menu-item-btn" onClick={() => { onEdit(item); setActiveMenuId(null); }}>
                            <Edit3 size={13} /> Chỉnh sửa thông tin
                          </button>

                          {item.status === 'LIVE' && (
                            <button className="menu-item-btn warning-item" onClick={() => { onEndLive(item.id); setActiveMenuId(null); }}>
                              <Pause size={13} /> Kết thúc livestream
                            </button>
                          )}

                          <button className="menu-item-btn danger-item" onClick={() => { onCancelLive(item.id); setActiveMenuId(null); }}>
                            <Trash2 size={13} /> Hủy livestream
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
          Hiển thị 1 - {pagedList.length} của {livestreams.length} buổi livestream
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
