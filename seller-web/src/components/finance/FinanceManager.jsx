import React, { useState, useEffect } from 'react';
import sellerService from '../../data/sellerService';
import FinanceKpiCards from './FinanceKpiCards';
import RevenueChart from './RevenueChart';
import CashFlowChart from './CashFlowChart';
import SellerBalance from './SellerBalance';
import RevenueSources from './RevenueSources';
import RecentTransactions from './RecentTransactions';
import FinancialReports from './FinancialReports';
import TransactionTabs from './TransactionTabs';
import TransactionFilters from './TransactionFilters';
import TransactionDetailDrawer from './TransactionDetailDrawer';
import ReconciliationModal from './ReconciliationModal';
import WithdrawalModal from './WithdrawModal';
import BankAccountManager from './BankAccountManager';
import DebtOverview from './DebtOverview';
import ExportReportModal from './ExportReportModal';
import { Download, CheckCircle2, Settings, Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function FinanceManager({ 
  existingOrders = [], 
  onNavigateToTab 
}) {
  const [balance, setBalance] = useState({ available: 62850000, pending: 35620000, receivable: 5000000 });
  const [transactionsList, setTransactionsList] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [dateRange, setDateRange] = useState('07/05/2026 - 13/05/2026');

  // Modals & Drawers
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);

  // Load Financial Data
  useEffect(() => {
    sellerService.getSellerBalance().then(b => setBalance(b));
    sellerService.getTransactions().then(txs => setTransactionsList(txs));
    sellerService.getBankAccounts().then(accs => setBankAccounts(accs));
  }, []);

  // Filtered Master Transactions List
  const filteredTransactions = transactionsList.filter(tx => {
    // Search query (ID, Order ID, Content, Amount)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const id = (tx.id || '').toLowerCase();
      const code = (tx.code || tx.orderId || '').toLowerCase();
      const desc = (tx.content || tx.description || '').toLowerCase();
      const amt = (tx.amount || 0).toString();
      if (!id.includes(q) && !code.includes(q) && !desc.includes(q) && !amt.includes(q)) return false;
    }

    // Tab Filter
    if (activeTab === 'Doanh thu' && (tx.amount < 0 || tx.type === 'Chi phí' || tx.type === 'Hoàn tiền')) return false;
    if (activeTab === 'Chi phí' && (tx.amount > 0 && tx.type !== 'Chi phí')) return false;
    if (activeTab === 'Hoàn tiền' && tx.type !== 'Hoàn tiền') return false;
    if (activeTab === 'Đối soát' && tx.type !== 'Đối soát') return false;
    if (activeTab === 'Công nợ' && tx.type !== 'Công nợ') return false;

    return true;
  });

  // Handlers
  const handleWithdrawConfirm = (amount, bankAccountId) => {
    const numAmt = Number(amount);
    if (numAmt > balance.available) {
      alert('Số tiền rút vượt quá số dư khả dụng!');
      return;
    }
    const newAvail = balance.available - numAmt;
    setBalance({ ...balance, available: newAvail });

    const newTx = {
      id: `TX${Math.floor(10000 + Math.random() * 90000)}`,
      time: new Date().toLocaleString('vi-VN'),
      content: `Rút tiền về tài khoản ngân hàng`,
      amount: -numAmt,
      netAmount: -numAmt,
      type: 'Rút tiền',
      source: 'Ví S-Shopping',
      status: '🟢 Đang xử lý thanh toán'
    };
    setTransactionsList([newTx, ...transactionsList]);
    setIsWithdrawOpen(false);
    alert(`✅ Đã gửi yêu cầu rút ${numAmt.toLocaleString('vi-VN')} đ về tài khoản ngân hàng thành công!`);
  };

  const handleAddBankAccount = (accountData) => {
    const newAcc = { id: `bank_${Date.now()}`, ...accountData, isDefault: false, verificationStatus: '🟢 Đã xác minh' };
    setBankAccounts([...bankAccounts, newAcc]);
  };

  const handleSetDefaultBank = (accId) => {
    const updated = bankAccounts.map(a => ({ ...a, isDefault: a.id === accId }));
    setBankAccounts(updated);
  };

  return (
    <div className="finance-module-container" style={{ padding: '24px 32px', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 1. Header Title & Actions */}
      <div className="shipping-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>TÀI CHÍNH</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản lý doanh thu, chi phí, công nợ và đối soát tài chính</p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-btn-secondary" onClick={() => setIsExportOpen(true)}>
            <Download size={15} /> Xuất báo cáo
          </button>

          <button className="nav-btn-secondary" onClick={() => setIsReconciliationOpen(true)}>
            <CheckCircle2 size={15} /> Đối soát
          </button>

          <button className="nav-btn-primary" onClick={() => alert('Mở cài đặt tài chính & ví gian hàng...')}>
            <Settings size={15} /> Cài đặt
          </button>
        </div>
      </div>

      {/* 2. 5 KPI Cards */}
      <FinanceKpiCards />

      {/* 3. Middle Section 1: Revenue Line Chart + Cash Flow Doughnut + Seller Balance Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', marginTop: '24px' }}>
        <RevenueChart />
        <CashFlowChart />
        <SellerBalance 
          balance={balance}
          onOpenWithdraw={() => setIsWithdrawOpen(true)}
          onOpenDetail={() => setIsReconciliationOpen(true)}
        />
      </div>

      {/* 4. Middle Section 2: Revenue By Channel + Recent Transactions + Financial Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '20px', marginTop: '24px' }}>
        <RevenueSources />
        <RecentTransactions 
          onViewAll={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
        />
        <FinancialReports 
          onOpenReport={(type) => setIsExportOpen(true)}
        />
      </div>

      {/* 5. Master Transactions Section */}
      <div style={{ marginTop: '32px' }}>
        {/* Transaction Tabs */}
        <TransactionTabs 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Filters Bar */}
        <TransactionFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onResetFilters={() => {
            setSearchQuery('');
            setActiveTab('Tất cả');
            setDateRange('07/05/2026 - 13/05/2026');
          }}
        />

        {/* Master Transactions Data Table */}
        <div className="shipping-table-card" style={{ marginTop: '16px' }}>
          <div className="shipping-table-responsive-wrapper">
            <table className="shipping-master-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Mã giao dịch</th>
                  <th>Mã đơn</th>
                  <th>Nội dung giao dịch</th>
                  <th>Loại</th>
                  <th>Kênh phát sinh</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => {
                  const amt = tx.amount || tx.netAmount || 0;
                  const isPos = amt > 0;

                  return (
                    <tr key={tx.id || idx}>
                      <td>
                        <span className="tx-time-cell">{tx.time || tx.date || '13/08/2026 10:30'}</span>
                      </td>
                      <td>
                        <code className="monospace-tag">#{tx.id || 'TX10098'}</code>
                      </td>
                      <td>
                        <strong className="green-text">#{tx.orderId || 'DH100128'}</strong>
                      </td>
                      <td>
                        <span className="tx-product-name">{tx.content || tx.description}</span>
                      </td>
                      <td>
                        <span className={`tx-type-pill ${isPos ? 'income' : 'expense'}`}>
                          {tx.type || (isPos ? 'Doanh thu' : 'Chi phí')}
                        </span>
                      </td>
                      <td>
                        <span className="c-tag-pill">{tx.source || 'Đơn hàng'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ color: isPos ? '#00B14F' : '#EF4444', fontSize: '14px' }}>
                          {isPos ? `+${amt.toLocaleString('vi-VN')} đ` : `${amt.toLocaleString('vi-VN')} đ`}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="action-view-btn"
                          onClick={() => setSelectedTxDetail(tx)}
                          title="Xem chi tiết giao dịch tài chính"
                        >
                          <Eye size={14} /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Bank Account Manager & Debt Overview Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
        <BankAccountManager 
          accounts={bankAccounts}
          onAddAccount={handleAddBankAccount}
          onSetDefault={handleSetDefaultBank}
        />

        <DebtOverview 
          onOpenDetail={() => alert('Mở chi tiết báo cáo công nợ phải thu, phải trả...')}
        />
      </div>

      {/* Interactive Modals & Drawers */}
      {isWithdrawOpen && (
        <WithdrawalModal 
          balance={balance}
          bankAccounts={bankAccounts}
          onClose={() => setIsWithdrawOpen(false)}
          onConfirmWithdraw={handleWithdrawConfirm}
        />
      )}

      {isReconciliationOpen && (
        <ReconciliationModal 
          onClose={() => setIsReconciliationOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportReportModal 
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {selectedTxDetail && (
        <TransactionDetailDrawer 
          transaction={selectedTxDetail}
          onClose={() => setSelectedTxDetail(null)}
        />
      )}
    </div>
  );
}
