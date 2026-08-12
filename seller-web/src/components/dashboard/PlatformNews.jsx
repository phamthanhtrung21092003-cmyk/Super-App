import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function PlatformNews({ onNavigate }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    sellerService.getPlatformAnnouncements().then(data => setAnnouncements(data));
  }, []);

  const handleNewsClick = () => {
    if (onNavigate) onNavigate('settings');
  };

  return (
    <div className="dashboard-card platform-news-card">
      <div className="card-header-flex">
        <h3 className="card-title-heading">
          <Megaphone size={16} className="text-primary-icon" /> Thông báo từ V-life
        </h3>
      </div>

      <div className="news-list-container">
        {announcements.map(news => {
          let badgeClass = 'news-tag-blue';
          if (news.tagColor === 'red') badgeClass = 'news-tag-red';
          if (news.tagColor === 'orange') badgeClass = 'news-tag-orange';

          return (
            <div 
              key={news.id} 
              className="news-list-item"
              onClick={handleNewsClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNewsClick()}
              aria-label={`Thông báo: ${news.title}`}
            >
              <div className="news-content-left">
                <span className={`news-tag-badge ${badgeClass}`}>{news.tag}</span>
                <p className="news-item-title">{news.title}</p>
              </div>

              <div className="news-content-right">
                <span className="news-date-text">{news.date}</span>
                <ChevronRight size={14} className="news-arrow" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
