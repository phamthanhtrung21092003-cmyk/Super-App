import React, { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationSettings() {
  const [channels, setChannels] = useState({
    newOrderEmail: true,
    newOrderPush: true,
    cancelOrderEmail: true,
    cancelOrderPush: true,
    chatPush: true,
    paymentEmail: true,
    promoPush: true,
    livePush: true
  });

  const toggle = (key) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Đã lưu cấu hình thông báo thành công!');
  };

  return (
    <div className="finance-chart-card" style={{ padding: '24px' }}>
      <h3 className="card-heading-title">Cài đặt Thông báo</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 20px' }}>
        Chọn các sự kiện và kênh nhận thông báo quan trọng từ hệ thống
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'newOrder', label: 'Có đơn hàng mới phát sinh', desc: 'Nhận thông báo khi khách thanh toán/đặt đơn thành công', emailKey: 'newOrderEmail', pushKey: 'newOrderPush' },
            { id: 'cancelOrder', label: 'Yêu cầu hủy đơn / khiếu nại', desc: 'Nhận cảnh báo khi đơn hàng bị hủy hoặc có yêu cầu trả hàng', emailKey: 'cancelOrderEmail', pushKey: 'cancelOrderPush' },
            { id: 'chat', label: 'Tin nhắn chat từ khách hàng', desc: 'Thông báo tin nhắn mới từ người mua trên Super App', pushKey: 'chatPush' },
            { id: 'payment', label: 'Biến động số dư & Đối soát tiền', desc: 'Thông báo khi tiền hàng về ví hoặc lệnh rút tiền hoàn tất', emailKey: 'paymentEmail' },
            { id: 'promo', label: 'Chương trình khuyến mãi & Voucher', desc: 'Nhắc nhở ngân sách khuyến mãi và sự kiện Mega Sale', pushKey: 'promoPush' },
            { id: 'live', label: 'Nhắc nhở lịch Livestream', desc: 'Thông báo trước 15 phút khi đến giờ phát sóng đã lên lịch', pushKey: 'livePush' }
          ].map(n => (
            <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>{n.label}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.desc}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {n.emailKey && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels[n.emailKey]} 
                      onChange={() => toggle(n.emailKey)}
                      className="stylish-checkbox"
                    />
                    Email
                  </label>
                )}

                {n.pushKey && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels[n.pushKey]} 
                      onChange={() => toggle(n.pushKey)}
                      className="stylish-checkbox"
                    />
                    App Push
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" className="nav-btn-primary" style={{ padding: '10px 24px' }}>
            <CheckCircle2 size={16} /> Lưu cấu hình thông báo
          </button>
        </div>
      </form>
    </div>
  );
}
