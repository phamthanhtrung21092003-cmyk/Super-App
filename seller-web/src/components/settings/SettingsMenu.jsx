import React from 'react';
import { Store, ShieldCheck, MapPin, Landmark, Receipt, Bell, Printer, Share2, History, Globe, Moon } from 'lucide-react';

export default function SettingsMenu({ activeSetting, onSelectSetting }) {
  const menuItems = [
    { id: 'info', label: 'Thông tin cửa hàng', sub: 'Quản lý thông tin cơ bản của cửa hàng', icon: Store },
    { id: 'security', label: 'Tài khoản & bảo mật', sub: 'Quản lý tài khoản và bảo mật', icon: ShieldCheck },
    { id: 'warehouse', label: 'Địa chỉ kho hàng', sub: 'Quản lý địa chỉ kho và trả hàng', icon: MapPin },
    { id: 'bank', label: 'Tài khoản ngân hàng', sub: 'Quản lý tài khoản nhận thanh toán', icon: Landmark },
    { id: 'fees', label: 'Phí & lệ phí', sub: 'Xem chi tiết phí và lệ phí áp dụng', icon: Receipt },
    { id: 'notifications', label: 'Thông báo', sub: 'Quản lý kênh và nội dung thông báo', icon: Bell },
    { id: 'print', label: 'Mẫu in', sub: 'Quản lý và tùy chỉnh mẫu in', icon: Printer },
    { id: 'connections', label: 'Kết nối', sub: 'Kết nối API và các nền tảng', icon: Share2 },
    { id: 'logs', label: 'Nhật ký hoạt động', sub: 'Xem lịch sử hoạt động của tài khoản', icon: History },
    { id: 'language', label: 'Ngôn ngữ', sub: 'Chọn ngôn ngữ hiển thị', icon: Globe },
    { id: 'theme', label: 'Chế độ tối', sub: 'Bật / tắt chế độ tối', icon: Moon }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '12px', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px', display: 'block' }}>
        Danh mục cài đặt
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
        {menuItems.map(item => {
          const IconComp = item.icon;
          const isActive = activeSetting === item.id;

          return (
            <button
              key={item.id}
              className={`report-item-row clickable-card ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: isActive ? '#E6F4EA' : 'transparent',
                borderRadius: '10px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onSelectSetting(item.id)}
            >
              <div 
                style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '8px', 
                  background: isActive ? '#00B14F' : 'var(--bg-page)', 
                  color: isActive ? '#fff' : 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                <IconComp size={16} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <strong style={{ fontSize: '12px', color: isActive ? '#00B14F' : 'var(--text-primary)' }}>
                  {item.label}
                </strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="truncate-text">
                  {item.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
