import React, { useState } from 'react';
import { Star, MessageSquare, Truck, ChevronRight } from 'lucide-react';

export default function ShopPerformanceCard({ isNewShop = false }) {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Hiệu suất cửa hàng</h3>
        <select className="modal-select-control" style={{ width: '100px', fontSize: '11px', padding: '2px 6px' }} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7d">7 ngày qua</option>
          <option value="30d">30 ngày qua</option>
        </select>
      </div>

      {isNewShop ? (
        <div style={{ marginTop: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#00B14F', display: 'block', marginBottom: '4px' }}>🟢 SHOP MỚI</span>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            Bạn chưa có dữ liệu hoạt động. Các chỉ số hiệu suất sẽ xuất hiện sau khi Shop bắt đầu bán hàng.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Đánh giá:</span>
              <strong>Chưa có dữ liệu</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tỷ lệ phản hồi:</span>
              <strong>Chưa có dữ liệu</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tỷ lệ giao hàng:</span>
              <strong>Chưa có dữ liệu</strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="report-item-row" style={{ padding: '8px 10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={16} fill="#F59E0B" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
              <strong style={{ fontSize: '12px' }}>Đánh giá trung bình: 4.8 / 5</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(128 lượt đánh giá hài lòng)</span>
            </div>
          </div>

          <div className="report-item-row" style={{ padding: '8px 10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
              <strong style={{ fontSize: '12px' }}>Tỷ lệ phản hồi chat: 98%</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Phản hồi trong 5 phút)</span>
            </div>
          </div>

          <div className="report-item-row" style={{ padding: '8px 10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E6F4EA', color: '#00B14F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '8px' }}>
              <strong style={{ fontSize: '12px' }}>Tỷ lệ giao hàng đúng hạn: 96%</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Tốt hơn 80% cửa hàng)</span>
            </div>
          </div>

          <button className="report-item-row clickable-card" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', background: 'var(--bg-page)', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700' }}>Xem chi tiết hiệu suất</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      )}

      {/* Mẹo cài đặt */}
      <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
          💡 Mẹo cài đặt Shop
        </span>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0 0 8px' }}>
          Hoàn thiện thông tin cửa hàng để tăng độ tin cậy và thu hút nhiều khách hàng hơn trên V-life Super App.
        </p>
        <span style={{ fontSize: '11px', color: '#00B14F', fontWeight: '700', cursor: 'pointer' }}>Hướng dẫn chi tiết &gt;</span>
      </div>
    </div>
  );
}
