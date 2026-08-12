import React, { useState, useEffect } from 'react';
import { Radio, Eye, MousePointer, ShoppingBag, DollarSign, ArrowUpRight, Video as VideoIcon, Plus } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function VideoLivestream({ existingProducts = [], onNavigate }) {
  const [videoStats, setVideoStats] = useState(null);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    sellerService.getVideoPerformance(existingProducts).then(data => setVideoStats(data));
    sellerService.getLivestreamPerformance().then(data => setLiveStats(data));
  }, [existingProducts]);

  if (!videoStats || !liveStats) return null;

  const hasVideoData = videoStats.bestVideo !== null && videoStats.orders > 0;
  const hasLiveData = parseInt(liveStats.viewers || '0', 10) > 0 || liveStats.orders > 0;

  return (
    <div className="video-livestream-container">
      {/* 🎬 VIDEO PERFORMANCE CARD */}
      <div className="dashboard-card video-card">
        <div className="card-header-flex">
          <h3 className="card-title-heading">
            Hiệu quả bán hàng từ Video
          </h3>
          <button className="link-see-all-btn" onClick={() => onNavigate && onNavigate('video')}>
            Quản lý Video <ArrowUpRight size={14} />
          </button>
        </div>

        {hasVideoData ? (
          <>
            <div className="video-metrics-row">
              <div className="v-metric-item">
                <span className="v-metric-label"><Eye size={12} /> Lượt xem</span>
                <span className="v-metric-val">{videoStats.views}</span>
              </div>
              <div className="v-metric-item">
                <span className="v-metric-label"><MousePointer size={12} /> Lượt click SP</span>
                <span className="v-metric-val">{videoStats.productClicks}</span>
              </div>
              <div className="v-metric-item">
                <span className="v-metric-label"><ShoppingBag size={12} /> Đơn hàng</span>
                <span className="v-metric-val">{videoStats.orders}</span>
              </div>
              <div className="v-metric-item">
                <span className="v-metric-label"><DollarSign size={12} /> Doanh thu</span>
                <span className="v-metric-val primary-text">{videoStats.revenue}</span>
              </div>
            </div>

            {videoStats.bestVideo && (
              <div className="best-video-spotlight">
                <div className="video-thumb-container">
                  <img src={videoStats.bestVideo.thumbnail} alt={videoStats.bestVideo.title} className="spotlight-thumb-img" />
                  <span className="duration-badge">{videoStats.bestVideo.duration}</span>
                </div>

                <div className="spotlight-info">
                  <h4 className="spotlight-title">{videoStats.bestVideo.title}</h4>
                  <p className="spotlight-product-ref">
                    🏷️ Linked Product (ID: {videoStats.bestVideo.productId}): <strong>{videoStats.bestVideo.productName}</strong>
                  </p>
                  
                  <div className="spotlight-stats-pills">
                    <span>👁️ {videoStats.bestVideo.views} lượt xem</span>
                    <span>🛍️ {videoStats.bestVideo.orders} đơn hàng</span>
                    <span className="revenue-glow">💰 {videoStats.bestVideo.revenue} doanh thu</span>
                  </div>
                </div>

                <button 
                  className="spotlight-action-btn"
                  onClick={() => onNavigate && onNavigate('video')}
                >
                  Xem chi tiết <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Video Empty State */
          <div className="widget-empty-state-box">
            <div className="empty-widget-icon-circle">
              <VideoIcon size={24} className="empty-icon" />
            </div>
            <h4 className="empty-widget-title">Bạn chưa đăng Video nào</h4>
            <p className="empty-widget-desc">
              Tạo Video ngắn giới thiệu sản phẩm để tiếp cận hàng ngàn người mua và bứt phá doanh số.
            </p>
            <button className="nav-btn-primary empty-widget-btn" onClick={() => onNavigate && onNavigate('video')}>
              <Plus size={15} /> Đăng Video đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* 📡 LIVESTREAM PERFORMANCE CARD */}
      <div className="dashboard-card livestream-card">
        <div className="card-header-flex">
          <h3 className="card-title-heading">
            <Radio size={16} className="pulse-live-icon" /> Livestream hôm nay
          </h3>
          <button className="link-see-all-btn" onClick={() => onNavigate && onNavigate('livestream')}>
            Xem chi tiết <ArrowUpRight size={14} />
          </button>
        </div>

        {hasLiveData ? (
          <div className="live-metrics-grid">
            <div className="live-metric-box">
              <span className="live-box-label">Người xem</span>
              <span className="live-box-val">{liveStats.viewers}</span>
            </div>
            <div className="live-metric-box">
              <span className="live-box-label">Đơn hàng</span>
              <span className="live-box-val">{liveStats.orders}</span>
            </div>
            <div className="live-metric-box">
              <span className="live-box-label">Doanh thu</span>
              <span className="live-box-val primary-text">{liveStats.revenue}</span>
            </div>
          </div>
        ) : (
          /* Livestream Empty State */
          <div className="widget-empty-state-box">
            <div className="empty-widget-icon-circle">
              <Radio size={24} className="empty-icon" />
            </div>
            <h4 className="empty-widget-title">Bạn chưa có Livestream nào</h4>
            <p className="empty-widget-desc">
              Phát trực tiếp để tương tác thực tế với khách hàng và chốt đơn nhanh chóng.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="live-actions-row">
          <button 
            className="nav-btn-primary live-create-btn"
            onClick={() => onNavigate && onNavigate('livestream')}
          >
            <Radio size={16} /> + Tạo livestream
          </button>
          <button 
            className="nav-btn-secondary"
            onClick={() => onNavigate && onNavigate('livestream')}
          >
            Xem hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
}
