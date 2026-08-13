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
  onNavigateTab, 
  onOpenAddProductModal 
}) {
  // Core Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [stats, setStats] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [stockStatusFilter, setStockStatusFilter] = useState('Tất cả');

  // Interactive Modal States
  const [prefilledSku, setPrefilledSku] = useState('');
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);

  // Load Inventory & Stats
  useEffect(() => {
    sellerService.getInventory(existingProducts).then(items => {
      setInventoryItems(items);
      sellerService.getInventoryStats(items, existingProducts).then(st => setStats(st));
    });

    sellerService.getInventoryTransactions().then(txs => setTransactionsList(txs));
  }, [existingProducts]);

  // Recalculate stats when items change
  const refreshItemsAndStats = (newItems) => {
    setInventoryItems(newItems);
    sellerService.getInventoryStats(newItems, existingProducts).then(st => setStats(st));
  };

  // Low stock items for alert card
  const lowStockAlertItems = inventoryItems.filter(i => {
    const physical = i.physicalStock || i.quantity || 0;
    const reserved = i.reservedStock || 0;
    const available = Math.max(0, physical - reserved);
    return available <= (i.minimumStock || 10);
  });

  // Filter Items
  const filteredItems = inventoryItems.filter(item => {
    const matchingProduct = existingProducts.find(p => p.id === item.productId) || {};
    const name = item.productName || matchingProduct.name || item.name || '';
    const sku = item.sku || '';
    const pid = item.productId || matchingProduct.id || '';

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = name.toLowerCase().includes(q);
      const matchSku = sku.toLowerCase().includes(q);
      const matchPid = pid.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchPid) return false;
    }

    // Category filter
    if (categoryFilter !== 'Tất cả' && categoryFilter !== 'Tất cả danh mục') {
      const cat = matchingProduct.category || item.category || '';
      if (cat !== categoryFilter) return false;
    }

    // Status filter
    const physical = item.physicalStock || item.quantity || 0;
    const reserved = item.reservedStock || 0;
    const available = Math.max(0, physical - reserved);
    const minStock = item.minimumStock || 10;

    if (stockStatusFilter === 'Còn hàng' && available <= minStock) return false;
    if (stockStatusFilter === 'Sắp hết' && (available > minStock || available === 0)) return false;
    if (stockStatusFilter === 'Hết hàng' && available > 0) return false;

    return true;
  });

  // Handlers
  const handleOpenReceive = (sku = '') => {
    setPrefilledSku(sku);
    setIsReceiveOpen(true);
  };

  const handleConfirmReceive = async (productId, sku, quantity, reason, note) => {
    const updated = await sellerService.receiveInventory(inventoryItems, sku, quantity, reason);
    refreshItemsAndStats(updated);

    // Add to transaction log
    const matchingProduct = existingProducts.find(p => p.id === productId) || {};
    const newTx = {
      id: `tx_${Date.now()}`,
      time: new Date().toLocaleString('vi-VN'),
      productName: matchingProduct.name || 'Sản phẩm mới',
      sku,
      type: 'Nhập kho',
      typeCode: 'RECEIVE',
      qty: +quantity,
      before: 128,
      after: 128 + quantity,
      reason,
      user: 'Quản lý Kho'
    };
    setTransactionsList([newTx, ...transactionsList]);
    setIsReceiveOpen(false);
    alert(`✅ Đã nhập bổ sung +${quantity} sản phẩm vào kho cho SKU ${sku}!`);
  };

  const handleConfirmAdjust = async (sku, newPhysicalQuantity, reason) => {
    const updated = await sellerService.adjustInventory(inventoryItems, sku, 'set', newPhysicalQuantity, reason);
    refreshItemsAndStats(updated);

    // Add to transaction log
    const item = inventoryItems.find(i => i.sku === sku);
    const matchingProduct = existingProducts.find(p => p.id === item?.productId) || {};
    const currentPhys = item?.physicalStock || item?.quantity || 128;
    const diff = newPhysicalQuantity - currentPhys;

    const newTx = {
      id: `tx_${Date.now()}`,
      time: new Date().toLocaleString('vi-VN'),
      productName: matchingProduct.name || item?.productName || 'Sản phẩm',
      sku,
      type: 'Điều chỉnh',
      typeCode: 'ADJUST',
      qty: diff,
      before: currentPhys,
      after: newPhysicalQuantity,
      reason,
      user: 'Thủ kho'
    };
    setTransactionsList([newTx, ...transactionsList]);
    setAdjustingItem(null);
    alert(`✅ Đã điều chỉnh tồn thực tế SKU ${sku} thành ${newPhysicalQuantity} sản phẩm!`);
  };

  const handleBulkAction = (action, skus, value) => {
    if (action === 'adjust' && value !== undefined) {
      let current = [...inventoryItems];
      skus.forEach(s => {
        current = current.map(i => i.sku === s ? { ...i, physicalStock: Number(value), availableStock: Math.max(0, Number(value) - (i.reservedStock || 0)) } : i);
      });
      refreshItemsAndStats(current);
      alert(`✅ Đã điều chỉnh hàng loạt ${skus.length} SKU thành ${value} sản phẩm!`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('Tất cả');
    setStockStatusFilter('Tất cả');
  };

  return (
    <div className="inventory-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Area */}
      <InventoryHeader 
        onOpenReceiveModal={() => handleOpenReceive()}
        onOpenAdjustModal={() => {
          if (inventoryItems.length > 0) setAdjustingItem(inventoryItems[0]);
        }}
        onExportReport={() => alert('📥 Đã xuất báo cáo tồn kho định dạng Excel (.xlsx)...')}
      />

      {/* 2. KPI Stats Cards */}
      <InventoryKpiCards 
        stats={stats} 
        onFilterStatus={(st) => {
          if (st === 'low') setStockStatusFilter('Sắp hết');
          else if (st === 'out') setStockStatusFilter('Hết hàng');
          else setStockStatusFilter('Tất cả');
        }}
      />

      {/* 3. Low Stock Alerts Card */}
      {lowStockAlertItems.length > 0 && (
        <LowStockAlerts 
          lowStockItems={lowStockAlertItems}
          onOpenReceive={(sku) => handleOpenReceive(sku)}
        />
      )}

      {/* 4. Search & Filter Bar */}
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        stockStatusFilter={stockStatusFilter}
        onStockStatusChange={setStockStatusFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Inventory Data Table */}
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

      {/* Modals */}
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

