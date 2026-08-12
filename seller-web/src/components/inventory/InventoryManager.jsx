import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import InventoryHeader from './InventoryHeader';
import InventoryKpiCards from './InventoryKpiCards';
import InventoryFilters from './InventoryFilters';
import InventoryTabs from './InventoryTabs';
import InventoryTable from './InventoryTable';
import AdjustStockModal from './AdjustStockModal';
import StockHistoryModal from './StockHistoryModal';
import StockReceiveModal from './StockReceiveModal';
import StockIssueModal from './StockIssueModal';
import StockReportModal from './StockReportModal';

export default function InventoryManager({ 
  existingProducts = [], 
  onNavigateTab, 
  onOpenAddProductModal 
}) {
  // State A (New Shop: 0 products) vs State B (Active Shop with rich data)
  const [isNewShopState, setIsNewShopState] = useState(false);

  // Core Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [stockStatusFilter, setStockStatusFilter] = useState('Tất cả');
  const [warehouseFilter, setWarehouseFilter] = useState('Tất cả');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'positive' | 'low' | 'out'

  // Modal States
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Load Inventory Data
  const loadData = async () => {
    const whList = await sellerService.getWarehouses();
    setWarehouses(whList);

    const items = await sellerService.getInventory(existingProducts, isNewShopState);
    setInventoryItems(items);

    const st = await sellerService.getInventoryStats(items);
    setStats(st);
  };

  useEffect(() => {
    loadData();
  }, [existingProducts, isNewShopState]);

  // Recalculate Stats whenever inventoryItems change
  useEffect(() => {
    sellerService.getInventoryStats(inventoryItems).then(st => setStats(st));
  }, [inventoryItems]);

  // Tab Count Metrics
  const tabCounts = {
    all: isNewShopState ? 0 : 128,
    positive: isNewShopState ? 0 : 108,
    low: isNewShopState ? 0 : 12,
    out: isNewShopState ? 0 : 8
  };

  // Filter Items Logic
  const filteredItems = inventoryItems.filter(item => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.productName.toLowerCase().includes(q);
      const matchSku = item.sku && item.sku.toLowerCase().includes(q);
      const matchBarcode = item.barcode && item.barcode.includes(q);
      if (!matchName && !matchSku && !matchBarcode) return false;
    }

    // 2. Category Filter
    if (categoryFilter !== 'Tất cả' && categoryFilter !== 'Tất cả danh mục') {
      if (!item.category.includes(categoryFilter)) return false;
    }

    // 3. Stock Status Filter
    if (stockStatusFilter !== 'Tất cả') {
      if (item.status !== stockStatusFilter) return false;
    }

    // 4. Warehouse Filter
    if (warehouseFilter !== 'Tất cả') {
      if (item.warehouseId !== warehouseFilter) return false;
    }

    // 5. Active Tab Status Filter
    if (activeTab === 'positive' && item.quantity <= 0) return false;
    if (activeTab === 'low' && (item.quantity <= 0 || item.quantity > sellerService.LOW_STOCK_THRESHOLD)) return false;
    if (activeTab === 'out' && item.quantity > 0) return false;

    return true;
  });

  // Action Handlers
  const handleConfirmAdjust = async (productId, adjustType, amount, reason) => {
    const updated = await sellerService.adjustInventory(inventoryItems, productId, adjustType, amount, reason);
    setInventoryItems(updated);
    setAdjustingItem(null);
  };

  const handleConfirmReceive = async (productId, quantity, warehouseId, notes) => {
    const updated = await sellerService.receiveInventory(inventoryItems, productId, quantity, warehouseId, notes);
    setInventoryItems(updated);
    setIsReceiveModalOpen(false);
  };

  const handleConfirmIssue = async (productId, quantity, warehouseId, reason) => {
    try {
      const updated = await sellerService.issueInventory(inventoryItems, productId, quantity, warehouseId, reason);
      setInventoryItems(updated);
      setIsIssueModalOpen(false);
    } catch (err) {
      alert(err.message || 'Không đủ tồn kho để xuất.');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('Tất cả');
    setStockStatusFilter('Tất cả');
    setWarehouseFilter('Tất cả');
    setActiveTab('all');
  };

  return (
    <div className="inventory-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Area */}
      <InventoryHeader 
        onOpenReceiveModal={() => setIsReceiveModalOpen(true)}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isNewShopState={isNewShopState}
        onToggleShopState={() => setIsNewShopState(!isNewShopState)}
      />

      {/* 2. KPI Stats Cards */}
      <InventoryKpiCards stats={stats} />

      {/* 3. Search & Filter Bar */}
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        stockStatusFilter={stockStatusFilter}
        onStockStatusChange={setStockStatusFilter}
        warehouseFilter={warehouseFilter}
        onWarehouseChange={setWarehouseFilter}
        warehouses={warehouses}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Status Tabs */}
      <InventoryTabs 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={tabCounts}
      />

      {/* 5. Inventory Data Table */}
      <InventoryTable 
        items={filteredItems}
        onOpenAdjustModal={setAdjustingItem}
        onOpenHistoryModal={setHistoryItem}
        onOpenAddProductModal={onOpenAddProductModal}
        isNewShopState={isNewShopState}
      />

      {/* Modals */}
      {adjustingItem && (
        <AdjustStockModal 
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onConfirm={handleConfirmAdjust}
        />
      )}

      {historyItem && (
        <StockHistoryModal 
          item={historyItem}
          onClose={() => setHistoryItem(null)}
        />
      )}

      {isReceiveModalOpen && (
        <StockReceiveModal 
          inventoryItems={inventoryItems}
          warehouses={warehouses}
          onClose={() => setIsReceiveModalOpen(false)}
          onConfirm={handleConfirmReceive}
        />
      )}

      {isIssueModalOpen && (
        <StockIssueModal 
          inventoryItems={inventoryItems}
          warehouses={warehouses}
          onClose={() => setIsIssueModalOpen(false)}
          onConfirm={handleConfirmIssue}
        />
      )}

      {isReportModalOpen && (
        <StockReportModal 
          stats={stats}
          inventoryItems={inventoryItems}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}
