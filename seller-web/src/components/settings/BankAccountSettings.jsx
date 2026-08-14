import React from 'react';
import { Landmark, Plus, CheckCircle2, Trash2 } from 'lucide-react';

export default function BankAccountSettings() {
  const bankAccounts = [
    {
      id: 'bank_1',
      bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
      accountHolder: 'NGUYEN VAN A',
      accountNumber: '9704 **** **** 1234',
      branch: 'Chi nhánh TP. Hồ Chí Minh',
      isDefault: true
    }
  ];

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <div className="card-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-heading-title">Tài khoản ngân hàng</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Quản lý tài khoản ngân hàng nhận tiền thanh toán và rút số dư bán hàng
          </p>
        </div>

        <button className="nav-btn-primary" onClick={() => alert('Mở form liên kết tài khoản ngân hàng mới...')}>
          <Plus size={15} /> Thêm tài khoản ngân hàng
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bankAccounts.map(b => (
          <div key={b.id} style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Landmark size={24} style={{ color: '#00B14F' }} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>{b.bankName}</strong>
                <span style={{ fontSize: '16px', letterSpacing: '2px', color: '#38BDF8', fontWeight: '800', display: 'block', margin: '4px 0' }}>
                  {b.accountNumber}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Chủ tài khoản: <strong>{b.accountHolder}</strong> • {b.branch}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {b.isDefault && (
                <span className="c-tag-pill" style={{ background: '#00B14F', color: '#fff' }}>Mặc định</span>
              )}
              <button className="action-icon-btn" style={{ color: '#EF4444' }} onClick={() => alert('Xóa tài khoản ngân hàng này')}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
