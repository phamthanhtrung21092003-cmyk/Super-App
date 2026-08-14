import React, { useState } from 'react';
import { Eye, Edit3, BarChart2, MoreHorizontal, Play, Pause, Copy, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import VideoEmptyState from './VideoEmptyState';

export default function VideoTable({
  videos = [],
  onViewDetail,
  onEdit,
  onViewAnalytics,
  onPause,
  onPublish,
  onDelete,
  onUploadVideo
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!videos || videos.length === 0) {
    return <VideoEmptyState onUploadVideo={onUploadVideo} />;
  }

  const totalPages = Math.ceil(videos.length / pageSize) || 1;
  const pagedList = videos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PUBLISHED':
      case 'Đã đăng':
        return { bg: '#E6F4EA', color: '#00B14F', border: '#BBF7D0', label: '🟢 Đã đăng' };
      case 'PENDING_REVIEW':
      case 'Chờ duyệt':
        return { bg: '#FFF7ED', color: '#F97316', border: '#FFEDD5', label: '🟠 Chờ duyệt' };
      case 'PAUSED':
      case 'Tạm ẩn':
        return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', label: '⚪ Tạm ẩn' };
      case 'REJECTED':
      case 'Vi phạm':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '🔴 Vi phạm' };
      default:
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: status };
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Video ngắn':
        return { bg: '#FEF2F2', color: '#EF4444' };
      case 'Video dài':
        return { bg: '#EFF6FF', color: '#1877F2' };
      case 'Livestream':
        return { bg: '#FFF7ED', color: '#F97316' };
      case 'Affiliate':
        return { bg: '#FCE7F3', color: '#EC4899' };
      default:
        return { bg: '#E6F4EA', color: '#00B14F' };
    }
  };

  return (
    <div className="shipping-table-card" style={{ marginTop: '16px', position: 'relative' }}>
      <div className="shipping-table-responsive-wrapper">
        <table className="shipping-master-table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Loại</th>
              <th>Thời gian</th>
              <th>Lượt xem</th>
              <th>Lượt thích</th>
              <th>Sản phẩm liên kết</th>
              <th>Doanh thu</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedList.map(item => {
              const statusBadge = getStatusBadgeStyle(item.status);
              const typeBadge = getTypeBadgeStyle(item.type);

              return (
                <tr key={item.id}>
                  {/* Column 1: Video Thumbnail & Title */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative', width: '54px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9px', padding: '1px 3px', borderRadius: '3px' }}>
                          {item.duration || '02:45'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong className="prod-name-title" style={{ fontSize: '13px' }}>{item.title}</strong>
                        <span className="prod-sku-tag">ID: {item.id} • {item.productCount || 1} sản phẩm</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Video Type Badge */}
                  <td>
                    <span className="c-tag-pill" style={{ backgroundColor: typeBadge.bg, color: typeBadge.color }}>
                      {item.type || 'Video ngắn'}
                    </span>
                  </td>

                  {/* Column 3: Time */}
                  <td>
                    <span className="tx-time-cell">{item.createdAt || '13/08/2026 10:30'}</span>
                  </td>

                  {/* Column 4: Views */}
                  <td>
                    <strong style={{ fontSize: '13px' }}>{(item.views || 0).toLocaleString('vi-VN')}</strong>
                  </td>

                  {/* Column 5: Likes */}
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(item.likes || 0).toLocaleString('vi-VN')}</span>
                  </td>

                  {/* Column 6: Linked Catalog Products Mini Stack */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', marginLeft: '6px' }}>
                        <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100" alt="Prod" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #fff' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>+{item.productCount || 1}</span>
                    </div>
                  </td>

                  {/* Column 7: Revenue */}
                  <td>
                    <strong style={{ color: '#00B14F', fontSize: '13px' }}>
                      {(item.revenue || 0).toLocaleString('vi-VN')} đ
                    </strong>
                  </td>

                  {/* Column 8: Status Badge */}
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

                  {/* Column 9: Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-cell" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', position: 'relative' }}>
                      <button 
                        className="action-view-btn" 
                        onClick={() => onViewDetail(item)}
                        title="Xem chi tiết & Xem trên Super App"
                      >
                        <Eye size={13} /> Xem
                      </button>

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
                            minWidth: '180px',
                            padding: '6px',
                            textAlign: 'left'
                          }}
                        >
                          <button className="menu-item-btn" onClick={() => { onViewDetail(item); setActiveMenuId(null); }}>
                            <ExternalLink size={13} /> Xem trên Super App
                          </button>

                          <button className="menu-item-btn" onClick={() => { onEdit(item); setActiveMenuId(null); }}>
                            <Edit3 size={13} /> Chỉnh sửa video
                          </button>

                          {item.status === 'PUBLISHED' || item.status === 'Đã đăng' ? (
                            <button className="menu-item-btn warning-item" onClick={() => { onPause(item.id); setActiveMenuId(null); }}>
                              <Pause size={13} /> Tạm ẩn video
                            </button>
                          ) : (
                            <button className="menu-item-btn success-item" onClick={() => { onPublish(item.id); setActiveMenuId(null); }}>
                              <Play size={13} /> Đăng lại video
                            </button>
                          )}

                          <button className="menu-item-btn" onClick={() => { alert(`📋 Đã sao chép link Video ${item.id} cho Super App!`); setActiveMenuId(null); }}>
                            <Copy size={13} /> Sao chép link
                          </button>

                          <button className="menu-item-btn danger-item" onClick={() => { onDelete(item.id); setActiveMenuId(null); }}>
                            <Trash2 size={13} /> Xóa video
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
          Hiển thị 1 - {pagedList.length} của {videos.length} video
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
