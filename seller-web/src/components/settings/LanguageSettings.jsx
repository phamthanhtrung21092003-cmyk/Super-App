import React, { useState } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';

export default function LanguageSettings() {
  const [selectedLang, setSelectedLang] = useState('vi');

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Ngôn ngữ hiển thị</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Chọn ngôn ngữ hiển thị cho giao diện S-SHOPPING Seller Center
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '500px' }}>
        <div 
          className={`report-item-row clickable-card ${selectedLang === 'vi' ? 'active' : ''}`}
          style={{ padding: '16px', border: selectedLang === 'vi' ? '2px solid #00B14F' : '1px solid var(--border)', background: selectedLang === 'vi' ? '#F0FDF4' : 'var(--bg-page)' }}
          onClick={() => setSelectedLang('vi')}
        >
          <span style={{ fontSize: '24px', marginRight: '10px' }}>🇻🇳</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Tiếng Việt</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mặc định hệ thống</span>
          </div>
          {selectedLang === 'vi' && <CheckCircle2 size={18} style={{ color: '#00B14F' }} />}
        </div>

        <div 
          className={`report-item-row clickable-card ${selectedLang === 'en' ? 'active' : ''}`}
          style={{ padding: '16px', border: selectedLang === 'en' ? '2px solid #00B14F' : '1px solid var(--border)', background: selectedLang === 'en' ? '#F0FDF4' : 'var(--bg-page)' }}
          onClick={() => setSelectedLang('en')}
        >
          <span style={{ fontSize: '24px', marginRight: '10px' }}>🇬🇧</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>English</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Global Language</span>
          </div>
          {selectedLang === 'en' && <CheckCircle2 size={18} style={{ color: '#00B14F' }} />}
        </div>
      </div>
    </div>
  );
}
