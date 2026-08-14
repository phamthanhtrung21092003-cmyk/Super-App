import React, { useState } from 'react';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function ThemeSettings() {
  const [theme, setTheme] = useState('light');

  const switchTheme = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Giao diện hiển thị (Chế độ tối / sáng)</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Tùy chỉnh chế độ hiển thị sáng hoặc tối cho giao diện quản trị Seller Center
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '500px' }}>
        <div 
          className={`report-item-row clickable-card ${theme === 'light' ? 'active' : ''}`}
          style={{ padding: '16px', border: theme === 'light' ? '2px solid #00B14F' : '1px solid var(--border)', background: theme === 'light' ? '#F0FDF4' : 'var(--bg-page)' }}
          onClick={() => switchTheme('light')}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
            <Sun size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Chế độ Sáng (Light Mode)</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mặc định thương hiệu</span>
          </div>
          {theme === 'light' && <CheckCircle2 size={18} style={{ color: '#00B14F' }} />}
        </div>

        <div 
          className={`report-item-row clickable-card ${theme === 'dark' ? 'active' : ''}`}
          style={{ padding: '16px', border: theme === 'dark' ? '2px solid #00B14F' : '1px solid var(--border)', background: theme === 'dark' ? '#F0FDF4' : 'var(--bg-page)' }}
          onClick={() => switchTheme('dark')}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1E293B', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
            <Moon size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Chế độ Tối (Dark Mode)</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bảo vệ mắt ban đêm</span>
          </div>
          {theme === 'dark' && <CheckCircle2 size={18} style={{ color: '#00B14F' }} />}
        </div>
      </div>
    </div>
  );
}
