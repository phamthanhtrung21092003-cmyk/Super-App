import React from 'react';
import { FileText, ChevronRight, TrendingUp, DollarSign, PieChart, Wallet } from 'lucide-react';

export default function FinancialReports({ onOpenReport }) {
  const reports = [
    {
      id: 'revenue',
      title: 'Báo cáo doanh thu',
      desc: 'Xem chi tiết doanh thu theo thời gian',
      icon: TrendingUp,
      iconColor: '#00B14F'
    },
    {
      id: 'expense',
      title: 'Báo cáo chi phí',
      desc: 'Xem chi tiết các khoản chi phí',
      icon: DollarSign,
      iconColor: '#EF4444'
    },
    {
      id: 'profit',
      title: 'Báo cáo lợi nhuận',
      desc: 'Xem chi tiết lợi nhuận ước tính',
      icon: PieChart,
      iconColor: '#9333EA'
    },
    {
      id: 'debt',
      title: 'Báo cáo công nợ',
      desc: 'Xem chi tiết công nợ phải thu, phải trả',
      icon: Wallet,
      iconColor: '#1877F2'
    }
  ];

  return (
    <div className="finance-chart-card financial-reports-card">
      <div className="card-header-row">
        <h3 className="card-heading-title">Báo cáo tài chính</h3>
      </div>

      <div className="reports-stack-list">
        {reports.map(rep => {
          const IconComp = rep.icon;

          return (
            <div 
              key={rep.id} 
              className="report-item-row"
              onClick={() => onOpenReport && onOpenReport(rep.id)}
            >
              <div className="report-item-left">
                <div className="report-icon-box" style={{ color: rep.iconColor, backgroundColor: `${rep.iconColor}15` }}>
                  <IconComp size={16} />
                </div>
                <div className="report-details-text">
                  <strong className="report-title">{rep.title}</strong>
                  <span className="report-desc">{rep.desc}</span>
                </div>
              </div>

              <div className="report-item-right">
                <FileText size={16} className="doc-icon-btn" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
