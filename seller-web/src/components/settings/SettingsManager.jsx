import React, { useState } from 'react';
import SettingsMenu from './SettingsMenu';
import ShopInformation from './ShopInformation';
import VerificationCard from './VerificationCard';
import ShopPerformanceCard from './ShopPerformanceCard';
import ActivatedServicesCard from './ActivatedServicesCard';
import AccountSecurity from './AccountSecurity';
import WarehouseSettings from './WarehouseSettings';
import BankAccountSettings from './BankAccountSettings';
import FeeSettings from './FeeSettings';
import NotificationSettings from './NotificationSettings';
import PrintSettings from './PrintSettings';
import ConnectionSettings from './ConnectionSettings';
import ActivityLogs from './ActivityLogs';
import LanguageSettings from './LanguageSettings';
import ThemeSettings from './ThemeSettings';

export default function SettingsManager({ existingProducts = [], existingOrders = [] }) {
  const [activeSetting, setActiveSetting] = useState('info');

  const isNewShop = (!existingProducts || existingProducts.length === 0) && (!existingOrders || existingOrders.length === 0);

  return (
    <div className="settings-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Bar */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>CÀI ĐẶT</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản lý thông tin cửa hàng, tài khoản và các thiết lập hệ thống</p>
        </div>
      </div>

      {/* 2. Main 2-Column or 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: activeSetting === 'info' ? '260px 1fr 280px' : '260px 1fr', gap: '20px' }}>
        {/* Left Side: Settings Menu */}
        <div>
          <SettingsMenu 
            activeSetting={activeSetting} 
            onSelectSetting={setActiveSetting} 
          />
        </div>

        {/* Center Content Area: Dynamic Active Setting Panel */}
        <div>
          {activeSetting === 'info' && <ShopInformation />}
          {activeSetting === 'security' && <AccountSecurity />}
          {activeSetting === 'warehouse' && <WarehouseSettings />}
          {activeSetting === 'bank' && <BankAccountSettings />}
          {activeSetting === 'fees' && <FeeSettings />}
          {activeSetting === 'notifications' && <NotificationSettings />}
          {activeSetting === 'print' && <PrintSettings />}
          {activeSetting === 'connections' && <ConnectionSettings />}
          {activeSetting === 'logs' && <ActivityLogs />}
          {activeSetting === 'language' && <LanguageSettings />}
          {activeSetting === 'theme' && <ThemeSettings />}

          {/* Activated Services Banner Bottom */}
          <ActivatedServicesCard />
        </div>

        {/* Right Side: Verification & Shop Performance Sub-panels (for Info view) */}
        {activeSetting === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <VerificationCard />
            <ShopPerformanceCard isNewShop={isNewShop} />
          </div>
        )}
      </div>
    </div>
  );
}
