import React, { useState } from 'react';
import { 
  X, Store, ShieldCheck, MapPin, CreditCard, 
  CheckCircle2, Sparkles, RefreshCw, Zap 
} from 'lucide-react';

export default function ShopSetupModals({ 
  activeModal, 
  onClose, 
  onSaveStep,
  initialData = {} 
}) {
  if (!activeModal) return null;

  return (
    <div className="setup-modal-backdrop" onClick={onClose}>
      <div className="setup-modal-container" onClick={(e) => e.stopPropagation()}>
        {activeModal === 'shopInfo' && (
          <ShopInfoModalForm 
            initialData={initialData.shopInfo} 
            onClose={onClose} 
            onSave={(data) => onSaveStep('shopInfo', data)} 
          />
        )}

        {activeModal === 'verification' && (
          <VerificationModalForm 
            initialData={initialData.verification} 
            onClose={onClose} 
            onSave={(data) => onSaveStep('verification', data)} 
          />
        )}

        {activeModal === 'pickupAddress' && (
          <AddressModalForm 
            initialData={initialData.pickupAddress} 
            onClose={onClose} 
            onSave={(data) => onSaveStep('pickupAddress', data)} 
          />
        )}

        {activeModal === 'payoutAccount' && (
          <PayoutModalForm 
            initialData={initialData.payoutAccount} 
            onClose={onClose} 
            onSave={(data) => onSaveStep('payoutAccount', data)} 
          />
        )}

        {activeModal === 'finalReview' && (
          <FinalReviewModalForm 
            onClose={onClose} 
            onComplete={() => onSaveStep('finalReview', { status: 'COMPLETED' })} 
          />
        )}
      </div>
    </div>
  );
}

// 1. SHOP INFO MODAL
function ShopInfoModalForm({ initialData = {}, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || 'S-Shopping Fashion Official');
  const [category, setCategory] = useState(initialData?.category || 'Thời trang & May mặc');
  const [description, setDescription] = useState(initialData?.description || 'Gian hàng thời trang cao cấp chính hãng trên S-Shopping.');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên cửa hàng!');
      return;
    }
    onSave({
      status: 'COMPLETED',
      name,
      displayName: name,
      category,
      description,
      logo: initialData?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="setup-modal-form">
      <div className="setup-modal-header">
        <div className="modal-title-with-icon">
          <Store size={20} color="var(--primary)" />
          <h3>Cập nhật Thông tin Shop</h3>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="modal-body-stack">
        <div className="form-group-item">
          <label className="form-field-label required">Tên Cửa Hàng / Shop Name</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Ngành hàng chính</label>
          <select 
            className="stylish-form-select" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Thời trang & May mặc">Thời trang & May mặc</option>
            <option value="Điện thoại & Phụ kiện">Điện thoại & Phụ kiện công nghệ</option>
            <option value="Giày dép & Túi xách">Giày dép & Túi xách</option>
            <option value="Mỹ phẩm & Làm đẹp">Mỹ phẩm & Làm đẹp</option>
            <option value="Đồ gia dụng & Đời sống">Đồ gia dụng & Đời sống</option>
          </select>
        </div>

        <div className="form-group-item">
          <label className="form-field-label">Mô tả giới thiệu Shop</label>
          <textarea 
            className="stylish-form-textarea" 
            rows={3} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
      </div>

      <div className="modal-footer-actions">
        <button type="button" className="nav-btn-secondary" onClick={onClose}>Hủy</button>
        <button type="submit" className="nav-btn-primary">Lưu thông tin Shop</button>
      </div>
    </form>
  );
}

// 2. VERIFICATION MODAL
function VerificationModalForm({ initialData = {}, onClose, onSave }) {
  const [ownerName, setOwnerName] = useState(initialData?.ownerName || 'Nguyễn Văn A');
  const [idNumber, setIdNumber] = useState(initialData?.idNumber || '079203001234');
  const [phone, setPhone] = useState(initialData?.phone || '0987654321');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      status: 'COMPLETED',
      ownerName,
      idNumber,
      phone,
      verifiedDate: '12/08/2026'
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="setup-modal-form">
      <div className="setup-modal-header">
        <div className="modal-title-with-icon">
          <ShieldCheck size={20} color="var(--primary)" />
          <h3>Xác minh Danh tính Người bán (Mock e-KYC)</h3>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="modal-body-stack">
        <div className="modal-verified-callout">
          <Zap size={16} />
          <span>Hệ thống tự động liên kết định danh bảo mật từ tài khoản S-Life SSO.</span>
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Họ và tên chủ sở hữu</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={ownerName} 
            onChange={(e) => setOwnerName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Số CCCD / CMND / Hộ chiếu</label>
          <input 
            type="text" 
            className="stylish-form-input font-monospace" 
            value={idNumber} 
            onChange={(e) => setIdNumber(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Số điện thoại xác thực</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="modal-footer-actions">
        <button type="button" className="nav-btn-secondary" onClick={onClose}>Đóng</button>
        <button type="submit" className="nav-btn-primary">Xác nhận định danh</button>
      </div>
    </form>
  );
}

// 3. ADDRESS MODAL
function AddressModalForm({ initialData = {}, onClose, onSave }) {
  const [contactName, setContactName] = useState(initialData?.contactName || 'Nguyễn Văn A (Kho Tổng)');
  const [phone, setPhone] = useState(initialData?.phone || '0987654321');
  const [address, setAddress] = useState(initialData?.address || '123 Đường Nguyễn Huệ');
  const [ward, setWard] = useState(initialData?.ward || 'Phường Bến Nghé');
  const [district, setDistrict] = useState(initialData?.district || 'Quận 1');
  const [city, setCity] = useState(initialData?.city || 'TP. Hồ Chí Minh');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Vui lòng nhập địa chỉ lấy hàng!');
      return;
    }
    onSave({
      status: 'COMPLETED',
      contactName,
      phone,
      address,
      ward,
      district,
      city
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="setup-modal-form">
      <div className="setup-modal-header">
        <div className="modal-title-with-icon">
          <MapPin size={20} color="#1877F2" />
          <h3>Địa chỉ Kho hàng & Lấy hàng</h3>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="modal-body-stack">
        <div className="form-group-item">
          <label className="form-field-label required">Tên người liên hệ / Tên kho</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Số điện thoại bưu tá gọi lấy hàng</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Địa chỉ cụ thể (Số nhà, tên đường)</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label className="form-field-label required">Phường/Xã</label>
            <input 
              type="text" 
              className="stylish-form-input" 
              value={ward} 
              onChange={(e) => setWard(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="form-field-label required">Quận/Huyện</label>
            <input 
              type="text" 
              className="stylish-form-input" 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="form-field-label required">Tỉnh/TP</label>
            <input 
              type="text" 
              className="stylish-form-input" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required 
            />
          </div>
        </div>
      </div>

      <div className="modal-footer-actions">
        <button type="button" className="nav-btn-secondary" onClick={onClose}>Hủy</button>
        <button type="submit" className="nav-btn-primary">Lưu địa chỉ lấy hàng</button>
      </div>
    </form>
  );
}

// 4. PAYOUT MODAL
function PayoutModalForm({ initialData = {}, onClose, onSave }) {
  const [bankName, setBankName] = useState(initialData?.bankName || 'Vietcombank (VCB)');
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '10123456789');
  const [accountHolder, setAccountHolder] = useState(initialData?.accountHolder || 'NGUYEN VAN A');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAccountChange = (val) => {
    setAccountNumber(val);
    if (val.length >= 8) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setAccountHolder('NGUYEN VAN A');
      }, 500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      alert('Vui lòng nhập số tài khoản ngân hàng!');
      return;
    }
    onSave({
      status: 'COMPLETED',
      bankName,
      accountNumber,
      accountHolder,
      napasVerified: true
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="setup-modal-form">
      <div className="setup-modal-header">
        <div className="modal-title-with-icon">
          <CreditCard size={20} color="var(--primary)" />
          <h3>Tài khoản Nhận Tiền Doanh Thu (Napas 24/7)</h3>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="modal-body-stack">
        <div className="modal-verified-callout">
          <Zap size={16} />
          <span>Xác minh tự động qua Napas 24/7: Tiền bán hàng sẽ được tất toán trực tiếp.</span>
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Ngân hàng thụ hưởng</label>
          <select 
            className="stylish-form-select" 
            value={bankName} 
            onChange={(e) => setBankName(e.target.value)}
          >
            <option value="Vietcombank (VCB)">Vietcombank (Ngân hàng TMCP Ngoại thương)</option>
            <option value="Techcombank">Techcombank (Ngân hàng Kỹ thương)</option>
            <option value="MB Bank">MB Bank (Ngân hàng Quân đội)</option>
            <option value="ACB">ACB (Ngân hàng Á Châu)</option>
            <option value="VietinBank">VietinBank (Ngân hàng Công thương)</option>
            <option value="BIDV">BIDV (Ngân hàng Đầu tư & PT)</option>
          </select>
        </div>

        <div className="form-group-item">
          <label className="form-field-label required">Số tài khoản ngân hàng</label>
          <input 
            type="text" 
            className="stylish-form-input font-monospace" 
            value={accountNumber} 
            onChange={(e) => handleAccountChange(e.target.value)} 
            placeholder="Nhập số tài khoản..." 
            required 
          />
        </div>

        {isVerifying && (
          <div style={{ padding: '8px 12px', background: '#EFF6FF', borderRadius: '8px', color: '#1D4ED8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>Đang xác minh tên chủ tài khoản qua Napas 24/7...</span>
          </div>
        )}

        <div className="form-group-item">
          <label className="form-field-label required">Tên chủ tài khoản (In hoa)</label>
          <input 
            type="text" 
            className="stylish-form-input" 
            value={accountHolder} 
            readOnly 
            style={{ background: 'var(--bg-page)', color: '#475569', cursor: 'not-allowed' }} 
          />
        </div>
      </div>

      <div className="modal-footer-actions">
        <button type="button" className="nav-btn-secondary" onClick={onClose}>Hủy</button>
        <button type="submit" className="nav-btn-primary">Lưu tài khoản nhận tiền</button>
      </div>
    </form>
  );
}

// 5. FINAL REVIEW MODAL
function FinalReviewModalForm({ onClose, onComplete }) {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinish = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1200);
  };

  return (
    <div className="setup-modal-form" style={{ textAlign: 'center', padding: '36px 24px' }}>
      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#F0FDF4', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #BBF7D0' }}>
        <Sparkles size={36} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary-dark)', marginBottom: '8px' }}>
        {isSuccess ? '🎉 Kích hoạt Cửa hàng thành công!' : 'Sẵn sàng kích hoạt Cửa hàng?'}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
        Tất cả 6 bước chuẩn bị đã hoàn tất. Cửa hàng của bạn sẽ được kích hoạt công khai trên nền tảng S-Shopping V-life ngay lập tức.
      </p>

      <div className="modal-footer-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="nav-btn-secondary" onClick={onClose}>Xem lại</button>
        <button type="button" className="nav-btn-primary" onClick={handleFinish} style={{ padding: '12px 28px' }}>
          <CheckCircle2 size={16} /> Kích hoạt Shop ngay
        </button>
      </div>
    </div>
  );
}
