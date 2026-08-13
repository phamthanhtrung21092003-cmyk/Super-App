import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import ShippingOverview from './ShippingOverview';
import ShippingTabs from './ShippingTabs';
import ShippingFilters from './ShippingFilters';
import ShippingTable from './ShippingTable';
import ShippingDetailDrawer from './ShippingDetailDrawer';
import CarrierManagement from './CarrierManagement';
import PickupAddress from './PickupAddress';
import WarehousePickup from './WarehousePickup';
import CreateShipmentModal from './CreateShipmentModal';
import DeliveryFailedModal from './DeliveryFailedModal';
import ShippingLabelModal from './ShippingLabelModal';
import { Search, Filter, Printer, PlusCircle } from 'lucide-react';

export default function ShippingManager({ 
  existingOrders = [],
  existingProducts = [],
  onNavigateToTab 
}) {
  const [shipments, setShipments] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [overview, setOverview] = useState({});

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [carrierFilter, setCarrierFilter] = useState('Tất cả');

  // Interactive Modal States
  const [selectedDetailShipment, setSelectedDetailShipment] = useState(null);
  const [printingLabelShipment, setPrintingLabelShipment] = useState(null);
  const [failedShipment, setFailedShipment] = useState(null);
  const [creatingShipmentOrder, setCreatingShipmentOrder] = useState(null);

  // Load Shipments Data
  useEffect(() => {
    sellerService.getShipments(existingOrders).then(list => {
      setShipments(list);
      sellerService.getShippingOverview(list).then(ov => setOverview(ov));
    });

    sellerService.getCarriers().then(cList => setCarriers(cList));
    sellerService.getPickupAddresses().then(aList => setAddresses(aList));
  }, [existingOrders]);

  const refreshShipments = (newList) => {
    setShipments(newList);
    sellerService.getShippingOverview(newList).then(ov => setOverview(ov));
  };

  // Filtered Shipments
  const filteredShipments = shipments.filter(ship => {
    // 1. Search Query (Code, Tracking No, Customer Name, Phone, Product ID, SKU)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const code = (ship.code || ship.orderId || '').toLowerCase();
      const tracking = (ship.trackingNo || '').toLowerCase();
      const cust = (typeof ship.customer === 'object' ? ship.customer.name : ship.customerName || ship.customer || '').toLowerCase();
      const phone = (typeof ship.customer === 'object' ? ship.customer.phone : ship.customerPhone || '').toLowerCase();
      const itemProd = (ship.items?.[0]?.name || '').toLowerCase();
      const itemSku = (ship.items?.[0]?.sku || '').toLowerCase();

      if (!code.includes(q) && !tracking.includes(q) && !cust.includes(q) && !phone.includes(q) && !itemProd.includes(q) && !itemSku.includes(q)) {
        return false;
      }
    }

    // 2. Tab Filter
    if (activeTab !== 'Tất cả') {
      if (activeTab === 'Chờ lấy hàng' && ship.status !== 'Chờ lấy hàng') return false;
      if (activeTab === 'Đã lấy hàng' && ship.status !== 'Đã lấy hàng') return false;
      if (activeTab === 'Đang vận chuyển' && ship.status !== 'Đang vận chuyển') return false;
      if (activeTab === 'Đang giao' && ship.status !== 'Đang giao') return false;
      if (activeTab === 'Giao thành công' && (ship.status !== 'Giao thành công' && ship.status !== 'Đã giao')) return false;
      if (activeTab === 'Giao thất bại' && ship.status !== 'Giao thất bại') return false;
      if (activeTab === 'Đã hoàn' && ship.status !== 'Đã hoàn') return false;
    }

    // 3. Carrier Filter
    if (carrierFilter !== 'Tất cả') {
      if (ship.provider !== carrierFilter) return false;
    }

    return true;
  });

  // Handlers
  const handleToggleCarrier = (carrierId) => {
    const updated = carriers.map(c => c.id === carrierId ? { ...c, active: !c.active } : c);
    setCarriers(updated);
  };

  const handleSetDefaultAddress = (addrId) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === addrId }));
    setAddresses(updated);
  };

  const handleCreateShipment = (orderId, providerName, trackingNo) => {
    const newShipment = {
      id: `sh_${Date.now()}`,
      orderId,
      code: orderId,
      trackingNo,
      provider: providerName,
      customerName: 'Nguyễn Văn B',
      customerPhone: '0901 234 567',
      address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      status: 'Chờ lấy hàng',
      shippingFee: 25000,
      estimatedDate: '15/08/2026',
      items: [{ name: 'Áo thun nam basic', productId: 'p2', sku: 'ATB-BLK-M', quantity: 2 }]
    };
    refreshShipments([newShipment, ...shipments]);
    setCreatingShipmentOrder(null);
    alert(`✅ Đã tạo vận đơn mới ${trackingNo} cho đơn hàng #${orderId}! Đơn hàng chuyển sang trạng thái Chờ lấy hàng.`);
  };

  const handleHandoverShipment = (shipmentId) => {
    const updated = shipments.map(s => s.id === shipmentId ? { ...s, status: 'Đã lấy hàng' } : s);
    refreshShipments(updated);
    alert(`📦 Đã xác nhận bàn giao vận đơn cho shipper! Trạng thái chuyển sang Đã lấy hàng.`);
  };

  const handleRetryDelivery = (shipmentId) => {
    const updated = shipments.map(s => s.id === shipmentId ? { ...s, status: 'Đang giao' } : s);
    refreshShipments(updated);
    setFailedShipment(null);
    alert(`🚚 Đã phát lại lần 2 cho vận đơn! Trạng thái chuyển sang Đang giao.`);
  };

  const handleReturnShipment = (shipmentId) => {
    const updated = shipments.map(s => s.id === shipmentId ? { ...s, status: 'Đã hoàn' } : s);
    refreshShipments(updated);
    setFailedShipment(null);
    alert(`↩️ Đã xác nhận hoàn trả vận đơn về kho Seller!`);
  };

  return (
    <div className="shipping-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>VẬN CHUYỂN</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản lý giao nhận, vận đơn và trạng thái vận chuyển của đơn hàng</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <div className="search-box-pill" style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="🔍 Tìm mã đơn / mã vận đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-input-control"
              style={{ paddingLeft: '34px', width: '260px' }}
            />
          </div>

          <button className="nav-btn-secondary" onClick={() => alert('📥 Đã xuất báo cáo dữ liệu vận đơn định dạng Excel (.xlsx)...')}>
            <Printer size={16} /> Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <ShippingOverview 
        overview={overview}
        onFilterStatus={(st) => setActiveTab(st)}
      />

      {/* 8 Status Tabs */}
      <ShippingTabs 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        metrics={overview}
      />

      {/* Filter Bar */}
      <ShippingFilters 
        providerFilter={carrierFilter}
        onProviderChange={setCarrierFilter}
        onResetFilters={() => {
          setSearchQuery('');
          setActiveTab('Tất cả');
          setCarrierFilter('Tất cả');
        }}
      />

      {/* Shipment Data Table */}
      <ShippingTable 
        shippingOrders={filteredShipments}
        onViewDetail={setSelectedDetailShipment}
        onOpenPrintLabel={setPrintingLabelShipment}
        onOpenFailedModal={setFailedShipment}
        onHandoverShipment={handleHandoverShipment}
        onNavigateToProducts={() => onNavigateToTab && onNavigateToTab('products')}
      />

      {/* Carrier Management Section */}
      <div style={{ marginTop: '32px' }}>
        <CarrierManagement 
          carriers={carriers}
          onToggleCarrier={handleToggleCarrier}
        />
      </div>

      {/* Pickup Address & Warehouse Pickup Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
        <PickupAddress 
          addresses={addresses}
          onAddAddress={() => alert('➕ Thêm địa chỉ lấy hàng mới!')}
          onSetDefault={handleSetDefaultAddress}
        />

        <WarehousePickup 
          onManageWarehouses={() => onNavigateToTab && onNavigateToTab('inventory')}
        />
      </div>

      {/* Interactive Modals */}
      {selectedDetailShipment && (
        <ShippingDetailDrawer 
          shipment={selectedDetailShipment}
          onClose={() => setSelectedDetailShipment(null)}
          onOpenPrintLabel={(s) => {
            setSelectedDetailShipment(null);
            setPrintingLabelShipment(s);
          }}
        />
      )}

      {printingLabelShipment && (
        <ShippingLabelModal 
          shipment={printingLabelShipment}
          onClose={() => setPrintingLabelShipment(null)}
        />
      )}

      {failedShipment && (
        <DeliveryFailedModal 
          shipment={failedShipment}
          onClose={() => setFailedShipment(null)}
          onRetryDelivery={handleRetryDelivery}
          onReturnShipment={handleReturnShipment}
        />
      )}

      {creatingShipmentOrder && (
        <CreateShipmentModal 
          order={creatingShipmentOrder}
          activeCarriers={carriers}
          onClose={() => setCreatingShipmentOrder(null)}
          onCreateShipment={handleCreateShipment}
          onNavigateToCarrierSetup={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
