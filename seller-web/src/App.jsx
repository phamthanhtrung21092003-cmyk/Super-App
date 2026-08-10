import React, { useState } from 'react';
import { 
  ShoppingBag, HelpCircle, Eye, EyeOff, QrCode, 
  Store, Plus, Trash2, Edit3, ArrowLeft, CheckCircle2, 
  BarChart3, Package, FileText, Settings, LogOut, ChevronRight,
  TrendingUp, Users, RefreshCw, Printer, AlertCircle, Sparkles,
  Search, Bell, ShieldCheck, Truck, Zap, Star, ArrowUpRight, Lock, User, Mail, Heart,
  Smartphone, ArrowRight, Shield, KeyRound, Check, AlertTriangle
} from 'lucide-react';

// Custom S-life Logo SVG Icon (Official Brand Emblem)
const SLifeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="7" fill="url(#slife-grad)" />
    <path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12C4.5 16.14 7.86 19.5 12 19.5C16.14 19.5 19.5 16.14 19.5 12C19.5 7.86 16.14 4.5 12 4.5ZM13.8 15.6C12.42 15.6 11.22 14.82 10.62 13.68C10.44 13.32 10.74 12.9 11.16 12.9H12.84C13.14 12.9 13.44 13.14 13.62 13.44C13.86 13.86 14.34 14.1 14.88 14.1C15.54 14.1 16.08 13.56 16.08 12.9C16.08 12.24 15.54 11.7 14.88 11.7H11.7C10.05 11.7 8.7 10.35 8.7 8.7C8.7 7.05 10.05 5.7 11.7 5.7C13.08 5.7 14.28 6.48 14.88 7.62C15.06 7.98 14.76 8.4 14.34 8.4H12.66C12.36 8.4 12.06 8.16 11.88 7.86C11.64 7.44 11.16 7.2 10.62 7.2C9.96 7.2 9.42 7.74 9.42 8.4C9.42 9.06 9.96 9.6 10.62 9.6H13.8C15.45 9.6 16.8 10.95 16.8 12.6C16.8 14.25 15.45 15.6 13.8 15.6Z" fill="white"/>
    <defs>
      <linearGradient id="slife-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00B14F" />
        <stop offset="1" stopColor="#007333" />
      </linearGradient>
    </defs>
  </svg>
);

// PRE-REGISTERED SYSTEM ACCOUNTS DATABASE
const PRE_REGISTERED_ACCOUNTS = [
  { phone: '0901234567', password: '123456', ownerName: 'Nguyễn Văn Chủ Shop', shopName: 'S-Shopping Official Store' },
  { phone: '0987654321', password: '123456', ownerName: 'Trần Thị Người Bán', shopName: 'Minimalist Studio' },
  { phone: 'admin@s-life.vn', password: '123456', ownerName: 'Quản Lý S-Life System', shopName: 'S-Shopping Premium Center' }
];

// INITIAL PRODUCTS DATA
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên (VN/A)', category: 'Điện thoại', price: 29990000, origPrice: 34990000, stock: 45, sold: 1520, status: 'Đang bán', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400', sku: 'APPL-15PM-TITAN' },
  { id: 'p2', name: 'Áo thun Nam Essential Cotton Premium Oversized', category: 'Thời trang', price: 450000, origPrice: 600000, stock: 120, sold: 512, status: 'Đang bán', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', sku: 'MINI-TEE-BLK' },
  { id: 'p3', name: 'Nước hoa Dior Sauvage EDP 100ml Pháp', category: 'Mỹ phẩm', price: 3250000, origPrice: 3800000, stock: 28, sold: 284, status: 'Đang bán', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', sku: 'DIOR-SAUV-100' },
  { id: 'p4', name: 'Giày Sneaker Nam Classic White Edition', category: 'Thời trang', price: 1250000, origPrice: 1500000, stock: 0, sold: 120, status: 'Hết hàng', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', sku: 'SNK-WHITE-01' },
  { id: 'p5', name: 'Tai nghe Sony WH-1000XM5 Chống Ồn Cao Cấp', category: 'Điện tử', price: 6500000, origPrice: 8490000, stock: 30, sold: 650, status: 'Đang bán', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', sku: 'SONY-XM5-BLK' }
];

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' | 'wizard' | 'dashboard'

  // --- LOGIN FORM STATES (Clean inputs by default) ---
  const [loginTab, setLoginTab] = useState('slife');
  const [slifePhone, setSlifePhone] = useState('');
  const [slifePassword, setSlifePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  // --- WIZARD STATES ---
  const [wizardStep, setWizardStep] = useState(1);
  const [shopInfo, setShopInfo] = useState({
    name: 'S-Shopping Store của tôi',
    username: 'my_sshopping_store',
    slogan: 'Chất lượng hàng đầu - Phục vụ tận tâm 24/7',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300',
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    businessType: 'Hộ kinh doanh cá thể',
    taxId: '0318928374',
    licenseNo: 'GPKD-2026/SS-01',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0901234567',
    bankName: 'Vietcombank',
    bankAccount: '10123456789',
    bankHolder: 'NGUYEN VAN A'
  });

  // --- DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');

  const [orders, setOrders] = useState([
    { id: 'SS-ORD-901', customer: 'Nguyễn Văn A', items: 'iPhone 15 Pro Max x1', total: 29990000, date: '07/08/2026', status: 'Chờ bàn giao' },
    { id: 'SS-ORD-902', customer: 'Trần Thị B', items: 'Nước hoa Dior Sauvage x1', total: 3250000, date: '06/08/2026', status: 'Đã giao ĐVVC' },
    { id: 'SS-ORD-903', customer: 'Phạm Văn C', items: 'Áo thun Essential x2', total: 900000, date: '05/08/2026', status: 'Hoàn thành' }
  ]);

  // Modal Add Product
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOrigPrice, setNewProdOrigPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Thời trang');
  const [newProdStock, setNewProdStock] = useState('100');
  const [newProdVariants, setNewProdVariants] = useState('Đen, Trắng, Xanh, Size M, Size L');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    city: '',
    detail: ''
  });

  // Authentication Verification Handler
  const handleSLifeAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!slifePhone.trim() || !slifePassword.trim()) {
      setAuthError('Vui lòng nhập Số điện thoại/Email và Mật khẩu.');
      return;
    }

    // Check credentials against system pre-registered database
    const matchedAccount = PRE_REGISTERED_ACCOUNTS.find(
      acc => (acc.phone.toLowerCase() === slifePhone.trim().toLowerCase()) && acc.password === slifePassword.trim()
    );

    if (matchedAccount) {
      setLoggedInUser(matchedAccount);
      setAuthError('');
      setMode('dashboard');
    } else {
      setAuthError('Mật khẩu hoặc Số điện thoại/Email S-life không đúng. Vui lòng kiểm tra lại!');
    }
  };

  const handleFinishWizard = () => {
    alert('🎉 Chúc mừng! Cửa hàng S-shopping của bạn đã được khởi tạo thành công với Tài khoản S-life.');
    setMode('dashboard');
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert('Vui lòng nhập tên và giá bán sản phẩm.');
      return;
    }
    const priceVal = parseFloat(newProdPrice) || 0;
    const origVal = parseFloat(newProdOrigPrice) || priceVal * 1.2;

    const item = {
      id: 'p_new_' + Date.now(),
      name: newProdName,
      category: newProdCategory,
      price: priceVal,
      origPrice: origVal,
      stock: parseInt(newProdStock) || 50,
      sold: 0,
      status: 'Đang bán',
      image: newProdImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000)
    };

    setProducts([item, ...products]);
    setShowAddProductModal(false);
    // Reset
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOrigPrice('');
    setNewProdImage('');
    setNewProdDesc('');
    alert('✅ Đã đăng bán sản phẩm mới thành công trên S-shopping Kênh Người Bán!');
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleFulfillOrder = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Đã giao ĐVVC' } : o));
    alert(`🖨️ Đã in nhãn đơn hàng ${id} và chuyển cho Đơn vị vận chuyển!`);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'Tất cả' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="app-root-container">
      
      {/* 📣 TOP ANNOUNCEMENT TICKER BANNER */}
      <div className="top-notice-bar">
        <div>
          <span className="notice-pill">ƯU ĐÃI KÊNH NGƯỜI BÁN</span>
          <span>🎉 Miễn phí 100% hoa hồng sàn S-shopping trong 30 ngày đầu tiên cho gian hàng mới đăng ký hôm nay!</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Hotline hỗ trợ 24/7: <strong>1900 1234</strong></span>
        </div>
      </div>

      {/* 🟢 TOP GLASSMORPHISM NAVBAR */}
      <header className="navbar">
        <div className="brand-container" onClick={() => setMode('login')}>
          <div className="brand-icon-wrapper">
            <ShoppingBag size={24} />
          </div>
          <span className="brand-title">S-shopping</span>
          <span className="brand-subtitle">Kênh Người Bán</span>
        </div>

        <div className="nav-actions">
          {mode !== 'login' && (
            <button className="nav-btn-secondary" onClick={() => { setMode('login'); setSlifePhone(''); setSlifePassword(''); setAuthError(''); }}>
              <LogOut size={16} />
              Đăng Xuất
            </button>
          )}
          {mode !== 'wizard' && (
            <button className="nav-btn-secondary" onClick={() => setMode('wizard')}>
              <SLifeIcon size={18} />
              Đăng ký Cửa hàng Mới
            </button>
          )}
          {mode === 'dashboard' && (
            <button className="nav-btn-primary" onClick={() => setShowAddProductModal(true)}>
              <Plus size={18} />
              + Đăng Bán Sản Phẩm
            </button>
          )}
          <a href="#help" className="nav-btn-secondary" onClick={(e) => { e.preventDefault(); alert('Kênh Hỗ trợ Người Bán S-shopping trực tuyến!'); }}>
            <HelpCircle size={16} />
            Hỗ trợ
          </a>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1️⃣ MODE: LOGIN FORM (CLEAN PRODUCTION LOOK - NO DEMO TEXT / RED ALERTS) */}
      {/* ========================================================================= */}
      {mode === 'login' && (
        <main className="login-hero-container">
          <div className="login-content-grid">
            
            {/* Left Pitch Column */}
            <div className="hero-left-pitch">
              <div className="hero-badge">
                <SLifeIcon size={16} /> ĐĂNG NHẬP BẰNG TÀI KHOẢN S-LIFE
              </div>
              <h1 className="hero-main-title">
                Bán hàng chuyên nghiệp cùng <span className="hero-title-highlight">S-shopping</span>
              </h1>
              <p className="hero-sub-text">
                Quản lý shop của bạn một cách hiệu quả hơn trên S-shopping với hệ thống S-shopping - Kênh Người bán hiện đại bậc nhất.
              </p>

              {/* Feature Highlights Grid */}
              <div className="features-list-grid">
                <div className="feature-mini-card">
                  <div className="feature-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="feature-title">Định Danh S-life SSO</span>
                  <span className="feature-desc">Một tài khoản duy nhất cho toàn bộ hệ sinh thái</span>
                </div>

                <div className="feature-mini-card">
                  <div className="feature-icon-box">
                    <TrendingUp size={18} />
                  </div>
                  <span className="feature-title">Tăng 300% Doanh Số</span>
                  <span className="feature-desc">Bộ công cụ Marketing & Flash Sale tự động</span>
                </div>

                <div className="feature-mini-card">
                  <div className="feature-icon-box">
                    <Truck size={18} />
                  </div>
                  <span className="feature-title">Giao Hàng 2H</span>
                  <span className="feature-desc">Tự động kết nối GHN, Viettel Post, GrabExpress</span>
                </div>
              </div>

              {/* Dynamic Interactive Illustration */}
              <div className="hero-illustration-box">
                <div className="floating-stat-badge pos-top">
                  <Star size={18} color="#EAB308" fill="#EAB308" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800' }}>4.9/5.0 Rating</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>150,000+ Đánh giá tốt</div>
                  </div>
                </div>

                <div className="floating-stat-badge pos-bottom">
                  <Zap size={18} color="#00B14F" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>+1,500 Đơn/ngày</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Xử lý siêu tốc</div>
                  </div>
                </div>

                {/* Center graphic building */}
                <div style={{ textAlign: 'center' }}>
                  <Store size={72} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>S-SHOPPING SELLER PORTAL</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hệ sinh thái Tài khoản S-life</span>
                </div>
              </div>
            </div>

            {/* Right Column: S-LIFE CREDENTIALS CARD */}
            <div className="login-card-container">
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', padding: '8px 16px', borderRadius: '16px' }}>
                  <SLifeIcon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary-dark)' }}>ĐĂNG NHẬP TÀI KHOẢN S-LIFE</span>
                </div>
              </div>

              {/* DYNAMIC AUTH ERROR ALERT NOTICE (ONLY DISPLAYED ON INCORRECT ATTEMPT) */}
              {authError !== '' && (
                <div style={{ background: '#FEF2F2', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px', fontWeight: '600', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <div className="tab-switcher-row">
                <button 
                  className={`switcher-tab ${loginTab === 'slife' ? 'active' : ''}`}
                  onClick={() => setLoginTab('slife')}
                >
                  Nhập mật khẩu S-life
                </button>
                <button 
                  className="nav-btn-secondary"
                  style={{ border: '1px solid var(--border)', fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setLoginTab('qr')}
                >
                  <QrCode size={16} color="var(--primary)" />
                  Quét QR App S-life
                </button>
              </div>

              {loginTab === 'slife' ? (
                <form onSubmit={handleSLifeAuthSubmit}>
                  <div className="input-field-group">
                    <label className="input-label-text">Số điện thoại / Email S-life *</label>
                    <div className="input-with-icon">
                      <Smartphone size={18} className="input-icon-prefix" />
                      <input 
                        type="text" 
                        className="stylish-input" 
                        placeholder="Nhập SĐT hoặc email S-life..."
                        value={slifePhone}
                        onChange={(e) => { setSlifePhone(e.target.value); if(authError) setAuthError(''); }}
                      />
                    </div>
                  </div>

                  <div className="input-field-group">
                    <label className="input-label-text">Mật khẩu S-life *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon-prefix" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="stylish-input" 
                        placeholder="Nhập mật khẩu S-life..."
                        value={slifePassword}
                        onChange={(e) => { setSlifePassword(e.target.value); if(authError) setAuthError(''); }}
                      />
                      <button 
                        type="button" 
                        style={{ position: 'absolute', right: '14px', color: 'var(--text-muted)' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="primary-login-btn">
                    <SLifeIcon size={20} />
                    ĐĂNG NHẬP KÊNH NGƯỜI BÁN
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <a href="#forgot" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }} onClick={(e) => { e.preventDefault(); alert('🔒 Mã OTP khôi phục mật khẩu S-life đã được gửi qua SMS.'); }}>
                      Quên mật khẩu S-life?
                    </a>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' }}>
                    Bằng việc đăng nhập bằng Tài khoản S-life, bạn đồng ý với <a href="#terms" style={{ color: 'var(--primary)', fontWeight: '700' }}>Điều khoản dịch vụ S-life</a> & <a href="#privacy" style={{ color: 'var(--primary)', fontWeight: '700' }}>Chính sách bảo mật</a>
                  </p>

                  <div className="register-callout-box">
                    <span>Bạn chưa đăng ký Cửa hàng?</span>
                    <button type="button" className="register-callout-btn" onClick={() => setMode('wizard')}>
                      Đăng ký tạo Cửa hàng ngay
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SShoppingSLifeLoginSystem" 
                    alt="QR Code S-life" 
                    style={{ width: 180, height: 180, borderRadius: '12px', border: '1px solid var(--border)', padding: '10px' }} 
                  />
                  <h3 style={{ fontSize: '14px', fontWeight: '800', marginTop: '16px' }}>Quét mã QR bằng App S-life</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Tài khoản S-life của bạn sẽ tự động được xác thực.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2️⃣ MODE: STORE ONBOARDING WIZARD */}
      {/* ========================================================================= */}
      {mode === 'wizard' && (
        <main className="wizard-main-wrapper">
          <div className="wizard-card-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <button className="nav-btn-secondary" onClick={() => setMode('login')}>
                <ArrowLeft size={16} /> Quay lại Đăng nhập
              </button>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)' }}>ĐĂNG KÝ MỞ CỬA HÀNG BẰNG TÀI KHOẢN S-LIFE</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tự động liên kết thông tin chủ shop từ hệ sinh thái S-life</p>
              </div>
            </div>

            {/* Stepper Header */}
            <div className="wizard-progress-bar">
              {[
                { step: 1, title: 'Thông tin Shop' },
                { step: 2, title: 'Pháp lý & Thuế' },
                { step: 3, title: 'Kho & Vận chuyển' },
                { step: 4, title: 'Ngân hàng đối soát' }
              ].map(s => (
                <div 
                  key={s.step} 
                  className={`wizard-step-node ${wizardStep === s.step ? 'active' : ''}`}
                  onClick={() => setWizardStep(s.step)}
                >
                  <div className="step-number-circle">{s.step}</div>
                  <span className="step-title-text">{s.title}</span>
                </div>
              ))}
            </div>

            <div className="wizard-split-layout">
              {/* Form Side */}
              <div>
                {wizardStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>THÔNG TIN SHOP</h3>
                    
                    <label className="input-label-text">Tên Shop *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.name} onChange={e => setShopInfo({ ...shopInfo, name: e.target.value })} placeholder="Ví dụ: Tài khoản thử nghiệm" />

                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label className="input-label-text" style={{ marginBottom: 0 }}>Địa chỉ lấy hàng *</label>
                      <button className="nav-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border)' }} onClick={() => setShowAddressModal(true)}>
                        + Thêm
                      </button>
                    </div>
                    {shopInfo.address && shopInfo.address !== '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' ? (
                       <div style={{ padding: '10px 14px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '8px', fontSize: '13px' }}>
                          <strong>{shopInfo.addressName || shopInfo.name}</strong> - {shopInfo.addressPhone || shopInfo.phone}<br/>
                          <span style={{ color: 'var(--text-secondary)' }}>{shopInfo.address}</span>
                       </div>
                    ) : (
                       <div style={{ padding: '12px', background: 'var(--bg-page)', borderRadius: '8px', border: '1px dashed var(--border)', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                         Chưa có địa chỉ lấy hàng
                       </div>
                    )}

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Email *</label>
                    <input type="email" className="stylish-input" style={{ paddingLeft: '16px', background: 'var(--bg-page)' }} value={shopInfo.email || ''} onChange={e => setShopInfo({ ...shopInfo, email: e.target.value })} placeholder="email@example.com" />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Số điện thoại *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px', background: 'var(--bg-page)' }} value={shopInfo.phone} onChange={e => setShopInfo({ ...shopInfo, phone: e.target.value })} placeholder="+84394562659" />
                  </div>
                )}

                {wizardStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>2. THÔNG TIN PHÁP LÝ & THUẾ</h3>
                    <label className="input-label-text">Loại hình thành lập</label>
                    <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                      {['Cá nhân', 'Hộ kinh doanh', 'Công ty / Doanh nghiệp'].map(t => (
                        <button 
                          key={t}
                          type="button"
                          className={`nav-btn-secondary ${shopInfo.businessType === t ? 'nav-btn-primary' : ''}`}
                          onClick={() => setShopInfo({ ...shopInfo, businessType: t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Mã Số Thuế (MST) *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.taxId} onChange={e => setShopInfo({ ...shopInfo, taxId: e.target.value })} placeholder="Mã số thuế..." />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Số Giấy phép kinh doanh (GPKD)</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.licenseNo} onChange={e => setShopInfo({ ...shopInfo, licenseNo: e.target.value })} placeholder="Số GPKD..." />
                  </div>
                )}

                {wizardStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>3. ĐỊA CHỈ KHO & VẬN CHUYỂN</h3>
                    <label className="input-label-text">Địa chỉ kho nhận/lấy hàng *</label>
                    <textarea className="stylish-input" style={{ height: '80px', padding: '12px 16px' }} value={shopInfo.address} onChange={e => setShopInfo({ ...shopInfo, address: e.target.value })} placeholder="Địa chỉ chi tiết..." />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Số điện thoại liên hệ kho *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.phone} onChange={e => setShopInfo({ ...shopInfo, phone: e.target.value })} placeholder="090 123 4567" />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Đơn vị vận chuyển hợp tác</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {['GHN Express', 'Viettel Post', 'Shopee Express', 'GrabExpress'].map(p => (
                        <span key={p} style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>4. TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT DOANH THU</h3>
                    <label className="input-label-text">Tên Ngân Hàng *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.bankName} onChange={e => setShopInfo({ ...shopInfo, bankName: e.target.value })} placeholder="Vietcombank, Techcombank..." />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Số Tài Khoản Ngân Hàng *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.bankAccount} onChange={e => setShopInfo({ ...shopInfo, bankAccount: e.target.value })} placeholder="Số tài khoản..." />

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Tên Chủ Tài Khoản (In hoa không dấu) *</label>
                    <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.bankHolder} onChange={e => setShopInfo({ ...shopInfo, bankHolder: e.target.value })} placeholder="NGUYEN VAN A" />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
                  {wizardStep > 1 ? (
                    <button className="nav-btn-secondary" style={{ width: '130px', justifyContent: 'center' }} onClick={() => setWizardStep(wizardStep - 1)}>
                      Quay lại
                    </button>
                  ) : <div></div>}

                  {wizardStep < 4 ? (
                    <button className="nav-btn-primary" style={{ padding: '10px 24px' }} onClick={() => setWizardStep(wizardStep + 1)}>
                      Tiếp theo &gt;
                    </button>
                  ) : (
                    <button className="nav-btn-primary" style={{ padding: '12px 28px' }} onClick={handleFinishWizard}>
                      <Sparkles size={16} /> Hoàn Tất & Kích Hoạt Shop
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side: Live Phone Mockup Preview */}
              <div style={{ background: 'var(--bg-page)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>
                  XEM TRƯỚC GIAO DIỆN SHOP MOCKUP
                </span>
                <div style={{ width: '280px', background: '#fff', borderRadius: '24px', border: '4px solid var(--text-primary)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                  <img src={shopInfo.cover} alt="Cover" style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px', marginTop: '-30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={shopInfo.logo} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{shopInfo.name}</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{shopInfo.slogan}</p>
                      <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                        S-SHOP MALL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3️⃣ MODE: FULL ENTERPRISE DESKTOP DASHBOARD & PRODUCT MANAGER */}
      {/* ========================================================================= */}
      {mode === 'dashboard' && (
        <div className="app-dashboard-container">
          {/* Left Sidebar */}
          <aside className="app-sidebar">
            <div 
              className={`sidebar-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} />
                <span>Kho & Đăng Sản Phẩm</span>
              </div>
              <span className="nav-badge-count">{products.length}</span>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={18} />
                <span>Thống Kê & Doanh Thu</span>
              </div>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} />
                <span>Quản Lý Đơn Hàng</span>
              </div>
              <span className="nav-badge-count">{orders.length}</span>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={18} />
                <span>Cấu Hình Cửa Hàng</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dashboard-main-view">
            
            {/* TAB: PRODUCT CATALOG */}
            {activeTab === 'products' && (
              <div>
                <div className="catalog-table-card">
                  <div className="catalog-table-header">
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)' }}>DANH SÁCH KHO HÀNG SẢN PHẨM ({filteredProducts.length})</h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Quản lý niêm yết giá, biến thể, tồn kho và đăng bán sản phẩm mới</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="input-with-icon" style={{ width: '240px' }}>
                        <Search size={16} className="input-icon-prefix" />
                        <input 
                          type="text" 
                          className="stylish-input" 
                          style={{ height: '40px', fontSize: '13px', paddingLeft: '40px' }} 
                          placeholder="Tìm sản phẩm, SKU..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <button className="nav-btn-primary" onClick={() => setShowAddProductModal(true)}>
                        <Plus size={18} /> + Thêm sản phẩm mới
                      </button>
                    </div>
                  </div>

                  <table className="catalog-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm & SKU</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Giá gốc</th>
                        <th>Kho hàng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <img src={p.image} alt={p.name} className="product-row-thumb" />
                              <div>
                                <span style={{ fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>{p.name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SKU: {p.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="status-tag" style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>{p.category}</span></td>
                          <td style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '15px' }}>{p.price.toLocaleString('vi-VN')}đ</td>
                          <td style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '13px' }}>{p.origPrice ? p.origPrice.toLocaleString('vi-VN') + 'đ' : '-'}</td>
                          <td style={{ fontWeight: '800' }}>{p.stock} cái</td>
                          <td>
                            <span className={`status-tag ${p.status === 'Đang bán' ? 'active' : 'out'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <button style={{ color: 'var(--red)', padding: '6px', background: 'var(--red-light)', borderRadius: '8px' }} onClick={() => handleDeleteProduct(p.id)} title="Xóa sản phẩm">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === 'stats' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>TỔNG QUAN HIỆU SUẤT KINH DOANH S-SHOPPING</h2>
                <div className="metrics-row-grid">
                  <div className="metric-card-box">
                    <div className="metric-number">148.5M đ</div>
                    <div className="metric-label-text">Doanh thu tháng này</div>
                    <span className="metric-trend-pill">📈 +18.4% so với tuần trước</span>
                  </div>
                  <div className="metric-card-box">
                    <div className="metric-number">62 đơn</div>
                    <div className="metric-label-text">Đơn hàng hoàn tất</div>
                    <span className="metric-trend-pill">🚀 Đã bàn giao 100%</span>
                  </div>
                  <div className="metric-card-box">
                    <div className="metric-number">18,250</div>
                    <div className="metric-label-text">Lượt xem gian hàng</div>
                    <span className="metric-trend-pill">👁️ +3.2k tuần này</span>
                  </div>
                  <div className="metric-card-box">
                    <div className="metric-number" style={{ color: 'var(--primary)' }}>99.2%</div>
                    <div className="metric-label-text">Tỉ lệ phản hồi Chat</div>
                    <span className="metric-trend-pill">⚡ Phản hồi trong 2 phút</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="catalog-table-card">
                <div className="catalog-table-header">
                  <h2 style={{ fontSize: '20px', fontWeight: '900' }}>QUẢN LÝ ĐƠN HÀNG KÊNH NGƯỜI BÁN</h2>
                </div>
                <table className="catalog-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: '800' }}>{o.id}</td>
                        <td>{o.customer}</td>
                        <td>{o.items}</td>
                        <td style={{ fontWeight: '900', color: 'var(--primary)' }}>{o.total.toLocaleString('vi-VN')}đ</td>
                        <td>
                          <span className={`status-tag ${o.status === 'Chờ bàn giao' ? 'out' : 'active'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          {o.status === 'Chờ bàn giao' && (
                            <button className="nav-btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => handleFulfillOrder(o.id)}>
                              <Printer size={14} /> In nhãn & Bàn giao
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="catalog-table-card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>THÔNG TIN GIAN HÀNG CHÍNH THỨC</h2>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <img src={shopInfo.logo} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900' }}>{shopInfo.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{shopInfo.slogan}</p>
                    <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', marginTop: '6px' }}>MST: {shopInfo.taxId} | GPKD: {shopInfo.licenseNo}</p>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* ➕ MODAL THÊM SẢN PHẨM MỚI */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '640px', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', color: 'var(--text-primary)' }}>ĐĂNG BÁN SẢN PHẨM MỚI</h2>
            <form onSubmit={handleCreateProduct}>
              <label className="input-label-text">Tên sản phẩm *</label>
              <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="Nhập tên sản phẩm..." required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <div>
                  <label className="input-label-text">Giá bán (VND) *</label>
                  <input type="number" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="450000" required />
                </div>
                <div>
                  <label className="input-label-text">Giá niêm yết (Gốc)</label>
                  <input type="number" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdOrigPrice} onChange={e => setNewProdOrigPrice(e.target.value)} placeholder="600000" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <div>
                  <label className="input-label-text">Danh mục sản phẩm</label>
                  <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} placeholder="Thời trang, Điện tử..." />
                </div>
                <div>
                  <label className="input-label-text">Số lượng kho hàng</label>
                  <input type="number" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdStock} onChange={e => setNewProdStock(e.target.value)} placeholder="100" />
                </div>
              </div>

              <label className="input-label-text" style={{ marginTop: '14px' }}>Biến thể (Màu sắc / Kích thước)</label>
              <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdVariants} onChange={e => setNewProdVariants(e.target.value)} placeholder="Đen, Trắng, Xanh, Size M, Size L" />

              <label className="input-label-text" style={{ marginTop: '14px' }}>URL Ảnh sản phẩm (Unsplash)</label>
              <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={newProdImage} onChange={e => setNewProdImage(e.target.value)} placeholder="Link URL hình ảnh..." />

              <label className="input-label-text" style={{ marginTop: '14px' }}>Mô tả sản phẩm</label>
              <textarea className="stylish-input" style={{ height: '80px', padding: '12px 16px' }} value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} placeholder="Mô tả chi tiết sản phẩm..." />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="nav-btn-secondary" style={{ width: '110px', justifyContent: 'center' }} onClick={() => setShowAddProductModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="nav-btn-primary" style={{ padding: '10px 24px' }}>
                  Đăng Bán Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ MODAL THÊM ĐỊA CHỈ MỚI */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Thêm Địa Chỉ Mới</h2>
              <button onClick={() => setShowAddressModal(false)} style={{ color: 'var(--text-muted)' }}>X</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Họ & Tên</label>
                <input type="text" className="stylish-input" style={{ paddingLeft: '14px', height: '36px', fontSize: '13px' }} value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} placeholder="Nhập vào" />
              </div>
              <div>
                <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Số điện thoại</label>
                <input type="text" className="stylish-input" style={{ paddingLeft: '14px', height: '36px', fontSize: '13px' }} value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} placeholder="Nhập vào" />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tỉnh/Thành phố/Phường/Xã</label>
              <select className="stylish-input" style={{ paddingLeft: '14px', height: '36px', fontSize: '13px', appearance: 'auto' }} value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}>
                <option value="">Chọn</option>
                <option value="Thành phố Hà Nội">Thành phố Hà Nội</option>
                <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
                <option value="Thành phố Đà Nẵng">Thành phố Đà Nẵng</option>
              </select>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Địa chỉ chi tiết</label>
              <textarea className="stylish-input" style={{ height: '70px', padding: '12px 14px', fontSize: '13px' }} value={newAddress.detail} onChange={e => setNewAddress({...newAddress, detail: e.target.value})} placeholder="Số nhà, tên đường v.v." />
            </div>

            {/* Google Map Mockup */}
            {newAddress.detail && (
              <div style={{ marginTop: '16px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', height: '160px' }}>
                <img src="https://i.stack.imgur.com/HILmr.png" alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#EF4444', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '80%' }}>
                  Vietnam<br/>
                  <span style={{ fontWeight: 'normal', fontSize: '10px' }}>{newAddress.detail}, {newAddress.city}</span>
                </div>
                <div style={{ position: 'absolute', top: 'calc(50% + 20px)', left: '50%', transform: 'translateX(-50%)', color: '#EF4444' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="nav-btn-secondary" style={{ width: '80px', justifyContent: 'center', fontSize: '13px' }} onClick={() => setShowAddressModal(false)}>
                Hủy
              </button>
              <button className="nav-btn-primary" style={{ padding: '8px 24px', background: '#EF4444', color: '#fff', border: 'none', fontSize: '13px' }} onClick={() => {
                setShopInfo({...shopInfo, address: `${newAddress.detail}, ${newAddress.city}`, addressName: newAddress.name, addressPhone: newAddress.phone});
                setShowAddressModal(false);
              }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
