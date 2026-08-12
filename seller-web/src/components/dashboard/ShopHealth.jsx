import React, { useState, useEffect } from 'react';
import { Activity, Star, ArrowUpRight } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function ShopHealth({ existingOrders = [], onNavigate }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    sellerService.getShopHealth(existingOrders).then(data => setHealth(data));
  }, [existingOrders]);

  if (!health) return null;

  const hasScore = health.score !== null && health.score !== undefined;

  return (
    <div className="dashboard-card shop-health-card">
      <div className="card-header-flex">
        <h3 className="card-title-heading">
          <Activity size={16} className="text-primary-icon" /> Sức khỏe Shop
        </h3>
        <button className="link-see-all-btn" onClick={() => onNavigate && onNavigate('settings')}>
          Xem chi tiết <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="health-score-banner">
        {hasScore ? (
          <div className="score-badge">
            <Star size={16} fill="#EAB308" stroke="#EAB308" />
            <span className="score-number">{health.score}/{health.maxScore}</span>
          </div>
        ) : (
          <div className="score-badge new-shop-badge">
            <span className="score-number">Shop mới</span>
          </div>
        )}
        <span className="health-status-text">{health.statusText}</span>
      </div>

      <div className="health-metrics-grid">
        <div className="health-stat-pill">
          <span className="stat-name">Tỷ lệ giao đúng hạn</span>
          <span className="stat-val green">
            {health.onTimeDeliveryRate !== null ? `${health.onTimeDeliveryRate}%` : '--%'}
          </span>
        </div>
        <div className="health-stat-pill">
          <span className="stat-name">Tỷ lệ đơn hủy</span>
          <span className="stat-val green">
            {health.cancellationRate !== null ? `${health.cancellationRate}%` : '--%'}
          </span>
        </div>
        <div className="health-stat-pill">
          <span className="stat-name">Tỷ lệ trả hàng</span>
          <span className="stat-val">
            {health.returnRate !== null ? `${health.returnRate}%` : '--%'}
          </span>
        </div>
        <div className="health-stat-pill">
          <span className="stat-name">Điểm vi phạm</span>
          <span className="stat-val green">{health.penaltyPoints} điểm</span>
        </div>
      </div>
    </div>
  );
}
