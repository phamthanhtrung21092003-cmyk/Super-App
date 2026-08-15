import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import InventoryHeader from './InventoryHeader';
import InventoryKpiCards from './InventoryKpiCards';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';
import LowStockAlerts from './LowStockAlerts';
import InventoryTransactions from './InventoryTransactions';
import ReceiveInventoryModal from './ReceiveInventoryModal';
import AdjustInventoryModal from './AdjustInventoryModal';

export default function InventoryManager({ 
  existingProducts = [], 
  initialStatusFilter = 'Tất cả',
  initialSearchQuery = '',
  onNavigateTab, 
  onOpenAddProductModal 
}) {
  // Core Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [stats, setStats] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [stockStatusFilter, setStockStatusFilter] = useState(initialStatusFilter || 'Tất cả');
  const [warehouseFilter, setWarehouseFilter] = useState('Tất cả');
  const [stockRangeFilter, setStockRangeFilter] = useState('Tất cả');

  // Interactive Modal States
  const [prefilledSku, setPrefilledSku] = useState('');
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);

  // Sync initial status and search filter if changed from props
  useEffect(() => {
    if (initialStatusFilter) {
      setStockStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialSearchQuery !== undefined && initialSearchQuery !== null) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Load Inventory & Stats from Single Source of Truth
  useEffect(() => {
    sellerService.getInventory(existingProducts).then(items => {
      setInventoryItems(items);
      sellerService.getInventoryStats(items).then(st => setStats(st));
    });

    sellerService.getInventoryTransactions().then(txs => setTransactionsList(txs));
  }, [existingProducts]);

  // Recalculate stats when items change
  const refreshItemsAndStats = (newItems) => {
    setInventoryItems(newItems);
    sellerService.getInventoryStats(newItems).then(st => setStats(st));
  };

  // Low stock items for alert card (Threshold <= 5)
  const lowStockAlertItems = inventoryItems.filter(i => {
    const physical = i.physicalStock ?? i.quantity ?? 0;
    return physical <= 5;
  });

  // Filter Items (Requirement 6, 7 & 12)
  const filteredItems = inventoryItems.filter(item => {
    const matchingProduct = existingProducts.find(p => p.id === item.productId) || {};
    const name = item.productName || matchingProduct.name || item.name || '';
    const sku = item.sku || '';
    const pid = item.productId || matchingProduct.id || '';

    // 1. Search query (productId, productName, SKU)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = name.toLowerCase().includes(q);
      const matchSku = sku.toLowerCase().includes(q);
      const matchPid = pid.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchPid) return false;
    }

    // 2. Category filter
    if (categoryFilter !== 'Tất cả' && categoryFilter !== 'Tất cả danh mục') {
      const cat = matchingProduct.category || item.category || '';
      if (cat !== categoryFilter) return false;
    }

    // 3. Status filter (Threshold: 5)
    const physical = item.physicalStock ?? item.quantity ?? 0;
    if (stockStatusFilter === 'Còn hàng' && physical <= 5) return false;
    if (stockStatusFilter === 'Sắp hết' && (physical > 5 || physical === 0)) return false;
    if (stockStatusFilter === 'Hết hàng' && physical > 0) return false;

    // 4. Warehouse filter
    if (warehouseFilter !== 'Tất cả' && warehouseFilter !== 'Tất cả kho') {
      if (item.warehouse !== warehouseFilter) return false;
    }

    // 5. Stock Range filter
    if (stockRangeFilter === 'under10' && physical >= 10) return false;
    if (stockRangeFilter === '10to50' && (physical < 10 || physical > 50)) return false;
    if (stockRangeFilter === 'above50' && physical <= 50) return false;

    return true;
  });

  // Categories list for dropdown
  const uniqueCategories = Array.from(
    new Set(existingProducts.map(p => p.category).filter(Boolean))
  );

  // Handlers
  const handleOpenReceive = (sku = '') => {
    setPrefilledSku(sku);
    setIsReceiveOpen(true);
  };

  const handleConfirmReceive = async (productId, sku, quantity, reason, note) => {
    const updated = await sellerService.receiveInventory(inventoryItems, sku || productId, quantity, reason);
    refreshItemsAndStats(updated);

    // Add to transaction log
    const matchingProduct = existingProducts.find(p => p.id === productId) || {};
    const item = inventoryItems.find(i => i.sku === sku || i.productId === productId);
    const beforeQty = item ? (item.physicalStock ?? item.quantity ?? 100) : 100;

    const newTx = {
      id: `tx_${Date.now()}`,
      time: new Date().toLocaleString('vi-VN'),
      productName: matchingProduct.name || 'Sản phẩm',
      sku: sku || matchingProduct.sku || `SKU-${productId}`,
      type: 'Nhập kho',
      typeCode: 'RECEIVE',
      qty: +quantity,
      before: beforeQty,
      after: beforeQty + Number(quantity),
      reason: reason || 'Nhập kho bổ sung',
      user: 'Quản lý Kho'
    };
    setTransactionsList([newTx, ...transactionsList]);
    setIsReceiveOpen(false);
  };

  const handleConfirmAdjust = async (skuOrPid, newPhysicalQuantity, reason) => {
    const updated = await sellerService.adjustInventory(inventoryItems, skuOrPid, 'set', newPhysicalQuantity, reason);
    refreshItemsAndStats(updated);

    // Add to transaction log
    const item = inventoryItems.find(i => i.sku === skuOrPid || i.productId === skuOrPid || i.id === skuOrPid);
    const matchingProduct = existingProducts.find(p => p.id === item?.productId) || {};
    const currentPhys = item ? (item.physicalStock ?? item.quantity ?? 100) : 100;
    const diff = newPhysicalQuantity - currentPhys;

    const newTx = {
      id: `tx_${Date.now()}`,
      time: new Date().toLocaleString('vi-VN'),
      productName: matchingProduct.name || item?.productName || 'Sản phẩm',
      sku: item?.sku || skuOrPid,
      type: 'Điều chỉnh',
      typeCode: 'ADJUST',
      qty: diff,
      before: currentPhys,
      after: newPhysicalQuantity,
      reason: reason || 'Kiểm kê thực tế',
      user: 'Thủ kho'
    };
    setTransactionsList([newTx, ...transactionsList]);
    setAdjustingItem(null);
  };

  const handleBulkAction = (action, skus, value) => {
    if (action === 'adjust' && value !== undefined) {
      let current = [...inventoryItems];
      skus.forEach(s => {
        current = current.map(i => {
          if (i.sku === s || i.productId === s) {
            const phys = Number(value);
            const res = i.reservedStock || 0;
            return {
              ...i,
              physicalStock: phys,
              quantity: phys,
              availableStock: Math.max(0, phys - res),
              availableQuantity: Math.max(0, phys - res)
            };
          }
          return i;
        });
      });
      refreshItemsAndStats(current);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('Tất cả');
    setStockStatusFilter('Tất cả');
    setWarehouseFilter('Tất cả');
    setStockRangeFilter('Tất cả');
  };

  return (
    <div className="inventory-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Area (Requirement 4) */}
      <InventoryHeader 
        onOpenReceiveModal={() => handleOpenReceive()}
        onExportReport={() => alert(`📥 Đã xuất báo cáo tồn kho cho ${inventoryItems.length} sản phẩm định dạng Excel (.xlsx)...`)}
      />

      {/* 2. 4 KPI Stats Cards (Requirement 5) */}
      <InventoryKpiCards 
        stats={stats} 
        onFilterStatus={(st) => {
          setStockStatusFilter(st);
        }}
      />

      {/* 3. Low Stock Alerts Card */}
      {lowStockAlertItems.length > 0 && (
        <LowStockAlerts 
          lowStockItems={lowStockAlertItems}
          onOpenReceive={(sku) => handleOpenReceive(sku)}
        />
      )}

      {/* 4. Search & Filter Bar (Requirement 6 & 7) */}
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stockStatusFilter={stockStatusFilter}
        onStockStatusChange={setStockStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        warehouseFilter={warehouseFilter}
        onWarehouseChange={setWarehouseFilter}
        stockRangeFilter={stockRangeFilter}
        onStockRangeChange={setStockRangeFilter}
        categories={uniqueCategories}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Inventory Data Table & Empty State (Requirement 8, 9, 13 & 19) */}
      <InventoryTable 
        items={filteredItems}
        existingProducts={existingProducts}
        onOpenReceiveModal={(sku) => handleOpenReceive(sku)}
        onOpenAdjustModal={setAdjustingItem}
        onOpenAddProductModal={onOpenAddProductModal}
        onBulkAction={handleBulkAction}
      />

      {/* 6. Inventory Transactions Log Table */}
      <InventoryTransactions transactions={transactionsList} />

      {/* Modals: Nhập kho (Requirement 10) & Điều chỉnh (Requirement 11) */}
      {isReceiveOpen && (
        <ReceiveInventoryModal 
          existingProducts={existingProducts}
          prefilledSku={prefilledSku}
          onClose={() => setIsReceiveOpen(false)}
          onConfirmReceive={handleConfirmReceive}
        />
      )}

      {adjustingItem && (
        <AdjustInventoryModal 
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onConfirmAdjust={handleConfirmAdjust}
        />
      )}
    </div>
  );
}
