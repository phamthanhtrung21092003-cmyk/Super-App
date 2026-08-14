import React, { useState } from 'react';
import ReportKpiCards from './ReportKpiCards';
import ReportTabs from './ReportTabs';
import ReportFilters from './ReportFilters';
import RevenueReportChart from './RevenueReportChart';
import ChannelRevenueChart from './ChannelRevenueChart';
import PerformanceOverview from './PerformanceOverview';
import TopProductsReport from './TopProductsReport';
import CategoryPerformance from './CategoryPerformance';
import QuickReports from './QuickReports';
import RevenueReport from './RevenueReport';
import OrderReport from './OrderReport';
import ProductReport from './ProductReport';
import CustomerReport from './CustomerReport';
import LivestreamReport from './LivestreamReport';
import PromotionReport from './PromotionReport';
import ShippingReport from './ShippingReport';
import FinancialReport from './FinancialReport';
import ReportExportModal from './ReportExportModal';
import ReportCustomizeModal from './ReportCustomizeModal';
import ReportEmptyState from './ReportEmptyState';
import ProductDetail from '../products/ProductDetail';
import { Download, Plus } from 'lucide-react';

export default function ReportManager({ 
  existingProducts = [], 
  existingOrders = [], 
  onNavigateToTab 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  // Filter States
  const [period, setPeriod] = useState('7d');
  const [dateRange, setDateRange] = useState('07/08/2026 - 13/08/2026');
  const [comparison, setComparison] = useState('previous_period');
  const [store, setStore] = useState('all');
  const [category, setCategory] = useState('all');

  // Modal & Drawer States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  // Check if shop has zero data
  const isNewShop = (!existingProducts || existingProducts.length === 0) && (!existingOrders || existingOrders.length === 0);

  return (
    <div className="report-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Bar */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>BÁO CÁO</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Theo dõi và phân tích hiệu quả kinh doanh của cửa hàng</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            <Download size={15} /> Xuất báo cáo
          </button>

          <button className="nav-btn-primary" onClick={() => setIsCustomizeModalOpen(true)}>
            <Plus size={16} /> Tùy chỉnh báo cáo
          </button>
        </div>
      </div>

      {/* 2. 9 Report Tabs */}
      <ReportTabs 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 3. Filter Bar */}
      <ReportFilters 
        period={period}
        onPeriodChange={setPeriod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        comparison={comparison}
        onComparisonChange={setComparison}
        store={store}
        onStoreChange={setStore}
        category={category}
        onCategoryChange={setCategory}
        onResetFilters={() => {
          setPeriod('7d');
          setStore('all');
          setCategory('all');
        }}
      />

      {/* 4. Tab Views Content Rendering */}
      {isNewShop ? (
        <ReportEmptyState onNavigateToTab={onNavigateToTab} />
      ) : (
        <>
          {/* TAB 1: OVERVIEW (TỔNG QUAN) */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              {/* 5 KPI Cards */}
              <ReportKpiCards isNewShop={isNewShop} />

              {/* Main Analytics Grid (Left Charts & Right Summary Cards) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px' }}>
                {/* Left Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Revenue Line Chart */}
                  <RevenueReportChart />

                  {/* Channel Donut Chart */}
                  <ChannelRevenueChart />

                  {/* Category Performance Table */}
                  <CategoryPerformance />
                </div>

                {/* Right Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <PerformanceOverview />
                  <TopProductsReport 
                    catalogProducts={existingProducts} 
                    onOpenProductDetail={(p) => setSelectedDetailProduct(p)} 
                  />
                  <QuickReports onSelectTab={setActiveTab} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOANH THU */}
          {activeTab === 'revenue' && <RevenueReport />}

          {/* TAB 3: ĐƠN HÀNG */}
          {activeTab === 'orders' && <OrderReport existingOrders={existingOrders} />}

          {/* TAB 4: SẢN PHẨM */}
          {activeTab === 'products' && (
            <ProductReport 
              catalogProducts={existingProducts} 
              onOpenProductDetail={(p) => setSelectedDetailProduct(p)} 
            />
          )}

          {/* TAB 5: KHÁCH HÀNG */}
          {activeTab === 'customers' && <CustomerReport />}

          {/* TAB 6: LIVESTREAM */}
          {activeTab === 'livestream' && <LivestreamReport />}

          {/* TAB 7: KHUYẾN MÃI */}
          {activeTab === 'promotions' && <PromotionReport />}

          {/* TAB 8: VẬN CHUYỂN */}
          {activeTab === 'shipping' && <ShippingReport />}

          {/* TAB 9: TÀI CHÍNH */}
          {activeTab === 'finance' && <FinancialReport />}
        </>
      )}

      {/* Modals & Drawers */}
      {isExportModalOpen && (
        <ReportExportModal onClose={() => setIsExportModalOpen(false)} />
      )}

      {isCustomizeModalOpen && (
        <ReportCustomizeModal onClose={() => setIsCustomizeModalOpen(false)} />
      )}

      {selectedDetailProduct && (
        <ProductDetail 
          product={selectedDetailProduct} 
          onClose={() => setSelectedDetailProduct(null)} 
        />
      )}
    </div>
  );
}
