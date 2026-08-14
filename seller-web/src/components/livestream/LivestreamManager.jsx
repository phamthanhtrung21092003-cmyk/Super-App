import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import LivestreamKpiCards from './LivestreamKpiCards';
import LivestreamOverviewChart from './LivestreamOverviewChart';
import LivestreamTabs from './LivestreamTabs';
import LivestreamFilters from './LivestreamFilters';
import LivestreamTable from './LivestreamTable';
import LivestreamCreateModal from './LivestreamCreateModal';
import LiveControlPanelModal from './LiveControlPanelModal';
import SuperAppLiveModal from './SuperAppLiveModal';
import LivestreamAnalyticsModal from './LivestreamAnalyticsModal';
import { HelpCircle, Plus, Smartphone, CheckCircle2 } from 'lucide-react';

export default function LivestreamManager({ 
  existingProducts = [], 
  onNavigateToTab 
}) {
  const [livestreams, setLivestreams] = useState([]);
  const [overview, setOverview] = useState({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [timeFilter, setTimeFilter] = useState('7 ngày qua');

  // Interactive Modal & Drawer States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedControlLive, setSelectedControlLive] = useState(null);
  const [selectedSuperAppLive, setSelectedSuperAppLive] = useState(null);
  const [selectedAnalyticsLive, setSelectedAnalyticsLive] = useState(null);

  // Load Livestreams Data
  useEffect(() => {
    sellerService.getLivestreams().then(list => {
      setLivestreams(list);
      sellerService.getLivestreamOverview(list).then(ov => setOverview(ov));
    });
  }, []);

  const refreshList = (newList) => {
    setLivestreams(newList);
    sellerService.getLivestreamOverview(newList).then(ov => setOverview(ov));
  };

  // Filtered Livestreams List
  const filteredLivestreams = livestreams.filter(item => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const title = (item.title || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      if (!title.includes(q) && !category.includes(q) && !id.includes(q)) return false;
    }

    // 2. Tab Filter
    if (activeTab === 'Đang diễn ra' && item.status !== 'LIVE' && item.status !== 'Đang diễn ra') return false;
    if (activeTab === 'Sắp diễn ra' && item.status !== 'SCHEDULED' && item.status !== 'Sắp diễn ra') return false;
    if (activeTab === 'Đã kết thúc' && item.status !== 'ENDED' && item.status !== 'Đã kết thúc') return false;
    if (activeTab === 'Đã hủy' && item.status !== 'CANCELLED' && item.status !== 'Đã hủy') return false;

    // 3. Status Filter Dropdown
    if (statusFilter !== 'Tất cả') {
      if (statusFilter === 'Đang diễn ra' && item.status !== 'LIVE' && item.status !== 'Đang diễn ra') return false;
      if (statusFilter === 'Sắp diễn ra' && item.status !== 'SCHEDULED' && item.status !== 'Sắp diễn ra') return false;
      if (statusFilter === 'Đã kết thúc' && item.status !== 'ENDED' && item.status !== 'Đã kết thúc') return false;
      if (statusFilter === 'Đã hủy' && item.status !== 'CANCELLED' && item.status !== 'Đã hủy') return false;
    }

    return true;
  });

  const liveNowList = livestreams.filter(l => l.status === 'LIVE' || l.status === 'Đang diễn ra');
  const upcomingList = livestreams.filter(l => l.status === 'SCHEDULED' || l.status === 'Sắp diễn ra');

  // Handlers
  const handleCreateSubmit = (newLive) => {
    const updated = [newLive, ...livestreams];
    refreshList(updated);
    setIsCreateModalOpen(false);
    alert(`✅ Đã tạo thành công buổi Livestream "${newLive.title}" (ID: ${newLive.id})!`);
  };

  const handleEndLive = (id) => {
    const updated = livestreams.map(l => l.id === id ? { ...l, status: 'ENDED' } : l);
    refreshList(updated);
    alert('⚫ Buổi Livestream đã kết thúc!');
  };

  const handleCancelLive = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn Hủy buổi Livestream này không?')) {
      const updated = livestreams.map(l => l.id === id ? { ...l, status: 'CANCELLED' } : l);
      refreshList(updated);
      alert('🔴 Đã hủy buổi Livestream.');
    }
  };

  return (
    <div className="livestream-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Bar */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LIVESTREAM</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tổ chức và quản lý các buổi livestream bán hàng trên V-life Super App</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-secondary" onClick={() => alert('Đang mở Hướng dẫn thiết lập phòng Livestream chốt đơn nghìn đơn...')}>
            <HelpCircle size={15} /> Hướng dẫn
          </button>

          <button className="nav-btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444' }} onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Tạo livestream
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Cards */}
      <LivestreamKpiCards 
        metrics={overview}
        onSelectKpi={(st) => {
          if (st === 'live_now') setActiveTab('Đang diễn ra');
          if (st === 'total_sessions') setActiveTab('Tất cả');
        }}
      />

      {/* 3. Main Content Layout (Table + Right Sidebar Summary) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px', marginTop: '24px' }}>
        {/* Left Side: Table & Filters */}
        <div>
          {/* Status Tabs */}
          <LivestreamTabs 
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            metrics={overview}
          />

          {/* Search & Filter Toolbar */}
          <LivestreamFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeChange={setTimeFilter}
            onResetFilters={() => {
              setSearchQuery('');
              setActiveTab('Tất cả');
              setStatusFilter('Tất cả');
            }}
          />

          {/* Master Livestream Table */}
          <LivestreamTable 
            livestreams={filteredLivestreams}
            onOpenLiveControl={setSelectedControlLive}
            onViewDetail={(item) => setSelectedSuperAppLive(item)}
            onViewAnalytics={setSelectedAnalyticsLive}
            onEdit={(item) => alert(`Chỉnh sửa buổi Livestream ${item.id}`)}
            onEndLive={handleEndLive}
            onCancelLive={handleCancelLive}
            onCreateLivestream={() => setIsCreateModalOpen(true)}
          />

          {/* Bottom Banner Feature Highlights */}
          <div style={{ marginTop: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Smartphone size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>Livestream xuất bản trực tiếp trên V-life Super App Video Feed</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Các buổi livestream sẽ hiển thị trực tiếp tại mục Video + Livestream của V-life, giúp tiếp cận hàng triệu khách hàng.</span>
              </div>
            </div>

            <button 
              className="nav-btn-secondary" 
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedSuperAppLive(livestreams[0])}
            >
              Xem trên Super App &gt;
            </button>
          </div>
        </div>

        {/* Right Side: Sidebar Summary Cards */}
        <div>
          <LivestreamOverviewChart 
            liveNowList={liveNowList}
            upcomingList={upcomingList}
            onOpenLiveControl={setSelectedControlLive}
            onOpenSuperApp={() => setSelectedSuperAppLive(livestreams[0])}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      {isCreateModalOpen && (
        <LivestreamCreateModal 
          catalogProducts={existingProducts}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitLivestream={handleCreateSubmit}
        />
      )}

      {selectedControlLive && (
        <LiveControlPanelModal 
          livestream={selectedControlLive}
          catalogProducts={existingProducts}
          onClose={() => setSelectedControlLive(null)}
          onEndLive={handleEndLive}
        />
      )}

      {selectedSuperAppLive && (
        <SuperAppLiveModal 
          livestream={selectedSuperAppLive}
          catalogProducts={existingProducts}
          onClose={() => setSelectedSuperAppLive(null)}
        />
      )}

      {selectedAnalyticsLive && (
        <LivestreamAnalyticsModal 
          livestream={selectedAnalyticsLive}
          onClose={() => setSelectedAnalyticsLive(null)}
        />
      )}
    </div>
  );
}
