import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function RecentTransactions({ transactions = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const defaultList = [
    {
      id: 'tx_1',
      time: '12/08/2026 14:30',
      content: 'Đơn hàng #VL000128',
      type: 'Doanh thu đơn hàng',
      typeBg: '#E6F4EA',
      typeColor: '#00B14F',
      amount: '+458.000đ',
      isPositive: true,
      status: 'Thành công',
      statusColor: '#16A34A'
    },
    {
      id: 'tx_2',
      time: '12/08/2026 10:15',
      content: 'Phí vận chuyển #VL000127',
      type: 'Phí vận chuyển',
      typeBg: '#EFF6FF',
      typeColor: '#1877F2',
      amount: '-32.000đ',
      isPositive: false,
      status: 'Thành công',
      statusColor: '#16A34A'
    },
    {
      id: 'tx_3',
      time: '11/08/2026 22:10',
      content: 'Rút tiền về tài khoản ngân hàng',
      type: 'Rút tiền',
      typeBg: '#F3E8FF',
      typeColor: '#9333EA',
      amount: '-8.000.000đ',
      isPositive: false,
      status: 'Thành công',
      statusColor: '#16A34A'
    },
    {
      id: 'tx_4',
      time: '11/08/2026 16:45',
      content: 'Phí hoa hồng đơn hàng #VL000126',
      type: 'Phí hoa hồng',
      typeBg: '#FFF7ED',
      typeColor: '#F97316',
      amount: '-22.500đ',
      isPositive: false,
      status: 'Thành công',
      statusColor: '#16A34A'
    },
    {
      id: 'tx_5',
      time: '11/08/2026 09:20',
      content: 'Đối soát doanh thu tuần 32',
      type: 'Đối soát',
      typeBg: '#ECFDF5',
      typeColor: '#059669',
      amount: '+5.200.000đ',
      isPositive: true,
      status: 'Chờ chuyển',
      statusColor: '#F97316'
    }
  ];

  const activeList = transactions && transactions.length > 0 ? transactions : defaultList;
  const totalPages = Math.ceil(activeList.length / pageSize) || 1;
  const pagedItems = activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="finance-transactions-card">
      <div className="tx-card-header">
        <h3 className="card-heading-title">Giao dịch gần đây</h3>
        <button className="view-all-link-btn" onClick={() => alert('Đang tải toàn bộ 25 lịch sử giao dịch...')}>
          Xem tất cả
        </button>
      </div>

      <div className="tx-table-responsive">
        <table className="tx-master-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Nội dung</th>
              <th>Loại giao dịch</th>
              <th style={{ textAlign: 'right' }}>Số tiền</th>
              <th style={{ textAlign: 'right' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map(item => (
              <tr key={item.id}>
                <td>
                  <span className="tx-time-cell">
                    <Calendar size={13} className="time-icon" /> {item.time}
                  </span>
                </td>
                <td>
                  <strong className="tx-content-text">{item.content}</strong>
                </td>
                <td>
                  <span 
                    className="tx-type-pill"
                    style={{ 
                      backgroundColor: item.typeBg || (item.isPositive ? '#E6F4EA' : '#FFF7ED'), 
                      color: item.typeColor || (item.isPositive ? '#00B14F' : '#F97316') 
                    }}
                  >
                    {item.type}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <strong className={`tx-amount-text ${item.isPositive ? 'positive-income' : 'negative-expense'}`}>
                    {item.formattedAmount || item.amount}
                  </strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="tx-status-text" style={{ color: item.statusColor || '#16A34A' }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="tx-pagination-bar">
        <span className="tx-pag-info">
          Hiển thị 1 - {pagedItems.length} của 25 giao dịch
        </span>

        <div className="tx-pag-buttons">
          <button 
            className="pag-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button className={`pag-number-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
          <button className={`pag-number-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
          <button className={`pag-number-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
          <span className="pag-dots">...</span>
          <button className="pag-number-btn" onClick={() => setCurrentPage(5)}>5</button>
          <button 
            className="pag-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
