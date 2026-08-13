import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import PromotionKpiCards from './PromotionKpiCards';
import PromotionOverviewChart from './PromotionOverviewChart';
import PromotionStatsCard from './PromotionStatsCard';
import PromotionSuggestions from './PromotionSuggestions';
import PromotionTabs from './PromotionTabs';
import PromotionFilters from './PromotionFilters';
import PromotionTable from './PromotionTable';
import PromotionTypeSelector from './PromotionTypeSelector';
import PromotionCreateWizard from './PromotionCreateWizard';
import PromotionDetailDrawer from './PromotionDetailDrawer';
import PromotionPerformanceModal from './PromotionPerformanceModal';
import { HelpCircle, Plus } from 'lucide-react';

export default function PromotionsManager({ 
  existingProducts = [], 
  onNavigateToTab 
}) {
  const [promotions, setPromotions] = useState([]);
  const [overview, setOverview] = useState({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [timeFilter, setTimeFilter] = useState('Thời gian: Tất cả');

  // Interactive Modal & Drawer States
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [creatingTypeName, setCreatingTypeName] = useState('');
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [selectedDetailPromo, setSelectedDetailPromo] = useState(null);
  const [selectedPerformancePromo, setSelectedPerformancePromo] = useState(null);

  // Load Promotions Data
  useEffect(() => {
    sellerService.getPromotions().then(list => {
      setPromotions(list);
      sellerService.getPromotionOverview(list).then(ov => setOverview(ov));
    });
  }, []);

  const refreshPromotions = (newList) => {
    setPromotions(newList);
    sellerService.getPromotionOverview(newList).then(ov => setOverview(ov));
  };

  // Filtered List
  const filteredPromotions = promotions.filter(promo => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (promo.name || '').toLowerCase();
      const code = (promo.code || promo.id || '').toLowerCase();
      if (!name.includes(q) && !code.includes(q)) return false;
    }

    // 2. Tab Filter
    if (activeTab !== 'Tất cả') {
      if (promo.status !== activeTab) return false;
    }

    // 3. Status Filter Dropdown
    if (statusFilter !== 'Tất cả') {
      if (promo.status !== statusFilter) return false;
    }

    // 4. Type Filter Dropdown
    if (typeFilter !== 'Tất cả') {
      if (promo.type !== typeFilter) return false;
    }

    return true;
  });

  // Handlers
  const handleSelectTypeToCreate = (typeId, typeName) => {
    setCreatingTypeName(typeName);
    setIsTypeSelectorOpen(false);
    setIsCreateWizardOpen(true);
  };

  const handleCreateSubmit = (newPromo) => {
    const updated = [newPromo, ...promotions];
    refreshPromotions(updated);
    setIsCreateWizardOpen(false);
    alert(`✅ Đã tạo thành công chương trình khuyến mãi "${newPromo.name}" (${newPromo.code})!`);
  };

  const handlePausePromo = (id) => {
    const updated = promotions.map(p => p.id === id ? { ...p, status: 'Tạm dừng' } : p);
    refreshPromotions(updated);
    alert('🔴 Đã tạm dừng chương trình khuyến mãi!');
  };

  const handleResumePromo = (id) => {
    const updated = promotions.map(p => p.id === id ? { ...p, status: 'Đang diễn ra' } : p);
    refreshPromotions(updated);
    alert('🟢 Đã tiếp tục kích hoạt chương trình khuyến mãi!');
  };

  const handleDeletePromo = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không?')) {
      const updated = promotions.filter(p => p.id !== id);
      refreshPromotions(updated);
      alert('🗑️ Đã xóa chương trình khuyến mãi thành công.');
    }
  };

  const handleDuplicatePromo = (promo) => {
    const dup = {
      ...promo,
      id: `km_${Date.now()}`,
      name: `${promo.name} (Bản sao)`,
      code: `KM${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Sắp diễn ra'
    };
    refreshPromotions([dup, ...promotions]);
    alert(`📋 Đã sao chép chương trình "${promo.name}" thành bản sao mới!`);
  };

  return (
    <div className="promotions-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Bar */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>KHUYẾN MÃI</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tạo và quản lý các chương trình khuyến mãi của cửa hàng</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-secondary" onClick={() => alert('Đang mở Hướng dẫn thiết lập chiến dịch Khuyến mãi đạt ROI tối ưu...')}>
            <HelpCircle size={15} /> Hướng dẫn
          </button>

          <button className="nav-btn-primary" onClick={() => setIsTypeSelectorOpen(true)}>
            <Plus size={16} /> Tạo chương trình
          </button>
        </div>
      </div>

      {/* 2. 5 KPI Cards */}
      <PromotionKpiCards 
        metrics={overview}
        onSelectKpi={(st) => {
          if (st === 'active') setActiveTab('Đang diễn ra');
          if (st === 'upcoming') setActiveTab('Sắp diễn ra');
          if (st === 'ended') setActiveTab('Đã kết thúc');
          if (st === 'total') setActiveTab('Tất cả');
        }}
      />

      {/* 3. Main Content Layout (Table + Right Sidebar Summary) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '24px' }}>
        {/* Left Side: Table & Filters */}
        <div>
          {/* Status Tabs */}
          <PromotionTabs 
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            metrics={overview}
          />

          {/* Search & Filter Toolbar */}
          <PromotionFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            timeFilter={timeFilter}
            onTimeChange={setTimeFilter}
            onResetFilters={() => {
              setSearchQuery('');
              setActiveTab('Tất cả');
              setStatusFilter('Tất cả');
              setTypeFilter('Tất cả');
            }}
          />

          {/* Master Table */}
          <PromotionTable 
            promotions={filteredPromotions}
            onViewDetail={setSelectedDetailPromo}
            onEdit={(item) => {
              setCreatingTypeName(item.type);
              setIsCreateWizardOpen(true);
            }}
            onPause={handlePausePromo}
            onResume={handleResumePromo}
            onDuplicate={handleDuplicatePromo}
            onViewReport={setSelectedPerformancePromo}
            onDelete={handleDeletePromo}
            onCreatePromotion={() => setIsTypeSelectorOpen(true)}
          />
        </div>

        {/* Right Side: Sidebar Summary Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Doughnut Status Overview */}
          <PromotionOverviewChart stats={overview} />

          {/* Performance Summary Card */}
          <PromotionStatsCard 
            onOpenReport={() => {
              if (promotions.length > 0) setSelectedPerformancePromo(promotions[0]);
            }}
          />

          {/* Seller Suggestions Card */}
          <PromotionSuggestions 
            onCreateType={(type) => {
              const nameMap = {
                freeship: 'Miễn phí vận chuyển (Freeship)',
                flash_sale: 'Flash Sale (Khung giờ vàng)',
                combo: 'Combo sản phẩm (Bundle Deal)'
              };
              setCreatingTypeName(nameMap[type] || 'Giảm giá sản phẩm');
              setIsCreateWizardOpen(true);
            }}
          />
        </div>
      </div>

      {/* Interactive Modals & Drawers */}
      {isTypeSelectorOpen && (
        <PromotionTypeSelector 
          onClose={() => setIsTypeSelectorOpen(false)}
          onSelectType={handleSelectTypeToCreate}
        />
      )}

      {isCreateWizardOpen && (
        <PromotionCreateWizard 
          selectedTypeName={creatingTypeName}
          catalogProducts={existingProducts}
          onClose={() => setIsCreateWizardOpen(false)}
          onSubmitPromotion={handleCreateSubmit}
        />
      )}

      {selectedDetailPromo && (
        <PromotionDetailDrawer 
          promotion={selectedDetailPromo}
          catalogProducts={existingProducts}
          onClose={() => setSelectedDetailPromo(null)}
        />
      )}

      {selectedPerformancePromo && (
        <PromotionPerformanceModal 
          promotion={selectedPerformancePromo}
          onClose={() => setSelectedPerformancePromo(null)}
        />
      )}
    </div>
  );
}
