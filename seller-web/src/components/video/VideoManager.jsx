import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import VideoKpiCards from './VideoKpiCards';
import VideoOverviewChart from './VideoOverviewChart';
import VideoTabs from './VideoTabs';
import VideoFilters from './VideoFilters';
import VideoTable from './VideoTable';
import VideoUploadModal from './VideoUploadModal';
import VideoDetailDrawer from './VideoDetailDrawer';
import VideoAnalyticsModal from './VideoAnalyticsModal';
import AffiliateOverview from './AffiliateOverview';
import { HelpCircle, Plus } from 'lucide-react';

export default function VideoManager({ 
  existingProducts = [], 
  onNavigateToTab 
}) {
  const [videos, setVideos] = useState([]);
  const [overview, setOverview] = useState({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả video');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [timeFilter, setTimeFilter] = useState('7 ngày qua');

  // Interactive Modal & Drawer States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDetailVideo, setSelectedDetailVideo] = useState(null);
  const [selectedAnalyticsVideo, setSelectedAnalyticsVideo] = useState(null);

  // Load Videos Data
  useEffect(() => {
    sellerService.getVideos().then(list => {
      setVideos(list);
      sellerService.getVideoOverview(list).then(ov => setOverview(ov));
    });
  }, []);

  const refreshVideos = (newList) => {
    setVideos(newList);
    sellerService.getVideoOverview(newList).then(ov => setOverview(ov));
  };

  // Filtered Videos List
  const filteredVideos = videos.filter(v => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const title = (v.title || '').toLowerCase();
      const id = (v.id || '').toLowerCase();
      if (!title.includes(q) && !id.includes(q)) return false;
    }

    // 2. Tab Filter
    if (activeTab === 'Video của tôi' && v.productType === 'AFFILIATE') return false;
    if (activeTab === 'Affiliate' && v.productType !== 'AFFILIATE' && v.type !== 'Affiliate') return false;
    if (activeTab === 'Chờ duyệt' && v.status !== 'PENDING_REVIEW' && v.status !== 'Chờ duyệt') return false;
    if (activeTab === 'Đã đăng' && v.status !== 'PUBLISHED' && v.status !== 'Đã đăng') return false;
    if (activeTab === 'Tạm ẩn' && v.status !== 'PAUSED' && v.status !== 'Tạm ẩn') return false;
    if (activeTab === 'Vi phạm' && v.status !== 'REJECTED' && v.status !== 'Vi phạm') return false;

    // 3. Status Filter Dropdown
    if (statusFilter !== 'Tất cả') {
      if (statusFilter === 'Đã đăng' && v.status !== 'PUBLISHED' && v.status !== 'Đã đăng') return false;
      if (statusFilter === 'Chờ duyệt' && v.status !== 'PENDING_REVIEW' && v.status !== 'Chờ duyệt') return false;
      if (statusFilter === 'Tạm ẩn' && v.status !== 'PAUSED' && v.status !== 'Tạm ẩn') return false;
      if (statusFilter === 'Vi phạm' && v.status !== 'REJECTED' && v.status !== 'Vi phạm') return false;
    }

    // 4. Type Filter Dropdown
    if (typeFilter !== 'Tất cả') {
      if (v.type !== typeFilter) return false;
    }

    return true;
  });

  // Handlers
  const handleUploadSubmit = (newVid) => {
    const updated = [newVid, ...videos];
    refreshVideos(updated);
    setIsUploadModalOpen(false);
    alert(`✅ Đã đăng thành công Video "${newVid.title}" (ID: ${newVid.id}) lên V-life Super App Video Feed!`);
  };

  const handlePauseVideo = (id) => {
    const updated = videos.map(v => v.id === id ? { ...v, status: 'PAUSED' } : v);
    refreshVideos(updated);
    alert('⚪ Đã tạm ẩn Video!');
  };

  const handlePublishVideo = (id) => {
    const updated = videos.map(v => v.id === id ? { ...v, status: 'PUBLISHED' } : v);
    refreshVideos(updated);
    alert('🟢 Đã xuất bản lại Video lên V-life Super App!');
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Video này không?')) {
      const updated = videos.filter(v => v.id !== id);
      refreshVideos(updated);
      alert('🗑️ Đã xóa Video thành công.');
    }
  };

  return (
    <div className="video-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Bar */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>KÊNH VIDEO</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản lý video bán hàng và tiếp cận khách hàng trên V-life Super App</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-secondary" onClick={() => alert('Đang mở Hướng dẫn sản xuất Video ngắn chốt đơn bùng nổ trên V-life...')}>
            <HelpCircle size={15} /> Hướng dẫn
          </button>

          <button className="nav-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={16} /> Đăng video
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Cards */}
      <VideoKpiCards 
        metrics={overview}
        onSelectKpi={(st) => {
          if (st === 'views') setActiveTab('Tất cả video');
          if (st === 'affiliate_commission') setActiveTab('Affiliate');
        }}
      />

      {/* 3. Main Content Layout (Table / Affiliate View + Right Sidebar Summary) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px', marginTop: '24px' }}>
        {/* Left Side */}
        <div>
          {/* Status Tabs */}
          <VideoTabs 
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            metrics={overview}
          />

          {/* Conditional rendering for Affiliate Tab vs Standard Video List */}
          {activeTab === 'Affiliate' ? (
            <AffiliateOverview />
          ) : (
            <>
              {/* Search & Filter Toolbar */}
              <VideoFilters 
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
                  setActiveTab('Tất cả video');
                  setStatusFilter('Tất cả');
                  setTypeFilter('Tất cả');
                }}
              />

              {/* Master Video Table */}
              <VideoTable 
                videos={filteredVideos}
                onViewDetail={setSelectedDetailVideo}
                onEdit={(item) => {
                  setSelectedDetailVideo(item);
                }}
                onViewAnalytics={setSelectedAnalyticsVideo}
                onPause={handlePauseVideo}
                onPublish={handlePublishVideo}
                onDelete={handleDeleteVideo}
                onUploadVideo={() => setIsUploadModalOpen(true)}
              />
            </>
          )}
        </div>

        {/* Right Side: Sidebar Summary Cards */}
        <div>
          <VideoOverviewChart 
            onOpenDetail={setSelectedDetailVideo}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      {isUploadModalOpen && (
        <VideoUploadModal 
          catalogProducts={existingProducts}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmitVideo={handleUploadSubmit}
        />
      )}

      {selectedDetailVideo && (
        <VideoDetailDrawer 
          video={selectedDetailVideo}
          catalogProducts={existingProducts}
          onClose={() => setSelectedDetailVideo(null)}
        />
      )}

      {selectedAnalyticsVideo && (
        <VideoAnalyticsModal 
          video={selectedAnalyticsVideo}
          onClose={() => setSelectedAnalyticsVideo(null)}
        />
      )}
    </div>
  );
}
