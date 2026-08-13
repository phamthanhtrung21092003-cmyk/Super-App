import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, HelpCircle, Eye, EyeOff, QrCode, 
  Store, Plus, Trash2, ArrowLeft, CheckCircle2, 
  RefreshCw, Printer, AlertCircle, Sparkles, LogOut, TrendingUp,
  Search, ShieldCheck, Truck, Zap, Star, Lock, User,
  Smartphone, KeyRound, Check, AlertTriangle, MessageSquare, Settings, Wallet
} from 'lucide-react';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WelcomeBar from './components/dashboard/WelcomeBar';
import KpiCards from './components/dashboard/KpiCards';
import PendingActions from './components/dashboard/PendingActions';
import RevenueChart from './components/dashboard/RevenueChart';
import RecentOrders from './components/dashboard/RecentOrders';
import TopProducts from './components/dashboard/TopProducts';
import InventoryAlerts from './components/dashboard/InventoryAlerts';
import VideoLivestream from './components/dashboard/VideoLivestream';
import FinancialOverview from './components/dashboard/FinancialOverview';
import ShopHealth from './components/dashboard/ShopHealth';
import PlatformNews from './components/dashboard/PlatformNews';
import QuickActions from './components/dashboard/QuickActions';
import OnboardingChecklist from './components/dashboard/OnboardingChecklist';
import ProductHeader from './components/products/ProductHeader';
import ProductTabs from './components/products/ProductTabs';
import ProductMetrics from './components/products/ProductMetrics';
import ProductFilters from './components/products/ProductFilters';
import ProductTable from './components/products/ProductTable';
import ProductForm from './components/product-form/ProductForm';
import OrderHeader from './components/orders/OrderHeader';
import OrderTabs from './components/orders/OrderTabs';
import OrderMetrics from './components/orders/OrderMetrics';
import OrderFilters from './components/orders/OrderFilters';
import OrderTable from './components/orders/OrderTable';
import OrderDetailDrawer from './components/orders/OrderDetailDrawer';
import InventoryManager from './components/inventory/InventoryManager';
import ShippingOverview from './components/shipping/ShippingOverview';
import ShippingFilters from './components/shipping/ShippingFilters';
import ShippingTable from './components/shipping/ShippingTable';
import ShippingDetailDrawer from './components/shipping/ShippingDetailDrawer';
import ShippingProviders from './components/shipping/ShippingProviders';
import ShippingManager from './components/shipping/ShippingManager';
import FinanceKpiCards from './components/finance/FinancialOverview';
import FinanceRevenueChart from './components/finance/RevenueChart';
import FinanceRevenueSources from './components/finance/RevenueSources';
import FinanceRecentTransactions from './components/finance/RecentTransactions';
import FinanceSettlementCard from './components/finance/SettlementCard';
import FinanceWithdrawModal from './components/finance/WithdrawModal';
import FinanceManager from './components/finance/FinanceManager';
import PromotionsManager from './components/promotions/PromotionsManager';
import sellerService, { MOCK_ORDERS_DEMO, MOCK_SHIPPING_DEMO } from './data/sellerService';

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
  { phone: '0987654321', password: '123456', ownerName: 'Trần Thị Người Bán', shopName: 'Minimalist Studio' },
  // Tài khoản S-life trắng (chưa có shop) để test luồng Đăng ký bán hàng
  { phone: '0888888888', password: '123456', ownerName: 'Người Dùng S-Life', shopName: null }
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
  const [useCustomPhone, setUseCustomPhone] = useState(false);
  const [kycStatus, setKycStatus] = useState('NOT_SUBMITTED'); // NOT_SUBMITTED, PENDING, VERIFIED, REJECTED
  const [shopNameStatus, setShopNameStatus] = useState(null); // null, 'available', 'unavailable'
  const [cccdFrontImg, setCccdFrontImg] = useState(null);
  const [cccdBackImg, setCccdBackImg] = useState(null);
  const [faceImg, setFaceImg] = useState(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankVerifySuccess, setBankVerifySuccess] = useState(false);

  const handleBankAccountChange = (val) => {
    setShopInfo(prev => ({ ...prev, bankAccount: val, bankStatus: 'Chưa xác minh' }));
    setBankVerifySuccess(false);

    if (val.trim().length >= 6) {
      setIsVerifyingBank(true);
      setTimeout(() => {
        setIsVerifyingBank(false);
        setBankVerifySuccess(true);
        setShopInfo(prev => ({
          ...prev,
          bankAccount: val,
          bankHolder: prev.fullName ? prev.fullName.toUpperCase() : (prev.bankHolder || 'NGUYỄN VĂN A'),
          bankStatus: 'Đã xác minh'
        }));
      }, 750);
    }
  };

  const handleCccdUpload = (type, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (type === 'front') setCccdFrontImg(url);
      if (type === 'back') setCccdBackImg(url);
      if (type === 'face') setFaceImg(url);

      if (type === 'front' || type === 'back') {
        setIsOcrScanning(true);
        setOcrSuccess(false);
        setTimeout(() => {
          setIsOcrScanning(false);
          setOcrSuccess(true);
          setShopInfo(prev => ({
            ...prev,
            fullName: prev.fullName || 'NGUYỄN VĂN A',
            cccdNumber: prev.cccdNumber || '036203015892',
            cccdIssueDate: prev.cccdIssueDate || '2022-04-20',
            bankHolder: prev.fullName || 'NGUYỄN VĂN A'
          }));
          setKycStatus('PENDING');
        }, 900);
      }
    }
  };

  const [shopInfo, setShopInfo] = useState({
    name: 'S-Shopping Store của tôi',
    username: 'my_sshopping_store',
    slogan: 'Chất lượng hàng đầu - Phục vụ tận tâm 24/7',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300',
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    
    // KYC
    sellerType: 'Cá nhân', // Cá nhân, Hộ kinh doanh, Doanh nghiệp
    fullName: '',
    cccdNumber: '',
    cccdIssueDate: '',
    cccdIssuePlace: '',
    taxId: '',
    licenseNo: '',
    companyName: '',
    representative: '',

    // Shipping & Address
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0901234567',
    email: 'shop@s-life.vn',
    shippingProviders: ['V-life Delivery', 'GHN'],

    // Payment
    bankName: 'Vietcombank',
    bankAccount: '10123456789',
    bankHolder: 'NGUYEN VAN A',
    bankStatus: 'Chưa xác minh' // Chưa xác minh, Đang xác minh, Đã xác minh, Xác minh thất bại
  });

  // --- DASHBOARD STATES (PHASE 1) ---
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [kpiData, setKpiData] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [orderFilter, setOrderFilter] = useState('Tất cả');

  // Active Seller Initial State (pre-populated with orders & products matching screenshot)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS_DEMO);

  useEffect(() => {
    sellerService.getKpiMetrics('today', orders, products).then(data => setKpiData(data));
    sellerService.getPendingActions(orders).then(actions => setPendingActions(actions));
  }, [orders, products]);

  const handleKpiPeriodChange = async (period) => {
    const data = await sellerService.getKpiMetrics(period, orders, products);
    setKpiData(data);
  };

  const handlePendingActionClick = (targetTab, filter) => {
    if (filter) setOrderFilter(filter);
    else setOrderFilter('Tất cả');
    setActiveTab(targetTab);
  };

  // Product Catalog Module States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productModuleTab, setProductModuleTab] = useState('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Tất cả danh mục');
  const [productStatusFilter, setProductStatusFilter] = useState('Tất cả');
  const [productSortOrder, setProductSortOrder] = useState('newest');
  const [productViewMode, setProductViewMode] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productMetrics, setProductMetrics] = useState({ total: 0, active: 0, hidden: 0, outofstock: 0, draft: 0 });

  useEffect(() => {
    sellerService.getProductMetrics(products).then(m => setProductMetrics(m));
  }, [products]);

  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      const updated = await sellerService.updateProduct(products, editingProduct.id, formData);
      setProducts(updated);
    } else {
      const created = await sellerService.createProduct(formData);
      setProducts([created, ...products]);
    }
    setIsProductFormOpen(false);
    setShowAddProductModal(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleToggleStatusProduct = async (product) => {
    const nextStatus = product.status === 'Đang bán' ? 'Tạm ẩn' : 'Đang bán';
    const updated = await sellerService.updateProductStatus(products, product.id, nextStatus);
    setProducts(updated);
  };

  const handleDeleteProduct = async (productOrId) => {
    const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
    const updated = await sellerService.deleteProduct(products, id);
    setProducts(updated);
  };

  const handleBulkActionProduct = async (action, productIds, extraValue) => {
    const updated = await sellerService.bulkUpdateProducts(products, productIds, action, extraValue);
    setProducts(updated);
  };

  // Order Management Module States
  const [isDemoOrderState, setIsDemoOrderState] = useState(true);
  const [orderModuleTab, setOrderModuleTab] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderProviderFilter, setOrderProviderFilter] = useState('Tất cả');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderMetrics, setOrderMetrics] = useState({ total: 0, confirm: 0, pickup: 0, delivering: 0, completed: 0, cancelled: 0, returned: 0 });

  // Resolve active orders list based on demo toggle state
  const activeOrdersDataset = isDemoOrderState 
    ? (orders && orders.length > 0 ? orders : MOCK_ORDERS_DEMO)
    : [];

  useEffect(() => {
    sellerService.getOrderMetrics(activeOrdersDataset).then(m => setOrderMetrics(m));
  }, [isDemoOrderState, orders]);

  const handleUpdateSingleOrderStatus = async (orderId, newStatus) => {
    const targetDataset = orders && orders.length > 0 ? orders : MOCK_ORDERS_DEMO;
    const updated = await sellerService.updateOrderStatus(targetDataset, orderId, newStatus);
    setOrders(updated);
  };

  const handleBulkUpdateOrderStatus = async (orderIds, newStatus) => {
    const targetDataset = orders && orders.length > 0 ? orders : MOCK_ORDERS_DEMO;
    const updated = await sellerService.bulkUpdateOrderStatus(targetDataset, orderIds, newStatus);
    setOrders(updated);
  };

  // Shipping Module States
  const [shippingTab, setShippingTab] = useState('all');
  const [shippingSearchQuery, setShippingSearchQuery] = useState('');
  const [shippingProviderFilter, setShippingProviderFilter] = useState('Tất cả');
  const [shippingStatusFilter, setShippingStatusFilter] = useState('Tất cả');
  const [shippingWarehouseFilter, setShippingWarehouseFilter] = useState('Tất cả');
  const [selectedShippingDetail, setSelectedShippingDetail] = useState(null);
  const [shippingOrdersList, setShippingOrdersList] = useState(MOCK_SHIPPING_DEMO);
  const [shippingOverview, setShippingOverview] = useState({ pendingPickup: 0, pickingUp: 0, delivering: 0, success: 0, failed: 0, total: 0 });
  const [shippingProvidersList, setShippingProvidersList] = useState([]);

  // Resolve active shipping dataset based on products
  const isShippingEmpty = !products || products.length === 0;

  useEffect(() => {
    sellerService.getShippingOverview(shippingOrdersList, isShippingEmpty).then(res => setShippingOverview(res));
    sellerService.getShippingProviders(isShippingEmpty).then(res => setShippingProvidersList(res));
  }, [isShippingEmpty, shippingOrdersList]);

  // Finance Module States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [financeOverviewData, setFinanceOverviewData] = useState(null);
  const [revenueSourcesData, setRevenueSourcesData] = useState(null);
  const [recentTransactionsList, setRecentTransactionsList] = useState([]);
  const [settlementInfoData, setSettlementInfoData] = useState(null);

  useEffect(() => {
    sellerService.getFinancialOverview(orders).then(res => setFinanceOverviewData(res));
    sellerService.getRevenueSources().then(res => setRevenueSourcesData(res));
    sellerService.getRecentTransactions().then(res => setRecentTransactionsList(res));
    sellerService.getSettlementInfo().then(res => setSettlementInfoData(res));
  }, [orders]);

  const handleWithdrawSuccess = (numAmount) => {
    if (financeOverviewData) {
      const newBal = (financeOverviewData.availableBalance || 18500000) - numAmount;
      setFinanceOverviewData({
        ...financeOverviewData,
        availableBalance: newBal,
        formattedAvailable: `${newBal.toLocaleString('vi-VN')}đ`
      });
    }
    setShowWithdrawModal(false);
    alert(`Đã gửi yêu cầu rút ${numAmount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng thành công!`);
  };

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    city: '',
    provinceCode: '',
    district: '',
    districtCode: '',
    ward: '',
    wardCode: '',
    detail: ''
  });

  const [apiProvinces, setApiProvinces] = useState([]);
  const [apiWards, setApiWards] = useState([]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => {
         const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
         setApiProvinces(sorted);
      })
      .catch(e => console.error(e));
  }, []);

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const pName = e.target.options[e.target.selectedIndex].text;
    setNewAddress({...newAddress, provinceCode: code, city: pName, wardCode: '', ward: ''});
    if (code) {
      fetch(`https://provinces.open-api.vn/api/v2/p/${code}?depth=2`)
        .then(res => res.json())
        .then(data => {
           const sortedWards = (data.wards || []).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
           setApiWards(sortedWards);
        })
        .catch(e => console.error(e));
    } else {
      setApiWards([]);
    }
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const wName = e.target.options[e.target.selectedIndex].text;
    setNewAddress({...newAddress, wardCode: code, ward: wName});
  };

  // --- REGISTER S-LIFE STATES ---
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleSLifeRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regPhone || !regPassword) {
      setAuthError('Vui lòng nhập Số điện thoại và Mật khẩu S-life.');
      return;
    }
    
    // Giả lập hệ thống tự động lấy Tên từ hồ sơ S-life đã có
    const slifeName = 'Chủ Shop S-life';
    let acc = PRE_REGISTERED_ACCOUNTS.find(a => a.phone === regPhone);
    
    if (!acc) {
      // Create new account and add to mock DB
      acc = { phone: regPhone, password: regPassword, ownerName: slifeName, shopName: null };
      PRE_REGISTERED_ACCOUNTS.push(acc);
    } else {
      if (acc.password !== regPassword) {
        setAuthError('Mật khẩu S-life không đúng!');
        return;
      }
      if (acc.shopName) {
        setAuthError('Tài khoản này đã mở Cửa hàng rồi! Vui lòng chuyển sang Đăng nhập.');
        return;
      }
    }
    
    // Log them in and take them to wizard
    setLoggedInUser(acc);
    setAuthError('');
    setMode('wizard');
  };

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
      if (!matchedAccount.shopName) {
        setAuthError('Mật khẩu hoặc Số điện thoại/Email S-life không đúng. Vui lòng kiểm tra lại!');
        return;
      }

      setLoggedInUser(matchedAccount);
      setAuthError('');
      setMode('dashboard');
    } else {
      setAuthError('Mật khẩu hoặc Số điện thoại/Email S-life không đúng. Vui lòng kiểm tra lại!');
    }
  };

  const handleFinishWizard = () => {
    setWizardStep(5);
  };

  const handleGoToDashboard = (showModal = false) => {
    const userPhone = loggedInUser?.phone;
    const updatedUser = { 
      ...(loggedInUser || {}), 
      shopName: shopInfo.name || 'S-Shopping Store',
      ownerName: loggedInUser?.ownerName || shopInfo.fullName || 'Chủ Shop'
    };
    setLoggedInUser(updatedUser);
    
    if (userPhone) {
      const dbIndex = PRE_REGISTERED_ACCOUNTS.findIndex(acc => acc.phone === userPhone);
      if (dbIndex >= 0) {
        PRE_REGISTERED_ACCOUNTS[dbIndex].shopName = shopInfo.name;
      }
    }
    
    setMode('dashboard');
    if (showModal) {
      setShowAddProductModal(true);
    }
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

  const handleFulfillOrder = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Đã giao ĐVVC' } : o));
    alert(`🖨️ Đã in nhãn đơn hàng ${id} và chuyển cho Đơn vị vận chuyển!`);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const q = (productSearchQuery || '').toLowerCase();
    const cat = productCategoryFilter || 'Tất cả';
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    const matchesCat = cat === 'Tất cả' || cat === 'Tất cả danh mục' || p.category === cat;
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
          {mode !== 'login' && mode !== 'register_slife' && (
            <button className="nav-btn-secondary" onClick={() => { setMode('login'); setSlifePhone(''); setSlifePassword(''); setAuthError(''); }}>
              <LogOut size={16} />
              Đăng Xuất
            </button>
          )}
          {mode !== 'wizard' && mode !== 'register_slife' && (
            <button className="nav-btn-secondary" onClick={() => setMode('register_slife')}>
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
                    <span>Bạn chưa có Tài khoản S-life?</span>
                    <button type="button" className="register-callout-btn" onClick={() => { setMode('register_slife'); setAuthError(''); }}>
                      Đăng ký tài khoản S-life ngay
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
      {/* 1.5️⃣ MODE: REGISTER S-LIFE ACCOUNT */}
      {/* ========================================================================= */}
      {mode === 'register_slife' && (
        <main className="login-hero-container">
          <div className="login-content-grid" style={{ justifyContent: 'center' }}>
            <div className="login-card-container" style={{ margin: '0 auto', maxWidth: '450px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', padding: '8px 16px', borderRadius: '16px' }}>
                  <SLifeIcon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary-dark)' }}>ĐĂNG KÝ BÁN HÀNG BẰNG S-LIFE</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Xác thực tài khoản S-life của bạn để mở Cửa hàng S-shopping</p>
              </div>

              {authError !== '' && (
                <div style={{ background: '#FEF2F2', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px', fontWeight: '600', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSLifeRegisterSubmit}>
                <div className="input-field-group">
                  <label className="input-label-text">Số điện thoại S-life *</label>
                  <div className="input-with-icon">
                    <Smartphone size={18} className="input-icon-prefix" />
                    <input type="text" className="stylish-input" placeholder="Nhập số điện thoại S-life..." value={regPhone} onChange={(e) => { setRegPhone(e.target.value); setAuthError(''); }} />
                  </div>
                </div>

                <div className="input-field-group">
                  <label className="input-label-text">Mật khẩu S-life *</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon-prefix" />
                    <input type="password" className="stylish-input" placeholder="Nhập mật khẩu..." value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setAuthError(''); }} />
                  </div>
                </div>

                <button type="submit" className="primary-login-btn" style={{ marginTop: '24px' }}>
                  <SLifeIcon size={20} />
                  BẮT ĐẦU TẠO CỬA HÀNG
                </button>

                <div className="register-callout-box" style={{ marginTop: '20px' }}>
                  <span>Bạn đã có Tài khoản S-life?</span>
                  <button type="button" className="register-callout-btn" onClick={() => { setMode('login'); setAuthError(''); }}>
                    Quay lại Đăng nhập
                  </button>
                </div>
              </form>
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
                <ArrowLeft size={16} /> Hủy đăng ký
              </button>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)' }}>TẠO CỬA HÀNG S-SHOPPING</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mở gian hàng kinh doanh trên hệ sinh thái V-life</p>
              </div>
            </div>

            {/* Stepper Header */}
            {wizardStep < 5 && (
            <div className="wizard-progress-bar">
              {[
                { step: 1, title: 'Shop' },
                { step: 2, title: 'Người bán' },
                { step: 3, title: 'Vận chuyển' },
                { step: 4, title: 'Thanh toán' }
              ].map(s => (
                <div 
                  key={s.step} 
                  className={`wizard-step-node ${wizardStep === s.step ? 'active' : ''}`}
                >
                  <div className="step-number-circle">{wizardStep > s.step ? '✓' : s.step}</div>
                  <span className="step-title-text">{s.title}</span>
                </div>
              ))}
            </div>
            )}

            {wizardStep === 5 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Sparkles size={40} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary-dark)', marginBottom: '12px' }}>🎉 Cửa hàng của bạn đã sẵn sàng!</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px', margin: '0 auto 32px', textAlign: 'left', background: 'var(--bg-page)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}><CheckCircle2 size={18} /> <span style={{ fontSize: '14px', fontWeight: '600' }}>Thông tin Shop</span></div>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}><CheckCircle2 size={18} /> <span style={{ fontSize: '14px', fontWeight: '600' }}>Xác minh người bán</span></div>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}><CheckCircle2 size={18} /> <span style={{ fontSize: '14px', fontWeight: '600' }}>Địa chỉ lấy hàng</span></div>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}><CheckCircle2 size={18} /> <span style={{ fontSize: '14px', fontWeight: '600' }}>Tài khoản nhận tiền</span></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <button className="primary-login-btn" style={{ width: '300px', padding: '14px', fontSize: '15px' }} onClick={() => handleGoToDashboard(true)}>
                    + Đăng sản phẩm đầu tiên
                  </button>
                  <button className="nav-btn-secondary" style={{ width: '300px', padding: '12px', justifyContent: 'center' }} onClick={() => handleGoToDashboard(false)}>
                    Hoặc vào Dashboard →
                  </button>
                </div>
              </div>
            ) : (
            <div className="wizard-split-layout">
              {/* Form Side */}
              <div>
                {wizardStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>1. THÔNG TIN CỬA HÀNG</h3>
                    
                    <label className="input-label-text">Tên Shop *</label>
                    <input 
                      type="text" 
                      className="stylish-input" 
                      style={{ paddingLeft: '16px', borderColor: shopNameStatus === 'unavailable' ? 'var(--red)' : shopNameStatus === 'available' ? 'var(--primary)' : 'var(--border)' }} 
                      value={shopInfo.name} 
                      onChange={e => {
                        setShopInfo({ ...shopInfo, name: e.target.value });
                        if (e.target.value.length > 3) {
                           setShopNameStatus(e.target.value.toLowerCase().includes('apple') ? 'unavailable' : 'available');
                        } else {
                           setShopNameStatus(null);
                        }
                      }} 
                      placeholder="Nhập tên cửa hàng..." 
                    />
                    {shopNameStatus === 'available' && <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', marginTop: '4px', display: 'block' }}>✅ Tên cửa hàng có thể sử dụng</span>}
                    {shopNameStatus === 'unavailable' && <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '600', marginTop: '4px', display: 'block' }}>❌ Tên cửa hàng vi phạm từ khóa hoặc đã được sử dụng</span>}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Logo Shop</label>
                        <input type="file" id="upload-logo" style={{ display: 'none' }} accept="image/*" onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setShopInfo({ ...shopInfo, logo: URL.createObjectURL(e.target.files[0]) });
                          }
                        }} />
                        <button className="nav-btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--text-light)', height: '42px' }} onClick={() => document.getElementById('upload-logo').click()}>+ Upload Logo</button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Ảnh bìa (Banner)</label>
                        <input type="file" id="upload-banner" style={{ display: 'none' }} accept="image/*" onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setShopInfo({ ...shopInfo, cover: URL.createObjectURL(e.target.files[0]) });
                          }
                        }} />
                        <button className="nav-btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--text-light)', height: '42px' }} onClick={() => document.getElementById('upload-banner').click()}>+ Upload Banner</button>
                      </div>
                    </div>

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Mô tả Shop</label>
                    <textarea className="stylish-input" style={{ height: '60px', padding: '12px 16px' }} value={shopInfo.slogan} onChange={e => setShopInfo({ ...shopInfo, slogan: e.target.value })} placeholder="Mô tả ngắn về cửa hàng của bạn..." />

                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label className="input-label-text" style={{ marginBottom: 0 }}>Địa chỉ lấy hàng *</label>
                      <button className="nav-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border)' }} onClick={() => {
                        setNewAddress(prev => ({...prev, name: loggedInUser?.ownerName || ''}));
                        setShowAddressModal(true);
                      }}>
                        + Thêm địa chỉ
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

                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Số điện thoại liên hệ *</label>
                        <input 
                          type="text" 
                          className="stylish-input" 
                          style={{ paddingLeft: '16px', background: 'var(--bg-page)', color: useCustomPhone ? 'var(--text-primary)' : 'var(--text-secondary)' }} 
                          value={useCustomPhone ? shopInfo.phone : (loggedInUser?.phone || shopInfo.phone)} 
                          onChange={e => setShopInfo({ ...shopInfo, phone: e.target.value })} 
                          readOnly={!useCustomPhone}
                        />
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <input type="checkbox" id="useCustomPhone" checked={useCustomPhone} onChange={e => {
                             setUseCustomPhone(e.target.checked);
                             if (!e.target.checked) setShopInfo({ ...shopInfo, phone: loggedInUser?.phone || shopInfo.phone });
                           }} style={{ accentColor: 'var(--primary)', width: '14px', height: '14px', cursor: 'pointer' }} />
                           <label htmlFor="useCustomPhone" style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>Dùng số điện thoại khác</label>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Email liên hệ *</label>
                        <input type="email" className="stylish-input" style={{ paddingLeft: '16px', background: 'var(--bg-page)' }} value={shopInfo.email} onChange={e => setShopInfo({ ...shopInfo, email: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>2. THÔNG TIN NGƯỜI BÁN (KYC)</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label className="input-label-text" style={{ marginBottom: 0 }}>Loại hình người bán</label>
                      <span className="status-tag" style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '10px' }}>Trạng thái KYC: {kycStatus}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      {['Cá nhân', 'Hộ kinh doanh', 'Doanh nghiệp'].map(t => (
                        <button 
                          key={t}
                          type="button"
                          className={`nav-btn-secondary ${shopInfo.sellerType === t ? 'nav-btn-primary' : ''}`}
                          style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
                          onClick={() => setShopInfo({ ...shopInfo, sellerType: t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Hidden Inputs for Photo Upload */}
                    <input type="file" id="upload-cccd-front" accept="image/*" style={{ display: 'none' }} onChange={e => handleCccdUpload('front', e)} />
                    <input type="file" id="upload-cccd-back" accept="image/*" style={{ display: 'none' }} onChange={e => handleCccdUpload('back', e)} />
                    <input type="file" id="upload-cccd-face" accept="image/*" style={{ display: 'none' }} onChange={e => handleCccdUpload('face', e)} />

                    {/* AI OCR Banner Callout */}
                    <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)', border: '1px solid #A7F3D0', padding: '12px 14px', borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: '700', fontSize: '12px' }}>
                        <Sparkles size={16} />
                        <span>TỰ ĐỘNG ĐỌC CĂN CƯỚC CÔNG DÂN (AI OCR)</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#065F46', marginTop: '4px', margin: 0 }}>
                        Tải lên ảnh CCCD mặt trước & mặt sau. Hệ thống AI sẽ tự động trích xuất Họ tên, Số CCCD và Ngày cấp vào mẫu bên dưới.
                      </p>
                    </div>

                    <label className="input-label-text">Ảnh chụp CCCD & Khuôn mặt *</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      {/* Front Card */}
                      <div 
                        style={{ flex: 1, height: '80px', border: '1px dashed var(--primary)', borderRadius: '10px', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                        onClick={() => document.getElementById('upload-cccd-front').click()}
                      >
                        {cccdFrontImg ? (
                          <>
                            <img src={cccdFrontImg} alt="Mặt trước" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' }}>Mặt trước ✓</div>
                          </>
                        ) : (
                          <>
                            <Plus size={18} color="var(--primary)" />
                            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>Mặt trước CCCD</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Chụp / Tải ảnh</span>
                          </>
                        )}
                      </div>

                      {/* Back Card */}
                      <div 
                        style={{ flex: 1, height: '80px', border: '1px dashed var(--primary)', borderRadius: '10px', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                        onClick={() => document.getElementById('upload-cccd-back').click()}
                      >
                        {cccdBackImg ? (
                          <>
                            <img src={cccdBackImg} alt="Mặt sau" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' }}>Mặt sau ✓</div>
                          </>
                        ) : (
                          <>
                            <Plus size={18} color="var(--primary)" />
                            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>Mặt sau CCCD</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Chụp / Tải ảnh</span>
                          </>
                        )}
                      </div>

                      {/* Portrait Card */}
                      <div 
                        style={{ flex: 1, height: '80px', border: '1px dashed var(--text-light)', borderRadius: '10px', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                        onClick={() => document.getElementById('upload-cccd-face').click()}
                      >
                        {faceImg ? (
                          <>
                            <img src={faceImg} alt="Chân dung" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' }}>Chân dung ✓</div>
                          </>
                        ) : (
                          <>
                            <User size={18} color="var(--text-muted)" />
                            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>Ảnh chân dung</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Xác thực mặt</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* OCR Status Feedback */}
                    {isOcrScanning && (
                      <div style={{ padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontSize: '12px', fontWeight: '600' }}>
                        <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>⚡ AI đang quét và đọc dữ liệu từ CCCD của bạn...</span>
                      </div>
                    )}

                    {ocrSuccess && !isOcrScanning && (
                      <div style={{ padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '12px', fontWeight: '600' }}>
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>✨ AI đã trích xuất & tự động điền Họ tên, Số CCCD và Ngày cấp thành công!</span>
                      </div>
                    )}

                    <label className="input-label-text">Họ và tên chủ shop / Đại diện *</label>
                    <input 
                      type="text" 
                      className="stylish-input" 
                      style={{ paddingLeft: '16px', background: 'var(--bg-page)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
                      value={shopInfo.fullName} 
                      readOnly 
                      placeholder="Tự động điền từ ảnh CCCD..." 
                    />

                    {(shopInfo.sellerType === 'Hộ kinh doanh' || shopInfo.sellerType === 'Doanh nghiệp') && (
                      <>
                        <label className="input-label-text" style={{ marginTop: '14px' }}>Tên HKD / Công ty *</label>
                        <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.companyName} onChange={e => setShopInfo({ ...shopInfo, companyName: e.target.value })} placeholder="Nhập tên tổ chức..." />
                        
                        <label className="input-label-text" style={{ marginTop: '14px' }}>Mã số thuế *</label>
                        <input type="text" className="stylish-input" style={{ paddingLeft: '16px' }} value={shopInfo.taxId} onChange={e => setShopInfo({ ...shopInfo, taxId: e.target.value })} placeholder="Mã số thuế..." />
                        
                        <label className="input-label-text" style={{ marginTop: '14px' }}>Upload Giấy phép kinh doanh *</label>
                        <button className="nav-btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--text-light)', height: '42px' }}>+ Tải lên GPKD / ĐKKD</button>
                      </>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Số CCCD *</label>
                        <input 
                          type="text" 
                          className="stylish-input" 
                          style={{ paddingLeft: '16px', background: 'var(--bg-page)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
                          value={shopInfo.cccdNumber} 
                          readOnly 
                          placeholder="Tự động điền..." 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label-text">Ngày cấp</label>
                        <input 
                          type="date" 
                          className="stylish-input" 
                          style={{ paddingLeft: '16px', background: 'var(--bg-page)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
                          value={shopInfo.cccdIssueDate} 
                          readOnly 
                        />
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                      🔒 Thông tin Họ tên, Số CCCD và Ngày cấp được tự động trích xuất từ ảnh CCCD và không thể tự chỉnh sửa thủ công.
                    </p>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>3. ĐỊA CHỈ & VẬN CHUYỂN</h3>
                    
                    <label className="input-label-text">Địa chỉ lấy hàng (Default)</label>
                    <div style={{ padding: '12px 14px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div>
                           <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{shopInfo.addressName || shopInfo.fullName || 'Kho Hàng'} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>| {shopInfo.addressPhone || shopInfo.phone}</span></div>
                           <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{shopInfo.address}</div>
                         </div>
                         <button style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Sửa</button>
                       </div>
                    </div>

                    <label className="input-label-text">Đơn vị vận chuyển được hỗ trợ</label>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>V-life sẽ tự động kết nối và phân bổ đơn hàng cho các ĐVVC bạn chọn.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['V-life Delivery', 'GHN', 'Viettel Post', 'J&T Express', 'Ninja Van'].map(provider => {
                        const isChecked = shopInfo.shippingProviders.includes(provider);
                        return (
                          <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }} onClick={() => {
                            if (isChecked) {
                              setShopInfo({ ...shopInfo, shippingProviders: shopInfo.shippingProviders.filter(p => p !== provider) });
                            } else {
                              setShopInfo({ ...shopInfo, shippingProviders: [...shopInfo.shippingProviders, provider] });
                            }
                          }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: isChecked ? 'none' : '2px solid var(--text-light)', background: isChecked ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isChecked && <Check size={14} color="#fff" />}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{provider}</span>
                            {provider === 'V-life Delivery' && <span className="status-tag active" style={{ marginLeft: 'auto', fontSize: '10px' }}>Khuyên dùng</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', marginBottom: '16px' }}>4. TÀI KHOẢN NHẬN TIỀN</h3>
                    
                    {/* Napas Callout */}
                    <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 100%)', border: '1px solid #A7F3D0', padding: '12px 14px', borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: '700', fontSize: '12px' }}>
                        <Zap size={16} />
                        <span>XÁC MINH TỰ ĐỘNG QUA NAPAS 24/7</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#065F46', marginTop: '4px', margin: 0 }}>
                        Nhập số tài khoản ngân hàng, hệ thống sẽ tự động tra cứu Napas để xác minh và điền tên chủ tài khoản.
                      </p>
                    </div>

                    <label className="input-label-text">Ngân Hàng *</label>
                    <select 
                      className="stylish-input" 
                      style={{ paddingLeft: '16px', appearance: 'none', background: 'var(--bg-page)' }} 
                      value={shopInfo.bankName} 
                      onChange={e => {
                        const newBank = e.target.value;
                        setShopInfo({ ...shopInfo, bankName: newBank });
                        if (shopInfo.bankAccount && shopInfo.bankAccount.length >= 6) {
                          handleBankAccountChange(shopInfo.bankAccount);
                        }
                      }}
                    >
                      <option value="Vietcombank">Vietcombank (Ngân hàng TMCP Ngoại thương)</option>
                      <option value="Techcombank">Techcombank (Ngân hàng Kỹ thương)</option>
                      <option value="MBBank">MB Bank (Ngân hàng Quân đội)</option>
                      <option value="ACB">ACB (Ngân hàng Á Châu)</option>
                      <option value="Vietinbank">VietinBank (Ngân hàng Công thương)</option>
                      <option value="BIDV">BIDV (Ngân hàng ĐT&PT Việt Nam)</option>
                      <option value="Agribank">Agribank (Ngân hàng Nông nghiệp)</option>
                    </select>

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Số Tài Khoản *</label>
                    <input 
                      type="text" 
                      className="stylish-input" 
                      style={{ paddingLeft: '16px' }} 
                      value={shopInfo.bankAccount} 
                      onChange={e => handleBankAccountChange(e.target.value)} 
                      placeholder="Nhập số tài khoản ngân hàng..." 
                    />

                    {isVerifyingBank && (
                      <div style={{ padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8', fontSize: '12px', fontWeight: '600' }}>
                        <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>⚡ Đang tra cứu Napas 24/7 để xác minh tên chủ tài khoản...</span>
                      </div>
                    )}

                    <label className="input-label-text" style={{ marginTop: '14px' }}>Tên Chủ Tài Khoản *</label>
                    <input 
                      type="text" 
                      className="stylish-input" 
                      style={{ paddingLeft: '16px', background: 'var(--bg-page)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
                      value={shopInfo.bankHolder || (shopInfo.fullName ? shopInfo.fullName.toUpperCase() : '')} 
                      readOnly 
                      placeholder="Tự động tra cứu từ ngân hàng..." 
                    />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                      🔒 Tên chủ tài khoản được Napas 24/7 tự động xác minh khớp 100% với hồ sơ người bán.
                    </p>

                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', border: shopInfo.bankStatus === 'Đã xác minh' ? '1px solid var(--primary-light)' : '1px solid #FEF08A', background: shopInfo.bankStatus === 'Đã xác minh' ? 'var(--primary-light)' : '#FEF9C3', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {shopInfo.bankStatus === 'Đã xác minh' ? (
                        <>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-dark)' }}>✓ Đã xác minh thông qua Napas 24/7</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color="#CA8A04" />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#854D0E' }}>⚠️ Trạng thái: {shopInfo.bankStatus} (Hãy nhập đủ số tài khoản)</span>
                        </>
                      )}
                    </div>
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
                      Tiếp tục &gt;
                    </button>
                  ) : (
                    <button className="nav-btn-primary" style={{ padding: '12px 28px' }} onClick={handleFinishWizard}>
                      Hoàn Tất Đăng Ký
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
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3️⃣ MODE: FULL ENTERPRISE DESKTOP DASHBOARD & PRODUCT MANAGER */}
      {/* ========================================================================= */}
      {mode === 'dashboard' && (
        <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
          {/* Header Top Bar */}
          <Header 
            user={loggedInUser}
            shopInfo={shopInfo}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={() => { setLoggedInUser(null); setMode('login'); }}
            onNavigateTab={(tab) => {
              if (tab !== 'orders') setOrderFilter('Tất cả');
              setActiveTab(tab);
            }}
          />

          {/* Main Layout Area */}
          <div className="seller-main-layout">
            {/* Left Sidebar */}
            <Sidebar 
              activeTab={activeTab}
              onSelectTab={(tab) => {
                if (tab !== 'orders') setOrderFilter('Tất cả');
                setActiveTab(tab);
              }}
              isCollapsed={isSidebarCollapsed}
              productCount={products.length}
              orderCount={activeOrdersDataset.length}
            />

            {/* Main Content Area */}
            <main className="seller-content-body">
              
              {/* TAB 1: TRANG CHỦ DASHBOARD (NEW SELLER EMPTY STATE & ONBOARDING) */}
              {activeTab === 'home' && (
                <div>
                  <WelcomeBar shopInfo={shopInfo} />
                  
                  {/* ONBOARDING CHECKLIST CARD FOR FRESH SHOP */}
                  <OnboardingChecklist 
                    onOpenAddProductModal={() => setShowAddProductModal(true)} 
                    onNavigateTab={(tab) => setActiveTab(tab)} 
                  />

                  <KpiCards kpiData={kpiData} onPeriodChange={handleKpiPeriodChange} />
                  <PendingActions 
                    pendingItems={pendingActions} 
                    onActionClick={handlePendingActionClick}
                    onNavigateTab={(tab) => setActiveTab(tab)} 
                  />

                  {/* DASHBOARD TWO COLUMN GRID WITH DYNAMIC DATA & EMPTY STATES */}
                  <div className="dashboard-two-column-grid">
                    {/* Left Column: Revenue Chart + Top Products + Video & Livestream + Platform News */}
                    <div className="dashboard-column-left">
                      <RevenueChart 
                        existingOrders={orders} 
                        onOpenAddProductModal={() => setShowAddProductModal(true)} 
                      />
                      <TopProducts 
                        existingProducts={products} 
                        onNavigateToProducts={() => setActiveTab('products')} 
                        onOpenAddProductModal={() => setShowAddProductModal(true)} 
                      />
                      <VideoLivestream 
                        existingProducts={products} 
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                      <PlatformNews 
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                    </div>

                    {/* Right Column: Recent Orders + Inventory Alerts + Finance + Shop Health + Quick Actions */}
                    <div className="dashboard-column-right">
                      <RecentOrders 
                        existingOrders={orders} 
                        onNavigateToOrders={(tab, filter) => {
                          if (filter) setOrderFilter(filter);
                          else setOrderFilter('Tất cả');
                          setActiveTab(tab);
                        }} 
                        onOpenAddProductModal={() => setShowAddProductModal(true)} 
                      />
                      <InventoryAlerts 
                        existingProducts={products} 
                        onNavigateToInventory={() => setActiveTab('products')} 
                        onOpenAddProductModal={() => setShowAddProductModal(true)} 
                      />
                      <FinancialOverview 
                        existingOrders={orders}
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                      <ShopHealth 
                        existingOrders={orders}
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                      <QuickActions 
                        onNavigate={(tab) => setActiveTab(tab)} 
                        onOpenAddProductModal={() => setShowAddProductModal(true)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT CATALOG MANAGEMENT MODULE */}
              {activeTab === 'products' && (
                <div>
                  {isProductFormOpen || showAddProductModal ? (
                    <ProductForm 
                      initialData={editingProduct}
                      onSave={handleSaveProduct}
                      onCancel={() => {
                        setIsProductFormOpen(false);
                        setShowAddProductModal(false);
                        setEditingProduct(null);
                      }}
                    />
                  ) : (
                    <div>
                      <ProductHeader 
                        onOpenAddProductModal={() => {
                          setEditingProduct(null);
                          setIsProductFormOpen(true);
                        }} 
                      />

                      <ProductTabs 
                        activeTab={productModuleTab}
                        onSelectTab={setProductModuleTab}
                        metrics={productMetrics}
                      />

                      <ProductMetrics metrics={productMetrics} />

                      <ProductFilters 
                        searchQuery={productSearchQuery}
                        onSearchChange={setProductSearchQuery}
                        categoryFilter={productCategoryFilter}
                        onCategoryChange={setProductCategoryFilter}
                        statusFilter={productStatusFilter}
                        onStatusChange={setProductStatusFilter}
                        sortOrder={productSortOrder}
                        onSortChange={setProductSortOrder}
                        viewMode={productViewMode}
                        onViewModeChange={setProductViewMode}
                      />

                      <ProductTable 
                        products={products.filter(p => {
                          if (productModuleTab === 'active' && p.status !== 'Đang bán') return false;
                          if (productModuleTab === 'hidden' && p.status !== 'Tạm ẩn') return false;
                          if (productModuleTab === 'outofstock' && p.stock > 0 && p.status !== 'Hết hàng') return false;
                          if (productModuleTab === 'draft' && p.status !== 'Bản nháp') return false;
                          if (productSearchQuery.trim()) {
                            const q = productSearchQuery.toLowerCase().trim();
                            const matchName = p.name.toLowerCase().includes(q);
                            const matchSku = p.sku && p.sku.toLowerCase().includes(q);
                            if (!matchName && !matchSku) return false;
                          }
                          if (productCategoryFilter !== 'Tất cả danh mục' && productCategoryFilter !== 'Tất cả') {
                            if (p.category !== productCategoryFilter) return false;
                          }
                          if (productStatusFilter !== 'Tất cả') {
                            if (p.status !== productStatusFilter) return false;
                          }
                          return true;
                        })}
                        onOpenAddProductModal={() => {
                          setEditingProduct(null);
                          setIsProductFormOpen(true);
                        }}
                        onEditProduct={handleEditProduct}
                        onToggleStatusProduct={handleToggleStatusProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onBulkAction={handleBulkActionProduct}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INVENTORY MANAGEMENT MODULE (KHO HÀNG) */}
              {activeTab === 'inventory' && (
                <InventoryManager 
                  existingProducts={products}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAddProductModal={() => {
                    setActiveTab('products');
                    setIsProductFormOpen(true);
                  }}
                />
              )}

              {/* TAB 3: STATS */}
              {(activeTab === 'stats' || activeTab === 'analytics') && (
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

              {/* TAB 4: ORDER MANAGEMENT MODULE */}
              {activeTab === 'orders' && (
                <div>
                  <OrderHeader 
                    totalOrders={activeOrdersDataset.length}
                    isDemoState={isDemoOrderState}
                    onToggleDemoState={() => setIsDemoOrderState(!isDemoOrderState)}
                  />

                  <OrderTabs 
                    activeTab={orderModuleTab}
                    onSelectTab={setOrderModuleTab}
                    metrics={orderMetrics}
                  />

                  <OrderMetrics metrics={orderMetrics} />

                  <OrderFilters 
                    searchQuery={orderSearchQuery}
                    onSearchChange={setOrderSearchQuery}
                    providerFilter={orderProviderFilter}
                    onProviderChange={setOrderProviderFilter}
                    onResetFilters={() => {
                      setOrderSearchQuery('');
                      setOrderProviderFilter('Tất cả');
                    }}
                  />

                  <OrderTable 
                    orders={activeOrdersDataset.filter(o => {
                      // Tab filtering
                      if (orderModuleTab === 'confirm' && o.status !== 'Chờ xác nhận') return false;
                      if (orderModuleTab === 'pickup' && o.status !== 'Chờ lấy hàng' && o.status !== 'Chờ đóng gói') return false;
                      if (orderModuleTab === 'delivering' && o.status !== 'Đang giao' && o.status !== 'Chờ bàn giao') return false;
                      if (orderModuleTab === 'completed' && o.status !== 'Hoàn thành') return false;
                      if (orderModuleTab === 'cancelled' && o.status !== 'Đã hủy') return false;
                      if (orderModuleTab === 'returned' && o.status !== 'Trả hàng/Hoàn tiền' && o.status !== 'Trả hàng') return false;

                      // Search query
                      if (orderSearchQuery.trim()) {
                        const q = orderSearchQuery.toLowerCase().trim();
                        const matchCode = o.code && o.code.toLowerCase().includes(q);
                        const matchCustName = o.customer?.name ? o.customer.name.toLowerCase().includes(q) : typeof o.customer === 'string' && o.customer.toLowerCase().includes(q);
                        const matchPhone = o.customer?.phone && o.customer.phone.includes(q);
                        if (!matchCode && !matchCustName && !matchPhone) return false;
                      }

                      // Shipping Provider filter
                      if (orderProviderFilter !== 'Tất cả' && orderProviderFilter !== 'Tất cả vận chuyển') {
                        if (o.shipping?.provider !== orderProviderFilter && o.shipping?.providerName !== orderProviderFilter) return false;
                      }

                      return true;
                    })}
                    onNavigateToProducts={() => setActiveTab('products')}
                    onViewOrderDetail={(order) => setSelectedOrderDetail(order)}
                    onUpdateOrderStatus={handleUpdateSingleOrderStatus}
                    onBulkUpdateStatus={handleBulkUpdateOrderStatus}
                  />

                  {/* Right Side Drawer Detail Panel */}
                  <OrderDetailDrawer 
                    order={selectedOrderDetail}
                    onClose={() => setSelectedOrderDetail(null)}
                    onUpdateStatus={handleUpdateSingleOrderStatus}
                  />
                </div>
              )}

              {/* TAB: SHIPPING MANAGEMENT MODULE (VẬN CHUYỂN) */}
              {activeTab === 'shipping' && (
                <ShippingManager 
                  existingOrders={orders}
                  existingProducts={products}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {/* TAB: FINANCE MANAGEMENT MODULE (TÀI CHÍNH) */}
              {activeTab === 'finance' && (
                <FinanceManager 
                  existingOrders={orders}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {/* TAB: PROMOTIONS / MARKETING MODULE (KHUYẾN MÃI) */}
              {(activeTab === 'promotions' || activeTab === 'marketing') && (
                <PromotionsManager 
                  existingProducts={products}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {/* TAB 5: SETTINGS */}
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

              {/* TAB 6: CHAT TIN NHẮN (CONNECTED TO PENDING ACTIONS) */}
              {activeTab === 'chat' && (
                <div className="catalog-table-card" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '900' }}>TRUNG TÂM TIN NHẮN CHAT SELLER CENTER</h2>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản lý tin nhắn chưa trả lời từ khách hàng mua sắm S-Shopping</p>
                  
                  <div style={{ marginTop: '24px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>💬 Bạn có 8 tin nhắn chưa trả lời từ khách hàng</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Hộp thoại chat trực tiếp sẽ được tích hợp đầy đủ trong Phase tiếp theo.</p>
                  </div>
                </div>
              )}

            </main>
          </div>
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
          <div style={{ background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Thêm Địa Chỉ Mới</h2>
              <button onClick={() => setShowAddressModal(false)} style={{ color: 'var(--text-muted)' }}>X</button>
            </div>
            
            <div style={{ marginBottom: '14px' }}>
              <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Họ & Tên</label>
              <input type="text" className="stylish-input" style={{ paddingLeft: '14px', height: '36px', fontSize: '13px' }} value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} placeholder="Nhập vào" />
            </div>

            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tỉnh/Thành phố</label>
                <select className="stylish-input" style={{ paddingLeft: '10px', height: '36px', fontSize: '13px', appearance: 'auto' }} value={newAddress.provinceCode} onChange={handleProvinceChange}>
                  <option value="">Chọn Tỉnh/Thành</option>
                  {apiProvinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Phường/Xã</label>
                <select className="stylish-input" style={{ paddingLeft: '10px', height: '36px', fontSize: '13px', appearance: 'auto' }} value={newAddress.wardCode} onChange={handleWardChange} disabled={!newAddress.provinceCode}>
                  <option value="">Chọn Phường/Xã</option>
                  {apiWards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label className="input-label-text" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Địa chỉ chi tiết</label>
              <textarea className="stylish-input" style={{ height: '70px', padding: '12px 14px', fontSize: '13px' }} value={newAddress.detail} onChange={e => setNewAddress({...newAddress, detail: e.target.value})} placeholder="Số nhà, tên đường v.v." />
            </div>

            {/* Google Maps Official Interactive Layer (Always visible) */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', border: '1px solid var(--border)', borderBottom: 'none', height: '220px' }}>
                <iframe 
                  key={`${newAddress.detail}-${newAddress.wardCode}-${newAddress.provinceCode}`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <style>
                        html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e5e3df; cursor: grab; }
                        html, body, #map:active { cursor: grabbing; }
                        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 4px; }
                        .custom-popup { font-family: system-ui, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.4; }
                      </style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                        var searchQuery = ${JSON.stringify(`${newAddress.detail ? newAddress.detail + ', ' : ''}${newAddress.ward ? newAddress.ward + ', ' : ''}${newAddress.city ? newAddress.city + ', ' : ''}Việt Nam`)};
                        var fullAddrStr = ${JSON.stringify(`${newAddress.detail ? newAddress.detail + ', ' : ''}${newAddress.ward ? newAddress.ward + ', ' : ''}${newAddress.city ? newAddress.city : 'Địa chỉ lấy hàng'}`)};
                        var map = L.map('map', { zoomControl: true }).setView([21.0285, 105.8542], 15);
                        
                        // Official Google Maps Tile Layer
                        L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                          maxZoom: 20,
                          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                          attribution: 'Map data ©2026 Google'
                        }).addTo(map);

                        var marker = L.marker([21.0285, 105.8542], { draggable: true }).addTo(map);
                        
                        function updatePopup(lat, lng) {
                          marker.bindPopup("<div class='custom-popup'>📍 <strong style='color:#ef4444'>" + fullAddrStr + "</strong><br/><span style='color:#64748b;font-size:10px'>Ấn giữ chuột trái kéo để di chuyển bản đồ hoặc di chuyển ghim đỏ</span></div>").openPopup();
                        }
                        updatePopup(21.0285, 105.8542);

                        // Geocode address via Nominatim
                        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(searchQuery))
                          .then(r => r.json())
                          .then(data => {
                            if (data && data.length > 0) {
                              var lat = parseFloat(data[0].lat);
                              var lon = parseFloat(data[0].lon);
                              map.setView([lat, lon], 15);
                              marker.setLatLng([lat, lon]);
                              updatePopup(lat, lon);
                            }
                          })
                          .catch(e => console.error(e));

                        map.on('click', function(e) {
                          marker.setLatLng(e.latlng);
                          updatePopup(e.latlng.lat, e.latlng.lng);
                        });

                        marker.on('dragend', function(e) {
                          var coord = marker.getLatLng();
                          updatePopup(coord.lat, coord.lng);
                        });
                      </script>
                    </body>
                    </html>
                  `}
                />
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '0 0 8px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  📍 Google Maps: <strong style={{ color: '#EF4444' }}>{newAddress.detail ? newAddress.detail + ', ' : ''}{newAddress.ward ? newAddress.ward + ', ' : ''}{newAddress.city ? newAddress.city : 'Vị trí trên bản đồ'}</strong>
                </span>
                <span style={{ fontSize: '10px', color: '#047857', fontWeight: '600' }}>🖱️ Ấn giữ chuột trái & kéo để di chuyển bản đồ</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="nav-btn-secondary" style={{ width: '80px', justifyContent: 'center', fontSize: '13px' }} onClick={() => setShowAddressModal(false)}>
                Hủy
              </button>
              <button className="nav-btn-primary" style={{ padding: '10px 24px', background: '#EF4444', color: '#fff', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => {
                const fullAddressStr = `${newAddress.detail ? newAddress.detail + ', ' : ''}${newAddress.ward ? newAddress.ward + ', ' : ''}${newAddress.city}`;
                setShopInfo({...shopInfo, address: fullAddressStr, addressName: newAddress.name, addressPhone: newAddress.phone});
                setShowAddressModal(false);
              }}>
                📌 Xác nhận & Lưu vị trí
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
