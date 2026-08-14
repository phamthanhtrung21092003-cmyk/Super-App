import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export default function VerificationCard() {
  const [isVerified, setIsVerified] = useState(true);

  return (
    <div className="finance-chart-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Trạng thái xác minh</h3>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: isVerified ? '#E6F4EA' : '#FFF7ED', border: isVerified ? '1px solid #BBF7D0' : '1px solid #FFEDD5' }}>
          {isVerified ? (
            <CheckCircle2 size={22} style={{ color: '#00B14F', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={22} style={{ color: '#F97316', flexShrink: 0 }} />
          )}
          <div>
            <strong style={{ fontSize: '13px', color: isVerified ? '#00B14F' : '#F97316', display: 'block' }}>
              {isVerified ? 'Đã xác minh' : 'Chưa hoàn tất xác minh'}
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isVerified ? 'Cửa hàng của bạn đã được xác minh danh tính và giấy phép kinh doanh.' : 'Vui lòng cung cấp CCCD/Hộ chiếu để mở khóa đầy đủ tính năng thanh toán.'}
            </span>
          </div>
        </div>

        <button 
          className="report-item-row clickable-card" 
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg-page)', justifyContent: 'space-between' }}
          onClick={() => setIsVerified(!isVerified)}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '700' }}>
            {isVerified ? 'Xem chi tiết hồ sơ xác minh' : 'Xác minh ngay'}
          </span>
          <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  );
}
